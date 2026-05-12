import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-[100dvh] w-full bg-[var(--bg)] text-[var(--text-primary)] overflow-hidden selection:bg-[var(--orange-dim)] selection:text-[var(--orange)]">
      {/* Hardware-accelerated ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden isolate">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-orange-500/10 blur-[140px] translate-z-0" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-rose-500/10 blur-[140px] translate-z-0" />
      </div>

      {/* Desktop Navigation (Hidden on Mobile) */}
      <Sidebar />

      {/* Main Execution Context */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 h-full">
        {/* Mobile Navigation (Hidden on Desktop) */}
        <MobileHeader />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar relative">
          <div className="flex flex-col min-h-full">
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <Outlet />
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};
