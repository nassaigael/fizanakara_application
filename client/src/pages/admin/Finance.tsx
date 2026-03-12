import React, { useState, useMemo } from 'react';
import {
    AiOutlineDollar,
    AiOutlineCheckCircle,
    AiOutlineWarning,
    AiOutlineSearch
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import { PaymentModal } from '../../components/shared/payments/PaymentModal';
import { FinanceFilters } from '../../components/shared/payments/FinanceFilter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency } from '../../lib/helper';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const AdminFinance: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState<any>(null);

    const { contributions, isLoading, generateAnnualContributions } = useFinance(undefined, selectedYear);
    const { members } = useMembers();

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear, currentYear + 1];
    }, []);

    const filteredContributions = useMemo(() => {
        return contributions.filter(c => {
            const member = members.find(m => m.id === c.memberId);
            const memberName = member ? `${member.firstName} ${member.lastName}` : c.memberName;

            const matchesSearch = memberName?.toLowerCase().includes(searchTerm.toLowerCase());

            const remaining = c.remaining || 0;
            let matchesStatus = true;
            if (statusFilter === 'UNPAID') matchesStatus = remaining === c.amount;
            if (statusFilter === 'PARTIAL') matchesStatus = remaining > 0 && remaining < c.amount;
            if (statusFilter === 'PAID') matchesStatus = remaining <= 0;

            const isStudent = member?.status === 'STUDENT';
            let matchesType = true;
            if (typeFilter === 'STUDENT') matchesType = isStudent;
            if (typeFilter === 'WORKER') matchesType = !isStudent;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [contributions, members, searchTerm, statusFilter, typeFilter]);

    const stats = useMemo(() => {
        const totalAmount = filteredContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = filteredContributions.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
        return {
            totalAmount,
            totalPaid,
            remaining: totalAmount - totalPaid,
            count: filteredContributions.length,
            paidCount: filteredContributions.filter(c => (c.remaining || 0) <= 0).length
        };
    }, [filteredContributions]);

    const handleGenerateAnnual = async () => {
        try {
            await generateAnnualContributions.mutateAsync({ year: selectedYear });
            toast.success(`Contributions for ${selectedYear} generated`);
        } catch (error) {
            toast.error('Error during generation');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500">Loading contributions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
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

                <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-gray-200 p-1">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-2 rounded-xl font-black text-xs transition-all
                                ${selectedYear === year
                                    ? 'bg-brand-primary text-white'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }
                            `}
                        >
                            {year}
                        </button>
                    ))}
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

            {contributions.length === 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AiOutlineWarning className="text-yellow-600" size={24} />
                        <p className="font-black text-yellow-800">
                            No contributions for {selectedYear}
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleGenerateAnnual}
                        isLoading={generateAnnualContributions.isPending}
                    >
                        Generate Contributions
                    </Button>
                </div>
            )}

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

            <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Member</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Paid</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-400">Remaining</th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredContributions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center font-black text-gray-400">
                                        No contributions found
                                    </td>
                                </tr>
                            ) : (
                                filteredContributions.map((contribution) => {
                                    const member = members.find(m => m.id === contribution.memberId);
                                    const isStudent = member?.status === 'STUDENT';
                                    const remaining = contribution.remaining || 0;
                                    const isPaid = remaining <= 0;

                                    return (
                                        <tr key={contribution.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-black text-sm">{contribution.memberName}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    {isStudent ? 'Student' : 'Worker'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${isPaid
                                                    ? 'bg-green-100 text-green-600'
                                                    : remaining === contribution.amount
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {isPaid ? 'Paid' : remaining === contribution.amount ? 'Unpaid' : 'Partial'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black">
                                                {formatCurrency(contribution.amount)}
                                            </td>
                                            <td className="px-6 py-4 font-black text-green-600">
                                                {formatCurrency(contribution.totalPaid)}
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
                                                        disabled={isStudent}
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