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
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
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
            toast.success('Mot de passe modifié avec succès');
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
                <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[90%] sm:max-w-md border-2 border-black shadow-lg overflow-hidden animate-in zoom-in duration-200">
                    <div className="bg-[#E51A1A] p-4 sm:p-6 text-white">
                        <h2 className="text-lg sm:text-xl font-black uppercase">Changer le mot de passe</h2>
                        <p className="text-white/80 text-xs sm:text-sm mt-1">Entrez votre nouveau mot de passe</p>
                    </div>

                    <form onSubmit={handleNext} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                        <Input
                            name="password"
                            label="Nouveau mot de passe"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            placeholder="••••••••"
                            required
                        />
                        <Input
                            name="confirmPassword"
                            label="Confirmer le mot de passe"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            required
                        />

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                className="flex-1 w-full sm:w-auto order-2 sm:order-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1 w-full sm:w-auto order-1 sm:order-2 bg-[#E51A1A] hover:bg-[#C41515]"
                            >
                                Suivant
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[90%] sm:max-w-md border-2 border-black shadow-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-[#E51A1A] p-5 sm:p-6 text-white text-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-black uppercase">Confirmer le changement</h2>
                            <p className="text-white/80 text-xs sm:text-sm mt-2">
                                Êtes-vous sûr de vouloir changer votre mot de passe ?
                            </p>
                        </div>

                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4">
                                <p className="text-[10px] sm:text-xs font-bold text-yellow-800 uppercase text-center leading-tight">
                                    ⚠️ Vous devrez vous reconnecter avec votre nouveau mot de passe
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancel}
                                    className="flex-1 w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleConfirm}
                                    isLoading={isLoading}
                                    className="flex-1 w-full sm:w-auto order-1 sm:order-2 bg-[#E51A1A] hover:bg-[#C41515]"
                                >
                                    Confirmer
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