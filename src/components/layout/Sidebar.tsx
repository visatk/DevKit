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
      {/* Branding Header - Professional hierarchy */}
      <header className="flex h-16 shrink-0 items-center px-6 border-b border-border-default" role="banner">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="DevKit home">
          <Logo className="h-6 w-auto" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>DevKit</span>
        </a>
      </header>

      {/* Primary Navigation - Organized sections */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-10 custom-scrollbar" aria-label="Navigation menu">
        {navigation.map((item) =>
          isGroup(item) ? (
            <section key={item.name} aria-labelledby={`nav-section-${item.name}`}>
              <h2 
                id={`nav-section-${item.name}`}
                className="mb-3.5 px-2 text-xs font-bold uppercase tracking-wider text-text-tertiary"
              >
                {item.name}
              </h2>
              <ul className="space-y-2" role="list">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <SidebarLink item={child} active={location.pathname === child.href} />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <ul key={(item as NavItem).href} className="space-y-2" role="list">
              <li>
                <SidebarLink item={item as NavItem} active={location.pathname === (item as NavItem).href} />
              </li>
            </ul>
          )
        )}
      </nav>

      {/* Sidebar Footer - Community CTA */}
      <footer className="shrink-0 border-t border-border-default p-4 space-y-3">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-surface-hover hover:text-primary-base focus:outline-2 focus:outline-offset-2 focus:outline-primary-base"
          style={{ color: 'var(--text-secondary)', background: 'transparent' }}
          aria-label="Join our GitHub community (opens in new window)"
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="flex-1">Join Community</span>
          <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        </a>
      </footer>
    </aside>
  );
};

const SidebarLink = ({ item, active }: { item: NavChild | NavItem; active: boolean }) => (
  <NavLink
    to={item.href}
    className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200"
    style={{
      color: active ? 'var(--primary-base)' : 'var(--text-secondary)',
      background: active ? 'var(--primary-tint)' : 'transparent',
      border: `1.5px solid ${active ? 'var(--primary-ring)' : 'transparent'}`,
    }}
    aria-current={active ? 'page' : undefined}
  >
    {/* Visual active indicator - left bar */}
    {active && (
      <span
        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full transition-all duration-200"
        style={{
          background: 'var(--primary-base)',
          boxShadow: '0 0 8px var(--primary-ring)'
        }}
        aria-hidden="true"
      />
    )}

    {/* Icon with semantic size for touch targets (min 44px height) */}
    <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
      <item.icon className="h-4 w-4 transition-colors duration-200" aria-hidden="true" />
    </span>
    
    {/* Label text */}
    <span className="flex-1 text-left">{item.name}</span>
  </NavLink>
);
