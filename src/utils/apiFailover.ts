const ACTIVE_KEY_INDEX_STORAGE_KEY = 'aaa_gemini_active_key_index_v1';
const DEFAULT_COOLDOWN_MS = 90_000;

let cachedApiKeys: string[] | null = null;
let fallbackActiveIndex = 0;
const keyCooldownUntil = new Map<string, number>();

function splitKeyString(raw: unknown): string[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(/^['"]|['"]$/g, ''))
    .filter((token) => token.length > 0 && token !== 'MY_GEMINI_API_KEY');
}

function readCombinedEnv(): Record<string, unknown> {
  const combined: Record<string, unknown> = {};

  if (typeof process !== 'undefined' && process && typeof process.env === 'object' && process.env) {
    Object.assign(combined, process.env);
  }

  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> })?.env;
    if (metaEnv && typeof metaEnv === 'object') {
      Object.assign(combined, metaEnv);
    }
  } catch {
    // ignore if import.meta.env is unavailable
  }

  return combined;
}

/**
 * Collects and caches all Gemini API keys from `GEMINI_API_KEYS`, `GEMINI_API_KEY`,
 * and any env var starting with `GEMINI_API_KEY_` (or `VITE_GEMINI_API_KEY_` / `VITE_GEMINI_API_KEYS`).
 */
export function getGeminiApiKeys(forceRefresh = false): string[] {
  if (cachedApiKeys && !forceRefresh) {
    return cachedApiKeys;
  }

  const env = readCombinedEnv();
  const keys: string[] = [];
  const seen = new Set<string>();

  const pushTokens = (raw: unknown) => {
    for (const token of splitKeyString(raw)) {
      if (!seen.has(token)) {
        seen.add(token);
        keys.push(token);
      }
    }
  };

  // 1. Comma/newline/semicolon-separated pool variables
  pushTokens(env.GEMINI_API_KEYS);
  pushTokens(env.VITE_GEMINI_API_KEYS);

  // 2. Primary single or comma-separated keys
  pushTokens(env.GEMINI_API_KEY);
  pushTokens(env.VITE_GEMINI_API_KEY);

  // 3. Dynamically detect all variables starting with GEMINI_API_KEY_ (or VITE_GEMINI_API_KEY_)
  const dynamicKeys = Object.keys(env)
    .filter(
      (name) =>
        (/^(?:VITE_)?GEMINI_API_KEY_[A-Z0-9_]+$/i.test(name) ||
          name.startsWith('GEMINI_API_KEY_')) &&
        name !== 'GEMINI_API_KEYS' &&
        name !== 'VITE_GEMINI_API_KEYS'
    )
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const envName of dynamicKeys) {
    pushTokens(env[envName]);
  }

  cachedApiKeys = keys;
  return cachedApiKeys;
}

function readPersistentIndex(totalKeys: number): number {
  if (totalKeys <= 0) return 0;

  let rawIndex = fallbackActiveIndex;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(ACTIVE_KEY_INDEX_STORAGE_KEY);
      if (stored !== null) {
        const parsed = Number.parseInt(stored, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          rawIndex = parsed;
        }
      }
    }
  } catch {
    // fallback to in-memory index if localStorage is blocked or unavailable
  }

  return ((rawIndex % totalKeys) + totalKeys) % totalKeys;
}

function writePersistentIndex(index: number, totalKeys: number): number {
  const normalized = totalKeys > 0 ? ((index % totalKeys) + totalKeys) % totalKeys : 0;
  fallbackActiveIndex = normalized;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ACTIVE_KEY_INDEX_STORAGE_KEY, String(normalized));
    }
  } catch {
    // ignore storage errors in non-browser/private contexts
  }

  return normalized;
}

/**
 * Returns the currently active Gemini API key using the persistent index in `localStorage`,
 * skipping keys in temporary 429 cooldown whenever healthy keys are available.
 */
export function getGeminiApiKey(): string | null {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const now = Date.now();
  for (const [key, until] of keyCooldownUntil.entries()) {
    if (until <= now) {
      keyCooldownUntil.delete(key);
    }
  }

  const startIdx = readPersistentIndex(keys.length);
  for (let offset = 0; offset < keys.length; offset++) {
    const idx = (startIdx + offset) % keys.length;
    const candidate = keys[idx];
    const cooldown = keyCooldownUntil.get(candidate);
    if (!cooldown || cooldown <= now) {
      if (offset > 0) {
        writePersistentIndex(idx, keys.length);
      }
      return candidate;
    }
  }

  // If every key is currently cooled down, fall back to the key at the current round-robin index
  return keys[startIdx];
}

/**
 * Rotates to the next available Gemini API key in round-robin order after a 429 quota error,
 * updating the persistent index in `localStorage` so subsequent requests start with the next key.
 */
export function rotateGeminiApiKeyOn429(
  failedKey?: string | null,
  cooldownMs = DEFAULT_COOLDOWN_MS
): string | null {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const effectiveTtl = keys.length > 1 ? cooldownMs : Math.min(cooldownMs, 8_000);
  const currentIdx = readPersistentIndex(keys.length);
  const failedIdx = failedKey ? keys.indexOf(failedKey) : currentIdx;
  const resolvedFailedKey = failedKey || keys[currentIdx];

  if (resolvedFailedKey) {
    keyCooldownUntil.set(resolvedFailedKey, Date.now() + effectiveTtl);
  }

  const baseIdx = failedIdx >= 0 ? failedIdx : currentIdx;
  const nextIdx = (baseIdx + 1) % keys.length;
  writePersistentIndex(nextIdx, keys.length);

  return getGeminiApiKey();
}

export function isQuota429Error(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const rec = err as Record<string, unknown>;
    const code = rec.status ?? rec.statusCode ?? rec.code;
    if (code === 429 || code === '429') return true;
  }
  const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  );
}

/**
 * Executes an async Gemini API request with automatic round-robin failover across all
 * discovered keys whenever a 429 quota error is thrown.
 */
export async function runWithApiFailover<T>(
  requestFn: (apiKey: string) => Promise<T>
): Promise<T> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error('No Gemini API keys found in GEMINI_API_KEYS or GEMINI_API_KEY_* environment variables.');
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) break;

    try {
      return await requestFn(apiKey);
    } catch (err: unknown) {
      lastError = err;
      if (!isQuota429Error(err) || attempt === keys.length - 1) {
        throw err;
      }
      rotateGeminiApiKeyOn429(apiKey);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All Gemini API keys hit quota limits.');
}

export function getApiFailoverState(): {
  totalKeys: number;
  activeIndex: number;
} {
  const keys = getGeminiApiKeys();
  return {
    totalKeys: keys.length,
    activeIndex: readPersistentIndex(keys.length),
  };
}

export function resetApiFailoverCache(): void {
  cachedApiKeys = null;
  fallbackActiveIndex = 0;
  keyCooldownUntil.clear();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ACTIVE_KEY_INDEX_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}
