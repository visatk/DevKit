import { type LucideIcon } from 'lucide-react';

interface ToolPageHeaderProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  description: string;
}

export function ToolPageHeader({ badge, badgeIcon: BadgeIcon, title, description }: ToolPageHeaderProps) {
  return (
    <header className="mb-10 sm:mb-12">
      {/* Category Badge */}
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full badge-mono mb-5 text-xs font-bold uppercase tracking-wider"
        style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)', color: 'var(--primary-base)' }}
        role="complementary"
        aria-label={`Category: ${badge}`}
      >
        <BadgeIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{badge}</span>
      </div>

      {/* Page Title */}
      <h1
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-balance"
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)', lineHeight: '1.2' }}
      >
        {title}
      </h1>

      {/* Page Description */}
      <p 
        className="text-base sm:text-lg max-w-3xl leading-relaxed text-pretty"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
    </header>
  );
}

interface ToolCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolCard({ children, className = '' }: ToolCardProps) {
  return (
    <article
      className={`card rounded-xl overflow-hidden transition-all duration-200 hover:border-primary-base hover:shadow-lg ${className}`}
      style={{ 
        background: 'var(--surface)', 
        border: '1px solid var(--border-default)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Decorative top accent */}
      <div 
        className="h-px w-full bg-gradient-to-r from-primary-base/60 via-primary-light/30 to-transparent" 
        aria-hidden="true"
      />
      {children}
    </article>
  );
}
