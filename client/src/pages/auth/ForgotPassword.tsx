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

const ForgotPassword: React.FC = () => {
    const { forgotPassword } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<{ email: string }>({
        initialValues: { email: '' },
        validationSchema: forgotPasswordSchema,
        onSubmit: async (data) => {
            await forgotPassword(data.email);
            setIsSubmitted(true);
        }
    });

    // Success state – clean and minimal
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
                                Email envoyé !
                            </h2>
                            <p className="text-gray-500 text-sm mt-3">
                                Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                            </p>
                            <div className="mt-6">
                                <Link to="/login">
                                    <Button
                                        variant="primary"
                                        className="w-full py-2.5 text-sm font-bold bg-gradient-to-r from-brand-primary to-orange-500 hover:from-brand-primary-dark hover:to-orange-600 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <AiOutlineArrowLeft className="mr-2" />
                                        RETOUR À LA CONNEXION
                                    </Button>
                                </Link>
                            </div>
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-md mb-3">
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
                                Mot de passe oublié ?
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Entrez votre email pour recevoir un lien de réinitialisation
                            </p>
                        </div>

                        <form onSubmit={form.handleSubmit} className="space-y-5">
                            <Input
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={form.values.email}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                error={form.touched.email ? form.errors.email : undefined}
                                icon={<AiOutlineMail size={18} />}
                                placeholder="admin@fizanakara.mg"
                                required
                                className="border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            />

                            {form.submitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-600 text-xs font-medium text-center">
                                        {form.submitError}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={form.isSubmitting}
                                className="w-full py-2.5 text-sm font-bold bg-gradient-to-r from-brand-primary to-orange-500 hover:from-brand-primary-dark hover:to-orange-600 shadow-md hover:shadow-lg transition-all"
                            >
                                ENVOYER LE LIEN
                            </Button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="text-xs font-medium text-gray-500 hover:text-brand-primary transition-colors uppercase tracking-wide"
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