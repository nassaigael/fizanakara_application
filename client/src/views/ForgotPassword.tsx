import React, { useState, useEffect, memo } from 'react';
import {
	AiOutlineMail, AiOutlineLock, AiOutlineArrowLeft,
	AiOutlineSecurityScan
} from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import { usePassword } from '../hooks/usePassword';
import { THEME } from '../styles/theme';

const ForgotPassword: React.FC = () => {
	const navigate = useNavigate();
	const {
		isResetMode, email, setEmail, password, setPassword,
		confirmPassword, setConfirmPassword,
		loading, message,
		handleRequestEmail, handleResetPassword
	} = usePassword();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	useEffect(() => {
		if (message) setIsAlertOpen(true);
	}, [message]);

	const handleAlertConfirm = () => {
		setIsAlertOpen(false);
		if (message?.type === 'success') navigate('/');
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg dark:bg-brand-bg-dark relative overflow-hidden transition-colors duration-500">
			<div className="absolute inset-0 z-0 pointer-events-none">
				<div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
				<div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
			</div>

			<div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
				<Link
					to="/"
					className="inline-flex items-center text-[10px] font-black text-brand-muted hover:text-brand-primary mb-6 transition-all group tracking-[0.2em] uppercase"
				>
					<AiOutlineArrowLeft className="mr-2 group-hover:-translate-x-2 transition-transform duration-300" size={16} />
					Retour à la connexion
				</Link>

				{/* Carte 3D */}
				<div className={`bg-white dark:bg-brand-border-dark rounded-[3rem] border-2 border-brand-border border-b-8 p-10 lg:p-12 shadow-2xl`}>
					<header className="mb-10 text-center md:text-left">
						<div className="flex flex-col md:flex-row items-center gap-4 mb-6">
							<div className="p-4 bg-brand-primary rounded-2xl text-white shadow-lg rotate-3 border-b-4 border-black/10">
								<AiOutlineSecurityScan size={28} />
							</div>
							<div>
								<h1 className={`${THEME.font.black} text-2xl tracking-tighter uppercase leading-none`}>
									{isResetMode ? "Sécurité" : "Récupération"}
								</h1>
								<p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-1">
									{isResetMode ? "Nouveau mot de passe" : "Accès oublié"}
								</p>
							</div>
						</div>
						<p className="text-brand-muted text-[10px] font-bold uppercase tracking-wider leading-relaxed opacity-70">
							{isResetMode
								? "Veuillez définir votre nouveau mot de passe pour sécuriser votre accès administrateur."
								: "Entrez votre adresse email professionnelle pour recevoir les instructions de réinitialisation."}
						</p>
					</header>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							isResetMode ? handleResetPassword(e) : handleRequestEmail(e);
						}}
						className="space-y-6"
					>
						{!isResetMode ? (
							<div className="animate-in slide-in-from-bottom-2 duration-300">
								<Input
									label="Email Administrateur"
									type="email"
									placeholder="ex: admin@fizanakara.mg"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									icon={<AiOutlineMail size={20} />}
									required
								/>
							</div>
						) : (
							<div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
								<Input
									label="Nouveau Mot de Passe"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									icon={<AiOutlineLock size={20} />}
									required
								/>
								<Input
									label="Confirmation"
									type="password"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									icon={<AiOutlineLock size={20} />}
									required
								/>
							</div>
						)}

						<div className="pt-4">
							<Button
								type="submit"
								className="w-full py-5 text-[11px] tracking-[0.2em]"
								isLoading={loading}
							>
								{isResetMode ? "RÉINITIALISER" : "ENVOYER LE LIEN"}
							</Button>
						</div>
					</form>
				</div>
			</div>
			<Alert
				isOpen={isAlertOpen}
				title={message?.type === 'success' ? "SUCCÈS" : "ERREUR"}
				message={message?.text || ""}
				variant={message?.type === 'success' ? 'info' : 'danger'}
				onClose={() => setIsAlertOpen(false)}
				onConfirm={handleAlertConfirm}
				confirmText={message?.type === 'success' ? "RETOUR À LA CONNEXION" : "RÉESSAYER"}
			/>
		</div>
	);
};

export default memo(ForgotPassword);