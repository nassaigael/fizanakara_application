import { z } from 'zod';
import { Gender } from '../types/index';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    gender: z.nativeEnum(Gender),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    imageUrl: z.string().min(1, 'Image URL is required'),
});

export const updateAdminSchema = registerSchema.partial().omit({ email: true });

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, 'Token is required'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });