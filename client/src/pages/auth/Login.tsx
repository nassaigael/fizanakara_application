import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AiOutlineMail,
    AiOutlineLock,
    AiOutlineArrowRight,
    AiOutlineEye,
    AiOutlineEyeInvisible
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { loginSchema } from '../../lib/validators/admin.validator';
import { LoginRequest } from '../../lib/types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginRequest>({
        initialValues: { email: '', password: '' },
        validationSchema: loginSchema,
        onSubmit: async (data) => { await login(data); }
    });

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
            {/* Background blanc pur */}
            <div className="absolute inset-0 bg-white" />
            
            {/* Éléments décoratifs subtils en arrière-plan */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-brand-primary to-orange-500 rounded-2xl shadow-lg mb-4">
                        <svg 
                            width="32" 
                            height="32" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="text-white"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            <path d="M11 5l1 1-1 1-1-1 1-1zM15 3l1 1-1 1-1-1 1-1zM18 6l1 1-1 1-1-1 1-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        FIZANAKARA
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Gestion des cotisations
                    </p>
                </div>

                {/* Card de connexion - fond blanc avec ombre */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Connexion
                        </h2>
                        
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
                                className="border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                errorClassName="border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            />

                            <div className="relative">
                                <Input
                                    label="Mot de passe"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.values.password}
                                    onChange={form.handleChange}
                                    onBlur={form.handleBlur}
                                    error={form.touched.password ? form.errors.password : undefined}
                                    icon={<AiOutlineLock size={18} />}
                                    placeholder="••••••••"
                                    required
                                    className="border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all pr-12"
                                    errorClassName="border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-10.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </button>
                            </div>

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
                                className="w-full py-3.5 text-sm font-bold bg-linear-to-r from-brand-primary to-orange-500 hover:from-brand-primary/90 hover:to-orange-500/90 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                SE CONNECTER
                                <AiOutlineArrowRight className="ml-2" />
                            </Button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-wide"
                                >
                                    Mot de passe oublié ?
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

export default Login;