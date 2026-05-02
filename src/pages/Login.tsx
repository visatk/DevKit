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
  const fieldId = `field-${label.toLowerCase().replace(' ', '-')}`;

  return (
    <div className="form-group">
      <label htmlFor={fieldId} className="form-label">
        {label}
      </label>
      <div
        className="relative flex items-center rounded-lg transition-all duration-200"
        style={{
          background: 'var(--surface-hover)',
          border: `1.5px solid ${focused ? 'var(--primary-base)' : 'var(--border-default)'}`,
          boxShadow: focused ? '0 0 0 3px var(--primary-ring)' : 'none',
        }}
      >
        <Icon 
          className="absolute left-3.5 w-4 h-4 shrink-0 transition-colors duration-200 pointer-events-none" 
          style={{ color: focused ? 'var(--primary-base)' : 'var(--text-tertiary)' }} 
          aria-hidden="true"
        />
        <input
          id={fieldId}
          required
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent py-3 pl-10 pr-12 text-sm font-medium outline-none"
          style={{ color: 'var(--text-primary)' }}
          aria-required="true"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-2 rounded transition-colors duration-200 hover:text-primary-base focus:outline-offset-2 focus:outline-2 focus:outline-primary-base"
            style={{ color: 'var(--text-tertiary)', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
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
    <main className="flex items-center justify-center min-h-screen p-4 relative" role="main" aria-label="Sign in page">
      <SeoHead title="Sign In | DevKit" description="Sign in to access the DevKit platform securely. DevKit is a professional development toolkit for modern web applications." />

      {/* Decorative gradient backgrounds - non-interactive */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full pointer-events-none -z-10 opacity-40 hidden lg:block" aria-hidden="true"
        style={{ background: 'radial-gradient(circle, var(--primary-ring) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full pointer-events-none -z-10 opacity-30 hidden lg:block" aria-hidden="true"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', filter: 'blur(100px)' }}
      />

      <section className="w-full max-w-md rounded-xl overflow-hidden animate-fade-up card-elevated"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Top accent border */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-base via-primary-light to-transparent" aria-hidden="true" />

        <div className="p-8 sm:p-10">
          {/* Page Header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)' }}>
                <Logo className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
              Welcome Back
            </h1>
            <p className="text-sm text-text-secondary">
              Sign in to your account to access all DevKit features
            </p>
          </header>

          {/* GitHub OAuth Button - Social login option */}
          <button
            onClick={() => window.location.href = '/api/auth/github'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border hover:border-primary-base hover:bg-primary-tint active:scale-95 focus:outline-offset-2 focus:outline-2 focus:outline-primary-base"
            style={{ background: 'var(--surface-hover)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)' }}
            aria-label="Sign in with GitHub account"
          >
            <GitHubIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>Continue with GitHub</span>
          </button>

          {/* Divider - Alternate authentication method */}
          <div className="relative my-6" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Error Alert - Accessibility-friendly notification */}
          {error && (
            <div 
              className="mb-5 flex items-start gap-3 p-4 rounded-lg animate-fade-in" 
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.3)' }}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 flex-shrink-0" style={{ color: 'var(--error-base)' }} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--error-base)' }}>Sign in failed</p>
                <p className="text-sm mt-1" style={{ color: 'var(--error-base)' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Input */}
            <InputField 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={setEmail} 
              icon={Mail} 
              autoComplete="email" 
            />
            
            {/* Password Input */}
            <InputField 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={setPassword} 
              icon={Lock} 
              autoComplete="current-password" 
            />

            {/* Security Verification - Turnstile */}
            <fieldset className="flex justify-center py-4 rounded-lg" style={{ background: 'var(--surface-hover)', border: '1.5px solid var(--border-default)' }}>
              <legend className="sr-only">Security verification</legend>
              <Turnstile
                key={turnstileKey}
                siteKey={siteKey}
                onSuccess={setTurnstileToken}
                onError={() => setTurnstileToken('')}
                onExpire={() => setTurnstileToken('')}
                options={{ theme: 'auto', size: 'flexible' }}
              />
            </fieldset>

            {/* Submit Button - Primary action */}
            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken}
              className="btn-lg w-full flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: isSubmitting ? 'var(--primary-dark)' : 'linear-gradient(135deg, var(--primary-base) 0%, var(--primary-light) 100%)',
                color: 'white',
                boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(243, 128, 32, 0.25)',
                minHeight: '44px'
              }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> <span>Signing in</span></>
              ) : (
                <><LogIn className="w-4 h-4" aria-hidden="true" /> <span>Sign In</span></>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="text-center text-sm mt-8 pt-8 border-t border-border-default" style={{ color: 'var(--text-secondary)' }}>
            <span>Don&apos;t have an account? </span>
            <Link 
              to="/register" 
              className="font-semibold hover:text-primary-base hover:underline transition-colors duration-200 inline-flex items-center gap-1 focus:outline-offset-2 focus:outline-2 focus:outline-primary-base" 
              style={{ color: 'var(--primary-base)' }}
            >
              Create account <ArrowRight className="w-3 h-3 mt-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
