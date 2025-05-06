import { QueryFailedError, type Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    VersionInvalidException,
    VersionOutdatedException,
} from '../errors/exceptions.js';
import { Order } from '../model/entity/order.entity.js';
import { OrderReadService } from './order-read.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateParams } from '../model/interface/queryParams.interface.js';
import { UUID } from 'crypto';
import { ShoppingCartService } from '../../clients/shopping-cart/shopping-cart.service.js';
import Decimal from 'decimal.js';
import { InvoiceService } from '../../clients/invoice/invoice.service.js';
import { PaymentService } from '../../clients/payment/payment.service.js';
import { handleSpanError } from '../utils/error.util.js';
import { KafkaConsumerService } from '../../kafka/kafka-consumer.service.js';
import { KafkaProducerService } from '../../kafka/kafka-producer.service.js';
import { LoggerPlus } from '../../logger/logger-plus.js';
import { LoggerService } from '../../logger/logger.service.js';
import { TraceContextProvider } from '../../trace/trace-context.provider.js';
import { trace, Tracer, context as otelContext } from '@opentelemetry/api';
import { getKafkaTopicsBy } from '../../kafka/kafka-topic.properties.js';

@Injectable()
export class OrderWriteService {
    private static readonly VERSION_PATTERN = /^"\d{1,3}"/u;

    readonly #orderRepository: Repository<Order>;

    readonly #readService: OrderReadService;
    readonly #shoppingCartService: ShoppingCartService
    readonly #invoiceService: InvoiceService
    readonly #paymentService: PaymentService

    readonly #kafkaConsumerService: KafkaConsumerService;
    readonly #kafkaProducerService: KafkaProducerService;
    readonly #loggerService: LoggerService;
    readonly #logger: LoggerPlus
    readonly #traceContextProvider: TraceContextProvider;
    readonly #tracer: Tracer

    constructor(
        @InjectRepository(Order) orderRepository: Repository<Order>,
        readService: OrderReadService,
        shoppingCartService: ShoppingCartService,
        invoiceService: InvoiceService,
        paymentService: PaymentService,
        kafkaConsumerService: KafkaConsumerService,
        loggerService: LoggerService,
        kafkaProducerService: KafkaProducerService,
        traceContextProvider: TraceContextProvider,
    ) {
        this.#orderRepository = orderRepository;
        this.#readService = readService;
        this.#shoppingCartService = shoppingCartService
        this.#invoiceService = invoiceService
        this.#paymentService = paymentService
        this.#kafkaConsumerService = kafkaConsumerService;
        this.#loggerService = loggerService;
        this.#logger = this.#loggerService.getLogger(OrderWriteService.name);
        this.#kafkaProducerService = kafkaProducerService;
        this.#traceContextProvider = traceContextProvider;
        this.#tracer = trace.getTracer('order-cart-write-service');
    }

    async onModuleInit(): Promise<void> {
        await this.#kafkaConsumerService.consume(
            { topics: getKafkaTopicsBy(['Order']), },
        );

    }

    async create({ order, token: bearerToken, accountId }: { order: Order, token: string, accountId: UUID }) {
        return await this.#tracer.startActiveSpan('order-cart.create', async (span) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
                    this.#logger.debug('create: order=%o', order);

                    const inventoryIds: UUID[] = order.items.map(item => item.inventoryId)
                    this.#logger.debug('create: inventoryIds=%o', inventoryIds)

                    // 🟣 Fire-and-forget Call für removeItems
                    void this.#shoppingCartService
                        .removeItems(inventoryIds, bearerToken)
                        .then(result =>
                            this.#logger.debug('create: removeItems async finished, result=%o', result)
                        )
                        .catch(error =>
                            this.#logger.warn('create: removeItems async failed', error)
                        );
        
                    // 🧮 Betrag berechnen
                    const totalAmount = order.items?.reduce((sum, item) => {
                        const price = new Decimal(item.price);
                        return sum.add(price.mul(item.quantity));
                    }, new Decimal(0)) ?? new Decimal(0);
                    this.#logger.debug('create: totalAmount=%s', totalAmount.toString());

                    // 🧾 Rechnung anlegen (externer Service)
                    const invoiceId = await this.#invoiceService.createInvoice(
                        {
                            amount: Number(totalAmount),
                            dueDate: new Date().toISOString().slice(0, 19),
                            username: order.username
                        },
                        bearerToken,
                    );
                    this.#logger.debug('create: new InvoiceId=%s', invoiceId);

                    const MAX_RETRIES = 5;
                    let retries = 0;

                    while (retries < MAX_RETRIES) {
                        order.totalAmount = totalAmount;
                        order.orderNumber = await this.#generateOrderNumber(order.username);
                        this.#logger.info(
                            `create: Versuch #${retries + 1} – generierte Ordernummer='${order.orderNumber}' für User='${order.username}'`,
                        );

                        // 💳 Zahlung durchführen (externer Service)
                        const paymentId = await this.#paymentService.pay(
                            {
                                amount: Number(totalAmount),
                                currency: "EUR",
                                method: "APPLE_PAY",
                                invoiceId,
                                orderNumber: order.orderNumber,
                                accountId
                            },
                            bearerToken
                        )
                        this.#logger.debug('create: paymentId=%s', paymentId);

                        try {
                            const orderDb = await this.#orderRepository.save(order);
                            this.#logger.debug('create: orderDb=%o', orderDb);

                            const trace = this.#traceContextProvider.getContext();

                            await this.#tracer.startActiveSpan('kafka.send-messages', async (span) => {
                                try {
                                    await this.#kafkaProducerService.sendMailNotification(
                                        'create',
                                        { customerId: order.username },
                                        'order-service',
                                        trace,
                                    );
                                } catch (error) {
                                    handleSpanError(span, error, this.#logger, 'kafka');
                                } finally {
                                    span.end();
                                }
                            });
                            return orderDb.id;
                        } catch (error) {
                            if (error instanceof QueryFailedError && (error as any).code === '23505') {
                                this.#logger.warn(
                                    `create: Duplikat-OrderNumber '${order.orderNumber}' – neuer Versuch für User='${order.username}'`,
                                );

                                retries++;
                            } else {
                                this.#logger.error('create: anderer Fehler beim Speichern', error);
                                throw error;
                            }
                        }
                    }

                    throw new Error('Erstellung fehlgeschlagen: maximale Anzahl an OrderNumber-Kollisionen erreicht.');
                });
            } catch (error) {
                handleSpanError(span, error, this.#logger, 'create');
            } finally {
                span.end();
            }
        });
    }

    async update({ id, order, version }: UpdateParams): Promise<number> {
        return await this.#tracer.startActiveSpan('order-cart.deleteById', async (span) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
                    this.#logger.debug(
                        'update: id=%d, order=%o, version=%s',
                        id,
                        order,
                        version,
                    );
                    if (id === undefined) {
                        this.#logger.debug('update: Keine gueltige ID');
                        throw new NotFoundException(`Es gibt kein Order mit der ID ${id}.`);
                    }

                    const validateResult = await this.#validateUpdate(order, id, version);
                    this.#logger.debug('update: validateResult=%o', validateResult);
                    if (!(validateResult instanceof Order)) {
                        return validateResult;
                    }

                    const orderNeu = validateResult;
                    const merged = this.#orderRepository.merge(orderNeu, order);
                    this.#logger.debug('update: merged=%o', merged);
                    const updated = await this.#orderRepository.save(merged); // implizite Transaktion
                    this.#logger.debug('update: updated=%o', updated);

                    return updated.version!;
                });
            } catch (error) {
                handleSpanError(span, error, this.#logger, 'create');
            } finally {
                span.end();
            }
        });
    }

    /**
 * Wählt zufällig eine von zwei Varianten zur Ordernummer-Generierung:
 * - Variante 1: GCS-YYYYMMDD-ABC123
 * - Variante 2: GCS-<gemischter Username>-YYYYMMDD
 */
    async #generateOrderNumber(username: string): Promise<string> {
        const useVariant2 = Math.random() < 0.5;
        this.#logger.debug(`generateOrderNumber: Variante ${useVariant2 ? 2 : 1}`);

        if (useVariant2) {
            const now = new Date();
            const date = now.toISOString().slice(0, 10).replace(/-/g, '');
            const mixed = await this.#mixUsername(username);
            return `GCS-${mixed}-${date}`;
        }

        // fallback: klassisch
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).toUpperCase().slice(2, 8);
        return `GCS-${date}-${random}`;
    }


    async #shuffleArray<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async #mixUsername(username: string) {
        const extras = '@#$%!0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const mixed = (username + extras.slice(0, 10))
            .split('')
            .concat(
                Array.from({ length: 4 }, () =>
                    extras.charAt(Math.floor(Math.random() * extras.length)),
                ),
            );
        return (await this.#shuffleArray(mixed)).slice(0, 16).join('');
    }

    async #validateUpdate(
        order: Order,
        id: UUID,
        versionStr: string,
    ): Promise<Order> {
        this.#logger.debug(
            '#validateUpdate: order=%o, id=%s, versionStr=%s',
            order,
            id,
            versionStr,
        );
        if (!OrderWriteService.VERSION_PATTERN.test(versionStr)) {
            throw new VersionInvalidException(versionStr);
        }

        const version = Number.parseInt(versionStr.slice(1, -1), 10);
        this.#logger.debug(
            '#validateUpdate: order=%o, version=%d',
            order,
            version,
        );

        const orderDb = await this.#readService.findById({ id });

        // nullish coalescing
        const versionDb = orderDb.version!;
        if (version < versionDb) {
            this.#logger.debug('#validateUpdate: versionDb=%d', version);
            throw new VersionOutdatedException(version);
        }
        this.#logger.debug('#validateUpdate: orderDb=%o', orderDb);
        return orderDb;
    }
}
