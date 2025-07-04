import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'nest-keycloak-connect';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderDTO, OrderUpdateDTO } from '../model/inputs/orderDTO.input.js';
import { OrderWriteService } from '../service/order-write.service.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getLogger } from '../../logger/logger.js';
import { type Item } from '../model/entities/item.entity.js';
import { ItemDTO } from '../model/inputs/itemDTO.input.js';
import { type Order } from '../model/entities/order.entity.js';
import { KeycloakGuard } from '../../security/keycloak/guards/keycloak.guard.js';
import { CreatePayload } from '../model/payloads/create.payload.js';
import { UpdatePayload } from '../model/payloads/update.payload.js';
import { HttpExceptionFilter } from '../utils/http-exception.filter.js';
import { KeycloakService } from '../../security/keycloak/keycloak.service.js';
import { UUID } from 'crypto';

@Resolver()
@UseGuards(KeycloakGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class OrderMutationResolver {
  readonly #orederWriteService: OrderWriteService;
  readonly #logger = getLogger(OrderMutationResolver.name);
  readonly #keycloakService: KeycloakService;

  constructor(
    orderWriteService: OrderWriteService,
    keycloakservice: KeycloakService,
  ) {
    this.#orederWriteService = orderWriteService;
    this.#keycloakService = keycloakservice;
  }

  @Mutation('create')
  @Roles({ roles: ['Admin', 'Basic', 'Supreme', 'Elite', 'User'] })
  async makeOrder(
    @Args('input') createOrderInput: OrderDTO,
    @Args('accountId') accountId: UUID,
    @Context() context: any,
  ) {
    this.#logger.debug('makeOrder: orderDTO=%o', createOrderInput);
    const { token } = await this.#keycloakService.getToken(context);
    const order: Order = this.#orderDtoToOrder2(createOrderInput);
    this.#logger.debug('makeOrder: OrderInput=%o', order);
    const id = await this.#orederWriteService.create({
      order,
      token,
      accountId,
    });
    // TODO BadUserInputError
    this.#logger.debug('makeOrder: id=%s', id);
    const payload: CreatePayload = { id };
    return payload;
  }

  @Mutation()
  @Roles({ roles: ['Admin', 'User'] })
  async update(@Args('input') updateOrderInput: OrderUpdateDTO) {
    this.#logger.debug('update: order=%o', updateOrderInput);

    const order = this.#orderUpdateDtoToOrder(updateOrderInput);
    const versionStr = `"${updateOrderInput.version.toString()}"`;

    const versionResult = await this.#orederWriteService.update({
      id: updateOrderInput.id,
      order,
      version: versionStr,
    });
    // TODO BadUserInputError
    this.#logger.debug('updateOrder: versionResult=%d', versionResult);
    const payload: UpdatePayload = { version: versionResult };
    return payload;
  }

  // #orderDtoToOrder(orderDTO: OrderDTO, customerId: UUID): Order {
  //     const orderedItems: Item[] = orderDTO.items.map((itemDTO: ItemDTO) => {
  //         const item: Item = {
  //             id: undefined,
  //             inventoryId: itemDTO.inventoryId,
  //             price: itemDTO.price,
  //             quantity: itemDTO.quantity,
  //             order: undefined,
  //         };
  //         return item;
  //     });
  //     const order: Order = {
  //         id: undefined,
  //         version: undefined,
  //         orderNumber: undefined,
  //         status: 'PROCESSING',
  //         totalAmount: undefined,
  //         items: orderedItems,
  //         customerId: customerId,
  //         created: new Date(),
  //         updated: new Date(),
  //     };

  //     return order;
  // }

  #orderDtoToOrder2(orderDTO: OrderDTO): Order {
    const orderedItems: Item[] = orderDTO.items.map((itemDTO: ItemDTO) => {
      const item: Item = {
        id: undefined,
        inventoryId: itemDTO.inventoryId,
        price: itemDTO.price,
        quantity: itemDTO.quantity,
        order: undefined,
      };
      return item;
    });
    const order: Order = {
      id: undefined,
      version: undefined,
      orderNumber: undefined,
      status: 'PROCESSING',
      totalAmount: undefined,
      items: orderedItems,
      customerId: orderDTO.customerId,
      created: new Date(),
      updated: new Date(),
    };

    return order;
  }

  #orderUpdateDtoToOrder(orderDTO: OrderUpdateDTO): Order {
    return {
      id: undefined,
      version: undefined,
      orderNumber: undefined,
      status: orderDTO.status,
      totalAmount: undefined,
      items: undefined,
      customerId: undefined,
      created: undefined,
      updated: new Date(),
    };
  }

  // #errorMsgCreateOrder(err: CreateError) {
  //     switch (err.type) {
  //         case 'IsbnExists': {
  //             return `Die ISBN ${err.isbn} existiert bereits`;
  //         }
  //         default: {
  //             return 'Unbekannter Fehler';
  //         }
  //     }
  // }

  // #errorMsgUpdateOrder(err: UpdateError) {
  //     switch (err.type) {
  //         case 'OrderNotExists': {
  //             return `Es gibt kein Order mit der ID ${err.id}`;
  //         }
  //         case 'VersionInvalid': {
  //             return `"${err.version}" ist keine gueltige Versionsnummer`;
  //         }
  //         case 'VersionOutdated': {
  //             return `Die Versionsnummer "${err.version}" ist nicht mehr aktuell`;
  //         }
  //         default: {
  //             return 'Unbekannter Fehler';
  //         }
  //     }
  // }
}
