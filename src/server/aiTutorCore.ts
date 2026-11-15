import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export interface AiAttachmentInput {
  name?: string;
  mimeType: string;
  base64Data: string;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type VoiceEmotionMode = 'formal' | 'friendly' | 'encouraging';

export type TutorMode =
  | 'chat'
  | 'live-voice'
  | 'conversation'
  | 'translate-ar-bn'
  | 'translate-bn-ar'
  | 'grammar'
  | 'correct-writing'
  | 'quiz'
  | 'speaking-feedback'
  | 'generate-lesson'
  | 'document-ocr-grammar';

export interface DocumentOcrWordBreakdown {
  arabic: string;
  pronunciationBn: string;
  posBn: string;
  rootOrFormBn: string;
  irabBn: string;
  meaningBn: string;
  noteBn: string;
}

export interface DocumentOcrSentenceItem {
  arabic: string;
  pronunciationBn: string;
  translationBn: string;
}

export interface DocumentOcrAnalysisResult {
  extractedArabic: string;
  fullTranslationBn: string;
  summaryBn: string;
  sentences: DocumentOcrSentenceItem[];
  words: DocumentOcrWordBreakdown[];
}

const DOCUMENT_OCR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    extractedArabic: {
      type: Type.STRING,
      description: 'Complete OCR transcription of all Arabic text in the image or PDF with full Harakat (Tashkeel).',
    },
    fullTranslationBn: {
      type: Type.STRING,
      description: 'Natural, accurate complete Bengali translation of the extracted Arabic passage.',
    },
    summaryBn: {
      type: Type.STRING,
      description: 'Concise Bengali summary and main grammatical takeaways of the document.',
    },
    sentences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          arabic: { type: Type.STRING },
          pronunciationBn: { type: Type.STRING },
          translationBn: { type: Type.STRING },
        },
        required: ['arabic', 'pronunciationBn', 'translationBn'],
      },
    },
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          arabic: { type: Type.STRING, description: 'Word with full Harakat.' },
          pronunciationBn: { type: Type.STRING, description: 'Bengali phonetic pronunciation.' },
          posBn: { type: Type.STRING, description: 'Part of speech in Bengali/Arabic (ইসম/ফেল/হরফ + subtype).' },
          rootOrFormBn: { type: Type.STRING, description: 'Root letters (মাদ্দাহ), Bab, or Wazn/Sighah.' },
          irabBn: { type: Type.STRING, description: 'Syntactic role & I’rab state in Bengali (মুবতাদা/খবর/ফায়েল/মাজরূর etc.).' },
          meaningBn: { type: Type.STRING, description: 'Direct Bengali meaning.' },
          noteBn: { type: Type.STRING, description: 'Concise Nahw/Sarf rule note in Bengali.' },
        },
        required: ['arabic', 'pronunciationBn', 'posBn', 'rootOrFormBn', 'irabBn', 'meaningBn', 'noteBn'],
      },
    },
  },
  required: ['extractedArabic', 'fullTranslationBn', 'summaryBn', 'sentences', 'words'],
};

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

interface KeyCooldownEntry {
  untilMs: number;
  reason: string;
}

const keyCooldownMap = new Map<string, KeyCooldownEntry>();
let activeKeyPointer = 0;

function parseKeyTokens(rawValue: string | undefined): string[] {
  if (!rawValue || typeof rawValue !== 'string') return [];
  return rawValue
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(/^['"]|['"]$/g, ''))
    .filter((token) => token.length > 0 && token !== 'MY_GEMINI_API_KEY');
}

export function getConfiguredGeminiApiKeys(): string[] {
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

  // 1. Primary comma/newline-separated multi-key variable (unlimited keys)
  pushUnique(process.env.GEMINI_API_KEYS);

  // 2. Standard single or comma-separated GEMINI_API_KEY
  pushUnique(process.env.GEMINI_API_KEY);

  // 3. Numbered / named env vars: GEMINI_API_KEY_1, GEMINI_API_KEY_2, ..., GEMINI_API_KEY_100, GEMINI_API_KEY_BACKUP, etc.
  const numberedOrNamedEnvNames = Object.keys(process.env)
    .filter((name) => /^GEMINI_API_KEY_[A-Z0-9_]+$/i.test(name) && name !== 'GEMINI_API_KEYS')
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const envName of numberedOrNamedEnvNames) {
    pushUnique(process.env[envName]);
  }

  return keys;
}

function getOrderedCandidateKeys(): string[] {
  const allKeys = getConfiguredGeminiApiKeys();
  if (allKeys.length === 0) return [];

  const now = Date.now();
  // Prune expired cooldowns
  for (const [key, entry] of keyCooldownMap.entries()) {
    if (entry.untilMs <= now) {
      keyCooldownMap.delete(key);
    }
  }

  const startIdx = ((activeKeyPointer % allKeys.length) + allKeys.length) % allKeys.length;
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

function advanceKeyPointer(failedKey: string, allKeys: string[]) {
  if (allKeys.length <= 1) return;
  const idx = allKeys.indexOf(failedKey);
  if (idx >= 0) {
    activeKeyPointer = (idx + 1) % allKeys.length;
  } else {
    activeKeyPointer = (activeKeyPointer + 1) % allKeys.length;
  }
}

function markKeyCooldown(key: string, ttlMs: number, reason: string, allKeys: string[]) {
  const effectiveTtl = allKeys.length > 1 ? ttlMs : Math.min(ttlMs, 8000);
  keyCooldownMap.set(key, {
    untilMs: Date.now() + effectiveTtl,
    reason,
  });
  advanceKeyPointer(key, allKeys);
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

export function getGeminiKeyPoolInfo(): { configuredKeyCount: number; availableKeyCount: number } {
  const allKeys = getConfiguredGeminiApiKeys();
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
  };
}

export function getGeminiClient(): GoogleGenAI | null {
  const candidates = getOrderedCandidateKeys();
  if (candidates.length === 0) {
    return null;
  }
  return createGeminiClient(candidates[0]);
}

const BASE_TUTOR_INSTRUCTION = `You are Ustadha/Ustadh AI, an expert bilingual Arabic & Bengali language teacher at AI Arabic Academy teaching both Modern Standard Arabic (MSA / فصحى), classical Nahw & Sarf (Mabadiul Arabiyyah, Nahw Mir, Sharh Mi'at Amil, Hidayatun Nahw, Al-Kafiyah, Mizanus Sarf, Munsha'ib, Safwatul Masadir), and Quranic Arabic.
Core teaching protocol:
1. Understand the student's language (Bengali, Arabic, or English). In normal/voice tutoring, ALWAYS combine clear Arabic with complete Harakat (التشكيل الكامل) AND clear Bengali explanation/meaning so both Arabic and Bengali voices read naturally together.
2. ERROR CORRECTION RULE: Whenever the student writes or speaks Arabic (even partially or with mistakes), ALWAYS check their sentence first! If there is any grammatical, harakat, vocabulary, or pronunciation error, gently point it out in Bengali and immediately give the corrected Arabic sentence with complete Harakat.
3. IMAGE & PDF DOCUMENT TEACHING RULE: When the student uploads an image (book page, handwritten Arabic note, worksheet, screenshot) or a PDF document, carefully inspect every visible line/page:
   - Read and transcribe the key Arabic text with complete Harakat
   - Provide word-by-word or line-by-line Bengali translation and pronunciation
   - Explain the underlying Nahw (নাহু) & Sarf (ছরফ) rules or exercises clearly in Bengali so the student understands the whole lesson like a private tutor sitting beside them.
4. Provide Arabic examples with COMPLETE Harakat (ফাতহা, কাসরা, দম্মা, সুকূন, শাদ্দাহ, তানভীন).
5. Give Bengali pronunciation (বাংলা উচ্চারণ) and Bengali meaning (বাংলা অর্থ) cleanly without noisy markdown asterisks (*) or hashtags (#).
6. Explain Nahw (نحو) and Sarf (صرف) rules concisely when helpful.
7. CRITICAL INTEGRITY RULE: NEVER fabricate, guess, or alter Quranic verses or Hadith. Only cite well-known authentic verses with exact Surah name and Ayah number when completely certain; otherwise clearly state if you are giving an educational example rather than scripture.`;

function buildModePrompt(mode: TutorMode, level: string, context?: string): string {
  const levelNote = `Student Level: ${level}. Tailor vocabulary and grammar depth to this level.`;
  switch (mode) {
    case 'document-ocr-grammar':
      return `${levelNote}
${context ? `Focus Instruction: ${context}` : ''}
Task: Perform high-accuracy Arabic OCR on the uploaded image(s) or PDF document, restore complete Harakat (التشكيل الكامل), translate every sentence into natural Bengali, and produce a comprehensive word-by-word Nahw & Sarf grammatical breakdown (up to 35 key words covering the passage). Return ONLY valid JSON adhering strictly to the schema.`;
    case 'live-voice':
    case 'conversation':
      return `${levelNote}
${context ? `Context: ${context}` : ''}
Task: Conduct a natural, warm, continuous spoken Arabic + Bengali tutoring conversation (like Gemini Live voice dialogue).
CRITICAL FORMAT FOR BILINGUAL VOICE:
- Do NOT use markdown symbols like **, ##, bullet stars, or backticks because your text is read aloud sequentially by an Arabic + Bengali speech engine.
- Step 1 (Correction if needed): If the student made any Arabic mistake, say the corrected Arabic sentence clearly with full Harakat, then explain the correction briefly in 1 Bengali sentence. If they spoke Bengali wanting to learn how to say it in Arabic, teach the natural Arabic expression.
- Step 2 (Natural Reply): Respond warmly in 1–2 short, natural Arabic sentences (full Harakat) followed immediately by the Bengali meaning.
- Step 3 (Keep Conversation Flowing): End with 1 short conversational question in Arabic (full Harakat) plus its short Bengali translation so the student can reply immediately by voice.`;
    case 'translate-ar-bn':
      return `${levelNote}
Task: Translate the provided Arabic text (or uploaded image/PDF text) into natural Bengali and English.
Format cleanly without cluttered symbols:
- Original Arabic with complete Harakat
- Word-by-word breakdown (Arabic -> Bengali pronunciation -> Bengali meaning)
- Complete Bengali translation & English translation
- Brief Nahw/Sarf note on key words.`;
    case 'translate-bn-ar':
      return `${levelNote}
Task: Translate the provided Bengali/English text into accurate Modern Standard Arabic.
Format clearly with:
- Arabic translation with complete Harakat
- Bengali pronunciation
- Explanation of word choices and sentence structure (جملة اسمية / جملة فعلية)
- Alternative polite phrasing.`;
    case 'grammar':
      return `${levelNote}
Task: Explain the requested Arabic Grammar (Nahw/Sarf) topic step-by-step in Bengali.
Include:
- Core rule simply (referencing Mabadiul Arabiyyah, Hidayatun Nahw, Kafiyah, Mizanus Sarf, or Safwatul Masadir where relevant)
- 3–4 Arabic examples with complete Harakat, Bengali pronunciation, and Bengali meaning
- Common mistakes to avoid.`;
    case 'correct-writing':
      return `${levelNote}
Task: Correct the student's Arabic writing, photo/worksheet, or sentence.
Format clearly with:
- Corrected Arabic sentence with complete Harakat
- Bengali pronunciation of the corrected sentence
- What was wrong and why (Nahw/Sarf/Spelling explanation in Bengali)
- Encouragement and 1 suggested variation.`;
    case 'quiz':
      return `${levelNote}
Task: Create an interactive 3-question mini-quiz on the requested topic or uploaded study page.
Provide clear numbered questions with Arabic Harakat, options (A, B, C, D), and place the Answer Key & Bengali explanations cleanly at the bottom.`;
    case 'speaking-feedback':
      return `${levelNote}
Task: Evaluate the student's spoken Arabic transcript against the target phrase (provided in context).
${context ? `Context/Target: ${context}` : ''}
Give kind, practical pronunciation & grammar feedback in Bengali, show the corrected Arabic with full Harakat, Bengali pronunciation, and point out any missing or misheard words.`;
    case 'generate-lesson':
      return `${levelNote}
Task: Teach the requested curriculum lesson topic in depth.
${context ? `Lesson Context: ${context}` : ''}
Provide:
1. Learning Objectives (Bengali & English)
2. 6 Key Vocabulary words (Arabic with full Harakat, Bengali pronunciation, Bengali & English meaning)
3. Core Grammar point (Nahw/Sarf) with examples
4. A 6-line practical dialogue with Bengali translation
5. 2 quick practice exercises.`;
    case 'chat':
    default:
      return `${levelNote}
${context ? `Additional Context: ${context}` : ''}
Answer warmly, systematically, and cleanly. Whenever teaching, explaining uploaded pages/PDFs, or correcting Arabic, ALWAYS include BOTH Arabic (complete Harakat) AND clear Bengali meaning/explanation.`;
  }
}

function buildEmotionInstruction(emotion: VoiceEmotionMode): string {
  switch (emotion) {
    case 'friendly':
      return 'Tone & Style: Warm, friendly, conversational partner (বন্ধুত্বপূর্ণ সংলাপ). Keep explanations approachable, lively, and natural like talking with a close study companion.';
    case 'encouraging':
      return 'Tone & Style: Gentle, patient, deeply encouraging mentor (কোমল ও উৎসাহদায়ক). Celebrate small efforts warmly, break points into tiny easy steps, and motivate the learner kindly.';
    case 'formal':
    default:
      return 'Tone & Style: Formal, scholarly classical Ustadh/Ustadha (প্রামাণিক শিক্ষক). Maintain precise, dignified, clear classical terminology and structured academic rigor.';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaOrRateLimitError(err: unknown): boolean {
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

function isInvalidKeyError(err: unknown): boolean {
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

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
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

function recordKeyFailureAndShouldRotate(err: unknown, key: string, allKeys: string[]): boolean {
  if (isQuotaOrRateLimitError(err)) {
    markKeyCooldown(key, 90_000, 'rate_limit', allKeys);
    return true;
  }
  if (isInvalidKeyError(err)) {
    markKeyCooldown(key, 15 * 60_000, 'invalid_key', allKeys);
    return true;
  }
  if (isTransientError(err)) {
    advanceKeyPointer(key, allKeys);
    return true;
  }
  return false;
}

export async function runAiTeacherRequest(payload: {
  message?: string;
  history?: ChatHistoryMessage[];
  attachments?: AiAttachmentInput[];
  mode?: TutorMode;
  level?: string;
  interfaceLang?: 'bn' | 'en' | 'ar';
  voiceGender?: 'male' | 'female';
  voiceEmotion?: VoiceEmotionMode;
  context?: string;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const {
    message = '',
    history = [],
    attachments = [],
    mode = 'chat',
    level = 'Beginner (Level 1)',
    interfaceLang = 'bn',
    voiceGender = 'male',
    voiceEmotion = 'formal',
    context,
  } = payload;

  const validAttachments = Array.isArray(attachments)
    ? attachments
        .slice(0, 3)
        .filter((att) => att && typeof att.mimeType === 'string' && typeof att.base64Data === 'string')
        .map((att) => {
          const normalizedMime = att.mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : att.mimeType.toLowerCase();
          const cleanBase64 = att.base64Data.replace(/^data:[^;]+;base64,/i, '').trim();
          return {
            name: att.name || 'attachment',
            mimeType: normalizedMime,
            data: cleanBase64,
          };
        })
        .filter((att) => ALLOWED_ATTACHMENT_MIME_TYPES.has(att.mimeType) && att.data.length > 0)
    : [];

  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage && validAttachments.length === 0) {
    return {
      status: 400,
      body: { error: 'অনুগ্রহ করে AI শিক্ষকের জন্য একটি প্রশ্ন লিখুন অথবা ছবি/PDF আপলোড করুন।' },
    };
  }

  const candidateKeys = getOrderedCandidateKeys();
  if (candidateKeys.length === 0) {
    return {
      status: 503,
      body: {
        error:
          'GEMINI_API_KEY বা GEMINI_API_KEYS সেট করা নেই। Vercel-এ Environment Variables বা Google AI Studio Settings > Secrets-এ API Key যুক্ত করুন।',
      },
    };
  }

  const langPreference =
    interfaceLang === 'bn'
      ? 'Primary explanation language is Bengali (বাংলা), paired ALWAYS with full-Harakat Arabic expressions so learners hear and read BOTH Arabic and Bengali seamlessly.'
      : interfaceLang === 'ar'
      ? 'Respond primarily in clear Arabic (العربية مع التشكيل الكامل), while ALSO keeping brief Bengali meanings so Bengali learners clearly understand every correction.'
      : 'Primary explanation language is English, paired with full-Harakat Arabic and Bengali pronunciation/meaning.';

  const genderPersona =
    voiceGender === 'female'
      ? 'Teacher Persona Gender: Female teacher (أُسْتَاذَة / مُعَلِّمَة). When referring to yourself in Arabic, always use feminine grammatical forms (أنا أستاذة / معلمة).'
      : 'Teacher Persona Gender: Male teacher (أُسْتَاذ / مُعَلِّم). When referring to yourself in Arabic, always use masculine grammatical forms (أنا أستاذ / معلم).';

  const emotionInstruction = buildEmotionInstruction(voiceEmotion);

  const effectiveMode: TutorMode =
    mode === 'document-ocr-grammar'
      ? 'document-ocr-grammar'
      : validAttachments.length > 0 && mode === 'live-voice'
      ? 'chat'
      : mode;

  const systemInstruction = `${BASE_TUTOR_INSTRUCTION}\n\n${genderPersona}\n${emotionInstruction}\n${langPreference}\n\n${buildModePrompt(
    effectiveMode,
    level,
    context
  )}`;

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-10)
        .filter((item) => item && typeof item.content === 'string' && item.content.trim())
        .map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        }))
    : [];

  const promptText =
    trimmedMessage ||
    (effectiveMode === 'document-ocr-grammar'
      ? 'সংযুক্ত আরবি ছবি বা PDF থেকে পূর্ণ হারাকাতসহ টেক্সট OCR করুন, সম্পূর্ণ বাংলা অনুবাদ দিন এবং প্রতিটি গুরুত্বপূর্ণ শব্দের নাহু-ছরফ (পদ, মূলধাতু, ই‘রাব ও অর্থ) বিশ্লেষণ করুন।'
      : 'অনুগ্রহ করে সংযুক্ত ছবি বা PDF ফাইলের আরবি পড়া, অনুবাদ ও গ্রামার (নাহু-ছরফ) ধাপে ধাপে সহজ বাংলায় বুঝিয়ে দিন।');

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    ...validAttachments.map((att) => ({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data,
      },
    })),
    { text: promptText },
  ];

  const contents = [
    ...recentHistory,
    {
      role: 'user',
      parts: userParts,
    },
  ];

  const attempts: { model: string; thinkingLevel?: ThinkingLevel; delayMs: number }[] = [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 0 },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, delayMs: 350 },
  ];

  let lastError: unknown = null;

  for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx++) {
    const apiKey = candidateKeys[keyIdx];
    const ai = createGeminiClient(apiKey);
    let rotateToNextKey = false;

    for (const attempt of attempts) {
      if (attempt.delayMs > 0) {
        await sleep(attempt.delayMs);
      }
      try {
        const response = await ai.models.generateContent({
          model: attempt.model,
          contents,
          config: {
            systemInstruction,
            ...(effectiveMode === 'document-ocr-grammar'
              ? {
                  responseMimeType: 'application/json',
                  responseSchema: DOCUMENT_OCR_SCHEMA,
                }
              : {}),
            ...(attempt.thinkingLevel ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } } : {}),
          },
        });
        const reply = response.text?.trim();
        if (reply) {
          if (effectiveMode === 'document-ocr-grammar') {
            try {
              const parsed = JSON.parse(reply) as DocumentOcrAnalysisResult;
              return {
                status: 200,
                body: {
                  reply: parsed.summaryBn || parsed.fullTranslationBn || reply,
                  analysis: parsed,
                  model: attempt.model,
                  mode,
                },
              };
            } catch {
              return {
                status: 200,
                body: {
                  reply,
                  model: attempt.model,
                  mode,
                },
              };
            }
          }

          return {
            status: 200,
            body: {
              reply,
              model: attempt.model,
              mode,
            },
          };
        }
        lastError = new Error('Empty response returned from AI model.');
      } catch (err: unknown) {
        lastError = err;
        console.warn(
          `Gemini attempt failed (key #${keyIdx + 1}/${candidateKeys.length}, ${attempt.model}):`,
          err instanceof Error ? err.message : err
        );

        if (isQuotaOrRateLimitError(err)) {
          markKeyCooldown(apiKey, 90_000, 'rate_limit', candidateKeys);
          rotateToNextKey = true;
          break;
        }
        if (isInvalidKeyError(err)) {
          markKeyCooldown(apiKey, 15 * 60_000, 'invalid_key', candidateKeys);
          rotateToNextKey = true;
          break;
        }
        if (!isTransientError(err)) {
          rotateToNextKey = false;
          break;
        }
      }
    }

    if (!rotateToNextKey && !isTransientError(lastError)) {
      break;
    }
    if (isTransientError(lastError)) {
      advanceKeyPointer(apiKey, candidateKeys);
    }
  }

  const errMsg = lastError instanceof Error ? lastError.message : String(lastError || 'Unexpected error');
  const status = isQuotaOrRateLimitError(lastError)
    ? 429
    : isInvalidKeyError(lastError)
    ? 403
    : isTransientError(lastError)
    ? 503
    : 500;

  return {
    status,
    body: {
      error:
        status === 429
          ? `যুক্ত থাকা ${candidateKeys.length}টি Gemini API Key-এর সাময়িক ব্যবহার সীমা (Rate limit) পূর্ণ হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন অথবা Vercel Environment Variables-এ আরও API Key যুক্ত করুন।`
          : status === 403
          ? 'Gemini API Key যাচাই ব্যর্থ হয়েছে। অনুগ্রহ করে Vercel Environment Variables-এর API Key গুলো সঠিক আছে কিনা পরীক্ষা করুন।'
          : status === 503
          ? 'Gemini সার্ভার এখন অতিরিক্ত ব্যস্ত রয়েছে (সাময়িক 503)। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।'
          : `AI শিক্ষক ত্রুটি: ${errMsg}`,
    },
  };
}

function wrapPcmAsWav(pcmBytes: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.length;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcmBytes]);
}

export async function runGeminiTtsRequest(payload: {
  text?: string;
  voiceGender?: 'male' | 'female';
  langCode?: string;
  style?: string;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const rawText = typeof payload.text === 'string' ? payload.text.trim() : '';
  if (!rawText) {
    return { status: 400, body: { error: 'অডিও তৈরি করার জন্য টেক্সট প্রয়োজন।' } };
  }

  const candidateKeys = getOrderedCandidateKeys();
  if (candidateKeys.length === 0) {
    return { status: 503, body: { error: 'GEMINI_API_KEY বা GEMINI_API_KEYS কনফিগার করা নেই।' } };
  }

  const voiceName = payload.voiceGender === 'female' ? 'Kore' : 'Charon';
  const clippedText = rawText.slice(0, 1400);
  let lastError: unknown = null;

  for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx++) {
    const apiKey = candidateKeys[keyIdx];
    const ai = createGeminiClient(apiKey);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: clippedText,
                speechMetadata: {
                  style:
                    payload.style ||
                    (payload.langCode?.startsWith('ar')
                      ? 'Clear, articulate, natural Modern Standard Arabic teacher voice with crisp vowel pronunciation'
                      : 'Warm, clear, natural Bengali and Arabic teacher voice'),
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      const base64Data = audioPart?.inlineData?.data;
      const rawMime = (audioPart?.inlineData?.mimeType || 'audio/wav').toLowerCase();

      if (!base64Data) {
        lastError = new Error('TTS মডেল থেকে কোনো অডিও পাওয়া যায়নি।');
        continue;
      }

      const buf = Buffer.from(base64Data, 'base64');
      const isRiffWav = buf.length >= 4 && buf.subarray(0, 4).toString('ascii') === 'RIFF';

      if (isRiffWav) {
        return {
          status: 200,
          body: {
            audioBase64: base64Data,
            mimeType: 'audio/wav',
            voiceName,
          },
        };
      }

      if (rawMime.includes('l16') || rawMime.includes('pcm')) {
        const wavBuf = wrapPcmAsWav(buf, 24000, 1, 16);
        return {
          status: 200,
          body: {
            audioBase64: wavBuf.toString('base64'),
            mimeType: 'audio/wav',
            voiceName,
          },
        };
      }

      return {
        status: 200,
        body: {
          audioBase64: base64Data,
          mimeType: rawMime || 'audio/wav',
          voiceName,
        },
      };
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : 'TTS generation failed';
      console.warn(`Gemini TTS error (key #${keyIdx + 1}/${candidateKeys.length}):`, msg);
      const shouldRotate = recordKeyFailureAndShouldRotate(err, apiKey, candidateKeys);
      if (!shouldRotate) {
        break;
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : 'TTS generation failed';
  const status = isQuotaOrRateLimitError(lastError)
    ? 429
    : isInvalidKeyError(lastError)
    ? 403
    : isTransientError(lastError)
    ? 503
    : 500;
  return {
    status,
    body: { error: msg },
  };
}

export type PdfFormatterCategory =
  | 'ar-bn-harakat'
  | 'ar-only-harakat'
  | 'bn-only'
  | 'kitabi-bilingual';

const PDF_FORMAT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    titleAr: { type: Type.STRING, description: 'Document main title in Arabic with complete Harakat.' },
    titleBn: { type: Type.STRING, description: 'Document main title in Bengali (empty string if ar-only-harakat).' },
    subtitleBn: { type: Type.STRING, description: 'Short subtitle, exam years, or concise header description.' },
    category: {
      type: Type.STRING,
      enum: ['ar-bn-harakat', 'ar-only-harakat', 'bn-only', 'kitabi-bilingual'],
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          headingAr: { type: Type.STRING, description: 'Arabic section heading with full Harakat (e.g. أَوَّلًا: ..., ثَانِيًا: ...) or empty for bn-only.' },
          headingBn: { type: Type.STRING, description: 'Bengali section heading (e.g. প্রথমত: ...) or empty for ar-only-harakat.' },
          introBn: { type: Type.STRING, description: 'Concise Bengali summary/synthesis line or question summary note placed at the section banner or bottom summary.' },
          layout: { type: Type.STRING, enum: ['cards', 'grid-3', 'table', 'prose', 'flow', 'quotes'] },
          accentTheme: { type: Type.STRING, enum: ['emerald', 'blue', 'violet', 'rose', 'slate', 'amber'] },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                kind: { type: Type.STRING, enum: ['card', 'table-row', 'prose', 'step', 'quote'] },
                badgeNumber: { type: Type.STRING, description: 'Number, year pill like ٢٠٢٥ / ২০২৫, or short badge label.' },
                labelAr: { type: Type.STRING, description: 'Short Arabic sub-heading or table right-column term with full Harakat.' },
                labelBn: { type: Type.STRING, description: 'Short Bengali sub-heading or label.' },
                arabic: { type: Type.STRING, description: 'Arabic content with complete, accurate Harakat (Tashkeel).' },
                bengali: { type: Type.STRING, description: 'Clear, proofread Bengali meaning or explanation.' },
                reference: { type: Type.STRING, description: 'Surah/Ayah, Hadith collection, or book citation if present in source.' },
                highlightColor: { type: Type.STRING, enum: ['emerald', 'sky', 'amber', 'violet', 'rose', 'slate'] },
              },
              required: ['kind', 'arabic', 'bengali'],
            },
          },
        },
        required: ['id', 'layout', 'items'],
      },
    },
    footerNote: { type: Type.STRING },
  },
  required: ['titleAr', 'titleBn', 'subtitleBn', 'category', 'sections'],
};

function buildPdfCategoryPrompt(category: PdfFormatterCategory, userInstructions?: string): string {
  const extra = userInstructions?.trim() ? `\nAdditional formatting instruction from user: ${userInstructions.trim()}` : '';
  switch (category) {
    case 'ar-only-harakat':
      return `Target Output Category: ar-only-harakat (Pure Arabic Kitabi Document with Complete Harakat / التشْكِيلُ الكَامِلُ).
Rules:
- Preserve or accurately translate/expand the input into eloquent Classical / Modern Standard Arabic with COMPLETE Harakat (فتحة، كسرة، ضمة، سكون، شدة، تنوين) on EVERY Arabic word.
- Silently fix any missing Harakat, Arabic spelling typos, or grammatical slips present in the raw input.
- Vary section layouts cleanly ('table' for لُغَةً/اصْطِلَاحًا comparisons, 'grid-3' for grouped classifications, 'flow' for sequential stages, 'quotes' for Qur'an/Hadith verses, 'cards' & 'prose' for questions/explanations) and assign tasteful accentTheme values ('emerald', 'blue', 'violet', 'amber').
- Keep "bengali", "titleBn", "headingBn", and "labelBn" fields as empty strings "" unless needed for a short metadata tag, because the user selected Arabic-only output.${extra}`;
    case 'bn-only':
      return `Target Output Category: bn-only (Pure Bengali Academic Study Document).
Rules:
- Convert/translate/organize all content from the text, image, or PDF cleanly into natural, scholarly, error-free Bengali.
- Organize into crisp sections using 'cards', 'grid-3', 'table', 'flow', 'quotes', and 'prose' with varied accentTheme values ('emerald', 'blue', 'violet', 'amber', 'slate').
- Keep "arabic" fields empty strings "" and set Arabic headings empty unless a short foundational term must appear in brackets.${extra}`;
    case 'kitabi-bilingual':
      return `Target Output Category: kitabi-bilingual (Classical Madrasa / University Kitabi A4 Handout).
Rules:
- Design the document to look like a printed classical-modern bilingual study sheet:
  1. Rich top cover title: Arabic titleAr (complete Harakat) + Bengali titleBn + concise subtitleBn (years/topic summary).
  2. Vary section "accentTheme" logically across sections ('emerald' for primary definitions, 'blue' for secondary classifications/questions, 'violet' for comparisons/relations, 'amber' or 'rose' for proofs/adab).
  3. Choose the BEST layout per section:
     - layout="table": for definitions (لُغَةً vs اصْطِلَاحًا), word-type comparisons (الْعُلُومُ / الْقُرْآنُ / عُلُومُ الْقُرْآنِ), or pair lists. Put the right column term in "labelAr" (Arabic) + "labelBn" (Bengali), Arabic explanation in "arabic", and Bengali explanation in "bengali". Put any section-bottom synthesis inside "introBn" if appropriate.
     - layout="grid-3": for groups of 3, 6, or 9 concise points, pillars, scholars, or categories (3 balanced compact cards per row).
     - layout="cards": for 2-column numbered question cards, year-tagged board questions (use badgeNumber like "২০২৫", "২০২৪", "بدون"), or dual principles.
     - layout="flow": for sequential stages, derivation steps, or chronological progressions (renders connected arrow flow boxes).
     - layout="quotes": for Qur'an verses ﴿...﴾ or Hadith proofs with direct Bengali translation and citation in "reference".
     - layout="prose": for continuous paragraphs, definitions, or bulleted exam notes paired right beneath Arabic.
  4. Never fabricate Qur'an verses or Hadith references; only cite references present in the input or completely certain authentic citations.${extra}`;
    case 'ar-bn-harakat':
    default:
      return `Target Output Category: ar-bn-harakat (Arabic with Full Harakat + Clear Proofread Bengali Meaning).
Rules:
- Produce clean structured bilingual A4 sections where EVERY Arabic sentence/line has COMPLETE Harakat (التشكيل الكامل) AND is paired cleanly with accurate, typo-free Bengali meaning.
- Smartly mix "prose", "cards", "grid-3", "table", "flow", and "quotes" layouts with balanced "accentTheme" colors so every A4 page looks dense, structured, and easy to study — never one monotonous wall of text.${extra}`;
  }
}

interface PreparedPdfRequest {
  candidateKeys: string[];
  systemInstruction: string;
  userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
}

function preparePdfFormatRequest(payload: {
  text?: string;
  attachments?: AiAttachmentInput[];
  category?: PdfFormatterCategory;
  userInstructions?: string;
  chunkIndex?: number;
  totalChunks?: number;
}): { error?: { status: number; message: string }; prepared?: PreparedPdfRequest } {
  const rawText = typeof payload.text === 'string' ? payload.text.trim() : '';
  const chunkIndex = typeof payload.chunkIndex === 'number' && payload.chunkIndex > 0 ? payload.chunkIndex : 1;
  const totalChunks = typeof payload.totalChunks === 'number' && payload.totalChunks > 0 ? payload.totalChunks : 1;
  const category: PdfFormatterCategory =
    payload.category === 'ar-only-harakat' ||
    payload.category === 'bn-only' ||
    payload.category === 'kitabi-bilingual'
      ? payload.category
      : 'ar-bn-harakat';

  const validAttachments = Array.isArray(payload.attachments)
    ? payload.attachments
        .slice(0, 5)
        .filter((att) => att && typeof att.mimeType === 'string' && typeof att.base64Data === 'string')
        .map((att) => {
          const normalizedMime = att.mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : att.mimeType.toLowerCase();
          const cleanBase64 = att.base64Data.replace(/^data:[^;]+;base64,/i, '').trim();
          return {
            mimeType: normalizedMime,
            data: cleanBase64,
          };
        })
        .filter((att) => ALLOWED_ATTACHMENT_MIME_TYPES.has(att.mimeType) && att.data.length > 0)
    : [];

  if (!rawText && validAttachments.length === 0) {
    return {
      error: {
        status: 400,
        message: 'PDF তৈরি করতে অনুগ্রহ করে আরবি/বাংলা লেখা লিখুন অথবা ছবি/PDF আপলোড করুন।',
      },
    };
  }

  const candidateKeys = getOrderedCandidateKeys();
  if (candidateKeys.length === 0) {
    return {
      error: {
        status: 503,
        message: 'GEMINI_API_KEY বা GEMINI_API_KEYS সেট করা নেই। অনুগ্রহ করে Vercel Environment Variables-এ API Key যুক্ত করুন।',
      },
    };
  }

  const batchContextNote =
    totalChunks > 1
      ? chunkIndex === 1
        ? `\nBATCH INFO: This is Part 1 of ${totalChunks}. Provide the main document titleAr/titleBn/subtitleBn AND format EVERY single item in this Part 1 completely.`
        : `\nBATCH INFO: This is Part ${chunkIndex} of ${totalChunks} of the SAME document. Continue straight into sections/items seamlessly without repeating cover introductions, and DO NOT skip any paragraph, point, question, or line in this chunk.`
      : '';

  const systemInstruction = `You are a master Arabic & Bengali Islamic/Academic document typesetter, proofreader, and bilingual scholar.
Your job is to transform raw user notes, Bengali or Arabic passages, book photos, screenshots, or PDFs into a richly structured Kitabi A4 document JSON matching the requested output category.
CRITICAL ZERO-OMISSION & PROOFREADING RULES:
- Include 100% of ALL content, questions, year markers, answers, numbered points, paragraphs, verses, hadith, and notes present in the input text/images/PDF pages.
- NEVER summarize, abridge, skip, merge-away, or drop any sentence, point, or page from the input! Every line/section from the source must appear in "sections".
- SILENT PROOFREADING & HARAKAT RESTORATION: Automatically correct any missing/wrong Arabic Harakat, Arabic spelling/grammar typos, and Bengali spelling errors silently while preserving full fidelity to the source meaning.
- Put complete, accurate Arabic Harakat (التشكيل الكامل) on EVERY Arabic word unless the category is "bn-only".
- Preserve scholarly accuracy and never fabricate Quran verses or Hadith.
- Return ONLY valid JSON adhering strictly to the schema.${batchContextNote}
${buildPdfCategoryPrompt(category, payload.userInstructions)}`;

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    ...validAttachments.map((att) => ({
      inlineData: { mimeType: att.mimeType, data: att.data },
    })),
    {
      text:
        rawText ||
        `সংযুক্ত ছবি বা PDF অংশটি (${chunkIndex}/${totalChunks}) শুরু থেকে শেষ পর্যন্ত একটি লাইন বা পয়েন্টও বাদ না দিয়ে সম্পূর্ণভাবে প্রুফরিডিং ও হারাকাতসহ নির্বাচিত ক্যাটাগরিতে রূপান্তর ও ফরম্যাট করুন।`,
    },
  ];

  return {
    prepared: { candidateKeys, systemInstruction, userParts },
  };
}

export async function runFormatPdfRequest(payload: {
  text?: string;
  attachments?: AiAttachmentInput[];
  category?: PdfFormatterCategory;
  userInstructions?: string;
  chunkIndex?: number;
  totalChunks?: number;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const prep = preparePdfFormatRequest(payload);
  if (prep.error || !prep.prepared) {
    return {
      status: prep.error?.status || 400,
      body: { error: prep.error?.message || 'অবৈধ ইনপুট।' },
    };
  }

  const { candidateKeys, systemInstruction, userParts } = prep.prepared;

  const attempts: { model: string; thinkingLevel?: ThinkingLevel; delayMs: number }[] = [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 0 },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, delayMs: 350 },
  ];

  let lastError: unknown = null;

  for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx++) {
    const apiKey = candidateKeys[keyIdx];
    const ai = createGeminiClient(apiKey);
    let rotateToNextKey = false;

    for (const attempt of attempts) {
      if (attempt.delayMs > 0) await sleep(attempt.delayMs);
      try {
        const response = await ai.models.generateContent({
          model: attempt.model,
          contents: [{ role: 'user', parts: userParts }],
          config: {
            systemInstruction,
            maxOutputTokens: 16384,
            responseMimeType: 'application/json',
            responseSchema: PDF_FORMAT_SCHEMA,
            ...(attempt.thinkingLevel ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } } : {}),
          },
        });
        const jsonText = response.text?.trim();
        if (jsonText) {
          const doc = JSON.parse(jsonText) as Record<string, unknown>;
          return {
            status: 200,
            body: {
              document: doc,
              model: attempt.model,
            },
          };
        }
        lastError = new Error('Empty response returned from document formatter.');
      } catch (err: unknown) {
        lastError = err;
        console.warn(
          `PDF format attempt failed (key #${keyIdx + 1}/${candidateKeys.length}, ${attempt.model}):`,
          err instanceof Error ? err.message : err
        );
        if (isQuotaOrRateLimitError(err)) {
          markKeyCooldown(apiKey, 90_000, 'rate_limit', candidateKeys);
          rotateToNextKey = true;
          break;
        }
        if (isInvalidKeyError(err)) {
          markKeyCooldown(apiKey, 15 * 60_000, 'invalid_key', candidateKeys);
          rotateToNextKey = true;
          break;
        }
        if (!isTransientError(err)) {
          rotateToNextKey = false;
          break;
        }
      }
    }

    if (!rotateToNextKey && !isTransientError(lastError)) {
      break;
    }
    if (isTransientError(lastError)) {
      advanceKeyPointer(apiKey, candidateKeys);
    }
  }

  const status = isQuotaOrRateLimitError(lastError)
    ? 429
    : isInvalidKeyError(lastError)
    ? 403
    : isTransientError(lastError)
    ? 503
    : 500;

  return {
    status,
    body: {
      error:
        status === 429
          ? `যুক্ত থাকা ${candidateKeys.length}টি API Key-এর সাময়িক লিমিট পূর্ণ হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।`
          : lastError instanceof Error
          ? lastError.message
          : 'PDF ডকুমেন্ট ফরম্যাট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    },
  };
}

export type PdfStreamEvent =
  | { type: 'progress'; charsReceived: number; model: string }
  | { type: 'result'; document: Record<string, unknown>; model: string }
  | { type: 'error'; status: number; error: string };

export async function streamFormatPdfRequest(
  payload: {
    text?: string;
    attachments?: AiAttachmentInput[];
    category?: PdfFormatterCategory;
    userInstructions?: string;
    chunkIndex?: number;
    totalChunks?: number;
  },
  onEvent: (event: PdfStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const prep = preparePdfFormatRequest(payload);
  if (prep.error || !prep.prepared) {
    onEvent({
      type: 'error',
      status: prep.error?.status || 400,
      error: prep.error?.message || 'অবৈধ ইনপুট।',
    });
    return;
  }

  const { candidateKeys, systemInstruction, userParts } = prep.prepared;

  const attempts: { model: string; thinkingLevel?: ThinkingLevel; delayMs: number }[] = [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 0 },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, delayMs: 350 },
  ];

  let lastError: unknown = null;

  for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx++) {
    if (signal?.aborted) return;
    const apiKey = candidateKeys[keyIdx];
    const ai = createGeminiClient(apiKey);
    let rotateToNextKey = false;

    for (const attempt of attempts) {
      if (signal?.aborted) return;
      if (attempt.delayMs > 0) await sleep(attempt.delayMs);

      try {
        const stream = await ai.models.generateContentStream({
          model: attempt.model,
          contents: [{ role: 'user', parts: userParts }],
          config: {
            systemInstruction,
            maxOutputTokens: 16384,
            responseMimeType: 'application/json',
            responseSchema: PDF_FORMAT_SCHEMA,
            ...(attempt.thinkingLevel ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } } : {}),
          },
        });

        let fullText = '';
        let lastReported = 0;

        for await (const chunk of stream) {
          if (signal?.aborted) return;
          const delta = chunk.text || '';
          if (delta) {
            fullText += delta;
            if (fullText.length - lastReported >= 180) {
              lastReported = fullText.length;
              onEvent({
                type: 'progress',
                charsReceived: fullText.length,
                model: attempt.model,
              });
            }
          }
        }

        const trimmed = fullText.trim();
        if (trimmed) {
          const doc = JSON.parse(trimmed) as Record<string, unknown>;
          onEvent({
            type: 'progress',
            charsReceived: trimmed.length,
            model: attempt.model,
          });
          onEvent({
            type: 'result',
            document: doc,
            model: attempt.model,
          });
          return;
        }
        lastError = new Error('Empty stream returned from document formatter.');
      } catch (err: unknown) {
        if (signal?.aborted) return;
        lastError = err;
        console.warn(
          `PDF stream attempt failed (key #${keyIdx + 1}/${candidateKeys.length}, ${attempt.model}):`,
          err instanceof Error ? err.message : err
        );
        if (isQuotaOrRateLimitError(err)) {
          markKeyCooldown(apiKey, 90_000, 'rate_limit', candidateKeys);
          rotateToNextKey = true;
          break;
        }
        if (isInvalidKeyError(err)) {
          markKeyCooldown(apiKey, 15 * 60_000, 'invalid_key', candidateKeys);
          rotateToNextKey = true;
          break;
        }
        if (!isTransientError(err)) {
          rotateToNextKey = false;
          break;
        }
      }
    }

    if (!rotateToNextKey && !isTransientError(lastError)) {
      break;
    }
    if (isTransientError(lastError)) {
      advanceKeyPointer(apiKey, candidateKeys);
    }
  }

  const status = isQuotaOrRateLimitError(lastError)
    ? 429
    : isInvalidKeyError(lastError)
    ? 403
    : isTransientError(lastError)
    ? 503
    : 500;

  onEvent({
    type: 'error',
    status,
    error:
      status === 429
        ? `যুক্ত থাকা ${candidateKeys.length}টি API Key-এর সাময়িক লিমিট পূর্ণ হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।`
        : lastError instanceof Error
        ? lastError.message
        : 'PDF ডকুমেন্ট স্ট্রিমিং ফরম্যাটে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
  });
}
