// ============================================
// ÉNUMÉRATIONS
// ============================================

export enum Gender {
    FEMALE = 'FEMALE',
    MALE = 'MALE',
}

export enum MemberStatus {
    WORKER = 'WORKER',
    STUDENT = 'STUDENT',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    SUPERADMIN = 'SUPERADMIN',
}

export enum ContributionStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
}

export enum PaymentStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    REFUNDED = 'REFUNDED',
}

// ============================================
// TYPES DE BASE (LOCALISATION)
// ============================================

export interface LocationBase {
    id?: number;
    name: string;
}

export interface District extends LocationBase {
    createdAt?: string;
    version?: number;
}

export interface Tribute extends LocationBase {
    createdAt?: string;
}

export interface DistrictDto {
    name: string;
}

export interface TributeDto {
    name: string;
}

// ============================================
// TYPES MEMBRES (PERSON)
// ============================================

export interface PersonBase {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;
    imageUrl?: string | null;
    phoneNumber: string;
}

export interface PersonDto extends PersonBase {
    status: MemberStatus;
    districtId: number;
    tributeId: number;
    parentId?: string | null;
}

export interface PersonResponse extends PersonDto {
    id: string;
    sequenceNumber: number;
    isActiveMember: boolean;
    districtName: string;
    tributeName: string;
    parentName?: string | null;
    childrenCount: number;
    children: PersonResponse[];
    createdAt?: string;
}

// ============================================
// TYPES ADMINISTRATEURS
// ============================================

export interface AdminBase extends PersonBase {
    email: string;
}

export interface RegisterRequest extends AdminBase {
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AdminResponse extends AdminBase {
    id: string;
    role: UserRole;
    verified: boolean;
    createdAt: string;
    districtId?: number;
    tributeId?: number;
}

export interface UpdateAdminRequest {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: Gender;
    imageUrl?: string | null;
    phoneNumber?: string;
    email?: string;
    password?: string;
    verified?: boolean;
}

// ============================================
// TYPES COTISATIONS (CONTRIBUTIONS)
// ============================================

export interface ContributionYearRequest {
    year: number;
}

export interface ContributionUpdateRequest {
    amount?: number;
    status?: ContributionStatus;
    memberId?: string;
}

export interface ContributionResponse {
    id: string;
    year: number;
    amount: number;
    status: ContributionStatus;
    dueDate: string;
    totalPaid: number;
    remaining: number;
    memberId: string;
    memberName: string;
    childId?: string | null;
    childName?: string | null;
    isFullyPaid: boolean;
    paymentsCount: number;
    payments: PaymentResponse[];
}

// ============================================
// TYPES PAIEMENTS
// ============================================

export interface PaymentRequest {
    amountPaid: number;
    paymentDate: string;
    status: PaymentStatus;
    contributionId: string;
}

export interface PaymentResponse extends PaymentRequest {
    id: string;
}

// ============================================
// TYPES AUTHENTIFICATION
// ============================================

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        gender: string;
    };
    role: UserRole;
    accessToken: string;
    refreshToken: string;
}

export interface UpdateMeResponse {
    message: string;
    success: boolean;
    user: AdminResponse;
}

export interface GenericResponse {
    message: string;
    success: boolean;
}

// Ajouter ces types manquants basés sur les contrôleurs

// Pour les réponses avec message
export interface ApiResponse {
    message: string;
    success: boolean;
}

// Pour les tokens
export interface RefreshTokenResponse {
    accessToken: string;
}

// Pour les DTOs de mise à jour (correspond à UpdateAdminDto)
export interface UpdateAdminRequest {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: Gender;
    imageUrl?: string | null;
    phoneNumber?: string;
    email?: string;
    password?: string;
    verified?: boolean;
}