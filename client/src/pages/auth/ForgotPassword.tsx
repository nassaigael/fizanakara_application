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

    if (isSubmitted) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
                {/* Fond vitre d'eau */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-600 to-red-900">
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

                {/* Carte de succès */}
                <div className="relative w-full max-w-md z-10">
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-500">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/50 flex items-center justify-center">
                                <AiOutlineCheckCircle size={48} className="text-green-400" />
                            </div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                                Email envoyé !
                            </h1>
                            <p className="text-white/80 text-sm font-medium mt-4">
                                Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                            </p>
                            <div className="mt-8">
                                <Link to="/login">
                                    <Button
                                        variant="primary"
                                        className="w-full py-3 text-sm font-bold bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Fond vitre d'eau */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-600 to-red-900">
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
                            Mot de passe oublié ?
                        </h1>
                        <p className="text-white/70 font-medium text-sm uppercase tracking-widest mt-2">
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={form.handleSubmit} className="space-y-6">
                            <Input
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={form.values.email}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                error={form.touched.email ? form.errors.email : undefined}
                                icon={<AiOutlineMail size={20} />}
                                placeholder="admin@fizanakara.mg"
                                required
                                className="bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-white/60 focus:border-transparent transition-all"
                            />

                            {form.submitError && (
                                <div className="p-4 bg-red-500/30 backdrop-blur-sm border border-red-400 rounded-xl">
                                    <p className="text-red-100 text-xs font-bold text-center">
                                        {form.submitError}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={form.isSubmitting}
                                className="w-full py-4 text-sm font-bold bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                ENVOYER LE LIEN
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-xs font-bold text-white/60 hover:text-white transition-colors uppercase tracking-widest"
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