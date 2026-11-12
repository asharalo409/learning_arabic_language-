import React, { useState } from 'react';
import { Bot, MessageSquarePlus, Mic, MicOff, Send, Sparkles, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AudioButton } from './AudioButton';
import { speakText, startVoiceRecognition, stopArabicSpeech } from '../utils/speech';

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
    content: `السَّلَامُ عَلَيْكُمْ!\n\nআমি এখন শুধুমাত্র "${lessonTitle}" পাঠটি নিয়ে আপনার সাথে চর্চা করছি। প্রশ্ন লিখুন বা মাইকে বলুন।`,
  });

  const [messages, setMessages] = useState<PracticeMsg[]>([makeWelcomeMsg()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const activeGender = progress.voiceGender === 'female' ? 'female' : 'male';

  const handleResetChat = () => {
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

    const userMsg: PracticeMsg = { id: `u-${Date.now()}`, role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'conversation',
          level: levelLabel,
          interfaceLang: lang,
          context: `STRICT LESSON SCOPE: You must ONLY practice, explain, and quiz the student on "${lessonTitle}". Do NOT drift to unrelated chapters or generic greetings outside this lesson.\n\nLESSON MATERIAL:\n${lessonScopeContext}\n\nInstruction: Praise or correct the student in clear Bengali, give vowelized Arabic (full Harakat) + Bengali pronunciation + Bengali meaning, and ask ONE short follow-up question strictly from this lesson.`,
          message: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply = data.reply || data.error || 'উত্তর পাওয়া যায়নি।';

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
      const arabicMatches = reply.match(/[\u0600-\u06FF][\u0600-\u06FF\s،؟.!]{2,}/g);
      const speechChunk = arabicMatches ? arabicMatches.slice(0, 3).join(' ') : reply.slice(0, 240);
      speakText(speechChunk, arabicMatches ? 'ar-SA' : 'bn-BD', {
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

  const handleVoiceMic = () => {
    if (listening) return;
    stopArabicSpeech();
    setListening(true);
    startVoiceRecognition('ar-SA', {
      onResult: (transcript) => {
        setListening(false);
        setInput(transcript);
        void sendScopedQuery(transcript);
      },
      onError: (msg) => {
        setListening(false);
        setMessages((prev) => [...prev, { id: `micerr-${Date.now()}`, role: 'assistant', content: msg }]);
      },
      onEnd: () => setListening(false),
    });
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
    <div className="surface-card rounded-2xl p-4 sm:p-5 space-y-4 border border-[var(--border-subtle)]">
      {/* Clean Single-Row Header with New Chat & Delete Chat */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              listening
                ? 'bg-emerald-500 text-white animate-pulse'
                : speaking
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--emerald-highlight)] text-[var(--accent)]'
            }`}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-[var(--accent)]">পাঠ-কেন্দ্রিক AI</div>
            <div className="text-xs font-semibold truncate">{lessonTitle}</div>
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] btn-secondary text-[var(--danger)]"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>থামান</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium btn-secondary"
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium btn-secondary text-[var(--danger)]"
            title="সব মেসেজ ডিলিট করুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ডিলিট</span>
          </button>
        </div>
      </div>

      {/* Compact Single-Line Horizontal Quick Action Strip (No giant wrapping boxes) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {shortPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => void sendScopedQuery(p.query)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-secondary whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3 h-3 text-[var(--accent)]" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Clean Messages Stream */}
      <div className="space-y-3 max-h-[340px] overflow-y-auto pe-1">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">
            চ্যাট মুছে ফেলা হয়েছে। উপরের অপশন বা নিচে লিখে নতুন চর্চা শুরু করুন।
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            const arabicPart = !isUser
              ? (m.content.match(/[\u0600-\u06FF][\u0600-\u06FF\s،؟.!]{2,}/g) || []).slice(0, 3).join(' ')
              : '';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[92%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-medium' : 'surface-alt'
                  }`}
                >
                  <div className="font-arabic-ui">{m.content}</div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {!isUser && arabicPart && <AudioButton text={arabicPart} compact showSlow={false} />}
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() =>
                        speakText(m.content.slice(0, 260), 'bn-BD', {
                          voiceGender: activeGender,
                          onStart: () => setSpeaking(true),
                          onEnd: () => setSpeaking(false),
                        })
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] btn-secondary"
                    >
                      <Volume2 className="w-3 h-3 text-[var(--accent)]" />
                      <span>শুনুন</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMsg(m.id)}
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                    title="এই মেসেজ ডিলিট করুন"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="surface-alt rounded-2xl px-4 py-2.5 text-xs text-[var(--text-muted)] w-fit">
            উত্তর প্রস্তুত হচ্ছে...
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendScopedQuery();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]"
      >
        <button
          type="button"
          onClick={handleVoiceMic}
          className={`p-2.5 rounded-xl shrink-0 transition-colors ${
            listening ? 'bg-emerald-500 text-white' : 'btn-secondary'
          }`}
          title="মাইক্রোফোনে আরবি বলুন"
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent)]" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="এই পাঠ সম্পর্কে লিখুন..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-bold btn-primary inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
