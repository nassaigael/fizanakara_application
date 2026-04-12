import React from 'react';
import { AiOutlineUser, AiOutlineArrowRight, AiOutlineWarning } from 'react-icons/ai';
import { formatCurrency } from '../../lib/helper';

interface RiskMemberCardProps {
    index: number;
    name: string;
    amount: number;
    remaining: number;
    isOverdue?: boolean;
    onClick?: () => void;
}

export const RiskMemberCard: React.FC<RiskMemberCardProps> = ({
    index,
    name,
    amount,
    remaining,
    isOverdue,
    onClick,
}) => {
    const getRankClass = () => {
        if (index === 0) return 'bg-red-100 text-red-700';
        if (index === 1) return 'bg-orange-100 text-orange-700';
        if (index === 2) return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-500';
    };

    const progress = ((amount - remaining) / amount) * 100;

    return (
        <div
            onClick={onClick}
            className="group bg-white border border-gray-200 rounded-md hover:border-red-300 hover:shadow-sm transition-all cursor-pointer"
        >
            <div className="p-3">
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md ${getRankClass()} flex items-center justify-center text-xs font-bold`}>
                        {index + 1}
                    </div>

                    <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                        <AiOutlineUser size={14} className="text-gray-500" />
                    </div>

                    <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{name}</p>
                        <p className="text-[9px] text-gray-400">Total: {formatCurrency(amount)}</p>
                    </div>

                    <div className="text-right">
                        <p className="font-bold text-sm text-red-600">{formatCurrency(remaining)}</p>
                        <p className="text-[8px] text-gray-400">Reste</p>
                    </div>

                    {/* Flèche */}
                    <AiOutlineArrowRight size={12} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                </div>

                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {isOverdue && (
                    <div className="mt-2 flex items-center gap-1">
                        <AiOutlineWarning size={8} className="text-red-500" />
                        <span className="text-[7px] font-medium text-red-600 uppercase">Paiement en retard</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskMemberCard;