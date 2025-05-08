import { UUID } from "crypto";

export class CreatePaymentDTO {
    amount: number
    currency: string
    method: string
    invoiceId: UUID
    orderNumber: string
    accountId: UUID
    recipientAccount: UUID
}