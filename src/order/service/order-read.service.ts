import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderQueryBuilder } from './query-builder.js';
import { Slice } from '../utils/slice.js';
import { Order } from '../model/entities/order.entity.js';
import { FindByIdParams } from '../model/interface/queryParams.interface.js';
import { handleSpanError } from '../utils/error.util.js';
import { trace, Tracer, context as otelContext } from '@opentelemetry/api';
import { LoggerService } from '../../logger/logger.service.js';
import { LoggerPlus } from '../../logger/logger-plus.js';
import { UUID } from 'node:crypto';
import { Pageable } from '../utils/pageable.js';
import { SearchCriteria } from '../model/types/searchCriteria.type.js';


@Injectable()
export class OrderReadService {
    static readonly ID_PATTERN =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/u;

    readonly #orderQueryBuilder: OrderQueryBuilder;
    readonly #loggerService: LoggerService;
    readonly #logger: LoggerPlus
    readonly #tracer: Tracer

    constructor(
        orderQueryBuilder: OrderQueryBuilder,
        loggerService: LoggerService,
    ) {
        this.#orderQueryBuilder = orderQueryBuilder;
        this.#loggerService = loggerService;
        this.#logger = this.#loggerService.getLogger(OrderReadService.name);
        this.#tracer = trace.getTracer('order-read-service');
    }

    async findById({ id }: FindByIdParams) {
        return await this.#tracer.startActiveSpan('order.findById', async (span) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
                    this.#logger.debug('findById: id=%d', id);

                    if (!id) {
                        throw new NotFoundException(`Keine ID gegeben!!`);
                    }

                    const order = await this.#orderQueryBuilder
                        .buildId({ id, withOrderedItem: true })
                        .getOne();
                    if (!order) {
                        this.#logger.debug('findById: order=%o', order);
                        throw new NotFoundException(`Keine Bestellung gefunden mit ID ${id}.`);
                    }

                    this.#logger.debug('findById: order=%o', order);
                    this.#logger.debug('findById: order=%o', order.items);

                    return order;
                });
            } catch (error) {
                handleSpanError(span, error, this.#logger, 'findById');
            } finally {
                span.end();
            }
        });
    }

    async findByCustomerId({
        customerId,
        pageable,
        searchCriteria,
    }: {
        customerId: UUID;
        pageable: Pageable;
        searchCriteria: SearchCriteria;
    }) {
        return await this.#tracer.startActiveSpan('order-service.read.findByCustomerId', async (span) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
                    this.#logger.debug('findByCustomerId: customerId=%s', customerId);

                    if (!customerId) {
                        throw new NotFoundException('Keine Kunden-ID gegeben!');
                    }

                    const criteria = { ...searchCriteria, customerId };
                    const result = await this.find({ searchCriteria: criteria, pageable });

                    this.#logger.debug('findByCustomerId: orders=%o', result.content);
                    return result;
                });
            } catch (error) {
                handleSpanError(span, error, this.#logger, 'findByCustomerId');
            } finally {
                span.end();
            }
        });
    }


    /**
     * Bücher asynchron suchen.
     * @param searchCriteria JSON-Objekt mit SearchCriteria.
     * @param pageable Maximale Anzahl an Datensätzen und Seitennummer.
     * @returns Ein JSON-Array mit den gefundenen Büchern.
     * @throws NotFoundException falls keine Bücher gefunden wurden.
     */
    async find(
        { searchCriteria, pageable }: { searchCriteria: SearchCriteria, pageable: Pageable }
    ): Promise<Slice<Order>> {
        return await this.#tracer.startActiveSpan('order-service.read.find', async (outerSpan) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), outerSpan), async () => {
                    const withItems = false;
                    this.#logger.debug(
                        'find: searchCriteria=%s, withItems=%s',
                        searchCriteria,
                        withItems,
                    );

                    // Keine SearchCriteria?
                    if (searchCriteria === undefined) {
                        return await this.#findAll(pageable);
                    }
                    const keys = Object.keys(searchCriteria);
                    if (keys.length === 0) {
                        return await this.#findAll(pageable);
                    }

                    const queryBuilder = this.#orderQueryBuilder.build(
                        false,
                        searchCriteria,
                        pageable,
                    );

                    const orders = await queryBuilder.getMany();
                    if (orders.length === 0) {
                        this.#logger.debug('find: Keine Bestellungen gefunden');
                        throw new NotFoundException(
                            `Keine Bestellungen gefunden: ${JSON.stringify(searchCriteria)}, Seite ${pageable.number}}`,
                        );
                    }

                    this.#logger.debug('find: carts=%o', orders);
                    const totalElements = await queryBuilder.getCount();
                    return this.#createSlice(orders, totalElements);

                });
            } catch (error) {
                handleSpanError(outerSpan, error, this.#logger, 'create');
            } finally {
                outerSpan.end();
            }
        });
    }

    async #findAll(pageable: Pageable) {
        const queryBuilder = this.#orderQueryBuilder.build(false, {}, pageable);
        const shoppingCarts = await queryBuilder.getMany();
        if (shoppingCarts.length === 0) {
            throw new NotFoundException(
                `Ungueltige Seite "${pageable.number}"`,
            );
        }
        const totalElements = await queryBuilder.getCount();
        return this.#createSlice(shoppingCarts, totalElements);
    }

    #createSlice(orders: Order[], totalElements: number): Slice<Order> {
        return { content: orders, totalElements };
    }

}
