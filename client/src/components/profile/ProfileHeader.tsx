import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { getImageUrl } from '../../lib/constant/constant';
import { getInitials } from '../../lib/helper';

const ProfileHeader: React.FC = () => {
	const { user, logout } = useAuth();
	if (!user) return null;
	const roleLabel = user.role === 'SUPERADMIN' ? 'Super Administrateur' : 'Administrateur';
	
	const hasImage = user?.imageUrl && user.imageUrl.trim() !== '';
	
	const getInitialsName = () => {
		return getInitials(user.firstName, user.lastName);
	};
	
	return (
		<div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl shadow-[0_8px_0_0_#E5E5E5] hover:shadow-[0_12px_0_0_#E5E5E5] hover:-translate-y-1 transition-all duration-300 p-6 md:p-8">
			<div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div className="flex items-center gap-3 md:gap-4">
					<div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-[#E51A1A] flex items-center justify-center shadow-md border-2 border-white">
						{hasImage ? (
							<img
								src={getImageUrl(user.imageUrl, 'admin')}
								alt={`${user.firstName} ${user.lastName}`}
								className="w-full h-full object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
									if (target.parentElement) {
										target.parentElement.innerHTML = getInitialsName();
										target.parentElement.classList.add('text-xl', 'md:text-2xl', 'font-black', 'text-white', 'flex', 'items-center', 'justify-center');
									}
								}}
							/>
						) : (
							<span className="text-xl md:text-2xl font-black text-white">
								{getInitialsName()}
							</span>
						)}
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
					className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black w-full sm:w-auto bg-[#E51A1A] hover:bg-[#C41515]"
				>
				 DÉCONNEXION
				</Button>
			</div>
		</div>
	);
};

export default ProfileHeader;