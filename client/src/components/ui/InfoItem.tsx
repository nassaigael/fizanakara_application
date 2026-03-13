import React from 'react';

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    badge?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, badge }) => (
    <div className="flex items-center gap-3">
        <div className="text-brand-primary flex-shrink-0">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-xs text-brand-muted uppercase font-black tracking-widest">{label}</p>
            <p className={`font-bold ${badge ? 'text-brand-primary' : ''}`}>{value}</p>
        </div>
    </div>
);

export default InfoItem;
