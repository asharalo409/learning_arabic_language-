import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  History,
  MessageSquarePlus,
  Mic,
  MicOff,
  Send,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { AiVoiceRobotOrb } from '../components/AiVoiceRobotOrb';
import { useApp } from '../context/AppContext';
import { VoiceGender } from '../types/academy';
import { getSpeechSupport, RecognitionHandle, speakText, startVoiceRecognition, stopArabicSpeech } from '../utils/speech';

type TutorMode =
  | 'voice-dialogue'
  | 'chat'
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

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const SESSIONS_STORAGE_KEY = 'aaa_ai_teacher_sessions_v2';
const ACTIVE_SESSION_KEY = 'aaa_ai_teacher_active_session_v2';

const MODE_LABELS: { id: TutorMode; labelBn: string; labelEn: string }[] = [
  { id: 'voice-dialogue', labelBn: 'ভয়েস রোবট সংলাপ', labelEn: 'Voice Conversation' },
  { id: 'chat', labelBn: 'সাধারণ আরবি শিক্ষক', labelEn: 'General Tutor' },
  { id: 'translate-ar-bn', labelBn: 'আরবি → বাংলা', labelEn: 'Arabic → Bengali' },
  { id: 'translate-bn-ar', labelBn: 'বাংলা → আরবি', labelEn: 'Bengali → Arabic' },
  { id: 'grammar', labelBn: 'নাহু ও ছরফ', labelEn: 'Nahw & Sarf' },
  { id: 'correct-writing', labelBn: 'লেখা সংশোধন', labelEn: 'Writing Check' },
  { id: 'quiz', labelBn: 'AI কুইজ', labelEn: 'Generate Quiz' },
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
          'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ!\n\nআসসালামু আলাইকুম। আমি আপনার AI আরবি শিক্ষক। মাইকে কথা বলুন অথবা নিচে বাংলা/আরবিতে প্রশ্ন লিখুন।',
      },
    ],
  };
}

function extractArabicSnippet(text: string): string {
  const matches = text.match(/[\u0600-\u06FF][\u0600-\u06FF\s،؟.!]{2,}/g);
  return matches ? matches.slice(0, 4).join(' ') : '';
}

export const AiTeacherPage: React.FC = () => {
  const { t, lang, awardXp, currentLevelNumber, progress, updateProfile } = useApp();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<TutorMode>('voice-dialogue');
  const [studentLevel, setStudentLevel] = useState(`Level ${currentLevelNumber}`);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showOrb, setShowOrb] = useState(true);

  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'ar-SA' | 'en-US'>('bn-BD');
  const [autoSpeakReply, setAutoSpeakReply] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechSupport] = useState(() => getSpeechSupport());
  const recRef = useRef<RecognitionHandle | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const activeGender: VoiceGender = progress.voiceGender === 'female' ? 'female' : 'male';

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

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions.slice(0, 25)));
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
      recRef.current?.stop();
      stopArabicSpeech();
    };
  }, [searchParams]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  const updateCurrentSessionMessages = (updater: (prev: ChatMessage[]) => ChatMessage[], newTitle?: string) => {
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
  };

  const handleStartNewChat = () => {
    stopArabicSpeech();
    setSpeaking(false);
    setErrorMsg(null);
    const fresh = createNewSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    stopArabicSpeech();
    setSpeaking(false);
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

  const speakAiMessage = (replyText: string, genderOverride?: VoiceGender) => {
    const arabicPart = extractArabicSnippet(replyText);
    const chosenGender = genderOverride || activeGender;
    const callbacks = {
      voiceGender: chosenGender,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    };

    if (arabicPart) {
      speakText(arabicPart, 'ar-SA', callbacks);
    } else if (voiceLang === 'bn-BD') {
      speakText(replyText.slice(0, 280), 'bn-BD', callbacks);
    } else {
      speakText(replyText.slice(0, 280), 'en-US', callbacks);
    }
  };

  const handleStopSpeaking = () => {
    stopArabicSpeech();
    setSpeaking(false);
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

    const nextTitle =
      currentSession.title === 'নতুন আরবি চ্যাট' ? query.slice(0, 34) + (query.length > 34 ? '...' : '') : undefined;

    const nextMessages = [...messages, userMsg];
    updateCurrentSessionMessages(() => nextMessages, nextTitle);
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

      updateCurrentSessionMessages((prev) => [...prev, assistantMsg]);
      if (autoSpeakReply) {
        speakAiMessage(data.reply);
      }

      awardXp(10, {
        titleBn: mode === 'voice-dialogue' ? 'AI রোবটের সাথে ভয়েস কথোপকথন' : 'AI শিক্ষকের সাথে আরবি চর্চা',
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

    handleStopSpeaking();
    setListening(true);

    const handle = startVoiceRecognition(voiceLang, {
      onResult: (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal && transcript.trim()) {
          recRef.current?.stop();
          setListening(false);
          void sendMessage(transcript.trim());
          setInput('');
        }
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setListening(false);
      },
      onEnd: () => {
        setListening(false);
      },
    });

    if (!handle) {
      setListening(false);
    } else {
      recRef.current = handle;
    }
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
          ? 'ভয়েস রোবট ও মাল্টি-চ্যাট সহ সরাসরি AI আরবি শিক্ষক'
          : 'Talk by voice or text with your AI Arabic Teacher'
      }
    >
      <div className="space-y-4">
        {/* Top Clean Action Bar: New Chat, History, Delete Chat, Mode & Voice */}
        <div className="surface-card rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold btn-primary"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>+ নতুন চ্যাট</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                showHistory ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>চ্যাট তালিকা ({sessions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeleteSession(currentSession.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold btn-secondary text-[var(--danger)]"
              title="বর্তমান চ্যাট ডিলিট করুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>এই চ্যাট ডিলিট</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as TutorMode)}
              aria-label="Tutor Mode"
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
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
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value="Level 1: Beginner">স্তর ১ (Beginner)</option>
              <option value="Level 2: Elementary">স্তর ২ (Elementary)</option>
              <option value="Level 3: Pre-Intermediate">স্তর ৩ (Pre-Int.)</option>
              <option value="Level 4: Intermediate">স্তর ৪ (Intermediate)</option>
              <option value="Level 5: Upper-Intermediate">স্তর ৫ (Upper-Int.)</option>
              <option value="Level 6: Advanced">স্তর ৬ (Advanced)</option>
            </select>

            <button
              type="button"
              onClick={() => {
                const next = !autoSpeakReply;
                setAutoSpeakReply(next);
                if (!next) handleStopSpeaking();
              }}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold ${
                autoSpeakReply ? 'btn-primary' : 'btn-secondary'
              }`}
              title="অটো-ভয়েস চালু/বন্ধ"
            >
              {autoSpeakReply ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{autoSpeakReply ? 'ভয়েস চালু' : 'ভয়েস বন্ধ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOrb((v) => !v)}
              className="px-3 py-2 rounded-xl text-xs font-semibold btn-secondary"
            >
              {showOrb ? 'রোবট লুকান' : 'রোবট দেখান'}
            </button>
          </div>
        </div>

        {/* Collapsible Saved Chat Sessions List (Switch or Delete any thread) */}
        {showHistory && (
          <div className="surface-card rounded-2xl p-4 space-y-2.5 border border-[var(--border-strong)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--accent)]">সংরক্ষিত চ্যাটসমূহ</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
              {sessions.map((sess) => {
                const active = sess.id === currentSession.id;
                return (
                  <div
                    key={sess.id}
                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-colors ${
                      active
                        ? 'surface-alt border-[var(--border-strong)]'
                        : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)]'
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
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {sess.messages.length} মেসেজ
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(sess.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 shrink-0"
                      aria-label="Delete chat session"
                      title="এই চ্যাট ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Expressive Voice Robot Orb */}
        {showOrb && (
          <AiVoiceRobotOrb
            listening={listening}
            speaking={speaking}
            thinking={loading}
            hasError={Boolean(errorMsg)}
            voiceGender={activeGender}
            voiceLang={voiceLang}
            sttSupported={speechSupport.sttSupported}
            onToggleVoice={handleToggleVoice}
            onStopSpeaking={handleStopSpeaking}
            onChangeGender={handleGenderChange}
            onChangeLang={setVoiceLang}
          />
        )}

        {/* Clean Chat Stream */}
        <div className="surface-card rounded-2xl flex flex-col h-[460px]">
          <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)] truncate">{currentSession.title}</span>
            <span>{messages.length} মেসেজ</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const arabicChunk = !isUser ? extractArabicSnippet(msg.content) : '';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
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
                        <span>AI শিক্ষক ({activeGender === 'male' ? 'পুরুষ কণ্ঠ' : 'নারী কণ্ঠ'})</span>
                      </div>
                    )}
                    <div className="font-arabic-ui">{msg.content}</div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {!isUser && arabicChunk && <AudioButton text={arabicChunk} showSlow compact />}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() =>
                          speakText(msg.content.slice(0, 350), 'bn-BD', {
                            voiceGender: activeGender,
                            onStart: () => setSpeaking(true),
                            onEnd: () => setSpeaking(false),
                            onError: () => setSpeaking(false),
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs btn-secondary"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>বাংলায় শুনুন</span>
                      </button>
                    )}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs btn-secondary"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleMessage(msg.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                      title="এই মেসেজ ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                  {lang === 'bn' ? 'AI রোবট উত্তর প্রস্তুত করছে...' : 'AI Teacher is responding...'}
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

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="border-t border-[var(--border-subtle)] p-3 sm:p-4 flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={!speechSupport.sttSupported}
              title={listening ? 'থামান' : 'ভয়েসে কথা বলুন'}
              className={`p-3 rounded-xl shrink-0 transition-colors disabled:opacity-40 ${
                listening ? 'bg-[var(--danger)] text-white' : 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
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
                  ? 'বাংলা বা আরবিতে লিখুন অথবা মাইক চেপে বলুন...'
                  : 'Type or tap the mic to talk with AI...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm btn-primary disabled:opacity-50 whitespace-nowrap shrink-0"
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
