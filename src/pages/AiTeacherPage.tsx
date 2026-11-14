import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  AudioLines,
  Check,
  Copy,
  FileText,
  GitBranch,
  History,
  Image as ImageIcon,
  MessageSquarePlus,
  Mic,
  MicOff,
  Plus,
  Radio,
  ScanText,
  Send,
  Sliders,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { AiVoiceRobotOrb } from '../components/AiVoiceRobotOrb';
import { DocumentAnalyzerPanel } from '../components/DocumentAnalyzerPanel';
import { GeminiRichText } from '../components/GeminiRichText';
import { SentenceTarkibCard } from '../components/SentenceTarkibCard';
import { useApp } from '../context/AppContext';
import { VoiceGender } from '../types/academy';
import { useOnlineStatus } from '../utils/offlineCache';
import {
  getSpeechSupport,
  getSpeechTuning,
  RecognitionHandle,
  setSpeechTuning,
  speakBilingualText,
  speakText,
  SpeechTuning,
  startContinuousSpeechRecognition,
  stopArabicSpeech,
  VOICE_EMOTION_PRESETS,
  VoiceEmotion,
} from '../utils/speech';

type TutorMode =
  | 'voice-dialogue'
  | 'chat'
  | 'translate-ar-bn'
  | 'translate-bn-ar'
  | 'grammar'
  | 'correct-writing'
  | 'quiz';

interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  base64Data?: string;
  previewUrl?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: TutorMode;
  timestamp: string;
  attachments?: ChatAttachment[];
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const SESSIONS_STORAGE_KEY = 'aaa_ai_teacher_sessions_v2';
const ACTIVE_SESSION_KEY = 'aaa_ai_teacher_active_session_v2';

const MODE_LABELS: { id: TutorMode; labelBn: string; labelEn: string }[] = [
  { id: 'voice-dialogue', labelBn: 'লাইভ ভয়েস সংলাপ', labelEn: 'Live Voice' },
  { id: 'chat', labelBn: 'সাধারণ আরবি শিক্ষক', labelEn: 'General Tutor' },
  { id: 'translate-ar-bn', labelBn: 'আরবি → বাংলা', labelEn: 'Arabic → Bengali' },
  { id: 'translate-bn-ar', labelBn: 'বাংলা → আরবি', labelEn: 'Bengali → Arabic' },
  { id: 'grammar', labelBn: 'নাহু ও ছরফ', labelEn: 'Nahw & Sarf' },
  { id: 'correct-writing', labelBn: 'ভুল সংশোধন', labelEn: 'Mistake Fix' },
  { id: 'quiz', labelBn: 'AI কুইজ', labelEn: 'AI Quiz' },
];

function createNewSession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `chat-${Date.now()}`,
    title: 'নতুন আরবি চ্যাট',
    updatedAt: now,
    messages: [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        mode: 'voice-dialogue',
        timestamp: now,
        content:
          'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ! أَهْلًا بِكَ فِي أَكَادِيمِيَّةِ اللُّغَةِ الْعَرَبِيَّةِ.\n\nআসসালামু আলাইকুম। আমি আপনার দ্বিভাষিক (বাংলা ও আরবি) AI শিক্ষক। নিচের মাইকে বাংলা বা আরবিতে স্বাভাবিকভাবে কথা বলুন, ভয়েস কলে সরাসরি সংলাপ করুন, অথবা "+" বাটন দিয়ে বইয়ের ছবি ও PDF আপলোড করে পড়া বুঝে নিন।',
      },
    ],
  };
}

function extractArabicSnippet(text: string): string {
  const matches = text.match(/[\u0600-\u06FF][\u0600-\u06FF\s،؟.!]{2,}/g);
  return matches ? matches.slice(0, 4).join(' ') : '';
}

export const AiTeacherPage: React.FC = () => {
  const { t, lang, awardXp, currentLevelNumber, progress, updateProfile, syncMissingVocabFromSegments } = useApp();
  const [searchParams] = useSearchParams();
  const isOnline = useOnlineStatus();
  const [expandedTarkibMsgIds, setExpandedTarkibMsgIds] = useState<Record<string, boolean>>({});

  const [activeWorkspace, setActiveWorkspace] = useState<'chat' | 'ocr'>('chat');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [speechTuning, setSpeechTuningState] = useState<SpeechTuning>(() => getSpeechTuning());

  const [mode, setMode] = useState<TutorMode>('voice-dialogue');
  const [studentLevel, setStudentLevel] = useState(`Level ${currentLevelNumber}`);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showOrb, setShowOrb] = useState(false);

  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'ar-SA' | 'en-US'>('bn-BD');
  const [autoSpeakReply, setAutoSpeakReply] = useState(true);
  const [liveCallActive, setLiveCallActive] = useState(false);
  const [dictationActive, setDictationActive] = useState(false);
  const [liveCaption, setLiveCaption] = useState('');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechSupport] = useState(() => getSpeechSupport());

  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);

  const recRef = useRef<RecognitionHandle | null>(null);
  const dictationRef = useRef<RecognitionHandle | null>(null);
  const dictationBaseRef = useRef<string>('');
  const liveCallRef = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeGender: VoiceGender = progress.voiceGender === 'female' ? 'female' : 'male';

  const handleTuningUpdate = (patch: Partial<SpeechTuning>) => {
    const updated = setSpeechTuning(patch);
    setSpeechTuningState(updated);
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return '';
  });

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession.messages;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    try {
      const compactSessions = sessions.slice(0, 25).map((s) => ({
        ...s,
        messages: s.messages.map((m) => ({
          ...m,
          attachments: m.attachments?.map((a) => ({
            id: a.id,
            name: a.name,
            mimeType: a.mimeType,
            sizeBytes: a.sizeBytes,
          })),
        })),
      }));
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(compactSessions));
      if (currentSession?.id) {
        localStorage.setItem(ACTIVE_SESSION_KEY, currentSession.id);
      }
    } catch {
      // ignore
    }
  }, [sessions, currentSession?.id]);

  useEffect(() => {
    const initialQ = searchParams.get('q');
    if (initialQ) {
      setInput(initialQ);
    }
    return () => {
      liveCallRef.current = false;
      recRef.current?.stop();
      dictationRef.current?.stop();
      stopArabicSpeech();
    };
  }, [searchParams]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  const updateCurrentSessionMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[], newTitle?: string) => {
      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.id !== currentSession.id) return sess;
          return {
            ...sess,
            title: newTitle || sess.title,
            updatedAt: new Date().toISOString(),
            messages: updater(sess.messages).slice(-50),
          };
        })
      );
    },
    [currentSession.id]
  );

  const stopDictation = useCallback(() => {
    dictationRef.current?.stop();
    dictationRef.current = null;
    setDictationActive(false);
  }, []);

  const endLiveCall = useCallback(() => {
    liveCallRef.current = false;
    setLiveCallActive(false);
    setLiveCaption('');
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    stopArabicSpeech();
    setSpeaking(false);
  }, []);

  const handleStopSpeaking = useCallback(() => {
    stopArabicSpeech();
    setSpeaking(false);
  }, []);

  const armLiveCallListenerRef = useRef<() => void>(() => {});

  const speakBilingualReply = useCallback(
    (replyText: string, genderOverride?: VoiceGender) => {
      const chosenGender = genderOverride || activeGender;
      speakBilingualText(replyText, {
        fallbackLang: voiceLang === 'en-US' ? 'en-US' : 'bn-BD',
        voiceGender: chosenGender,
        onStart: () => setSpeaking(true),
        onEnd: () => {
          setSpeaking(false);
          if (liveCallRef.current && !loadingRef.current) {
            window.setTimeout(() => {
              if (liveCallRef.current && !loadingRef.current) {
                armLiveCallListenerRef.current();
              }
            }, 350);
          }
        },
        onError: () => {
          setSpeaking(false);
        },
      });
    },
    [activeGender, voiceLang]
  );

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const remainingSlots = Math.max(0, 3 - pendingAttachments.length);
    if (remainingSlots === 0) {
      setErrorMsg('একবারে সর্বোচ্চ ৩টি ছবি বা PDF সংযুক্ত করা যাবে।');
      return;
    }

    const chosenFiles = Array.from(fileList).slice(0, remainingSlots);
    const loaded: ChatAttachment[] = [];

    for (const file of chosenFiles) {
      const mime = file.type.toLowerCase();
      const isImage = mime.startsWith('image/');
      const isPdf = mime === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isImage && !isPdf) {
        setErrorMsg(`"${file.name}" সমর্থিত নয়। শুধুমাত্র ছবি (JPG/PNG/WEBP) অথবা PDF আপলোড করুন।`);
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" ফাইলটি ৮ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ফাইল নির্বাচন করুন।`);
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
      }).catch(() => '');

      if (!dataUrl) continue;
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      loaded.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        mimeType: isPdf ? 'application/pdf' : mime || 'image/jpeg',
        sizeBytes: file.size,
        base64Data,
        previewUrl: isImage ? dataUrl : undefined,
      });
    }

    if (loaded.length > 0) {
      setPendingAttachments((prev) => [...prev, ...loaded].slice(0, 3));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const sendMessage = useCallback(
    async (textToSend?: string, isFromLiveVoice = false) => {
      const query = (textToSend ?? input).trim();
      const attachmentsToSend = isFromLiveVoice ? [] : pendingAttachments;
      if ((!query && attachmentsToSend.length === 0) || loadingRef.current) return;

      if (!navigator.onLine) {
        setErrorMsg('অফলাইন মোডে আছেন। AI শিক্ষকের সাথে কথা বলতে বা ছবি/PDF বিশ্লেষণ করতে ইন্টারনেট সংযোগ চালু করুন।');
        return;
      }

      setErrorMsg(null);
      if (!isFromLiveVoice && dictationRef.current) {
        stopDictation();
      }

      const effectiveMode =
        attachmentsToSend.length > 0
          ? mode === 'voice-dialogue'
            ? 'chat'
            : mode
          : mode === 'voice-dialogue' || isFromLiveVoice
          ? 'live-voice'
          : mode;
      const contextNote =
        effectiveMode === 'live-voice'
          ? 'The student is in interactive Live Voice Call mode. Check carefully for any Arabic mistake, show corrected Harakat Arabic if anything was wrong, reply warmly in 1-2 short Arabic sentences (full Harakat) + short clear Bengali meaning right underneath, and end with 1 simple spoken Arabic question + Bengali meaning. Do NOT use markdown asterisks or hashes.'
          : attachmentsToSend.length > 0
          ? 'The student uploaded an Arabic study image or PDF page. Read all visible Arabic/Bengali text carefully, translate and explain its meaning and Nahw/Sarf grammar clearly in Bengali with full-Harakat Arabic.'
          : undefined;

      const displayQuery =
        query ||
        `সংযুক্ত ${attachmentsToSend.map((a) => a.name).join(', ')} ফাইলটির পড়া, অনুবাদ ও গ্রামার বুঝিয়ে দিন।`;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: displayQuery,
        mode,
        timestamp: new Date().toISOString(),
        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      };

      const nextTitle =
        currentSession.title === 'নতুন আরবি চ্যাট'
          ? displayQuery.slice(0, 34) + (displayQuery.length > 34 ? '...' : '')
          : undefined;

      const currentList = messagesRef.current;
      const nextMessages = [...currentList, userMsg];
      updateCurrentSessionMessages(() => nextMessages, nextTitle);
      if (!isFromLiveVoice) {
        setInput('');
        setPendingAttachments([]);
      }
      setLiveCaption('');
      setLoading(true);
      loadingRef.current = true;

      try {
        const res = await fetch('/api/ai-teacher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: displayQuery,
            mode: effectiveMode,
            level: studentLevel,
            interfaceLang: lang,
            voiceGender: activeGender,
            voiceEmotion: speechTuning.emotion || 'formal',
            context: contextNote,
            attachments: attachmentsToSend.map((a) => ({
              name: a.name,
              mimeType: a.mimeType,
              base64Data: a.base64Data || '',
            })),
            history: nextMessages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok || !data.reply) {
          throw new Error(data.error || 'AI Teacher could not generate a response.');
        }

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          mode,
          timestamp: new Date().toISOString(),
        };

        updateCurrentSessionMessages((prev) => [...prev, assistantMsg]);
        loadingRef.current = false;
        setLoading(false);

        const replyArabic = extractArabicSnippet(data.reply);
        if (replyArabic) {
          syncMissingVocabFromSegments([
            {
              arabic: replyArabic,
              sourceLabelBn: 'AI শিক্ষক চ্যাট',
            },
          ]);
        }

        if (autoSpeakReply || liveCallRef.current) {
          speakBilingualReply(data.reply);
        }

        awardXp(attachmentsToSend.length > 0 ? 15 : 10, {
          titleBn:
            attachmentsToSend.length > 0
              ? 'AI শিক্ষকের সাথে ছবি/PDF পাঠ বিশ্লেষণ'
              : effectiveMode === 'live-voice'
              ? 'AI লাইভ ভয়েস কথোপকথন'
              : 'AI শিক্ষকের সাথে আরবি চর্চা',
          titleEn: 'Practiced Arabic with AI Teacher',
          type: 'ai',
        });
      } catch (err: unknown) {
        loadingRef.current = false;
        setLoading(false);
        setErrorMsg(err instanceof Error ? err.message : 'Network error connecting to AI Teacher.');
      }
    },
    [
      activeGender,
      autoSpeakReply,
      awardXp,
      currentSession.title,
      input,
      lang,
      mode,
      pendingAttachments,
      speakBilingualReply,
      speechTuning.emotion,
      stopDictation,
      studentLevel,
      syncMissingVocabFromSegments,
      updateCurrentSessionMessages,
    ]
  );

  const armLiveCallListener = useCallback(() => {
    setErrorMsg(null);
    stopDictation();
    stopArabicSpeech();
    setSpeaking(false);
    setListening(true);
    setLiveCaption('');

    const handle = startContinuousSpeechRecognition(voiceLang, {
      pauseDelayMs: 1450,
      onTranscript: ({ fullText }) => {
        setLiveCaption(fullText);
      },
      onUtterancePause: (utterance) => {
        if (utterance.trim() && !loadingRef.current && liveCallRef.current) {
          recRef.current?.stop();
          recRef.current = null;
          setListening(false);
          void sendMessage(utterance.trim(), true);
        }
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setListening(false);
        liveCallRef.current = false;
        setLiveCallActive(false);
      },
      onEnd: () => {
        setListening(false);
      },
    });

    if (!handle) {
      setListening(false);
      liveCallRef.current = false;
      setLiveCallActive(false);
    } else {
      recRef.current = handle;
    }
  }, [sendMessage, stopDictation, voiceLang]);

  armLiveCallListenerRef.current = armLiveCallListener;

  const handleToggleLiveVoiceCall = () => {
    if (liveCallActive || listening) {
      endLiveCall();
      return;
    }
    setShowOrb(true);
    liveCallRef.current = true;
    setLiveCallActive(true);
    setAutoSpeakReply(true);
    armLiveCallListener();
  };

  const handleToggleContinuousDictation = (overrideLang?: 'bn-BD' | 'ar-SA' | 'en-US') => {
    const targetLang = overrideLang || voiceLang;
    if (dictationActive && !overrideLang) {
      stopDictation();
      return;
    }

    endLiveCall();
    setErrorMsg(null);
    dictationRef.current?.stop();
    dictationBaseRef.current = input.trim();
    setDictationActive(true);

    const handle = startContinuousSpeechRecognition(targetLang, {
      onTranscript: ({ fullText }) => {
        const combined = [dictationBaseRef.current, fullText].filter(Boolean).join(' ');
        setInput(combined);
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setDictationActive(false);
      },
      onEnd: () => {
        setDictationActive(false);
      },
    });

    if (!handle) {
      setDictationActive(false);
    } else {
      dictationRef.current = handle;
    }
  };

  const handleSwitchSpeechLang = (nextLang: 'bn-BD' | 'ar-SA' | 'en-US') => {
    setVoiceLang(nextLang);
    if (dictationActive) {
      handleToggleContinuousDictation(nextLang);
    } else if (liveCallActive) {
      recRef.current?.stop();
      liveCallRef.current = true;
      window.setTimeout(() => {
        if (liveCallRef.current) armLiveCallListenerRef.current();
      }, 150);
    }
  };

  const handleStartNewChat = () => {
    endLiveCall();
    stopDictation();
    setErrorMsg(null);
    const fresh = createNewSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    endLiveCall();
    stopDictation();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (sessionId === currentSession.id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleDeleteSingleMessage = (msgId: string) => {
    updateCurrentSessionMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const handleGenderChange = (g: VoiceGender) => {
    updateProfile({ voiceGender: g });
    speakText(
      g === 'male'
        ? 'আসসালামু আলাইকুম, আমি এখন পুরুষ কণ্ঠে কথা বলছি।'
        : 'আসসালামু আলাইকুম, আমি এখন নারী কণ্ঠে কথা বলছি।',
      'bn-BD',
      {
        voiceGender: g,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      }
    );
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <AppShell
      title={t.sidebar.aiTeacher}
      subtitle={
        lang === 'bn'
          ? 'Gemini-স্টাইল উন্মুক্ত AI চ্যাট · বাংলা-আরবি ধারাবাহিক ভয়েস ও ছবি/PDF পাঠ বিশ্লেষণ'
          : 'Open Gemini-style bilingual Arabic & Bengali AI tutor with vision & continuous STT'
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-11.5rem)] justify-between gap-4">
        {/* Clean Minimalist Gemini Top Bar + Dedicated OCR Lab Switch & Synthesis Tuning */}
        <div className="space-y-3">
          {/* Primary Workspace Tab Bar: Chat vs Dedicated Document OCR & Grammar Lab */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
            <div className="inline-flex items-center gap-1 p-1 rounded-full surface-alt border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setActiveWorkspace('chat')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeWorkspace === 'chat' ? 'btn-primary shadow-xs' : 'text-[var(--text-secondary)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI চ্যাট ও লাইভ ভয়েস</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  endLiveCall();
                  setActiveWorkspace('ocr');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeWorkspace === 'ocr' ? 'btn-primary shadow-xs' : 'text-[var(--text-secondary)]'
                }`}
              >
                <ScanText className="w-3.5 h-3.5" />
                <span>ডকুমেন্ট OCR ও গ্রামার</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowVoiceSettings((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  showVoiceSettings ? 'btn-primary' : 'btn-secondary'
                }`}
                title="AI কণ্ঠ, গতি, পিচ এবং ইমোশন নিয়ন্ত্রণ করুন"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>কণ্ঠ সেটিংস</span>
              </button>

              {activeWorkspace === 'chat' && (
                <>
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold btn-primary"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>নতুন চ্যাট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHistory((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                      showHistory ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="font-mono-num">{sessions.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(currentSession.id)}
                    className="p-2 rounded-full btn-secondary text-[var(--danger)]"
                    title="এই চ্যাট ডিলিট করুন"
                    aria-label="Delete current chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Expandable AI Synthesis Settings Panel (Pitch, Rate, Emotion, Gender) */}
          {showVoiceSettings && (
            <div className="surface-card rounded-2xl p-4 sm:p-5 border border-[var(--border-strong)] space-y-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
                  <Sliders className="w-4 h-4" />
                  <span>AI কণ্ঠ ও সিন্থেসিস নিয়ন্ত্রণ (Pitch, Rate & Emotion)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      speakBilingualReply(
                        activeGender === 'male'
                          ? 'السَّلَامُ عَلَيْكُمْ، أَنَا أُسْتَاذُكَ. আমি আপনাকে সাহায্য করতে প্রস্তুত।'
                          : 'السَّلَامُ عَلَيْكُمْ، أَنَا أُسْتَاذَتُكَ. আমি আপনাকে সাহায্য করতে প্রস্তুত।'
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold btn-secondary"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>কণ্ঠ পরীক্ষা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVoiceSettings(false)}
                    className="p-1.5 rounded-lg btn-secondary text-[var(--text-muted)]"
                    aria-label="Close voice settings"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender + Emotion */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[var(--text-muted)]">শিক্ষকের কণ্ঠ (Gender)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('male')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                        activeGender === 'male' ? 'btn-primary border-transparent' : 'btn-secondary border-[var(--border-subtle)]'
                      }`}
                    >
                      পুরুষ (উস্তায)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('female')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                        activeGender === 'female' ? 'btn-primary border-transparent' : 'btn-secondary border-[var(--border-subtle)]'
                      }`}
                    >
                      নারী (উস্তাধা)
                    </button>
                  </div>

                  <div className="text-xs font-semibold text-[var(--text-muted)] pt-1">
                    কথোপকথনের ভাব (Emotion Style)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['formal', 'friendly', 'encouraging'] as VoiceEmotion[]).map((em) => {
                      const active = (speechTuning.emotion || 'formal') === em;
                      const shortTitle =
                        em === 'formal' ? 'প্রামাণিক' : em === 'friendly' ? 'বন্ধুত্বপূর্ণ' : 'উৎসাহদায়ক';
                      return (
                        <button
                          key={em}
                          type="button"
                          onClick={() => handleTuningUpdate({ emotion: em })}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                            active
                              ? 'btn-primary border-transparent'
                              : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                          }`}
                          title={VOICE_EMOTION_PRESETS[em].descBn}
                        >
                          {shortTitle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rate & Pitch Sliders */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">উচ্চারণের গতি (Rate)</span>
                      <span className="font-mono-num font-bold text-[var(--accent)]">
                        {speechTuning.rateMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.35}
                      step={0.05}
                      value={speechTuning.rateMultiplier}
                      onChange={(e) => handleTuningUpdate({ rateMultiplier: Number(e.target.value) })}
                      className="w-full accent-[var(--accent)] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">স্বরের পিচ (Pitch)</span>
                      <span className="font-mono-num font-bold text-[var(--accent)]">
                        {speechTuning.pitchOffset >= 0 ? '+' : ''}
                        {speechTuning.pitchOffset.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-0.3}
                      max={0.3}
                      step={0.03}
                      value={speechTuning.pitchOffset}
                      onChange={(e) => handleTuningUpdate({ pitchOffset: Number(e.target.value) })}
                      className="w-full accent-[var(--accent)] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>গভীর (-0.30)</span>
                      <button
                        type="button"
                        onClick={() => handleTuningUpdate({ pitchOffset: 0, rateMultiplier: 1.0 })}
                        className="text-[var(--accent)] hover:underline font-semibold"
                      >
                        রিসেট
                      </button>
                      <span>তীক্ষ্ণ (+0.30)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Mode Controls Row */}
          {activeWorkspace === 'chat' && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TutorMode)}
                  aria-label="Tutor Mode"
                  className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  {MODE_LABELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {lang === 'bn' ? m.labelBn : m.labelEn}
                    </option>
                  ))}
                </select>

                <select
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  aria-label="Student Level"
                  className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="Level 1: Beginner">স্তর ১</option>
                  <option value="Level 2: Elementary">স্তর ২</option>
                  <option value="Level 3: Pre-Intermediate">স্তর ৩</option>
                  <option value="Level 4: Intermediate">স্তর ৪</option>
                  <option value="Level 5: Upper-Intermediate">স্তর ৫</option>
                  <option value="Level 6: Advanced">স্তর ৬</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoSpeakReply;
                    setAutoSpeakReply(next);
                    if (!next) handleStopSpeaking();
                  }}
                  className={`p-2 rounded-full ${autoSpeakReply ? 'btn-primary' : 'btn-secondary'}`}
                  title={autoSpeakReply ? 'অটো-ভয়েস চালু' : 'অটো-ভয়েস বন্ধ'}
                >
                  {autoSpeakReply ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setShowOrb((v) => !v)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    showOrb || liveCallActive ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{showOrb ? 'ভয়েস অরব লুকান' : 'ভয়েস অরব'}</span>
                </button>
              </div>
            </div>
          )}

          {!isOnline && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-xs sm:text-sm text-amber-800 dark:text-amber-200 font-semibold">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>অফলাইন মোড: আপনার পূর্ববর্তী চ্যাট ইতিহাস সংরক্ষিত আছে; নতুন AI উত্তরের জন্য ইন্টারনেট প্রয়োজন।</span>
            </div>
          )}

          {activeWorkspace === 'ocr' && (
            <DocumentAnalyzerPanel
              studentLevel={studentLevel}
              interfaceLang={lang}
              voiceGender={activeGender}
              voiceEmotion={speechTuning.emotion || 'formal'}
              onAwardXp={(xp, info) => awardXp(xp, info)}
              onDiscussInChat={(promptText) => {
                setActiveWorkspace('chat');
                setMode('grammar');
                setInput(promptText);
              }}
            />
          )}

          {/* Collapsible Saved Chat Sessions */}
          {activeWorkspace === 'chat' && showHistory && (
            <div className="py-3 border-b border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--accent)]">সংরক্ষিত চ্যাটসমূহ</span>
                <button
                  type="button"
                  onClick={() => {
                    const fresh = createNewSession();
                    setSessions([fresh]);
                    setActiveSessionId(fresh.id);
                    setShowHistory(false);
                  }}
                  className="text-xs text-[var(--danger)] font-semibold hover:underline"
                >
                  সব ইতিহাস মুছুন
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {sessions.map((sess) => {
                  const active = sess.id === currentSession.id;
                  return (
                    <div
                      key={sess.id}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-colors ${
                        active
                          ? 'surface-alt border-[var(--border-strong)]'
                          : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-alt)]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSessionId(sess.id);
                          setShowHistory(false);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="text-xs font-bold truncate">{sess.title}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{sess.messages.length} মেসেজ</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(sess.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] shrink-0"
                        aria-label="Delete chat session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Expandable Gemini-Live Voice Robot Orb */}
          {activeWorkspace === 'chat' && (showOrb || liveCallActive) && (
            <AiVoiceRobotOrb
              listening={listening}
              speaking={speaking}
              thinking={loading}
              liveCallActive={liveCallActive}
              liveCaption={liveCaption}
              hasError={Boolean(errorMsg)}
              voiceGender={activeGender}
              voiceLang={voiceLang}
              sttSupported={speechSupport.sttSupported}
              onToggleVoice={handleToggleLiveVoiceCall}
              onStopSpeaking={handleStopSpeaking}
              onChangeGender={handleGenderChange}
              onChangeLang={handleSwitchSpeechLang}
            />
          )}

          {/* Open, Unboxed Gemini-Style Chat Stream */}
          {activeWorkspace === 'chat' && (
          <div className="py-2 space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const arabicChunk = !isUser ? extractArabicSnippet(msg.content) : '';

              if (isUser) {
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1.5">
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-xs">
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2.5 flex flex-wrap gap-2">
                          {msg.attachments.map((att) =>
                            att.previewUrl ? (
                              <img
                                key={att.id}
                                src={att.previewUrl}
                                alt={att.name}
                                className="w-32 h-32 object-cover rounded-2xl border border-[var(--border-strong)]"
                              />
                            ) : (
                              <div
                                key={att.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold"
                              >
                                {att.mimeType === 'application/pdf' ? (
                                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />
                                )}
                                <span className="truncate max-w-[160px]">{att.name}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      <div className="text-[15.5px] sm:text-base leading-[1.7] whitespace-pre-wrap font-arabic-ui">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              }

              const showMsgTarkib = Boolean(expandedTarkibMsgIds[msg.id] && arabicChunk);

              return (
                <article
                  key={msg.id}
                  className="surface-card rounded-3xl border border-[var(--border-subtle)] p-5 sm:p-6 space-y-3.5 shadow-sm"
                >
                  {/* Small clean Gemini Sparkle Identity Line */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
                      <Sparkles className="w-4 h-4" />
                      <span>AI শিক্ষক · {activeGender === 'male' ? 'পুরুষ কণ্ঠ' : 'নারী কণ্ঠ'}</span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      আরবি শব্দে চাপলে ব্যাকরণ ও তারকিব দেখাবে
                    </span>
                  </div>

                  {/* Full-Width Gemini-Style Response Content */}
                  <GeminiRichText
                    text={msg.content}
                    className="text-[16px] sm:text-[17px] leading-[1.9] text-[var(--text-primary)] whitespace-pre-wrap font-arabic-ui"
                  />

                  {/* Clean Inline Icon Action Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <button
                      type="button"
                      onClick={() => speakBilingualReply(msg.content)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--bg-surface-alt)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
                      title="আরবি ও বাংলায় শুনুন"
                    >
                      <Volume2 className="w-4 h-4 text-[var(--accent)]" />
                      <span>শুনুন</span>
                    </button>

                    {arabicChunk && <AudioButton text={arabicChunk} showSlow compact />}

                    {arabicChunk && arabicChunk.trim().split(/\s+/).length >= 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTarkibMsgIds((prev) => ({
                            ...prev,
                            [msg.id]: !prev[msg.id],
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          showMsgTarkib
                            ? 'btn-primary'
                            : 'hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5 text-current" />
                        <span>{showMsgTarkib ? 'তারকিব লুকান' : 'বাক্যের তারকিব'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-2 rounded-full hover:bg-[var(--bg-surface-alt)] transition-colors"
                      title="কপি করুন"
                      aria-label="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSingleMessage(msg.id)}
                      className="p-2 rounded-full hover:bg-[var(--bg-surface-alt)] hover:text-[var(--danger)] transition-colors"
                      title="এই উত্তর ডিলিট করুন"
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {showMsgTarkib && arabicChunk && (
                    <SentenceTarkibCard
                      sentenceAr={arabicChunk}
                      onClose={() =>
                        setExpandedTarkibMsgIds((prev) => ({
                          ...prev,
                          [msg.id]: false,
                        }))
                      }
                    />
                  )}
                </article>
              );
            })}

            {listening && (
              <div className="flex justify-end">
                <div className="px-4 py-2.5 rounded-2xl border border-emerald-500/45 bg-emerald-500/12 text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                  {liveCaption
                    ? `"${liveCaption}"`
                    : `লাইভ ভয়েস চালু (${voiceLang === 'bn-BD' ? 'বাংলা' : voiceLang === 'ar-SA' ? 'العربية' : 'EN'})... বলুন।`}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2.5 py-2 text-sm text-[var(--text-muted)]">
                <Sparkles className="w-4 h-4 text-[var(--accent)] animate-spin" />
                <span>{lang === 'bn' ? 'AI শিক্ষক উত্তর লিখছে...' : 'AI Teacher is thinking...'}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-sm text-[var(--danger)] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={endRef} />
          </div>
          )}
        </div>

        {/* Sticky Floating Gemini-Style Pill Composer */}
        {activeWorkspace === 'chat' && (
        <div className="sticky bottom-18 lg:bottom-4 z-20 pt-2">
          {/* Pending Image / PDF Previews */}
          {pendingAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl surface-card border border-[var(--border-strong)] text-xs shadow-md"
                >
                  {att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate max-w-[140px]">{att.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono-num">
                      {(att.sizeBytes / 1024).toFixed(0)} KB · {att.mimeType === 'application/pdf' ? 'PDF' : 'Image'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(att.id)}
                    className="p-1 rounded-full hover:bg-[var(--danger)]/15 text-[var(--text-muted)] hover:text-[var(--danger)]"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Continuous Speech Language Selector Bar above pill when dictating or hovering */}
          <div className="flex items-center justify-between gap-2 px-2 mb-1.5 text-[11px]">
            <div className="inline-flex items-center gap-1 rounded-full surface-card px-1.5 py-0.5 border border-[var(--border-subtle)] shadow-xs">
              <span className="px-1.5 text-[var(--text-muted)] font-semibold">ভয়েস ভাষা:</span>
              {(
                [
                  { id: 'bn-BD', label: 'বাংলা' },
                  { id: 'ar-SA', label: 'العربية' },
                  { id: 'en-US', label: 'EN' },
                ] as const
              ).map((lItem) => (
                <button
                  key={lItem.id}
                  type="button"
                  onClick={() => handleSwitchSpeechLang(lItem.id)}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                    voiceLang === lItem.id
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]'
                  }`}
                >
                  {lItem.label}
                </button>
              ))}
            </div>

            {dictationActive && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold animate-pulse">
                ধারাবাহিকভাবে শুনছে... বলুন
              </span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(undefined, false);
            }}
            className="surface-card rounded-[28px] border border-[var(--border-strong)] shadow-xl px-2.5 py-2 flex items-center gap-1.5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => void handleFilesSelected(e.target.files)}
            />

            {/* Gemini '+' Upload Image/PDF Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || pendingAttachments.length >= 3}
              title="বইয়ের ছবি বা PDF আপলোড করুন"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)] shrink-0 disabled:opacity-40 transition-colors"
              aria-label="Upload Image or PDF"
            >
              <Plus className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                pendingAttachments.length > 0
                  ? 'এই ছবি বা PDF থেকে কী বুঝবেন লিখুন...'
                  : dictationActive
                  ? `${voiceLang === 'bn-BD' ? 'বাংলায়' : 'আরবিতে'} স্বাভাবিকভাবে বলুন...`
                  : lang === 'bn'
                  ? 'AI শিক্ষককে জিজ্ঞাসা করুন...'
                  : 'Ask AI Teacher...'
              }
              className="flex-1 min-w-0 px-2 py-2 bg-transparent text-[15px] sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />

            {/* Continuous Real-Time Dictation Mic */}
            <button
              type="button"
              onClick={() => handleToggleContinuousDictation()}
              disabled={!speechSupport.sttSupported}
              title={dictationActive ? 'মাইক্রোফোন বন্ধ করুন' : `ধারাবাহিক ভয়েস টাইপিং (${voiceLang === 'bn-BD' ? 'বাংলা' : 'আরবি'})`}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${
                dictationActive
                  ? 'bg-emerald-500 text-white animate-pulse shadow-md'
                  : 'hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)]'
              }`}
              aria-label="Continuous voice dictation"
            >
              {dictationActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Rightmost Action: Send if typing/attaching, else Gemini Live Soundwave Call button */}
            {input.trim() || pendingAttachments.length > 0 ? (
              <button
                type="submit"
                disabled={loading}
                className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shrink-0 shadow-md disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleLiveVoiceCall}
                disabled={!speechSupport.sttSupported}
                title={liveCallActive ? 'লাইভ ভয়েস কল বন্ধ করুন' : 'লাইভ ভয়েস কথোপকথন শুরু করুন'}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all disabled:opacity-40 ${
                  liveCallActive || listening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[var(--emerald-highlight)] text-[var(--accent)] hover:opacity-90'
                }`}
                aria-label="Toggle Gemini Live Voice Call"
              >
                <AudioLines className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
        )}
      </div>
    </AppShell>
  );
};
