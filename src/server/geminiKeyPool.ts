import { GoogleGenAI } from '@google/genai';

export interface KeyCooldownEntry {
  untilMs: number;
  reason: 'rate_limit' | 'invalid_key' | 'transient' | string;
}

export interface GeminiKeyPoolInfo {
  configuredKeyCount: number;
  availableKeyCount: number;
  activeKeyIndex: number;
}

export interface GeminiFailoverContext {
  apiKey: string;
  ai: GoogleGenAI;
  attemptIndex: number;
  keyPoolIndex: number;
  totalKeys: number;
}

export interface ExecuteWithFailoverOptions {
  signal?: AbortSignal;
  quotaCooldownMs?: number;
  invalidKeyCooldownMs?: number;
  rotateOnTransient?: boolean;
  onKeyFailover?: (info: {
    failedIndex: number;
    nextIndex: number;
    totalKeys: number;
    reason: 'rate_limit' | 'invalid_key' | 'transient';
    error: unknown;
  }) => void;
}

export class NoGeminiApiKeysError extends Error {
  readonly status = 503;

  constructor(
    message = 'GEMINI_API_KEY বা GEMINI_API_KEYS সেট করা নেই। Vercel-এ Environment Variables বা Settings > Secrets-এ API Key যুক্ত করুন।'
  ) {
    super(message);
    this.name = 'NoGeminiApiKeysError';
  }
}

const DEFAULT_QUOTA_COOLDOWN_MS = 90_000;
const DEFAULT_INVALID_KEY_COOLDOWN_MS = 15 * 60_000;

const keyCooldownMap = new Map<string, KeyCooldownEntry>();
let activeKeyIndex = 0;

/**
 * Splits a raw env string (comma-, semicolon-, space-, or newline-delimited)
 * into sanitized API key tokens.
 */
export function parseKeyTokens(rawValue: string | undefined): string[] {
  if (!rawValue || typeof rawValue !== 'string') return [];
  return rawValue
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(/^['"]|['"]$/g, ''))
    .filter((token) => token.length > 0 && token !== 'MY_GEMINI_API_KEY');
}

/**
 * Parses `GEMINI_API_KEYS`, `GEMINI_API_KEY`, and dynamically detects
 * indexed/named environment variables (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.)
 * in natural numeric order, returning a deduplicated list of keys.
 */
export function getConfiguredGeminiApiKeys(
  env: Record<string, string | undefined> = process.env
): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (raw: string | undefined) => {
    for (const token of parseKeyTokens(raw)) {
      if (!seen.has(token)) {
        seen.add(token);
        keys.push(token);
      }
    }
  };

  // 1. Primary multi-key environment variable (comma/newline/semicolon separated)
  pushUnique(env.GEMINI_API_KEYS);

  // 2. Standard single or comma-separated primary key
  pushUnique(env.GEMINI_API_KEY);

  // 3. Dynamically detected numbered or named keys: GEMINI_API_KEY_1, GEMINI_API_KEY_2, ...
  const dynamicKeyNames = Object.keys(env)
    .filter((name) => /^GEMINI_API_KEY_[A-Z0-9_]+$/i.test(name) && name !== 'GEMINI_API_KEYS')
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const envName of dynamicKeyNames) {
    pushUnique(env[envName]);
  }

  return keys;
}

function getNumericErrorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const record = err as Record<string, unknown>;
  const raw = record.status ?? record.statusCode ?? record.code;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && /^\d{3}$/.test(raw)) return Number(raw);
  return undefined;
}

export function isQuotaOrRateLimitError(err: unknown): boolean {
  if (getNumericErrorStatus(err) === 429) return true;
  const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('exceeded your current quota') ||
    msg.includes('limit exceeded')
  );
}

export function isInvalidKeyError(err: unknown): boolean {
  const status = getNumericErrorStatus(err);
  if (status === 401 || status === 403) return true;
  const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
  return (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('api key expired') ||
    msg.includes('api_key') ||
    msg.includes('permission_denied') ||
    msg.includes('unauthenticated') ||
    msg.includes('401') ||
    msg.includes('403')
  );
}

export function isTransientError(err: unknown): boolean {
  const status = getNumericErrorStatus(err);
  if (status === 500 || status === 502 || status === 503 || status === 504) return true;
  const msg = err instanceof Error ? err.message : String(err || '');
  const lower = msg.toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('UNAVAILABLE') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('temporarily') ||
    lower.includes('timeout') ||
    lower.includes('econnreset') ||
    lower.includes('fetch failed')
  );
}

export function getActiveKeyIndex(allKeys: string[] = getConfiguredGeminiApiKeys()): number {
  if (allKeys.length === 0) return 0;
  return ((activeKeyIndex % allKeys.length) + allKeys.length) % allKeys.length;
}

export function advanceKeyPointer(failedKey?: string, allKeys: string[] = getConfiguredGeminiApiKeys()): number {
  if (allKeys.length <= 1) {
    activeKeyIndex = 0;
    return 0;
  }
  const idx = failedKey ? allKeys.indexOf(failedKey) : -1;
  if (idx >= 0) {
    activeKeyIndex = (idx + 1) % allKeys.length;
  } else {
    activeKeyIndex = (activeKeyIndex + 1) % allKeys.length;
  }
  return activeKeyIndex;
}

export function markKeyCooldown(
  key: string,
  ttlMs: number,
  reason: KeyCooldownEntry['reason'],
  allKeys: string[] = getConfiguredGeminiApiKeys()
): number {
  const effectiveTtl = allKeys.length > 1 ? ttlMs : Math.min(ttlMs, 8000);
  keyCooldownMap.set(key, {
    untilMs: Date.now() + effectiveTtl,
    reason,
  });
  return advanceKeyPointer(key, allKeys);
}

/**
 * Returns candidate API keys ordered from the current active index:
 * healthy keys first, followed by cooled-down keys sorted by earliest expiry.
 */
export function getOrderedCandidateKeys(
  env: Record<string, string | undefined> = process.env
): string[] {
  const allKeys = getConfiguredGeminiApiKeys(env);
  if (allKeys.length === 0) return [];

  const now = Date.now();
  for (const [key, entry] of keyCooldownMap.entries()) {
    if (entry.untilMs <= now) {
      keyCooldownMap.delete(key);
    }
  }

  const startIdx = getActiveKeyIndex(allKeys);
  const rotated = [...allKeys.slice(startIdx), ...allKeys.slice(0, startIdx)];

  const healthy: string[] = [];
  const cooledDown: Array<{ key: string; untilMs: number }> = [];

  for (const key of rotated) {
    const cooldown = keyCooldownMap.get(key);
    if (!cooldown || cooldown.untilMs <= now) {
      healthy.push(key);
    } else {
      cooledDown.push({ key, untilMs: cooldown.untilMs });
    }
  }

  cooledDown.sort((a, b) => a.untilMs - b.untilMs);
  return [...healthy, ...cooledDown.map((item) => item.key)];
}

export function recordKeyFailureAndShouldRotate(
  err: unknown,
  key: string,
  allKeys: string[] = getConfiguredGeminiApiKeys(),
  options?: Pick<ExecuteWithFailoverOptions, 'quotaCooldownMs' | 'invalidKeyCooldownMs' | 'rotateOnTransient'>
): boolean {
  const quotaMs = options?.quotaCooldownMs ?? DEFAULT_QUOTA_COOLDOWN_MS;
  const invalidMs = options?.invalidKeyCooldownMs ?? DEFAULT_INVALID_KEY_COOLDOWN_MS;
  const rotateOnTransient = options?.rotateOnTransient ?? true;

  if (isQuotaOrRateLimitError(err)) {
    markKeyCooldown(key, quotaMs, 'rate_limit', allKeys);
    return true;
  }
  if (isInvalidKeyError(err)) {
    markKeyCooldown(key, invalidMs, 'invalid_key', allKeys);
    return true;
  }
  if (rotateOnTransient && isTransientError(err)) {
    advanceKeyPointer(key, allKeys);
    return true;
  }
  return false;
}

export function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function getGeminiKeyPoolInfo(
  env: Record<string, string | undefined> = process.env
): GeminiKeyPoolInfo {
  const allKeys = getConfiguredGeminiApiKeys(env);
  const now = Date.now();
  let available = 0;

  for (const key of allKeys) {
    const cd = keyCooldownMap.get(key);
    if (!cd || cd.untilMs <= now) {
      available += 1;
    }
  }

  return {
    configuredKeyCount: allKeys.length,
    availableKeyCount: available,
    activeKeyIndex: getActiveKeyIndex(allKeys),
  };
}

export function getGeminiClient(): GoogleGenAI | null {
  const candidates = getOrderedCandidateKeys();
  if (candidates.length === 0) {
    return null;
  }
  return createGeminiClient(candidates[0]);
}

export function resetGeminiKeyPoolState(): void {
  keyCooldownMap.clear();
  activeKeyIndex = 0;
}

/**
 * Executes an async Gemini operation across the configured key pool.
 * Maintains the active key index across calls and automatically switches to the
 * next available key on 429 quota/rate-limit errors, invalid-key errors (401/403),
 * or transient backend errors (500/502/503).
 */
export async function executeWithGeminiKeyFailover<T>(
  operation: (ctx: GeminiFailoverContext) => Promise<T>,
  options?: ExecuteWithFailoverOptions
): Promise<T> {
  const allKeys = getConfiguredGeminiApiKeys();
  const candidates = getOrderedCandidateKeys();

  if (candidates.length === 0) {
    throw new NoGeminiApiKeysError();
  }

  let lastError: unknown = null;

  for (let i = 0; i < candidates.length; i++) {
    if (options?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const apiKey = candidates[i];
    const poolIdx = allKeys.indexOf(apiKey);
    const ai = createGeminiClient(apiKey);

    try {
      const result = await operation({
        apiKey,
        ai,
        attemptIndex: i,
        keyPoolIndex: poolIdx >= 0 ? poolIdx : i,
        totalKeys: candidates.length,
      });

      if (poolIdx >= 0) {
        activeKeyIndex = poolIdx;
      }
      return result;
    } catch (err: unknown) {
      lastError = err;
      const reason: 'rate_limit' | 'invalid_key' | 'transient' | null = isQuotaOrRateLimitError(err)
        ? 'rate_limit'
        : isInvalidKeyError(err)
        ? 'invalid_key'
        : isTransientError(err)
        ? 'transient'
        : null;

      const shouldRotate = recordKeyFailureAndShouldRotate(err, apiKey, allKeys, options);
      if (!shouldRotate || i === candidates.length - 1) {
        throw err;
      }

      if (reason && options?.onKeyFailover) {
        options.onKeyFailover({
          failedIndex: poolIdx >= 0 ? poolIdx : i,
          nextIndex: getActiveKeyIndex(allKeys),
          totalKeys: candidates.length,
          reason,
          error: err,
        });
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All configured Gemini API keys failed.');
}
