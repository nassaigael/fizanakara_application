import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    AiOutlineDollar,
    AiOutlineCheckCircle,
    AiOutlineWarning,
    AiOutlineSearch,
    AiOutlineCalendar,
    AiOutlineDown,
    AiOutlineReload,
    AiOutlinePlusCircle,
    AiOutlineMenu
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import { PaymentModal } from '../../components/shared/payments/PaymentModal';
import { FinanceFilters } from '../../components/shared/payments/FinanceFilter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency, getInitials } from '../../lib/helper';
import { getImageUrl } from '../../lib/constant/constant';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const AdminFinance: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isAddingYear, setIsAddingYear] = useState(false);
    const [newYear, setNewYear] = useState(currentYear + 1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState<any>(null);
    
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const addYearInputRef = useRef<HTMLInputElement>(null);

    const { contributions, isLoading, generateAnnualContributions, regenerateForYear } = useFinance(undefined, selectedYear || undefined);
    const { members } = useMembers();

    useEffect(() => {
        const fetchExistingYears = async () => {
            try {
                const allContributions = await import('../../services/contribution.services').then(
                    module => module.ContributionService.getAll()
                );
                const years = [...new Set(allContributions.map(c => c.year))];
                setAvailableYears(years.sort((a, b) => a - b));
                if (years.length > 0 && !selectedYear) {
                    setSelectedYear(years[years.length - 1]);
                } else if (years.length === 0 && !selectedYear) {
                    setSelectedYear(currentYear);
                }
            } catch (error) {
                console.error('Failed to fetch years:', error);
            }
        };
        fetchExistingYears();
    }, [currentYear, selectedYear]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setIsActionMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isAddingYear && addYearInputRef.current) {
            addYearInputRef.current.focus();
        }
    }, [isAddingYear]);

    const yearOptions = useMemo(() => {
        return availableYears.map(year => ({
            value: year,
            label: year.toString()
        }));
    }, [availableYears]);

    const filteredContributions = useMemo(() => {
        if (!selectedYear) return [];
        
        return contributions.filter(c => {
            const member = members.find(m => m.id === c.memberId);
            const memberName = member ? `${member.firstName} ${member.lastName}` : c.memberName;
            
            // 1. Filtre par recherche
            if (searchTerm && !memberName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            
            // 2. Filtre par type (Student/Worker)
            if (typeFilter !== 'all') {
                const isStudent = member?.status === 'STUDENT';
                if (typeFilter === 'STUDENT' && !isStudent) return false;
                if (typeFilter === 'WORKER' && isStudent) return false;
            }
            
            // 3. Filtre par statut de paiement (Account Status)
            if (statusFilter !== 'all') {
                const totalPaid = c.totalPaid ?? 0;
                const amount = c.amount ?? 0;
                const remaining = amount - totalPaid;
                
                if (statusFilter === 'UNPAID') {
                    // UNPAID = reste à payer > 0 (non complètement payé)
                    return remaining > 0;
                } else if (statusFilter === 'PARTIAL') {
                    // PARTIAL = a payé partiellement mais pas fini
                    return totalPaid > 0 && remaining > 0;
                } else if (statusFilter === 'PAID') {
                    // PAID = plus de reste à payer
                    return remaining <= 0;
                }
            }
            
            return true;
        });
    }, [contributions, members, searchTerm, statusFilter, typeFilter, selectedYear]);

    const stats = useMemo(() => {
        const totalAmount = filteredContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = filteredContributions.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
        return {
            totalAmount,
            totalPaid,
            remaining: totalAmount - totalPaid,
            count: filteredContributions.length,
            paidCount: filteredContributions.filter(c => (c.totalPaid ?? 0) >= (c.amount ?? 0)).length
        };
    }, [filteredContributions]);


    const handleUpdateContributions = async () => {
        if (!selectedYear) {
            toast.error('Please select a year first');
            return;
        }
        try {
            const result = await regenerateForYear.mutateAsync({ year: selectedYear });
            if (result.length === 0) {
                toast.success('No new members to add');
            } else {
                toast.success(`${result.length} new contributions added for ${selectedYear}`);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Error updating contributions';
            toast.error(errorMessage);
        }
        setIsActionMenuOpen(false);
    };

    const handleAddAndGenerateYear = async () => {
        if (newYear < 2000) {
            toast.error('Year must be 2000 or later');
            return;
        }
        if (newYear > 2100) {
            toast.error('Year must be 2100 or earlier');
            return;
        }
        if (availableYears.includes(newYear)) {
            toast.error(`Year ${newYear} already exists`);
            return;
        }
        
        setIsAddingYear(false);
        
        try {
            const result = await generateAnnualContributions.mutateAsync({ year: newYear });
            
            if (result && result.length > 0) {
                toast.success(`${result.length} contributions generated for ${newYear}`);
                setAvailableYears(prev => [...prev, newYear].sort((a, b) => a - b));
                setSelectedYear(newYear);
            } else {
                toast.success(`Year ${newYear} added but no eligible members found`);
                setAvailableYears(prev => [...prev, newYear].sort((a, b) => a - b));
                setSelectedYear(newYear);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to generate contributions';
            toast.error(errorMessage);
        }
        
        setIsActionMenuOpen(false);
        setNewYear(currentYear + 1);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(parseInt(e.target.value, 10));
    };

    const handleCancelAddYear = () => {
        setIsAddingYear(false);
        setNewYear(currentYear + 1);
    };

    const handleOpenAddYear = () => {
        setIsAddingYear(true);
        setNewYear(availableYears.length > 0 ? Math.max(...availableYears) + 1 : currentYear + 1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500 uppercase">Loading contributions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-primary text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AiOutlineDollar size={32} />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.h1} text-3xl uppercase`}>Finance</h1>
                        <p className={`${THEME.font.muted} mt-1 text-xs uppercase tracking-widest`}>
                            Contribution Management
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <AiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={selectedYear || ''}
                            onChange={handleYearChange}
                            className="appearance-none bg-white border-2 border-gray-200 rounded-2xl py-3 pl-11 pr-10 text-sm font-black uppercase tracking-wider cursor-pointer hover:border-brand-primary transition-all focus:outline-none focus:border-brand-primary min-w-32"
                        >
                            {yearOptions.length === 0 ? (
                                <option value="" disabled>No years available</option>
                            ) : (
                                yearOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        Year {option.label}
                                    </option>
                                ))
                            )}
                        </select>
                        <AiOutlineDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    
                    <div className="relative" ref={actionMenuRef}>
                        <Button
                            variant="primary"
                            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                            className="whitespace-nowrap flex items-center gap-2"
                            disabled={!selectedYear && availableYears.length === 0}
                        >
                            <AiOutlineMenu size={16} />
                            Actions
                            <AiOutlineDown size={12} className={`transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        {isActionMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                {!isAddingYear ? (
                                    <button
                                        onClick={handleOpenAddYear}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                                    >
                                        <AiOutlinePlusCircle size={18} className="text-green-600" />
                                        <div className="text-left">
                                            <p className="font-black text-xs uppercase">Add Year & Generate</p>
                                            <p className="text-[9px] text-gray-400">Create new year with contributions</p>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">New Year</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={addYearInputRef}
                                                type="number"
                                                value={newYear}
                                                onChange={(e) => setNewYear(parseInt(e.target.value) || currentYear + 1)}
                                                className="w-full px-3 py-2 text-sm font-black uppercase text-center border-2 border-gray-200 rounded-xl focus:border-brand-primary focus:outline-none"
                                                min={2000}
                                                max={2100}
                                                placeholder="Year"
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={handleAddAndGenerateYear}
                                                className="flex-1 px-2 py-1 bg-green-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-green-700"
                                            >
                                                Generate
                                            </button>
                                            <button
                                                onClick={handleCancelAddYear}
                                                className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-black uppercase rounded-lg hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <p className="text-[8px] text-gray-400 mt-2 text-center">
                                            Creates contributions for all eligible members
                                        </p>
                                    </div>
                                )}
                                
                                <button
                                    onClick={handleUpdateContributions}
                                    disabled={!selectedYear || regenerateForYear.isPending}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <AiOutlineReload size={18} className="text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-black text-xs uppercase">Update</p>
                                        <p className="text-[9px] text-gray-400">Add new members for {selectedYear || 'year'}</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Due"
                    value={formatCurrency(stats.totalAmount)}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Paid"
                    value={formatCurrency(stats.totalPaid)}
                    color="bg-green-500"
                />
                <StatCard
                    title="Remaining"
                    value={formatCurrency(stats.remaining)}
                    color="bg-red-500"
                />
                <StatCard
                    title="Payment Rate"
                    value={`${stats.totalAmount > 0 ? ((stats.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0}%`}
                    color="bg-purple-500"
                />
            </div>

            {(!selectedYear || filteredContributions.length === 0) && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <AiOutlineWarning className="text-amber-600" size={24} />
                        <div>
                            <p className="font-black text-amber-800">
                                {!selectedYear 
                                    ? 'Select or add a year' 
                                    : contributions.length === 0 
                                        ? `No contributions for ${selectedYear}`
                                        : `No matching contributions found for ${selectedYear}`
                                }
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                {!selectedYear 
                                    ? 'Use the Actions menu to add a year and generate contributions'
                                    : contributions.length === 0
                                        ? `Click "Actions" → "Add Year & Generate" to create contributions for ${selectedYear}`
                                        : 'Try adjusting your filters or search criteria'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedYear && filteredContributions.length > 0 && (
                <>
                    <FinanceFilters
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                    />

                    <div className="relative">
                        <Input
                            placeholder="Search for a member..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<AiOutlineSearch />}
                        />
                    </div>

                    {(statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '') && (
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="text-[9px] font-black text-gray-500 uppercase">Active filters:</span>
                            {searchTerm && (
                                <span className="px-2 py-1 bg-gray-200 rounded-lg text-[8px] font-black">
                                    Search: {searchTerm}
                                </span>
                            )}
                            {statusFilter !== 'all' && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[8px] font-black">
                                    {statusFilter === 'UNPAID' ? 'Unpaid' : statusFilter === 'PARTIAL' ? 'Partial' : 'Paid'}
                                </span>
                            )}
                            {typeFilter !== 'all' && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[8px] font-black">
                                    {typeFilter === 'STUDENT' ? 'Students' : 'Workers'}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                }}
                                className="ml-auto text-[8px] font-black text-red-500 hover:text-red-600"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Member</th>
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Year</th>
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Paid</th>
                                        <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Remaining</th>
                                        <th className="px-6 py-4 text-right text-xs font-black uppercase text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredContributions.map((contribution) => {
                                        const member = members.find(m => m.id === contribution.memberId);
                                        const isStudent = member?.status === 'STUDENT';
                                        const totalPaid = contribution.totalPaid ?? 0;
                                        const amount = contribution.amount ?? 0;
                                        const remaining = amount - totalPaid;
                                        const isPaid = totalPaid >= amount;
                                        const isUnpaid = totalPaid === 0;

                                        return (
                                            <tr key={contribution.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {member?.imageUrl ? (
                                                                <img
                                                                    src={getImageUrl(member.imageUrl, 'member')}
                                                                    alt={member.firstName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        if (target.parentElement) {
                                                                            target.parentElement.innerHTML = getInitials(member.firstName, member.lastName);
                                                                            target.parentElement.classList.add('text-sm', 'font-black', 'text-gray-500');
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-black text-gray-500">
                                                                    {getInitials(contribution.memberName.split(' ')[0] || '', contribution.memberName.split(' ')[1] || '')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm">{contribution.memberName}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase">
                                                                {isStudent ? 'Student' : 'Worker'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-black">
                                                    {contribution.year}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                                                        isPaid
                                                            ? 'bg-green-100 text-green-600'
                                                            : isUnpaid
                                                                ? 'bg-red-100 text-red-600'
                                                                : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                        {isPaid ? 'Paid' : isUnpaid ? 'Unpaid' : 'Partial'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-black">
                                                    {formatCurrency(amount)}
                                                </td>
                                                <td className="px-6 py-4 font-black text-green-600">
                                                    {formatCurrency(totalPaid)}
                                                </td>
                                                <td className="px-6 py-4 font-black text-red-600">
                                                    {formatCurrency(remaining)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600 font-black text-[10px] uppercase">
                                                            <AiOutlineCheckCircle size={16} />
                                                            Settled
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => {
                                                                setSelectedContribution(contribution);
                                                                setIsPaymentModalOpen(true);
                                                            }}
                                                            className="px-4 py-2 text-xs"
                                                        >
                                                            Pay
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {isPaymentModalOpen && selectedContribution && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedContribution(null);
                    }}
                    contributionId={selectedContribution.id}
                    memberName={selectedContribution.memberName}
                    contributionAmount={selectedContribution.amount}
                    remainingAmount={selectedContribution.remaining}
                    onSuccess={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedContribution(null);
                    }}
                />
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className={`${color} rounded-2xl p-6 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
        <p className="text-[10px] font-black uppercase opacity-80 mb-2">{title}</p>
        <p className="text-2xl font-black">{value}</p>
    </div>
);

export default AdminFinance;