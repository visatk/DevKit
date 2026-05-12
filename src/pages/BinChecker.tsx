import { useState, useRef, useEffect } from "react";

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
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", opacity: 0.03 }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ height: 1, background: "#fff", marginBottom: 6 }} />
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: cfg.color, boxShadow: cfg.glow,
        display: "inline-block", flexShrink: 0
      }} />
      <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", color: cfg.color, fontWeight: 700 }}>
        {cfg.label}
      </span>
    </span>
  );
}

function BrandChip({ brand }: { brand: string }) {
  const normalizedBrand = brand.toUpperCase();
  const cfg = BRAND_COLORS[normalizedBrand] || { color: "#6b7280", accent: "#9ca3af" };
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 3,
      background: `${cfg.color}22`, border: `1px solid ${cfg.color}55`,
      color: cfg.accent,
    }}>
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
    <span style={{
      fontFamily: "monospace", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 2,
      background: `${c}18`, border: `1px solid ${c}44`, color: c,
    }}>
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
    <div style={{
      border: "1px solid #1f2937",
      borderRadius: 6,
      overflow: "hidden",
      background: "#0d1117",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#374151"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1f2937"}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4b5563", minWidth: 24, userSelect: "none" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <StatusPip status={status} />
        <span style={{
          fontFamily: "monospace", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.15em", color: "#e2e8f0", flex: 1,
        }}>
          {raw}
        </span>
        {data && (
          <>
            {data.brand && <BrandChip brand={data.brand} />}
            {data.funding && <FundingTag type={data.funding} />}
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}>{data.country}</span>
          </>
        )}
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#374151", marginLeft: "auto" }}>{time}ms</span>
        {data && (
          <svg width={12} height={12} viewBox="0 0 12 12" style={{ color: "#4b5563", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {expanded && data && (
        <div style={{
          borderTop: "1px solid #1f2937",
          padding: "12px 16px",
          background: "#080c10",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}>
          {gridFields.map(([k, v]) => (
            <div key={String(k)} style={{ padding: "8px 10px", background: "#0d1117", border: "1px solid #1f2937", borderRadius: 4 }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", color: "#4b5563", marginBottom: 4 }}>{String(k)}</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{String(v) || "—"}</div>
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
      
      // Throttle strictly to prevent Node/Edge exhaustion on bulk lookups
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
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      color: "#e2e8f0",
      fontFamily: "'Courier New', Courier, monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <Scanline />

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(#1f293710 1px, transparent 1px), linear-gradient(90deg, #1f293710 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px", position: "relative" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 10, letterSpacing: "0.2em",
                color: "#10b981", padding: "3px 8px",
                border: "1px solid #10b98155", borderRadius: 2,
              }}>
                SYS:ONLINE
              </span>
              <span style={{ fontSize: 10, color: "#374151", letterSpacing: "0.15em" }}>
                v2.1.0 · BIN INTELLIGENCE ENGINE
              </span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#374151", letterSpacing: "0.1em" }}>
              {timeStr}
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 10,
            fontFamily: "'Courier New', monospace",
          }}>
            <span style={{ color: "#e2e8f0" }}>BIN</span>
            <span style={{ color: "#ff6b2b" }}>.</span>
            <span style={{ color: "#64748b" }}>LOOKUP</span>
          </h1>
          <p style={{ color: "#4b5563", fontSize: 13, letterSpacing: "0.05em", maxWidth: 480 }}>
            Decode card brand, funding type, country, and issuer from BIN / IIN prefixes securely.
          </p>
        </div>

        <div style={{
          display: "inline-flex", background: "#0d1117",
          border: "1px solid #1f2937", borderRadius: 6, padding: 3, marginBottom: 28,
        }}>
          {["check", "extract"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "6px 20px",
              borderRadius: 4, border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: 11, letterSpacing: "0.12em",
              fontWeight: 700, textTransform: "uppercase",
              background: mode === m ? "#ff6b2b" : "transparent",
              color: mode === m ? "#fff" : "#4b5563",
              transition: "all 0.15s",
            }}>
              {m === "check" ? "◈ CHECK BINS" : "⌕ EXTRACT"}
            </button>
          ))}
        </div>

        {mode === "extract" && (
          <div style={{
            background: "#0d1117", border: "1px solid #1f2937",
            borderRadius: 8, padding: 24, marginBottom: 24,
          }}>
            <label style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4b5563", display: "block", marginBottom: 10 }}>
              PASTE RAW DATA / LOGS CONTAINING BINs
            </label>
            <textarea
              rows={7}
              value={extractText}
              onChange={e => setExtractText(e.target.value)}
              placeholder={"card=4242420000000000 exp=12/26 cvv=123\nbin:555555 status:active"}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#060810", border: "1px solid #1f2937",
                borderRadius: 4, color: "#94a3b8",
                fontFamily: "monospace", fontSize: 12, lineHeight: 1.7,
                padding: 14, resize: "vertical", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={handleExtract}
                disabled={!extractText.trim()}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "#ff6b2b", color: "#fff",
                  border: "none", borderRadius: 4, cursor: "pointer",
                  fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.12em", opacity: extractText.trim() ? 1 : 0.4,
                }}
              >
                ⌕ EXTRACT VIA API
              </button>
              <button
                onClick={() => setExtractText("")}
                style={{
                  padding: "10px 20px",
                  background: "transparent", color: "#4b5563",
                  border: "1px solid #1f2937", borderRadius: 4, cursor: "pointer",
                  fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em",
                }}
              >
                CLR
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, marginBottom: 24 }}>

          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 8, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4b5563" }}>INPUT QUEUE</span>
              {input && (
                <button onClick={() => { setInput(""); setResults([]); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "monospace", fontSize: 10, color: "#374151",
                  letterSpacing: "0.1em",
                }}>
                  × CLEAR
                </button>
              )}
            </div>
            <textarea
              rows={9}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"424242\n555555"}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#060810", border: "1px solid #1f2937",
                borderRadius: 4, color: "#10b981",
                fontFamily: "monospace", fontSize: 13, lineHeight: 2,
                padding: 14, resize: "none", outline: "none",
                letterSpacing: "0.1em",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={handleStart}
                disabled={isChecking || !input.trim()}
                style={{
                  flex: 1, padding: "11px 0",
                  background: isChecking ? "#9a3412" : "#ff6b2b",
                  color: "#fff", border: "none", borderRadius: 4,
                  cursor: isChecking || !input.trim() ? "not-allowed" : "pointer",
                  fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.15em",
                  opacity: !input.trim() && !isChecking ? 0.4 : 1,
                  boxShadow: isChecking ? "none" : "0 0 20px #ff6b2b40",
                  transition: "all 0.2s",
                }}
              >
                {isChecking ? `⟳ ${progress.current}/${progress.total} SCANNING` : "◈ RUN API LOOKUP"}
              </button>
              {isChecking && (
                <button
                  onClick={() => { abortRef.current = true; }}
                  style={{
                    padding: "11px 16px",
                    background: "transparent", color: "#ef4444",
                    border: "1px solid #ef444455", borderRadius: 4,
                    cursor: "pointer", fontFamily: "monospace",
                    fontSize: 11, letterSpacing: "0.1em",
                  }}
                >
                  ■ STOP
                </button>
              )}
            </div>
            {isChecking && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 2, background: "#1f2937", borderRadius: 1, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: "linear-gradient(90deg, #ff6b2b, #fb923c)",
                    transition: "width 0.3s",
                    boxShadow: "0 0 8px #fb923c80",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#374151" }}>
                    {progress.current} of {progress.total} processed
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#fb923c" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "TOTAL", value: results.length, color: "#94a3b8", border: "#1f2937", bg: "#0d1117" },
              { label: "FOUND", value: found, color: "#10b981", border: "#10b98133", bg: "#10b98108" },
              { label: "MISS", value: notFound, color: "#ef4444", border: "#ef444433", bg: "#ef444408" },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 8, padding: "16px 18px",
                display: "flex", flexDirection: "column",
              }}>
                <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#374151", marginBottom: 8 }}>
                  {s.label}
                </span>
                <span style={{
                  fontSize: 40, fontWeight: 900, lineHeight: 1,
                  color: s.color,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: s.value > 0 ? `0 0 20px ${s.color}55` : "none",
                }}>
                  {String(s.value).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {results.length > 0 && (
          <div style={{
            background: "#0d1117", border: "1px solid #1f2937",
            borderRadius: 8, padding: 24, marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4b5563" }}>
                RESULTS · {results.length} ENTRIES
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCopy} style={{
                  padding: "5px 14px",
                  background: copied ? "#10b98122" : "transparent",
                  color: copied ? "#10b981" : "#4b5563",
                  border: `1px solid ${copied ? "#10b98155" : "#1f2937"}`,
                  borderRadius: 3, cursor: "pointer",
                  fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em",
                  transition: "all 0.2s",
                }}>
                  {copied ? "✓ COPIED" : "⎘ COPY"}
                </button>
                <button onClick={handleExport} style={{
                  padding: "5px 14px",
                  background: "transparent", color: "#4b5563",
                  border: "1px solid #1f2937",
                  borderRadius: 3, cursor: "pointer",
                  fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em",
                }}>
                  ↓ CSV
                </button>
              </div>
            </div>

            <div style={{
              display: "flex", gap: 12, padding: "4px 16px",
              marginBottom: 6,
            }}>
              {["#", "STATUS", "BIN", "BRAND", "FUNDING", "CC", "MS"].map(h => (
                <span key={h} style={{ fontSize: 9, letterSpacing: "0.15em", color: "#1f2937", flex: h === "BIN" ? 1 : "none", minWidth: h === "#" ? 24 : "auto" }}>
                  {h}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 520, overflowY: "auto" }}>
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

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#374151", marginBottom: 16 }}>
            FAQ · REFERENCE
          </div>
          {FAQ.map((item, i) => (
            <div key={i} style={{
              border: "1px solid #1f2937",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 4,
              background: faqOpen === i ? "#0d1117" : "transparent",
            }}>
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "12px 16px",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", letterSpacing: "0.03em" }}>
                  {String(i + 1).padStart(2, "0")} · {item.q}
                </span>
                <span style={{ color: "#374151", fontSize: 12, flexShrink: 0 }}>
                  {faqOpen === i ? "−" : "+"}
                </span>
              </button>
              {faqOpen === i && (
                <div style={{
                  padding: "0 16px 14px",
                  fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.8,
                  color: "#4b5563", borderTop: "1px solid #1f2937",
                  paddingTop: 12,
                }}>
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
