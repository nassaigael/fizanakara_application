//person.models.types.ts

import { Gender, MemberStatus } from "../enum.types";

export interface PersoneBaseModel {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender:Gender;
    imageUrl: string;
    phoneNumber: string;
    districtId: number;
    tributeId: number;
}

export interface PersonModel extends PersoneBaseModel {
    status:MemberStatus;
    parentId?: string;
}

export interface PersonResponseModel extends PersonModel{
    sequenceNumber: number;
    isActiveMember: boolean;
    districtName: string;
    tributeName: string;
    parentName?: string;
    childrenCount: number;
    children: PersonResponseModel[];
}