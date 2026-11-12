import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { getSpeechSupport, RecognitionHandle, speakText, startVoiceRecognition, stopArabicSpeech } from '../utils/speech';

type TutorMode =
  | 'chat'
  | 'voice-dialogue'
  | 'translate-ar-bn'
  | 'translate-bn-ar'
  | 'grammar'
  | 'correct-writing'
  | 'quiz';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: TutorMode;
  timestamp: string;
}

const CHAT_STORAGE_KEY = 'aaa_ai_teacher_history_v1';

const MODE_LABELS: { id: TutorMode; labelBn: string; labelEn: string }[] = [
  { id: 'voice-dialogue', labelBn: 'ভয়েস কথোপকথন (AI Talk)', labelEn: 'Voice Conversation' },
  { id: 'chat', labelBn: 'সাধারণ আরবি শিক্ষক', labelEn: 'General Tutor' },
  { id: 'translate-ar-bn', labelBn: 'আরবি → বাংলা', labelEn: 'Arabic → Bengali' },
  { id: 'translate-bn-ar', labelBn: 'বাংলা → আরবি', labelEn: 'Bengali → Arabic' },
  { id: 'grammar', labelBn: 'নাহু ও ছরফ', labelEn: 'Nahw & Sarf' },
  { id: 'correct-writing', labelBn: 'লেখা সংশোধন', labelEn: 'Writing Check' },
  { id: 'quiz', labelBn: 'AI কুইজ', labelEn: 'Generate Quiz' },
];

const STARTER_PROMPTS = [
  'السَّلَامُ عَلَيْكُمْ — আমার সাথে আরবিতে সহজ কথোপকথন শুরু করুন।',
  'মাদি ও মুদারি ক্রিয়ার পার্থক্য উদাহরণসহ বাংলায় বুঝিয়ে দিন।',
  '"আমি মসজিদে যাচ্ছি" বাক্যটির শুদ্ধ আরবি ও উচ্চারণ কী হবে?',
  'আল-আরাবিয়্যাতু বাইনা ইয়াদাইক থেকে সালাম ও পরিচিতির সংলাপ অনুশীলন করান।',
];

function extractArabicSnippet(text: string): string {
  const matches = text.match(/[\u0600-\u06FF][\u0600-\u06FF\s،؟.!]{2,}/g);
  return matches ? matches.slice(0, 4).join(' ') : '';
}

export const AiTeacherPage: React.FC = () => {
  const { t, lang, awardXp, currentLevelNumber } = useApp();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<TutorMode>('voice-dialogue');
  const [studentLevel, setStudentLevel] = useState(`Level ${currentLevelNumber}`);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice conversation state
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'ar-SA' | 'en-US'>('bn-BD');
  const [autoSpeakReply, setAutoSpeakReply] = useState(true);
  const [listening, setListening] = useState(false);
  const [speechSupport] = useState(() => getSpeechSupport());
  const recRef = useRef<RecognitionHandle | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ChatMessage[];
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        mode: 'voice-dialogue',
        timestamp: new Date().toISOString(),
        content:
          'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ!\n\nআসসালামু আলাইকুম। আমি আপনার AI আরবি স্যার। আপনি নিচের লাল মাইক্রোফোন বাটনে চেপে বাংলা বা আরবিতে সরাসরি ভয়েসে কথা বলতে পারেন, অথবা লিখেও প্রশ্ন করতে পারেন!',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    const initialQ = searchParams.get('q');
    if (initialQ) {
      setInput(initialQ);
    }
    return () => {
      recRef.current?.stop();
      stopArabicSpeech();
    };
  }, [searchParams]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakAiMessage = (replyText: string) => {
    const arabicPart = extractArabicSnippet(replyText);
    if (arabicPart) {
      speakText(arabicPart, 'ar-SA');
    } else if (voiceLang === 'bn-BD') {
      speakText(replyText.slice(0, 280), 'bn-BD');
    } else {
      speakText(replyText.slice(0, 280), 'en-US');
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    setErrorMsg(null);
    const effectiveMode = mode === 'voice-dialogue' ? 'chat' : mode;
    const contextNote =
      mode === 'voice-dialogue'
        ? 'The student is in interactive Voice Conversation mode. Keep the response natural, encouraging, concise (2-4 Arabic sentences with full Harakat + Bengali pronunciation + Bengali meaning), and end with one simple Arabic follow-up question for the student to answer by voice.'
        : undefined;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      mode,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          mode: effectiveMode,
          level: studentLevel,
          interfaceLang: lang,
          context: contextNote,
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

      setMessages((prev) => [...prev, assistantMsg]);
      if (autoSpeakReply) {
        speakAiMessage(data.reply);
      }

      awardXp(10, {
        titleBn: mode === 'voice-dialogue' ? 'AI স্যারের সাথে ভয়েস কথোপকথন' : 'AI শিক্ষকের সাথে আরবি চর্চা',
        titleEn: 'Practiced Arabic with AI Teacher',
        type: 'ai',
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error connecting to AI Teacher.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = () => {
    setErrorMsg(null);
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    stopArabicSpeech();
    setListening(true);
    let latestTranscript = '';

    const handle = startVoiceRecognition(voiceLang, {
      onResult: (transcript, isFinal) => {
        latestTranscript = transcript;
        setInput(transcript);
        if (isFinal && transcript.trim()) {
          recRef.current?.stop();
          setListening(false);
          sendMessage(transcript.trim());
          setInput('');
        }
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setListening(false);
      },
      onEnd: () => {
        setListening(false);
        if (latestTranscript.trim() && !loading) {
          // If browser ended cleanly without firing final flag on last chunk
        }
      },
    });

    if (!handle) {
      setListening(false);
    } else {
      recRef.current = handle;
    }
  };

  const handleClearChat = () => {
    stopArabicSpeech();
    const initial: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      mode: 'voice-dialogue',
      timestamp: new Date().toISOString(),
      content: 'السَّلَامُ عَلَيْكُمْ! চ্যাট ইতিহাস পরিষ্কার করা হয়েছে। মাইক্রোফোনে কথা বলুন বা নতুন প্রশ্ন লিখুন।',
    };
    setMessages([initial]);
    setErrorMsg(null);
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
          ? 'ভয়েস ও টেক্সটে সরাসরি AI আরবি স্যারের সাথে কথা বলুন — বাংলা, আরবি ও ইংরেজিতে'
          : 'Talk by voice or text with your Gemini AI Arabic Teacher'
      }
    >
      <div className="space-y-5">
        {/* Controls Toolbar */}
        <div className="surface-card rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {MODE_LABELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    mode === m.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {lang === 'bn' ? m.labelBn : m.labelEn}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !autoSpeakReply;
                  setAutoSpeakReply(next);
                  if (!next) stopArabicSpeech();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  autoSpeakReply ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {autoSpeakReply ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{autoSpeakReply ? 'অটো-ভয়েস চালু' : 'অটো-ভয়েস বন্ধ'}</span>
              </button>

              <select
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value)}
                aria-label="Student Level"
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                <option value="Level 1: Beginner">Beginner (Level 1)</option>
                <option value="Level 2: Elementary">Elementary (Level 2)</option>
                <option value="Level 3: Pre-Intermediate">Pre-Intermediate (Level 3)</option>
                <option value="Level 4: Intermediate">Intermediate (Level 4)</option>
                <option value="Level 5: Upper-Intermediate">Upper-Intermediate (Level 5)</option>
                <option value="Level 6: Advanced">Advanced (Level 6)</option>
              </select>

              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-secondary"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মুছুন' : 'Clear'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)]">ভয়েস বলার ভাষা:</span>
              {(
                [
                  { code: 'bn-BD', label: 'বাংলা' },
                  { code: 'ar-SA', label: 'العربية (আরবি)' },
                  { code: 'en-US', label: 'English' },
                ] as const
              ).map((vl) => (
                <button
                  key={vl.code}
                  type="button"
                  onClick={() => setVoiceLang(vl.code)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    voiceLang === vl.code ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {vl.label}
                </button>
              ))}
            </div>

            {!speechSupport.sttSupported && (
              <span className="text-xs text-[var(--warning)]">
                ভয়েস ইনপুটের জন্য Chrome বা Edge ব্যবহার করুন
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">
              {lang === 'bn' ? 'দ্রুত শুরু:' : 'Starter Prompts:'}
            </span>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="px-2.5 py-1 rounded-md btn-secondary text-left truncate max-w-[260px]"
                title={prompt}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream */}
        <div className="surface-card rounded-2xl flex flex-col h-[520px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const arabicChunk = !isUser ? extractArabicSnippet(msg.content) : '';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-medium'
                        : 'surface-alt text-[var(--text-primary)]'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] mb-2">
                        <Bot className="w-4 h-4" />
                        <span>AI স্যার (Ustadh AI)</span>
                      </div>
                    )}
                    <div className="font-arabic-ui">{msg.content}</div>
                  </div>

                  {!isUser && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {arabicChunk && <AudioButton text={arabicChunk} showSlow compact />}
                      <button
                        type="button"
                        onClick={() => speakText(msg.content.slice(0, 350), 'bn-BD')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs btn-secondary"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>বাংলায় শুনুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs btn-secondary"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {listening && (
              <div className="flex items-end flex-col">
                <div className="px-4 py-2.5 rounded-xl border border-[var(--danger)]/50 bg-[var(--danger)]/10 text-xs text-[var(--danger)] font-medium">
                  আমি আপনার কথা শুনছি ({voiceLang})... স্পষ্টভাবে বলুন।
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-start">
                <div className="surface-alt rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]">
                  {lang === 'bn' ? 'AI স্যার উত্তর প্রস্তুত করছেন...' : 'Ustadh AI is responding...'}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-sm text-[var(--danger)] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input Composer with Prominent Voice Mic Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-[var(--border-subtle)] p-3 sm:p-4 flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={!speechSupport.sttSupported}
              title={listening ? 'থামান' : 'ভয়েসে কথা বলুন'}
              className={`p-3 rounded-xl shrink-0 transition-colors disabled:opacity-40 ${
                listening
                  ? 'bg-[var(--danger)] text-white'
                  : 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
              }`}
              aria-label="Voice Input"
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'বাংলা বা আরবিতে লিখুন অথবা লাল মাইক চেপে কথা বলুন...'
                  : 'Type or tap the mic to talk with AI...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-primary disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};
