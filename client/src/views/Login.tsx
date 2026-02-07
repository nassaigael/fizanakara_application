// components/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineMail, AiOutlineLock, AiOutlineSafetyCertificate } from 'react-icons/ai';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../lib/schemas/admin.schema';
import type { LoginRequestDto } from '../lib/types/models/admin.type';

import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import { THEME } from '../styles/theme';

const Login: React.FC = () => {
	const navigate = useNavigate();
	const { login, isAuthenticated } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [alertConfig, setAlertConfig] = useState({ 
		show: false, 
		msg: '', 
		variant: 'danger' as 'danger' | 'success' 
	});

	const { register, handleSubmit, formState: { errors } } = useForm<LoginRequestDto>({
		resolver: zodResolver(loginSchema),
	});

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const onSubmit = async (data: LoginRequestDto) => {
		setIsLoading(true);
		setAlertConfig({ show: false, msg: '', variant: 'danger' });
		try {
			await login(data);
			// Redirection gérée dans le useEffect via isAuthenticated
		} catch (error: any) {
			console.error('Login error:', error);
			const errorMsg = error.response?.data?.error || 
							error.message || 
							"Identifiants invalides ou serveur indisponible.";
			setAlertConfig({ 
				show: true, 
				msg: errorMsg, 
				variant: 'danger' 
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg dark:bg-brand-bg-dark relative overflow-hidden transition-colors duration-500">
			<div className="absolute inset-0 z-0 pointer-events-none">
				<div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
				<div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
			</div>
			<div className="w-full max-w-md bg-white dark:bg-brand-border-dark rounded-[3rem] border-2 border-brand-border border-b-8 p-10 lg:p-12 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-24 h-24 bg-brand-primary rounded-4xl mb-6 shadow-[0_10px_0_0_rgba(0,0,0,0.1)] rotate-3">
						<AiOutlineSafetyCertificate className="text-white text-5xl" />
					</div>
					<h1 className={`${THEME.font.black} text-3xl tracking-tight`}>
						Connexion
					</h1>
					<p className="text-[10px] font-black text-brand-muted mt-3 uppercase tracking-[0.2em] opacity-60">
						Administration • Fizanakara
					</p>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					<div className="space-y-6">
						<Input
							label="Email Professionnel"
							placeholder="admin@fizanakara.mg"
							icon={<AiOutlineMail size={20} />}
							error={errors.email?.message}
							{...register("email")}
						/>
						<div className="space-y-2">
							<Input
								label="Mot de passe"
								type="password"
								placeholder="••••••••"
								icon={<AiOutlineLock size={20} />}
								error={errors.password?.message}
								{...register("password")}
							/>
							<div className="flex justify-end px-1">
								<Link
									to="/forgot-password"
									className="text-[10px] font-black text-brand-primary uppercase hover:opacity-70 transition-opacity tracking-widest"
								>
									Oublié ?
								</Link>
							</div>
						</div>
					</div>
					<div className="pt-4">
						<Button
							type="submit"
							className="w-full py-5 text-[11px] tracking-[0.2em]"
							isLoading={isLoading}
							disabled={isLoading}
						>
							{isLoading ? "AUTHENTIFICATION..." : "DÉVERROUILLER L'ACCÈS"}
						</Button>
					</div>
				</form>
				<div className="mt-10 text-center">
					<p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">
						Système de Gestion Sécurisé v2.0
					</p>
				</div>
			</div>
			<Alert
				isOpen={alertConfig.show}
				title="Accès Refusé"
				message={alertConfig.msg}
				variant={alertConfig.variant}
				onClose={() => setAlertConfig({ ...alertConfig, show: false })}
			/>
		</div>
	);
};

export default Login;