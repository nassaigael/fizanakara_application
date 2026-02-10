import React from 'react';
import { AiOutlineTeam, AiOutlineArrowRight } from 'react-icons/ai';

interface RiskMemberCardProps {
	index: number;
	name: string;
	amount: number;
	remaining: number;
	className?: string;
}

export const RiskMemberCard: React.FC<RiskMemberCardProps> = ({
	index,
	name,
	amount,
	remaining,
	className = "",
}) => {
	const getRankColor = (index: number) => {
		switch (index) {
			case 0: return 'bg-gradient-to-br from-red-600 to-red-700';
			case 1: return 'bg-gradient-to-br from-orange-500 to-orange-600';
			default: return 'bg-gradient-to-br from-red-400 to-red-500';
		}
	};

	return (
		<div className={`group relative flex items-center justify-between p-6 bg-gradient-to-r from-red-50 via-orange-50 to-white rounded-2xl border-3 border-gray-200 hover:border-red-300 transition-all hover:shadow-xl cursor-pointer ${className}`}>
			{/* Badge de position */}
			<div className="absolute -left-3 -top-3">
				<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg border-3 border-white ${getRankColor(index)}`}>
					{index + 1}
				</div>
			</div>

			<div className="flex items-center gap-5 ml-4">
				<div className="w-14 h-14 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
					<AiOutlineTeam className="text-red-600" size={28} />
				</div>
				<div>
					<p className="font-black text-lg text-gray-900">{name}</p>
					<div className="flex items-center gap-3 mt-2">
						<span className="text-xs px-3 py-1.5 bg-white rounded-full font-bold text-gray-600 border-2 border-gray-200">
							District
						</span>
						<span className="text-xs text-gray-500 font-semibold">
							Total: {amount.toLocaleString()} Ar
						</span>
					</div>
				</div>
			</div>

			<div className="text-right bg-gradient-to-br from-red-100 to-orange-100 px-6 py-4 rounded-2xl border-2 border-red-200">
				<p className="text-2xl font-black text-red-600">-{remaining.toLocaleString()}</p>
				<p className="text-xs text-red-500 mt-1 font-bold">Ariary</p>
			</div>

			{/* Indicateur hover */}
			<div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
				<AiOutlineArrowRight className="text-red-500" size={24} />
			</div>
		</div>
	);
};