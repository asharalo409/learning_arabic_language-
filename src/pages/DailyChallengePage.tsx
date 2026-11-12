import React, { useMemo, useState } from 'react';
import { CheckCircle2, Flame, Target } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';

export const DailyChallengePage: React.FC = () => {
  const { t, lang, allExamQuestions, progress, completeDailyChallenge } = useApp();
  const todayKey = new Date().toISOString().slice(0, 10);
  const alreadyDoneToday = progress.dailyChallengeCompletedDates.includes(todayKey);

  // Deterministic daily selection based on calendar date
  const dailyQuestions = useMemo(() => {
    const seed = todayKey.split('-').reduce((acc, n) => acc + Number(n), 0);
    const total = allExamQuestions.length;
    if (total === 0) return [];
    const picked = [];
    for (let i = 0; i < Math.min(5, total); i++) {
      picked.push(allExamQuestions[(seed + i * 2) % total]);
    }
    return picked;
  }, [allExamQuestions, todayKey]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = dailyQuestions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
    0
  );

  const handleSubmit = () => {
    setSubmitted(true);
    completeDailyChallenge(score, dailyQuestions.length);
  };

  return (
    <AppShell
      title={t.sidebar.dailyChallenge}
      subtitle={
        lang === 'bn'
          ? `আজকের তারিখ: ${todayKey} · ৫টি প্রশ্নের দৈনিক চ্যালেঞ্জ ও স্ট্রিক বোনাস`
          : `Daily Arabic Challenge for ${todayKey}`
      }
    >
      <div className="space-y-6">
        <div className="surface-card rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="w-7 h-7 text-[var(--accent)]" />
            <div>
              <h2 className="text-lg font-bold">
                {alreadyDoneToday ? 'আজকের চ্যালেঞ্জ সম্পন্ন হয়েছে!' : 'আজকের ৫-প্রশ্নের চ্যালেঞ্জ'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                প্রতিদিন চ্যালেঞ্জ সম্পন্ন করলে ৬০+ XP এবং দৈনিক স্ট্রিক সুরক্ষিত থাকে।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono-num font-semibold text-[var(--accent)]">
            <Flame className="w-4 h-4" />
            <span>{progress.streakDays} দিনের স্ট্রিক</span>
          </div>
        </div>

        <div className="space-y-4">
          {dailyQuestions.map((q, idx) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.correctAnswer;
            return (
              <div key={q.id} className="surface-card rounded-xl p-5 space-y-3">
                <div className="text-xs text-[var(--text-muted)]">
                  চ্যালেঞ্জ {idx + 1} · {q.difficulty}
                </div>
                <div className="text-sm font-semibold">{lang === 'bn' ? q.promptBn : q.promptEn}</div>
                {q.arabicText && (
                  <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                    {q.arabicText}
                  </p>
                )}
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`px-4 py-2.5 rounded-lg text-sm text-left border transition-colors ${
                          submitted
                            ? opt === q.correctAnswer
                              ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold'
                              : chosen === opt
                              ? 'border-[var(--danger)] bg-[var(--danger)]/10'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]'
                            : chosen === opt
                            ? 'border-[var(--border-strong)] bg-[var(--bg-surface-alt)] font-semibold'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {submitted && (
                  <div className={`text-xs ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                    {q.explanationBn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < dailyQuestions.length}
              className="px-6 py-3 rounded-xl text-sm btn-primary disabled:opacity-50"
            >
              চ্যালেঞ্জ জমা দিন ({Object.keys(answers).length}/{dailyQuestions.length})
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--success)]">
              <CheckCircle2 className="w-5 h-5" />
              <span>চ্যালেঞ্জ স্কোর: {score}/{dailyQuestions.length} — আপনার XP ও স্ট্রিক আপডেট হয়েছে!</span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
