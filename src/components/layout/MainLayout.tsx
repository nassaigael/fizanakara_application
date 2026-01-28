import React, { useState, memo, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const toggleMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(prev => !prev);
	}, []);
	const closeMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	return (
		<div className="flex h-screen bg-brand-bg dark:bg-brand-bg-dark transition-colors duration-300 overflow-hidden font-sans">
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-brand-text/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
					onClick={closeMobileMenu}
				/>
			)}

			<div className={`
                fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
				<Sidebar />
			</div>
			<div className="flex-1 flex flex-col min-w-0 h-full relative">
				<Navbar onMenuClick={toggleMobileMenu} />
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg/30 dark:bg-transparent custom-scrollbar pb-32 lg:pb-6">
					<div className="p-4 lg:p-10 max-w-400 mx-auto w-full min-h-full flex flex-col">
						<div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
							<Outlet />
						</div>
						<footer className="mt-auto pt-10 pb-4 text-center">
							<p className="text-[10px] font-black uppercase text-brand-muted tracking-[0.2em] opacity-40">
								© 2026 Fizanakara • Digital Management System
							</p>
						</footer>
					</div>
				</main>
			</div>
		</div>
	);
};

export default memo(MainLayout);