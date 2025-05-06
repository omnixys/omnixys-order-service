import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'nest-keycloak-connect';
import { getLogger } from '../../logger/logger.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { SearchCriteria } from '../model/types/searchCriteria.type.js';
import { OrderReadService } from '../service/order-read.service.js';
import { UUID } from 'crypto';
import { KeycloakGuard } from '../../security/keycloak/guards/keycloak.guard.js';
import { HttpExceptionFilter } from '../utils/http-exception.filter.js';
import { createPageable, Pageable } from '../utils/pageable.js';

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
        @Context() context: any,
    ) {
        this.#logger.debug('getById: id=%d', id);

        const rawAuth = context.req?.headers?.authorization;
        const token = typeof rawAuth === 'string' && rawAuth.startsWith('Bearer ')
            ? rawAuth.slice(7)
            : null;

        const [, payloadStr] = (token as string).split('.');
        const payloadDecoded = atob(payloadStr);
        const payload = JSON.parse(payloadDecoded);
        const { exp, realm_access } = payload;
        this.#logger.debug('#logPayload: exp=%s', exp);
        const { roles } = realm_access;
        this.#logger.debug('rollen: %o ', roles)

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
