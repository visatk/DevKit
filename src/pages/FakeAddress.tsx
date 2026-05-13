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

// Exact mappings derived from Faker.js v9 Documentation
const FAKER_LOCALES = [
  { code: 'af_ZA', name: 'Afrikaans (South Africa)', country: 'ZA', region: 'Africa' },
  { code: 'ar', name: 'Arabic', country: 'AE', region: 'Middle East' },
  { code: 'az', name: 'Azerbaijani', country: 'AZ', region: 'Asia' },
  { code: 'bn_BD', name: 'Bengali (Bangladesh)', country: 'BD', region: 'Asia' },
  { code: 'cs_CZ', name: 'Czech (Czechia)', country: 'CZ', region: 'Europe' },
  { code: 'cy', name: 'Welsh', country: 'GB', region: 'Europe' },
  { code: 'da', name: 'Danish', country: 'DK', region: 'Europe' },
  { code: 'de', name: 'German', country: 'DE', region: 'Europe' },
  { code: 'de_AT', name: 'German (Austria)', country: 'AT', region: 'Europe' },
  { code: 'de_CH', name: 'German (Switzerland)', country: 'CH', region: 'Europe' },
  { code: 'dv', name: 'Maldivian', country: 'MV', region: 'Asia' },
  { code: 'el', name: 'Greek', country: 'GR', region: 'Europe' },
  { code: 'en', name: 'English', country: 'US', region: 'North America' },
  { code: 'en_AU', name: 'English (Australia)', country: 'AU', region: 'Oceania' },
  { code: 'en_AU_ocker', name: 'English (Australia Ocker)', country: 'AU', region: 'Oceania' },
  { code: 'en_BORK', name: 'English (Bork)', country: 'SE', region: 'Europe' },
  { code: 'en_CA', name: 'English (Canada)', country: 'CA', region: 'North America' },
  { code: 'en_GB', name: 'English (Great Britain)', country: 'GB', region: 'Europe' },
  { code: 'en_GH', name: 'English (Ghana)', country: 'GH', region: 'Africa' },
  { code: 'en_HK', name: 'English (Hong Kong)', country: 'HK', region: 'Asia' },
  { code: 'en_IE', name: 'English (Ireland)', country: 'IE', region: 'Europe' },
  { code: 'en_IN', name: 'English (India)', country: 'IN', region: 'Asia' },
  { code: 'en_NG', name: 'English (Nigeria)', country: 'NG', region: 'Africa' },
  { code: 'en_US', name: 'English (United States)', country: 'US', region: 'North America' },
  { code: 'en_ZA', name: 'English (South Africa)', country: 'ZA', region: 'Africa' },
  { code: 'eo', name: 'Esperanto', country: 'UN', region: 'Global' },
  { code: 'es', name: 'Spanish', country: 'ES', region: 'Europe' },
  { code: 'es_MX', name: 'Spanish (Mexico)', country: 'MX', region: 'North America' },
  { code: 'fa', name: 'Farsi/Persian', country: 'IR', region: 'Middle East' },
  { code: 'fi', name: 'Finnish', country: 'FI', region: 'Europe' },
  { code: 'fr', name: 'French', country: 'FR', region: 'Europe' },
  { code: 'fr_BE', name: 'French (Belgium)', country: 'BE', region: 'Europe' },
  { code: 'fr_CA', name: 'French (Canada)', country: 'CA', region: 'North America' },
  { code: 'fr_CH', name: 'French (Switzerland)', country: 'CH', region: 'Europe' },
  { code: 'fr_LU', name: 'French (Luxembourg)', country: 'LU', region: 'Europe' },
  { code: 'fr_SN', name: 'French (Senegal)', country: 'SN', region: 'Africa' },
  { code: 'he', name: 'Hebrew', country: 'IL', region: 'Middle East' },
  { code: 'hr', name: 'Croatian', country: 'HR', region: 'Europe' },
  { code: 'hu', name: 'Hungarian', country: 'HU', region: 'Europe' },
  { code: 'hy', name: 'Armenian', country: 'AM', region: 'Asia' },
  { code: 'id_ID', name: 'Indonesian (Indonesia)', country: 'ID', region: 'Asia' },
  { code: 'it', name: 'Italian', country: 'IT', region: 'Europe' },
  { code: 'ja', name: 'Japanese', country: 'JP', region: 'Asia' },
  { code: 'ka_GE', name: 'Georgian (Georgia)', country: 'GE', region: 'Asia' },
  { code: 'ko', name: 'Korean', country: 'KR', region: 'Asia' },
  { code: 'ku_ckb', name: 'Kurdish (Sorani)', country: 'IQ', region: 'Middle East' },
  { code: 'ku_kmr_latin', name: 'Kurdish (Kurmanji, Latin)', country: 'TR', region: 'Europe' },
  { code: 'lv', name: 'Latvian', country: 'LV', region: 'Europe' },
  { code: 'mk', name: 'Macedonian', country: 'MK', region: 'Europe' },
  { code: 'nb_NO', name: 'Norwegian (Norway)', country: 'NO', region: 'Europe' },
  { code: 'ne', name: 'Nepali', country: 'NP', region: 'Asia' },
  { code: 'nl', name: 'Dutch', country: 'NL', region: 'Europe' },
  { code: 'nl_BE', name: 'Dutch (Belgium)', country: 'BE', region: 'Europe' },
  { code: 'pl', name: 'Polish', country: 'PL', region: 'Europe' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)', country: 'BR', region: 'South America' },
  { code: 'pt_PT', name: 'Portuguese (Portugal)', country: 'PT', region: 'Europe' },
  { code: 'ro', name: 'Romanian', country: 'RO', region: 'Europe' },
  { code: 'ro_MD', name: 'Romanian (Moldova)', country: 'MD', region: 'Europe' },
  { code: 'ru', name: 'Russian', country: 'RU', region: 'Europe' },
  { code: 'sk', name: 'Slovak', country: 'SK', region: 'Europe' },
  { code: 'sl_SI', name: 'Slovenian (Slovenia)', country: 'SI', region: 'Europe' },
  { code: 'sr_RS_latin', name: 'Serbian (Serbia, Latin)', country: 'RS', region: 'Europe' },
  { code: 'sv', name: 'Swedish', country: 'SE', region: 'Europe' },
  { code: 'ta_IN', name: 'Tamil (India)', country: 'IN', region: 'Asia' },
  { code: 'th', name: 'Thai', country: 'TH', region: 'Asia' },
  { code: 'tr', name: 'Turkish', country: 'TR', region: 'Europe' },
  { code: 'uk', name: 'Ukrainian', country: 'UA', region: 'Europe' },
  { code: 'ur', name: 'Urdu', country: 'PK', region: 'Asia' },
  { code: 'uz_UZ_latin', name: 'Uzbek (Uzbekistan, Latin)', country: 'UZ', region: 'Asia' },
  { code: 'vi', name: 'Vietnamese', country: 'VN', region: 'Asia' },
  { code: 'yo_NG', name: 'Yoruba (Nigeria)', country: 'NG', region: 'Africa' },
  { code: 'zh_CN', name: 'Chinese (China)', country: 'CN', region: 'Asia' },
  { code: 'zh_TW', name: 'Chinese (Taiwan)', country: 'TW', region: 'Asia' },
  { code: 'zu_ZA', name: 'Zulu (South Africa)', country: 'ZA', region: 'Africa' }
];

const getFlagEmoji = (cc: string) => {
  if (!cc || cc === 'UN') return '🌐';
  return cc.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

const SUPPORTED_LOCALES = FAKER_LOCALES.reduce((acc, locale) => {
  // Only map if the locale actually exists in the current Faker version installed
  if (allFakers[locale.code as keyof typeof allFakers]) {
    acc[locale.code] = {
      code: locale.code,
      name: locale.name,
      region: locale.region,
      flag: getFlagEmoji(locale.country)
    };
  }
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
  { question: "How many regional locales are supported?", answer: "The localization engine automatically leverages over 70+ official locales directly from the Faker.js API, generating culturally accurate names, appropriate state/province abbreviations, and mathematically correct postal code formats for regions worldwide." }
];

const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
    <Icon className="size-4 text-orange-500 shrink-0" />
    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-widest truncate">{title}</h3>
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
      className="group relative p-3 -mx-2 sm:-mx-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50"
      title={`Copy ${label}`}
    >
      <label className="block text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 cursor-pointer">{label}</label>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className={`text-sm font-medium text-[var(--text-primary)] break-words transition-colors group-hover:text-[var(--orange)] ${mono ? 'font-mono text-[12px] sm:text-[13px] bg-[var(--surface-raised)] px-2 py-0.5 rounded border border-[var(--border-strong)]' : ''}`}>
          {value}
        </div>
        <div className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors mt-0.5">
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

        // Strict null safety: Faker intentionally returns null for inapplicable regional data (e.g., zip codes in HK)
        const safeCall = (fn: () => string | null | undefined, fallback: string = 'N/A') => {
          try { 
            const res = fn(); 
            return res === null || res === undefined || String(res).trim() === '' ? fallback : String(res); 
          } 
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

  // Render Directory if no locale is selected
  if (!locale) {
    const groupedLocales = Object.entries(SUPPORTED_LOCALES).reduce((acc, [slug, data]) => {
      if (!acc[data.region]) acc[data.region] = [];
      acc[data.region].push({ slug, ...data });
      return acc;
    }, {} as Record<string, Array<{ slug: string; code: string; name: string; flag: string; }>>);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:py-8 animation-fade-in">
        <SeoHead 
          title="Fake Address Generator Directory | Global Mock Identities" 
          description="Browse and generate localized fake addresses, random names, and dummy profiles for specific global regions. Comprehensive mock identity tools for developers." 
          keywords="fake address generator directory, global mock identity, random address by country, test user profiles"
          isTool={true}
          faqData={FAQ_DATA}
        />
        
        <div className="mb-10 md:mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Globe className="size-3.5 fill-current" /> Address Generator
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 px-2">Select Localization Profile</h1>
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 px-4">Choose a specific region to dynamically generate culturally accurate mock identities and mathematically valid regional footprints.</p>
        </div>

        <div className="grid gap-10 md:gap-12 mb-16">
          {Object.entries(groupedLocales).sort(([a], [b]) => a.localeCompare(b)).map(([region, locales]) => (
            <section key={region}>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                <MapPin className="size-4" /> {region}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {locales.sort((a, b) => a.name.localeCompare(b.name)).map(loc => (
                  <Link 
                    key={loc.slug} 
                    to={`/fake-address/${loc.slug}`}
                    className="flex items-center justify-between p-3 sm:p-4 glass card-interactive hover:border-[var(--orange-border)] hover:shadow-lg hover:shadow-orange-500/10 group rounded-2xl"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-2xl filter drop-shadow-sm shrink-0">{loc.flag}</span>
                      <span className="font-semibold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--orange)] transition-colors truncate">{loc.name}</span>
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

  // Render Specific Generator
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:py-8 animation-fade-in">
      <SeoHead 
        title={`${activeLocaleData?.name} Fake Address Generator | Mock Identity`}
        description={`Generate localized fake addresses, random names, and dummy profiles specifically for ${activeLocaleData?.name}. High-fidelity mock identity vectors for QA testing.`}
        keywords={`fake address generator ${activeLocaleData?.name}, random address ${activeLocaleData?.name}, mock identity ${activeLocaleData?.name}, dummy data ${activeLocaleData?.name}`}
        isTool={true}
        faqData={FAQ_DATA}
      />
      
      <div className="mb-6 md:mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <Link to="/fake-address" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft className="size-4" /> Back to Directory
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl filter drop-shadow-md">{activeLocaleData?.flag}</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight break-words">{activeLocaleData?.name} Address</h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">Instantly generate structurally valid identity payloads, financial traces, and digital footprints localized explicitly for {activeLocaleData?.name}.</p>
        </div>
        
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20 self-start xl:self-auto w-fit">
          <MousePointerClick className="size-4 shrink-0" /> <span className="hidden sm:inline">Click any field to copy</span><span className="sm:hidden">Tap to copy</span>
        </div>
      </div>

      <div className="glass shadow-2xl shadow-[var(--orange-dim)] rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 mb-12 sm:mb-16 relative overflow-hidden">
        
        {isGenerating && identity && (
          <div className="absolute inset-0 z-10 bg-[var(--surface-raised)]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl md:rounded-3xl transition-all">
            <Loader2 className="size-10 text-[var(--orange)] animate-spin mb-3" />
            <span className="text-sm font-bold text-[var(--text-primary)]">Regenerating Identity...</span>
          </div>
        )}

        {identity ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            
            {/* Column 1: Personal Data */}
            <div className="bg-[var(--surface-raised)] rounded-2xl p-4 sm:p-6 border border-[var(--border-strong)] shadow-sm flex flex-col">
              <SectionTitle icon={UserSquare2} title="Personal Profile" />
              <div className="flex items-center gap-4 mb-5 p-2 sm:p-3 -mx-2 sm:-mx-3 rounded-xl">
                <img src={identity.avatar} alt="Avatar" className="size-12 sm:size-14 rounded-full bg-[var(--surface)] object-cover shadow-sm ring-2 ring-[var(--border-strong)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <InteractiveDataField label="Full Name" value={identity.fullName} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InteractiveDataField label="Gender" value={identity.gender} />
                <InteractiveDataField label="Date of Birth" value={identity.dateOfBirth} />
              </div>
              <InteractiveDataField label="Phone Number" value={identity.phone} mono />
              <InteractiveDataField label="National ID / SSN" value={identity.idNumber} mono />
              <InteractiveDataField label="Identity UUID" value={identity.uuid} mono />
            </div>

            {/* Column 2: Professional & Location */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-4 sm:p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
              <SectionTitle icon={Briefcase} title="Professional & Locale" />
              <InteractiveDataField label="Job Title" value={identity.jobTitle} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InteractiveDataField label="Company" value={identity.company} />
                <InteractiveDataField label="Department" value={identity.department} />
              </div>
              
              <div className="my-3 border-t border-dashed border-zinc-200 dark:border-zinc-800"></div>
              
              <InteractiveDataField label="Street Address" value={`${identity.street}, ${identity.secondaryAddress}`} />
              <InteractiveDataField label="City & Region" value={`${identity.city}, ${identity.state} ${identity.zip}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InteractiveDataField label="Country" value={identity.country} />
                <InteractiveDataField label="Timezone" value={identity.timezone} />
              </div>
              <InteractiveDataField label="Geo Coordinates" value={identity.coordinates} mono />
            </div>

            {/* Column 3: Digital Footprint */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-4 sm:p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
              <SectionTitle icon={Cpu} title="Digital Footprint" />
              <InteractiveDataField label="Email Address" value={identity.email} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InteractiveDataField label="Username" value={identity.username} mono />
                <InteractiveDataField label="Password" value={identity.password} mono />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InteractiveDataField label="IP Address" value={identity.ipAddress} mono />
                <InteractiveDataField label="MAC Address" value={identity.macAddress} mono />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <InteractiveDataField label="Network Interface" value={identity.networkInterface} mono />
                <InteractiveDataField label="Commit SHA" value={identity.commitSha} mono />
              </div>
              <InteractiveDataField label="User-Agent Payload" value={identity.userAgent} mono />
            </div>

            {/* Column 4: Financial & Travel */}
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-4 sm:p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
              <SectionTitle icon={WalletCards} title="Financial & Travel" />
              <InteractiveDataField label="Credit Card" value={`${identity.ccIssuer} - ${identity.creditCard}`} mono />
              <div className="grid grid-cols-2 gap-x-4">
                <InteractiveDataField label="CVV" value={identity.cvv} mono />
                <InteractiveDataField label="Currency" value={identity.currency} mono />
              </div>
              <InteractiveDataField label="IBAN" value={identity.iban} mono />
              
              <div className="my-3 border-t border-dashed border-zinc-200 dark:border-zinc-800"></div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4">
                <InteractiveDataField label="Bitcoin" value={identity.cryptoAddress} mono />
                <InteractiveDataField label="Ethereum" value={identity.ethereumAddress} mono />
              </div>
              <div className="mt-auto pt-4">
                <SectionTitle icon={Plane} title="Aviation Vector" />
                <InteractiveDataField label="Flight Record Locator" value={identity.recordLocator} mono />
              </div>
            </div>

          </div>
        ) : (
          <div className="h-48 sm:h-64 flex flex-col items-center justify-center bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-strong)] border-dashed mb-6 sm:mb-8 transition-colors">
            {isGenerating ? (
              <Loader2 className="size-8 sm:size-10 text-[var(--orange)] animate-spin mb-4" />
            ) : (
              <span className="text-5xl sm:text-6xl filter drop-shadow-sm mb-4 grayscale opacity-50">{activeLocaleData?.flag}</span>
            )}
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium text-center px-4">
              {isGenerating ? 'Synthesizing Architecture...' : 'Awaiting System Initialization...'}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[var(--border-strong)]">
          <button 
            onClick={generateIdentity} 
            disabled={isGenerating} 
            className="flex-1 w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-[var(--text-primary)] text-[var(--bg)] text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-[var(--orange)] hover:text-white transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`size-4 sm:size-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Regenerating...' : 'Regenerate Footprint'}
          </button>
          <button 
            onClick={() => copy(formattedOutput)} 
            disabled={!identity || isGenerating} 
            className={`flex-1 w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${copiedText ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-transparent' : 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--orange-border)] shadow-sm'}`}
          >
            {copiedText ? <Check className="size-4 sm:size-5" /> : <Copy className="size-4 sm:size-5" />}
            {copiedText ? 'Copied Successfully' : 'Copy Full Identity'}
          </button>
        </div>
      </div>

      {/* Informational SEO Section */}
      <article className="glass rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6 sm:mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
          Why Use a Localized Identity Generator?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-3">
            <div className="size-10 bg-[var(--orange-dim)] rounded-lg flex items-center justify-center text-[var(--orange)] border border-[var(--orange-border)] mb-4">
              <Database className="size-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">Database Seeding</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">Instantly populate pre-production databases with localized records. Ensures that pagination, sorting, and regional search algorithms can be tested comprehensively before launch.</p>
          </div>
          <div className="space-y-3">
            <div className="size-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 border border-blue-500/20 mb-4">
              <FileCode2 className="size-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">Strict Form Validation</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">QA teams require accurately formatted edge-case addresses to stress-test UI inputs. Generate complex international postal codes and distinct regional phone formatting patterns securely.</p>
          </div>
          <div className="space-y-3">
            <div className="size-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20 mb-4">
              <Shield className="size-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">Maintain Compliance</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">Prevent data leaks and GDPR violations. By utilizing synthesized mock identities, guarantee that no real PII (Personally Identifiable Information) enters non-production environments.</p>
          </div>
        </div>
      </article>

    </div>
  );
}
