import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from 'lucide-react';

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
                <Github size={18} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]" aria-label="LinkedIn">
                <Linkedin size={18} />
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
