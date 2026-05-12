import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Validating cryptographic array...');
  
  // High-level execution guard to prevent React 18 Strict Mode dual-firing race conditions
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Null verification parameter detected.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json() as { success?: boolean; error?: string };
        
        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Address mapping sequence verified successfully.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification protocol failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network integrity lost during the handshake protocol.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 animation-fade-in relative z-10">
      <SeoHead title="Link Authentication" description="Execution of the DevKit node verification protocol." />
      
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
        
        {status === 'loading' && (
          <>
            <div className="mx-auto size-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Loader2 className="size-8 text-orange-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">Authenticating Sequence</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-6">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto size-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="size-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">Node Verified</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-8 leading-relaxed">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
              Proceed to Sign In <ArrowRight className="size-4" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto size-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <XCircle className="size-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">Execution Fault</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-8 leading-relaxed">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-orange-500 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-orange-500 dark:hover:text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]">
              Return to Gateway
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
