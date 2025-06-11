import { Injectable } from '@nestjs/common';
import { PaymentClient } from './payment.client.js';
import { UUID } from 'crypto';
import { CreatePaymentDTO } from './model/dto/payment.dto.js';

@Injectable()
export class PaymentService {
  readonly #paymentClient: PaymentClient;

  constructor(paymentClient: PaymentClient) {
    this.#paymentClient = paymentClient;
  }

  async pay(
    input: CreatePaymentDTO,
    receiver: UUID,
    bearerToken: string,
  ): Promise<UUID> {
    return this.#paymentClient.createPayment(input, receiver, bearerToken);
  }
}
