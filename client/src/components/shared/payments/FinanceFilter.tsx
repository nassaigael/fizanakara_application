import React, { useEffect, useRef, useState } from 'react';
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
    const filtersRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);

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

    useEffect(() => {
        const handleScroll = () => {
            if (filtersRef.current) {
                const rect = filtersRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const filtersBottom = rect.bottom;
                
                setIsSticky(filtersBottom >= windowHeight - 50);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleReset = () => {
        setStatusFilter('all');
        setTypeFilter('all');
    };

    const getValue = (val: string | React.ChangeEvent<HTMLSelectElement>): string => {
        if (typeof val === 'string') return val;
        return val.target?.value || '';
    };

    return (
        <>
            <div
                ref={filtersRef}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end transition-all duration-300 ${
                    isSticky ? 'opacity-0 invisible' : 'opacity-100 visible'
                }`}
            >
                <div className="flex-1 min-w-0 sm:min-w-36">
                    <label className="text-[8px] sm:text-[10px] font-black uppercase mb-1 block ml-2 text-gray-500">
                        État du compte
                    </label>
                    <Select
                        name="status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(getValue(val))}
                        icon ={<AiOutlineDollarCircle />}
                        className='uppercase'
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
                        className='uppercase'
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

            {isSticky && (
                <div className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 md:px-6 pb-3 animate-in slide-in-from-bottom duration-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end backdrop-blur-sm">
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
                                className="px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs w-full sm:w-auto mt-1 sm:mt-0 bg-[#E51A1A] hover:bg-[#C41515]"
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isSticky && <div className="h-22 sm:h-26" />}
        </>
    );
};