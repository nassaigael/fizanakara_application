import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { AiOutlineCalendar, AiOutlineMenuUnfold } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../lib/constant/constant";

interface NavbarProps {
	onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
	const { user, isSuperAdmin } = useAuth();

	const today = useMemo(() =>
		new Date().toLocaleDateString("fr-FR", {
			weekday: "long",
			day: "numeric",
			month: "long",
		}), []
	);

	return (
		<header className="h-20 bg-white/80 backdrop-blur-md border-b-2 border-gray-100 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-30">
			<div className="flex items-center gap-4">
				<button
					onClick={onMenuClick}
					className="lg:hidden p-3 bg-gray-50 rounded-xl border-2 border-gray-200 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all text-[#FF4B4B]"
				>
					<AiOutlineMenuUnfold size={20} />
				</button>

				<div className="hidden sm:block">
					<h2 className="font-black text-lg">
						Fizanakara <span className="text-[#FF4B4B] italic">Manager</span>
					</h2>
					<div className="flex items-center gap-2 text-gray-500">
						<AiOutlineCalendar size={12} className="text-[#FF4B4B]" />
						<span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{today}</span>
					</div>
				</div>
			</div>
			<Link
				to="/admin/profile"
				className="flex items-center gap-4 group bg-gray-50 p-1.5 pr-4 rounded-2xl border border-transparent hover:border-gray-200 transition-all"
			>
				<div className="text-right hidden xs:block">
					<p className="text-[11px] font-black text-gray-800 leading-none uppercase">
						{user?.firstName || "Utilisateur"}
					</p>
					<span className="text-[8px] font-bold uppercase text-[#FF4B4B] tracking-tighter">
						{isSuperAdmin ? "Super Admin" : "Gestionnaire"}
					</span>
				</div>

				<div className="w-11 h-11 rounded-xl border-2 border-gray-200 border-b-4 bg-white flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
					<img
						src={getImageUrl(user?.imageUrl, user?.firstName, 'admin')}
						alt="avatar admin"
						className="w-full h-full object-cover"
						onError={(e) => {
							(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user?.firstName}&background=FF4B4B&color=fff`;
						}}
					/>
				</div>
			</Link>
		</header>
	);
};

export default memo(Navbar);