import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, LockKeyhole, Database, EyeOff } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function Privacy() {
  const lastUpdated = "April 26, 2026";

  return (
    <article className="w-full max-w-4xl mx-auto py-8 md:py-12 px-4 sm:px-6 animation-fade-in">
      <SeoHead title="Privacy Policy | DevKit" description="How DevKit collects, protects, and manages your cryptographic data." />
      
      <header className="mb-10 md:mb-14">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--orange)] shadow-sm transition-all mb-8 group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Return Home
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <ShieldCheck className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-[var(--text-muted)] font-medium">Last Updated: {lastUpdated}</p>
      </header>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 md:p-12 shadow-xl shadow-zinc-200/10 dark:shadow-black/20">
        
        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-5 bg-[var(--surface-raised)] rounded-2xl border border-[var(--border)]">
            <LockKeyhole className="size-6 text-[var(--orange)] mb-3" />
            <h4 className="font-bold text-[var(--text-primary)] mb-2">Cryptographic Hashing</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">We utilize PBKDF2 hashing with high iteration counts to secure credentials natively at the edge.</p>
          </div>
          <div className="p-5 bg-[var(--surface-raised)] rounded-2xl border border-[var(--border)]">
            <Database className="size-6 text-[var(--orange)] mb-3" />
            <h4 className="font-bold text-[var(--text-primary)] mb-2">Edge Storage</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">Data is stored securely on decentralized SQLite architectures (Cloudflare D1).</p>
          </div>
          <div className="p-5 bg-[var(--surface-raised)] rounded-2xl border border-[var(--border)]">
            <EyeOff className="size-6 text-[var(--orange)] mb-3" />
            <h4 className="font-bold text-[var(--text-primary)] mb-2">No Sale of Data</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">We do not sell, rent, or auction your personal telemetry to advertising networks.</p>
          </div>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-li:text-[var(--text-secondary)] prose-a:text-[var(--orange)]">
          
          <h2>1. Data We Collect</h2>
          <p>We collect structural and operational data necessary to maintain network security and provide the service:</p>
          <ul>
            <li><strong>Identity Vectors:</strong> Usernames, email addresses, and GitHub IDs (if OAuth is utilized).</li>
            <li><strong>Cryptographic Data:</strong> PBKDF2 hashes of passwords (we never see your plaintext password).</li>
            <li><strong>Telemetry & Security:</strong> IP addresses and user-agents are processed briefly during authentication via Cloudflare Turnstile to prevent automated bot attacks and Sybil activity.</li>
            <li><strong>Transmissions:</strong> Forum threads, replies, direct messages (P2P), and user-uploaded media.</li>
          </ul>

          <h2>2. How We Utilize Your Data</h2>
          <p>Your data is strictly used for platform operation:</p>
          <ul>
            <li>Authenticating your node via secure JSON Web Tokens (JWTs).</li>
            <li>Executing requested actions (posting, voting, messaging).</li>
            <li>Processing cryptocurrency upgrades (we map external Apirone invoice IDs to your internal user ID to grant VIP status).</li>
            <li>Sending critical transactional alerts (e.g., password reset vectors via Resend).</li>
          </ul>

          <h2>3. Third-Party Integrations</h2>
          <p>To operate at enterprise scale, we securely interact with specific third-party infrastructure:</p>
          <ul>
            <li><strong>Cloudflare (Turnstile & Edge):</strong> Used for DDoS mitigation and bot-challenge verification.</li>
            <li><strong>Apirone:</strong> Used for processing cryptographic payments. We do not process or store private keys or wallet addresses; we only record generated invoice IDs and blockchain confirmation statuses.</li>
            <li><strong>Resend:</strong> Utilized for securely dispatching transactional emails.</li>
            <li><strong>ipwho.is:</strong> Used specifically when you manually trigger the IP Checker tool.</li>
            <li><strong>GitHub:</strong> Used strictly for OAuth verification and importing your public avatar.</li>
          </ul>

          <h2>4. Cookies & Edge Storage</h2>
          <p>We do not use tracking pixels or advertising cookies. We utilize a single, strictly necessary <code>HttpOnly</code>, <code>Secure</code> Cookie (<code>auth_token</code>) to maintain your cryptographic session across the network.</p>

          <h2>5. Direct Messaging (Chat)</h2>
          <p>While Direct Messages (DMs) are private between the interacting nodes, they are not End-to-End Encrypted (E2EE) at the database layer. Administrators cannot passively read messages, but they can be extracted during severe abuse investigations.</p>

          <h2>6. Data Retention & Deletion</h2>
          <p>You have the right to request a complete wipe of your identity node. By navigating to your profile settings, you may permanently delete your account. Threads and replies you created can be manually wiped by you at any time prior to account deletion. For manual infrastructure wipes, contact the network administrators.</p>

        </div>
      </div>
    </article>
  );
}
