import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AiOutlineMail,
    AiOutlineArrowLeft,
    AiOutlineCheckCircle
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { forgotPasswordSchema } from '../../lib/validators/admin.validator';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';

const ForgotPassword: React.FC = () => {
    const { forgotPassword } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<{ email: string }>({
        initialValues: {
            email: ''
        },
        validationSchema: forgotPasswordSchema,
        onSubmit: async (data) => {
            await forgotPassword(data.email);
            setIsSubmitted(true);
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
                                Email envoyé !
                            </h1>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-sm font-bold text-gray-600 mb-6">
                                Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                            </p>
                            <Link to="/login">
                                <Button variant="primary" className="w-full">
                                    <AiOutlineArrowLeft className="mr-2" />
                                    RETOUR À LA CONNEXION
                                </Button>
                            </Link>
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

            {/* Forgot Password Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Header */}
                    <div className="bg-black p-8">
                        <Link to="/login" className="inline-block mb-4">
                            <Button variant="ghost" className="!p-2 !text-white hover:!bg-white/10">
                                <AiOutlineArrowLeft size={20} />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                            Mot de passe oublié ?
                        </h1>
                        <p className="text-gray-400 text-xs font-bold mt-2">
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={form.handleSubmit} className="space-y-6">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={form.values.email}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                error={form.touched.email ? form.errors.email : undefined}
                                icon={<AiOutlineMail size={18} />}
                                placeholder="admin@fizanakara.mg"
                                required
                            />

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
                                ENVOYER LE LIEN
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-xs font-black text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;