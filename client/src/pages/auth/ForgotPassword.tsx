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
            <div className="min-h-screen bg-linear-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="bg-green-500 p-8 text-center">
                            <AiOutlineCheckCircle size={64} className="mx-auto text-white mb-4" />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                                Email sent!
                            </h1>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-sm font-bold text-gray-600 mb-6 uppercase">
                                If an account exists with this email address, you will receive a link to reset your password shortly.
                            </p>
                            <Link to="/login">
                                <Button variant="primary" className="w-full">
                                    <AiOutlineArrowLeft className="mr-2" />
                                    BACK TO LOGIN
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black p-8">
                        <Link to="/login" className="inline-block mb-4">
                            <Button variant="ghost" className="p-2! text-white! hover:bg-white/10!">
                                <AiOutlineArrowLeft size={20} />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-400 text-xs font-bold mt-2 uppercase">
                            Enter your email to receive a reset link
                        </p>
                    </div>

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
                                    <p className="text-red-600 text-xs font-black text-center uppercase">
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
                                SEND RESET LINK
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-xs font-black text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest"
                                >
                                    Back to login
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