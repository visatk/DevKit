import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="relative min-h-screen w-full transition-colors duration-300"
      style={{
        background: 'var(--background)',
        color: 'var(--text-primary)',
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Decorative background gradients - GPU accelerated, non-intrusive */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Top-left accent - subtle primary tint */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none z-0 will-change-transform transform-gpu hidden lg:block"
          style={{
            background: 'radial-gradient(circle, var(--primary-tint) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.4
          }}
        />
        {/* Bottom-right accent - subtle secondary blue */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0 will-change-transform transform-gpu hidden lg:block"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.3
          }}
        />
      </div>

      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex min-h-screen flex-col md:ml-64 lg:ml-72 relative z-10 min-w-0">
        
        {/* Mobile Navigation Header */}
        <MobileHeader />

        {/* Page Content - Semantic main element */}
        <main 
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-safe min-w-0 animate-fade-in"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>

        {/* Site Footer */}
        <Footer />
      </div>
    </div>
  );
}
