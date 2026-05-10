import { useState, useRef, useEffect } from "react";

// ─── Mock BIN Database ─────────────────────────────────────────────────────
const BIN_DB = {
  "424242": { brand: "VISA", funding: "CREDIT", type: "CLASSIC", country: "US", pan_length: 16, account_range_low: "4242420000000000", account_range_high: "4242429999999999" },
  "411111": { brand: "VISA", funding: "CREDIT", type: "SIGNATURE", country: "US", pan_length: 16, account_range_low: "4111110000000000", account_range_high: "4111119999999999" },
  "455673": { brand: "VISA", funding: "DEBIT", type: "ELECTRON", country: "GB", pan_length: 16, account_range_low: "4556730000000000", account_range_high: "4556739999999999" },
  "450875": { brand: "VISA", funding: "PREPAID", type: "GIFT", country: "CA", pan_length: 16, account_range_low: "4508750000000000", account_range_high: "4508759999999999" },
  "555555": { brand: "MASTERCARD", funding: "CREDIT", type: "WORLD", country: "US", pan_length: 16, account_range_low: "5555550000000000", account_range_high: "5555559999999999" },
  "545454": { brand: "MASTERCARD", funding: "DEBIT", type: "STANDARD", country: "DE", pan_length: 16, account_range_low: "5454540000000000", account_range_high: "5454549999999999" },
  "510510": { brand: "MASTERCARD", funding: "CREDIT", type: "PLATINUM", country: "FR", pan_length: 16, account_range_low: "5105100000000000", account_range_high: "5105109999999999" },
  "378282": { brand: "AMEX", funding: "CREDIT", type: "GREEN", country: "US", pan_length: 15, account_range_low: "378282000000000", account_range_high: "378282999999999" },
  "371449": { brand: "AMEX", funding: "CREDIT", type: "GOLD", country: "US", pan_length: 15, account_range_low: "371449000000000", account_range_high: "371449999999999" },
  "6011111": { brand: "DISCOVER", funding: "CREDIT", type: "STANDARD", country: "US", pan_length: 16, account_range_low: "6011111000000000", account_range_high: "6011111999999999" },
  "356600": { brand: "JCB", funding: "CREDIT", type: "CLASSIC", country: "JP", pan_length: 16, account_range_low: "3566000000000000", account_range_high: "3566009999999999" },
};

const BRAND_COLORS = {
  VISA: { color: "#1a1f71", accent: "#f7a600" },
  MASTERCARD: { color: "#eb001b", accent: "#f79e1b" },
  AMEX: { color: "#007bc1", accent: "#00aeef" },
  DISCOVER: { color: "#e65c00", accent: "#f9d423" },
  JCB: { color: "#003087", accent: "#009f6b" },
};

const BRAND_SYMBOLS = { VISA: "◈", MASTERCARD: "◉", AMEX: "◆", DISCOVER: "◇", JCB: "✦" };

function lookupBin(raw) {
  const bin = raw.replace(/\D/g, "").substring(0, 8);
  for (let len = 8; len >= 6; len--) {
    const key = bin.substring(0, len);
    if (BIN_DB[key]) return { found: true, data: BIN_DB[key] };
  }
  return { found: false, data: null };
}

// ─── Sparkline mini-component ──────────────────────────────────────────────
function Scanline() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", opacity: 0.03 }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ height: 1, background: "#fff", marginBottom: 6 }} />
      ))}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusPip({ status }) {
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

// ─── Brand Chip ────────────────────────────────────────────────────────────
function BrandChip({ brand }) {
  const cfg = BRAND_COLORS[brand] || { color: "#6b7280", accent: "#9ca3af" };
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 3,
      background: `${cfg.color}22`, border: `1px solid ${cfg.color}55`,
      color: cfg.accent,
    }}>
      {BRAND_SYMBOLS[brand] || "◻"} {brand}
    </span>
  );
}

// ─── Funding Tag ───────────────────────────────────────────────────────────
function FundingTag({ type }) {
  const map = {
    CREDIT: "#818cf8",
    DEBIT: "#34d399",
    PREPAID: "#fb923c",
    GIFT: "#f472b6",
  };
  const c = map[type] || "#9ca3af";
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 2,
      background: `${c}18`, border: `1px solid ${c}44`, color: c,
    }}>
      {type}
    </span>
  );
}

// ─── Result Row ────────────────────────────────────────────────────────────
function ResultRow({ result, index, expanded, onToggle }) {
  const { raw, status, data, time } = result;
  const isExpanded = expanded;
  const gridFields = data ? [
    ["BRAND", data.brand],
    ["FUNDING", data.funding],
    ["TYPE", data.type],
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
            <BrandChip brand={data.brand} />
            <FundingTag type={data.funding} />
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280" }}>{data.country}</span>
          </>
        )}
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#374151", marginLeft: "auto" }}>{time}ms</span>
        {data && (
          <svg width={12} height={12} viewBox="0 0 12 12" style={{ color: "#4b5563", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {isExpanded && data && (
        <div style={{
          borderTop: "1px solid #1f2937",
          padding: "12px 16px",
          background: "#080c10",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}>
          {gridFields.map(([k, v]) => (
            <div key={k} style={{ padding: "8px 10px", background: "#0d1117", border: "1px solid #1f2937", borderRadius: 4 }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.12em", color: "#4b5563", marginBottom: 4 }}>{k}</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{v || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function BinChecker() {
  const [mode, setMode] = useState("check"); // "check" | "extract"
  const [input, setInput] = useState("");
  const [extractText, setExtractText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);
  const abortRef = useRef(false);

  // Blinking clock
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const handleExtract = () => {
    const matches = extractText.match(/\b\d{6,8}\b/g) || [];
    const unique = [...new Set(matches)];
    if (unique.length) {
      setInput(unique.join("\n"));
      setMode("check");
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
      await new Promise(r => setTimeout(r, 180 + Math.random() * 120));
      const t0 = Date.now();
      const { found, data } = lookupBin(bins[i]);
      const elapsed = Date.now() - t0 + Math.floor(Math.random() * 80 + 20);
      setResults(prev => [{
        raw: bins[i],
        status: found ? "Found" : "Not Found",
        data: found ? data : null,
        time: elapsed,
      }, ...prev]);
      setProgress(p => ({ ...p, current: i + 1 }));
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
    const header = "BIN,Status,Brand,Funding,Type,Country,PAN Length,Range Low,Range High,Time(ms)";
    const rows = results.map(r => [
      r.raw, r.status, r.data?.brand || "", r.data?.funding || "",
      r.data?.type || "", r.data?.country || "", r.data?.pan_length || "",
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

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(#1f293710 1px, transparent 1px), linear-gradient(90deg, #1f293710 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "fixed", top: -200, right: -200, width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, #1e3a5f44 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px", position: "relative" }}>

        {/* ── Header ── */}
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
            <span style={{ color: "#1d4ed8" }}>.</span>
            <span style={{ color: "#64748b" }}>LOOKUP</span>
          </h1>
          <p style={{ color: "#4b5563", fontSize: 13, letterSpacing: "0.05em", maxWidth: 480 }}>
            Decode card brand, funding type, country, and issuer from BIN / IIN prefixes.
          </p>
        </div>

        {/* ── Mode Toggle ── */}
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
              background: mode === m ? "#1d4ed8" : "transparent",
              color: mode === m ? "#fff" : "#4b5563",
              transition: "all 0.15s",
            }}>
              {m === "check" ? "◈ CHECK BINS" : "⌕ EXTRACT"}
            </button>
          ))}
        </div>

        {/* ── Extract Mode ── */}
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
              placeholder={"card=4242420000000000 exp=12/26 cvv=123\nbin:555555 status:active\n378282000000000 USD approved"}
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
                  background: "#1d4ed8", color: "#fff",
                  border: "none", borderRadius: 4, cursor: "pointer",
                  fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.12em", opacity: extractText.trim() ? 1 : 0.4,
                }}
              >
                ⌕ EXTRACT &amp; QUEUE
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

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, marginBottom: 24 }}>

          {/* Input Panel */}
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
              placeholder={"424242\n555555\n378282\n371449\n6011111"}
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
                  background: isChecking ? "#1e3a8a" : "#1d4ed8",
                  color: "#fff", border: "none", borderRadius: 4,
                  cursor: isChecking || !input.trim() ? "not-allowed" : "pointer",
                  fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.15em",
                  opacity: !input.trim() && !isChecking ? 0.4 : 1,
                  boxShadow: isChecking ? "none" : "0 0 20px #1d4ed840",
                  transition: "all 0.2s",
                }}
              >
                {isChecking ? `⟳ ${progress.current}/${progress.total} SCANNING` : "◈ RUN LOOKUP"}
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
                    background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                    transition: "width 0.3s",
                    boxShadow: "0 0 8px #3b82f680",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#374151" }}>
                    {progress.current} of {progress.total} processed
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#3b82f6" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Panel */}
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

        {/* ── Results ── */}
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

            {/* Column header */}
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

        {/* ── FAQ ── */}
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

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #1f2937", paddingTop: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#1f2937", letterSpacing: "0.15em" }}>
            BIN LOOKUP ENGINE · DEMO DATA
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#1f2937", letterSpacing: "0.15em" }}>
            {found}/{results.length} RESOLVED
          </span>
        </div>
      </div>
    </div>
  );
}
