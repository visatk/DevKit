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
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.body.style.touchAction = ''; 
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavSection = ({ items, label }: { items: typeof utilities; label: string }) => (
    <div className="mb-6">
      <div className="px-1 mb-3 flex items-center gap-3">
        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="space-y-1">
        {items.map(({ to, icon: Icon, label: itemLabel, external, badge }) =>
          external ? (
            <a
              key={to}
              href={to}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ color: '#2AABEE', background: 'rgba(42,171,238,0.06)', border: '1px solid rgba(42,171,238,0.15)' }}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#2AABEE]/10 border border-[#2AABEE]/20">
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{itemLabel}</span>
              <ChevronRight className="size-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] outline-none
                ${isActive 
                  ? 'bg-[var(--orange-dim)] text-[var(--orange)] shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex size-8 items-center justify-center rounded-lg transition-colors border ${isActive ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30' : 'bg-[var(--surface-raised)] border-[var(--border)]'}`}>
                    <Icon className={`size-4 ${isActive ? 'text-[var(--orange)]' : 'text-[var(--text-muted)]'}`} />
                  </span>
                  <span className="flex-1">{itemLabel}</span>
                  {badge && (
                    <span className="badge-mono px-2 py-0.5 rounded-md text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-4 lg:hidden border-b border-[var(--border)] glass"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center size-10 rounded-xl transition-all active:scale-90 hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        <NavLink to="/" className="flex items-center gap-2 outline-none">
          <Logo className="h-6 w-auto" />
          <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            DevKit
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          {!isLoading && user && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg badge-mono bg-[var(--orange-dim)] border border-[var(--orange-border)] text-[var(--orange)]">
              <Flame className="size-3" /> {user.points}
            </div>
          )}
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] h-[100dvh] flex flex-col lg:hidden bg-[var(--bg)] border-r border-[var(--border)] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--orange)] to-transparent opacity-80" />

        <div className="flex h-16 items-center justify-between px-5 shrink-0 border-b border-[var(--border)]" style={{ marginTop: 'env(safe-area-inset-top)' }}>
          <NavLink to="/" className="flex items-center gap-2 outline-none">
            <Logo className="h-6 w-auto" />
            <span className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>DevKit</span>
          </NavLink>
          <button
            onClick={() => setIsOpen(false)}
            className="flex size-9 items-center justify-center rounded-lg transition-all active:scale-90 hover:bg-[var(--surface-raised)] text-[var(--text-muted)]"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <NavSection items={utilities} label="Utilities" />
          <NavSection items={community} label="Community" />

          {user && !user.isVip && (
            <div className="relative overflow-hidden rounded-2xl p-5 group mt-4 border border-[var(--orange-border)]"
              style={{ background: 'linear-gradient(135deg, var(--orange) 0%, #ff8552 100%)' }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="size-4 text-white" />
                  <span className="text-sm font-black text-white uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>Unlock Premium</span>
                </div>
                <p className="text-xs mb-4 text-white/90 font-medium leading-relaxed">
                  Access API pipelines, advanced tooling, and priority node routing.
                </p>
                <Link
                  to="/vip"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-[var(--orange)] bg-white hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                >
                  <Zap className="size-4" /> Upgrade Identity
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Auth Footer Boundary */}
        <div className="shrink-0 p-4 border-t border-[var(--border)] bg-black/20" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {isLoading ? (
            <div className="h-14 rounded-xl skeleton" />
          ) : user ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-[var(--surface-raised)] border border-[var(--border)]">
              <Link
                to={`/profile/${user.username}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 flex-1 min-w-0 group outline-none"
              >
                <div className="relative shrink-0">
                  <div className={`size-10 rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors ${user.isVip ? 'border-[var(--orange)] bg-[var(--orange-dim)]' : 'border-[var(--border)] bg-black/50'}`}>
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      : <User className="size-4 text-[var(--text-secondary)]" />
                    }
                  </div>
                  {user.isVip && (
                    <div className="absolute -top-1 -right-1 rounded-full p-0.5 bg-[var(--bg)] border border-[var(--orange)]">
                      <Crown className="size-2.5 text-[var(--orange)]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--orange)] transition-colors">{user.username}</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--orange)] uppercase tracking-wider">
                    <Flame className="size-3" /> {user.points} pts
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="shrink-0 p-2.5 rounded-lg transition-all active:scale-90 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Logout session"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold rounded-xl transition-all active:scale-[0.98] bg-[var(--text-primary)] text-[var(--bg)] hover:bg-[var(--orange)] hover:text-white"
            >
              <LogIn className="size-4" /> Authenticate
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
}
