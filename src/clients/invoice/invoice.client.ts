import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { request, gql } from 'graphql-request';
import { CreateInvoiceInput } from './model/dto/invoice.dto';


@Injectable()
export class InvoiceClient {
  readonly #logger = new Logger(InvoiceClient.name);
  readonly #graphqlEndpoint = 'http://localhost:7202/graphql';


  async createInvoice(input: CreateInvoiceInput, bearerToken: string): Promise<UUID> {
    const mutation = gql`
      mutation CreateInvoice($input: InvoiceInput!) {
         createInvoice(
          input: $input
          )
        }

    `;

    try {
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
      };

      const data: any = await request(this.#graphqlEndpoint, mutation, { input }, headers);
      return data.createInvoice
    } catch (error) {
      this.#logger.error('createInvoice failed', error);
      throw error;
    }
  }

}
