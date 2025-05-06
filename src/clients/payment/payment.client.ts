import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { request, gql } from 'graphql-request';
import { CreatePaymentDTO } from './model/dto/payment.dto';


@Injectable()
export class PaymentClient {
  readonly #logger = new Logger(PaymentClient.name);
  readonly #graphqlEndpoint = 'http://localhost:7201/graphql';

  async createPayment(input: CreatePaymentDTO, bearerToken: string, ): Promise<UUID> {
    const mutation = gql`
    mutation CreatePayment($input: CreatePaymentInput!) {
      createPayment(
        input: $input
        )
    }
    `;

    try {
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
      };

      const data: any = await request(this.#graphqlEndpoint, mutation, { input }, headers);
      return data.createPayment;
    } catch (error) {
      this.#logger.error('createPayment failed', error);
      throw error;
    }
  }

}
