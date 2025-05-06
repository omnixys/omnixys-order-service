import { Injectable } from '@nestjs/common';
import { InvoiceClient } from './invoice.client.js';
import { UUID } from 'crypto';
import { CreateInvoiceInput } from './model/dto/invoice.dto.js';

@Injectable()
export class InvoiceService {
    readonly #invoiceClient: InvoiceClient
    
    constructor(invoiceClient: InvoiceClient) {
        this.#invoiceClient = invoiceClient
     }

    async createInvoice(input: CreateInvoiceInput, bearerToken: string): Promise<UUID> {
        return this.#invoiceClient.createInvoice(input, bearerToken);
    }
}
