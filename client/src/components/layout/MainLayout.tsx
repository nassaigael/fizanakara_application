import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-brand-bg dark:bg-brand-bg-dark transition-colors duration-300 overflow-hidden font-sans">
            
            {/* Sidebar unique qui gère elle-même le responsive */}
            <Sidebar />

            {/* CONTENU PRINCIPAL */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                
                <Navbar onMenuClick={() => {}} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg/30 custom-scrollbar">
                    <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col pb-32 lg:pb-10">
                        
                        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                            <Outlet />
                        </div>

                        <footer className="mt-20 pt-8 border-t-2 border-brand-border/50">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-brand-text tracking-[0.2em]">
                                        Fizanakara <span className="text-brand-primary">Digital System</span>
                                    </p>
                                    <p className="text-[9px] font-bold text-brand-muted uppercase mt-1 tracking-widest opacity-60 text-center md:text-left">
                                        Gestion globale des membres et cotisations
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="text-[9px] font-black uppercase text-brand-muted tracking-widest">
                                        Version 2.0.4 • 2026
                                    </p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default memo(MainLayout);