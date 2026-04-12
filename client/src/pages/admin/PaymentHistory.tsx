import React, { useState, useMemo, useEffect } from 'react';
import {
    AiOutlineSearch,
    AiOutlineLeft,
    AiOutlineRight,
    AiOutlineDollar,
    AiOutlineFilePdf,
    AiOutlineFilter,
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../lib/helper';
import { THEME } from '../../styles/theme';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

interface PaymentHistoryItem {
    id: string;
    memberName: string;
    memberId: string;
    memberImageUrl?: string;
    memberGender?: string;
    amount: number;
    paymentDate: string;
    paymentTime: string;
    contributionYear: number;
    status: string;
    receivedBy: string;
    receiptNumber: string;
}

const PaymentHistory: React.FC = () => {
    const { contributions, isLoading } = useFinance();
    const { members } = useMembers();

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const allPayments = useMemo(() => {
        const payments: PaymentHistoryItem[] = [];

        contributions.forEach(contribution => {
            if (contribution.payments && contribution.payments.length > 0) {
                contribution.payments.forEach((payment: any) => {
                    const member = members.find(m => m.id === contribution.memberId);

                    const paymentDate = new Date(payment.paymentDate);
                    const day = paymentDate.getDate().toString().padStart(2, '0');
                    const month = (paymentDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = paymentDate.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;
                    const exactTime = payment.paymentTime || '--:--:--';
                    const receivedByValue = payment.receivedBy || 'Système';

                    payments.push({
                        id: payment.id,
                        memberName: member ? `${member.firstName} ${member.lastName}` : contribution.memberName,
                        memberId: contribution.memberId,
                        memberImageUrl: member?.imageUrl,
                        memberGender: member?.gender,
                        amount: payment.amountPaid,
                        paymentDate: formattedDate,
                        paymentTime: exactTime,
                        contributionYear: contribution.year,
                        status: contribution.status,
                        receivedBy: receivedByValue,
                        receiptNumber: payment.receiptNumber || `FIZ${contribution.year}${Math.floor(Math.random() * 10000)}`
                    });
                });
            }
        });

        payments.sort((a, b) => {
            const dateTimeA = new Date(`${a.paymentDate.split('/').reverse().join('-')}T${a.paymentTime}`);
            const dateTimeB = new Date(`${b.paymentDate.split('/').reverse().join('-')}T${b.paymentTime}`);
            return dateTimeB.getTime() - dateTimeA.getTime();
        });

        return payments;
    }, [contributions, members]);

    const filteredPayments = useMemo(() => {
        return allPayments.filter(payment => {
            if (searchTerm && !payment.memberName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (selectedYear !== 'all' && payment.contributionYear !== parseInt(selectedYear)) {
                return false;
            }
            if (statusFilter !== 'all' && payment.status !== statusFilter) {
                return false;
            }
            if (startDate) {
                const paymentDate = payment.paymentDate.split('/').reverse().join('-');
                if (paymentDate < startDate) return false;
            }
            if (endDate) {
                const paymentDate = payment.paymentDate.split('/').reverse().join('-');
                if (paymentDate > endDate) return false;
            }
            return true;
        });
    }, [allPayments, searchTerm, selectedYear, statusFilter, startDate, endDate]);

    const stats = useMemo(() => {
        const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalCount = filteredPayments.length;
        const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
        return { totalAmount, totalCount, averageAmount };
    }, [filteredPayments]);

    const availableYears = useMemo(() => {
        const years = new Set(allPayments.map(p => p.contributionYear));
        return Array.from(years).sort((a, b) => b - a);
    }, [allPayments]);

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPayments, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedYear, statusFilter, startDate, endDate]);

    const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const goToPage = (page: number) => setCurrentPage(page);

    const getPageNumbers = () => {
        const maxVisible = isMobile ? 3 : 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedYear('all');
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const exportToPDF = () => {
        toast.success('Export PDF en cours de développement...');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#E51A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500 uppercase text-xs sm:text-sm">Chargement des paiements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <div className="shrink-0 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-[#E51A1A] text-white rounded-2xl sm:rounded-3xl shadow-md">
                            <AiOutlineDollar className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h1 className={`${THEME.font.h1} text-2xl sm:text-3xl uppercase`}>Historique des paiements</h1>
                            <p className={`${THEME.font.muted} mt-1 text-[9px] sm:text-xs uppercase tracking-widest`}>
                                Tous les paiements enregistrés
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#E51A1A] hover:bg-[#C41515] text-white"
                    >
                        <AiOutlineFilePdf size={16} />
                        Exporter PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="bg-blue-600 rounded-xl p-4 shadow-md text-center">
                    <p className="font-black text-white text-xl sm:text-2xl">{formatCurrency(stats.totalAmount)}</p>
                    <p className="font-bold text-white/80 text-[10px] uppercase tracking-wider mt-2">Total encaissé</p>
                </div>
                <div className="bg-green-600 rounded-xl p-4 shadow-md text-center">
                    <p className="font-black text-white text-xl sm:text-2xl">{stats.totalCount}</p>
                    <p className="font-bold text-white/80 text-[10px] uppercase tracking-wider mt-2">Transactions</p>
                </div>
                <div className="bg-purple-600 rounded-xl p-4 shadow-md text-center">
                    <p className="font-black text-white text-xl sm:text-2xl">{formatCurrency(stats.averageAmount)}</p>
                    <p className="font-bold text-white/80 text-[10px] uppercase tracking-wider mt-2">Montant moyen</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom de membre..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#E51A1A] focus:outline-none focus:ring-1 focus:ring-[#E51A1A] text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${showFilters
                                ? 'bg-[#E51A1A] text-white border-[#E51A1A]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#E51A1A]'
                                }`}
                        >
                            <AiOutlineFilter size={16} />
                            <span className="text-sm font-medium">Filtres</span>
                            {(selectedYear !== 'all' || statusFilter !== 'all' || startDate || endDate) && !showFilters && (
                                <span className="w-2 h-2 bg-[#E51A1A] rounded-full animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 text-sm text-gray-500 hover:text-[#E51A1A] transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Année</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#E51A1A] focus:outline-none text-sm"
                                    >
                                        <option value="all">Toutes les années</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Statut</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#E51A1A] focus:outline-none text-sm"
                                    >
                                        <option value="all">Tous les statuts</option>
                                        <option value="PAID">Payé</option>
                                        <option value="PARTIAL">Partiel</option>
                                        <option value="PENDING">En attente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Date début</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#E51A1A] focus:outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Date fin</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#E51A1A] focus:outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <AiOutlineDollar size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Aucun paiement trouvé</p>
                        <p className="text-gray-400 text-sm mt-1">Modifiez vos critères de recherche</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-200">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Membre</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Heure</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Montant</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Année</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Statut</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Reçu par</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">N° Ticket</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedPayments.map((payment) => {
                                        const member = members.find(m => m.id === payment.memberId);
                                        const isPaid = payment.status === 'PAID';

                                        return (
                                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            imageUrl={payment.memberImageUrl}
                                                            firstName={member?.firstName}
                                                            lastName={member?.lastName}
                                                            gender={payment.memberGender as any}
                                                            category="member"
                                                            size="sm"
                                                            shape="rounded"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-sm">{payment.memberName}</p>
                                                            <p className="text-[9px] text-gray-400">{payment.memberId?.slice(-8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium">{payment.paymentDate}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-mono text-gray-600">{payment.paymentTime}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm">{payment.contributionYear}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${isPaid
                                                        ? 'bg-green-100 text-green-700'
                                                        : payment.status === 'PARTIAL'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {isPaid ? 'Payé' : payment.status === 'PARTIAL' ? 'Partiel' : 'En attente'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium">{payment.receivedBy}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-mono text-gray-500">{payment.receiptNumber.slice(-12)}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredPayments.length > 0 && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <p className="text-[10px] text-gray-500 order-2 sm:order-1">
                                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredPayments.length)} sur {filteredPayments.length} paiements
                                    </p>

                                    <div className="flex items-center gap-3 order-1 sm:order-2">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={goToPreviousPage}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <AiOutlineLeft size={14} />
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {getPageNumbers().map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => goToPage(page)}
                                                        className={`min-w-8 h-8 px-2 text-xs font-bold rounded-lg transition-colors ${currentPage === page
                                                            ? 'bg-[#E51A1A] text-white'
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={goToNextPage}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <AiOutlineRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;