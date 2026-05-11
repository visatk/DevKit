import { useState, useRef, useEffect } from 'react';
import { SeoHead } from '@/components/SeoHead';
import { Square, Activity, Trash2, Zap, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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

  // ... business logic stays identical ...
  const handleStart = async () => {
    const lines = input.split('\n').map(c => c.trim()).filter(c => c.length >= 15 && c.includes('|'));
    if (lines.length === 0) return;
    setIsChecking(true); setProgress({ current: 0, total: lines.length });
    setResults([]); abortControllerRef.current = new AbortController();

    for (let i = 0; i < lines.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break;
      setProgress(p => ({ ...p, current: i + 1 }));
      try {
        const res = await fetch('/api/tools/check-card', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardPayload: lines[i] }),
          signal: abortControllerRef.current.signal
        });
        const data = await res.json();
        setResults(prev => [{
          payload: lines[i], status: data.success ? data.status : 'Error',
          formattedOutput: data.formattedOutput || `${lines[i]} - ${data.success ? '' : 'Error'}`,
          rawHtml: data.rawMsg, cleanMsg: data.cleanMsg
        }, ...prev]);
      } catch (err: any) {
        if (err.name === 'AbortError') break;
        setResults(prev => [{ payload: lines[i], status: 'Error', formattedOutput: `${lines[i]} - Timeout` }, ...prev]);
      }
    }
    setIsChecking(false);
  };

  const handleStop = () => { if (abortControllerRef.current) abortControllerRef.current.abort(); setIsChecking(false); };
  useEffect(() => { return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); }; }, []);

  const stats = {
    live: results.filter(r => r.status === 'Live').length,
    die: results.filter(r => r.status === 'Die').length,
    unknown: results.filter(r => r.status === 'Unknown' || r.status === 'Error').length,
  };
  const percentComplete = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="w-full">
      <SeoHead title="CC Checker - Live Auth Gateway" description="Bulk Live CC Checker with native BIN resolution." isTool={true} />
      
      <header className="mb-8 border-b border-zinc-800/50 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-50 mb-2">Auth Gateway Checker</h1>
        <p className="text-zinc-400">Bulk Live CC Checker with native BIN resolution.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl flex flex-col h-[500px]">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Input Stream</span>
              <button onClick={() => setInput('')} disabled={isChecking || !input} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <textarea 
              value={input} onChange={(e) => setInput(e.target.value)} disabled={isChecking}
              placeholder="1234567890123456|12|2030|123"
              className="flex-1 w-full bg-transparent p-5 font-mono text-sm leading-relaxed text-zinc-300 outline-none resize-none placeholder:text-zinc-700 disabled:opacity-50 focus:bg-[#0a0a0a] transition-colors"
            />
            
            <div className="p-4 border-t border-zinc-800 shrink-0">
              {!isChecking ? (
                <button onClick={handleStart} disabled={!input.trim()} className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 text-zinc-950 hover:bg-orange-500 hover:text-white font-bold rounded-xl transition-all disabled:opacity-50">
                  <Zap className="w-4 h-4" /> Initialize
                </button>
              ) : (
                <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all">
                  <Square className="w-4 h-4" /> Terminate
                </button>
              )}
            </div>
          </div>

          {progress.total > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Progress</span>
                <span className="text-sm font-bold text-zinc-100">{progress.current} / {progress.total}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out" style={{ width: `${percentComplete}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-emerald-500">{stats.live}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-500/70 uppercase">Live</span>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-red-500">{stats.die}</span>
              <span className="text-[10px] font-mono font-bold text-red-500/70 uppercase">Die</span>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-amber-500">{stats.unknown}</span>
              <span className="text-[10px] font-mono font-bold text-amber-500/70 uppercase">Unknown</span>
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
               <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Output Terminal</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-zinc-500 font-mono text-sm">
                  &gt; Waiting for execution...
                </div>
              ) : (
                results.map((res, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border text-sm font-mono ${res.status === 'Live' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : res.status === 'Die' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    <div className="flex items-center gap-2 mb-2">
                       {res.status === 'Live' ? <CheckCircle2 className="w-3.5 h-3.5" /> : res.status === 'Die' ? <XCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                       <span className="font-bold text-[10px] uppercase tracking-widest">{res.status}</span>
                    </div>
                    <div className="bg-black/40 p-2 rounded text-zinc-300 break-all select-all text-xs">
                      {res.formattedOutput}
                    </div>
                    {res.cleanMsg && (
                      <div className="mt-2 text-[10px] opacity-80 border-l border-current pl-2">
                        {res.cleanMsg}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
