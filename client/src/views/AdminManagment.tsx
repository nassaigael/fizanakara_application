import React, { useState } from 'react';
import { AiOutlineUserAdd, AiOutlineGlobal, AiOutlineArrowLeft, AiOutlineControl } from 'react-icons/ai';
import AdminRegisterForm from '../components/shared/management/AdminRegisterForm';
import ManageOrganization from '../components/shared/management/ManageOrganization';
import Button from '../components/ui/Button';
import { THEME } from '../styles/theme';

const AdminManagement: React.FC = () => {
    const [view, setView] = useState<'menu' | 'admins' | 'org'>('menu');

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-text text-white rounded-2xl shadow-lg border-b-4 border-black/30">
                        <AiOutlineControl size={32} />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.black} text-3xl tracking-tighter`}>Console Maître</h1>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-1">Configuration Système • Racine</p>
                    </div>
                </div>

                {view !== 'menu' && (
                    <Button 
                        variant="secondary" 
                        onClick={() => setView('menu')}
                        className="py-3! px-5! rounded-xl! text-[10px]! flex items-center gap-2"
                    >
                        <AiOutlineArrowLeft size={16} /> Retour au menu
                    </Button>
                )}
            </div>
            {view === 'menu' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
                    <Button 
                        variant="secondary"
                        onClick={() => setView('admins')}
                        className="group p-12! rounded-[3rem]! border-b-8! flex flex-col items-center gap-6 h-auto normal-case"
                    >
                        <div className="w-24 h-24 bg-brand-primary/10 rounded-4xl flex items-center justify-center text-brand-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <AiOutlineUserAdd size={48} />
                        </div>
                        <div className="text-center">
                            <h3 className={`${THEME.font.black} text-xl tracking-normal`}>Accès Admins</h3>
                            <p className="text-[10px] font-bold text-brand-muted uppercase mt-3 tracking-widest leading-relaxed opacity-70">
                                Créer et révoquer les permissions <br/> des gestionnaires de district.
                            </p>
                        </div>
                    </Button>
                    <Button 
                        variant="secondary"
                        onClick={() => setView('org')}
                        className="group p-12! rounded-[3rem]! border-b-8! flex flex-col items-center gap-6 h-auto normal-case"
                    >
                        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-4xl flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                            <AiOutlineGlobal size={48} />
                        </div>
                        <div className="text-center">
                            <h3 className={`${THEME.font.black} text-xl tracking-normal`}>Structure Géo</h3>
                            <p className="text-[10px] font-bold text-brand-muted uppercase mt-3 tracking-widest leading-relaxed opacity-70">
                                Configurer les Districts <br/> et les Tribus (Tributes).
                            </p>
                        </div>
                    </Button>

                </div>
            ) : view === 'admins' ? (
                <div className="animate-in slide-in-from-bottom-6 duration-500">
                    <AdminRegisterForm />
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-6 duration-500">
                    <ManageOrganization />
                </div>
            )}
            <div className="mt-12 flex justify-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-bg dark:bg-brand-bg/10 border-2 border-brand-border border-dashed rounded-2xl opacity-50">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">
                        Sécurité Niveau : SuperAdmin Uniquement
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;