import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CreditCard,
  Scissors,
  Globe,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '../Logo';

type NavChild = { name: string; href: string; icon: React.ElementType };
type NavGroup = { name: string; children: NavChild[] };
type NavItem = { name: string; href: string; icon: React.ElementType };

const navigation: (NavItem | NavGroup)[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Card Tools',
    children: [
      { name: 'Bin Checker',   href: '/bin-checker',   icon: Search      },
      { name: 'Bin Extractor', href: '/bin-extractor', icon: Scissors    },
      { name: 'Card Checker',  href: '/card-checker',  icon: ShieldCheck },
      { name: 'Test Cards',    href: '/test-cards',    icon: CreditCard  },
    ],
  },
  {
    name: 'Network & Info',
    children: [
      { name: 'IP Check',      href: '/ip',      icon: Globe  },
      { name: 'Fake Address',  href: '/fake-address',  icon: MapPin },
    ],
  },
  { name: 'Community', href: '/', icon: MessageSquare },
];

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'children' in item;
}

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col md:flex border-r border-border-default"
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border-default)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      {/* Logo Area */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
          <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>DevKit</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        {navigation.map((item) =>
          isGroup(item) ? (
            <div key={item.name}>
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                {item.name}
              </p>
              <div className="space-y-1">
                {item.children.map((child) => (
                  <SidebarLink key={child.href} item={child} active={location.pathname === child.href} />
                ))}
              </div>
            </div>
          ) : (
            <div key={(item as NavItem).href} className="space-y-1">
              <SidebarLink item={item as NavItem} active={location.pathname === (item as NavItem).href} />
            </div>
          )
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="shrink-0 border-t border-border-default p-4 space-y-3">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-surface-hover hover:text-primary-base"
          style={{ color: 'var(--text-secondary)', background: 'transparent' }}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="flex-1">Join Community</span>
          <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </aside>
  );
};

const SidebarLink = ({ item, active }: { item: NavChild | NavItem; active: boolean }) => (
  <NavLink
    to={item.href}
    className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all duration-200 focus-ring"
    style={{
      color: active ? 'var(--primary-base)' : 'var(--text-secondary)',
      background: active ? 'var(--primary-tint)' : 'transparent',
      borderColor: active ? 'var(--primary-ring)' : 'transparent',
      border: '1px solid',
    }}
  >
    {/* Active indicator bar */}
    {active && (
      <span
        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full transition-all duration-200"
        style={{
          background: 'var(--primary-base)',
          boxShadow: '0 0 8px var(--primary-ring)'
        }}
      />
    )}

    <item.icon className="h-4 w-4 shrink-0 transition-colors duration-200" />
    <span className="flex-1">{item.name}</span>
  </NavLink>
);
