import { z } from 'zod';
import { Gender, MemberStatus } from '../types/index';

export const personSchema = z.object({
    firstName: z.string().min(2, 'First name is required (min 2 characters)'),
    lastName: z.string().min(2, 'Last name is required (min 2 characters)'),
    birthDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid date (format YYYY-MM-DD)'),
    gender: z.nativeEnum(Gender),
    phoneNumber: z
        .string()
        .min(8, 'Phone number must be at least 8 digits')
        .regex(/^[0-9+\-\s]+$/, 'Invalid phone number format'),
    districtId: z.number().positive('District is required'),
    tributeId: z.number().positive('Tribute is required'),
    status: z.nativeEnum(MemberStatus),
    imageUrl: z.string().max(500).optional().nullable(),
    parentId: z.string().optional().nullable(),
});

export const addChildSchema = z.object({
    parentId: z.string().min(1, 'Parent is required'),
    childData: personSchema,
});

export type PersonFormData = z.infer<typeof personSchema>;