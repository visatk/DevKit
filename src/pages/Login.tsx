import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function InputField({
  label, type, placeholder, value, onChange, icon: Icon, autoComplete
}: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ElementType; autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label className="badge-mono block mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</label>
      <div
        className="relative flex items-center rounded-lg transition-all duration-200"
        style={{
          background: 'var(--surface-hover)',
          border: `1px solid ${focused ? 'var(--primary-base)' : 'var(--border-default)'}`,
          boxShadow: focused ? '0 0 0 3px var(--primary-ring)' : 'none',
        }}
      >
        <Icon className="absolute left-3 w-4 h-4 shrink-0 transition-colors duration-200" style={{ color: focused ? 'var(--primary-base)' : 'var(--text-tertiary)' }} />
        <input
          required
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent py-3 pl-10 pr-3 text-sm font-medium outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-1 rounded transition-colors duration-200 hover:text-primary-base"
            style={{ color: 'var(--text-tertiary)' }}
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

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error');
    if (err) setError(decodeURIComponent(err.replace(/\+/g, ' ')));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) { setError('Please complete the security verification.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        setTurnstileToken('');
        setTurnstileKey(k => k + 1);
        throw new Error(data.error?.issues?.[0]?.message || data.error || 'Authentication failed');
      }
      await refreshUser();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 relative">
      <SeoHead title="Sign In | DevKit" description="Sign in to access the DevKit platform." />

      {/* Ambient gradient backgrounds */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full pointer-events-none -z-10 opacity-40 hidden lg:block"
        style={{ background: 'radial-gradient(circle, var(--primary-ring) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full pointer-events-none -z-10 opacity-30 hidden lg:block"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', filter: 'blur(100px)' }}
      />

      <div className="w-full max-w-md rounded-xl overflow-hidden animate-fade-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Top gradient accent */}
        <div className="h-px w-full bg-gradient-to-r from-primary-base via-primary-light to-transparent" />

        <div className="p-8 sm:p-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)' }}>
                <Logo className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
              Welcome Back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* GitHub OAuth Button */}
          <button
            onClick={() => window.location.href = '/api/auth/github'}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border hover:bg-surface-hover active:scale-95"
            style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          >
            <GitHubIcon className="w-4 h-4" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-semibold uppercase tracking-widest" style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}>
                Or with Email
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3 rounded-lg animate-fade-in"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--error-base)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--error-base)' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} autoComplete="email" />
            <InputField label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} icon={Lock} autoComplete="current-password" />

            {/* Turnstile */}
            <div className="flex justify-center py-3 rounded-lg" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-default)' }}>
              <Turnstile
                key={turnstileKey}
                siteKey={siteKey}
                onSuccess={setTurnstileToken}
                onError={() => setTurnstileToken('')}
                onExpire={() => setTurnstileToken('')}
                options={{ theme: 'auto', size: 'flexible' }}
              />
            </div>

            {/* Submit Button */}
            <button
              disabled={isSubmitting || !turnstileToken}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: isSubmitting ? 'var(--primary-dark)' : 'linear-gradient(135deg, var(--primary-base) 0%, var(--primary-light) 100%)',
                color: 'white',
                boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(243, 128, 32, 0.25)'
              }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm mt-6 pt-6 border-t border-border-default" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold hover:text-primary-base transition-colors duration-200 inline-flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              Sign up <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
