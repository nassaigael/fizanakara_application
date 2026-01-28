import type {ContributionStatus} from "./common.type";
import { PaymentResponseDto } from "./payment.type";

interface IBaseContribution {
    year: number;
    status: ContributionStatus;
}

export interface ContributionCreateDto extends Partial<IBaseContribution> {
    year: number;
}

export interface ContributionYearDto extends Pick<IBaseContribution, 'year'> {}

export interface ContributionUpdateDto {
    amount?: number;
    status?: ContributionStatus;
    memberId: string;
}

export interface ContributionResponseDto {
    id: string;
    year: number;
    status: ContributionStatus;
    amount: number;
    dueDate: string;
    totalPaid: number;
    remaining: number;
    memberId: string;
    memberName: string;
    childId?: string;
    payments: PaymentResponseDto[];
}