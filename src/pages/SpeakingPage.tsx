import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Bot, AlertTriangle, Sparkles } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { SPEAKING_EXERCISES } from '../data/practiceAndVocabData';
import { getSpeechSupport, RecognitionHandle, startArabicRecognition } from '../utils/speech';

export const SpeakingPage: React.FC = () => {
  const { t, lang, awardXp } = useApp();
  const [selectedEx, setSelectedEx] = useState(SPEAKING_EXERCISES[0]);
  const [speechSupport] = useState(() => getSpeechSupport());
  const [recording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const recRef = useRef<RecognitionHandle | null>(null);

  useEffect(() => {
    return () => {
      recRef.current?.stop();
    };
  }, []);

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
      <div className="space-y-6">
        {!speechSupport.sttSupported && (
          <div className="p-4 rounded-xl border border-[var(--warning)]/50 bg-[var(--warning)]/10 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">
                {lang === 'bn'
                  ? 'এই ব্রাউজারে Web Speech Recognition সমর্থিত নয়'
                  : 'Web Speech Recognition is not supported in this browser'}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {lang === 'bn'
                  ? 'সরাসরি ভয়েস রেকর্ডিংয়ের জন্য Google Chrome বা Microsoft Edge ব্যবহার করুন। তবে আপনি নিচে রেফারেন্স অডিও শুনে আরবি টেক্সট বক্সে লিখে AI শিক্ষকের কাছ থেকে ফিডব্যাক নিতে পারবেন।'
                  : 'Please use Chrome or Edge for live microphone recognition. You can still listen to reference audio and type your sentence below for AI feedback.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Exercise Selector */}
          <div className="lg:col-span-4 space-y-2.5">
            <h2 className="text-sm font-semibold text-[var(--text-muted)]">
              {lang === 'bn' ? 'অনুশীলন বাক্য নির্বাচন করুন' : 'Choose Speaking Drill'}
            </h2>
            {SPEAKING_EXERCISES.map((ex) => {
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
                  className={`w-full text-left p-4 rounded-xl border transition-colors space-y-1 ${
                    active
                      ? 'surface-alt border-[var(--border-strong)]'
                      : 'surface-card hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-xs text-[var(--accent)] font-medium uppercase">{ex.category}</div>
                  <div className="text-sm font-bold">{lang === 'bn' ? ex.titleBn : ex.titleEn}</div>
                  <p className="font-arabic text-base text-[var(--text-secondary)] truncate" dir="rtl">
                    {ex.arabicTarget}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Speaking Stage */}
          <div className="lg:col-span-8 surface-card rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs text-[var(--accent)] font-medium">
                  {lang === 'bn' ? 'লক্ষ্য বাক্য (Target Sentence)' : 'Target Phrase'}
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  {lang === 'bn' ? selectedEx.titleBn : selectedEx.titleEn}
                </h3>
              </div>
              <AudioButton text={selectedEx.arabicTarget} showSlow />
            </div>

            <div className="surface-alt rounded-xl p-5 space-y-2">
              <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                {selectedEx.arabicTarget}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{selectedEx.pronunciationBn}</p>
              <p className="text-sm">
                {selectedEx.meaningBn} · <span className="text-[var(--text-muted)]">{selectedEx.meaningEn}</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
                উচ্চারণ টিপস: {selectedEx.tipBn}
              </p>
            </div>

            {/* Voice Capture & Transcript */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  disabled={!speechSupport.sttSupported}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 ${
                    recording ? 'bg-[var(--danger)] text-white' : 'btn-primary'
                  }`}
                >
                  {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>
                    {recording
                      ? lang === 'bn'
                        ? 'রেকর্ডিং থামান'
                        : 'Stop Listening'
                      : lang === 'bn'
                      ? 'মাইক্রোফোনে আরবি বলুন'
                      : 'Start Speaking (ar-SA)'}
                  </span>
                </button>
                {recording && (
                  <span className="text-xs text-[var(--accent)] font-medium">
                    {lang === 'bn' ? 'শোনা হচ্ছে... স্পষ্টভাবে আরবি বলুন' : 'Listening for Arabic speech...'}
                  </span>
                )}
              </div>

              {micError && (
                <div className="p-3 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 text-xs text-[var(--warning)]">
                  {micError}
                </div>
              )}

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                  {lang === 'bn'
                    ? 'আপনার বলা বা লেখা আরবি (প্রয়োজনে সম্পাদনা করতে পারেন):'
                    : 'Captured / Typed Arabic Attempt:'}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={spokenText}
                  onChange={(e) => setSpokenText(e.target.value)}
                  placeholder="আপনি যা বলেছেন তা এখানে আরবিতে দেখা যাবে..."
                  className="w-full p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-xl focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <button
                type="button"
                onClick={handleGetAiFeedback}
                disabled={loadingAi || !spokenText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-primary disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {loadingAi
                    ? lang === 'bn'
                      ? 'AI বিশ্লেষণ করছে...'
                      : 'Analyzing...'
                    : lang === 'bn'
                    ? 'AI শিক্ষকের ফিডব্যাক ও সংশোধন নিন'
                    : 'Get AI Correction & Feedback'}
                </span>
              </button>

              {aiFeedback && (
                <div className="surface-alt rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
                    <Bot className="w-4 h-4" />
                    <span>AI Pronunciation & Grammar Feedback</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed font-arabic-ui">
                    {aiFeedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
