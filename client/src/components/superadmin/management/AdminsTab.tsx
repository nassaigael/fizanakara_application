import React from 'react';
import { AiOutlineUser, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete, AiOutlineMail, AiOutlinePhone } from 'react-icons/ai';
import { AdminResponse } from '../../../lib/types';
import { getImageUrl } from '../../../lib/constant/constant';

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
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-red-600 shadow-sm">
                                        {admin.imageUrl ? (
                                            <img
                                                src={getImageUrl(admin.imageUrl, 'admin')}
                                                alt={`${admin.firstName} ${admin.lastName}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = ''; 
                                                    (e.target as HTMLImageElement).onerror = null;
                                                }}
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-sm uppercase">
                                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                                            </span>
                                        )}
                                    </div>
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
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {admin.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                    {admin.verified ? (
                                        <>
                                            <AiOutlineCheckCircle className="text-green-600" size={14} />
                                            <span className="text-[10px] font-medium text-green-600">Vérifié</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineCloseCircle className="text-orange-600" size={14} />
                                            <span className="text-[10px] font-medium text-orange-600">Non vérifié</span>
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