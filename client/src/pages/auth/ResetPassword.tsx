import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AiOutlineLock,
    AiOutlineCheckCircle,
    AiOutlineEye,
    AiOutlineEyeInvisible
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { resetPasswordSchema } from '../../lib/validators/admin.validator';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import logo from "../../assets/logo.png";

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
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
                {/* Background blanc */}
                <div className="absolute inset-0 bg-white" />

                {/* Éléments décoratifs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
                </div>

                {/* Card de succès */}
                <div className="relative w-full max-w-md z-10">
                    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E51A1A]/10 flex items-center justify-center">
                                <AiOutlineCheckCircle size={48} className="text-[#E51A1A]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
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
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
            {/* Background blanc */}
            <div className="absolute inset-0 bg-white" />

            {/* Éléments décoratifs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Card principal */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-400 border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {/* Logo et titre avec image PNG */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-[#E51A1A]/10 flex items-center justify-center mb-4 shadow-sm">
                                <img
                                    src={logo}
                                    alt="FIZANAKARA logo"
                                    className="w-14 h-14 object-contain"
                                />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                FIZANAKARA
                            </h1>
                            <p className="text-gray-500 text-xs mt-1 font-medium">
                                Gestion des cotisations
                            </p>
                        </div>

                        {/* Séparateur élégant */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                        </div>

                        {/* Titre centré */}
                        <h2 className="text-center text-lg font-bold text-gray-800 mb-2">
                            Nouveau mot de passe
                        </h2>
                        <p className="text-center text-gray-500 text-xs mb-6">
                            Choisissez un mot de passe sécurisé
                        </p>

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
                                    className="border-gray-200 focus:border-[#E51A1A] focus:ring-2 focus:ring-[#E51A1A]/20 transition-all pr-10"
                                    errorClassName="border-[#E51A1A] focus:border-[#E51A1A] focus:ring-[#E51A1A]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E51A1A] transition-colors z-10"
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
                                    className="border-gray-200 focus:border-[#E51A1A] focus:ring-2 focus:ring-[#E51A1A]/20 transition-all pr-10"
                                    errorClassName="border-[#E51A1A] focus:border-[#E51A1A] focus:ring-[#E51A1A]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E51A1A] transition-colors z-10"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </button>
                            </div>

                            {displaySubmitError && (
                                <div className="p-3 bg-red-50 border border-[#E51A1A]/20 rounded-xl">
                                    <p className="text-[#E51A1A] text-xs font-medium text-center">
                                        {displaySubmitError}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={form.isSubmitting}
                                className="w-full py-3.5 text-sm font-bold bg-[#E51A1A] hover:bg-[#C41515] rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-white"
                            >
                                RÉINITIALISER
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; {new Date().getFullYear()} Fizanakara. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;