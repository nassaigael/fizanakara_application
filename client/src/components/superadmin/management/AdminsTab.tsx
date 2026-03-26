import React from 'react';
import { AiOutlineUser, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete } from 'react-icons/ai';
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
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!admins || admins.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <AiOutlineUser size={40} className="text-gray-300" />
                </div>
                <p className="font-black text-gray-400 mb-2">No administrators</p>
                <p className="text-sm text-gray-500">Start by creating a new administrator</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-brand-border">
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Administrator</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Email</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Phone</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Role</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Status</th>
                        <th className="py-4 px-6 text-right text-xs font-black uppercase text-brand-muted">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {admins.map((admin: AdminResponse) => (
                        <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-border flex items-center justify-center bg-linear-to-br from-brand-primary to-orange-500 shadow-md">
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
                                            <span className="text-white font-black text-sm uppercase">
                                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-brand-text truncate max-w-37.5 uppercase">
                                            {admin.firstName} {admin.lastName}
                                        </p>
                                        <p className="text-[10px] font-bold text-brand-muted tracking-tighter">
                                            {admin.id}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <p className="font-bold text-xs text-brand-text">{admin.email}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="font-bold text-xs text-brand-text">{admin.phoneNumber || '-'}</p>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
                                    admin.role === 'SUPERADMIN'
                                        ? 'bg-purple-100 text-purple-600 border-purple-300'
                                        : 'bg-blue-100 text-blue-600 border-blue-300'
                                }`}>
                                    {admin.role}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    {admin.verified ? (
                                        <>
                                            <AiOutlineCheckCircle className="text-green-600" size={18} />
                                            <span className="text-xs font-black text-green-600">Verified</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineCloseCircle className="text-orange-600" size={18} />
                                            <span className="text-xs font-black text-orange-600">Unverified</span>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button
                                    onClick={() => onDelete(admin.id)}
                                    className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors transform hover:scale-110"
                                    title="Delete"
                                >
                                    <AiOutlineDelete size={20} />
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
