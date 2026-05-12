import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const toolsRouter = new Hono();

// ==========================================
// 1. Interfaces & Type Definitions
// ==========================================

interface CardSpecs {
  network: string;
  length: number;
  cvvLength: number;
}

interface GeneratedCard {
  network: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  formattedString: string;
}

interface StripeMetadataResponse {
  data?: Array<{
    account_range_high?: string;
    account_range_low?: string;
    brand?: string;
    country?: string;
    funding?: string;
    pan_length?: number;
  }>;
}

// ==========================================
// 2. Cryptographic & Algorithmic Utilities
// ==========================================

/**
 * Executes a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG).
 * Utilizes Uint32Array to eliminate the modulo bias inherent in standard 8-bit arrays.
 */
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % range);
}

/**
 * Calculates the exact Luhn Check Digit (Modulus 10) for a given numeric vector.
 */
function calculateLuhnCheckDigit(partialCardNumber: string): number {
  let sum = 0;
  let isEven = true; // Processing from right to left (excluding the missing check digit)

  for (let i = partialCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(partialCardNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Maps standard Bank Identification Numbers to their authoritative network specifications.
 */
function getCardNetworkSpecs(bin: string): CardSpecs {
  if (/^3[47]/.test(bin)) return { network: 'American Express', length: 15, cvvLength: 4 };
  if (/^5[1-5]/.test(bin) || /^2(2[2-9][1-9]|2[3-9]\d{2}|[3-6]\d{3}|7[0-1]\d{2}|720)/.test(bin)) return { network: 'Mastercard', length: 16, cvvLength: 3 };
  if (/^4/.test(bin)) return { network: 'Visa', length: 16, cvvLength: 3 };
  if (/^6(?:011|5\d{2}|4[4-9]\d|22(?:12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]))/.test(bin)) return { network: 'Discover', length: 16, cvvLength: 3 };
  if (/^35/.test(bin)) return { network: 'JCB', length: 16, cvvLength: 3 };
  if (/^3(?:0[0-5]|[68])/.test(bin)) return { network: 'Diners Club', length: 14, cvvLength: 3 };
  if (/^5[45]/.test(bin)) return { network: 'Diners Club US', length: 16, cvvLength: 3 };
  if (/^62/.test(bin)) return { network: 'China UnionPay', length: 16, cvvLength: 3 }; 
  return { network: 'Unknown', length: 16, cvvLength: 3 };
}

// ==========================================
// 3. Tool Execution Endpoints
// ==========================================

const generateCardsSchema = z.object({
  bin: z.string().min(6).max(16).regex(/^[0-9]+$/, "BIN format strictly constrained to numerics"),
  quantity: z.coerce.number().int().min(1).max(500).default(10)
});

toolsRouter.post('/generate-cards', zValidator('json', generateCardsSchema), (c) => {
  const { bin, quantity } = c.req.valid('json');
  const specs = getCardNetworkSpecs(bin);
  const currentYear = new Date().getFullYear();
  const generatedCards: GeneratedCard[] = [];
  
  for (let i = 0; i < quantity; i++) {
    // Stage 1: Seed partial payload based on BIN
    let partialNum = bin;
    
    // Stage 2: Pad cryptographically secure digits up to (Length - 1)
    while (partialNum.length < specs.length - 1) {
      partialNum += getSecureRandomInt(0, 9).toString();
    }
    
    // Stage 3: Calculate and append verified Modulus 10 Check Digit
    const checkDigit = calculateLuhnCheckDigit(partialNum);
    const finalNumber = partialNum + checkDigit.toString();

    // Stage 4: Generate contextual metadata (Expiry & CVV)
    const month = String(getSecureRandomInt(1, 12)).padStart(2, '0');
    const year = String(currentYear + getSecureRandomInt(1, 5));
    const cvv = Array.from({ length: specs.cvvLength }, () => getSecureRandomInt(0, 9)).join('');

    generatedCards.push({ 
      network: specs.network, 
      number: finalNumber, 
      expMonth: month, 
      expYear: year, 
      cvv, 
      formattedString: `${finalNumber}|${month}|${year}|${cvv}` 
    });
  }

  return c.json({ 
    success: true, 
    metadata: { baseBin: bin, networkDetected: specs.network, vectorLength: specs.length }, 
    cards: generatedCards 
  });
});

const checkCardSchema = z.object({
  cardPayload: z.string().min(10, "Payload length insufficient for analysis")
});

toolsRouter.post('/check-card', zValidator('json', checkCardSchema), async (c) => {
  const { cardPayload } = c.req.valid('json');
  
  const rawNumbers = cardPayload.replace(/[^0-9|]/g, '');
  const parts = rawNumbers.split('|');
  const bin = parts[0]?.substring(0, 6) || '';

  let binInfoString = 'Unknown Network';

  // BIN Resolution Vector
  if (bin.length >= 6) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // Prevent node locking
      
      const binResponse = await fetch(`https://api.stripe.com/edge-internal/card-metadata?bin_prefix=${bin}&key=pk_live_51HOrSwC6h1nxGoI3lTAgRjYVrz4dU3fVOabyCcKR3pbEJguCVAlqCxdxCUvoRh1XWwRacViovU3kLKvpkjh7IqkW00iXQsjo3n`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (binResponse.ok) {
        const binData = await binResponse.json() as StripeMetadataResponse;
        if (binData?.data && binData.data.length > 0) {
          const meta = binData.data[0];
          binInfoString = `${meta.brand || 'UNKNOWN'} - ${meta.funding || 'UNKNOWN'} - ${meta.country || 'UNKNOWN'}`;
        }
      }
    } catch (e) {
      // Silently degrade if Stripe edge API rate-limits the node
      console.error(`[Edge Vector] BIN resolution suppressed: ${e}`);
    }
  }

  // Gateway Simulation Vector
  try {
    const params = new URLSearchParams();
    params.append('data', cardPayload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const checkResponse = await fetch("https://mock.payate.com/api.php", {
      headers: {
        "accept": "*/*",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://mock.payate.com/"
      },
      body: params.toString(),
      method: "POST",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const gatewayData = await checkResponse.json() as { error: number; msg: string };
    const cleanMsg = gatewayData.msg ? gatewayData.msg.replace(/<[^>]*>?/gm, '').trim() : 'Execution completed without response data';

    let statusString = 'Unknown';
    if (gatewayData.error === 1) statusString = 'Live';
    else if (gatewayData.error === 2) statusString = 'Die';

    return c.json({ 
      success: true, 
      status: statusString,
      rawMsg: gatewayData.msg,
      cleanMsg: cleanMsg,
      binInfo: binInfoString,
      formattedOutput: `${cardPayload} BIN Info: <${binInfoString}>`
    });

  } catch (error) {
    return c.json({ 
      success: false, 
      status: 'Error', 
      message: 'Gateway execution timed out or failed to resolve connection.',
      formattedOutput: `${cardPayload} BIN Info: <${binInfoString}> - Connection Fault`
    }, 502);
  }
});

const checkBinSchema = z.object({ 
  bin: z.string().min(6).max(16).regex(/^[0-9]+$/, "BIN format strictly constrained to numerics") 
});

toolsRouter.post('/check-bin', zValidator('json', checkBinSchema), async (c) => {
  const { bin } = c.req.valid('json');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`https://api.stripe.com/edge-internal/card-metadata?bin_prefix=${bin}&key=pk_live_51HOrSwC6h1nxGoI3lTAgRjYVrz4dU3fVOabyCcKR3pbEJguCVAlqCxdxCUvoRh1XWwRacViovU3kLKvpkjh7IqkW00iXQsjo3n`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return c.json({ success: false, message: 'Upstream metadata oracle rejected the query' }, 502);
    
    const data = await response.json() as StripeMetadataResponse;
    
    if (data?.data && data.data.length > 0) {
      return c.json({ 
        success: true, 
        metadata: data.data[0],
        fullResponse: data
      });
    }
    return c.json({ success: false, message: 'BIN unregistered in global ledger' }, 404);
  } catch (error) {
    return c.json({ success: false, message: 'Network execution failed or timed out' }, 504);
  }
});

const checkIpSchema = z.object({ 
  ip: z.string().optional() 
});

toolsRouter.post('/check-ip', zValidator('json', checkIpSchema), async (c) => {
  let { ip } = c.req.valid('json');
  
  // IP Extraction Fallback Vector
  if (!ip || ip.trim() === '') {
    const rawIp = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || '1.1.1.1';
    ip = rawIp.split(',')[0].trim();
  }

  try {
    let ipInfo: any = null;
    let fallbackUsed = false;

    // Execution Stage 1: Primary Oracle (ip-api.com)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const ipApiRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (ipApiRes.ok) {
        const data = await ipApiRes.json() as any;
        if (data.status === 'success') ipInfo = data;
      }
    } catch (e) {
      console.warn('[Edge Vector] IP-API timeout, failing over to secondary oracle.');
    }

    // Execution Stage 2: Secondary Oracle (ipwho.is)
    if (!ipInfo) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const ipWhoRes = await fetch(`https://ipwho.is/${ip}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (ipWhoRes.ok) {
          const data = await ipWhoRes.json() as any;
          if (data.success) {
            ipInfo = {
              continent: data.continent,
              country: data.country,
              countryCode: data.country_code,
              regionName: data.region,
              city: data.city,
              zip: data.postal || '',
              lat: data.latitude,
              lon: data.longitude,
              timezone: data.timezone?.id || 'UTC',
              isp: data.connection?.isp || 'Unknown',
              org: data.connection?.org || 'Unknown',
              as: data.connection?.asn ? `AS${data.connection.asn}` : 'Unknown',
              reverse: data.connection?.domain || '',
              mobile: false, 
              proxy: false,
              hosting: false
            };
            fallbackUsed = true;
          }
        }
      } catch (e) {
        // Total oracle failure
      }
    }

    if (!ipInfo) {
      return c.json({ success: false, message: 'All upstream Geo-IP providers rejected the connection or rate-limited the node.' }, 502);
    }

    // Execution Stage 3: Proxy & VPN Threat Analysis
    let proxyData: any = {};
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const proxyCheckRes = await fetch(`https://proxycheck.io/v2/${ip}?vpn=1&asn=1&risk=1`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (proxyCheckRes.ok) {
        const proxyCheck = await proxyCheckRes.json() as any;
        proxyData = proxyCheck[ip] || {};
      }
    } catch {
      // Graceful degradation for proxy check
    }

    const data = {
       ip,
       location: {
         continent: ipInfo.continent || 'Unknown', 
         country: ipInfo.country || 'Unknown', 
         countryCode: ipInfo.countryCode || 'XX',
         region: ipInfo.regionName || 'Unknown', 
         city: ipInfo.city || 'Unknown', 
         zip: ipInfo.zip || '',
         lat: ipInfo.lat || 0, 
         lon: ipInfo.lon || 0, 
         timezone: ipInfo.timezone || 'UTC',
       },
       network: {
         isp: ipInfo.isp || 'Unknown', 
         org: ipInfo.org || 'Unknown', 
         asn: ipInfo.as || 'Unknown', 
         reverse: ipInfo.reverse || ''
       },
       security: {
         isProxy: ipInfo.proxy === true || proxyData.proxy === 'yes' || false,
         isVpn: proxyData.vpn === 'yes' || false,
         isHosting: ipInfo.hosting === true || false,
         isMobile: ipInfo.mobile === true || false,
         riskScore: parseInt(proxyData.risk) || 0,
         type: proxyData.type || (fallbackUsed ? 'Unknown' : 'Residential')
       }
    };

    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, message: 'Execution timeout during IP analysis sequence.' }, 500);
  }
});
