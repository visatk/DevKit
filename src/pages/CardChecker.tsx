import { useState, useRef, useEffect } from 'react';
import { SeoHead } from '@/components/SeoHead';
import { Square, Activity, Trash2, Zap, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface CheckCardResponse {
  success: boolean;
  status: string;
  rawMsg?: string;
  cleanMsg?: string;
  binInfo?: string;
  formattedOutput?: string;
  message?: string;
}

interface CheckResult {
  payload: string;
  status: string;
  formattedOutput?: string;
  rawHtml?: string;
  cleanMsg?: string;
}

export default function CardChecker() {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStart = async () => {
    // Extract formatted vectors from input text
    const lines = input.split('\n').map(c => c.trim()).filter(c => c.length >= 15 && c.includes('|'));
    
    if (lines.length === 0) return;

    setIsChecking(true);
    setProgress({ current: 0, total: lines.length });
    setResults([]);
    abortControllerRef.current = new AbortController();

    for (let i = 0; i < lines.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break;
      setProgress(p => ({ ...p, current: i + 1 }));
      
      try {
        const res = await fetch('/api/tools/check-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardPayload: lines[i] }),
          signal: abortControllerRef.current.signal
        });
        
        const data = await res.json() as CheckCardResponse;
        
        if (data.success) {
          setResults(prev => [{
            payload: lines[i],
            status: data.status,
            formattedOutput: data.formattedOutput,
            rawHtml: data.rawMsg,
            cleanMsg: data.cleanMsg
          }, ...prev]);
        } else {
          setResults(prev => [{
            payload: lines[i],
            status: 'Error',
            formattedOutput: data.formattedOutput || `${lines[i]} - Error`
          }, ...prev]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') break;
        setResults(prev => [{
          payload: lines[i],
          status: 'Error',
          formattedOutput: `${lines[i]} - Timeout`
        }, ...prev]);
      }
    }
    setIsChecking(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsChecking(false);
  };

  useEffect(() => { return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); }; }, []);

  const stats = {
    live: results.filter(r => r.status === 'Live').length,
    die: results.filter(r => r.status === 'Die').length,
    unknown: results.filter(r => r.status === 'Unknown' || r.status === 'Error').length,
  };

  const percentComplete = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="CC Checker - Live CVV CC Checker" 
        description="CC Checker With Live Auth Gates. Live CVV, Live Card Checker." 
        isTool={true}
      />
      
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Auth Gateway Checker</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Bulk Live CC Checker with native BIN resolution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-2xl shadow-orange-500/5">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Start Checking
              </label>
              <button onClick={() => setInput('')} disabled={isChecking || !input} className="text-zinc-400 hover:text-red-500 disabled:opacity-50 transition-colors cursor-pointer">
                <Trash2 className="size-4" />
              </button>
            </div>
            
            <textarea 
              value={input} onChange={(e) => setInput(e.target.value)} disabled={isChecking}
              placeholder="Format: 1234567890123456|12|2030|123"
              className="flex-1 w-full bg-transparent p-6 font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar placeholder:text-zinc-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
            />
            
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-raised)] flex gap-3">
              {!isChecking ? (
                <button onClick={handleStart} disabled={!input.trim()} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--text-primary)] hover:bg-[var(--orange)] text-[var(--bg)] hover:text-[var(--text-primary)] font-bold rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.98] cursor-pointer">
                  <Zap className="size-4" /> Initialize
                </button>
              ) : (
                <button onClick={handleStop} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer shadow-red-500/20">
                  <Square className="size-4 fill-current" /> Terminate
                </button>
              )}
            </div>
          </div>

          {progress.total > 0 && (
            <div className="glass rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Activity className="size-4" /> Progress</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{progress.current} / {progress.total}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-out" style={{ width: `${percentComplete}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none mb-1">{stats.live}</span>
              <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Live</span>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-red-700 dark:text-red-400 leading-none mb-1">{stats.die}</span>
              <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-widest">Die</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none mb-1">{stats.unknown}</span>
              <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-widest">Unknown</span>
            </div>
          </div>

          <div className="flex-1 glass rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-transparent">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <span className="text-sm font-semibold text-zinc-500">Awaiting Vectors...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((res, idx) => (
                    <div key={idx} className={`flex flex-col p-4 rounded-xl border text-sm transition-colors ${res.status === 'Live' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : res.status === 'Die' ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                      <div className="flex items-center gap-3 mb-2">
                         {res.status === 'Live' ? <CheckCircle2 className="size-4 shrink-0" /> : res.status === 'Die' ? <XCircle className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                         <span className="font-bold text-xs uppercase tracking-wider">{res.status}</span>
                      </div>
                      
                      <div className="font-mono text-xs bg-black/5 dark:bg-white/5 p-2.5 rounded-lg select-all text-zinc-800 dark:text-zinc-200">
                        {res.formattedOutput}
                      </div>
                      
                      {res.cleanMsg && (
                        <div className="mt-2 text-[11px] opacity-70 italic font-mono pl-1 border-l-2 border-current">
                          {res.cleanMsg}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
