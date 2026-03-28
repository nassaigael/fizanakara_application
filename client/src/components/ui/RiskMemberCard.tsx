import React from 'react';
import { AiOutlineTeam, AiOutlineArrowRight } from 'react-icons/ai';
import { formatCurrency } from '../../lib/helper';

interface RiskMemberCardProps {
    index: number;
    name: string;
    amount: number;
    remaining: number;
    isOverdue?: boolean;
    onClick?: () => void;
    className?: string;
}

export const RiskMemberCard: React.FC<RiskMemberCardProps> = ({
    index,
    name,
    amount,
    remaining,
    isOverdue,
    onClick,
    className = "",
}) => {
    const getRankColor = (index: number) => {
        if (isOverdue) {
            return 'from-red-700 to-red-800';
        }
        switch (index) {
            case 0: return 'from-red-600 to-red-700';
            case 1: return 'from-orange-500 to-orange-600';
            default: return 'from-red-400 to-red-500';
        }
    };

    return (
        <div 
            onClick={onClick}
            className={`
                group relative flex flex-col sm:flex-row items-start sm:items-center 
                justify-between p-4 sm:p-6 
                bg-linear-to-r ${isOverdue 
                    ? 'from-red-100 via-red-50 to-white border-red-300' 
                    : 'from-red-50 via-orange-50 to-white border-gray-200'
                }
                rounded-2xl border-3 ${isOverdue ? 'border-red-300' : 'border-gray-200'} 
                hover:border-red-300 transition-all hover:shadow-xl 
                cursor-pointer gap-4 sm:gap-0
                ${className}
            `}
        >
            {/* Badge de position */}
            <div className="absolute -left-3 -top-3">
                <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 
                    rounded-xl flex items-center justify-center 
                    font-black text-white shadow-lg border-3 border-white
                    bg-linear-to-br ${getRankColor(index)}
                `}>
                    {index + 1}
                </div>
            </div>

            {/* Badge "Overdue" si applicable */}
            {isOverdue && (
                <div className="absolute -top-2 right-4">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded-full animate-pulse shadow-md">
                        Overdue
                    </span>
                </div>
            )}

            <div className="flex items-center gap-3 sm:gap-5 ml-4 sm:ml-4 w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-linear-to-br from-red-100 to-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                    <AiOutlineTeam className="text-red-600" size={20} />
                </div>
                
                <div className="min-w-0 flex-1">
                    <p className="font-black text-base sm:text-lg text-gray-900 truncate">{name}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                        <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-white rounded-full font-bold text-gray-600 border-2 border-gray-200">
                            District
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 font-semibold">
                            Total: {formatCurrency(amount)}
                        </span>
                        {isOverdue && (
                            <span className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">
                                Due date passed
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={`w-full sm:w-auto text-left sm:text-right px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl ${
                isOverdue 
                    ? 'bg-red-100 border-2 border-red-300' 
                    : 'bg-linear-to-br from-red-100 to-orange-100 border-2 border-red-200'
            }`}>
                <p className={`text-xl sm:text-2xl font-black ${isOverdue ? 'text-red-700' : 'text-red-600'}`}>
                    -{formatCurrency(remaining)}
                </p>
                <p className={`text-[10px] sm:text-xs mt-1 font-bold ${isOverdue ? 'text-red-600' : 'text-red-500'}`}>
                    {isOverdue ? 'OVERDUE' : 'Reste à payer'}
                </p>
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <AiOutlineArrowRight className="text-red-500" size={24} />
            </div>
        </div>
    );
};

export default RiskMemberCard;