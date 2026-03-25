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
            bg: 'from-blue-50 to-cyan-50',
            border: 'border-blue-200 hover:border-blue-500',
            badge: 'bg-blue-100 text-blue-600 border-blue-300',
            icon: 'bg-blue-100',
            text: 'text-blue-600',
            editHover: 'hover:bg-blue-100 hover:text-blue-600',
            deleteHover: 'hover:bg-red-100 hover:text-red-600'
        },
        purple: {
            bg: 'from-purple-50 to-pink-50',
            border: 'border-purple-200 hover:border-purple-500',
            badge: 'bg-purple-100 text-purple-600 border-purple-300',
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
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-20">
                <div className={`w-20 h-20 ${colors.icon} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
                    {icon}
                </div>
                <p className="font-black text-gray-400 mb-2">No {title.toLowerCase()}</p>
                <p className="text-sm text-gray-500">Create your first {title === 'Districts' ? 'zone' : 'entity'}</p>
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
                    className={`group relative overflow-hidden rounded-2xl border-2 p-5 bg-linear-to-br ${colors.bg} ${colors.border} transition-all hover:shadow-lg hover:scale-105 cursor-pointer`}
                >
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`p-3 ${colors.icon} ${colors.text} rounded-xl`}>
                                {icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-sm uppercase text-brand-text">{item.name}</p>
                                <p className="text-xs text-brand-muted mt-1">ID: {item.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => handleEditClick(e, item.id!, item.name)}
                                className={`p-2 rounded-lg transition-all shadow-md ${colors.editHover} text-gray-500 hover:scale-110`}
                                title="Edit"
                            >
                                <AiOutlineEdit size={18} />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(e, item.id!)}
                                className={`p-2 rounded-lg transition-all shadow-md ${colors.deleteHover} text-gray-500 hover:scale-110`}
                                title="Delete"
                            >
                                <AiOutlineDelete size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-white/20 to-transparent rounded-bl-full pointer-events-none"></div>
                </div>
            ))}
        </div>
    );
};

export default LocationTab;