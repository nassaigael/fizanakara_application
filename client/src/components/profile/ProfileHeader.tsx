import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';

const ProfileHeader: React.FC = () => {
	const { user, logout } = useAuth();
	if (!user) return null;
	const roleLabel = user.role === 'SUPERADMIN' ? 'Super Administrateur' : 'Administrateur';
	return (
		<div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl shadow-[0_8px_0_0_#E5E5E5] hover:shadow-[0_12px_0_0_#E5E5E5] hover:translate-y-[-4px] transition-all duration-300 p-6 md:p-8">
			<div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div className="flex items-center gap-3 md:gap-4">
					<div className="p-3 md:p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl md:rounded-3xl border-2">
						<AiOutlineUser size={24} className="md:w-8 md:h-8" />
					</div>
					<div>
						<h1 className="font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight">
							Mon Profil
						</h1>
						<p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 uppercase tracking-widest font-medium">
							{roleLabel}
						</p>
					</div>
				</div>
				<Button
					variant="primary"
					onClick={logout}
					className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black w-full sm:w-auto"
				>
					<AiOutlineLogout size={16} /> DÉCONNEXION
				</Button>
			</div>
		</div>
	);
};

export default ProfileHeader;