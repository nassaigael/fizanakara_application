import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { AiOutlineCalendar, AiOutlineUser, AiOutlineMenuUnfold } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { THEME } from "../../styles/theme";

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
		<header className="h-20 bg-white/80 dark:bg-brand-border-dark/80 backdrop-blur-md border-b-2 border-brand-border px-4 lg:px-10 flex items-center justify-between sticky top-0 z-30">
			<div className="flex items-center gap-4">
				<button
					onClick={onMenuClick}
					className="lg:hidden p-3 bg-brand-bg dark:bg-brand-bg/10 rounded-xl border-2 border-brand-border border-b-4 active:border-b-2 active:translate-y-0.5 transition-all text-brand-primary"
				>
					<AiOutlineMenuUnfold size={20} />
				</button>

				<div className="hidden sm:block">
					<h2 className={`${THEME.font.black} text-lg`}>
						Fizanakara <span className="text-brand-primary italic">Manager</span>
					</h2>
					<div className="flex items-center gap-2 text-brand-muted">
						<AiOutlineCalendar size={12} className="text-brand-primary" />
						<span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{today}</span>
					</div>
				</div>
			</div>

			<Link to="/profile" className="flex items-center gap-4 group bg-brand-bg/40 dark:bg-brand-bg/5 p-1.5 pr-4 rounded-2xl border border-transparent hover:border-brand-border transition-all">
				<div className="text-right hidden xs:block">
					<p className="text-[11px] font-black text-brand-text leading-none uppercase">{user?.firstName || "Utilisateur"}</p>
					<span className="text-[8px] font-bold uppercase text-brand-primary tracking-tighter">
						{isSuperAdmin ? "Super Admin" : "Gestionnaire"}
					</span>
				</div>
				<div className="w-11 h-11 rounded-xl border-2 border-brand-border border-b-4 bg-white dark:bg-brand-border-dark flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
					{user?.imageUrl ? (
						<img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
					) : (
						<AiOutlineUser size={22} className="text-brand-primary" />
					)}
				</div>
			</Link>
		</header>
	);
};

export default memo(Navbar);