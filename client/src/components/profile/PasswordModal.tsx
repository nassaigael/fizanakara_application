import React from 'react';
import { z } from 'zod';
import { useForm } from '../../hooks/useForm';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../lib/helper';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPassword: string) => Promise<void>;
}

const passwordSchema = z.object({
    password: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSave }) => {
    const form = useForm<{ password: string; confirmPassword: string }>({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema: passwordSchema,
        onSubmit: async (data) => {
            try {
                await onSave(data.password);
                toast.success('Password changed successfully');
                form.resetForm();
                onClose();
            } catch (error) {
                toast.error(getApiErrorMessage(error));
            }
        }
    });

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md border-2 border-black shadow-lg p-8">
                <h2 className="text-xl font-black mb-4">Change Password</h2>
                <form onSubmit={form.handleSubmit} className="space-y-4">
                    <Input
                        name="password"
                        label="New password"
                        type="password"
                        value={form.values.password}
                        onChange={form.handleChange}
                        error={form.errors.password}
                        required
                    />
                    <Input
                        name="confirmPassword"
                        label="Confirm password"
                        type="password"
                        value={form.values.confirmPassword}
                        onChange={form.handleChange}
                        error={form.errors.confirmPassword}
                        required
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit" isLoading={form.isSubmitting}>Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
