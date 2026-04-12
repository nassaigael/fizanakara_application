// ============================================
// ENUMERATIONS
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
// LOCATION TYPES (District / Tribute)
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
// MEMBER TYPES (Person)
// ============================================

export interface PersonBase {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;
    imageUrl: string;
    phoneNumber: string;
}

export interface PersonDto extends PersonBase {
    status: MemberStatus;
    districtId: number;
    tributeId: number;
    parentId?: string | null;
}

export interface PersonResponse {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;
    imageUrl: string;
    phoneNumber: string;
    createdAt?: string;
    sequenceNumber: number;
    status: MemberStatus;
    isActiveMember: boolean;
    districtId: number;
    districtName: string;
    tributeId: number;
    tributeName: string;
    parentId?: string | null;
    parentName?: string | null;
    childrenCount: number;
    children: PersonResponse[];
}

// ============================================
// ADMIN TYPES
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

export interface AdminResponse {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    imageUrl: string;
    phoneNumber: string;
    email: string;
    role: UserRole;
    verified: boolean;
    createdAt: string;
}

export interface UpdateAdminRequest {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: string;
    imageUrl?: string | null;
    phoneNumber?: string;
    email?: string;
    password?: string;
    verified?: boolean;
}

// ============================================
// CONTRIBUTION TYPES
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
    payments: PaymentResponse[];
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentRequest {
    amountPaid: number;
    paymentDate?: string;
    status?: PaymentStatus;
    contributionId: string;
}

export interface PaymentResponse {
    id: string;
    amountPaid: number;
    paymentDate: string;
    status: PaymentStatus;
    contributionId: string;
    paymentTime: string;
}

// ============================================
// AUTHENTICATION TYPES
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

export interface ApiResponse {
    message: string;
    success: boolean;
}

export interface RefreshTokenResponse {
    accessToken: string;
}