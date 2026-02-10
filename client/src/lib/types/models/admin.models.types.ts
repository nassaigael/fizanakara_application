
//admin.models.type.ts

import { Gender, UserRole } from "../enum.types";
import { PersoneBaseModel } from "./person.models.types";

export interface AdminResponseModel extends PersoneBaseModel {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;
    imageUrl: string;
    phoneNumber: string;
    districtId: number;
    tributeId: number;
    email: string;
    role: UserRole;
    verified: boolean;
    createdAt: string;
}

export interface LoginRequestModel {
    email: string;
    password: string;
}

export interface RegisterRequestModel {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;
    phoneNumber: string;
    imageUrl: string;
    email: string;
    password: string;
}

export interface AdminUpdateModel extends Partial<RegisterRequestModel> {
    verified?: boolean;
}