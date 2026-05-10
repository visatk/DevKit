import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Terminal, Home, MessagesSquare, Users, Settings, 
  CreditCard, ShieldCheck, Cpu, Database, ChevronLeft
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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <aside 
      className={`
        fixed lg:static inset-y-0 left-0 z-40 
        w-72 glass-panel flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
        <Logo className="h-8" />
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
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
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 relative">
                      {/* Active Indicator Line */}
                      {isActive && (
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                      {link.name}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Section / Bottom Actions */}
      <div className="p-4 border-t border-zinc-800/50">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">Admin User</p>
            <p className="text-xs text-zinc-500 truncate">Pro Member</p>
          </div>
          <Settings className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
        </NavLink>
      </div>
    </aside>
  );
};
