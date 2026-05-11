import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, MessagesSquare, Users, Settings, 
  CreditCard, ShieldCheck, Cpu, Database
} from 'lucide-react';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside 
      className={`
        hidden lg:flex flex-col w-72 h-[100dvh] 
        bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50
        transition-transform duration-300 ease-in-out z-40
      `}
      aria-label="Main Navigation"
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <Logo className="h-8" />
          <span className="font-bold text-lg tracking-tight text-zinc-50">DevKit</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
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
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                      }
                    `}
                  >
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <div className="absolute -left-6 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      )}
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    </div>
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section / Bottom Actions */}
      <div className="p-4 border-t border-zinc-800/50 shrink-0">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">Admin User</p>
            <p className="text-xs text-zinc-500 truncate">Pro Member</p>
          </div>
          <Settings className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
        </NavLink>
      </div>
    </aside>
  );
};
