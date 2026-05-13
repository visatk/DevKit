import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SeoHead } from '@/components/SeoHead';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { 
  Copy, Check, MapPin, UserSquare2, Globe, Loader2, ArrowLeft,
  Briefcase, WalletCards, Database, FileCode2, Shield, ChevronRight, 
  RefreshCw, MousePointerClick, Cpu, Plane
} from 'lucide-react';
// v10 ESM Imports
import { Faker, allLocales, en, base } from '@faker-js/faker';

// Exhaustive v10 Locale Map
const FAKER_LOCALES = [
  { code: 'af_ZA', name: 'Afrikaans (South Africa)', country: 'ZA', region: 'Africa' },
  { code: 'ar', name: 'Arabic', country: 'AE', region: 'Middle East' },
  { code: 'az', name: 'Azerbaijani', country: 'AZ', region: 'Asia' },
  { code: 'bn_BD', name: 'Bengali (Bangladesh)', country: 'BD', region: 'Asia' },
  { code: 'cs_CZ', name: 'Czech (Czechia)', country: 'CZ', region: 'Europe' },
  { code: 'da', name: 'Danish', country: 'DK', region: 'Europe' },
  { code: 'de', name: 'German', country: 'DE', region: 'Europe' },
  { code: 'en', name: 'English', country: 'US', region: 'North America' },
  { code: 'en_GB', name: 'English (Great Britain)', country: 'GB', region: 'Europe' },
  { code: 'es', name: 'Spanish', country: 'ES', region: 'Europe' },
  { code: 'fr', name: 'French', country: 'FR', region: 'Europe' },
  { code: 'hi', name: 'Hindi (India)', country: 'IN', region: 'Asia' },
  { code: 'id_ID', name: 'Indonesian', country: 'ID', region: 'Asia' },
  { code: 'it', name: 'Italian', country: 'IT', region: 'Europe' },
  { code: 'ja', name: 'Japanese', country: 'JP', region: 'Asia' },
  { code: 'ko', name: 'Korean', country: 'KR', region: 'Asia' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)', country: 'BR', region: 'South America' },
  { code: 'ru', name: 'Russian', country: 'RU', region: 'Europe' },
  { code: 'zh_CN', name: 'Chinese (China)', country: 'CN', region: 'Asia' }
  // Note: Expanded as needed in production based on allLocales keys
];

const getFlagEmoji = (cc: string) => {
  if (!cc || cc === 'UN') return '🌐';
  return cc.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

const SUPPORTED_LOCALES = FAKER_LOCALES.reduce((acc, locale) => {
  if (allLocales[locale.code as keyof typeof allLocales]) {
    acc[locale.code] = { ...locale, flag: getFlagEmoji(locale.country) };
  }
  return acc;
}, {} as Record<string, typeof FAKER_LOCALES[0] & { flag: string }>);

type IdentityPayload = {
  avatar: string; fullName: string; gender: string; dateOfBirth: string; phone: string; idNumber: string; uuid: string;
  jobTitle: string; department: string; company: string;
  street: string; secondaryAddress: string; city: string; state: string; zip: string; country: string; coordinates: string; timezone: string;
  email: string; username: string; password: string; ipAddress: string; macAddress: string; userAgent: string;
  networkInterface: string; commitSha: string;
  creditCard: string; cvv: string; ccIssuer: string; iban: string; cryptoAddress: string; ethereumAddress: string;
  recordLocator: string; currency: string;
};

// JSON-LD Injection for SEO Optimization
const injectStructuredData = (localeName: string, isDirectory: boolean) => {
  const schema = isDirectory ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Global Fake Address Generator Directory",
    "applicationCategory": "DeveloperApplication",
    "description": "Browse and generate culturally accurate, localized fake addresses and mock identities for over 70+ countries for QA and database seeding."
  } : {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${localeName} Fake Address Generator`,
    "applicationCategory": "DeveloperApplication",
    "description": `Instantly generate mathematically valid, localized mock identities, fake addresses, and digital footprints specifically for ${localeName}.`
  };

  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};

const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
    <Icon className="size-4 text-[var(--orange)] shrink-0" aria-hidden="true" />
    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-widest truncate font-syne">{title}</h3>
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
    <button 
      onClick={handleCopy}
      className="group w-full text-left relative p-3 -mx-2 sm:-mx-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
      aria-label={`Copy ${label}: ${value}`}
    >
      <span className="block text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{label}</span>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <span className={`text-sm font-medium text-[var(--text-primary)] break-words transition-colors group-hover:text-[var(--orange)] ${mono ? 'font-mono text-[12px] sm:text-[13px] bg-[var(--surface-raised)] px-2 py-0.5 rounded border border-[var(--border-strong)]' : ''}`}>
          {value}
        </span>
        <span className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors mt-0.5">
          {copied ? <Check className="size-4 text-emerald-500 scale-110 transition-transform" /> : <Copy className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </span>
      </div>
    </button>
  );
};

export default function FakeAddress() {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const [identity, setIdentity] = useState<IdentityPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { copiedText, copy } = useCopyToClipboard();

  const activeLocaleData = locale ? SUPPORTED_LOCALES[locale] : null;

  const generateIdentity = useCallback(() => {
    if (!activeLocaleData || isGenerating) return;
    setIsGenerating(true);
    
    // Slight delay to allow UI to render the loading state smoothly
    setTimeout(() => {
      try {
        const targetLocaleDef = allLocales[activeLocaleData.code as keyof typeof allLocales];
        
        // V10 Fallback Architecture: Ensures 100% data coverage even for sparse locales like bn_BD
        const faker = new Faker({
          locale: [targetLocaleDef, en, base],
        });

        // Strict null safety wrapper
        const safeCall = (fn: () => string | null | undefined, fallback: string = 'N/A') => {
          try { 
            const res = fn(); 
            return res === null || res === undefined || String(res).trim() === '' ? fallback : String(res); 
          } catch { return fallback; }
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
          username: safeCall(() => faker.internet.username({ firstName, lastName })),
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
    }, 150);
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

  // ---------------------------------------------------------------------------
  // View: Global Directory
  // ---------------------------------------------------------------------------
  if (!locale) {
    const groupedLocales = Object.entries(SUPPORTED_LOCALES).reduce((acc, [slug, data]) => {
      if (!acc[data.region]) acc[data.region] = [];
      acc[data.region].push({ slug, ...data });
      return acc;
    }, {} as Record<string, Array<{ slug: string; code: string; name: string; flag: string; }>>);

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:py-12 animation-fade-in" aria-labelledby="directory-title">
        {injectStructuredData("Global", true)}
        <SeoHead 
          title="Global Fake Address Generator | Localized Mock Identities" 
          description="Browse and generate culturally accurate, localized fake addresses and mock identities for over 70+ countries for QA and database seeding." 
          keywords="fake address generator directory, global mock identity, random address by country, test user profiles"
          isTool={true}
        />
        
        <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Globe className="size-3.5 fill-current" /> Identity Architecture
          </div>
          <h1 id="directory-title" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 px-2 font-syne text-[var(--text-primary)]">
            Select Localization Profile
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 px-4 leading-relaxed">
            Choose a specific region to dynamically generate culturally accurate mock identities and mathematically valid regional footprints based on the Faker v10 engine.
          </p>
        </header>

        <div className="grid gap-12 md:gap-16 mb-20">
          {Object.entries(groupedLocales).sort(([a], [b]) => a.localeCompare(b)).map(([region, locales]) => (
            <section key={region} aria-labelledby={`region-${region}`}>
              <h2 id={`region-${region}`} className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2 px-1 font-syne">
                <MapPin className="size-4" /> {region}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {locales.sort((a, b) => a.name.localeCompare(b.name)).map(loc => (
                  <Link 
                    key={loc.slug} 
                    to={`/fake-address/${loc.slug}`}
                    className="flex items-center justify-between p-4 sm:p-5 bg-[var(--surface-raised)] border border-[var(--border-strong)] hover:border-[var(--orange-border)] hover:shadow-xl hover:shadow-orange-500/5 group rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="text-3xl filter drop-shadow-md shrink-0">{loc.flag}</span>
                      <span className="font-semibold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--orange)] transition-colors truncate">
                        {loc.name}
                      </span>
                    </div>
                    <ChevronRight className="size-5 text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors shrink-0 group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // View: Specific Region Dashboard
  // ---------------------------------------------------------------------------
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:py-8 animation-fade-in" aria-labelledby="dashboard-title">
      {injectStructuredData(activeLocaleData?.name || "Localized", false)}
      <SeoHead 
        title={`${activeLocaleData?.name} Fake Address Generator | Mock Identity`}
        description={`Generate localized fake addresses, random names, and dummy profiles specifically for ${activeLocaleData?.name}. High-fidelity mock identity vectors for QA testing.`}
        keywords={`fake address generator ${activeLocaleData?.name}, random address ${activeLocaleData?.name}, mock identity ${activeLocaleData?.name}, dummy data ${activeLocaleData?.name}`}
        isTool={true}
      />
      
      <header className="mb-8 md:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <Link 
            to="/fake-address" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-[var(--orange)] rounded-lg p-1 -ml-1"
          >
            <ArrowLeft className="size-4" /> Back to Global Directory
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <span className="text-4xl sm:text-5xl filter drop-shadow-md" aria-hidden="true">{activeLocaleData?.flag}</span>
            <h1 id="dashboard-title" className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight break-words font-syne text-[var(--text-primary)]">
              {activeLocaleData?.name} Address
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Instantly generate structurally valid identity payloads, financial traces, and digital footprints localized explicitly for {activeLocaleData?.name}.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-500/20 self-start xl:self-auto shadow-sm">
          <MousePointerClick className="size-4 shrink-0" /> 
          <span className="hidden sm:inline">Click any field to copy to clipboard</span>
          <span className="sm:hidden">Tap to copy</span>
        </div>
      </header>

      {/* Primary Dashboard UI */}
      <section 
        className="glass shadow-2xl shadow-[var(--orange-dim)] rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 mb-16 relative overflow-hidden"
        aria-live="polite"
        aria-busy={isGenerating}
      >
        {isGenerating && identity && (
          <div className="absolute inset-0 z-10 bg-[var(--surface-raised)]/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl md:rounded-3xl transition-all">
            <Loader2 className="size-12 text-[var(--orange)] animate-spin mb-4" />
            <span className="text-sm font-bold text-[var(--text-primary)] font-syne tracking-widest uppercase">Synthesizing Profile...</span>
          </div>
        )}

        {identity ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            
            {/* Column 1: Personal Data */}
            <div className="bg-[var(--surface-raised)] rounded-2xl p-5 sm:p-6 border border-[var(--border-strong)] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <SectionTitle icon={UserSquare2} title="Personal Profile" />
              <div className="flex items-center gap-4 mb-6 p-2 sm:p-3 -mx-2 sm:-mx-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent">
                <img src={identity.avatar} alt={`Avatar for ${identity.fullName}`} className="size-12 sm:size-14 rounded-full bg-[var(--surface)] object-cover shadow-sm ring-2 ring-[var(--border-strong)] shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <InteractiveDataField label="Full Name" value={identity.fullName} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="Gender" value={identity.gender} />
                <InteractiveDataField label="Date of Birth" value={identity.dateOfBirth} />
              </div>
              <InteractiveDataField label="Phone Number" value={identity.phone} mono />
              <InteractiveDataField label="National ID" value={identity.idNumber} mono />
              <InteractiveDataField label="System UUID" value={identity.uuid} mono />
            </div>

            {/* Column 2: Professional & Location */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-5 sm:p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <SectionTitle icon={Briefcase} title="Professional & Locale" />
              <InteractiveDataField label="Job Title" value={identity.jobTitle} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="Company" value={identity.company} />
                <InteractiveDataField label="Department" value={identity.department} />
              </div>
              
              <hr className="my-5 border-t border-dashed border-zinc-300 dark:border-zinc-800" />
              
              <InteractiveDataField label="Street Address" value={`${identity.street}, ${identity.secondaryAddress}`} />
              <InteractiveDataField label="City & Region" value={`${identity.city}, ${identity.state} ${identity.zip}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="Country" value={identity.country} />
                <InteractiveDataField label="Timezone" value={identity.timezone} />
              </div>
              <InteractiveDataField label="Geo Coordinates" value={identity.coordinates} mono />
            </div>

            {/* Column 3: Digital Footprint */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-5 sm:p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <SectionTitle icon={Cpu} title="Digital Footprint" />
              <InteractiveDataField label="Email Address" value={identity.email} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="Username" value={identity.username} mono />
                <InteractiveDataField label="Password" value={identity.password} mono />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="IP Address" value={identity.ipAddress} mono />
                <InteractiveDataField label="MAC Address" value={identity.macAddress} mono />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="Network Interface" value={identity.networkInterface} mono />
                <InteractiveDataField label="Commit SHA" value={identity.commitSha} mono />
              </div>
              <InteractiveDataField label="User-Agent Payload" value={identity.userAgent} mono />
            </div>

            {/* Column 4: Financial & Travel */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-5 sm:p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <SectionTitle icon={WalletCards} title="Financial & Travel" />
              <InteractiveDataField label="Credit Card" value={`${identity.ccIssuer} - ${identity.creditCard}`} mono />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="CVV" value={identity.cvv} mono />
                <InteractiveDataField label="Currency" value={identity.currency} mono />
              </div>
              <InteractiveDataField label="IBAN" value={identity.iban} mono />
              
              <hr className="my-5 border-t border-dashed border-zinc-300 dark:border-zinc-800" />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-2">
                <InteractiveDataField label="Bitcoin" value={identity.cryptoAddress} mono />
                <InteractiveDataField label="Ethereum" value={identity.ethereumAddress} mono />
              </div>
              <div className="mt-auto pt-6">
                <SectionTitle icon={Plane} title="Aviation Vector" />
                <InteractiveDataField label="Flight Record Locator" value={identity.recordLocator} mono />
              </div>
            </div>

          </div>
        ) : (
          <div className="h-48 sm:h-72 flex flex-col items-center justify-center bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-strong)] border-dashed mb-6 sm:mb-8 transition-colors">
            {isGenerating ? (
              <Loader2 className="size-10 sm:size-12 text-[var(--orange)] animate-spin mb-4" />
            ) : (
              <span className="text-6xl sm:text-7xl filter drop-shadow-sm mb-4 grayscale opacity-40">{activeLocaleData?.flag}</span>
            )}
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium text-center px-4 font-syne">
              {isGenerating ? 'Synthesizing Architecture...' : 'Awaiting Edge Initialization...'}
            </p>
          </div>
        )}
        
        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 pt-5 sm:pt-6 border-t border-[var(--border-strong)]">
          <button 
            onClick={generateIdentity} 
            disabled={isGenerating} 
            className="flex-1 w-full flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 bg-[var(--text-primary)] text-[var(--bg)] text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-[var(--orange)] hover:text-white transition-all duration-300 shadow-md active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[var(--orange-dim)] disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Regenerate Identity Footprint"
          >
            <RefreshCw className={`size-4 sm:size-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Regenerating...' : 'Regenerate Footprint'}
          </button>
          <button 
            onClick={() => copy(formattedOutput)} 
            disabled={!identity || isGenerating} 
            className={`flex-1 w-full flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${copiedText ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border-transparent' : 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--orange-border)] hover:bg-[var(--surface)] shadow-sm'}`}
            aria-label="Copy Full Identity Payload"
          >
            {copiedText ? <Check className="size-4 sm:size-5" /> : <Copy className="size-4 sm:size-5" />}
            {copiedText ? 'Payload Copied' : 'Copy Full Identity'}
          </button>
        </div>
      </section>

    </main>
  );
}
