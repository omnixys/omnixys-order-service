import { Module } from "@nestjs/common";
import { InvoiceClient } from "./invoice.client.js";
import { InvoiceService } from "./invoice.service.js";

@Module({
    providers: [InvoiceClient, InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule { }
