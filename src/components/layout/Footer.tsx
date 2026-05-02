import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-default py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>DevKit</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Professional development toolkit for modern web applications.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-4">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="text-text-secondary hover:text-primary-base transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-secondary hover:text-primary-base transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-4">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary-base transition-colors duration-200">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-primary-base transition-colors duration-200">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-4">Status</h4>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-medium text-success-base">Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-default pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>© {currentYear} DevKit. All rights reserved.</span>
          </div>
          <div className="text-xs text-text-muted">
            Built with performance and accessibility in mind
          </div>
        </div>
      </div>
    </footer>
  );
}
