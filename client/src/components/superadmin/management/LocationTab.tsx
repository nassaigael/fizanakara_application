import React from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { District, Tribute } from '../../../lib/types';

interface LocationTabProps {
    items: (District | Tribute)[] | undefined;
    isLoading: boolean;
    title: string;
    icon: React.ReactNode;
    color: 'blue' | 'purple';
    onDelete: (id: number) => void;
    onEdit: (id: number, name: string) => void;
}

const LocationTab: React.FC<LocationTabProps> = ({
    items,
    isLoading,
    title,
    icon,
    color,
    onDelete,
    onEdit
}) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200 hover:border-blue-400',
            badge: 'bg-blue-100 text-blue-700',
            icon: 'bg-blue-100',
            text: 'text-blue-600',
            editHover: 'hover:bg-blue-100 hover:text-blue-600',
            deleteHover: 'hover:bg-red-100 hover:text-red-600'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200 hover:border-purple-400',
            badge: 'bg-purple-100 text-purple-700',
            icon: 'bg-purple-100',
            text: 'text-purple-600',
            editHover: 'hover:bg-purple-100 hover:text-purple-600',
            deleteHover: 'hover:bg-red-100 hover:text-red-600'
        }
    };

    const colors = colorClasses[color];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-20">
                <div className={`w-20 h-20 ${colors.icon} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {icon}
                </div>
                <p className="font-medium text-gray-500 mb-2">Aucun {title.toLowerCase()}</p>
                <p className="text-sm text-gray-400">Créez votre premier {title === 'Districts' ? 'district' : 'tribut'}</p>
            </div>
        );
    }

    const handleEditClick = (e: React.MouseEvent, id: number, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(id, name);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`group relative overflow-hidden rounded-lg border ${colors.bg} ${colors.border} transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
                >
                    <div className="flex items-start justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2.5 rounded-lg ${colors.icon} ${colors.text}`}>
                                {icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">ID: {item.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => handleEditClick(e, item.id!, item.name)}
                                className={`p-2 rounded-md transition-all ${colors.editHover} text-gray-400 hover:scale-105`}
                                title="Modifier"
                            >
                                <AiOutlineEdit size={16} />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(e, item.id!)}
                                className={`p-2 rounded-md transition-all ${colors.deleteHover} text-gray-400 hover:scale-105`}
                                title="Supprimer"
                            >
                                <AiOutlineDelete size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LocationTab;