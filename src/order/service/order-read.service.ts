import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderQueryBuilder } from './query-builder.js';
import { Slice } from '../utils/slice.js';
import { Order } from '../model/entity/order.entity.js';
import { FindByIdParams, FindParams } from '../model/interface/queryParams.interface.js';
import { handleSpanError } from '../utils/error.util.js';
import { trace, Tracer, context as otelContext } from '@opentelemetry/api';
import { LoggerService } from '../../logger/logger.service.js';
import { LoggerPlus } from '../../logger/logger-plus.js';


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
        return await this.#tracer.startActiveSpan('shopping-cart.deleteById', async (span) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
                    this.#logger.debug('findById: id=%d', id);

                    if (!id) {
                        throw new NotFoundException(`Produkt mit ID ${id} nicht gefunden.`);
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
                handleSpanError(span, error, this.#logger, 'deleteById');
            } finally {
                span.end();
            }
        });
    }

    async find({
        searchCriteria,
        pageable
    }: FindParams
    ): Promise<Slice<Order>> {
        return await this.#tracer.startActiveSpan('shopping-cart.deleteById', async (span) => {
            try {
                return await otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
                    this.#logger.debug('find: suchkriterien=%o', searchCriteria);

                    const isEmpty = !searchCriteria || Object.keys(searchCriteria).length === 0;
                    const queryBuilder = this.#orderQueryBuilder.build(searchCriteria ?? {}, pageable);

                    const orders = await queryBuilder.getMany();

                    if (orders.length === 0) {
                        throw new NotFoundException(
                            isEmpty
                                ? `Keine Produkte gefunden auf Seite ${pageable.number}`
                                : `Keine Produkte gefunden mit Kriterien ${JSON.stringify(searchCriteria)}.`,
                        );
                    }

                    const totalElements = await queryBuilder.getCount();
                    return this.#createSlice(orders, totalElements);
                });
            } catch (error) {
                handleSpanError(span, error, this.#logger, 'deleteById');
            } finally {
                span.end();
            }
        }); 
    }

    #createSlice(orders: Order[], totalElements: number): Slice<Order> {
        return { content: orders, totalElements };
    }

}
