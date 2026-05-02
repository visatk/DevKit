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
    document.body.style.overflow = isOpen ? 'hidden' : '';
    document.body.style.touchAction = isOpen ? 'none' : '';
    return () => { document.body.style.overflow = ''; document.body.style.touchAction = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavSection = ({ items, label }: { items: typeof utilities; label: string }) => (
    <div>
      <div
        className="px-3 mb-1.5 badge-mono flex items-center gap-2"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
        {label}
        <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </div>
      <div className="space-y-0.5">
        {items.map(({ to, icon: Icon, label: itemLabel, external, badge }) =>
          external ? (
            <a
              key={to}
              href={to}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
              style={{ color: '#2AABEE', background: 'rgba(42,171,238,0.06)', borderColor: 'rgba(42,171,238,0.2)' }}
            >
              <span className="flex size-7 items-center justify-center rounded-md" style={{ background: 'rgba(42,171,238,0.12)', border: '1px solid rgba(42,171,238,0.25)' }}>
                <Icon className="size-3.5" />
              </span>
              <span className="flex-1 text-sm">{itemLabel}</span>
              <ChevronRight className="size-3.5 opacity-50" />
            </a>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="flex size-7 items-center justify-center rounded-md transition-colors"
                    style={{
                      background: isActive ? 'rgba(243,128,32,0.15)' : 'var(--surface-raised)',
                      border: `1px solid ${isActive ? 'var(--orange-border)' : 'var(--border)'}`,
                    }}
                  >
                    <Icon className="size-3.5" style={{ color: isActive ? 'var(--orange)' : 'inherit' }} />
                  </span>
                  <span className="flex-1 text-sm">{itemLabel}</span>
                  {badge && (
                    <span className="badge-mono px-1.5 py-0.5 rounded text-emerald-500" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
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
      {/* Mobile Header - Sticky Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 pt-safe items-center justify-between gap-3 px-4 sm:px-6 md:hidden border-b border-border-default"
        style={{
          background: 'var(--surface)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 active:scale-95 focus-ring hover:bg-surface-hover"
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-default)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <NavLink to="/" className="flex items-center gap-2 group">
          <Logo className="h-6 w-auto" />
          <span className="text-base font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            DevKit
          </span>
        </NavLink>

        {/* User Info on Mobile */}
        <div className="ml-auto flex items-center gap-2">
          {!isLoading && user && (
            <>
              {user.isVip && (
                <div className="flex w-8 h-8 items-center justify-center rounded-full" style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)' }}>
                  <Crown className="w-4 h-4" style={{ color: 'var(--primary-base)' }} />
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg badge-mono" style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)', color: 'var(--primary-base)' }}>
                <Flame className="w-3 h-3" /> {user.points}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[80%] max-w-xs h-screen flex flex-col md:hidden transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary-base via-primary-light to-transparent opacity-60" />

        {/* Drawer Header */}
        <div className="flex h-16 pt-safe items-center justify-between px-6 shrink-0 border-b border-border-default">
          <NavLink to="/" className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
            <span className="text-base font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>DevKit</span>
          </NavLink>
          <button
            onClick={() => setIsOpen(false)}
            className="flex w-10 h-10 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 hover:bg-surface-hover focus-ring"
            style={{ background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar pl-safe space-y-6">
          <NavSection items={utilities} label="Utilities" />
          <NavSection items={community} label="Community" />

          {/* Premium Upgrade Banner */}
          {user && !user.isVip && (
            <div className="relative overflow-hidden rounded-xl p-4 group mt-6"
              style={{
                background: 'linear-gradient(135deg, var(--primary-base) 0%, var(--primary-light) 100%)',
                border: '1px solid var(--primary-ring)'
              }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Unlock Premium</span>
                </div>
                <p className="text-xs mb-3 leading-relaxed text-white/80">
                  Access exclusive features and priority support
                </p>
                <Link
                  to="/vip"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold text-white bg-white/20 hover:bg-white/30 transition-colors duration-200"
                >
                  <Zap className="w-3.5 h-3.5" /> Upgrade Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="shrink-0 p-4 pb-safe border-t border-border-default">
          {isLoading ? (
            <div className="h-12 rounded-lg skeleton" />
          ) : user ? (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-default)' }}>
              <Link
                to={`/profile/${user.username}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: user.isVip ? 'var(--primary-tint)' : 'var(--surface-active)',
                      border: `2px solid ${user.isVip ? 'var(--primary-ring)' : 'var(--border-default)'}`,
                    }}
                  >
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      : <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    }
                  </div>
                  {user.isVip && (
                    <div className="absolute -top-1 -right-1 rounded-full p-0.5 bg-surface border border-primary-base">
                      <Crown className="w-2.5 h-2.5" style={{ color: 'var(--primary-base)' }} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold truncate text-text-primary">{user.username}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary-base">
                    <Flame className="w-3 h-3" /> {user.points} pts
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="shrink-0 p-2 rounded-lg transition-all duration-200 hover:bg-error-base/10 hover:text-error-base active:scale-95"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setIsOpen(false)}
              className="btn-primary flex items-center justify-center gap-2 w-full py-3 text-sm rounded-lg transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
}
