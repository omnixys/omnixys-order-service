import { Injectable } from '@nestjs/common';
import { ShoppingCartClient } from './shopping-cart.client.js';
import { UUID } from 'crypto';

@Injectable()
export class ShoppingCartService {
    readonly #shoppingCartClient: ShoppingCartClient
    
    constructor(shoppingCartClient: ShoppingCartClient) {
        this.#shoppingCartClient = shoppingCartClient
     }

    async removeItems(itemIds: UUID[], bearerToken: string): Promise<boolean> {
        return this.#shoppingCartClient.removeItemsFromCart(itemIds, bearerToken);
    }
}
