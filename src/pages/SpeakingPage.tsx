import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Bot, AlertTriangle, Sparkles } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { GeminiRichText } from '../components/GeminiRichText';
import { QuickNahwText } from '../components/QuickNahwText';
import { useApp } from '../context/AppContext';
import { SPEAKING_EXERCISES } from '../data/practiceAndVocabData';
import { getSpeechSupport, RecognitionHandle, startArabicRecognition } from '../utils/speech';

const DRILL_CHIP_COLORS = [
  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
];

export const SpeakingPage: React.FC = () => {
  const { t, lang, awardXp, progress, updateProfile, syncMissingVocabFromSegments } = useApp();
  const activeGender = progress.voiceGender === 'female' ? 'female' : 'male';
  const [selectedEx, setSelectedEx] = useState(SPEAKING_EXERCISES[0]);
  const [speechSupport] = useState(() => getSpeechSupport());
  const [recording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const recRef = useRef<RecognitionHandle | null>(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      syncMissingVocabFromSegments(
        SPEAKING_EXERCISES.map((ex) => ({
          arabic: ex.arabicTarget,
          translationBn: ex.meaningBn,
          sourceLabelBn: 'কথোপকথন অনুশীলন',
        }))
      );
    }
    return () => {
      recRef.current?.stop();
    };
  }, [syncMissingVocabFromSegments]);

  const handleToggleMic = () => {
    setMicError(null);
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }

    setRecording(true);
    const handle = startArabicRecognition({
      onResult: (transcript) => {
        setSpokenText(transcript);
      },
      onError: (message) => {
        setMicError(message);
        setRecording(false);
      },
      onEnd: () => {
        setRecording(false);
      },
    });

    if (!handle) {
      setRecording(false);
    } else {
      recRef.current = handle;
    }
  };

  const handleGetAiFeedback = async () => {
    if (!spokenText.trim() || loadingAi) return;
    setLoadingAi(true);
    setAiFeedback(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'speaking-feedback',
          level: 'Beginner to Intermediate',
          interfaceLang: lang,
          voiceGender: activeGender,
          context: `Target Arabic Sentence: "${selectedEx.arabicTarget}" (${selectedEx.meaningBn})`,
          message: `The student spoke/typed this Arabic attempt: "${spokenText}". Compare it carefully against the target sentence "${selectedEx.arabicTarget}", give Bengali pronunciation tips, and suggest the corrected sentence with complete Harakat.`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Could not retrieve AI feedback.');
      setAiFeedback(data.reply);
      awardXp(20, {
        titleBn: `কথোপকথন অনুশীলন: ${selectedEx.titleBn}`,
        titleEn: `Speaking practice: ${selectedEx.titleEn}`,
        type: 'speaking',
      });
    } catch (err: unknown) {
      setAiFeedback(err instanceof Error ? err.message : 'Error evaluating speech.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <AppShell
      title={t.sidebar.speaking}
      subtitle={
        lang === 'bn'
          ? 'মাইক্রোফোন ভয়েস ইনপুট, আরবি উচ্চারণ অনুশীলন ও AI সংশোধন'
          : 'Arabic voice speaking practice, sentence repetition & AI correction'
      }
    >
      <div className="space-y-5">
        {!speechSupport.sttSupported && (
          <div className="p-4 rounded-2xl border border-[var(--warning)]/50 bg-[var(--warning)]/10 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">
                {lang === 'bn'
                  ? 'এই ব্রাউজারে Web Speech Recognition সমর্থিত নয়'
                  : 'Web Speech Recognition is not supported in this browser'}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                সরাসরি ভয়েস রেকর্ডিংয়ের জন্য Google Chrome বা Edge ব্যবহার করুন, অথবা নিচে আরবি লিখে AI সংশোধন নিন।
              </p>
            </div>
          </div>
        )}

        {/* Compact Color-Coded Top Selector Pills (No giant white stack pushing stage down!) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[var(--text-muted)] px-1">
            {lang === 'bn' ? 'অনুশীলনের বিষয় বাছাই করুন:' : 'Select Speaking Drill:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SPEAKING_EXERCISES.map((ex, idx) => {
              const active = selectedEx.id === ex.id;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setSelectedEx(ex);
                    setSpokenText('');
                    setAiFeedback(null);
                    setMicError(null);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all ${
                    active ? 'text-white shadow-lg scale-[1.01]' : 'surface-card hover:border-[var(--border-strong)]'
                  }`}
                  style={active ? { background: DRILL_CHIP_COLORS[idx % DRILL_CHIP_COLORS.length] } : undefined}
                >
                  <div className={`text-[10px] font-bold uppercase ${active ? 'text-white/85' : 'text-[var(--accent)]'}`}>
                    {ex.category}
                  </div>
                  <div className="text-xs font-bold mt-0.5 line-clamp-2">
                    {lang === 'bn' ? ex.titleBn : ex.titleEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Target Practice Stage IMMEDIATELY Visible Above the Fold */}
        <div className="surface-card rounded-3xl overflow-hidden border border-[var(--border-strong)] shadow-lg">
          {/* Vibrant Colored Target Sentence Banner */}
          <div
            className="p-5 sm:p-6 text-white space-y-3"
            style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #0284c7 100%)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  লক্ষ্য বাক্য (Target Phrase)
                </span>
                <h3 className="text-lg sm:text-xl font-bold mt-0.5">
                  {lang === 'bn' ? selectedEx.titleBn : selectedEx.titleEn}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full bg-black/25 p-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => updateProfile({ voiceGender: 'male' })}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      activeGender === 'male' ? 'bg-white text-indigo-950' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    পুরুষ (উস্তায)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProfile({ voiceGender: 'female' })}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      activeGender === 'female' ? 'bg-white text-indigo-950' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    নারী (উস্তাধা)
                  </button>
                </div>
                <AudioButton text={selectedEx.arabicTarget} showSlow />
              </div>
            </div>

            <div className="rounded-2xl bg-black/20 backdrop-blur-md p-4 sm:p-5 space-y-2">
              <QuickNahwText
                text={selectedEx.arabicTarget}
                className="font-arabic text-2xl sm:text-3xl text-amber-200 text-right leading-loose"
              />
              <p className="text-xs text-sky-100">{selectedEx.pronunciationBn}</p>
              <p className="text-sm font-semibold">{selectedEx.meaningBn}</p>
              <p className="text-[11px] text-white/80 pt-1.5 border-t border-white/15">
                টিপস: {selectedEx.tipBn}
              </p>
            </div>
          </div>

          {/* Voice Capture & Instant AI Correction */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={!speechSupport.sttSupported}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow disabled:opacity-50 ${
                  recording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                }`}
              >
                {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{recording ? 'রেকর্ডিং থামান' : 'মাইক্রোফোনে আরবি বলুন'}</span>
              </button>
              {recording && (
                <span className="text-xs text-[var(--accent)] font-semibold">
                  শোনা হচ্ছে... স্পষ্টভাবে আরবি বলুন
                </span>
              )}
            </div>

            {micError && (
              <div className="p-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 text-xs text-[var(--warning)]">
                {micError}
              </div>
            )}

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                আপনার বলা বা লেখা আরবি (প্রয়োজনে সম্পাদনা করতে পারেন):
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={spokenText}
                onChange={(e) => setSpokenText(e.target.value)}
                placeholder="আপনি যা বলেছেন তা এখানে আরবিতে দেখা যাবে..."
                className="w-full p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-xl focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <button
              type="button"
              onClick={handleGetAiFeedback}
              disabled={loadingAi || !spokenText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm btn-primary disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingAi ? 'AI বিশ্লেষণ করছে...' : 'AI শিক্ষকের ফিডব্যাক ও সংশোধন নিন'}</span>
            </button>

            {aiFeedback && (
              <div className="surface-card rounded-3xl p-5 space-y-2.5 border border-[var(--border-strong)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
                  <Bot className="w-4 h-4" />
                  <span>AI উচ্চারণ ও ব্যাকরণ সংশোধন</span>
                </div>
                <GeminiRichText
                  text={aiFeedback}
                  className="text-[15.5px] sm:text-base whitespace-pre-wrap leading-[1.85] font-arabic-ui"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
