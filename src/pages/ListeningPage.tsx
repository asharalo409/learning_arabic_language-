import React, { useEffect, useState } from 'react';
import { Volume2, Turtle, Repeat, Square, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { LISTENING_EXERCISES } from '../data/practiceAndVocabData';
import { getSpeechSupport, speakArabic, stopArabicSpeech } from '../utils/speech';

export const ListeningPage: React.FC = () => {
  const { t, lang, awardXp } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'word' | 'sentence' | 'conversation'>('all');
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [speechSupport, setSpeechSupport] = useState(() => getSpeechSupport());

  useEffect(() => {
    const check = () => setSpeechSupport(getSpeechSupport());
    check();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = check;
    }
    return () => {
      stopArabicSpeech();
    };
  }, []);

  const filtered = LISTENING_EXERCISES.filter((ex) => filterType === 'all' || ex.type === filterType);

  const playItem = (id: string, text: string, rate: number) => {
    setAudioError(null);
    const playOnce = () => {
      speakArabic(text, {
        rate,
        onStart: () => setPlayingId(id),
        onEnd: () => {
          if (repeatEnabled) {
            window.setTimeout(() => {
              playOnce();
            }, 600);
          } else {
            setPlayingId(null);
          }
        },
        onError: (msg) => {
          setPlayingId(null);
          setAudioError(msg);
        },
      });
    };
    playOnce();
  };

  const handleStop = () => {
    setRepeatEnabled(false);
    stopArabicSpeech();
    setPlayingId(null);
  };

  const handleSelectOption = (exerciseId: string, idx: number, correctIdx: number) => {
    const alreadyAnswered = selectedAnswers[exerciseId] !== undefined;
    setSelectedAnswers((prev) => ({ ...prev, [exerciseId]: idx }));
    if (!alreadyAnswered && idx === correctIdx) {
      awardXp(15, {
        titleBn: 'শ্রবণ অনুশীলন সঠিক উত্তর',
        titleEn: 'Listening comprehension correct',
        type: 'listening',
      });
    }
  };

  return (
    <AppShell
      title={t.sidebar.listening}
      subtitle={
        lang === 'bn'
          ? 'শব্দ, বাক্য ও কথোপকথনের অডিও — ধীর ও স্বাভাবিক গতি এবং বোধগম্যতা পরীক্ষা'
          : 'Arabic word, sentence, and conversation listening with comprehension questions'
      }
    >
      <div className="space-y-6">
        {/* Browser Speech Synthesis Capability Notice */}
        {!speechSupport.ttsSupported && (
          <div className="p-4 rounded-xl border border-[var(--warning)]/50 bg-[var(--warning)]/10 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">ব্রাউজার অডিও উপলব্ধ নয়</div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                আপনার বর্তমান ব্রাউজার Web Speech Synthesis সমর্থন করে না। অনুগ্রহ করে আধুনিক Chrome, Edge বা Safari ব্যবহার করুন।
              </p>
            </div>
          </div>
        )}

        {speechSupport.ttsSupported && !speechSupport.hasArabicTtsVoice && (
          <div className="p-3.5 rounded-xl surface-alt text-xs text-[var(--text-secondary)] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>
              দ্রষ্টব্য: আপনার ডিভাইসে আলাদা আরবি ভয়েস প্যাকেজ শনাক্ত না হলে ব্রাউজার ডিফল্ট `ar-SA` স্পিচ ইঞ্জিন ব্যবহারের চেষ্টা করবে। নিচে বাংলা উচ্চারণ ও অর্থ সর্বদা উপলব্ধ রয়েছে।
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="surface-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', labelBn: 'সকল অনুশীলন', labelEn: 'All' },
                { id: 'word', labelBn: 'শব্দ (Word)', labelEn: 'Words' },
                { id: 'sentence', labelBn: 'বাক্য (Sentence)', labelEn: 'Sentences' },
                { id: 'conversation', labelBn: 'সংলাপ (Dialogue)', labelEn: 'Conversations' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  filterType === tab.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {lang === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRepeatEnabled((r) => !r)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                repeatEnabled ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পুনরাবৃত্তি (Repeat)' : 'Repeat'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTranslation((v) => !v)}
              className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
            >
              {showTranslation
                ? lang === 'bn'
                  ? 'অনুবাদ লুকান'
                  : 'Hide Translation'
                : lang === 'bn'
                ? 'অনুবাদ দেখান'
                : 'Show Translation'}
            </button>
          </div>
        </div>

        {audioError && (
          <div className="p-3 rounded-xl border border-[var(--warning)]/40 text-xs text-[var(--warning)]">
            {audioError}
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          {filtered.map((ex) => {
            const isPlaying = playingId === ex.id;
            const chosen = selectedAnswers[ex.id];

            return (
              <div key={ex.id} className="surface-card rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--accent)] font-medium">
                      {ex.type.toUpperCase()} · {ex.level}
                    </div>
                    <h3 className="text-lg font-bold mt-0.5">
                      {lang === 'bn' ? ex.titleBn : ex.titleEn}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isPlaying ? (
                      <button
                        type="button"
                        onClick={handleStop}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>{t.common.stopAudio}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => playItem(ex.id, ex.arabic, 0.95)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{t.common.playAudio}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => playItem(ex.id, ex.arabic, 0.6)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs btn-secondary"
                        >
                          <Turtle className="w-4 h-4 text-[var(--accent)]" />
                          <span>{t.common.slowAudio}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="surface-alt rounded-xl p-4 space-y-2">
                  <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                    {ex.arabic}
                  </p>
                  {showTranslation && (
                    <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                      <p className="text-xs text-[var(--text-muted)]">
                        {t.common.pronunciation}: {ex.pronunciationBn}
                      </p>
                      <p className="text-sm font-medium">
                        {ex.translationBn}{' '}
                        <span className="text-xs text-[var(--text-muted)]">({ex.translationEn})</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Listening Comprehension Question */}
                <div className="space-y-2.5">
                  <div className="text-sm font-semibold">{ex.comprehensionQuestionBn}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ex.options.map((opt, idx) => {
                      const isCorrect = idx === ex.correctIndex;
                      const isSelected = chosen === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(ex.id, idx, ex.correctIndex)}
                          className={`px-4 py-2.5 rounded-lg text-sm text-left border transition-colors flex items-center justify-between ${
                            isSelected
                              ? isCorrect
                                ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold'
                                : 'border-[var(--danger)] bg-[var(--danger)]/10'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
