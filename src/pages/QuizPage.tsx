import React, { useEffect, useMemo, useState } from 'react';
import { Clock, CheckCircle2, XCircle, Play, RotateCcw, Bot } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';

export const QuizPage: React.FC = () => {
  const { t, lang, allExamQuestions, progress, recordExamResult } = useApp();
  const [difficulty, setDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timedMode, setTimedMode] = useState(false);

  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // AI Writing Exam section
  const [writingPromptAnswer, setWritingPromptAnswer] = useState('');
  const [aiGrade, setAiGrade] = useState<string | null>(null);
  const [gradingAi, setGradingAi] = useState(false);

  const questions = useMemo(() => {
    return allExamQuestions.filter((q) => {
      if (difficulty !== 'All' && q.difficulty !== difficulty) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      return true;
    });
  }, [allExamQuestions, difficulty, typeFilter]);

  useEffect(() => {
    if (!examStarted || examFinished) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      if (timedMode) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setExamFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [examStarted, examFinished, timedMode]);

  const startExam = () => {
    setAnswers({});
    setExamFinished(false);
    setExamStarted(true);
    setSecondsLeft(Math.max(60, questions.length * 30));
    setElapsedSeconds(0);
  };

  const submitExam = () => {
    if (examFinished) return;
    setExamFinished(true);
    const total = questions.length;
    const score = questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
      0
    );
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    recordExamResult({
      mode: typeFilter === 'all' ? 'Comprehensive Exam' : typeFilter,
      difficulty,
      score,
      total,
      percentage,
      durationSeconds: elapsedSeconds,
    });
  };

  const handleGradeWriting = async () => {
    if (!writingPromptAnswer.trim() || gradingAi) return;
    setGradingAi(true);
    setAiGrade(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'correct-writing',
          level: difficulty === 'All' ? 'Intermediate' : difficulty,
          interfaceLang: lang,
          message: `Topic: Write 2 Arabic sentences introducing yourself and why you are learning Arabic.\nStudent submission: ${writingPromptAnswer}`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Could not evaluate writing.');
      setAiGrade(data.reply);
    } catch (err: unknown) {
      setAiGrade(err instanceof Error ? err.message : 'Error evaluating writing.');
    } finally {
      setGradingAi(false);
    }
  };

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <AppShell
      title={t.sidebar.quiz}
      subtitle={
        lang === 'bn'
          ? 'বহুনির্বাচনী, শূন্যস্থান, অনুবাদ, ব্যাকরণ, শ্রবণ ও লিখিত পরীক্ষা ব্যবস্থা'
          : 'Interactive Arabic examinations with timer, explanations, and score history'
      }
    >
      <div className="space-y-6">
        {/* Configuration Card */}
        {!examStarted && (
          <div className="surface-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold">
              {lang === 'bn' ? 'পরীক্ষার সেটিংস নির্বাচন করুন' : 'Configure Examination'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">কঠিন্যের স্তর (Difficulty)</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">প্রশ্নের ধরন (Question Type)</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                >
                  <option value="all">সকল ধরন (Mixed Exam)</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="fill-blank">Fill in the Blanks</option>
                  <option value="ar-to-bn">Arabic → Bengali Translation</option>
                  <option value="bn-to-ar">Bengali → Arabic Translation</option>
                  <option value="grammar">Grammar (Nahw & Sarf)</option>
                  <option value="vocabulary">Vocabulary Root Test</option>
                  <option value="listening">Listening Test</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2.5 text-sm cursor-pointer p-2.5 rounded-lg surface-alt w-full">
                  <input
                    type="checkbox"
                    checked={timedMode}
                    onChange={(e) => setTimedMode(e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  <span>সময়-নির্ধারিত পরীক্ষা (Timed Mode)</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs text-[var(--text-muted)] font-mono-num">
                নির্বাচিত প্রশ্ন সংখ্যা: {questions.length}টি
              </span>
              <button
                type="button"
                onClick={startExam}
                disabled={questions.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm btn-primary disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{lang === 'bn' ? 'পরীক্ষা শুরু করুন' : 'Start Exam'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Exam */}
        {examStarted && (
          <div className="space-y-4">
            <div className="surface-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold">
                {examFinished
                  ? `ফলাফল: ${score}/${questions.length} (${percentage}%)`
                  : `চলমান পরীক্ষা (${Object.keys(answers).length}/${questions.length} উত্তরিত)`}
              </div>
              <div className="flex items-center gap-3">
                {timedMode && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono-num text-[var(--accent)]">
                    <Clock className="w-4 h-4" />
                    {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                  </span>
                )}
                {!examFinished ? (
                  <button type="button" onClick={submitExam} className="px-4 py-2 rounded-lg text-xs btn-primary">
                    জমা দিন
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExamStarted(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-secondary"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>নতুন পরীক্ষা</span>
                  </button>
                )}
              </div>
            </div>

            {questions.map((q, idx) => {
              const chosen = answers[q.id];
              const isCorrect = chosen === q.correctAnswer;
              return (
                <div key={q.id} className="surface-card rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>
                      প্রশ্ন {idx + 1} · {q.type} · {q.difficulty}
                    </span>
                    {q.arabicText && <AudioButton text={q.arabicText} compact showSlow={false} />}
                  </div>
                  <div className="text-sm font-semibold">{lang === 'bn' ? q.promptBn : q.promptEn}</div>
                  {q.arabicText && (
                    <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                      {q.arabicText}
                    </p>
                  )}

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const selected = chosen === opt;
                        const rightOption = opt === q.correctAnswer;
                        let styleClass = 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]';
                        if (examFinished) {
                          if (rightOption) styleClass = 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold';
                          else if (selected) styleClass = 'border-[var(--danger)] bg-[var(--danger)]/10';
                        } else if (selected) {
                          styleClass = 'border-[var(--border-strong)] bg-[var(--bg-surface-alt)] font-semibold';
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={examFinished}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            className={`px-4 py-2.5 rounded-lg text-sm text-left border transition-colors ${styleClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {examFinished && (
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-start gap-2 text-xs">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold">সঠিক উত্তর: {q.correctAnswer}. </span>
                        <span className="text-[var(--text-secondary)]">{q.explanationBn}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Writing Exercise Section */}
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold">
            {lang === 'bn' ? 'লিখিত আরবি অনুশীলন (AI মূল্যায়নসহ)' : 'Arabic Writing Exercise (AI Evaluated)'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            বিষয়: আরবিতে নিজের নাম ও আপনি কেন আরবি শিখছেন তা ২টি বাক্যে লিখুন।
          </p>
          <textarea
            rows={3}
            dir="rtl"
            value={writingPromptAnswer}
            onChange={(e) => setWritingPromptAnswer(e.target.value)}
            placeholder="اسْمِي ... وَأَنَا أَتَعَلَّمُ العَرَبِيَّةَ لِأَنَّ..."
            className="w-full p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-xl focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleGradeWriting}
            disabled={gradingAi || !writingPromptAnswer.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs btn-primary disabled:opacity-50"
          >
            <Bot className="w-4 h-4" />
            <span>{gradingAi ? 'যাচাই হচ্ছে...' : 'AI দিয়ে লিখিত উত্তর যাচাই করুন'}</span>
          </button>

          {aiGrade && (
            <div className="surface-alt rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed font-arabic-ui">
              {aiGrade}
            </div>
          )}
        </div>

        {/* Exam History */}
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold">{lang === 'bn' ? 'পূর্ববর্তী পরীক্ষার ইতিহাস' : 'Exam History'}</h3>
          {progress.examHistory.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              এখনো কোনো পরীক্ষা সম্পন্ন হয়নি। উপরের "পরীক্ষা শুরু করুন" বাটনে ক্লিক করে প্রথম মূল্যায়ন দিন।
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="py-2 pe-4">তারিখ</th>
                    <th className="py-2 pe-4">ধরন</th>
                    <th className="py-2 pe-4">স্তর</th>
                    <th className="py-2 pe-4">নম্বর</th>
                    <th className="py-2">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {progress.examHistory.map((h) => (
                    <tr key={h.id}>
                      <td className="py-2.5 pe-4 font-mono-num text-xs">
                        {new Date(h.dateIso).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 pe-4">{h.mode}</td>
                      <td className="py-2.5 pe-4">{h.difficulty}</td>
                      <td className="py-2.5 pe-4 font-mono-num font-semibold text-[var(--accent)]">
                        {h.score}/{h.total} ({h.percentage}%)
                      </td>
                      <td className="py-2.5 font-mono-num text-xs">{h.durationSeconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
