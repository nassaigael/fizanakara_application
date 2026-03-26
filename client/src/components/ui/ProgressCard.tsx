import React from 'react';
import { AiOutlineRise } from 'react-icons/ai';
import { formatCurrency } from '../../lib/helper';

interface ProgressCardProps {
    progress: number;
    current: number;
    total: number;
    title: string;
    subtitle: string;
    className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    progress,
    current,
    total,
    title,
    subtitle,
    className = "",
}) => {
    return (
        <div className={`
            bg-white rounded-2xl sm:rounded-3xl 
            p-4 sm:p-6 md:p-8 
            border-3 border-gray-200 
            shadow-lg hover:shadow-xl 
            transition-shadow 
            ${className}
        `}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
                <div>
                    <h3 className="font-black text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                        <AiOutlineRise className="text-brand-primary" size={20} />
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-semibold">{subtitle}</p>
                </div>
                
                <div className="w-full sm:w-auto text-right bg-linear-to-br from-red-50 to-orange-50 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl border-2 border-red-200">
                    <p className="text-2xl sm:text-3xl font-black bg-linear-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        {Math.round(progress)}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 font-bold mt-1">
                        {formatCurrency(current)} / {formatCurrency(total)}
                    </p>
                </div>
            </div>

            <div className="relative w-full bg-gray-200 rounded-full h-6 sm:h-8 overflow-hidden shadow-inner">
                <div
                    className="h-full rounded-full bg-linear-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                </div>
                
                {progress > 10 && (
                    <div
                        className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 hidden sm:block"
                        style={{ left: `${Math.min(progress - 5, 92)}%` }}
                    >
                        <div className="bg-white px-2 sm:px-3 py-1 rounded-full shadow-lg border-2 border-orange-400">
                            <span className="text-[10px] sm:text-xs font-black text-orange-600">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-3 text-[10px] sm:text-xs font-bold">
                <span className="text-gray-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full" />
                    Début
                </span>
                <span className="text-green-600 flex items-center gap-1">
                    Objectif
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
                </span>
            </div>
        </div>
    );
};