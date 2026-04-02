import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AiOutlineLock,
    AiOutlineEye,
    AiOutlineEyeInvisible,
    AiOutlineCheckCircle
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { resetPasswordSchema } from '../../lib/validators/admin.validator';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface ResetPasswordForm {
    newPassword: string;
    confirmPassword: string;
}

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [localSubmitError, setLocalSubmitError] = useState<string | undefined>(undefined);

    const form = useForm<ResetPasswordForm>({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: resetPasswordSchema,
        onSubmit: async (data) => {
            if (!token) {
                setLocalSubmitError('Token invalide ou manquant');
                return;
            }
            console.log('Sending reset request with token:', token, 'password:', data.newPassword);
            try {
                const result = await resetPassword(token, data.newPassword);
                console.log('Reset response:', result);
                setIsSubmitted(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error: any) {
                console.error('Reset error:', error);
                const message = error?.response?.data?.message || error?.message || 'Erreur lors de la réinitialisation';
                setLocalSubmitError(message);
            }
        }
    });

    const displaySubmitError = localSubmitError || form.submitError;

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 sm:p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                <AiOutlineCheckCircle size={32} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                Mot de passe modifié !
                            </h2>
                            <p className="text-gray-500 text-sm mt-3">
                                Votre mot de passe a été réinitialisé avec succès.
                                <br />
                                Vous allez être redirigé vers la page de connexion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 shadow-md mb-3">
                        <span className="text-xl font-black text-white">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-brand-primary"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                <path d="M11 5l1 1-1 1-1-1 1-1zM15 3l1 1-1 1-1-1 1-1zM18 6l1 1-1 1-1-1 1-1z" />
                            </svg>
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                                Nouveau mot de passe
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Choisissez un mot de passe sécurisé
                            </p>
                        </div>

                        <form onSubmit={form.handleSubmit} className="space-y-5">
                            <div className="relative">
                                <Input
                                    label="Nouveau mot de passe"
                                    name="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.values.newPassword}
                                    onChange={form.handleChange}
                                    onBlur={form.handleBlur}
                                    error={form.touched.newPassword ? form.errors.newPassword : undefined}
                                    icon={<AiOutlineLock size={18} />}
                                    placeholder="••••••••"
                                    required
                                    className="border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    label="Confirmer le mot de passe"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={form.values.confirmPassword}
                                    onChange={form.handleChange}
                                    onBlur={form.handleBlur}
                                    error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
                                    icon={<AiOutlineLock size={18} />}
                                    placeholder="••••••••"
                                    required
                                    className="border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </button>
                            </div>

                            {displaySubmitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-600 text-xs font-medium text-center">
                                        {displaySubmitError}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={form.isSubmitting}
                                className="w-full py-2.5 text-sm font-bold bg-gradient-to-r from-brand-primary to-orange-500 hover:from-brand-primary-dark hover:to-orange-600 shadow-md hover:shadow-lg transition-all"
                            >
                                RÉINITIALISER
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;