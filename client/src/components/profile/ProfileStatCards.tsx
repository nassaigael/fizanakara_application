import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineCheckCircle, AiOutlineCrown } from 'react-icons/ai';

const ProfileStatCards: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    const getStatusStyle = () => {
        if (user.verified) {
            return {
                bg: 'bg-green-100',
                text: 'text-green-700',
                icon: 'text-green-600',
                border: 'border-green-200'
            };
        }
        return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            icon: 'text-orange-600',
            border: 'border-orange-200'
        };
    };

    const getRoleStyle = () => {
        if (user.role === 'SUPERADMIN') {
            return {
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: 'text-red-600',
                border: 'border-red-200'
            };
        }
        return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            icon: 'text-blue-600',
            border: 'border-blue-200'
        };
    };

    const statusStyle = getStatusStyle();
    const roleStyle = getRoleStyle();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Carte Compte */}
            <div className={`bg-white border ${statusStyle.border} rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Compte</p>
                        <p className={`font-bold text-xs mt-1 ${statusStyle.text}`}>
                            {user.verified ? "Vérifié" : "Non vérifié"}
                        </p>
                    </div>
                    <div className={`w-7 h-7 rounded-full ${statusStyle.bg} flex items-center justify-center`}>
                        <AiOutlineCheckCircle size={14} className={statusStyle.icon} />
                    </div>
                </div>
            </div>

            {/* Carte Rôle */}
            <div className={`bg-white border ${roleStyle.border} rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Rôle</p>
                        <p className={`font-bold text-xs mt-1 ${roleStyle.text}`}>
                            {user.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
                        </p>
                    </div>
                    <div className={`w-7 h-7 rounded-full ${roleStyle.bg} flex items-center justify-center`}>
                        <AiOutlineCrown size={14} className={roleStyle.icon} />
                    </div>
                </div>
            </div>

            {/* Carte Statut */}
            <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Statut</p>
                        <p className="font-bold text-xs mt-1 text-green-600">Actif</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                        <AiOutlineCheckCircle size={14} className="text-green-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileStatCards;