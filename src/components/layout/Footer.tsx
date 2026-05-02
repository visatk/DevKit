import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-default py-12 px-4 sm:px-6 lg:px-8" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        {/* Footer Grid - 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <section>
            <h3 className="text-base font-bold text-text-primary mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>DevKit</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Professional development toolkit for modern web applications and secure workflows.
            </p>
          </section>

          {/* Legal Links Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-4">Legal</h3>
            <nav aria-label="Legal links">
              <ul className="space-y-3 text-sm" role="list">
                <li>
                  <Link to="/privacy" className="text-text-secondary hover:text-primary-base hover:underline transition-colors duration-200 font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-text-secondary hover:text-primary-base hover:underline transition-colors duration-200 font-medium">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* Resources Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-4">Resources</h3>
            <nav aria-label="External resources">
              <ul className="space-y-3 text-sm" role="list">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary-base hover:underline transition-colors duration-200 font-medium" aria-label="DevKit GitHub repository (opens in new tab)">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-secondary hover:text-primary-base hover:underline transition-colors duration-200 font-medium">
                    Documentation
                  </a>
                </li>
              </ul>
            </nav>
          </section>

          {/* System Status */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-4">System Status</h3>
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm font-semibold text-success-base">All Systems Operational</span>
            </div>
          </section>
        </div>

        {/* Copyright & Attribution */}
        <div className="border-t border-border-default pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <p>
            <span>&copy; {currentYear} DevKit. </span>
            <a href="/privacy" className="hover:text-primary-base hover:underline transition-colors duration-200 font-medium">All rights reserved</a>
            <span>.</span>
          </p>
          <p className="text-text-tertiary">
            Built with <span aria-label="care">❤️</span> for performance and accessibility
          </p>
        </div>
      </div>
    </footer>
  );
}
