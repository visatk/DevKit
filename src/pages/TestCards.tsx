import { useState, useMemo } from 'react';
import { SeoHead } from '@/components/SeoHead';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Copy, Check, Sparkles, Code2, FileJson, FileText, CreditCard, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { ToolPageHeader, ToolCard } from '@/components/ToolPageHeader';

const PRESET_BINS = [
  { name: 'Stripe Visa',     bin: '424242' },
  { name: 'Stripe MC',       bin: '555555' },
  { name: 'Braintree Amex',  bin: '378282' },
  { name: 'Discover Test',   bin: '601100' },
  { name: 'JCB QA',          bin: '352800' },
];

type CardData = { network?: string; number: string; expMonth: string; expYear: string; cvv: string; formattedString?: string; };
type ExportFormat = 'pipe' | 'json' | 'csv';

const FAQ_DATA = [
  { q: 'What is a test credit card generator?', a: 'Creates dummy card numbers that pass the Luhn Check. Used strictly by developers to test payment gateways like Stripe, PayPal, or Braintree in sandbox environments.' },
  { q: 'Can generated cards make real purchases?', a: 'No. These cards do not correspond to any real bank accounts and hold no financial validity. They will be instantly declined on live gateways.' },
  { q: 'What is the Luhn algorithm?', a: 'The Luhn algorithm (Mod 10) is a checksum formula used to validate identification numbers, primarily credit card numbers. Every generated card satisfies this algorithm.' },
];

export default function TestCards() {
  const [bin, setBin] = useState('424242');
  const [quantity, setQuantity] = useState(10);
  const [cards, setCards] = useState<CardData[]>([]);
  const [metadata, setMetadata] = useState<{ networkDetected: string; vectorLength: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState<ExportFormat>('pipe');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const { copiedText, copy } = useCopyToClipboard();

  const detectedNetwork = useMemo(() => {
    if (/^3[47]/.test(bin)) return 'American Express';
    if (/^5[1-5]/.test(bin)) return 'Mastercard';
    if (/^4/.test(bin)) return 'Visa';
    if (/^6(?:011|5)/.test(bin)) return 'Discover';
    if (/^35/.test(bin)) return 'JCB';
    return bin.length > 0 ? 'Custom' : 'Enter BIN...';
  }, [bin]);

  const handleGenerate = async () => {
    if (!bin.trim()) { setError('Enter a valid BIN.'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/tools/generate-cards', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin, quantity }),
      });
      const data = await res.json() as { success?: boolean; cards?: CardData[]; metadata?: any; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed.');
      if (data.cards) { setCards(data.cards); if (data.metadata) setMetadata(data.metadata); }
    } catch (err: unknown) { 
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const output = useMemo(() => {
    if (!cards.length) return '';
    if (format === 'pipe') return cards.map(c => c.formattedString || `${c.number}|${c.expMonth}|${c.expYear}|${c.cvv}`).join('\n');
    if (format === 'csv') return 'Network,Number,ExpM,ExpY,CVV\n' + cards.map(c => `${c.network || ''},${c.number},${c.expMonth},${c.expYear},${c.cvv}`).join('\n');
    if (format === 'json') return JSON.stringify(cards.map(({ formattedString, ...r }) => r), null, 2);
    return '';
  }, [cards, format]);

  return (
    <div className="max-w-5xl mx-auto animation-fade-in">
      <SeoHead title="Card Generator | CC Generator" description="Generate Luhn-valid dummy credit card numbers for testing payment gateways." isTool={true} />

      <ToolPageHeader badge="Generator" badgeIcon={Sparkles} title="CC Generator" description="Generate Luhn-valid dummy credit card numbers for Stripe, PayPal, Braintree, and other payment gateways." />

      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        <ToolCard className="lg:col-span-2">
          <div className="p-5 space-y-5">
            <div>
              <label className="badge-mono block mb-2 text-[var(--text-muted)]">BIN / IIN</label>
              <input
                type="text"
                value={bin}
                onChange={e => setBin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="424242"
                maxLength={8}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold outline-none transition-all bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_var(--orange-dim)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              <div className="mt-2 flex items-center gap-2">
                <CreditCard className="size-3.5 text-[var(--text-muted)]" />
                <span className="badge-mono text-orange-500">{detectedNetwork}</span>
              </div>
            </div>

            <div>
              <label className="badge-mono block mb-2 text-[var(--text-muted)]">Quick Presets</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_BINS.map(p => (
                  <button
                    key={p.bin}
                    onClick={() => setBin(p.bin)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-left transition-all active:scale-95"
                    style={{
                      background: bin === p.bin ? 'var(--orange-dim)' : 'var(--surface-raised)',
                      border: `1px solid ${bin === p.bin ? 'var(--orange-border)' : 'var(--border)'}`,
                      color: bin === p.bin ? 'var(--orange)' : 'var(--text-secondary)',
                    }}
                  >
                    <div>{p.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', opacity: 0.7 }}>{p.bin}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="badge-mono text-[var(--text-muted)]">Quantity</label>
                <span className="badge-mono text-orange-500">{quantity}</span>
              </div>
              <input
                type="range" min={1} max={100} value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between badge-mono mt-1 text-[var(--text-muted)] text-[10px]">
                <span>1</span><span>100</span>
              </div>
            </div>

            <div>
              <label className="badge-mono block mb-2 text-[var(--text-muted)]">Export Format</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([['pipe', 'Pipe', FileText], ['json', 'JSON', FileJson], ['csv', 'CSV', Code2]] as const).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setFormat(id as ExportFormat)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: format === id ? 'var(--orange-dim)' : 'var(--surface-raised)',
                      border: `1px solid ${format === id ? 'var(--orange-border)' : 'var(--border)'}`,
                      color: format === id ? 'var(--orange)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="size-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="size-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !bin.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98] bg-[var(--orange)] text-white"
            >
              {isLoading ? <><RefreshCw className="size-4 animate-spin" /> Generating...</> : <><Sparkles className="size-4" /> Generate {quantity} Cards</>}
            </button>
          </div>
        </ToolCard>

        <ToolCard className="lg:col-span-3">
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>Generated Cards</h3>
                {metadata && <p className="badge-mono text-[10px] text-[var(--text-muted)]">{metadata.networkDetected} · {metadata.vectorLength} digits</p>}
              </div>
              {output && (
                <button
                  onClick={() => copy(output)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[var(--orange-dim)] border border-[var(--orange-border)] text-[var(--orange)]"
                >
                  {copiedText === output ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedText === output ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={output || 'Generated cards will appear here...'}
              rows={18}
              className="flex-1 w-full rounded-xl p-4 text-xs outline-none resize-none custom-scrollbar bg-[var(--surface-raised)] border border-[var(--border)]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: output ? 'var(--text-primary)' : 'var(--text-muted)',
                lineHeight: '1.8',
              }}
            />
          </div>
        </ToolCard>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-lg mb-4 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>FAQ</h3>
        {FAQ_DATA.map((item, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-[var(--border)]">
            <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm bg-[var(--surface)] text-[var(--text-primary)]">
              {item.q}
              <ChevronDown className={`size-4 shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''} text-[var(--text-muted)]`} />
            </button>
            {faqOpen === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed bg-[var(--surface-raised)] border-t border-[var(--border)] text-[var(--text-secondary)]">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
