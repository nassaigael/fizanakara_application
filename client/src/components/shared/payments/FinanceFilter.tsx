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
        { value: 'all', label: 'All account states' },
        { value: 'UNPAID', label: 'Unpaid' },
        { value: 'PARTIAL', label: 'Partial payments' },
        { value: 'PAID', label: 'Fully settled' },
    ];

    const typeOptions = [
        { value: 'all', label: 'All members' },
        { value: 'WORKER', label: 'Workers' },
        { value: 'STUDENT', label: 'Students' },
    ];

    const handleReset = () => {
        setStatusFilter('all');
        setTypeFilter('all');
    };

    return (
        <div className="bg-white border-4 border-black rounded-4xl p-4 mb-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-50">
                <label className="text-[10px] font-black uppercase mb-1 block ml-2 text-gray-400">
                    Account Status
                </label>
                <Select
                    name="status"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    icon={<AiOutlineDollarCircle />}
                />
            </div>

            <div className="flex-1 min-w-50">
                <label className="text-[10px] font-black uppercase mb-1 block ml-2 text-gray-400">
                    Category
                </label>
                <Select
                    name="type"
                    options={typeOptions}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    icon={<AiOutlineUser />}
                />
            </div>

            <Button 
                variant="secondary"
                onClick={handleReset}
                className="px-6 py-3 text-xs"
            >
                Reset
            </Button>
        </div>
    );
};