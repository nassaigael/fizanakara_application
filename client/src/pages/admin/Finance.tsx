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

            if (searchTerm && !memberName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            if (typeFilter !== 'all') {
                const isStudent = member?.status === 'STUDENT';
                if (typeFilter === 'STUDENT' && !isStudent) return false;
                if (typeFilter === 'WORKER' && isStudent) return false;
            }

            if (statusFilter !== 'all') {
                const totalPaid = c.totalPaid ?? 0;
                const amount = c.amount ?? 0;
                const remaining = amount - totalPaid;

                if (statusFilter === 'UNPAID') {
                    return remaining > 0;
                } else if (statusFilter === 'PARTIAL') {
                    return totalPaid > 0 && remaining > 0;
                } else if (statusFilter === 'PAID') {
                    return remaining <= 0;
                }
            }

            return true;
        });
    }, [contributions, members, searchTerm, statusFilter, typeFilter, selectedYear]);

    const stats = useMemo(() => {
        const totalAmount = filteredContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = filteredContributions.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
        const paymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
        return {
            totalAmount,
            totalPaid,
            remaining: totalAmount - totalPaid,
            count: filteredContributions.length,
            paidCount: filteredContributions.filter(c => (c.totalPaid ?? 0) >= (c.amount ?? 0)).length,
            paymentRate
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
        <div className="h-full flex flex-col">
            {/* Header et Stats */}
            <div className="shrink-0 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-linear-to-r from-brand-primary to-orange-500 text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <AiOutlineDollar size={20} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mb-1">
                            {formatCurrency(stats.totalAmount)}
                        </p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Due</p>
                    </div>
                    <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-green-100">
                                <AiOutlineCheckCircle size={20} className="text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(stats.totalPaid)}
                        </p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Paid</p>
                    </div>
                    <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-red-100">
                                <AiOutlineWarning size={20} className="text-red-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-red-600 mb-1">
                            {formatCurrency(stats.remaining)}
                        </p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remaining</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <AiOutlineSearch size={20} className="text-purple-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 mb-1">
                            {stats.paymentRate.toFixed(1)}%
                        </p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Rate</p>
                    </div>
                </div>
            </div>

            {/* Filtres section - Sticky */}
            {selectedYear && contributions.length > 0 && (
                <div className="sticky top-0 z-20 bg-brand-bg pt-4 pb-2 -mt-2 space-y-4">
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
                </div>
            )}

            {/* Tableau des contributions - Scrollable */}
            <div className="flex-1 min-h-0 mt-4">
                {!selectedYear ? (
                    <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Member</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Year</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Amount</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Paid</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Remaining</th>
                                    <th className="px-4 py-4 text-right text-xs font-black uppercase text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AiOutlineCalendar size={32} className="text-gray-300" />
                                            <p className="text-sm font-bold text-gray-400 uppercase">
                                                Select a year to view contributions
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Choose a year from the dropdown or add a new year
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : contributions.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Member</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Year</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Amount</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Paid</th>
                                    <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Remaining</th>
                                    <th className="px-4 py-4 text-right text-xs font-black uppercase text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AiOutlineWarning size={32} className="text-amber-400" />
                                            <p className="text-sm font-bold text-amber-600 uppercase">
                                                No contributions for {selectedYear}
                                            </p>
                                            <p className="text-xs text-amber-500">
                                                Click "Actions" → "Add Year & Generate" to create contributions
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 overflow-hidden h-full flex flex-col">
                        <div className="flex-1 overflow-auto">
                            <table className="w-full min-w-175">
                                <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Member</th>
                                        <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Year</th>
                                        <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Status</th>
                                        <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Amount</th>
                                        <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Paid</th>
                                        <th className="px-4 py-4 text-left text-xs font-black uppercase text-gray-400">Remaining</th>
                                        <th className="px-4 py-4 text-right text-xs font-black uppercase text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredContributions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <AiOutlineSearch size={32} className="text-gray-300" />
                                                    <p className="text-sm font-bold text-gray-400 uppercase">
                                                        No matching contributions found
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContributions.map((contribution) => {
                                            const member = members.find(m => m.id === contribution.memberId);
                                            const isStudent = member?.status === 'STUDENT';
                                            const totalPaid = contribution.totalPaid ?? 0;
                                            const amount = contribution.amount ?? 0;
                                            const remaining = amount - totalPaid;
                                            const isPaid = totalPaid >= amount;
                                            const isUnpaid = totalPaid === 0;

                                            return (
                                                <tr key={contribution.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
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
                                                    <td className="px-4 py-4 font-black">
                                                        {contribution.year}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${isPaid
                                                                ? 'bg-green-100 text-green-600'
                                                                : isUnpaid
                                                                    ? 'bg-red-100 text-red-600'
                                                                    : 'bg-orange-100 text-orange-600'
                                                            }`}>
                                                            {isPaid ? 'Paid' : isUnpaid ? 'Unpaid' : 'Partial'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 font-black">
                                                        {formatCurrency(amount)}
                                                    </td>
                                                    <td className="px-4 py-4 font-black text-green-600">
                                                        {formatCurrency(totalPaid)}
                                                    </td>
                                                    <td className="px-4 py-4 font-black text-red-600">
                                                        {formatCurrency(remaining)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
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
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredContributions.length > 0 && (
                            <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-200 shrink-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase">
                                    Showing {filteredContributions.length} of {contributions.length} contributions
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isPaymentModalOpen && selectedContribution && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedContribution(null);
                    }}
                    contributionId={selectedContribution.id}
                    memberName={selectedContribution.memberName}
                    memberImageUrl={members.find(m => m.id === selectedContribution.memberId)?.imageUrl}
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

export default AdminFinance;