import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AiOutlineLock,
    AiOutlineCheckCircle,
    AiOutlineEye,
    AiOutlineEyeInvisible
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import logo from "../../assets/logo.png";
import toast from 'react-hot-toast';


const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        if (!token) {
            toast.error('Token invalide ou manquant');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            await resetPassword(token, newPassword);
            toast.success('Mot de passe réinitialisé avec succès !');
            setIsSubmitted(true);
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Erreur lors de la réinitialisation';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
                </div>
                <div className="relative w-full max-w-md z-10">
                    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E51A1A]/10 flex items-center justify-center">
                                <AiOutlineCheckCircle size={48} className="text-[#E51A1A]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Mot de passe modifié !
                            </h2>
                            <p className="text-gray-500 text-sm mt-3">
                                Votre mot de passe a été réinitialisé avec succès.
                                <br />
                                Vous allez être redirigé vers la page de connexion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E51A1A]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md z-10">
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-400 border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
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

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                        </div>

                        <h2 className="text-center text-lg font-bold text-gray-800 mb-2">
                            Nouveau mot de passe
                        </h2>
                        <p className="text-center text-gray-500 text-xs mb-6">
                            Choisissez un mot de passe sécurisé
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="relative">
                                <Input
                                    label="Nouveau mot de passe"
                                    name="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    icon={<AiOutlineLock size={18} />}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-10.5 text-gray-400 hover:text-[#E51A1A] transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    label="Confirmer le mot de passe"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    icon={<AiOutlineLock size={18} />}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-10.5 text-gray-400 hover:text-[#E51A1A] transition-colors"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-600 text-xs font-medium text-center">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full py-3.5 text-sm font-bold bg-[#E51A1A] hover:bg-[#C41515] rounded-xl shadow-md hover:shadow-lg transition-all text-white"
                            >
                                RÉINITIALISER
                            </Button>
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

export default ResetPassword;