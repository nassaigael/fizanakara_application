import { AdminResponseModel } from "./models/admin.models.types";
import { UserRole } from "./enum.types";

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

export interface GenericResponse {
    message: string;
    success: boolean;
}

export interface UpdateMeResponse extends GenericResponse {
    user: AdminResponseModel;
}