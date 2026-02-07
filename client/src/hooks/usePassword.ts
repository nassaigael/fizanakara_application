import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import toast from 'react-hot-toast';

export const usePassword = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const [isResetMode, setIsResetMode] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);

	// Détection du mode (Demande d'email vs Réinitialisation via Token)
	useEffect(() => {
		const token = searchParams.get('token');
		setIsResetMode(!!token);
	}, [searchParams]);

	/**
	 * Étape 1 : Demande de lien par Email
	 */
	const handleRequestEmail = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return toast.error("Veuillez entrer une adresse email.");

		setLoading(true);
		try {
			await AuthService.forgotPassword(email);
			toast.success("Si ce compte existe, un lien de récupération a été envoyé.");
			// On peut rediriger vers le login après un délai
			setTimeout(() => navigate('/login'), 3000);
		} catch (err: any) {
			// Sécurité : On affiche le même message même si l'email n'existe pas
			toast.success("Si ce compte existe, un lien de récupération a été envoyé.");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Étape 2 : Définition du nouveau mot de passe
	 */
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			return toast.error("Les mots de passe ne correspondent pas.");
		}
		if (password.length < 6) {
			return toast.error("Le mot de passe doit faire au moins 6 caractères.");
		}

		setLoading(true);
		try {
			const token = searchParams.get('token') || "";
			await AuthService.resetPassword({
				token,
				newPassword: password
			});

			toast.success("Mot de passe mis à jour ! Vous pouvez vous connecter.");
			navigate('/login');
		} catch (err) {
			toast.error("Le lien est invalide ou a expiré. Veuillez recommencer.");
		} finally {
			setLoading(false);
		}
	};

	return {
		isResetMode,
		email, setEmail,
		password, setPassword,
		confirmPassword, setConfirmPassword,
		loading,
		handleRequestEmail,
		handleResetPassword
	};
};