import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type TutorMode =
  | 'chat'
  | 'translate-ar-bn'
  | 'translate-bn-ar'
  | 'grammar'
  | 'correct-writing'
  | 'quiz'
  | 'speaking-feedback'
  | 'generate-lesson';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const BASE_TUTOR_INSTRUCTION = `You are Ustadha/Ustadh AI, an expert Arabic language teacher at AI Arabic Academy teaching both Modern Standard Arabic (MSA / فصحى), classical Nahw & Sarf (Mabadiul Arabiyyah, Nahw Mir, Sharh Mi'at Amil, Hidayatun Nahw, Al-Kafiyah, Mizanus Sarf, Munsha'ib, Safwatul Masadir), and Quranic Arabic.
Core teaching protocol:
1. Understand the student's language (Bengali, English, or Arabic) and respond clearly in that language while ALWAYS keeping Bengali pronunciation (উচ্চারণ) and Bengali meaning (অর্থ) helpful and accessible when teaching Arabic words or sentences.
2. Provide Arabic examples with COMPLETE Harakat (التشكيل الكامل / ফাতহা, কাসরা, দম্মা, সুকূন, শাদ্দাহ, তানভীন).
3. Give clear Bengali pronunciation (বাংলা উচ্চারণ) in brackets or a dedicated line.
4. Explain meaning in Bengali (বাংলা অর্থ) and English where helpful.
5. Explain Nahw (نحو - syntax) and Sarf (صرف - morphology/root letters) step by step when grammar is involved.
6. Provide practical everyday or scholarly examples suited to the student's selected level.
7. CRITICAL INTEGRITY RULE: NEVER fabricate, guess, or alter Quranic verses or Hadith. Only cite well-known authentic verses with exact Surah name and Ayah number (e.g., Surah Al-Fatihah 1:2) when completely certain; otherwise clearly state if you are giving an educational example rather than scripture.`;

function buildModePrompt(mode: TutorMode, level: string, context?: string): string {
  const levelNote = `Student Level: ${level}. Tailor vocabulary and grammar depth to this level.`;
  switch (mode) {
    case 'translate-ar-bn':
      return `${levelNote}
Task: Translate the provided Arabic text into natural Bengali and English.
Format clearly with:
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
- Alternative polite or formal phrasing if useful.`;
    case 'grammar':
      return `${levelNote}
Task: Explain the requested Arabic Grammar (Nahw/Sarf) topic step-by-step in Bengali (and English if asked).
Include:
- Core rule in simple terms (referencing Mabadiul Arabiyyah, Hidayatun Nahw, Kafiyah, or Mizanus Sarf where relevant)
- 3–4 Arabic examples with complete Harakat, Bengali pronunciation, and Bengali meaning
- Common mistakes to avoid
- 2 short practice questions at the end.`;
    case 'correct-writing':
      return `${levelNote}
Task: Correct the student's Arabic writing or sentence.
Format clearly with:
- Corrected Arabic sentence with complete Harakat
- Bengali pronunciation of the corrected sentence
- What was wrong and why (Nahw/Sarf/Spelling explanation in Bengali)
- Encouragement and 1 suggested variation.`;
    case 'quiz':
      return `${levelNote}
Task: Create an interactive 3-question mini-quiz on the requested topic or level.
Provide clear numbered questions with Arabic Harakat, options (A, B, C, D), and place the Answer Key & Bengali explanations cleanly at the bottom under "--- Answer Key ---".`;
    case 'speaking-feedback':
      return `${levelNote}
Task: Evaluate the student's spoken Arabic transcript against the target phrase (provided in context).
${context ? `Context/Target: ${context}` : ''}
Give kind, practical pronunciation & grammar feedback in Bengali, show the target Arabic with full Harakat, Bengali pronunciation, and point out any missing or misheard words.`;
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
Answer the student's question warmly, clearly, and systematically.`;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('UNAVAILABLE') ||
    msg.toLowerCase().includes('high demand') ||
    msg.toLowerCase().includes('overloaded') ||
    msg.toLowerCase().includes('temporarily')
  );
}

export async function runAiTeacherRequest(payload: {
  message?: string;
  history?: ChatHistoryMessage[];
  mode?: TutorMode;
  level?: string;
  interfaceLang?: 'bn' | 'en' | 'ar';
  context?: string;
}): Promise<{ status: number; body: Record<string, unknown> }> {
  const {
    message,
    history = [],
    mode = 'chat',
    level = 'Beginner (Level 1)',
    interfaceLang = 'bn',
    context,
  } = payload;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return { status: 400, body: { error: 'অনুগ্রহ করে AI শিক্ষকের জন্য একটি প্রশ্ন বা আরবি বাক্য লিখুন।' } };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error:
          'GEMINI_API_KEY সেট করা নেই। Vercel-এ Environment Variables বা Google AI Studio Settings > Secrets-এ GEMINI_API_KEY যুক্ত করুন।',
      },
    };
  }

  const langPreference =
    interfaceLang === 'bn'
      ? 'Primary UI language is Bengali (বাংলা). Give explanations primarily in clear, natural Bengali unless the student writes strictly in English or Arabic.'
      : interfaceLang === 'ar'
      ? 'Primary UI language is Arabic (العربية), while still including Bengali meanings/pronunciation when helpful for Bengali learners.'
      : 'Primary UI language is English, while always including Bengali pronunciation and Bengali meaning alongside Arabic examples.';

  const systemInstruction = `${BASE_TUTOR_INSTRUCTION}\n\n${langPreference}\n\n${buildModePrompt(
    mode,
    level,
    context
  )}`;

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .filter((item) => item && typeof item.content === 'string' && item.content.trim())
        .map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        }))
    : [];

  const contents = [
    ...recentHistory,
    {
      role: 'user',
      parts: [{ text: message.trim() }],
    },
  ];

  // Try primary model with exponential backoff, then seamless fallback to gemini-3.1-flash-lite if 503 persists
  const attempts: { model: string; thinkingLevel?: ThinkingLevel; delayMs: number }[] = [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 0 },
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 800 },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, delayMs: 400 },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, delayMs: 1000 },
  ];

  let lastError: unknown = null;

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
          ...(attempt.thinkingLevel ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } } : {}),
        },
      });
      const reply = response.text?.trim();
      if (reply) {
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
      console.warn(`Gemini attempt failed (${attempt.model}):`, err instanceof Error ? err.message : err);
      if (!isTransientError(err)) {
        break;
      }
    }
  }

  const errMsg = lastError instanceof Error ? lastError.message : String(lastError || 'Unexpected error');
  const status =
    errMsg.includes('429') || errMsg.toLowerCase().includes('resource_exhausted')
      ? 429
      : errMsg.includes('403') || errMsg.includes('401') || errMsg.toLowerCase().includes('api_key')
      ? 403
      : isTransientError(lastError)
      ? 503
      : 500;

  return {
    status,
    body: {
      error:
        status === 429
          ? 'API ব্যবহারের সীমা (Rate limit) সাময়িকভাবে পূর্ণ হয়েছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।'
          : status === 403
          ? 'Gemini API Key যাচাই ব্যর্থ হয়েছে। অনুগ্রহ করে GEMINI_API_KEY সঠিক আছে কিনা পরীক্ষা করুন।'
          : status === 503
          ? 'Gemini সার্ভার এখন অতিরিক্ত ব্যস্ত রয়েছে (সাময়িক 503)। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।'
          : `AI শিক্ষক ত্রুটি: ${errMsg}`,
    },
  };
}
