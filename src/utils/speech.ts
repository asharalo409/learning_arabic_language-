export interface SpeechSupportInfo {
  ttsSupported: boolean;
  hasArabicTtsVoice: boolean;
  sttSupported: boolean;
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
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  langCode: 'ar-SA' | 'bn-BD' | 'en-US' = 'ar-SA',
  options?: {
    rate?: number;
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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.split('-')[0].toLowerCase();
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.rate = options?.rate ?? (langCode.startsWith('ar') ? 0.92 : 1.0);
    utterance.pitch = 1.0;

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => options?.onEnd?.();
    utterance.onerror = () => {
      options?.onError?.('অডিও প্লে করতে সমস্যা হয়েছে অথবা ডিভাইসে ভয়েস প্যাকেজ পাওয়া যায়নি।');
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    options?.onError?.('ব্রাউজার অডিও ইঞ্জিন চালু করা যায়নি।');
    return false;
  }
}

export function speakArabic(
  text: string,
  options?: {
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }
): boolean {
  return speakText(text, 'ar-SA', options);
}

export interface RecognitionHandle {
  stop: () => void;
}

export function startVoiceRecognition(
  langCode: 'ar-SA' | 'bn-BD' | 'en-US',
  callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (message: string) => void;
    onEnd: () => void;
  }
): RecognitionHandle | null {
  if (typeof window === 'undefined') {
    callbacks.onError('স্পিচ রিকগনিশন উপলব্ধ নয়।');
    return null;
  }

  const win = window as unknown as {
    SpeechRecognition?: new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      continuous: boolean;
      onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
      onerror: ((ev: { error?: string }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    webkitSpeechRecognition?: new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      continuous: boolean;
      onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
      onerror: ((ev: { error?: string }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
  };

  const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
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
    recognition.continuous = false;

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
      } else {
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
