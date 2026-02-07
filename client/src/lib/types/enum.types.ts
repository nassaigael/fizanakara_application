export enum Gender{
    FEMELLE = 'FEMALE',
    HOMME = 'MALE',
}

export enum ContributionStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID='PAID',
  OVERDUE='OVERDUE',
}

export enum MemberStatus{
    TRAVAILLEUR = 'WORKER',
    ETUDIANT = 'STUDENT',
}

export enum UserRole{
    ADMIN = 'ADMIN',
    SUPERADMIN = 'SUPERADMIN',
}

export enum PaymentStatus{
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    REFUNDED = 'REFUNDED',
}
