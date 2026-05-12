import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SeoHead } from '@/components/SeoHead';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { 
  Copy, Check, MapPin, UserSquare2, Globe, Loader2, ArrowLeft,
  Briefcase, WalletCards, Database, FileCode2, Shield, ChevronRight, 
  RefreshCw, MousePointerClick, Cpu, Plane
} from 'lucide-react';
import { allFakers } from '@faker-js/faker';

const getFlagEmoji = (cc: string) => {
  if (!cc || cc === 'UN') return '🌐';
  return cc.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

const getRegion = (countryCode: string) => {
  const regions: Record<string, string> = {
    'US': 'North America', 'CA': 'North America', 'MX': 'North America', 'CU': 'North America',
    'GB': 'Europe', 'DE': 'Europe', 'FR': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'NL': 'Europe', 
    'RU': 'Europe', 'PT': 'Europe', 'PL': 'Europe', 'TR': 'Europe', 'SE': 'Europe', 'FI': 'Europe', 
    'DK': 'Europe', 'NO': 'Europe', 'CZ': 'Europe', 'GR': 'Europe', 'RO': 'Europe', 'SK': 'Europe', 
    'UA': 'Europe', 'HU': 'Europe', 'HR': 'Europe', 'BG': 'Europe', 'RS': 'Europe', 'SI': 'Europe', 
    'LT': 'Europe', 'LV': 'Europe', 'EE': 'Europe', 'AL': 'Europe', 'MK': 'Europe', 'BA': 'Europe', 
    'IS': 'Europe', 'MT': 'Europe', 'CH': 'Europe', 'AT': 'Europe', 'BE': 'Europe', 'IE': 'Europe',
    'JP': 'Asia', 'KR': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'BD': 'Asia', 'ID': 'Asia', 'VN': 'Asia', 
    'TH': 'Asia', 'IR': 'Asia', 'PK': 'Asia', 'NP': 'Asia', 'LK': 'Asia', 'KH': 'Asia', 'LA': 'Asia', 
    'MM': 'Asia', 'GE': 'Asia', 'AM': 'Asia', 'AZ': 'Asia', 'KZ': 'Asia', 'UZ': 'Asia', 'KG': 'Asia', 
    'TM': 'Asia', 'MN': 'Asia', 'TW': 'Asia', 'HK': 'Asia', 'SG': 'Asia', 'MY': 'Asia', 'PH': 'Asia',
    'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'CO': 'South America', 
    'PE': 'South America', 'VE': 'South America', 'UY': 'South America', 'PY': 'South America', 'BO': 'South America',
    'ZA': 'Africa', 'KE': 'Africa', 'ET': 'Africa', 'NG': 'Africa', 'EG': 'Africa', 'MA': 'Africa', 
    'DZ': 'Africa', 'GH': 'Africa', 'SN': 'Africa',
    'AU': 'Oceania', 'NZ': 'Oceania',
    'AE': 'Middle East', 'IL': 'Middle East', 'SA': 'Middle East', 'QA': 'Middle East', 'KW': 'Middle East', 
    'OM': 'Middle East', 'BH': 'Middle East', 'JO': 'Middle East', 'LB': 'Middle East', 'IQ': 'Middle East'
  };
  return regions[countryCode.toUpperCase()] || 'Global';
};

const baseCountryMap: Record<string, string> = {
  'en': 'US', 'de': 'DE', 'fr': 'FR', 'it': 'IT', 'es': 'ES', 'nl': 'NL', 'ru': 'RU', 'ja': 'JP', 
  'ko': 'KR', 'zh': 'CN', 'ar': 'AE', 'pt': 'PT', 'pl': 'PL', 'tr': 'TR', 'sv': 'SE', 'fi': 'FI', 
  'da': 'DK', 'no': 'NO', 'cs': 'CZ', 'el': 'GR', 'he': 'IL', 'hi': 'IN', 'id': 'ID', 'ro': 'RO',
  'sk': 'SK', 'uk': 'UA', 'vi': 'VN', 'th': 'TH', 'hu': 'HU', 'hr': 'HR', 'bg': 'BG', 'sr': 'RS', 
  'sl': 'SI', 'lt': 'LT', 'lv': 'LV', 'et': 'EE', 'fa': 'IR', 'ur': 'PK', 'bn': 'BD', 'ta': 'IN', 
  'te': 'IN', 'ml': 'IN', 'kn': 'IN', 'mr': 'IN', 'gu': 'IN', 'pa': 'IN', 'af': 'ZA', 'sw': 'KE',
  'zu': 'ZA', 'xh': 'ZA', 'am': 'ET', 'yo': 'NG', 'ig': 'NG', 'ha': 'NG', 'ne': 'NP', 'si': 'LK', 
  'km': 'KH', 'lo': 'LA', 'my': 'MM', 'ka': 'GE', 'hy': 'AM', 'az': 'AZ', 'kk': 'KZ', 'uz': 'UZ', 
  'ky': 'KG', 'tk': 'TM', 'mn': 'MN', 'sq': 'AL', 'mk': 'MK', 'bs': 'BA', 'is': 'IS', 'mt': 'MT', 'dv': 'MV'
};

const SUPPORTED_LOCALES = Object.keys(allFakers)
  .filter(code => code !== 'base')
  .reduce((acc, localeCode) => {
    let name = localeCode;
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      const intlLocale = localeCode.replace('_', '-');
      name = displayNames.of(intlLocale) || localeCode;
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } catch (e) {
      name = localeCode.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    const parts = localeCode.split('_');
    const countryCode = parts.length > 1 ? parts[1] : (baseCountryMap[localeCode] || 'UN');

    acc[localeCode] = {
      code: localeCode,
      name: name,
      region: getRegion(countryCode),
      flag: getFlagEmoji(countryCode)
    };
    return acc;
  }, {} as Record<string, { code: string; name: string; region: string; flag: string }>);

type Identity = {
  avatar: string; fullName: string; gender: string; dateOfBirth: string; phone: string; idNumber: string; uuid: string;
  jobTitle: string; department: string; company: string;
  street: string; secondaryAddress: string; city: string; state: string; zip: string; country: string; coordinates: string; timezone: string;
  email: string; username: string; password: string; ipAddress: string; macAddress: string; userAgent: string;
  networkInterface: string; commitSha: string;
  creditCard: string; cvv: string; ccIssuer: string; iban: string; cryptoAddress: string; ethereumAddress: string;
  recordLocator: string; currency: string;
};

const FAQ_DATA = [
  { question: "What is a fake address generator used for?", answer: "A mock identity or fake address generator is utilized by developers, QA testers, and designers to populate databases, prototype applications, and perform form validation without exposing real PII (Personally Identifiable Information)." },
  { question: "Are these identities real people?", answer: "No. The data is entirely synthesized algorithmically using common regional name patterns and realistic (but dummy) street formats. It prevents privacy leaks in development environments." },
  { question: "How many regional locales are supported?", answer: "The localization engine automatically parses over 70+ locales directly from the Faker API, generating culturally accurate names, appropriate state/province abbreviations, and mathematically correct postal code formats for regions worldwide." }
];

const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
    <Icon className="size-4 text-orange-500" />
    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{title}</h3>
  </div>
);

const InteractiveDataField = ({ label, value, mono = false }: { label: string, value: string, mono?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!value || value === 'N/A') return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="group relative p-3 -mx-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50"
      title={`Copy ${label}`}
    >
      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 cursor-pointer">{label}</label>
      <div className="flex items-start justify-between gap-4">
        <div className={`text-sm font-medium text-[var(--text-primary)] break-all transition-colors group-hover:text-[var(--orange)] ${mono ? 'font-mono text-[13px] bg-[var(--surface-raised)] px-2 py-0.5 rounded border border-[var(--border-strong)]' : ''}`}>
          {value}
        </div>
        <div className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors">
          {copied ? <Check className="size-4 text-emerald-500 scale-110 transition-transform" /> : <Copy className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </div>
    </div>
  );
};

export default function FakeAddress() {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { copiedText, copy } = useCopyToClipboard();

  const activeLocaleData = locale ? SUPPORTED_LOCALES[locale] : null;

  const generateIdentity = useCallback(() => {
    if (!activeLocaleData || isGenerating) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const faker = allFakers[activeLocaleData.code as keyof typeof allFakers] || allFakers['en'];

        const safeCall = (fn: () => string, fallback: string = 'N/A') => {
          try { const res = fn(); return res === null || res === undefined || res.trim() === '' ? fallback : res; } 
          catch { return fallback; }
        };

        const sex = faker.person.sexType(); 
        const firstName = safeCall(() => faker.person.firstName(sex));
        const lastName = safeCall(() => faker.person.lastName(sex));

        setIdentity({
          avatar: safeCall(() => faker.image.avatar()),
          fullName: `${firstName} ${lastName}`,
          gender: sex.charAt(0).toUpperCase() + sex.slice(1),
          dateOfBirth: safeCall(() => faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toLocaleDateString()),
          phone: safeCall(() => faker.phone.number()),
          idNumber: safeCall(() => faker.string.alphanumeric({ length: 10, casing: 'upper' })),
          uuid: safeCall(() => faker.string.uuid()),

          jobTitle: safeCall(() => faker.person.jobTitle()),
          department: safeCall(() => faker.commerce.department()),
          company: safeCall(() => faker.company.name()),

          street: safeCall(() => faker.location.streetAddress()),
          secondaryAddress: safeCall(() => faker.location.secondaryAddress()),
          city: safeCall(() => faker.location.city()),
          state: safeCall(() => faker.location.state()),
          zip: safeCall(() => faker.location.zipCode()),
          country: safeCall(() => faker.location.country()),
          coordinates: safeCall(() => `${faker.location.latitude()}, ${faker.location.longitude()}`),
          timezone: safeCall(() => faker.location.timeZone()),

          email: safeCall(() => faker.internet.email({ firstName, lastName })),
          username: safeCall(() => {
            const method = faker.internet.username || (faker.internet as any).userName;
            return method ? method({ firstName, lastName }) : 'N/A';
          }),
          password: safeCall(() => faker.internet.password({ length: 16 })),
          ipAddress: safeCall(() => faker.internet.ipv4()),
          macAddress: safeCall(() => faker.internet.mac()),
          userAgent: safeCall(() => faker.internet.userAgent()),
          networkInterface: safeCall(() => faker.system.networkInterface()),
          commitSha: safeCall(() => faker.git.commitSha({ length: 7 })),

          currency: safeCall(() => {
            const c = faker.finance.currency();
            return `${c.name} (${c.symbol})`;
          }),
          creditCard: safeCall(() => faker.finance.creditCardNumber()),
          cvv: safeCall(() => faker.finance.creditCardCVV()),
          ccIssuer: safeCall(() => faker.finance.creditCardIssuer()),
          iban: safeCall(() => faker.finance.iban()),
          cryptoAddress: safeCall(() => faker.finance.bitcoinAddress()),
          ethereumAddress: safeCall(() => faker.finance.ethereumAddress()),
          recordLocator: safeCall(() => faker.airline.recordLocator())
        });
      } finally {
        setIsGenerating(false);
      }
    }, 200);
  }, [activeLocaleData, isGenerating]);

  useEffect(() => {
    if (locale && !SUPPORTED_LOCALES[locale]) {
      navigate('/fake-address', { replace: true });
    }
  }, [locale, navigate]);

  useEffect(() => {
    if (activeLocaleData && !identity && !isGenerating && !initialLoadComplete) {
      setInitialLoadComplete(true);
      generateIdentity();
    }
  }, [activeLocaleData, identity, isGenerating, initialLoadComplete, generateIdentity]);

  const formattedOutput = identity ? 
    `[Personal Profile]\nName: ${identity.fullName}\nGender: ${identity.gender}\nDOB: ${identity.dateOfBirth}\nPhone: ${identity.phone}\nID: ${identity.idNumber}\nUUID: ${identity.uuid}\n\n[Professional]\nJob Title: ${identity.jobTitle}\nDepartment: ${identity.department}\nCompany: ${identity.company}\n\n[Location]\nAddress: ${identity.street}, ${identity.secondaryAddress}\nCity/State: ${identity.city}, ${identity.state}\nZip Code: ${identity.zip}\nCountry: ${identity.country}\nTimezone: ${identity.timezone}\nGeo: ${identity.coordinates}\n\n[Digital Footprint]\nEmail: ${identity.email}\nUsername: ${identity.username}\nPassword: ${identity.password}\nIP: ${identity.ipAddress}\nMAC: ${identity.macAddress}\nUser-Agent: ${identity.userAgent}\nNetwork Int: ${identity.networkInterface}\nCommit SHA: ${identity.commitSha}\n\n[Financial & Travel Vector]\nCurrency: ${identity.currency}\nCard: ${identity.ccIssuer} - ${identity.creditCard} (CVV: ${identity.cvv})\nIBAN: ${identity.iban}\nBTC Address: ${identity.cryptoAddress}\nETH Address: ${identity.ethereumAddress}\nRecord Locator: ${identity.recordLocator}` : '';

  if (!locale) {
    const groupedLocales = Object.entries(SUPPORTED_LOCALES).reduce((acc, [slug, data]) => {
      if (!acc[data.region]) acc[data.region] = [];
      acc[data.region].push({ slug, ...data });
      return acc;
    }, {} as Record<string, Array<{ slug: string; code: string; name: string; flag: string; }>>);

    return (
      <div className="max-w-7xl mx-auto md:py-8 animation-fade-in">
        <SeoHead 
          title="Fake Address Generator Directory | Global Mock Identities" 
          description="Browse and generate localized fake addresses, random names, and dummy profiles for specific global regions. Comprehensive mock identity tools for developers." 
          keywords="fake address generator directory, global mock identity, random address by country, test user profiles"
          isTool={true}
          faqData={FAQ_DATA}
        />
        
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Globe className="size-3.5 fill-current" /> Address Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Select Localization Profile</h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">Choose a specific region to dynamically generate culturally accurate mock identities and mathematically valid regional footprints.</p>
        </div>

        <div className="grid gap-12 mb-16">
          {Object.entries(groupedLocales).sort(([a], [b]) => a.localeCompare(b)).map(([region, locales]) => (
            <section key={region}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin className="size-4" /> {region}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {locales.sort((a, b) => a.name.localeCompare(b.name)).map(loc => (
                  <Link 
                    key={loc.slug} 
                    to={`/fake-address/${loc.slug}`}
                    className="flex items-center justify-between p-4 glass card-interactive hover:border-[var(--orange-border)] hover:shadow-lg hover:shadow-orange-500/10 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl filter drop-shadow-sm">{loc.flag}</span>
                      <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--orange)] transition-colors truncate">{loc.name}</span>
                    </div>
                    <ChevronRight className="size-4 text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title={`${activeLocaleData?.name} Fake Address Generator | Mock Identity`}
        description={`Generate localized fake addresses, random names, and dummy profiles specifically for ${activeLocaleData?.name}. High-fidelity mock identity vectors for QA testing.`}
        keywords={`fake address generator ${activeLocaleData?.name}, random address ${activeLocaleData?.name}, mock identity ${activeLocaleData?.name}, dummy data ${activeLocaleData?.name}`}
        isTool={true}
        faqData={FAQ_DATA}
      />
      
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link to="/fake-address" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft className="size-4" /> Back to Global Directory
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl filter drop-shadow-md">{activeLocaleData?.flag}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{activeLocaleData?.name} fake address</h1>
          </div>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">Instantly generate structurally valid identity payloads, financial traces, and digital footprints localized explicitly for {activeLocaleData?.name}.</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20 shrink-0">
          <MousePointerClick className="size-4" /> Click any field to copy
        </div>
      </div>

      <div className="glass shadow-2xl shadow-[var(--orange-dim)] rounded-3xl p-6 md:p-10 mb-16 relative overflow-hidden">
        
        {isGenerating && identity && (
          <div className="absolute inset-0 z-10 bg-[var(--surface-raised)] backdrop-blur-sm flex items-center justify-center rounded-3xl transition-all">
            <Loader2 className="size-10 text-[var(--orange)] animate-spin" />
          </div>
        )}

        {identity ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            
            {/* Column 1: Personal Data */}
            <div className="bg-[var(--surface-raised)] rounded-2xl p-6 border border-[var(--border-strong)] shadow-sm flex flex-col">
              <SectionTitle icon={UserSquare2} title="Personal Profile" />
              <div className="flex items-center gap-4 mb-5 p-3 -mx-3 rounded-xl">
                <img src={identity.avatar} alt="Avatar" className="size-14 rounded-full bg-[var(--surface)] object-cover shadow-sm ring-2 ring-[var(--border-strong)]" />
                <div className="flex-1">
                  <InteractiveDataField label="Full Name" value={identity.fullName} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="Gender" value={identity.gender} />
                <InteractiveDataField label="Date of Birth" value={identity.dateOfBirth} />
              </div>
              <InteractiveDataField label="Phone Number" value={identity.phone} mono />
              <InteractiveDataField label="National ID / SSN" value={identity.idNumber} mono />
              <InteractiveDataField label="Identity UUID" value={identity.uuid} mono />
            </div>

            {/* Column 2: Professional & Location */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
              <SectionTitle icon={Briefcase} title="Professional & Locale" />
              <InteractiveDataField label="Job Title" value={identity.jobTitle} />
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="Company" value={identity.company} />
                <InteractiveDataField label="Department" value={identity.department} />
              </div>
              
              <div className="my-3 border-t border-dashed border-zinc-200 dark:border-zinc-800"></div>
              
              <InteractiveDataField label="Street Address" value={`${identity.street}, ${identity.secondaryAddress}`} />
              <InteractiveDataField label="City & Region" value={`${identity.city}, ${identity.state} ${identity.zip}`} />
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="Country" value={identity.country} />
                <InteractiveDataField label="Timezone" value={identity.timezone} />
              </div>
              <InteractiveDataField label="Geo Coordinates" value={identity.coordinates} mono />
            </div>

            {/* Column 3: Digital Footprint */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
              <SectionTitle icon={Cpu} title="Digital Footprint" />
              <InteractiveDataField label="Email Address" value={identity.email} />
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="Username" value={identity.username} mono />
                <InteractiveDataField label="Password" value={identity.password} mono />
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="IP Address" value={identity.ipAddress} mono />
                <InteractiveDataField label="MAC Address" value={identity.macAddress} mono />
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="Network Interface" value={identity.networkInterface} mono />
                <InteractiveDataField label="Commit SHA" value={identity.commitSha} mono />
              </div>
              <InteractiveDataField label="User-Agent Payload" value={identity.userAgent} mono />
            </div>

            {/* Column 4: Financial & Travel */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
              <SectionTitle icon={WalletCards} title="Financial & Travel" />
              <InteractiveDataField label="Credit Card" value={`${identity.ccIssuer} - ${identity.creditCard}`} mono />
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="CVV" value={identity.cvv} mono />
                <InteractiveDataField label="Currency" value={identity.currency} mono />
              </div>
              <InteractiveDataField label="IBAN" value={identity.iban} mono />
              
              <div className="my-3 border-t border-dashed border-zinc-200 dark:border-zinc-800"></div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="Bitcoin" value={identity.cryptoAddress} mono />
                <InteractiveDataField label="Ethereum" value={identity.ethereumAddress} mono />
              </div>
              <div className="mt-auto">
                <SectionTitle icon={Plane} title="Aviation Vector" />
                <InteractiveDataField label="Flight Record Locator" value={identity.recordLocator} mono />
              </div>
            </div>

          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-strong)] border-dashed mb-8 transition-colors">
            {isGenerating ? (
              <Loader2 className="size-10 text-[var(--orange)] animate-spin mb-4" />
            ) : (
              <span className="text-6xl filter drop-shadow-sm mb-4 grayscale opacity-50">{activeLocaleData?.flag}</span>
            )}
            <p className="text-[var(--text-secondary)] font-medium">{isGenerating ? 'Synthesizing Architecture...' : 'Awaiting System Initialization...'}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-strong)]">
          <button onClick={generateIdentity} disabled={isGenerating} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg)] text-base font-bold rounded-2xl hover:bg-[var(--orange)] hover:text-white transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70">
            <RefreshCw className={`size-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Regenerating...' : 'Regenerate Footprint'}
          </button>
          <button onClick={() => copy(formattedOutput)} disabled={!identity || isGenerating} className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${copiedText ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--orange-border)] shadow-sm'}`}>
            {copiedText ? <Check className="size-5" /> : <Copy className="size-5" />}
            {copiedText ? 'Copied Successfully' : 'Copy Full'}
          </button>
        </div>
      </div>

      <article className="glass rounded-3xl p-8 md:p-12 shadow-sm">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Why Use a Localized Identity Generator?</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-3">
            <div className="size-10 bg-[var(--orange-dim)] rounded-lg flex items-center justify-center text-[var(--orange)] border border-[var(--orange-border)] mb-4"><Database className="size-5" /></div>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">Database Seeding</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Instantly populate pre-production databases with localized records. Ensures that pagination, sorting, and regional search algorithms can be tested comprehensively before launch.</p>
          </div>
          <div className="space-y-3">
            <div className="size-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 border border-blue-500/20 mb-4"><FileCode2 className="size-5" /></div>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">Strict Form Validation</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">QA teams require accurately formatted edge-case addresses to stress-test UI inputs. Generate complex international postal codes and distinct regional phone formatting patterns securely.</p>
          </div>
          <div className="space-y-3">
            <div className="size-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20 mb-4"><Shield className="size-5" /></div>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">Maintain Compliance</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Prevent data leaks and GDPR violations. By utilizing synthesized mock identities, guarantee that no real PII (Personally Identifiable Information) enters non-production environments.</p>
          </div>
        </div>
      </article>

    </div>
  );
}
