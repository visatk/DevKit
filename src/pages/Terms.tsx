import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, AlertTriangle } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function Terms() {
  const lastUpdated = "April 26, 2026";

  return (
    <article className="w-full max-w-4xl mx-auto py-8 md:py-12 px-4 sm:px-6 animation-fade-in">
      <SeoHead title="Terms of Service | DevKit" description="Terms and conditions for utilizing the DevKit platform and tools." />
      
      <header className="mb-10 md:mb-14">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--orange)] shadow-sm transition-all mb-8 group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Return Home
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[var(--orange-dim)] rounded-2xl border border-[var(--orange-border)]">
            <Scale className="size-8 text-[var(--orange)]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">Terms of Service</h1>
        </div>
        <p className="text-[var(--text-muted)] font-medium">Last Updated: {lastUpdated}</p>
      </header>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 md:p-12 shadow-xl shadow-zinc-200/10 dark:shadow-black/20">
        
        {/* Warning Callout */}
        <div className="flex items-start gap-4 p-5 md:p-6 mb-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <AlertTriangle className="size-6 text-amber-500 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-1">Strict Educational & Testing Use Only</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400/90 leading-relaxed">
              DevKit (Visatk) provides synthetic data generation, network tools, and cryptographic testing environments. All tools, including the Test Card Generator and BIN Checker, are strictly for software development, QA, and authorized security auditing. Any misuse for financial fraud or malicious activity is strictly prohibited and will result in immediate network termination.
            </p>
          </div>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)] prose-a:text-[var(--orange)]">
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing, registering, or utilizing any API endpoints, developer tools, or community hubs provided by DevKit (Visatk) (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to all terms, you must disconnect from the platform immediately.</p>

          <h2>2. Account Security & Cryptographic Identity</h2>
          <ul>
            <li><strong>Credential Responsibility:</strong> You are responsible for safeguarding your PBKDF2 hashed credentials, GitHub OAuth tokens, and active session JWTs. The platform cannot recover lost plaintext passwords.</li>
            <li><strong>Single Identity:</strong> Users are permitted one active node (account) on the platform. Sybil attacks or multi-account reputation farming will result in permanent bans.</li>
          </ul>

          <h2>3. VIP Subscriptions & Cryptocurrency Payments</h2>
          <p>The Platform offers Lifetime VIP status via cryptographic payments (processed by Apirone). By initiating an invoice, you agree to the following:</p>
          <ul>
            <li><strong>Irreversibility:</strong> Due to the immutable nature of blockchain networks (BTC, LTC, DOGE, TRX, ETH, USDT, USDC), all VIP access payments are strictly <strong>non-refundable</strong>.</li>
            <li><strong>Volatility:</strong> Fiat equivalents ($49.99) are calculated dynamically via API oracles at the exact time of invoice generation. Underpayments due to network fees or delayed transmissions will not activate VIP status.</li>
          </ul>

          <h2>4. User Generated Content & Forum Conduct</h2>
          <p>You retain ownership of the data you transmit, but grant the Platform a license to display, encrypt, and distribute it across the network.</p>
          <ul>
            <li><strong>Encrypted Payloads:</strong> Users may lock thread content behind "Reputation Points." You guarantee you have the legal right to distribute any locked payloads.</li>
            <li><strong>Prohibited Transmissions:</strong> You may not upload malware, real stolen financial data (Fullz/CVV), child exploitation material, or execute unauthorized targeted attacks against platform members.</li>
            <li><strong>Moderation:</strong> Administrative and moderator nodes hold total authority to wipe, lock, or pin vectors (threads/replies) without prior warning.</li>
          </ul>

          <h2>5. Reputation Points</h2>
          <p>Reputation points are an internal platform metric used to unlock encrypted payloads and signify community trust. They hold <strong>zero monetary value</strong>, cannot be exchanged for fiat currency or cryptocurrency, and may be modified or wiped by administrators at any time.</p>

          <h2>6. API & Tool Usage Constraints</h2>
          <p>Our tools (IP Checkers, Card Generators, Validators) are bound by Cloudflare Edge execution limits.</p>
          <ul>
            <li>Automated scraping or bypassing Turnstile captcha protections is forbidden.</li>
            <li>You may not use our generated dummy data to deceive individuals or financial institutions.</li>
          </ul>

          <h2>7. Limitation of Liability</h2>
          <p>The Platform is provided "AS IS" without warranties of any kind. Under no circumstances shall DevKit, Visatk, its engineers, or its affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform, including but not limited to loss of data, financial loss, or legal repercussions resulting from your misuse of the tools.</p>

        </div>
      </div>
    </article>
  );
}
