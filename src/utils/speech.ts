import { VoiceGender } from '../types/academy';

const VOICE_GENDER_STORAGE_KEY = 'aaa_voice_gender_v1';
const SPEECH_TUNING_STORAGE_KEY = 'aaa_speech_tuning_v1';

export type VoiceEmotion = 'formal' | 'friendly' | 'encouraging';

export interface SpeechTuning {
  rateMultiplier: number; // 0.65 to 1.40
  pitchOffset: number; // -0.35 to +0.35
  emotion: VoiceEmotion;
}

export const VOICE_EMOTION_PRESETS: Record<
  VoiceEmotion,
  { labelBn: string; descBn: string; pitchDelta: number; rateFactor: number }
> = {
  formal: {
    labelBn: 'প্রামাণিক শিক্ষক (Formal)',
    descBn: 'গম্ভীর, ধীরস্থির ও কিতাবি স্পষ্ট উচ্চারণ',
    pitchDelta: -0.05,
    rateFactor: 0.94,
  },
  friendly: {
    labelBn: 'বন্ধুত্বপূর্ণ সংলাপ (Friendly)',
    descBn: 'স্বাভাবিক, উষ্ণ ও প্রাণবন্ত কথোপকথন',
    pitchDelta: 0.08,
    rateFactor: 1.04,
  },
  encouraging: {
    labelBn: 'কোমল ও উৎসাহদায়ক (Gentle)',
    descBn: 'ধৈর্যশীল, কোমল ও শিক্ষানবিস-বান্ধব সুর',
    pitchDelta: 0.04,
    rateFactor: 0.9,
  },
};

export interface SpeechSupportInfo {
  ttsSupported: boolean;
  hasArabicTtsVoice: boolean;
  sttSupported: boolean;
}

// Global token so stopping speech cancels multi-chunk bilingual playback immediately
let activeSpeechToken = 0;

export function getPreferredVoiceGender(): VoiceGender {
  if (typeof window === 'undefined') return 'male';
  try {
    const saved = localStorage.getItem(VOICE_GENDER_STORAGE_KEY);
    return saved === 'female' ? 'female' : 'male';
  } catch {
    return 'male';
  }
}

export function setPreferredVoiceGender(gender: VoiceGender): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_GENDER_STORAGE_KEY, gender);
  } catch {
    // ignore storage failures
  }
}

export function getSpeechTuning(): SpeechTuning {
  if (typeof window === 'undefined') {
    return { rateMultiplier: 1.0, pitchOffset: 0, emotion: 'formal' };
  }
  try {
    const raw = localStorage.getItem(SPEECH_TUNING_STORAGE_KEY);
    if (!raw) return { rateMultiplier: 1.0, pitchOffset: 0, emotion: 'formal' };
    const parsed = JSON.parse(raw) as Partial<SpeechTuning>;
    const emotion: VoiceEmotion =
      parsed.emotion === 'friendly' || parsed.emotion === 'encouraging' ? parsed.emotion : 'formal';
    return {
      rateMultiplier: Math.max(0.65, Math.min(1.4, Number(parsed.rateMultiplier) || 1.0)),
      pitchOffset: Math.max(-0.35, Math.min(0.35, Number(parsed.pitchOffset) || 0)),
      emotion,
    };
  } catch {
    return { rateMultiplier: 1.0, pitchOffset: 0, emotion: 'formal' };
  }
}

export function setSpeechTuning(tuning: Partial<SpeechTuning>): SpeechTuning {
  const next: SpeechTuning = {
    ...getSpeechTuning(),
    ...tuning,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SPEECH_TUNING_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  return next;
}

export function getSpeechSupport(): SpeechSupportInfo {
  if (typeof window === 'undefined') {
    return { ttsSupported: false, hasArabicTtsVoice: false, sttSupported: false };
  }
  const ttsSupported = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  const voices = ttsSupported ? window.speechSynthesis.getVoices() : [];
  const hasArabicTtsVoice = voices.some((v) => v.lang.toLowerCase().startsWith('ar'));
  const win = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  const sttSupported = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  return { ttsSupported, hasArabicTtsVoice, sttSupported };
}

export function stopArabicSpeech(): void {
  activeSpeechToken += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

const MALE_VOICE_HINTS = [
  'male',
  'man',
  'maged',
  'majed',
  'tarik',
  'tariq',
  'naayf',
  'bassel',
  'hamed',
  'shakir',
  'pradeep',
  'tanvir',
  'bashkar',
  'nabanita-male',
  'daniel',
  'david',
  'mark',
  'alex',
  'rishi',
  'george',
  'ryan',
  'guy',
  'andrew',
];

const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'hoda',
  'salma',
  'laila',
  'zeina',
  'fatima',
  'rana',
  'zariyah',
  'tanisha',
  'nabanita',
  'zira',
  'samantha',
  'aria',
  'jenny',
  'sonia',
  'victoria',
  'karen',
];

function selectVoiceByGender(
  voices: SpeechSynthesisVoice[],
  langCode: string,
  gender: VoiceGender
): { voice?: SpeechSynthesisVoice; matchedRequestedGender: boolean } {
  const prefix = langCode.split('-')[0].toLowerCase();
  const exactPool = voices.filter((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  const prefixPool = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const pool = exactPool.length > 0 ? exactPool : prefixPool;

  if (pool.length === 0) {
    return { voice: undefined, matchedRequestedGender: false };
  }

  const targetHints = gender === 'male' ? MALE_VOICE_HINTS : FEMALE_VOICE_HINTS;
  const oppositeHints = gender === 'male' ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;

  const exactGenderMatch = pool.find((v) => {
    const name = `${v.name} ${v.voiceURI}`.toLowerCase();
    return targetHints.some((hint) => name.includes(hint));
  });
  if (exactGenderMatch) {
    return { voice: exactGenderMatch, matchedRequestedGender: true };
  }

  const nonOppositeMatch = pool.find((v) => {
    const name = `${v.name} ${v.voiceURI}`.toLowerCase();
    return !oppositeHints.some((hint) => name.includes(hint));
  });

  if (nonOppositeMatch) {
    return { voice: nonOppositeMatch, matchedRequestedGender: false };
  }

  return { voice: pool[0], matchedRequestedGender: false };
}

function createConfiguredUtterance(
  text: string,
  langCode: 'ar-SA' | 'bn-BD' | 'en-US',
  gender: VoiceGender,
  rateOverride?: number
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const { voice: matchedVoice, matchedRequestedGender } = selectVoiceByGender(
    voices,
    langCode,
    gender
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  } else {
    utterance.lang = langCode;
  }

  const tuning = getSpeechTuning();
  const emotionPreset = VOICE_EMOTION_PRESETS[tuning.emotion || 'formal'];
  const baseRate = rateOverride ?? (langCode.startsWith('ar') ? 0.92 : 1.0);
  const scaledRate = baseRate * tuning.rateMultiplier * emotionPreset.rateFactor;
  utterance.rate = Math.max(0.55, Math.min(1.55, gender === 'male' ? scaledRate - 0.03 : scaledRate));

  const basePitch =
    gender === 'male'
      ? matchedRequestedGender
        ? 0.92
        : 0.76
      : matchedRequestedGender
      ? 1.08
      : 1.22;
  utterance.pitch = Math.max(
    0.5,
    Math.min(1.65, basePitch + tuning.pitchOffset + emotionPreset.pitchDelta)
  );

  return utterance;
}

export function speakText(
  text: string,
  langCode: 'ar-SA' | 'bn-BD' | 'en-US' = 'ar-SA',
  options?: {
    rate?: number;
    voiceGender?: VoiceGender;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.('এই ব্রাউজারে স্পিচ সিন্থেসিস (অডিও প্লেব্যাক) সমর্থিত নয়।');
    return false;
  }

  try {
    activeSpeechToken += 1;
    const token = activeSpeechToken;
    window.speechSynthesis.cancel();

    const desiredGender = options?.voiceGender || getPreferredVoiceGender();
    const utterance = createConfiguredUtterance(text, langCode, desiredGender, options?.rate);

    utterance.onstart = () => {
      if (token === activeSpeechToken) options?.onStart?.();
    };
    utterance.onend = () => {
      if (token === activeSpeechToken) options?.onEnd?.();
    };
    utterance.onerror = () => {
      if (token === activeSpeechToken) {
        options?.onEnd?.();
        options?.onError?.('অডিও প্লে করতে সমস্যা হয়েছে অথবা ডিভাইসে ভয়েস প্যাকেজ পাওয়া যায়নি।');
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    options?.onEnd?.();
    options?.onError?.('ব্রাউজার অডিও ইঞ্জিন চালু করা যায়নি।');
    return false;
  }
}

export function speakArabic(
  text: string,
  options?: {
    rate?: number;
    voiceGender?: VoiceGender;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }
): boolean {
  return speakText(text, 'ar-SA', options);
}

interface BilingualSegment {
  text: string;
  lang: 'ar-SA' | 'bn-BD' | 'en-US';
}

const ARABIC_CHAR_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const BENGALI_CHAR_RE = /[\u0980-\u09FF]/;

function cleanSpeechMarkdown(raw: string): string {
  return raw
    .replace(/[*_`#>~|]/g, ' ')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/[-]{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitBilingualSegments(
  rawText: string,
  fallbackLang: 'bn-BD' | 'en-US' = 'bn-BD'
): BilingualSegment[] {
  const cleaned = cleanSpeechMarkdown(rawText);
  if (!cleaned) return [];

  // Split around continuous Arabic spans while keeping punctuation grouped neatly
  const parts = cleaned.split(
    /([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s،؟.!؛:«»ـ]*)/g
  );

  const segments: BilingualSegment[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (ARABIC_CHAR_RE.test(trimmed)) {
      segments.push({ text: trimmed, lang: 'ar-SA' });
    } else if (BENGALI_CHAR_RE.test(trimmed)) {
      segments.push({ text: trimmed, lang: 'bn-BD' });
    } else if (/[a-zA-Z]{2,}/.test(trimmed)) {
      segments.push({ text: trimmed, lang: fallbackLang });
    }
  }

  return segments.slice(0, 14);
}

/**
 * Speaks mixed Arabic + Bengali AI responses sequentially in native voices so
 * BOTH the Arabic expressions AND Bengali explanations are heard naturally.
 */
export function speakBilingualText(
  rawText: string,
  options?: {
    fallbackLang?: 'bn-BD' | 'en-US';
    rate?: number;
    voiceGender?: VoiceGender;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.('এই ব্রাউজারে স্পিচ সিন্থেসিস (অডিও প্লেব্যাক) সমর্থিত নয়।');
    return false;
  }

  const segments = splitBilingualSegments(rawText, options?.fallbackLang || 'bn-BD');
  if (segments.length === 0) {
    options?.onEnd?.();
    return false;
  }

  activeSpeechToken += 1;
  const token = activeSpeechToken;
  window.speechSynthesis.cancel();

  const desiredGender = options?.voiceGender || getPreferredVoiceGender();
  let started = false;

  const playAt = (index: number) => {
    if (token !== activeSpeechToken) return;
    if (index >= segments.length) {
      options?.onEnd?.();
      return;
    }

    const seg = segments[index];
    try {
      const utterance = createConfiguredUtterance(seg.text, seg.lang, desiredGender, options?.rate);
      utterance.onstart = () => {
        if (token !== activeSpeechToken) return;
        if (!started) {
          started = true;
          options?.onStart?.();
        }
      };
      utterance.onend = () => {
        if (token !== activeSpeechToken) return;
        playAt(index + 1);
      };
      utterance.onerror = () => {
        if (token !== activeSpeechToken) return;
        playAt(index + 1);
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      if (token === activeSpeechToken) {
        options?.onEnd?.();
      }
    }
  };

  playAt(0);
  return true;
}

export type SpeechRecLang = 'ar-SA' | 'bn-BD' | 'en-US';

export interface RecognitionHandle {
  stop: () => void;
  resetBuffer?: () => void;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult:
    | ((ev: {
        resultIndex?: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
      }) => void)
    | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

function getSpeechRecConstructor(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * High-quality Continuous Web Speech API Speech-to-Text.
 * Supports natural long-form speaking in both Bengali (bn-BD) and Arabic (ar-SA)
 * with continuous=true, interimResults=true, automatic recovery from idle browser timeouts,
 * and optional natural-pause firing for hands-free conversational AI.
 */
export function startContinuousSpeechRecognition(
  langCode: SpeechRecLang,
  callbacks: {
    onTranscript: (data: { fullText: string; finalText: string; interimText: string }) => void;
    onUtterancePause?: (utterance: string) => void;
    onError: (message: string) => void;
    onEnd?: () => void;
    pauseDelayMs?: number;
  }
): RecognitionHandle | null {
  const SpeechRec = getSpeechRecConstructor();
  if (!SpeechRec) {
    callbacks.onError(
      'আপনার ব্রাউজারে Web Speech Recognition (ভয়েস ইনপুট) সমর্থিত নয়। অনুগ্রহ করে Google Chrome বা Microsoft Edge ব্যবহার করুন।'
    );
    return null;
  }

  let activelyListening = true;
  let accumulatedFinal = '';
  let latestFull = '';
  let recognition: BrowserSpeechRecognition | null = null;
  let pauseTimer: number | null = null;
  let restartTimer: number | null = null;
  const pauseMs = callbacks.pauseDelayMs ?? 1350;

  const clearTimers = () => {
    if (pauseTimer !== null) {
      window.clearTimeout(pauseTimer);
      pauseTimer = null;
    }
    if (restartTimer !== null) {
      window.clearTimeout(restartTimer);
      restartTimer = null;
    }
  };

  const schedulePauseCommit = () => {
    if (!callbacks.onUtterancePause) return;
    if (pauseTimer !== null) window.clearTimeout(pauseTimer);
    pauseTimer = window.setTimeout(() => {
      if (!activelyListening) return;
      const toCommit = latestFull.trim();
      if (toCommit) {
        accumulatedFinal = '';
        latestFull = '';
        callbacks.onUtterancePause?.(toCommit);
      }
    }, pauseMs);
  };

  const startSession = () => {
    if (!activelyListening) return;
    try {
      const rec = new SpeechRec();
      recognition = rec;
      rec.lang = langCode;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      let sessionCommitted = '';

      rec.onresult = (event) => {
        if (!activelyListening) return;
        let finalSeg = '';
        let interimSeg = '';
        const startIdx = typeof event.resultIndex === 'number' ? event.resultIndex : 0;

        // Reconstruct cleanly from 0 to avoid Android Chrome duplicate result loops
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res && res[0] ? res[0].transcript.trim() : '';
          if (!text) continue;
          if (res.isFinal) {
            finalSeg = finalSeg ? `${finalSeg} ${text}` : text;
          } else {
            interimSeg = interimSeg ? `${interimSeg} ${text}` : text;
          }
        }

        // Preserve any prior restarted chunk plus current session's transcript
        void startIdx;
        sessionCommitted = finalSeg;
        const combinedFinal = [accumulatedFinal, sessionCommitted].filter(Boolean).join(' ').trim();
        latestFull = [combinedFinal, interimSeg].filter(Boolean).join(' ').trim();

        callbacks.onTranscript({
          fullText: latestFull,
          finalText: combinedFinal,
          interimText: interimSeg,
        });

        if (latestFull) {
          schedulePauseCommit();
        }
      };

      rec.onerror = (event) => {
        const code = event?.error || 'unknown';
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          activelyListening = false;
          clearTimers();
          callbacks.onError('মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজার সেটিংস থেকে মাইক্রোফোন অনুমতি দিন।');
          callbacks.onEnd?.();
          return;
        }
        if (code === 'audio-capture') {
          activelyListening = false;
          clearTimers();
          callbacks.onError('সক্রিয় মাইক্রোফোন খুঁজে পাওয়া যায়নি। ডিভাইসের মাইক্রোফোন পরীক্ষা করুন।');
          callbacks.onEnd?.();
          return;
        }
        // Recoverable transient codes ('no-speech', 'network', 'aborted') handled gracefully by onend auto-restart
      };

      rec.onend = () => {
        if (sessionCommitted) {
          accumulatedFinal = [accumulatedFinal, sessionCommitted].filter(Boolean).join(' ').trim();
          sessionCommitted = '';
        }
        if (activelyListening) {
          restartTimer = window.setTimeout(() => {
            if (activelyListening) startSession();
          }, 180);
        } else {
          clearTimers();
          callbacks.onEnd?.();
        }
      };

      rec.start();
    } catch {
      activelyListening = false;
      clearTimers();
      callbacks.onError('ধারাবাহিক মাইক্রোফোন রিকগনিশন শুরু করা যায়নি।');
      callbacks.onEnd?.();
    }
  };

  startSession();

  return {
    stop: () => {
      activelyListening = false;
      clearTimers();
      try {
        recognition?.stop();
      } catch {
        // ignore
      }
      callbacks.onEnd?.();
    },
    resetBuffer: () => {
      accumulatedFinal = '';
      latestFull = '';
      if (pauseTimer !== null) {
        window.clearTimeout(pauseTimer);
        pauseTimer = null;
      }
    },
  };
}

export function startVoiceRecognition(
  langCode: SpeechRecLang,
  callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (message: string) => void;
    onEnd: () => void;
    continuous?: boolean;
  }
): RecognitionHandle | null {
  const SpeechRec = getSpeechRecConstructor();
  if (!SpeechRec) {
    callbacks.onError(
      'আপনার ব্রাউজারে Web Speech Recognition (ভয়েস ইনপুট) সমর্থিত নয়। অনুগ্রহ করে Google Chrome বা Microsoft Edge ব্যবহার করুন।'
    );
    return null;
  }

  try {
    const recognition = new SpeechRec();
    recognition.lang = langCode;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = callbacks.continuous ?? true;

    recognition.onresult = (event) => {
      let fullText = '';
      let finalFlag = false;
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res && res[0]) {
          fullText += res[0].transcript + ' ';
        }
        if (res && res.isFinal) {
          finalFlag = true;
        }
      }
      callbacks.onResult(fullText.trim(), finalFlag);
    };

    recognition.onerror = (event) => {
      const code = event?.error || 'unknown';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        callbacks.onError('মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজার সেটিংস থেকে মাইক্রোফোন অনুমতি দিন।');
      } else if (code === 'no-speech') {
        callbacks.onError('কোনো কণ্ঠস্বর শোনা যায়নি। মাইক্রোফোনের কাছে স্পষ্টভাবে বলুন।');
      } else if (code !== 'aborted') {
        callbacks.onError(`ভয়েস ইনপুট ত্রুটি (${code})। Chrome/Edge ব্রাউজার ও সক্রিয় মাইক্রোফোন নিশ্চিত করুন।`);
      }
    };

    recognition.onend = () => {
      callbacks.onEnd();
    };

    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch {
    callbacks.onError('মাইক্রোফোন রিকগনিশন শুরু করা যায়নি।');
    return null;
  }
}

export function startArabicRecognition(callbacks: {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}): RecognitionHandle | null {
  return startVoiceRecognition('ar-SA', callbacks);
}
