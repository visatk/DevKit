import { useState, useEffect } from 'react';
import { SeoHead } from '@/components/SeoHead';
import { Search, MapPin, Globe, Shield, ShieldAlert, Network, Server, Wifi, Loader2, Radar, Copy, Check, Activity } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ToolPageHeader, ToolCard } from '@/components/ToolPageHeader';

interface IpData {
  ip: string;
  location: { continent: string; country: string; countryCode: string; region: string; city: string; zip: string; lat: number; lon: number; timezone: string; };
  network: { isp: string; org: string; asn: string; reverse: string; };
  security: { isProxy: boolean; isVpn: boolean; isHosting: boolean; isMobile: boolean; riskScore: number; type: string; };
}

function InfoRow({ label, value, copyId, copiedId, onCopy }: { label: string; value: string; copyId: string; copiedId: string | null; onCopy: (v: string, id: string) => void; }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl gap-3 bg-[var(--surface-raised)] border border-[var(--border)]">
      <span className="badge-mono text-[10px] shrink-0 text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold truncate text-[var(--text-primary)] font-mono">{value || '—'}</span>
      <button
        onClick={() => onCopy(value, copyId)}
        className="shrink-0 p-1.5 rounded-lg transition-colors text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
      >
        {copiedId === copyId ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

function SecurityFlag({ active, label, icon: Icon, dangerColor }: { active: boolean; label: string; icon: any; dangerColor?: boolean; }) {
  const isRisk = active && dangerColor;
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold border ${isRisk ? 'bg-red-500/10 border-red-500/20 text-[#EF4444]' : active ? 'bg-emerald-500/10 border-emerald-500/20 text-[#10B981]' : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-muted)]'}`}>
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
      <span className="ml-auto badge-mono text-[10px]">{active ? 'YES' : 'NO'}</span>
    </div>
  );
}

export default function IpCheck() {
  const [ipInput, setIpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IpData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true); setData(null);
    try {
      const res = await fetch('/api/tools/check-ip', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipInput.trim() }),
      });
      const d = await res.json() as any;
      if (res.ok && d.success) setData(d.data);
      else toast(d.message || 'Failed to analyze IP.', 'error');
    } catch { toast('Network error.', 'error'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { handleAnalyze(); }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id); toast('Copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const riskColor = data
    ? data.security.riskScore < 33 ? '#10B981' : data.security.riskScore < 66 ? '#F59E0B' : '#EF4444'
    : '#9CA3AF';
  const riskLabel = data
    ? data.security.riskScore < 33 ? 'Clean / Safe' : data.security.riskScore < 66 ? 'Suspicious' : 'High Risk'
    : '';
  const circumference = 439.82;

  return (
    <div className="max-w-5xl mx-auto animation-fade-in">
      <SeoHead title="IP Analysis & Lookup | What Is My IP Address" description="Deep IP geolocation, ISP, proxy/VPN detection and risk scoring." isTool={true} />

      <ToolPageHeader
        badge="Reconnaissance"
        badgeIcon={Radar}
        title="IP Address Lookup"
        description="Scan any IP address for geolocation, ASN mapping, and security threat intelligence."
      />

      {/* Search Bar */}
      <ToolCard className="mb-6">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3 p-5">
          <div className="flex-1 relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Enter IP address (leave blank to scan your own)..."
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl text-sm font-medium outline-none transition-all bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_var(--orange-dim)]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 shrink-0 active:scale-95 bg-[var(--orange)] text-[#fff] hover:opacity-90"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {isLoading ? 'Analyzing...' : 'Analyze IP'}
          </button>
        </form>
      </ToolCard>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative size-16">
            <Loader2 className="size-16 animate-spin text-orange-500 opacity-80" />
          </div>
          <p className="badge-mono text-[var(--text-muted)]">Scanning target...</p>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 animation-fade-up">

          {/* Risk Score */}
          <ToolCard className="md:col-span-2 xl:col-span-1">
            <div className="p-6 flex flex-col items-center text-center">
              <p className="badge-mono mb-4 text-[var(--text-muted)]">Risk Score</p>
              <div className="relative size-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" strokeWidth="10" className="stroke-[var(--border)]" />
                  <circle
                    cx="80" cy="80" r="70" fill="none" strokeWidth="10"
                    stroke={riskColor}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * data.security.riskScore / 100)}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: riskColor }}>{data.security.riskScore}</span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">/100</span>
                </div>
              </div>
              <div
                className="mt-4 px-4 py-1.5 rounded-full badge-mono"
                style={{ background: `${riskColor}15`, border: `1px solid ${riskColor}30`, color: riskColor }}
              >
                {riskLabel}
              </div>
              <p className="mt-2 badge-mono text-orange-500">{data.ip}</p>
            </div>
          </ToolCard>

          {/* Location */}
          <ToolCard>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--orange-dim)] border border-[var(--orange-border)]">
                  <MapPin className="size-4 text-[var(--orange)]" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>Location</h3>
              </div>
              <div className="space-y-2">
                <InfoRow label="Country" value={`${data.location.country} (${data.location.countryCode})`} copyId="country" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="City" value={data.location.city} copyId="city" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="Region" value={data.location.region} copyId="region" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="ZIP" value={data.location.zip} copyId="zip" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="Timezone" value={data.location.timezone} copyId="tz" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="Coords" value={`${data.location.lat.toFixed(4)}, ${data.location.lon.toFixed(4)}`} copyId="coords" copiedId={copiedId} onCopy={handleCopy} />
              </div>
            </div>
          </ToolCard>

          {/* Network */}
          <ToolCard>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--orange-dim)] border border-[var(--orange-border)]">
                  <Network className="size-4 text-[var(--orange)]" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>Network</h3>
              </div>
              <div className="space-y-2">
                <InfoRow label="ISP" value={data.network.isp} copyId="isp" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="Org" value={data.network.org} copyId="org" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="ASN" value={data.network.asn} copyId="asn" copiedId={copiedId} onCopy={handleCopy} />
                <InfoRow label="Reverse" value={data.network.reverse} copyId="rdns" copiedId={copiedId} onCopy={handleCopy} />
              </div>
            </div>
          </ToolCard>

          {/* Security Flags */}
          <ToolCard className="md:col-span-2">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--orange-dim)] border border-[var(--orange-border)]">
                  <Shield className="size-4 text-[var(--orange)]" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>Security Flags</h3>
                <span className="ml-auto badge-mono px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)]">
                  {data.security.type}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <SecurityFlag active={data.security.isProxy} label="Proxy" icon={Server} dangerColor />
                <SecurityFlag active={data.security.isVpn} label="VPN" icon={ShieldAlert} dangerColor />
                <SecurityFlag active={data.security.isHosting} label="Hosting" icon={Activity} dangerColor />
                <SecurityFlag active={data.security.isMobile} label="Mobile" icon={Wifi} />
              </div>
            </div>
          </ToolCard>
        </div>
      )}
    </div>
  );
}
