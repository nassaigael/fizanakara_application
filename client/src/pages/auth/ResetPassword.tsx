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
            <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-red-800 via-red-600 to-red-900">
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.3' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'bottom',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                    <div className="absolute inset-0 backdrop-blur-[1px]"></div>
                </div>

                <div className="relative w-full max-w-md z-10">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-500">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/50 flex items-center justify-center">
                                <AiOutlineCheckCircle size={48} className="text-green-400" />
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
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-red-800 via-red-600 to-red-900">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.3' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'bottom',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                <div className="absolute inset-0 backdrop-blur-[1px]"></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-3xl">
                    <div className="p-8 text-center border-b border-white/10">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Nouveau mot de passe
                        </h1>
                        <p className="text-white/70 font-medium text-sm uppercase tracking-widest mt-2">
                            Choisissez un mot de passe sécurisé
                        </p>
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
                                    className="absolute right-3 top-10.5 text-gray-400 hover:text-gray-600 transition-colors"
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
                                    className="absolute right-3 top-10.5 text-gray-400 hover:text-gray-600 transition-colors"
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
                                className="w-full py-4 text-sm font-bold bg-linear-to-r from-white/30 to-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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