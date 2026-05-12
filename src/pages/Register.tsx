import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { AlertTriangle, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';
import React from 'react';

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function InputField({ label, type, placeholder, value, onChange, icon: Icon, hint }: any) {
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl transition-all duration-300 ${focused ? 'bg-[var(--surface-active)] ring-2 ring-[var(--orange)] shadow-[0_0_15px_var(--orange-dim)]' : 'bg-[var(--surface-raised)] ring-1 ring-[var(--border)] hover:ring-[var(--border-strong)]'}`}>
        <Icon className={`absolute left-4 w-4 h-4 transition-colors ${focused ? 'text-[var(--orange)]' : 'text-[var(--text-muted)]'}`} />
        <input
          required
          type={isPassword && showPw ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-3.5 pl-11 pr-12 text-sm font-medium outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-[var(--text-muted)] pl-1">{hint}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAACZdr2afC17LFhhN';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!turnstileToken) { setError('Complete the node security verification.'); return; }
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, turnstileToken }),
      });
      const data = await response.json() as any;
      
      if (!response.ok) {
        setTurnstileToken(''); setTurnstileKey(k => k + 1);
        throw new Error(data.error?.issues?.[0]?.message || data.error || 'Vector generation failed.');
      }
      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[100dvh] p-4 sm:p-6 relative isolate">
      <SeoHead title="Construct Identity | DevKit" description="Register a cryptographic identity for DevKit." />

      <div className="absolute inset-0 -z-10 bg-[var(--bg)]">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--orange)]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <section className="w-full max-w-[420px] glass rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-[var(--border)] animation-fade-up">
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--orange)] to-amber-500" />

        <div className="p-8 sm:p-10">
          <header className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--surface-raised)] border border-[var(--border)] mb-5 shadow-inner">
              <User className="w-7 h-7 text-[var(--text-secondary)]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-2 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
              Construct Identity
            </h1>
            <p className="text-sm font-medium text-[var(--text-muted)]">Register your developer profile.</p>
          </header>

          <button onClick={() => window.location.href = '/api/auth/github'} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-bold transition-all border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] hover:border-[var(--text-secondary)] active:scale-[0.98] text-[var(--text-primary)]">
            <GitHubIcon className="w-5 h-5" /> Register via GitHub
          </button>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-strong)]" /></div>
            <div className="relative flex justify-center">
              <span className="px-4 text-[10px] font-black uppercase tracking-widest bg-[var(--surface)] text-[var(--text-muted)] rounded-full border border-[var(--border)]">OR PROTOCOL</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animation-fade-in">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-500">Generation Failed</p>
                <p className="text-xs font-medium text-red-400 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Identifier" type="text" placeholder="sys_admin_99" value={username} onChange={setUsername} icon={User} hint="Alphanumerics and underscores only" />
            <InputField label="Communication Node" type="email" placeholder="relay@network.local" value={email} onChange={setEmail} icon={Mail} />
            <InputField label="Cryptographic Key" type="password" placeholder="••••••••••••" value={password} onChange={setPassword} icon={Lock} hint="Requires highly-entropic mix (Uppercase, Lowercase, Digits)" />

            <div className="pt-3 flex justify-center">
              <div className="rounded-xl overflow-hidden ring-1 ring-[var(--border)] inline-block">
                <Turnstile key={turnstileKey} siteKey={siteKey} onSuccess={setTurnstileToken} onError={() => setTurnstileToken('')} options={{ theme: 'dark' }} />
              </div>
            </div>

            <button type="submit" disabled={isLoading || !turnstileToken} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-[var(--orange)] text-white shadow-lg shadow-[var(--orange-dim)] hover:shadow-[var(--orange-border)] mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              {isLoading ? 'Compiling Profile...' : 'Execute Registration'}
            </button>
          </form>

          <div className="text-center text-xs font-semibold mt-8 pt-6 border-t border-[var(--border)] text-[var(--text-muted)]">
            Identity already constructed? {' '}
            <Link to="/login" className="text-[var(--orange)] hover:text-amber-400 transition-colors uppercase tracking-wider ml-1">
              Initialize <ArrowRight className="inline w-3 h-3 -mt-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
