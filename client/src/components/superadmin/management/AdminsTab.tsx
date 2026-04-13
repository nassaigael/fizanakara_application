import React from 'react';
import { AdminResponse } from '../../../lib/types';
import Avatar from '../../../components/ui/Avatar';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete } from 'react-icons/ai';

interface AdminsTabProps {
    admins: AdminResponse[] | undefined;
    isLoading: boolean;
    onDelete: (id: string) => void;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ admins, isLoading, onDelete }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!admins || admins.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AiOutlineUser size={32} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-500 text-sm mb-1">Aucun administrateur</p>
                <p className="text-xs text-gray-400">Commencez par créer un nouvel administrateur</p>
            </div>
        );
    }

    return (
        <>
            {/* Version Desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Administrateur</th>
                            <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Email</th>
                            <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Téléphone</th>
                            <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Rôle</th>
                            <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Statut</th>
                            <th className="py-3 px-4 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.map((admin: AdminResponse) => (
                            <tr 
                                key={admin.id} 
                                className="group hover:bg-red-50/30 transition-colors duration-150"
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            imageUrl={admin.imageUrl}
                                            firstName={admin.firstName}
                                            lastName={admin.lastName}
                                            category="admin"
                                            size="md"
                                            shape="circle"
                                        />
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">
                                                {admin.firstName} {admin.lastName}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                                                {admin.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                        <AiOutlineMail size={12} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                        <p className="text-xs text-gray-600 truncate max-w-45">{admin.email}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                        <AiOutlinePhone size={12} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                        <p className="text-xs text-gray-600">{admin.phoneNumber || '—'}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-medium ${
                                        admin.role === 'SUPERADMIN'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {admin.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                        {admin.verified ? (
                                            <>
                                                <AiOutlineCheckCircle size={13} className="text-red-500" />
                                                <span className="text-[10px] font-medium text-red-600">Vérifié</span>
                                            </>
                                        ) : (
                                            <>
                                                <AiOutlineCloseCircle size={13} className="text-gray-400" />
                                                <span className="text-[10px] font-medium text-gray-500">Non vérifié</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => onDelete(admin.id)}
                                        className="p-1.5 rounded-md transition-all duration-200 hover:bg-red-50 text-gray-400 hover:text-red-600"
                                        title="Supprimer"
                                    >
                                        <AiOutlineDelete size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Version Mobile - Cartes */}
            <div className="md:hidden space-y-3">
                {admins.map((admin: AdminResponse) => (
                    <div
                        key={admin.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-200 transition-all"
                    >
                        {/* Barre d'accentuation */}
                        <div className="h-0.5 bg-red-500 rounded-t-lg -mt-4 mb-3 w-12" />
                        
                        {/* En-tête avec Avatar et Nom */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    imageUrl={admin.imageUrl}
                                    firstName={admin.firstName}
                                    lastName={admin.lastName}
                                    category="admin"
                                    size="md"
                                    shape="circle"
                                />
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">
                                        {admin.firstName} {admin.lastName}
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-mono">
                                        {admin.id.slice(-8)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onDelete(admin.id)}
                                className="p-2 rounded-md transition-all duration-200 hover:bg-red-50 text-gray-400 hover:text-red-600"
                                title="Supprimer"
                            >
                                <AiOutlineDelete size={18} />
                            </button>
                        </div>

                        {/* Informations */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            {/* Email */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AiOutlineMail size={12} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-500">Email</span>
                                </div>
                                <p className="text-xs text-gray-700 truncate max-w-[60%]">{admin.email}</p>
                            </div>

                            {/* Téléphone */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AiOutlinePhone size={12} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-500">Téléphone</span>
                                </div>
                                <p className="text-xs text-gray-700">{admin.phoneNumber || '—'}</p>
                            </div>

                            {/* Rôle */}
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500">Rôle</span>
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-medium ${
                                    admin.role === 'SUPERADMIN'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {admin.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                                </span>
                            </div>

                            {/* Statut */}
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500">Statut</span>
                                <div className="flex items-center gap-1.5">
                                    {admin.verified ? (
                                        <>
                                            <AiOutlineCheckCircle size={12} className="text-red-500" />
                                            <span className="text-[10px] font-medium text-red-600">Vérifié</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineCloseCircle size={12} className="text-gray-400" />
                                            <span className="text-[10px] font-medium text-gray-500">Non vérifié</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AdminsTab;