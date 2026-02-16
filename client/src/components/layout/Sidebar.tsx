import React, { useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
    AiOutlineLogout, 
    AiOutlineGlobal, 
    AiOutlineSetting, 

} from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { SIDEBAR_LINKS } from "../../lib/constant/constant";
import Alert from "../ui/Alert";
import Button from "../ui/Button";

const Sidebar: React.FC = () => {
    const { logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [openLogout, setOpenLogout] = useState(false);

    const activeClass = "bg-brand-primary/10 text-brand-primary border-brand-primary border-b-4 shadow-sm";
    const inactiveClass = "border-transparent text-gray-400 hover:bg-gray-50 hover:text-brand-text hover:translate-x-1";

    return (
        <>
            <aside className="hidden lg:flex w-72 h-screen bg-white border-r-2 border-brand-border flex-col sticky top-0 overflow-hidden">
                <div className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center border-b-4 border-brand-primary-dark shadow-lg rotate-3">
                        <AiOutlineGlobal size={26} />
                    </div>
                    <div>
                        <p className="font-black text-xl leading-tight text-brand-text">Fizanakara</p>
                        <span className="text-[9px] font-black uppercase text-brand-primary tracking-widest">
                            {isSuperAdmin ? "Super Admin" : "Administrateur"}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
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
                        to="/management"
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-5 py-3 rounded-xl border-2 mt-6 transition-all
                            ${isActive ? "bg-amber-50 text-amber-600 border-amber-500 border-b-4" : "border-transparent text-brand-muted hover:bg-brand-bg"}`
                        }
                        >
                        <AiOutlineSetting size={20} />
                        <span className='text-[11px] font-black uppercase tracking-wider'>Système</span>
                        </NavLink>
                    )}
                </nav>

                <div className="p-6 border-t-2 border-brand-border bg-brand-bg/50">
                    <Button
                        variant="secondary"
                        onClick={() => setOpenLogout(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 text-[10px]"
                    >
                        <AiOutlineLogout size={18} className="text-red-500" />
                        <span className="text-[8px] font-black uppercase mt-1">Quiter</span>
                    </Button>
                </div>
            </aside>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-brand-border h-20 px-2 flex items-center justify-around z-50 shadow-2xl">
                {SIDEBAR_LINKS.slice(0, 3).map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-all ${isActive ? "text-brand-primary bg-brand-primary/5 scale-105" : "text-gray-400"}`
                        }
                    >
                        <link.icon size={22} />
                        <span className="text-[8px] font-black uppercase mt-1">{link.title.split(' ')[0]}</span>
                    </NavLink>
                ))}

                {isSuperAdmin && (
                    <NavLink
                        to="/admin/management" 
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-1 h-16 rounded-xl ${isActive ? "text-amber-600 bg-amber-50" : "text-gray-400"}`
                        }
                    >
                        <AiOutlineSetting size={22} />
                        <span className="text-[8px] font-black uppercase mt-1">SuperAdmin</span>
                    </NavLink>
                )}

                <button onClick={() => setOpenLogout(true)} className="flex flex-col items-center justify-center flex-1 h-16 text-red-500">
                    <AiOutlineLogout size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">Quitter</span>
                </button>
            </nav>

            <Alert
                isOpen={openLogout}
                variant="danger"
                title="Déconnexion"
                message="Souhaitez-vous vraiment quitter l'application ?"
                confirmText="Déconnexion"
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