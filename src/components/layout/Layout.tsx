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
      {/* Animated gradient backgrounds - GPU accelerated */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top-left accent */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none z-0 will-change-transform transform-gpu hidden lg:block"
          style={{
            background: 'radial-gradient(circle, var(--primary-tint) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.4
          }}
        />
        {/* Bottom-right accent */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0 will-change-transform transform-gpu hidden lg:block"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.3
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col md:ml-64 lg:ml-72 relative z-10 min-w-0">
        
        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-safe min-w-0 animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
