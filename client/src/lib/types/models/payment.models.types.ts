import { PaymentStatus } from "../enum.types";

export interface PaymentModel{
    amountPayed: number;
    paymentDate: string;
    paymentStatus: PaymentStatus;
    contributionId: string;
}

export interface PaymentResponseModel extends PaymentModel{
    id: string;
}