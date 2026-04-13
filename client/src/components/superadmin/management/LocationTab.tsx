import React from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { District, Tribute } from '../../../lib/types';

interface LocationTabProps {
    items: (District | Tribute)[] | undefined;
    isLoading: boolean;
    title: string;
    icon: React.ReactNode;
    onDelete: (id: number) => void;
    onEdit: (id: number, name: string) => void;
}

const LocationTab: React.FC<LocationTabProps> = ({
    items,
    isLoading,
    title,
    icon,
    onDelete,
    onEdit
}) => {
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
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-red-500 text-2xl">{icon}</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="group bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                {icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">{item.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => handleEditClick(e, item.id!, item.name)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Modifier"
                            >
                                <AiOutlineEdit size={14} />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(e, item.id!)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Supprimer"
                            >
                                <AiOutlineDelete size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LocationTab;