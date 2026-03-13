import React from 'react';

interface StatCardProps {
    title: string;
    status: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, status, icon, color }) => {
    const colorClasses = {
        green: 'from-green-500 to-emerald-500',
        blue: 'from-blue-500 to-cyan-500',
        orange: 'from-orange-500 to-yellow-500'
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-b-4 border-brand-border p-6 hover:shadow-lg transition-all">
            <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl w-fit mb-4`}>
                {icon}
            </div>
            <h3 className="font-black text-xs uppercase text-brand-muted mb-2">{title}</h3>
            <p className="font-black text-lg">{status}</p>
        </div>
    );
};

export default StatCard;
