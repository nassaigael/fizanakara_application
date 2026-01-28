export type Gender = "MALE" | "FEMALE";
export type MemberStatus = "WORKER" | "STUDENT";
export type PaymentStatus = "COMPLETED" | "PENDING";
export type Role = "SUPERADMIN" | "ADMIN";
export type ContributionStatus = "PENDING" | "PARTIAL" |"PAID" |"OVERDUE";
export interface DistrictDto {
    id?: number; // Optionnel car absent du DTO d'entrée mais présent en base
    name: string;
}

export interface TributeDto {
    id?: number;
    name: string;
}