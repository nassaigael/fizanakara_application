import React from 'react';
import { AiOutlineUser, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete, AiOutlineMail, AiOutlinePhone } from 'react-icons/ai';
import { AdminResponse } from '../../../lib/types';
import Avatar from '../../../components/ui/Avatar';

interface AdminsTabProps {
    admins: AdminResponse[] | undefined;
    isLoading: boolean;
    onDelete: (id: string) => void;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ admins, isLoading, onDelete }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!admins || admins.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AiOutlineUser size={40} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-500 mb-2">Aucun administrateur</p>
                <p className="text-sm text-gray-400">Commencez par créer un nouvel administrateur</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase text-gray-500">Administrateur</th>
                        <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase text-gray-500">Email</th>
                        <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase text-gray-500">Téléphone</th>
                        <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase text-gray-500">Rôle</th>
                        <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase text-gray-500">Statut</th>
                        <th className="py-3 px-4 text-right text-[10px] font-semibold uppercase text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {admins.map((admin: AdminResponse) => (
                        <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
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
                                        <p className="text-[9px] text-gray-400 font-mono">
                                            {admin.id}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                    <AiOutlineMail size={12} className="text-gray-400" />
                                    <p className="text-xs text-gray-600">{admin.email}</p>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                    <AiOutlinePhone size={12} className="text-gray-400" />
                                    <p className="text-xs text-gray-600">{admin.phoneNumber || '-'}</p>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium ${
                                    admin.role === 'SUPERADMIN'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-red-50 text-red-600'
                                }`}>
                                    {admin.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                    {admin.verified ? (
                                        <>
                                            <AiOutlineCheckCircle className="text-red-500" size={14} />
                                            <span className="text-[10px] font-medium text-red-600">Vérifié</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineCloseCircle className="text-red-300" size={14} />
                                            <span className="text-[10px] font-medium text-red-400">Non vérifié</span>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    onClick={() => onDelete(admin.id)}
                                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
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
    );
};

export default AdminsTab;