import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogIn, Menu, X, LogOut, Flame, Crown, Zap, ChevronRight } from 'lucide-react';
import { Logo } from '../Logo';
import { NAV_ITEMS } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const utilities = NAV_ITEMS.filter(item => item.group === 'Utilities');
  const community = NAV_ITEMS.filter(item => item.group === 'Community');

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-4 lg:hidden bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
          aria-label="Open menu"
          aria-expanded={isOpen}
        >
          <Menu className="w-5 h-5" />
        </button>

        <NavLink to="/" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
          <span className="font-bold text-zinc-50">DevKit</span>
        </NavLink>

        <div className="flex items-center gap-2">
          {!isLoading && user && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5" /> {user.points}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 bg-black/60 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Content */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm h-[100dvh] bg-zinc-950 border-r border-zinc-800 flex flex-col lg:hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
            <span className="font-bold text-zinc-50">DevKit</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {/* Mapping Utilities - Simplified native styling */}
          <div className="space-y-1">
             <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">Utilities</div>
             {utilities.map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to}
                  className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'text-zinc-300 hover:bg-zinc-800/50'}`}
                >
                  <item.icon className="w-5 h-5 opacity-80" />
                  {item.label}
                </NavLink>
             ))}
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-zinc-800/50 shrink-0">
          {isLoading ? (
            <div className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-zinc-100 truncate">{user.username}</span>
                  <span className="text-xs text-orange-500 font-medium">Pro Member</span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-white transition-colors">
              <LogIn className="w-5 h-5" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
