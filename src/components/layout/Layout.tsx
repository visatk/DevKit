import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // UX: Used `min-h-[100dvh]` to prevent layout jump on mobile Safari/Chrome
    <div className="flex min-h-[100dvh] bg-zinc-950 text-zinc-50 overflow-hidden relative isolate">
      
      {/* Background ambient light effects - Optimized with transform hardware acceleration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px] animate-pulse-slow" style={{ transform: 'translateZ(0)', animationDelay: '1.5s' }} />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Mobile Header */}
        <MobileHeader 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />

        {/* Main Content Area - Semantic HTML tag */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
          id="main-content"
        >
          <div className="h-full flex flex-col min-h-full">
            {/* Added native Tailwind v4 animation replacing the missing plugin classes */}
            <div className="flex-1 animate-fade-in-up w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay - Added accessibility tags */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          role="presentation"
        />
      )}
    </div>
  );
};
