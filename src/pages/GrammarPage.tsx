import React, { useState } from 'react';
import { Bot, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { GRAMMAR_TOPICS } from '../data/grammarData';

export const GrammarPage: React.FC = () => {
  const { t, lang, progress, completeGrammarTopic } = useApp();
  const [branchFilter, setBranchFilter] = useState<'all' | 'Nahw' | 'Sarf'>('all');
  const [bookFilter, setBookFilter] = useState<
    | 'all'
    | 'মাবাদিউল আরাবিয়াহ'
    | 'নাহুমীর ও মিয়াতে আমিল'
    | 'হেদায়েতুন নাহু'
    | 'কাফিয়া'
    | 'মীযানুস ছরফ ও মুনশাঈব'
  >('all');
  const [selectedId, setSelectedId] = useState(GRAMMAR_TOPICS[0].id);
  const [quizChoice, setQuizChoice] = useState<Record<string, number>>({});
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const visibleTopics = GRAMMAR_TOPICS.filter((topic) => {
    const branchMatch = branchFilter === 'all' || topic.branch === branchFilter;
    const effectiveBook =
      topic.sourceBook ||
      (topic.branch === 'Sarf' ? 'মীযানুস ছরফ ও মুনশাঈব' : 'মাবাদিউল আরাবিয়াহ');
    const bookMatch = bookFilter === 'all' || effectiveBook === bookFilter;
    return branchMatch && bookMatch;
  });
  const activeTopic = GRAMMAR_TOPICS.find((tItem) => tItem.id === selectedId) || GRAMMAR_TOPICS[0];

  const handleAskAiTopic = async () => {
    setLoadingAi(true);
    setAiNote(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'grammar',
          level: 'Structured Grammar Study',
          interfaceLang: lang,
          message: `Explain the Arabic grammar topic "${activeTopic.titleAr} (${activeTopic.titleBn})" in detail with Bengali rules, 3 practical examples with full Harakat, and common mistakes.`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Could not load AI explanation.');
      setAiNote(data.reply);
    } catch (err: unknown) {
      setAiNote(err instanceof Error ? err.message : 'Failed to load AI explanation.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <AppShell
      title={t.sidebar.grammar}
      subtitle={
        lang === 'bn'
          ? `মাবাদিউল আরাবিয়াহ, নাহুমীর, মিয়াতে আমিল, হেদায়েতুন নাহু, কাফিয়া ও মীযানুস ছরফ — ${GRAMMAR_TOPICS.length}টি পূর্ণাঙ্গ অধ্যায়`
          : `${GRAMMAR_TOPICS.length} Complete Classical Nahw & Sarf Grammar Modules`
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Topic Picker */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex gap-1.5">
            {(['all', 'Nahw', 'Sarf'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBranchFilter(b)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium ${
                  branchFilter === b ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {b === 'all' ? (lang === 'bn' ? `সকল (${GRAMMAR_TOPICS.length})` : `All (${GRAMMAR_TOPICS.length})`) : b}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                'all',
                'মাবাদিউল আরাবিয়াহ',
                'নাহুমীর ও মিয়াতে আমিল',
                'হেদায়েতুন নাহু',
                'কাফিয়া',
                'মীযানুস ছরফ ও মুনশাঈব',
              ] as const
            ).map((book) => (
              <button
                key={book}
                type="button"
                onClick={() => setBookFilter(book)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  bookFilter === book ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {book === 'all' ? 'সব কিতাব' : book}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pe-1">
            {visibleTopics.map((topic) => {
              const active = topic.id === activeTopic.id;
              const done = progress.completedGrammarIds.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(topic.id);
                    setAiNote(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                    active
                      ? 'surface-alt border-[var(--border-strong)]'
                      : 'surface-card hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{topic.branch}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-arabic text-sm text-[var(--accent)]">{topic.titleAr}</span>
                    </div>
                    <div className="text-sm font-semibold truncate mt-0.5">
                      {lang === 'bn' ? topic.titleBn : topic.titleEn}
                    </div>
                  </div>
                  {done && <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Topic Detail */}
        <div className="lg:col-span-8 space-y-5">
          <div className="surface-card rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-medium text-[var(--accent)]">
                  {activeTopic.branch}
                  {activeTopic.sourceBook ? ` · ${activeTopic.sourceBook}` : ' · মাবাদিউল আরাবিয়াহ / হেদায়েতুন নাহু'}
                </span>
                <p className="font-arabic text-3xl text-[var(--accent)] mt-1" dir="rtl">
                  {activeTopic.titleAr}
                </p>
                <h2 className="text-xl font-bold mt-1">
                  {lang === 'bn' ? activeTopic.titleBn : activeTopic.titleEn}
                </h2>
              </div>

              {progress.completedGrammarIds.includes(activeTopic.id) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--emerald-highlight)] text-[var(--success)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.common.completed}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    completeGrammarTopic(activeTopic.id, activeTopic.titleBn, activeTopic.titleEn)
                  }
                  className="px-4 py-2 rounded-lg text-xs btn-primary"
                >
                  অধ্যায় সম্পন্ন করুন (+35 XP)
                </button>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">{activeTopic.summaryBn}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {lang === 'bn' ? activeTopic.explanationBn : activeTopic.explanationEn}
              </p>
            </div>

            <div className="surface-alt rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-[var(--accent)]">মূল নিয়মাবলি:</div>
              <ul className="list-disc ps-5 space-y-1 text-sm text-[var(--text-secondary)]">
                {activeTopic.rulesBn.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--accent)]">উদাহরণ ও পদ-বিশ্লেষণ (Harakat সহ)</h3>
              {activeTopic.examples.map((ex, idx) => (
                <div key={idx} className="surface-alt rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">{ex.arabic}</p>
                    <AudioButton text={ex.arabic} compact />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{ex.pronunciationBn}</p>
                  <p className="text-sm font-medium">{ex.meaningBn}</p>
                  <p className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                    নাহু/ছরফ বিশ্লেষণ: {ex.analysisBn}
                  </p>
                </div>
              ))}
            </div>

            {/* Practice Quiz */}
            <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--accent)]">অনুশীলন প্রশ্ন</h3>
              {activeTopic.quiz.map((q) => {
                const chosen = quizChoice[q.id];
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div key={q.id} className="surface-alt rounded-xl p-4 space-y-2.5">
                    <div className="text-sm font-medium">{lang === 'bn' ? q.questionBn : q.questionEn}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuizChoice((prev) => ({ ...prev, [q.id]: idx }))}
                          className={`px-3.5 py-2 rounded-lg text-sm text-left border ${
                            chosen === idx
                              ? idx === q.correctIndex
                                ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold'
                                : 'border-[var(--danger)] bg-[var(--danger)]/10'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {chosen !== undefined && (
                      <div className={`text-xs ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                        {q.explanationBn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Deep Explanation */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleAskAiTopic}
                disabled={loadingAi}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs btn-secondary"
              >
                <Bot className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {loadingAi
                    ? 'AI শিক্ষক বিস্তারিত ব্যাখ্যা লিখছেন...'
                    : 'AI শিক্ষকের কাছ থেকে আরও উদাহরণ ও ব্যাখ্যা নিন'}
                </span>
              </button>

              {aiNote && (
                <div className="surface-alt rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed font-arabic-ui">
                  {aiNote}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
