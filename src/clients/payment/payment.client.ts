import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { request, gql } from 'graphql-request';
import { CreatePaymentDTO } from './model/dto/payment.dto';

@Injectable()
export class PaymentClient {
  readonly #logger = new Logger(PaymentClient.name);
  readonly #graphqlEndpoint = 'http://localhost:7201/graphql';

  async createPayment(
    input: CreatePaymentDTO,
    receiver: UUID,
    bearerToken: string,
  ): Promise<UUID> {
    const mutation = gql`
      mutation CreatePayment($input: CreatePaymentInput!, $receiver: ID!) {
        createPayment(input: $input, receiver: $receiver)
      }
    `;

    try {
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
      };

      const data: any = await request(
        this.#graphqlEndpoint,
        mutation,
        { input, receiver },
        headers,
      );
      return data.createPayment;
    } catch (error) {
      this.#logger.error('createPayment failed', error);
      throw error;
    }
  }
}
