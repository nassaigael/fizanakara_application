import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AiOutlineMail,
    AiOutlineLock,
    AiOutlineArrowRight,
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { loginSchema } from '../../lib/validators/admin.validator';
import { LoginRequest } from '../../lib/types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [showPassword] = useState(false);

    const form = useForm<LoginRequest>({
        initialValues: { email: '', password: '' },
        validationSchema: loginSchema,
        onSubmit: async (data) => { await login(data); }
    });

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
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl">
                    <div className="p-8 text-center border-b border-white/10">
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                            FIZANAKARA
                        </h1>
                        <p className="text-white/80 font-medium text-sm uppercase tracking-widest mt-2">
                            Gestion des cotisations
                        </p>
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                        FIZANAKARA
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Gestion des cotisations</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
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
                                className="w-full py-4 text-sm font-bold bg-linear-to-r from-white/30 to-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                SE CONNECTER
                                <AiOutlineArrowRight className="ml-2" />
                            </Button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-gray-500 hover:text-brand-primary transition-colors uppercase tracking-wide"
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