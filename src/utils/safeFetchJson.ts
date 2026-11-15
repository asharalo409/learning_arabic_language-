export interface SafeJsonResult<T> {
  data: T | null;
  rawText: string;
  parseError: boolean;
}

export async function safeParseResponseJson<T = Record<string, unknown>>(
  res: Response
): Promise<SafeJsonResult<T>> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    return { data: null, rawText: '', parseError: true };
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return { data: null, rawText: '', parseError: true };
  }

  try {
    const parsed = JSON.parse(trimmed) as T;
    return { data: parsed, rawText: trimmed, parseError: false };
  } catch {
    return { data: null, rawText: trimmed, parseError: true };
  }
}

export function formatHttpFallbackError(
  status: number,
  rawText: string,
  defaultMessage: string
): string {
  if (status === 413) {
    return 'আপলোড করা অংশের সাইজ সার্ভারের সীমার চেয়ে বড় (413)। অনুগ্রহ করে আরও ছোট PDF বা ছবি দিন।';
  }
  if (status === 504 || status === 502) {
    return `সার্ভার সময়সীমা পূর্ণ হয়েছে (${status})। অনুগ্রহ করে ছোট অংশে ভাগ করে আবার চেষ্টা করুন।`;
  }
  if (status === 404) {
    return 'API এন্ডপয়েন্ট পাওয়া যায়নি (404)। অনুগ্রহ করে সার্ভার বা ডিপ্লয়মেন্ট যাচাই করুন।';
  }
  const cleanSnippet = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanSnippet && cleanSnippet.length < 180) {
    return `${defaultMessage} (HTTP ${status}: ${cleanSnippet})`;
  }
  return status >= 400 ? `${defaultMessage} (HTTP ${status})` : defaultMessage;
}
