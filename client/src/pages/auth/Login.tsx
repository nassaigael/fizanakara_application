import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AiOutlineMail,
    AiOutlineLock,
    AiOutlineEye,
    AiOutlineEyeInvisible,
    AiOutlineArrowRight
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
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: loginSchema,
        onSubmit: async (data) => {
            await login(data);
        }
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Header */}
                    <div className="bg-black p-8 text-center">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                            FIZANAKARA
                        </h1>
                        <p className="text-brand-primary font-black text-xs uppercase tracking-widest mt-2">
                            Gestion des membres
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 bottom-4 text-gray-400 hover:text-brand-primary transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
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
                                SE CONNECTER
                                <AiOutlineArrowRight className="ml-2" />
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-black text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;