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
            // Fall back cleanly if text wasn't strict JSON
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
