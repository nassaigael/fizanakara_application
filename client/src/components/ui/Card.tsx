import React from 'react';

interface CardProps {
	title: string;
	value: string | number;
	subtitle: string;
	icon: React.ReactNode;
	gradient: string;
	className?: string;
}

export const Card: React.FC<CardProps> = ({
	title,
	value,
	subtitle,
	icon,
	gradient,
	className = "",
}) => {
	return (
		<div className={`group bg-white rounded-3xl p-6 border-3 border-gray-200 shadow-lg hover:shadow-2xl transition-all cursor-pointer ${className}`}>
			<div className="flex justify-between items-start mb-4">
				<div>
					<p className="text-3xl font-black text-gray-900 mb-2">{value}</p>
					<p className="text-sm font-bold text-gray-700">{title}</p>
				</div>
				<div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
					<div className="text-white">{icon}</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
				<p className="text-xs text-gray-600 font-bold">{subtitle}</p>
			</div>
		</div>
	);
};