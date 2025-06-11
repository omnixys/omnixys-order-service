import { Module } from '@nestjs/common';
import { PaymentClient } from './payment.client.js';
import { PaymentService } from './payment.service.js';

@Module({
  providers: [PaymentClient, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
