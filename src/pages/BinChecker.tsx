import { useState, useRef } from 'react';
import { SeoHead } from '@/components/SeoHead';
import { Square, Trash2, Search, Database, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Copy, Check, Download } from 'lucide-react';
import { ToolPageHeader } from '@/components/ToolPageHeader';

type CheckStatus = 'Found' | 'Not Found' | 'Error';
interface CheckedBin {
  raw: string; status: CheckStatus; brand?: string; country?: string;
  funding?: string; length?: number; rangeLow?: string; rangeHigh?: string;
  fullData?: any; time: number;
}

interface ExtractionMode {
  isActive: boolean;
  text: string;
  extractedBins: string[];
  isExtracting: boolean;
}

const FAQ_DATA = [
  { q: 'What is a BIN?', a: "A Bank Identification Number (BIN) refers to the first 6–8 digits of a payment card. It identifies the issuing institution and card network." },
  { q: 'What can BIN Lookup reveal?', a: "It reveals the card scheme (Visa, Amex), card type (Credit, Debit, Prepaid), card level, issuing bank, and country of origin." },
  { q: 'Why do developers use BIN checkers?', a: "For payment validation, fraud prevention, and UX optimization — applying 3DS rules, preventing cross-border errors, and blocking high-risk prepaid cards." },
];

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'Found') return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success-base)' }} />;
  if (status === 'Not Found') return <XCircle className="w-5 h-5" style={{ color: 'var(--error-base)' }} />;
  return <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning-base)' }} />;
}

export default function BinChecker() {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckedBin[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [extraction, setExtraction] = useState<ExtractionMode>({ isActive: false, text: '', extractedBins: [], isExtracting: false });
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleExtractBins = async () => {
    if (!extraction.text.trim()) return;
    setExtraction(prev => ({ ...prev, isExtracting: true }));
    
    try {
      const res = await fetch('/api/bin-extractor/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extraction.text, extract8Digit: false })
      });
      const data = await res.json() as any;
      
      if (data.success && data.bins) {
        setExtraction(prev => ({ ...prev, extractedBins: data.bins }));
        setInput(data.bins.join('\n'));
        setExtraction(prev => ({ ...prev, isActive: false }));
      }
    } catch (err) {
      console.error('[v0] Extraction error:', err);
    } finally {
      setExtraction(prev => ({ ...prev, isExtracting: false }));
    }
  };

  const handleStart = async () => {
    const bins = input.split('\n').map(c => c.trim().replace(/\D/g, '').substring(0, 8)).filter(b => b.length >= 6);
    if (!bins.length) return;
    setIsChecking(true); setProgress({ current: 0, total: bins.length }); setResults([]);
    abortRef.current = new AbortController();

    for (let i = 0; i < bins.length; i++) {
      if (abortRef.current?.signal.aborted) break;
      setProgress(p => ({ ...p, current: i + 1 }));
      const t0 = Date.now();
      try {
        const res = await fetch('/api/tools/check-bin', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bin: bins[i] }), signal: abortRef.current.signal,
        });
        const data = await res.json() as any;
        if (data.success && data.fullResponse?.data?.[0]) {
          const item = data.fullResponse.data[0];
          setResults(prev => [{ raw: bins[i], status: 'Found', brand: item.brand, country: item.country, funding: item.funding, length: item.pan_length, rangeLow: item.account_range_low, rangeHigh: item.account_range_high, fullData: item, time: Date.now() - t0 }, ...prev]);
        } else {
          setResults(prev => [{ raw: bins[i], status: 'Not Found', time: Date.now() - t0 }, ...prev]);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') break;
        setResults(prev => [{ raw: bins[i], status: 'Error', time: Date.now() - t0 }, ...prev]);
      }
    }
    setIsChecking(false);
  };

  const handleCopyResults = async () => {
    const text = results.map(r => `${r.raw}: ${r.status} ${r.brand ? `(${r.brand})` : ''}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportResults = () => {
    const csv = [
      ['BIN', 'Status', 'Brand', 'Funding', 'Country', 'Type', 'PAN Length', 'Range Low', 'Range High', 'Time (ms)'].join(','),
      ...results.map(r => [
        r.raw,
        r.status,
        r.brand || '',
        r.funding || '',
        r.country || '',
        r.fullData?.type || '',
        r.length || '',
        r.rangeLow || '',
        r.rangeHigh || '',
        r.time
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bin-results-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const found = results.filter(r => r.status === 'Found').length;
  const notFound = results.filter(r => r.status === 'Not Found').length;

  return (
    <div className="max-w-5xl mx-auto animation-fade-in">
      <SeoHead title="Lookup, Verify & Validate BIN - Bank Identification Number" description="Identify card brand, type, country, and issuing bank from BIN numbers." isTool={true} />

      <ToolPageHeader badge="Intelligence" badgeIcon={Database} title="BIN Lookup" description="Identify card brand, type, funding method, country, and issuing bank from BIN/IIN numbers. Extract BINs from text or manually input them." />

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setExtraction(prev => ({ ...prev, isActive: false, text: '', extractedBins: [] }))}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: !extraction.isActive ? 'var(--primary-base)' : 'var(--surface-hover)',
            color: !extraction.isActive ? 'white' : 'var(--text-primary)',
            border: `1px solid ${!extraction.isActive ? 'var(--primary-base)' : 'var(--border-default)'}`
          }}
        >
          Check BINs
        </button>
        <button
          onClick={() => setExtraction(prev => ({ ...prev, isActive: true }))}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: extraction.isActive ? 'var(--primary-base)' : 'var(--surface-hover)',
            color: extraction.isActive ? 'white' : 'var(--text-primary)',
            border: `1px solid ${extraction.isActive ? 'var(--primary-base)' : 'var(--border-default)'}`
          }}
        >
          Extract from Text
        </button>
      </div>

      {/* Extraction Mode */}
      {extraction.isActive && (
        <div className="card mb-8 animate-fade-up">
          <div className="p-6 sm:p-8">
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--text-tertiary)' }}>Paste Text or Raw Data</label>
              <textarea
                rows={6}
                placeholder="Paste card data, logs, or any text containing BINs (first 6+ digits)..."
                value={extraction.text}
                onChange={e => setExtraction(prev => ({ ...prev, text: e.target.value }))}
                className="w-full rounded-lg p-4 text-sm outline-none resize-none custom-scrollbar transition-all duration-200"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExtractBins}
                disabled={extraction.isExtracting || !extraction.text.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-60"
                style={{
                  background: extraction.isExtracting ? 'var(--primary-dark)' : 'linear-gradient(135deg, var(--primary-base) 0%, var(--primary-light) 100%)',
                  color: 'white',
                  boxShadow: extraction.isExtracting ? 'none' : '0 4px 12px rgba(243, 128, 32, 0.25)'
                }}
              >
                {extraction.isExtracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</> : <><Search className="w-4 h-4" /> Extract BINs</>}
              </button>
              <button
                onClick={() => setExtraction(prev => ({ ...prev, text: '', extractedBins: [] }))}
                className="px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-error-base/10 border"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--error-base)',
                  color: 'var(--error-base)'
                }}
              >
                Clear
              </button>
            </div>
            {extraction.extractedBins.length > 0 && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--primary-tint)', border: '1px solid var(--primary-ring)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--primary-base)' }}>
                  Found {extraction.extractedBins.length} BIN(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {extraction.extractedBins.slice(0, 10).map(bin => (
                    <span key={bin} className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                      {bin}
                    </span>
                  ))}
                  {extraction.extractedBins.length > 10 && (
                    <span className="px-2 py-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      +{extraction.extractedBins.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        {/* Input Section */}
        <div className="lg:col-span-3 card">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>BIN Input (one per line)</label>
              {input && (
                <button
                  onClick={() => { setInput(''); setResults([]); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-error-base/10 hover:text-error-base"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
            <textarea
              rows={9}
              placeholder={"424242\n555555\n378282\n371449\n4111111111111111"}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full rounded-lg p-4 text-sm outline-none resize-none custom-scrollbar transition-all duration-200 focus:ring-2"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                ringColor: 'var(--primary-ring)'
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleStart}
                disabled={isChecking || !input.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                style={{
                  background: isChecking ? 'var(--primary-dark)' : 'linear-gradient(135deg, var(--primary-base) 0%, var(--primary-light) 100%)',
                  color: 'white',
                  boxShadow: isChecking ? 'none' : '0 4px 12px rgba(243, 128, 32, 0.25)'
                }}
              >
                {isChecking ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Checking {progress.current}/{progress.total}</>
                ) : (
                  <><Search className="w-4 h-4" /> Start Lookup</>
                )}
              </button>
              {isChecking && (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-error-base/10 border"
                  style={{
                    background: 'transparent',
                    borderColor: 'var(--error-base)',
                    color: 'var(--error-base)'
                  }}
                  aria-label="Cancel lookup"
                >
                  <Square className="w-4 h-4" />
                </button>
              )}
            </div>
            {isChecking && (
              <div className="mt-4 space-y-2">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--primary-base), var(--primary-light))',
                      width: `${(progress.current / progress.total) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Processing: {progress.current} of {progress.total} BINs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-4 content-start">
          {[
            { label: 'Checked', value: results.length, color: 'var(--text-primary)', bg: 'var(--surface-hover)', borderColor: 'var(--border-default)' },
            { label: 'Found', value: found, color: 'var(--success-base)', bg: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' },
            { label: 'Not Found', value: notFound, color: 'var(--error-base)', bg: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-5 transition-all duration-200 hover:border-primary-base" style={{ background: stat.bg, border: `1px solid ${stat.borderColor}` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
              <p className="text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="card mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>Results</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyResults}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: copied ? 'var(--success-base)' : 'var(--surface-hover)',
                    color: copied ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${copied ? 'var(--success-base)' : 'var(--border-default)'}`
                  }}
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button
                  onClick={handleExportResults}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-primary-base/10 hover:text-primary-base"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {results.map((r, i) => (
                <div key={i} className="rounded-lg overflow-hidden transition-all duration-200 border" style={{ borderColor: 'var(--border-default)' }}>
                  <button
                    className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left transition-colors duration-200 hover:bg-surface-hover"
                    style={{ background: 'var(--surface-hover)' }}
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  >
                    <StatusIcon status={r.status} />
                    <span className="font-bold text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>{r.raw}</span>
                    {r.status === 'Found' && (
                      <>
                        <span className="badge-mono px-2 py-1 rounded text-xs" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--secondary-light)' }}>{r.brand}</span>
                        <span className="badge-mono px-2 py-1 rounded text-xs" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', color: 'rgb(168, 85, 247)' }}>{r.funding}</span>
                        <span className="badge-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.country}</span>
                      </>
                    )}
                    <span className="ml-auto badge-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.time}ms</span>
                    {r.status === 'Found' && (expandedIdx === i ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />)}
                  </button>
                  {expandedIdx === i && r.fullData && (
                    <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ borderTop: '1px solid var(--border-default)', background: 'var(--surface)' }}>
                      {[
                        ['Brand', r.fullData.brand],
                        ['Funding', r.fullData.funding],
                        ['Type', r.fullData.type],
                        ['PAN Length', r.fullData.pan_length],
                        ['Range Low', r.fullData.account_range_low],
                        ['Range High', r.fullData.account_range_high],
                      ].map(([k, v]) => (
                        <div key={k} className="p-3 rounded-lg transition-all duration-200" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-default)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>{k}</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="space-y-3 animate-fade-up">
        <h3 className="font-bold text-lg mb-6" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>Frequently Asked Questions</h3>
        {FAQ_DATA.map((item, i) => (
          <div key={i} className="rounded-lg overflow-hidden transition-all duration-200 border" style={{ borderColor: 'var(--border-default)', background: faqOpen === i ? 'var(--surface)' : 'transparent' }}>
            <button
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm transition-all duration-200 hover:bg-surface-hover"
              style={{ background: faqOpen === i ? 'var(--surface)' : 'var(--surface-hover)', color: 'var(--text-primary)', borderColor: faqOpen === i ? 'var(--primary-base)' : 'var(--border-default)' }}
            >
              {item.q}
              {faqOpen === i ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-base)' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
            </button>
            {faqOpen === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed animate-slide-down" style={{ background: 'var(--surface-hover)', borderTop: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
