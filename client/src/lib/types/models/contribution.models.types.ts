import { ContributionStatus } from "../enum.types";
import { PaymentResponseModel } from "./payment.models.types"
export interface ContributionCreateModel{
    year: number;
    contributionStatus: ContributionStatus;
}

export interface ContributionResponseModel extends ContributionCreateModel{
    id: string;
    amount: number;
    dueDate: string;
    totalPaid: number;
    remaining:number;
    memberId: string;
    memberName: string;
    childId: string;
    childName: string;
    isFullyPaid: boolean;
    paymentsCount: number;
    payments: PaymentResponseModel[];
}

export interface ContributionUpdateModel{
    amount?: number;
    contributionStatus: ContributionStatus;
    memberId?: string;
}

export interface ContributionYearModel{
    year: number;
}