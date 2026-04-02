import React from 'react';
import { AiOutlineTeam, AiOutlinePlus } from 'react-icons/ai';
import Button from '../../ui/Button';
import { THEME } from '../../../styles/theme';

interface MembersHeaderProps {
	totalMembers: number;
	filteredCount: number;
	onAddMember: () => void;
}

const MembersHeader: React.FC<MembersHeaderProps> = ({
	totalMembers,
	filteredCount,
	onAddMember,
}) => {
	return (
		<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6">
			<div>
				<h1 className={`${THEME.font.h1} text-xl sm:text-2xl md:text-3xl flex items-center gap-2 sm:gap-3 uppercase`}>
					<AiOutlineTeam className="text-brand-primary text-xl sm:text-2xl" />
					Gestion des membres
				</h1>
				<p className="text-gray-500 mt-1 text-[10px] sm:text-xs uppercase">
					{filteredCount} / {totalMembers} membres affichés
				</p>
			</div>
			<Button
				onClick={onAddMember}
				className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm w-full sm:w-auto justify-center"
			>
				<AiOutlinePlus size={16} className="sm:w-4 sm:h-4" />
				<span className="font-black">NOUVEAU MEMBRE</span>
			</Button>
		</div>
	);
};

export default MembersHeader;