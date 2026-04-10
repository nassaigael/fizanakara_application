import React from 'react';
import { AiOutlineTeam } from 'react-icons/ai';
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
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
			<div className="flex items-center gap-3 md:gap-4">
				<div className="p-3 md:p-4 bg-[#E51A1A] text-white rounded-2xl md:rounded-3xl shadow-md">
					<AiOutlineTeam size={24} className="md:w-8 md:h-8" />
				</div>
				<div>
					<h1 className={`${THEME.font.h1} text-xl sm:text-2xl md:text-3xl uppercase`}>
						Gestion des membres
					</h1>
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