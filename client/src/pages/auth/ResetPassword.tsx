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

    const form = useForm<ResetPasswordForm>({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: resetPasswordSchema,
        onSubmit: async (data) => {
            if (!token) return;
            await resetPassword(token, data.newPassword);
            setIsSubmitted(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    });

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                {/* Success Card */}
                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="bg-green-500 p-8 text-center">
                            <AiOutlineCheckCircle size={64} className="mx-auto text-white mb-4" />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                                Mot de passe modifié !
                            </h1>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-sm font-bold text-gray-600 mb-6">
                                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Reset Password Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Header */}
                    <div className="bg-black p-8">
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                            Nouveau mot de passe
                        </h1>
                        <p className="text-gray-400 text-xs font-bold mt-2">
                            Choisissez un mot de passe sécurisé
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={form.handleSubmit} className="space-y-6">
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 bottom-4 text-gray-400 hover:text-brand-primary transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 bottom-4 text-gray-400 hover:text-brand-primary transition-colors"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>

                            {form.submitError && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                                    <p className="text-red-600 text-xs font-black text-center">
                                        {form.submitError}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={form.isSubmitting}
                                className="w-full py-4 text-sm"
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