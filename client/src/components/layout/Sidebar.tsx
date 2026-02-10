import React, { useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineLogout, AiOutlineGlobal, AiOutlineSetting } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { SIDEBAR_LINKS, THEME } from "../../lib/constant/constant";
import Alert from "../ui/Alert";
import Button from "../ui/Button";

const Sidebar: React.FC = () => {
	const { logout, isSuperAdmin } = useAuth();
	const navigate = useNavigate();
	const [openLogout, setOpenLogout] = useState(false);

	const activeClass = `bg-[${THEME.colors.primary}]/10 text-[${THEME.colors.primary}] border-[${THEME.colors.primary}] border-b-4 shadow-sm`;
	const inactiveClass = "border-transparent text-gray-500 hover:bg-gray-50 hover:translate-x-1";

	return (
		<>
			<aside className="hidden lg:flex w-72 h-screen bg-white border-r-2 border-gray-100 flex-col sticky top-0 overflow-hidden">
				<div className="p-8 flex items-center gap-4">
					<div className={`w-12 h-12 rounded-2xl bg-[${THEME.colors.primary}] text-white flex items-center justify-center border-b-4 border-black/20 shadow-lg rotate-3`}>
						<AiOutlineGlobal size={26} />
					</div>
					<div>
						<p className="font-black text-xl leading-tight">Fizanakara</p>
						<span className={`text-[9px] font-black uppercase text-[${THEME.colors.primary}] tracking-widest`}>
							{isSuperAdmin ? "Super Admin" : "Administrateur"}
						</span>
					</div>
				</div>

				<nav className="flex-1 px-4 space-y-2 mt-4">
					{SIDEBAR_LINKS.map((link) => (
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
							to="/admin/management"
							className={({ isActive }) =>
								`flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 mt-8 transition-all duration-200 ${isActive
									? "bg-amber-50 text-amber-600 border-amber-500 border-b-4"
									: "border-transparent text-gray-500 hover:bg-amber-50/50 hover:text-amber-600 hover:translate-x-1"
								}`
							}
						>
							<AiOutlineSetting size={20} />
							<span className="text-[11px] font-black uppercase tracking-wider">Système</span>
						</NavLink>
					)}
				</nav>

				<div className="p-6 border-t-2 border-gray-100 bg-gray-50/50">
					<Button
						variant="secondary"
						onClick={() => setOpenLogout(true)}
						className="w-full flex items-center justify-center gap-2 py-4 text-[10px]"
					>
						<AiOutlineLogout size={18} className="text-red-500" />
						<span className="font-bold">DÉCONNEXION</span>
					</Button>
				</div>
			</aside>
			<nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-100 h-20 px-4 flex items-center justify-around z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
				{SIDEBAR_LINKS.map((link) => (
					<NavLink
						key={link.path}
						to={link.path}
						className={({ isActive }) =>
							`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${isActive
								? `text-[${THEME.colors.primary}] bg-[${THEME.colors.primary}]/5 scale-110`
								: "text-gray-400"
							}`
						}
					>
						<link.icon size={22} />
						<span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{link.title}</span>
					</NavLink>
				))}

				<button
					onClick={() => setOpenLogout(true)}
					className="flex flex-col items-center justify-center w-16 h-16 text-red-500"
				>
					<AiOutlineLogout size={20} />
					<span className="text-[8px] font-black uppercase mt-1">Quitter</span>
				</button>
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