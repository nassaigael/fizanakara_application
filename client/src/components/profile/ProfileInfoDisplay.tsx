import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/helper';
import {
	AiOutlineUser,
	AiOutlineMail,
	AiOutlinePhone,
	AiOutlineCalendar
} from 'react-icons/ai';

const ProfileInfoDisplay: React.FC = () => {
	const { user } = useAuth();
	if (!user) return null;

	const infoItems = [
		{
			icon: AiOutlineUser,
			label: "Nom complet",
			value: `${user.firstName} ${user.lastName}`,
			description: "Identité principale"
		},
		{
			icon: AiOutlineMail,
			label: "Email",
			value: user.email,
			description: "Adresse de connexion",
			badge: user.verified
		},
		{
			icon: AiOutlinePhone,
			label: "Téléphone",
			value: user.phoneNumber || 'Non renseigné',
			description: "Contact principal"
		},
		{
			icon: AiOutlineCalendar,
			label: "Date de naissance",
			value: formatDate(user.birthDate),
			description: "Date d'anniversaire"
		}
	];

	return (
		<div className="flex-1 w-full">
			<div className="mb-5 pb-3 border-b border-gray-100">
				<div className="flex items-center justify-center lg:justify-between flex-wrap gap-3">
					<div>
						<h3 className="text-[11px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
							Informations personnelles
						</h3>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
				{infoItems.map((item, idx) => (
					<div
						key={idx}
						className="group relative bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-default overflow-hidden"
					>
						<div className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all duration-200" />

						<div className="flex items-start gap-3 p-3 pl-4">
							<div className="shrink-0 mt-0.5">
								<div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center transition-all duration-200 group-hover:bg-red-500 group-hover:border-red-600">
									<item.icon
										size={16}
										className="text-red-500 transition-colors duration-200 group-hover:text-white"
									/>
								</div>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between flex-wrap gap-2">
									<p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
										{item.label}
									</p>
								</div>
								<p className="font-semibold text-gray-800 text-sm truncate mt-0.5">
									{item.value}
								</p>
							</div>
						</div>

						<div className="absolute inset-0 bg-linear-to-r from-red-50/0 via-red-50/0 to-red-50/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
					</div>
				))}
			</div>
		</div>
	);
};

export default ProfileInfoDisplay;