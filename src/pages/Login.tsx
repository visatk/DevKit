import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

// standard github icon omitted for brevity, assuming standard implementation
function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>;
}

function InputField({
  label, type, placeholder, value, onChange, icon: Icon, autoComplete
}: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ElementType; autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-zinc-400">
        {label}
      </label>
      <div className="relative flex items-center bg-zinc-900/50 border border-zinc-800 rounded-xl transition-all duration-200 group-focus-within focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
        <Icon className="absolute left-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors duration-200 pointer-events-none" aria-hidden="true" />
        <input
          id={fieldId} required type={inputType} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} autoComplete={autoComplete}
          className="flex-1 bg-transparent py-3 pl-10 pr-12 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 outline-none w-full"
        />
        {isPassword && (
          <button
            type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 p-2 text-zinc-500 hover:text-orange-500 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const siteKey = import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAACZdr2afC17LFhhN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) { setError('Please complete the security verification.'); return; }
    setIsSubmitting(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTurnstileToken(''); setTurnstileKey(k => k + 1);
        throw new Error(data.error?.issues?.[0]?.message || data.error || 'Authentication failed');
      }
      await refreshUser();
      navigate('/');
    } catch (err: any) { setError(err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="flex items-center justify-center min-h-[100dvh] p-4 relative isolate">
      <SeoHead title="Sign In | DevKit" description="Sign in to access the DevKit platform securely." />

      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-orange-500/10 blur-[100px] animate-pulse-slow" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow" style={{ transform: 'translateZ(0)' }} />
      </div>

      <section className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />

        <div className="p-8">
          <header className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <Logo className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-50 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-zinc-400">Sign in to your account to access all features</p>
          </header>

          <button onClick={() => window.location.href = '/api/auth/github'} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-zinc-100 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all">
            <GitHubIcon className="w-5 h-5" /> Continue with GitHub
          </button>

          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-zinc-800" />
            <span className="flex-shrink-0 mx-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Or continue with email</span>
            <div className="flex-grow border-t border-zinc-800" />
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-500">Sign in failed</p>
                <p className="text-sm text-red-400 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <InputField label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} autoComplete="email" />
            <InputField label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} icon={Lock} autoComplete="current-password" />

            <div className="flex justify-center bg-zinc-900/50 rounded-xl p-2 border border-zinc-800">
              <Turnstile key={turnstileKey} siteKey={siteKey} onSuccess={setTurnstileToken} onError={() => setTurnstileToken('')} onExpire={() => setTurnstileToken('')} options={{ theme: 'dark', size: 'flexible' }} />
            </div>

            <button type="submit" disabled={isSubmitting || !turnstileToken} className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-zinc-100 text-zinc-950 hover:bg-orange-500 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <><LogIn className="w-4 h-4" /> Sign In</>}
            </button>
          </form>

          <div className="text-center text-sm mt-8 pt-6 border-t border-zinc-800 text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors inline-flex items-center gap-1">
              Create account <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
