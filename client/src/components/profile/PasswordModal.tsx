import React, { useState } from 'react';
import { z } from 'zod';
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
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    const validate = (): boolean => {
        const result = passwordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            const newErrors: { password?: string; confirmPassword?: string } = {};
            result.error.issues.forEach((err) => {
                if (err.path[0] === 'password') newErrors.password = err.message;
                if (err.path[0] === 'confirmPassword') newErrors.confirmPassword = err.message;
            });
            setErrors(newErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setIsLoading(true);
        try {
            await onSave(password);
            toast.success('Password changed successfully');
            resetForm();
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md border-2 border-black shadow-lg overflow-hidden">
                <div className="bg-linear-to-r from-brand-primary to-orange-500 p-6 text-white">
                    <h2 className="text-xl font-black uppercase">Change Password</h2>
                    <p className="text-white/80 text-sm mt-1">Enter your new password</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <Input
                        name="password"
                        label="New password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        placeholder="••••••••"
                        required
                    />
                    <Input
                        name="confirmPassword"
                        label="Confirm password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                        placeholder="••••••••"
                        required
                    />
                    
                    <div className="flex gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => {
                                resetForm();
                                onClose();
                            }} 
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={isLoading} 
                            className="flex-1"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;