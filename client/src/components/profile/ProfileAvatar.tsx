import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/helper';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { getImageUrl } from '../../lib/constant/constant';

const ProfileAvatar: React.FC = () => {
	const { user } = useAuth();
	if (!user) return null;
	return (
		<div className="relative group shrink-0">
			<div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
				{user.imageUrl ? (
					<img
						src={getImageUrl(user.imageUrl, 'admin')}
						alt={`${user.firstName} ${user.lastName}`}
						className="w-full h-full object-cover"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = 'none';
							(e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(user.firstName, user.lastName);
							(e.target as HTMLImageElement).parentElement!.classList.add('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'font-black', 'text-white');
						}}
					/>
				) : (
					<span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
						{getInitials(user.firstName, user.lastName)}
					</span>
				)}
			</div>
			<div className={`absolute -bottom-2 -right-2 p-1.5 sm:p-2 rounded-xl border-2 border-white ${user.verified ? 'bg-green-500' : 'bg-red-500'}`}>
				{user.verified ? <AiOutlineCheckCircle className="text-white" size={16} /> : <AiOutlineCloseCircle className="text-white" size={16} />}
			</div>
		</div>
	);
};

export default ProfileAvatar;