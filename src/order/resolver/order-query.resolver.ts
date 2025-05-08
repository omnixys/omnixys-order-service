import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'nest-keycloak-connect';
import { getLogger } from '../../logger/logger.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { SearchCriteria } from '../model/types/searchCriteria.type.js';
import { OrderReadService } from '../service/order-read.service.js';
import { UUID } from 'crypto';
import { KeycloakGuard } from '../../security/keycloak/guards/keycloak.guard.js';
import { HttpExceptionFilter } from '../utils/http-exception.filter.js';
import { createPageable, Pageable } from '../utils/pageable.js';
import { SearchCriteriaInput } from '../model/inputs/search-criteria.input.js';
import { PageInput } from '../model/inputs/pageable.input.js';

export type IdInput = {
    readonly id: string;
};

@Resolver('Order')
@UseGuards(KeycloakGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class OrderQueryResolver {
    readonly #orderReadService: OrderReadService;
    readonly #logger = getLogger(OrderQueryResolver.name);

    constructor(service: OrderReadService) {
        this.#orderReadService = service;
    }

    @Query('order')
    @Roles({ roles: ['Admin'] })
    async getById(
        @Args('id') id: UUID,
    ) {
        this.#logger.debug('getById: id=%d', id);

        const order = await this.#orderReadService.findById({ id });

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'getById: order=%s',
                order.toString(),
            );
        }

        this.#logger.debug('findById: order=%o', order.items);
        return order;
    }


    @Query('orders')
    @Roles({ roles: ['Admin'] })
    async findOrders(
        @Args('input', { nullable: true }) input?: SearchCriteriaInput,
        @Args('page', { nullable: true }) page?: PageInput,
    ) {
        this.#logger.debug('orders: input=%o, page=%o', input, page);
        const pageable = createPageable(page ?? {});
        const result = await this.#orderReadService.find({
            searchCriteria: input ?? {},
            pageable,
        });
        return result.content;
    }

    @Query('customerOrders')
    @Roles({ roles: ['Admin'] })
    async getByCustomerID(
        @Args('customerId') customerId: UUID,
        @Args('searchcriteria', { nullable: true }) searchcriteria?: SearchCriteriaInput,
        @Args('page', { nullable: true }) pageable?: PageInput,
    ) {
        this.#logger.debug('getByCustomerID: customerId=%s', customerId);
        const page = createPageable(pageable ?? {});
        const orders = await this.#orderReadService.findByCustomerId({
            customerId,
            pageable: page,
            searchCriteria: searchcriteria ?? {},
        });
        return orders.content;
    }



    @Query('orders')
    @Roles({ roles: ['Admin'] })
    async find(
        @Args('searchCriteria') criteria?: SearchCriteria,
        @Args('pageable') pageable?: Pageable,
    ) {
        this.#logger.debug('find: criteria=%o', criteria);

        const page = createPageable({});
        const ordersSlice = await this.#orderReadService.find({
            searchCriteria: criteria ?? {},
            pageable: pageable ?? page,
        });
        this.#logger.debug('find: ordersSlice=%o', ordersSlice);
        return ordersSlice.content;
    }
}
