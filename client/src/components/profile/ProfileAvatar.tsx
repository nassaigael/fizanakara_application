import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Avatar } from '../../components/ui/Avatar';

const ProfileAvatar: React.FC = () => {
	const { user } = useAuth();
	if (!user) return null;

	return (
		<div className="relative group shrink-0">
			<Avatar
				imageUrl={user?.imageUrl}
				firstName={user?.firstName}
				lastName={user?.lastName}
				category="admin"
				size="xl"
				shape="rounded"
				className="w-40 h-40 md:w-48 md:h-48 border-4 border-white shadow-xl"
			/>
			<div className="absolute -bottom-2 -right-2 p-1.5 sm:p-2 rounded-xl border-2 border-white bg-[#E51A1A]">
				<AiOutlineCheckCircle className="text-white" size={16} />
			</div>
		</div>
	);
};

export default ProfileAvatar;