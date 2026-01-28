import React, { useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
	AiOutlineLogout, AiOutlineDashboard, AiOutlineSetting,
	AiOutlineTeam, AiOutlineGlobal, AiOutlineDollar,
} from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { THEME } from "../../styles/theme";
import Alert from "../shared/Alert";
import Button from "../shared/Button";

const sidebarLinks = [
	{ title: "Dashboard", path: "/dashboard", icon: AiOutlineDashboard },
	{ title: "Membres", path: "/membres", icon: AiOutlineTeam },
	{ title: "Cotisations", path: "/cotisations", icon: AiOutlineDollar }
];

const Sidebar: React.FC = () => {
	const { logout, isSuperAdmin } = useAuth();
	const navigate = useNavigate();
	const [openLogout, setOpenLogout] = useState(false);

	const activeClass = "bg-brand-primary/10 text-brand-primary border-brand-primary border-b-4 shadow-sm";
	const inactiveClass = "border-transparent text-brand-muted hover:bg-brand-bg hover:translate-x-1";

	return (
		<>
			<aside className="hidden lg:flex w-72 h-screen bg-white dark:bg-brand-border-dark border-r-2 border-brand-border flex-col sticky top-0 overflow-hidden">
				<div className="p-8 flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center border-b-4 border-black/20 shadow-lg rotate-3">
						<AiOutlineGlobal size={26} />
					</div>
					<div>
						<p className={`${THEME.font.black} leading-tight`}>Fizanakara</p>
						<span className="text-[9px] font-black uppercase text-brand-primary tracking-widest">
							{isSuperAdmin ? "Super Admin" : "Administrateur"}
						</span>
					</div>
				</div>

				<nav className="flex-1 px-4 space-y-2 mt-4">
					{sidebarLinks.map((link) => (
						<NavLink
							key={link.path}
							to={link.path}
							className={({ isActive }) =>
								`flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 transition-all duration-200 ${isActive ? activeClass : inactiveClass}`
							}
						>
							<link.icon size={20} />
							<span className="text-[11px] font-black uppercase tracking-wider">{link.title}</span>
						</NavLink>
					))}

					{isSuperAdmin && (
						<NavLink
							to="/management"
							className={({ isActive }) =>
								`flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 mt-8 transition-all duration-200 ${isActive ? "bg-amber-50 text-amber-600 border-amber-500 border-b-4" : "border-transparent text-brand-muted hover:bg-amber-50/50 hover:text-amber-600 hover:translate-x-1"}`
							}
						>
							<AiOutlineSetting size={20} />
							<span className="text-[11px] font-black uppercase tracking-wider">Système</span>
						</NavLink>
					)}
				</nav>

				{/* Desktop Logout Button */}
				<div className="p-6 border-t-2 border-brand-border bg-brand-bg/10 dark:bg-brand-bg/5">
					<Button
						variant="secondary"
						onClick={() => setOpenLogout(true)}
						className="w-full flex items-center justify-center gap-2 py-4 text-[10px] border-brand-border!"
					>
						<AiOutlineLogout size={18} className="text-red-500" />
						<span className="text-brand-text">DÉCONNEXION</span>
					</Button>
				</div>
			</aside>

			{/* 📱 MOBILE NAVIGATION BAR */}
			<nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-brand-border-dark border-t-4 border-brand-border h-20 px-4 flex items-center justify-around z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
				{sidebarLinks.map((link) => (
					<NavLink
						key={link.path}
						to={link.path}
						className={({ isActive }) =>
							`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${isActive ? "text-brand-primary bg-brand-primary/5 scale-110" : "text-brand-muted"}`
						}
					>
						<link.icon size={22} />
						<span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{link.title}</span>
					</NavLink>
				))}

				<Button
					variant="secondary"
					onClick={() => setOpenLogout(true)}
					className="p-0! w-14! h-14! rounded-xl! flex flex-col items-center justify-center border-red-100! text-red-500 hover:bg-red-50 active:translate-y-1 shadow-none"
				>
					<AiOutlineLogout size={20} />
					<span className="text-[7px] font-black uppercase mt-0.5 leading-none">Quitter</span>
				</Button>
			</nav>
			<Alert
				isOpen={openLogout}
				variant="danger"
				title="Déconnexion"
				message="Toutes les sessions actives seront fermées. Souhaitez-vous continuer ?"
				confirmText="Oui, me déconnecter"
				onClose={() => setOpenLogout(false)}
				onConfirm={() => {
					setOpenLogout(false);
					logout();
					navigate("/login");
				}}
			/>
		</>
	);
};

export default memo(Sidebar);