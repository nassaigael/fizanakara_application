import React from 'react';
import { AiOutlineUser, AiOutlineDollarCircle } from 'react-icons/ai';
import Select from '../../ui/Select';
import Button from '../../ui/Button';

interface FinanceFiltersProps {
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    typeFilter: string;
    setTypeFilter: (type: string) => void;
}

export const FinanceFilters: React.FC<FinanceFiltersProps> = ({
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter
}) => {
    const statusOptions = [
        { value: 'all', label: 'Tous les états' },
        { value: 'UNPAID', label: 'Impayés' },
        { value: 'PARTIAL', label: 'Paiements partiels' },
        { value: 'PAID', label: 'Entièrement réglés' },
    ];

    const typeOptions = [
        { value: 'all', label: 'Tous les membres' },
        { value: 'WORKER', label: 'Travailleurs' },
        { value: 'STUDENT', label: 'Étudiants' },
    ];

    const handleReset = () => {
        setStatusFilter('all');
        setTypeFilter('all');
    };

    const getValue = (val: string | React.ChangeEvent<HTMLSelectElement>): string => {
        if (typeof val === 'string') return val;
        return val.target?.value || '';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
            <div className="flex-1 min-w-0 sm:min-w-36">
                <label className="text-[8px] sm:text-[10px] font-black uppercase mb-1 block ml-2 text-gray-500">
                    État du compte
                </label>
                <Select
                    name="status"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(getValue(val))}
                    icon={<AiOutlineDollarCircle />}
                />
            </div>

            <div className="flex-1 min-w-0 sm:min-w-36">
                <label className="text-[8px] sm:text-[10px] font-black uppercase mb-1 block ml-2 text-gray-500">
                    Catégorie
                </label>
                <Select
                    name="type"
                    options={typeOptions}
                    value={typeFilter}
                    onChange={(val) => setTypeFilter(getValue(val))}
                    icon={<AiOutlineUser />}
                />
            </div>

            <Button
                variant="primary"
                onClick={handleReset}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs w-full sm:w-auto mt-1 sm:mt-0"
            >
                Réinitialiser
            </Button>
        </div>
    );
};