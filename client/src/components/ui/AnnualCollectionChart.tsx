import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/helper';

interface AnnualCollectionChartProps {
    selectedYear: number;
    totalPaid: number;
    totalDue: number;
    remaining: number;
    monthlyData: {
        month: string;
        collected: number;
        target: number;
    }[];
}

const COLORS = {
    paid: '#10B981',
    remaining: '#F59E0B',
    target: '#9CA3AF'
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
                <p className="text-xs font-black text-gray-600 mb-1">{label}</p>
                <p className="text-sm font-bold text-emerald-600">
                    Collected: {formatCurrency(payload[0]?.value || 0)}
                </p>
                <p className="text-xs font-medium text-gray-500">
                    Target: {formatCurrency(payload[1]?.value || 0)}
                </p>
            </div>
        );
    }
    return null;
};

export const AnnualCollectionChart: React.FC<AnnualCollectionChartProps> = ({
    selectedYear,
    totalPaid,
    totalDue,
    remaining,
    monthlyData
}) => {
    const paidPercentage = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    const remainingPercentage = 100 - paidPercentage;

    const donutData = [
        { name: 'Paid', value: totalPaid, percentage: paidPercentage, color: COLORS.paid },
        { name: 'Remaining', value: remaining, percentage: remainingPercentage, color: COLORS.remaining }
    ].filter(item => item.value > 0);

    return (
        <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 p-4 md:p-6 shadow-sm">
            {/* Titre */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-gray-800">
                    Annual Collection {selectedYear}
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase">Paid</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase">Remaining</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase">Target</span>
                    </div>
                </div>
            </div>

            {/* Donut + Bar Chart - Layout responsive */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Donut Chart */}
                <div className="lg:w-2/5 flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 md:w-56 md:h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centre du donut avec pourcentage */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl md:text-3xl font-black text-gray-800">
                                {Math.round(paidPercentage)}%
                            </span>
                            <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Collected
                            </span>
                        </div>
                    </div>
                    
                    {/* Légende du donut */}
                    <div className="flex gap-4 mt-4">
                        <div className="text-center">
                            <p className="text-sm md:text-base font-black text-emerald-600">
                                {formatCurrency(totalPaid)}
                            </p>
                            <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                Paid
                            </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <p className="text-sm md:text-base font-black text-amber-600">
                                {formatCurrency(remaining)}
                            </p>
                            <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                Remaining
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="lg:w-3/5">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart 
                            data={monthlyData} 
                            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                            barCategoryGap="20%"
                        >
                            <XAxis 
                                dataKey="month" 
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={{ stroke: '#E5E7EB' }}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis 
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={{ stroke: '#E5E7EB' }}
                                tickLine={false}
                                tickFormatter={(value: number) => `${value / 1000}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="top" 
                                align="right"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '10px' }}
                            />
                            <Bar 
                                dataKey="collected" 
                                fill={COLORS.paid} 
                                radius={[4, 4, 0, 0]}
                                name="Collected"
                                barSize={24}
                            />
                            <Bar 
                                dataKey="target" 
                                fill={COLORS.target} 
                                radius={[4, 4, 0, 0]}
                                name="Target"
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2">
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            Monthly Collection vs Target
                        </p>
                    </div>
                </div>
            </div>

            {/* Résumé des totaux */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t-2 border-gray-100">
                <div className="text-center">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Due</p>
                    <p className="text-sm md:text-base font-black text-gray-800">{formatCurrency(totalDue)}</p>
                </div>
                <div className="text-center border-x-2 border-gray-100">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Paid</p>
                    <p className="text-sm md:text-base font-black text-emerald-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-wider">Remaining</p>
                    <p className="text-sm md:text-base font-black text-amber-600">{formatCurrency(remaining)}</p>
                </div>
            </div>
        </div>
    );
};

export default AnnualCollectionChart;