import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/helper';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineCalendar } from 'react-icons/ai';

const ProfileInfoDisplay: React.FC = () => {
	const { user } = useAuth();
	if (!user) return null;

	const infoItems = [
		{ icon: AiOutlineUser, label: "Nom complet", value: `${user.firstName} ${user.lastName}` },
		{ icon: AiOutlineMail, label: "Email", value: user.email },
		{ icon: AiOutlinePhone, label: "Téléphone", value: user.phoneNumber || '-' },
		{ icon: AiOutlineCalendar, label: "Date de naissance", value: formatDate(user.birthDate) }
	];

	return (
		<div className="flex-1 w-full">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{infoItems.map((item, idx) => (
					<div
						key={idx}
						className="group flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-3 shadow-[0_4px_0_0_#F0F0F0] hover:border-red-300 hover:shadow-[0_4px_0_0_#FECACA] transition-all cursor-default"
					>
						<div className="shrink-0 w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-600 transition-all duration-300 shadow-sm">
							<item.icon size={20} />
						</div>
						<div className="flex-1">
							<p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">
								{item.label}
							</p>
							<p className="font-semibold text-gray-800 text-sm truncate">
								{item.value}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProfileInfoDisplay;