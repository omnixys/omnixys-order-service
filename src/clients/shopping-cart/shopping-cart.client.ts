import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { request, gql } from 'graphql-request';

@Injectable()
export class ShoppingCartClient {
  readonly #logger = new Logger(ShoppingCartClient.name);
  readonly #graphqlEndpoint = 'http://localhost:7101/graphql';


  async removeItemsFromCart(ids: UUID[], customerId: UUID, bearerToken: string): Promise<boolean> {
    const mutation = gql`
      mutation Order($ids: [ID!]!, $customerId: ID!) {
        order(inventoryIds: $ids, customerId: $customerId)
      }
    `;

    try {
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
      };

      const data: any = await request(this.#graphqlEndpoint, mutation, { ids, customerId }, headers);
      return data.order;
    } catch (error) {
      this.#logger.error('removeItemsFromCart failed', error);
      throw error;
    }
  }

}
