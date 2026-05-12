import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, MessagesSquare, Users, Settings, 
  CreditCard, ShieldCheck, Cpu, Database
} from 'lucide-react';
import { Logo } from '../Logo';

const navGroups = [
  {
    title: 'Platform',
    links: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'Community Forum', path: '/forum', icon: MessagesSquare },
      { name: 'VIP Access', path: '/vip', icon: ShieldCheck },
    ]
  },
  {
    title: 'Developer Tools',
    links: [
      { name: 'Card Checker', path: '/card-checker', icon: CreditCard },
      { name: 'BIN Extractor', path: '/bin-checker', icon: Database },
      { name: 'IP Analysis', path: '/ip-check', icon: Cpu },
      { name: 'Identity Generator', path: '/fake-address', icon: Users },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] h-full glass border-r border-[var(--border)] z-30 shrink-0 shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)] shrink-0">
        <NavLink to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] rounded-lg">
          <Logo className="h-7 w-auto drop-shadow-md" />
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            DevKit
          </span>
        </NavLink>
      </div>

      {/* Navigation Matrix */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar" aria-label="Main Navigation">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 select-none">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 outline-none
                      ${isActive 
                        ? 'bg-[var(--orange-dim)] text-[var(--orange)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'
                      }
                      focus-visible:ring-2 focus-visible:ring-[var(--orange)]
                    `}
                  >
                    {/* Active Edge Indicator */}
                    {isActive && (
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[var(--orange)] rounded-r-full shadow-[0_0_12px_var(--orange)]" />
                    )}
                    
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[var(--orange)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Persistent User Boundary */}
      <div className="p-4 border-t border-[var(--border)] shrink-0 bg-black/20">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-raised)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)] group"
        >
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-[var(--orange)] to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-inner border border-white/10 ring-2 ring-transparent group-hover:ring-[var(--orange-dim)] transition-all">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)] truncate">Admin User</p>
            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider truncate">Pro Member</p>
          </div>
          <Settings className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
        </NavLink>
      </div>
    </aside>
  );
};
