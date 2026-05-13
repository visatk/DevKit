import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight } from 'lucide-react';

// Standalone SVG implementations to replace removed Lucide brand icons
const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto relative border-t border-[var(--border)] bg-[var(--bg)] pt-16 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden" role="contentinfo">
      
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--orange-dim)] to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-12 xl:gap-8 mb-16">
          
          {/* Brand & Mission (Spans 2 cols on extra large) */}
          <section className="xl:col-span-2 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-6 group focus:outline-none focus:ring-2 focus:ring-[var(--orange)] rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-[var(--orange)] flex items-center justify-center text-white font-bold font-syne shadow-lg shadow-[var(--orange-dim)] group-hover:shadow-[var(--orange-border)] transition-shadow">
                D
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)] font-syne tracking-tight group-hover:text-[var(--orange)] transition-colors">DevKit</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-sm">
              Architecting secure, highly-performant edge compute environments. Elevating the standard for modern web application tooling.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" aria-label="GitHub">
                <GithubIcon size={18} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" aria-label="Twitter">
                <TwitterIcon size={18} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" aria-label="LinkedIn">
                <LinkedinIcon size={18} />
              </a>
            </div>
          </section>

          {/* Links Group 1 */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6 font-syne">Platform</h3>
            <nav aria-label="Platform links">
              <ul className="space-y-4 text-sm" role="list">
                <li>
                  <Link to="/" className="text-[var(--text-secondary)] hover:text-[var(--orange)] transition-colors duration-200 font-medium flex items-center gap-1 group">
                    Dashboard
                    <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link to="/forum" className="text-[var(--text-secondary)] hover:text-[var(--orange)] transition-colors duration-200 font-medium flex items-center gap-1 group">
                    Community Forum
                    <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link to="/vip" className="text-[var(--text-secondary)] hover:text-[var(--orange)] transition-colors duration-200 font-medium flex items-center gap-1 group">
                    VIP Access
                    <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* Links Group 2 */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6 font-syne">Legal</h3>
            <nav aria-label="Legal links">
              <ul className="space-y-4 text-sm" role="list">
                <li>
                  <Link to="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--orange)] transition-colors duration-200 font-medium flex items-center gap-1 group">
                    Privacy Policy
                    <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-[var(--text-secondary)] hover:text-[var(--orange)] transition-colors duration-200 font-medium flex items-center gap-1 group">
                    Terms of Service
                    <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* System Status & Contact */}
          <section className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6 font-syne">Status</h3>
            <a href="#" className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.15)] transition-colors w-max focus:outline-none focus:ring-2 focus:ring-[#22c55e] group mb-8">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </span>
              <span className="text-sm font-semibold text-[#4ade80] group-hover:text-[#86efac] transition-colors">All Systems Operational</span>
            </a>
            
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4 font-syne">Contact Us</h3>
            <a href="mailto:support@devkit.io" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 w-max">
              <Mail size={16} />
              support@devkit.io
            </a>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
          <p className="flex items-center gap-1.5">
            &copy; {currentYear} DevKit. 
            <span className="hidden sm:inline">Crafted with precision.</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              Powered by <span className="text-[var(--text-primary)] font-medium">Cloudflare</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
