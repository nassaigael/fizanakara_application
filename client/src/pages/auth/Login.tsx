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
            <div className="absolute inset-0 bg-white" />
            
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md z-10">
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-brand-primary to-orange-500 rounded-2xl shadow-lg mb-3">
                                <svg 
                                    width="32" 
                                    height="32" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    className="text-white"
                                >
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    <path d="M11 5l1 1-1 1-1-1 1-1zM15 3l1 1-1 1-1-1 1-1zM18 6l1 1-1 1-1-1 1-1z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                FIZANAKARA
                            </h1>
                            <p className="text-gray-500 text-xs mt-1 font-medium">
                                Gestion des cotisations
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
                                className="border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                errorClassName="border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            />

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <AiOutlineLock size={18} />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.values.password}
                                        onChange={form.handleChange}
                                        onBlur={form.handleBlur}
                                        placeholder="••••••••"
                                        className={`
                                            w-full px-3 py-2.5 rounded-xl border-2 bg-white text-gray-800
                                            transition-all duration-200 outline-none
                                            pl-9 pr-10
                                            ${form.touched.password && form.errors.password
                                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            }
                                        `}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                    </button>
                                </div>
                                {form.touched.password && form.errors.password && (
                                    <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                                        {form.errors.password}
                                    </p>
                                )}
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
                
                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; {new Date().getFullYear()} Fizanakara. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};

export default Login;