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
    AiOutlineMenu,
    AiOutlineLeft,
    AiOutlineRight
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import  PaymentModal from '../../components/shared/payments/PaymentModal';
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

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isMobile, setIsMobile] = useState(false);

    const actionMenuRef = useRef<HTMLDivElement>(null);
    const addYearInputRef = useRef<HTMLInputElement>(null);
    const filtersRef = useRef<HTMLDivElement>(null);
    const [isFiltersSticky, setIsFiltersSticky] = useState(false);
    const [, setFiltersHeight] = useState(0);

    const { contributions, isLoading, generateAnnualContributions, regenerateForYear } = useFinance(undefined, selectedYear || undefined);
    const { members } = useMembers();

    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = window.innerWidth < 640;
            setIsMobile(isMobileView);
            if (isMobileView) {
                setItemsPerPage(5);
            } else {
                setItemsPerPage(6);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, selectedYear]);

    useEffect(() => {
        const handleScroll = () => {
            if (filtersRef.current) {
                const rect = filtersRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const filtersBottom = rect.bottom;

                setIsFiltersSticky(filtersBottom >= windowHeight - 50);
            }
        };

        if (filtersRef.current) {
            setFiltersHeight(filtersRef.current.offsetHeight);
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const totalPages = Math.ceil(filteredContributions.length / itemsPerPage);
    const paginatedContributions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredContributions.slice(startIndex, endIndex);
    }, [filteredContributions, currentPage, itemsPerPage]);

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

    const handleGenerateAnnual = async () => {
        if (!selectedYear) {
            toast.error('Veuillez d\'abord sélectionner une année');
            return;
        }
        try {
            const result = await generateAnnualContributions.mutateAsync({ year: selectedYear });
            if (result && result.length > 0) {
                toast.success(`${result.length} cotisations générées pour ${selectedYear}`);
                if (!availableYears.includes(selectedYear)) {
                    setAvailableYears(prev => [...prev, selectedYear].sort((a, b) => a - b));
                }
            } else {
                toast.success(`Toutes les cotisations pour ${selectedYear} existent déjà`);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erreur lors de la génération';
            toast.error(errorMessage);
        }
        setIsActionMenuOpen(false);
    };

    const handleUpdateContributions = async () => {
        if (!selectedYear) {
            toast.error('Veuillez d\'abord sélectionner une année');
            return;
        }
        try {
            const result = await regenerateForYear.mutateAsync({ year: selectedYear });
            if (result.length === 0) {
                toast.success('Aucun nouveau membre à ajouter');
            } else {
                toast.success(`${result.length} nouvelles cotisations ajoutées pour ${selectedYear}`);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erreur lors de la mise à jour des cotisations';
            toast.error(errorMessage);
        }
        setIsActionMenuOpen(false);
    };

    const handleAddAndGenerateYear = async () => {
        if (newYear < 2000) {
            toast.error('L\'année doit être 2000 ou ultérieure');
            return;
        }
        if (newYear > 2100) {
            toast.error('L\'année doit être 2100 ou antérieure');
            return;
        }
        if (availableYears.includes(newYear)) {
            toast.error(`L'année ${newYear} existe déjà`);
            return;
        }

        setIsAddingYear(false);

        try {
            const result = await generateAnnualContributions.mutateAsync({ year: newYear });

            if (result && result.length > 0) {
                toast.success(`${result.length} cotisations générées pour ${newYear}`);
                setAvailableYears(prev => [...prev, newYear].sort((a, b) => a - b));
                setSelectedYear(newYear);
            } else {
                toast.success(`Année ${newYear} ajoutée mais aucun membre éligible trouvé`);
                setAvailableYears(prev => [...prev, newYear].sort((a, b) => a - b));
                setSelectedYear(newYear);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Échec de la génération des cotisations';
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
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#E51A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500 uppercase text-xs sm:text-sm">Chargement des cotisations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <div className="shrink-0 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-[#E51A1A] text-white rounded-2xl sm:rounded-3xl shadow-md">
                            <AiOutlineDollar className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h1 className={`${THEME.font.h1} text-2xl sm:text-3xl uppercase`}>Finances</h1>
                            <p className={`${THEME.font.muted} mt-1 text-[9px] sm:text-xs uppercase tracking-widest`}>
                                Gestion des cotisations
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <AiOutlineCalendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <select
                                value={selectedYear || ''}
                                onChange={handleYearChange}
                                className="appearance-none bg-white border border-gray-200 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-9 sm:pl-11 pr-8 sm:pr-10 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer hover:border-[#E51A1A] transition-all focus:outline-none focus:ring-2 focus:ring-[#E51A1A]/20 w-full sm:min-w-32 shadow-sm"
                            >
                                {yearOptions.length === 0 ? (
                                    <option value="" disabled>Aucune année disponible</option>
                                ) : (
                                    yearOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            Année {option.label}
                                        </option>
                                    ))
                                )}
                            </select>
                            <AiOutlineDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3 h-3 sm:w-4 sm:h-4" />
                        </div>

                        <div className="relative" ref={actionMenuRef}>
                            <Button
                                variant="primary"
                                onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                                className="whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm bg-[#E51A1A] hover:bg-[#C41515]"
                                disabled={!selectedYear && availableYears.length === 0}
                            >
                                <AiOutlineMenu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Actions
                                <AiOutlineDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                            </Button>

                            {isActionMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    {!isAddingYear ? (
                                        <button
                                            onClick={handleOpenAddYear}
                                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                                        >
                                            <AiOutlinePlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-green-600" />
                                            <div className="text-left">
                                                <p className="font-black text-[10px] sm:text-xs uppercase">Ajouter une année & générer</p>
                                                <p className="text-[7px] sm:text-[9px] text-gray-400">Créer une nouvelle année avec cotisations</p>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="p-3 border-b border-gray-100 bg-gray-50">
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-500 mb-2">Nouvelle année</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    ref={addYearInputRef}
                                                    type="number"
                                                    value={newYear}
                                                    onChange={(e) => setNewYear(parseInt(e.target.value) || currentYear + 1)}
                                                    className="w-full px-3 py-2 text-xs sm:text-sm font-black uppercase text-center border border-gray-200 rounded-xl focus:border-[#E51A1A] focus:outline-none focus:ring-2 focus:ring-[#E51A1A]/20"
                                                    min={2000}
                                                    max={2100}
                                                    placeholder="Année"
                                                />
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={handleAddAndGenerateYear}
                                                    className="flex-1 px-2 py-1 bg-[#E51A1A] text-white text-[9px] sm:text-[10px] font-black uppercase rounded-lg hover:bg-[#C41515]"
                                                >
                                                    Générer
                                                </button>
                                                <button
                                                    onClick={handleCancelAddYear}
                                                    className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 text-[9px] sm:text-[10px] font-black uppercase rounded-lg hover:bg-gray-300"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                            <p className="text-[7px] sm:text-[8px] text-gray-400 mt-2 text-center">
                                                Crée des cotisations pour tous les membres éligibles
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGenerateAnnual}
                                        disabled={!selectedYear || generateAnnualContributions.isPending}
                                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <AiOutlinePlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-green-600" />
                                        <div className="text-left">
                                            <p className="font-black text-[10px] sm:text-xs uppercase">Générer</p>
                                            <p className="text-[7px] sm:text-[9px] text-gray-400">Générer les cotisations pour {selectedYear}</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleUpdateContributions}
                                        disabled={!selectedYear || regenerateForYear.isPending}
                                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <AiOutlineReload className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
                                        <div className="text-left">
                                            <p className="font-black text-[10px] sm:text-xs uppercase">Mettre à jour</p>
                                            <p className="text-[7px] sm:text-[9px] text-gray-400">Ajouter les nouveaux membres pour {selectedYear || 'l\'année'}</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cartes statistiques */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-4">
                    <div className="bg-[#E51A1A]/10 rounded-xl border border-[#E51A1A]/20 p-2 sm:p-3">
                        <p className="text-lg sm:text-xl font-bold text-[#E51A1A] mb-0.5">
                            {formatCurrency(stats.totalAmount)}
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-wide">Total dû</p>
                    </div>
                    <div className="bg-[#E51A1A]/10 rounded-xl border border-[#E51A1A]/20 p-2 sm:p-3">
                        <p className="text-lg sm:text-xl font-bold text-[#E51A1A] mb-0.5">
                            {formatCurrency(stats.totalPaid)}
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-wide">Total payé</p>
                    </div>
                    <div className="bg-[#E51A1A]/10 rounded-xl border border-[#E51A1A]/20 p-2 sm:p-3">
                        <p className="text-lg sm:text-xl font-bold text-[#E51A1A] mb-0.5">
                            {formatCurrency(stats.remaining)}
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-wide">Reste à payer</p>
                    </div>
                    <div className="bg-[#E51A1A]/10 rounded-xl border border-[#E51A1A]/20 p-2 sm:p-3">
                        <p className="text-lg sm:text-xl font-bold text-[#E51A1A] mb-0.5">
                            {stats.paymentRate.toFixed(1)}%
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-wide">Taux de paiement</p>
                    </div>
                </div>
            </div>

            {selectedYear && contributions.length > 0 && (
                <>
                    <div
                        ref={filtersRef}
                        className={`transition-all duration-300 z-20 ${isFiltersSticky
                            ? 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-100 px-3 sm:px-4 md:px-6 py-3 animate-in slide-in-from-bottom duration-300'
                            : 'mt-6 sm:mt-8'
                            }`}
                        style={isFiltersSticky ? { marginLeft: 0, marginRight: 0 } : {}}
                    >
                        <div className={`${isFiltersSticky ? 'max-w-7xl mx-auto' : ''}`}>
                            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-5 space-y-4">
                                <FinanceFilters
                                    statusFilter={statusFilter}
                                    setStatusFilter={setStatusFilter}
                                    typeFilter={typeFilter}
                                    setTypeFilter={setTypeFilter}
                                />
                                <div className="relative">
                                    <Input
                                        placeholder="Rechercher un membre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        icon={<AiOutlineSearch />}
                                        className="border-gray-200 focus:border-[#E51A1A] focus:ring-2 focus:ring-[#E51A1A]/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isFiltersSticky && <div className="h-42" />}
                </>
            )}

            <div className="flex-1 min-h-0 mt-3 sm:mt-4">
                {!selectedYear ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <AiOutlineCalendar className="w-8 h-8 text-gray-300" />
                                <p className="text-sm font-bold text-gray-400 uppercase">
                                    Sélectionnez une année pour voir les cotisations
                                </p>
                                <p className="text-xs text-gray-400">
                                    Choisissez une année dans le menu déroulant ou ajoutez une nouvelle année
                                </p>
                            </div>
                        </div>
                    </div>
                ) : contributions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <AiOutlineWarning className="w-8 h-8 text-amber-400" />
                                <p className="text-sm font-bold text-amber-600 uppercase">
                                    Aucune cotisation pour {selectedYear}
                                </p>
                                <p className="text-xs text-amber-500">
                                    Cliquez sur "Actions" → "Ajouter une année & générer" pour créer des cotisations
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden h-full flex flex-col">
                        <div className="flex-1 overflow-auto">
                            <div className="min-w-200">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-50">Membre</th>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-20">Année</th>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-25">Statut</th>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-25">Montant</th>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-25">Payé</th>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-25">Reste</th>
                                            <th className="px-3 sm:px-4 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-black uppercase text-gray-500 min-w-20">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedContributions.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-3 sm:px-4 py-8 sm:py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <AiOutlineSearch className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                                                        <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase">
                                                            Aucune cotisation correspondante trouvée
                                                        </p>
                                                        {(statusFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
                                                            <button
                                                                onClick={() => {
                                                                    setSearchTerm('');
                                                                    setStatusFilter('all');
                                                                    setTypeFilter('all');
                                                                }}
                                                                className="mt-2 text-[10px] sm:text-xs text-[#E51A1A] hover:underline"
                                                            >
                                                                Effacer tous les filtres
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedContributions.map((contribution) => {
                                                const member = members.find(m => m.id === contribution.memberId);
                                                const isStudent = member?.status === 'STUDENT';
                                                const totalPaid = contribution.totalPaid ?? 0;
                                                const amount = contribution.amount ?? 0;
                                                const remaining = amount - totalPaid;
                                                const isPaid = totalPaid >= amount;
                                                const isUnpaid = totalPaid === 0;

                                                // Déterminer la couleur de fond de la ligne
                                                const rowBgClass = isStudent
                                                    ? 'bg-gray-500/10'
                                                    : 'bg-white';

                                                return (
                                                    <tr key={contribution.id} className={`${rowBgClass} hover:bg-gray-100 transition-colors`}>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
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
                                                                                    target.parentElement.classList.add('text-xs', 'sm:text-sm', 'font-black', 'text-gray-500');
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs sm:text-sm font-black text-gray-500">
                                                                            {getInitials(contribution.memberName.split(' ')[0] || '', contribution.memberName.split(' ')[1] || '')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-xs sm:text-sm">{contribution.memberName}</p>
                                                                    <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase">
                                                                        {isStudent ? 'Étudiant' : 'Travailleur'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-black text-xs sm:text-sm">
                                                            {contribution.year}
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                            <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase whitespace-nowrap ${isPaid
                                                                ? 'bg-green-100 text-green-600'
                                                                : isUnpaid
                                                                    ? 'bg-red-100 text-red-600'
                                                                    : 'bg-orange-100 text-orange-600'
                                                                }`}>
                                                                {isPaid ? 'Payé' : isUnpaid ? 'Impayé' : 'Partiel'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-black text-xs sm:text-sm whitespace-nowrap">
                                                            {formatCurrency(amount)}
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-black text-green-600 text-xs sm:text-sm whitespace-nowrap">
                                                            {formatCurrency(totalPaid)}
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4 font-black text-red-600 text-xs sm:text-sm whitespace-nowrap">
                                                            {formatCurrency(remaining)}
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                                                            {isPaid ? (
                                                                <span
                                                                    className="inline-flex items-center justify-center text-green-600"
                                                                    title="Réglé"
                                                                >
                                                                    <AiOutlineCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedContribution(contribution);
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    className="p-1.5 sm:p-2 rounded-lg text-[#E51A1A] hover:bg-[#E51A1A]/10 transition-colors"
                                                                    title="Payer"
                                                                >
                                                                    <AiOutlineDollar size={18} className="sm:w-5 sm:h-5" />
                                                                </button>
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

                        {filteredContributions.length > 0 && (
                            <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 shrink-0">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 order-2 sm:order-1">
                                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredContributions.length)}/{filteredContributions.length} cotisations
                                    </p>

                                    <div className="flex items-center gap-3 order-1 sm:order-2">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <AiOutlineLeft size={14} />
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {(() => {
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

                                                    return pages.map(page => (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`min-w-8 h-8 px-2 text-xs font-bold rounded-lg transition-colors ${currentPage === page
                                                                ? 'bg-[#E51A1A] text-white'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ));
                                                })()}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                    memberId={selectedContribution.memberId}
                    memberPhone={members.find(m => m.id === selectedContribution.memberId)?.phoneNumber}
                    memberImageUrl={members.find(m => m.id === selectedContribution.memberId)?.imageUrl}
                    contributionAmount={selectedContribution.amount}
                    remainingAmount={selectedContribution.remaining}
                    year={selectedContribution.year}
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