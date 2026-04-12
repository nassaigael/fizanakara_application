import React, { useState } from 'react';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../lib/helper';
import { AiOutlineLock, AiOutlineCheckCircle, AiOutlineClose } from 'react-icons/ai';

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
                <div className="bg-white rounded-lg w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">

                            <div>
                                <h2 className="text-base font-bold text-gray-800">Changer le mot de passe</h2>
                                <p className="text-[10px] text-gray-500">Entrez votre nouveau mot de passe</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <AiOutlineClose size={16} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleNext} className="p-5 space-y-4">
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

                        {/* Boutons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                className="flex-1 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                                Suivant
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Confirmation</h2>
                                    <p className="text-[10px] text-gray-500">Vérifiez votre action</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <AiOutlineClose size={16} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="text-center mb-5">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                                    <AiOutlineLock className="text-red-600" size={20} />
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    Êtes-vous sûr de vouloir changer votre mot de passe ?
                                </p>
                            </div>


                            <div className="flex gap-3 pt-2 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancel}
                                    className="flex-1 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleConfirm}
                                    isLoading={isLoading}
                                    className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                                >
                                    <AiOutlineCheckCircle size={14} className="mr-1" />
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