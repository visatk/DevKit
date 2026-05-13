import { useState, useRef } from "react";

// ─── Interfaces & Types ────────────────────────────────────────────────────
interface BinMetadata {
  brand?: string;
  funding?: string;
  type?: string;
  country?: string;
  pan_length?: number;
  account_range_low?: string;
  account_range_high?: string;
}

interface CheckBinResponse {
  success: boolean;
  metadata?: BinMetadata;
  message?: string;
}

interface ExtractBinResponse {
  success: boolean;
  bins?: string[];
  error?: string;
}

type StatusType = "Found" | "Not Found" | "Error";

interface ResultData {
  raw: string;
  status: StatusType;
  data: BinMetadata | null;
  time: number;
}

interface ProgressState {
  current: number;
  total: number;
}

// ─── UI Constants ──────────────────────────────────────────────────────────
const BRAND_COLORS: Record<string, { color: string; accent: string }> = {
  VISA: { color: "#1a1f71", accent: "#f7a600" },
  MASTERCARD: { color: "#eb001b", accent: "#f79e1b" },
  AMEX: { color: "#007bc1", accent: "#00aeef" },
  DISCOVER: { color: "#e65c00", accent: "#f9d423" },
  JCB: { color: "#003087", accent: "#009f6b" },
  UNIONPAY: { color: "#d93a30", accent: "#ffffff" },
};

const BRAND_SYMBOLS: Record<string, string> = { VISA: "◈", MASTERCARD: "◉", AMEX: "◆", DISCOVER: "◇", JCB: "✦" };

function Scanline() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="h-[1px] bg-white mb-1.5" />
      ))}
    </div>
  );
}

function StatusPip({ status }: { status: StatusType }) {
  const cfg = {
    Found: { color: "#10b981", label: "FOUND", glow: "0 0 8px #10b98188" },
    "Not Found": { color: "#ef4444", label: "MISS", glow: "0 0 8px #ef444488" },
    Error: { color: "#f59e0b", label: "ERR", glow: "0 0 8px #f59e0b88" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span 
        className="w-1.5 h-1.5 sm:w-[7px] sm:h-[7px] rounded-full shrink-0" 
        style={{ background: cfg.color, boxShadow: cfg.glow }} 
      />
      <span 
        className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] font-bold" 
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </span>
  );
}

function BrandChip({ brand }: { brand: string }) {
  const normalizedBrand = brand.toUpperCase();
  const cfg = BRAND_COLORS[normalizedBrand] || { color: "#6b7280", accent: "#9ca3af" };
  return (
    <span 
      className="font-mono text-[9px] sm:text-[11px] font-bold tracking-[0.1em] px-1.5 sm:px-2 py-0.5 rounded-[3px] truncate"
      style={{
        background: `${cfg.color}22`, 
        border: `1px solid ${cfg.color}55`,
        color: cfg.accent,
      }}
    >
      {BRAND_SYMBOLS[normalizedBrand] || "◻"} {normalizedBrand}
    </span>
  );
}

function FundingTag({ type }: { type: string }) {
  const normalizedType = type.toUpperCase();
  const map: Record<string, string> = {
    CREDIT: "#818cf8",
    DEBIT: "#34d399",
    PREPAID: "#fb923c",
    GIFT: "#f472b6",
  };
  const c = map[normalizedType] || "#9ca3af";
  return (
    <span 
      className="font-mono text-[8px] sm:text-[10px] font-bold tracking-[0.12em] px-1.5 sm:px-1.5 py-0.5 rounded-[2px]"
      style={{ background: `${c}18`, border: `1px solid ${c}44`, color: c }}
    >
      {normalizedType}
    </span>
  );
}

function ResultRow({ result, index, expanded, onToggle }: { result: ResultData; index: number; expanded: boolean; onToggle: () => void }) {
  const { raw, status, data, time } = result;
  
  const gridFields = data ? [
    ["BRAND", data.brand],
    ["FUNDING", data.funding],
    ["COUNTRY", data.country],
    ["PAN LEN", data.pan_length],
    ["RANGE LOW", data.account_range_low?.slice(-8)],
    ["RANGE HIGH", data.account_range_high?.slice(-8)],
    ["TIME", `${time}ms`],
  ] : [];

  return (
    <div className="border border-[#1f2937] rounded-md overflow-hidden bg-[#0d1117] transition-colors duration-200 hover:border-[#374151]">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 px-3 sm:px-4 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="font-mono text-[10px] sm:text-[11px] text-[#4b5563] min-w-[20px] sm:min-w-[24px] select-none shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <StatusPip status={status} />
        <span className="font-mono text-xs sm:text-[13px] font-bold tracking-[0.15em] text-[#e2e8f0] flex-1 truncate">
          {raw}
        </span>
        
        {data && (
          <div className="hidden sm:flex items-center gap-2 overflow-hidden flex-shrink">
            {data.brand && <BrandChip brand={data.brand} />}
            {data.funding && <FundingTag type={data.funding} />}
            <span className="font-mono text-[9px] sm:text-[10px] text-[#6b7280] hidden md:inline truncate">{data.country}</span>
          </div>
        )}
        
        <span className="font-mono text-[9px] sm:text-[10px] text-[#374151] ml-auto shrink-0">{time}ms</span>
        {data && (
          <svg width={12} height={12} viewBox="0 0 12 12" className={`text-[#4b5563] shrink-0 ml-1 sm:ml-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {expanded && data && (
        <div className="border-t border-[#1f2937] p-3 sm:p-3 bg-[#080c10] grid grid-cols-2 md:grid-cols-4 gap-2">
          {gridFields.map(([k, v]) => (
            <div key={String(k)} className="p-2 sm:p-2.5 bg-[#0d1117] border border-[#1f2937] rounded">
              <div className="font-mono text-[8px] sm:text-[9px] tracking-[0.12em] text-[#4b5563] mb-1 truncate">{String(k)}</div>
              <div className="font-mono text-[10px] sm:text-xs font-bold text-[#94a3b8] truncate">{String(v) || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BinChecker() {
  const [mode, setMode] = useState<string>("check");
  const [input, setInput] = useState<string>("");
  const [extractText, setExtractText] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [results, setResults] = useState<ResultData[]>([]);
  const [progress, setProgress] = useState<ProgressState>({ current: 0, total: 0 });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const abortRef = useRef<boolean>(false);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const handleExtract = async () => {
    if (!extractText.trim()) return;
    
    try {
      const res = await fetch('/api/bin-extractor/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractText, extract8Digit: false })
      });
      
      const data = await res.json() as ExtractBinResponse;
      
      if (data.success && data.bins && data.bins.length > 0) {
        setInput(data.bins.join("\n"));
        setMode("check");
      }
    } catch (err) {
      console.error("Failed to extract BINs:", err);
    }
  };

  const handleStart = async () => {
    const bins = input
      .split(/[\n,\s]+/)
      .map(b => b.replace(/\D/g, "").substring(0, 8))
      .filter(b => b.length >= 6);
    if (!bins.length) return;

    setIsChecking(true);
    setProgress({ current: 0, total: bins.length });
    setResults([]);
    abortRef.current = false;

    for (let i = 0; i < bins.length; i++) {
      if (abortRef.current) break;
      const t0 = Date.now();
      
      let status: StatusType = "Error";
      let metadata: BinMetadata | null = null;
      
      try {
        const res = await fetch('/api/tools/check-bin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bin: bins[i] })
        });
        
        const data = await res.json() as CheckBinResponse;
        
        if (data.success && data.metadata) {
          status = "Found";
          metadata = data.metadata;
        } else {
          status = "Not Found";
        }
      } catch (err) {
        status = "Error";
      }

      const elapsed = Date.now() - t0;
      
      setResults(prev => [{
        raw: bins[i],
        status,
        data: metadata,
        time: elapsed,
      }, ...prev]);
      
      setProgress(p => ({ ...p, current: i + 1 }));
      
      await new Promise(r => setTimeout(r, 200)); 
    }
    setIsChecking(false);
  };

  const handleCopy = () => {
    const txt = results.map(r => `${r.raw}\t${r.status}\t${r.data?.brand || ""}\t${r.data?.funding || ""}\t${r.data?.country || ""}`).join("\n");
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const header = "BIN,Status,Brand,Funding,Country,PAN Length,Range Low,Range High,Time(ms)";
    const rows = results.map(r => [
      r.raw, r.status, r.data?.brand || "", r.data?.funding || "",
      r.data?.country || "", r.data?.pan_length || "",
      r.data?.account_range_low || "", r.data?.account_range_high || "", r.time,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `bins-${Date.now()}.csv`,
    });
    a.click();
  };

  const found = results.filter(r => r.status === "Found").length;
  const notFound = results.filter(r => r.status === "Not Found").length;
  const pct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;

  const FAQ = [
    { q: "What is a BIN / IIN?", a: "Bank Identification Number (BIN) — also called Issuer Identification Number (IIN) — is the first 6–8 digits of a payment card. It uniquely identifies the issuing institution, card network, and product type." },
    { q: "What data does a lookup return?", a: "Card scheme (Visa, Mastercard, Amex), funding type (Credit/Debit/Prepaid), card tier, issuing bank, country of issuance, PAN length, and account number range." },
    { q: "Why do developers use BIN lookup?", a: "Payment validation, fraud scoring, 3DS rule-application, geo-blocking, and UX optimization — e.g. auto-detecting card type to display the correct logo and format mask." },
  ];

  return (
    <div className="min-h-screen bg-[#060810] text-[#e2e8f0] font-mono relative overflow-hidden">
      <Scanline />

      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(#1f293710 1px, transparent 1px), linear-gradient(90deg, #1f293710 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="w-full max-w-[960px] mx-auto px-4 sm:px-5 py-6 sm:py-8 relative">

        {/* ─── Header Section ─── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="font-mono text-[8px] sm:text-[10px] tracking-[0.2em] text-[#10b981] px-1.5 sm:px-2 py-0.5 border border-[#10b98155] rounded-[2px]">
                SYS:ONLINE
              </span>
              <span className="text-[8px] sm:text-[10px] text-[#374151] tracking-[0.15em] truncate max-w-[120px] sm:max-w-none">
                v2.1.0 · BIN INTELLIGENCE ENGINE
              </span>
            </div>
            <span className="font-mono text-[9px] sm:text-[11px] text-[#374151] tracking-[0.1em]">
              {timeStr}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none mb-2 font-mono">
            <span className="text-[#e2e8f0]">BIN</span>
            <span className="text-[#ff6b2b]">.</span>
            <span className="text-[#64748b]">LOOKUP</span>
          </h1>
          <p className="text-[#4b5563] text-xs sm:text-[13px] tracking-[0.05em] max-w-lg mt-2">
            Decode card brand, funding type, country, and issuer from BIN / IIN prefixes securely.
          </p>
        </div>

        {/* ─── Mode Toggles ─── */}
        <div className="inline-flex bg-[#0d1117] border border-[#1f2937] rounded-md p-1 sm:p-[3px] mb-6 sm:mb-7">
          {["check", "extract"].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`
              px-3 sm:px-5 py-1.5 sm:py-1.5 rounded-[4px] border-none cursor-pointer
              font-mono text-[10px] sm:text-[11px] tracking-[0.12em] font-bold uppercase
              transition-all duration-150
              ${mode === m ? 'bg-[#ff6b2b] text-white' : 'bg-transparent text-[#4b5563]'}
            `}>
              {m === "check" ? "◈ CHECK BINS" : "⌕ EXTRACT"}
            </button>
          ))}
        </div>

        {/* ─── Mode: Extract ─── */}
        {mode === "extract" && (
          <div className="bg-[#0d1117] border border-[#1f2937] rounded-lg p-4 sm:p-6 mb-6">
            <label className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#4b5563] block mb-2 sm:mb-2.5">
              PASTE RAW DATA / LOGS CONTAINING BINs
            </label>
            <textarea
              rows={7}
              value={extractText}
              onChange={e => setExtractText(e.target.value)}
              placeholder={"card=4242420000000000 exp=12/26 cvv=123\nbin:555555 status:active"}
              className="w-full box-border bg-[#060810] border border-[#1f2937] rounded text-[#94a3b8] font-mono text-[11px] sm:text-xs leading-[1.7] p-3 sm:p-3.5 resize-y outline-none focus:border-[#4b5563] transition-colors"
            />
            <div className="flex gap-2 sm:gap-2 mt-3">
              <button
                onClick={handleExtract}
                disabled={!extractText.trim()}
                className={`flex-1 py-2.5 bg-[#ff6b2b] text-white border-none rounded cursor-pointer font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.12em] ${extractText.trim() ? 'opacity-100' : 'opacity-40'}`}
              >
                ⌕ EXTRACT VIA API
              </button>
              <button
                onClick={() => setExtractText("")}
                className="py-2.5 px-4 sm:px-5 bg-transparent text-[#4b5563] border border-[#1f2937] rounded cursor-pointer font-mono text-[10px] sm:text-[11px] tracking-[0.1em]"
              >
                CLR
              </button>
            </div>
          </div>
        )}

        {/* ─── Mode: Check / Grid Structure ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 sm:gap-4 mb-6">
          
          <div className="bg-[#0d1117] border border-[#1f2937] rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#4b5563]">INPUT QUEUE</span>
              {input && (
                <button onClick={() => { setInput(""); setResults([]); }} className="bg-none border-none cursor-pointer font-mono text-[9px] sm:text-[10px] text-[#374151] tracking-[0.1em] hover:text-[#ef4444] transition-colors">
                  × CLEAR
                </button>
              )}
            </div>
            <textarea
              rows={9}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"424242\n555555"}
              className="w-full box-border bg-[#060810] border border-[#1f2937] rounded text-[#10b981] font-mono text-xs sm:text-[13px] leading-[2] p-3 sm:p-3.5 resize-none outline-none tracking-[0.1em] focus:border-[#10b98155] transition-colors"
            />
            
            <div className="flex gap-2 sm:gap-2 mt-3">
              <button
                onClick={handleStart}
                disabled={isChecking || !input.trim()}
                className={`flex-1 py-2.5 sm:py-3 border-none rounded-[4px] font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.15em] transition-all duration-200
                  ${isChecking ? 'bg-[#9a3412] text-white cursor-not-allowed' : 'bg-[#ff6b2b] text-white cursor-pointer shadow-[0_0_20px_#ff6b2b40]'}
                  ${!input.trim() && !isChecking ? 'opacity-40 shadow-none' : ''}
                `}
              >
                {isChecking ? `⟳ ${progress.current}/${progress.total} SCANNING` : "◈ RUN API LOOKUP"}
              </button>
              {isChecking && (
                <button
                  onClick={() => { abortRef.current = true; }}
                  className="py-2.5 sm:py-3 px-3 sm:px-4 bg-transparent text-[#ef4444] border border-[#ef444455] rounded-[4px] cursor-pointer font-mono text-[10px] sm:text-[11px] tracking-[0.1em] hover:bg-[#ef444411]"
                >
                  ■ STOP
                </button>
              )}
            </div>

            {isChecking && (
              <div className="mt-3">
                <div className="h-0.5 sm:h-1 bg-[#1f2937] rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#ff6b2b] to-[#fb923c] transition-[width] duration-300 shadow-[0_0_8px_#fb923c80]"
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 sm:mt-2">
                  <span className="font-mono text-[9px] sm:text-[10px] text-[#374151]">
                    {progress.current} of {progress.total} processed
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-[#fb923c]">{pct}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2 sm:gap-2.5">
            {[
              { label: "TOTAL", value: results.length, color: "#94a3b8", border: "#1f2937", bg: "#0d1117" },
              { label: "FOUND", value: found, color: "#10b981", border: "#10b98133", bg: "#10b98108" },
              { label: "MISS", value: notFound, color: "#ef4444", border: "#ef444433", bg: "#ef444408" },
            ].map(s => (
              <div key={s.label} className="flex-1 rounded-lg p-3 sm:p-4 flex flex-col justify-center lg:justify-start"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[#374151] mb-1 sm:mb-2">{s.label}</span>
                <span className="text-2xl sm:text-4xl font-black leading-none tabular-nums"
                  style={{ color: s.color, textShadow: s.value > 0 ? `0 0 20px ${s.color}55` : "none" }}>
                  {String(s.value).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Results ─── */}
        {results.length > 0 && (
          <div className="bg-[#0d1117] border border-[#1f2937] rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#4b5563]">
                RESULTS · {results.length} ENTRIES
              </span>
              <div className="flex gap-2">
                <button onClick={handleCopy} className={`
                  px-3 py-1.5 rounded-[3px] cursor-pointer font-mono text-[9px] sm:text-[10px] tracking-[0.12em] transition-all duration-200
                  ${copied ? 'bg-[#10b98122] text-[#10b981] border border-[#10b98155]' : 'bg-transparent text-[#4b5563] border border-[#1f2937]'}
                  hover:border-[#4b5563]
                `}>
                  {copied ? "✓ COPIED" : "⎘ COPY"}
                </button>
                <button onClick={handleExport} className="px-3 py-1.5 bg-transparent text-[#4b5563] border border-[#1f2937] rounded-[3px] cursor-pointer font-mono text-[9px] sm:text-[10px] tracking-[0.12em] hover:text-[#94a3b8] hover:border-[#4b5563] transition-colors">
                  ↓ CSV
                </button>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-1 mb-1.5">
              <span className="text-[8px] sm:text-[9px] tracking-[0.15em] text-[#374151] min-w-[20px] sm:min-w-[24px]">#</span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.15em] text-[#374151] w-[40px] sm:w-[50px]">STATUS</span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.15em] text-[#374151] flex-1">BIN</span>
              <div className="hidden sm:flex gap-2 flex-shrink items-center text-transparent">
                 {/* Empty placeholders to visually align headers closely to Brand & Funding layout logic */}
              </div>
              <span className="text-[8px] sm:text-[9px] tracking-[0.15em] text-[#374151] ml-auto">TIME</span>
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5 max-h-[520px] overflow-y-auto pr-1">
              {results.map((r, i) => (
                <ResultRow
                  key={i}
                  result={r}
                  index={i}
                  expanded={expandedIdx === i}
                  onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── FAQ / Reference ─── */}
        <div className="mb-4">
          <div className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[#374151] mb-3 sm:mb-4">
            FAQ · REFERENCE
          </div>
          {FAQ.map((item, i) => (
            <div key={i} className={`border border-[#1f2937] rounded-[4px] overflow-hidden mb-1 ${faqOpen === i ? 'bg-[#0d1117]' : 'bg-transparent'}`}>
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex justify-between items-center p-3 sm:p-3 px-4 sm:px-4 bg-none border-none cursor-pointer text-left hover:bg-[#1f293711] transition-colors"
              >
                <span className="font-mono text-[11px] sm:text-xs text-[#64748b] tracking-[0.03em] pr-2">
                  {String(i + 1).padStart(2, "0")} · {item.q}
                </span>
                <span className="text-[#374151] text-xs shrink-0 font-mono font-bold">
                  {faqOpen === i ? "−" : "+"}
                </span>
              </button>
              {faqOpen === i && (
                <div className="px-4 pb-3.5 pt-3 font-mono text-[10px] sm:text-[11.5px] leading-[1.8] text-[#4b5563] border-t border-[#1f2937]">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
