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
import logo from "../../assets/logo.png";

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

    // Success state
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
                                Email envoyé !
                            </h2>
                            <p className="text-gray-500 text-sm mt-3">
                                Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                            </p>
                            <div className="mt-6">
                                <Link to="/login">
                                    <Button
                                        variant="primary"
                                        className="w-full py-3 text-sm font-bold bg-[#E51A1A] hover:bg-[#C41515] rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-white"
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
                            Mot de passe oublié ?
                        </h2>
                        <p className="text-center text-gray-500 text-xs mb-6">
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </p>

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
                                className="border-gray-200 focus:border-[#E51A1A] focus:ring-2 focus:ring-[#E51A1A]/20 transition-all"
                                errorClassName="border-[#E51A1A] focus:border-[#E51A1A] focus:ring-[#E51A1A]/20"
                            />

                            {form.submitError && (
                                <div className="p-3 bg-red-50 border border-[#E51A1A]/20 rounded-xl">
                                    <p className="text-[#E51A1A] text-xs font-medium text-center">
                                        {form.submitError}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={form.isSubmitting}
                                className="w-full py-3.5 text-sm font-bold bg-[#E51A1A] hover:bg-[#C41515] rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-white"
                            >
                                ENVOYER LE LIEN
                            </Button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="text-xs font-medium text-gray-400 hover:text-[#E51A1A] transition-colors uppercase tracking-wide"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
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

export default ForgotPassword;