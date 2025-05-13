import { UUID } from "crypto";

export class CreatePaymentDTO {
    accountId: UUID
    amount: number
    currency: string
    method: string
    invoiceId: UUID
}