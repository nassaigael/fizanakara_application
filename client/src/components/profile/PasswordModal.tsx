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
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setShowConfirmModal(true);
        }
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onSave(password);
            toast.success('Password changed successfully');
            resetForm();
            setShowConfirmModal(false);
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
    };

    const handleClose = () => {
        resetForm();
        setShowConfirmModal(false);
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl w-full max-w-md border-2 border-black shadow-lg overflow-hidden">
                    <div className="bg-linear-to-r from-brand-primary to-orange-500 p-6 text-white">
                        <h2 className="text-xl font-black uppercase">Change Password</h2>
                        <p className="text-white/80 text-sm mt-1">Enter your new password</p>
                    </div>
                    
                    <form onSubmit={handleNext} className="p-6 space-y-5">
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
                                onClick={handleClose} 
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="flex-1"
                            >
                                Next
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md border-2 border-black shadow-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-linear-to-r from-orange-500 to-red-500 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black uppercase">Confirm Password Change</h2>
                            <p className="text-white/80 text-sm mt-2">
                                Are you sure you want to change your password?
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-yellow-800 uppercase text-center">
                                    ⚠️ You will need to log in again with your new password
                                </p>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={handleCancel} 
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="primary" 
                                    onClick={handleConfirm}
                                    isLoading={isLoading}
                                    className="flex-1"
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PasswordModal;