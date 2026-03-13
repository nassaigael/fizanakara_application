import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    gradient: string;
    onClick?: () => void;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    title,
    value,
    subtitle,
    icon,
    gradient,
    onClick,
    className = "",
}) => {
    return (
        <div 
            onClick={onClick}
            className={`
                group bg-white rounded-2xl sm:rounded-3xl 
                p-4 sm:p-6 
                border-3 border-gray-200 
                shadow-lg hover:shadow-xl 
                transition-all cursor-pointer
                ${className}
            `}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 truncate">
                        {value}
                    </p>
                    <p className="text-sm font-bold text-gray-700 truncate">{title}</p>
                </div>
                
                <div className={`
                    p-3 sm:p-4 
                    rounded-xl sm:rounded-2xl 
                    bg-gradient-to-br ${gradient} 
                    shadow-lg group-hover:scale-110 transition-transform
                    shrink-0
                `}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                <p className="text-xs text-gray-600 font-bold truncate">{subtitle}</p>
            </div>
        </div>
    );
};