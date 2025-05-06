import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { request, gql } from 'graphql-request';

@Injectable()
export class ShoppingCartClient {
  readonly #logger = new Logger(ShoppingCartClient.name);
  readonly #graphqlEndpoint = 'https://localhost:7101/graphql';


  async removeItemsFromCart(ids: UUID[], bearerToken: string): Promise<boolean> {
    const mutation = gql`
      mutation Order($ids: [ID!]!) {
        order(inventoryIds: $ids)
      }
    `;

    try {
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
      };

      const data: any = await request(this.#graphqlEndpoint, mutation, { ids }, headers);
      return data.order;
    } catch (error) {
      this.#logger.error('removeItemsFromCart failed', error);
      throw error;
    }
  }

}
