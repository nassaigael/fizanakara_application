import React, { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
    AiOutlineCalendar, 
    AiOutlineMenuUnfold,
    AiOutlineBell,
    AiOutlineCheckCircle,
    AiOutlineUserAdd,
    AiOutlineDollar,
    AiOutlineEdit,
    AiOutlineDelete
} from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../lib/constant/constant";

interface NavbarProps {
    onMenuClick?: () => void;
}

// Type pour une notification
interface Notification {
    id: string;
    type: 'member_add' | 'member_update' | 'member_delete' | 'payment_add' | 'contribution_generate' | 'admin_update' | 'system';
    message: string;
    createdAt: string;
    read: boolean;
    actor?: string; // nom de l'admin qui a fait l'action
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const { user, isSuperAdmin } = useAuth();
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        // Données mockées pour exemple
        {
            id: '1',
            type: 'member_add',
            message: 'Jean Dupont a été ajouté',
            createdAt: '2025-02-18T10:30:00Z',
            read: false,
            actor: 'Admin 1'
        },
        {
            id: '2',
            type: 'payment_add',
            message: 'Paiement de 5000 Ar pour Marie Curie',
            createdAt: '2025-02-18T09:15:00Z',
            read: false,
            actor: 'Admin 2'
        },
        {
            id: '3',
            type: 'contribution_generate',
            message: 'Cotisations 2025 générées',
            createdAt: '2025-02-17T14:20:00Z',
            read: true,
            actor: 'Super Admin'
        }
    ]);

    const today = useMemo(() =>
        new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }), []
    );

    const imageSrc = getImageUrl(user?.imageUrl, user?.firstName, 'admin');

    // Calculer le nombre de notifications non lues
    const unreadCount = notifications.filter(n => !n.read).length;

    // Marquer comme lues
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    // Fonction pour obtenir l'icône selon le type
    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'member_add': return <AiOutlineUserAdd className="text-green-500" size={18} />;
            case 'member_update': return <AiOutlineEdit className="text-blue-500" size={18} />;
            case 'member_delete': return <AiOutlineDelete className="text-red-500" size={18} />;
            case 'payment_add': return <AiOutlineDollar className="text-green-600" size={18} />;
            case 'contribution_generate': return <AiOutlineCheckCircle className="text-purple-500" size={18} />;
            default: return <AiOutlineBell className="text-gray-500" size={18} />;
        }
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b-2 border-gray-100 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-30">
            {/* Partie gauche : menu burger et titre */}
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

            {/* Partie droite : notifications + profil */}
            <div className="flex items-center gap-3">
                {/* Icône de notification */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 bg-gray-50 rounded-xl border-2 border-gray-200 border-b-4 hover:bg-gray-100 transition-all"
                    >
                        <AiOutlineBell size={22} className="text-gray-600" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown des notifications */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border-2 border-gray-200 border-b-8 shadow-xl z-50 overflow-hidden">
                            <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center">
                                <h3 className="font-black text-sm uppercase tracking-wider">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[9px] font-black text-brand-primary uppercase tracking-wider hover:underline"
                                    >
                                        Tout marquer lu
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 font-black text-[10px] uppercase">
                                        Aucune notification
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`p-4 border-b-2 border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0">
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-[11px] text-gray-800">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-[8px] font-bold text-gray-400 uppercase">
                                                        <span>{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                                                        {notif.actor && <span>• {notif.actor}</span>}
                                                    </div>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 border-t-2 border-gray-100 text-center">
                                <Link
                                    to="/admin/notifications"
                                    className="text-[9px] font-black text-brand-primary uppercase tracking-wider hover:underline"
                                >
                                    Voir tout
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lien vers le profil */}
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

                    <div className="w-11 h-11 rounded-xl border-2 border-gray-200 border-b-4 bg-white flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-sm relative">
                        {!imgLoaded && !imgError && (
                            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                                <span className="text-[8px] font-black text-gray-400">...</span>
                            </div>
                        )}
                        {!imgError ? (
                            <img
                                src={imageSrc}
                                alt="avatar admin"
                                className="w-full h-full object-cover"
                                onLoad={() => setImgLoaded(true)}
                                onError={() => {
                                    setImgError(true);
                                    setImgLoaded(false);
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#FF4B4B] text-white font-black text-sm">
                                {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default memo(Navbar);