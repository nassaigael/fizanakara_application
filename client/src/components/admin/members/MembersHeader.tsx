import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../lib/constant/constant';
import { getInitials } from '../../../lib/helper';
import Button from '../../ui/Button';
import { THEME } from '../../../styles/theme';

interface MembersHeaderProps {
	totalMembers: number;
	filteredCount: number;
	onAddMember: () => void;
}

const MembersHeader: React.FC<MembersHeaderProps> = ({
	onAddMember,
}) => {
	const { user } = useAuth();
	
	const hasImage = user?.imageUrl && user.imageUrl.trim() !== '';
	
	const getAdminInitials = () => {
		if (!user) return '?';
		return getInitials(user.firstName, user.lastName);
	};

	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
			<div className="flex items-center gap-3 md:gap-4">
				<div className="p-2 md:p-3 bg-[#E51A1A] text-white rounded-2xl md:rounded-3xl shadow-md">
					{hasImage ? (
						<img
							src={getImageUrl(user?.imageUrl, 'admin')}
							alt={user?.firstName}
							className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = 'none';
								if (target.parentElement) {
									target.parentElement.innerHTML = getAdminInitials();
									target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-base', 'md:text-xl', 'font-black');
								}
							}}
						/>
					) : (
						<span className="text-base md:text-xl font-black">
							{getAdminInitials()}
						</span>
					)}
				</div>
				<div>
					<h1 className={`${THEME.font.h1} text-xl sm:text-2xl md:text-3xl uppercase`}>
						Gestion des membres
					</h1>
					<p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 md:mt-1">
						Connecté en tant que {user?.firstName} {user?.lastName}
					</p>
				</div>
			</div>

			<Button
				onClick={onAddMember}
				className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm w-full sm:w-auto bg-[#E51A1A] hover:bg-[#C41515] text-white"
			>
				<span className="font-black">NOUVEAU MEMBRE</span>
			</Button>
		</div>
	);
};

export default MembersHeader;