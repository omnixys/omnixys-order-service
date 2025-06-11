import { Module } from '@nestjs/common';
import { ShoppingCartModule } from './shopping-cart/Shopping-cart.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { InvoiceModule } from './invoice/invoice.module.js';

@Module({
  imports: [ShoppingCartModule, InvoiceModule, PaymentModule],
  exports: [ShoppingCartModule, InvoiceModule, PaymentModule],
})
export class ClientModule {}
