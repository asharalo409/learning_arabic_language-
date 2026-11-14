import React, { useRef, useState } from 'react';
import {
  Bot,
  GitBranch,
  MessageSquarePlus,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AudioButton } from './AudioButton';
import { GeminiRichText } from './GeminiRichText';
import { SentenceTarkibCard } from './SentenceTarkibCard';
import {
  RecognitionHandle,
  speakBilingualText,
  startContinuousSpeechRecognition,
  stopArabicSpeech,
} from '../utils/speech';

export interface LessonAiPracticePanelProps {
  lessonTitle: string;
  lessonScopeContext: string;
  starterQuestions?: string[];
  levelLabel?: string;
}

interface PracticeMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const LessonAiPracticePanel: React.FC<LessonAiPracticePanelProps> = ({
  lessonTitle,
  lessonScopeContext,
  starterQuestions = [],
  levelLabel = 'Structured Lesson Practice',
}) => {
  const { lang, progress, awardXp } = useApp();
  const makeWelcomeMsg = (): PracticeMsg => ({
    id: `scoped-welcome-${Date.now()}`,
    role: 'assistant',
    content: `السَّلَامُ عَلَيْكُمْ!\n\nআমি এখন শুধুমাত্র "${lessonTitle}" পাঠটি নিয়ে আপনার সাথে চর্চা করছি। নিচে বাংলা বা আরবিতে প্রশ্ন লিখুন অথবা মাইক্রোফোনে সরাসরি বলুন।`,
  });

  const [messages, setMessages] = useState<PracticeMsg[]>([makeWelcomeMsg()]);
  const [input, setInput] = useState('');
  const [speechLang, setSpeechLang] = useState<'bn-BD' | 'ar-SA'>('bn-BD');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [expandedTarkibIds, setExpandedTarkibIds] = useState<Record<string, boolean>>({});
  const recRef = useRef<RecognitionHandle | null>(null);
  const baseInputRef = useRef('');

  const activeGender = progress.voiceGender === 'female' ? 'female' : 'male';

  const handleResetChat = () => {
    recRef.current?.stop();
    setListening(false);
    stopArabicSpeech();
    setSpeaking(false);
    setMessages([makeWelcomeMsg()]);
  };

  const handleDeleteMsg = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const sendScopedQuery = async (textOverride?: string) => {
    const query = (textOverride ?? input).trim();
    if (!query || loading) return;
    if (!textOverride) setInput('');
    if (listening) {
      recRef.current?.stop();
      setListening(false);
    }

    const userMsg: PracticeMsg = { id: `u-${Date.now()}`, role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'live-voice',
          level: levelLabel,
          interfaceLang: lang,
          voiceGender: activeGender,
          context: `STRICT LESSON SCOPE: You must ONLY practice, explain, and quiz the student on "${lessonTitle}". Do NOT drift to unrelated chapters or generic greetings outside this lesson.\n\nLESSON MATERIAL:\n${lessonScopeContext}\n\nInstruction: Always correct any Arabic mistake cleanly first, give vowelized Arabic (full Harakat) + Bengali meaning, and ask ONE short follow-up question strictly from this lesson.`,
          message: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply = data.reply || data.error || 'উত্তর পাওয়া যায়নি।';

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
      speakBilingualText(reply, {
        fallbackLang: 'bn-BD',
        voiceGender: activeGender,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });

      awardXp(15, {
        titleBn: `পাঠভিত্তিক AI চর্চা: ${lessonTitle}`,
        titleEn: `Lesson AI Practice: ${lessonTitle}`,
        type: 'ai',
      });
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err instanceof Error ? err.message : 'AI সংযোগে সাময়িক সমস্যা হয়েছে।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoiceMic = (overrideLang?: 'bn-BD' | 'ar-SA') => {
    const targetLang = overrideLang || speechLang;
    if (listening && !overrideLang) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    recRef.current?.stop();
    stopArabicSpeech();
    baseInputRef.current = input.trim();
    setListening(true);

    const handle = startContinuousSpeechRecognition(targetLang, {
      onTranscript: ({ fullText }) => {
        setInput([baseInputRef.current, fullText].filter(Boolean).join(' '));
      },
      onError: (msg) => {
        setListening(false);
        setMessages((prev) => [...prev, { id: `micerr-${Date.now()}`, role: 'assistant', content: msg }]);
      },
      onEnd: () => setListening(false),
    });

    if (!handle) {
      setListening(false);
    } else {
      recRef.current = handle;
    }
  };

  const shortPrompts =
    starterQuestions.length > 0
      ? [
          { label: 'শব্দ পরীক্ষা', query: starterQuestions[0] },
          { label: 'সংলাপ অনুবাদ', query: starterQuestions[1] || starterQuestions[0] },
          { label: 'ব্যাকরণ প্রশ্ন', query: starterQuestions[2] || starterQuestions[0] },
        ]
      : [
          { label: 'শব্দ পরীক্ষা', query: `"${lessonTitle}" পাঠের নতুন শব্দগুলো দিয়ে আমাকে ১টি প্রশ্ন করুন।` },
          { label: 'সংলাপ অনুবাদ', query: `এই পাঠের সংলাপ থেকে ১টি আরবি বাক্য দিন, আমি অর্থ বলব।` },
          { label: 'ব্যাকরণ চর্চা', query: `এই পাঠের ব্যাকরণ নিয়ম অনুযায়ী আমাকে ১টি অনুশীলন দিন।` },
        ];

  return (
    <div className="space-y-4">
      {/* Flat Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-5 h-5 text-[var(--accent)] shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-[var(--accent)]">পাঠ-কেন্দ্রিক AI চর্চা</span>
            <span className="text-xs text-[var(--text-muted)] ms-2 truncate">· {lessonTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {speaking && (
            <button
              type="button"
              onClick={() => {
                stopArabicSpeech();
                setSpeaking(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs btn-secondary text-[var(--danger)]"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>থামান</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold btn-secondary"
            title="নতুন চ্যাট শুরু করুন"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>নতুন চ্যাট</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopArabicSpeech();
              setSpeaking(false);
              setMessages([]);
            }}
            className="p-2 rounded-full btn-secondary text-[var(--danger)]"
            title="সব মেসেজ ডিলিট করুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Starter Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {shortPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => void sendScopedQuery(p.query)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold btn-secondary whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3 h-3 text-[var(--accent)]" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Open Unboxed Gemini-Style Messages */}
      <div className="space-y-5 py-2">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">
            চ্যাট মুছে ফেলা হয়েছে। উপরের অপশন বা নিচে লিখে নতুন চর্চা শুরু করুন।
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            const arabicPart = !isUser
              ? (m.content.match(/[\u0600-\u06FF][\u0600-\u06FF\s،؟.!]{2,}/g) || []).slice(0, 3).join(' ')
              : '';
            if (isUser) {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-3xl px-4 py-2.5 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[15px] leading-relaxed whitespace-pre-wrap font-arabic-ui">
                    {m.content}
                  </div>
                </div>
              );
            }
            const showTarkib = Boolean(expandedTarkibIds[m.id] && arabicPart);
            return (
              <article
                key={m.id}
                className="surface-card rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3"
              >
                <GeminiRichText
                  text={m.content}
                  className="text-[15.5px] sm:text-base leading-[1.85] text-[var(--text-primary)] whitespace-pre-wrap font-arabic-ui"
                />
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {arabicPart && <AudioButton text={arabicPart} compact showSlow={false} />}
                  <button
                    type="button"
                    onClick={() =>
                      speakBilingualText(m.content, {
                        fallbackLang: 'bn-BD',
                        voiceGender: activeGender,
                        onStart: () => setSpeaking(true),
                        onEnd: () => setSpeaking(false),
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[var(--bg-surface-alt)] text-xs font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>শুনুন</span>
                  </button>
                  {arabicPart && arabicPart.trim().split(/\s+/).length >= 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTarkibIds((prev) => ({
                          ...prev,
                          [m.id]: !prev[m.id],
                        }))
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        showTarkib ? 'btn-primary' : 'hover:bg-[var(--bg-surface-alt)]'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{showTarkib ? 'তারকিব লুকান' : 'তারকিব'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMsg(m.id)}
                    className="p-1.5 rounded-full hover:text-[var(--danger)] transition-colors"
                    title="এই মেসেজ ডিলিট করুন"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {showTarkib && arabicPart && (
                  <SentenceTarkibCard
                    sentenceAr={arabicPart}
                    onClose={() =>
                      setExpandedTarkibIds((prev) => ({
                        ...prev,
                        [m.id]: false,
                      }))
                    }
                  />
                )}
              </article>
            );
          })
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)] animate-spin" />
            <span>উত্তর প্রস্তুত হচ্ছে...</span>
          </div>
        )}
      </div>

      {/* Gemini Pill Composer with Continuous Bilingual Mic */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[var(--text-muted)]">ভয়েস:</span>
          <button
            type="button"
            onClick={() => {
              setSpeechLang('bn-BD');
              if (listening) handleToggleVoiceMic('bn-BD');
            }}
            className={`px-2 py-0.5 rounded-full font-bold ${
              speechLang === 'bn-BD' ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'btn-secondary'
            }`}
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => {
              setSpeechLang('ar-SA');
              if (listening) handleToggleVoiceMic('ar-SA');
            }}
            className={`px-2 py-0.5 rounded-full font-bold ${
              speechLang === 'ar-SA' ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'btn-secondary'
            }`}
          >
            العربية
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendScopedQuery();
          }}
          className="surface-alt rounded-full border border-[var(--border-strong)] px-2.5 py-1.5 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => handleToggleVoiceMic()}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              listening ? 'bg-emerald-500 text-white animate-pulse' : 'hover:bg-[var(--bg-surface)] text-[var(--text-primary)]'
            }`}
            title="মাইক্রোফোনে বাংলা বা আরবি বলুন"
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent)]" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? 'বলুন, আমি শুনছি...' : 'এই পাঠ সম্পর্কে লিখুন...'}
            className="flex-1 min-w-0 px-1 py-2 bg-transparent text-[15px] focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-full btn-primary flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
