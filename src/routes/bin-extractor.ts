import { Hono } from 'hono';

type Bindings = {
  // Add your Cloudflare bindings here if needed (e.g., KV, D1)
};

const binExtractor = new Hono<{ Bindings: Bindings }>();

// Pre-compiled regexes for V8 isolate optimization
const SEQUENCE_REGEX = /\d{6,}/g; 
const MII_REGEX = /^[3456]/; // Amex, Visa, Mastercard, Discover

binExtractor.post('/extract', async (c) => {
  const traceId = crypto.randomUUID(); 
  const startTime = performance.now(); 

  try {
    // Infrastructure security: Guard against massive OOM payloads
    const contentLength = Number(c.req.header('content-length') || 0);
    const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB limit
    
    if (contentLength > MAX_PAYLOAD_SIZE) {
      return c.json({ 
        success: false, 
        error: 'Payload Too Large. Maximum allowed dump size is 5MB.' 
      }, 413);
    }

    const body = await c.req.json<{ text?: string; extract8Digit?: boolean }>().catch(() => null);

    if (!body || typeof body.text !== 'string' || !body.text.trim()) {
      return c.json({ success: false, error: 'Valid text input is required.' }, 400);
    }

    const { text, extract8Digit = false } = body;
    const targetLength = extract8Digit ? 8 : 6;
    const validBins = new Set<string>();

    // Lazy Iteration: matchAll yields results one by one, keeping heap usage flat
    const matches = text.matchAll(SEQUENCE_REGEX);

    for (const match of matches) {
      const rawSequence = match[0];

      // Fast-path rejection
      if (!MII_REGEX.test(rawSequence)) continue;

      if (rawSequence.length >= 6 && rawSequence.length <= targetLength) {
        validBins.add(rawSequence);
      } else if (rawSequence.length > targetLength) {
        // Truncate full PANs or longer sequences to the requested BIN length
        validBins.add(rawSequence.substring(0, targetLength));
      }
    }

    const binsArray = Array.from(validBins);
    const processingTimeMs = Math.round(performance.now() - startTime);

    // Asynchronous background task (does not block the HTTP response)
    c.executionCtx.waitUntil(
      (async () => {
        const telemetryData = {
          event: 'bin_extraction',
          traceId,
          targetFormat: extract8Digit ? 8 : 6,
          charsProcessed: text.length,
          binsFound: binsArray.length,
          processingTimeMs,
          timestamp: Date.now(),
        };
        console.log(JSON.stringify(telemetryData));
      })()
    );

    return c.json({
      success: true,
      meta: {
        traceId,
        processingTimeMs,
        targetFormat: extract8Digit ? '8-digit' : '6-digit',
      },
      totalFound: binsArray.length,
      bins: binsArray,
    });

  } catch (error) {
    console.error(`[${traceId}] BIN Extraction Error:`, error);
    return c.json({ 
      success: false, 
      error: 'An internal infrastructure error occurred during extraction.',
      traceId 
    }, 500);
  }
});

export default binExtractor;
