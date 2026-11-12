import React, { useMemo, useState } from 'react';
import { ArrowLeft, Bot, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { useApp } from '../context/AppContext';
import { GRAMMAR_TOPICS } from '../data/grammarData';

export const GrammarPage: React.FC = () => {
  const { t, lang, progress, completeGrammarTopic, triggerSound } = useApp();
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
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [showScopedAi, setShowScopedAi] = useState(false);
  const [quizChoice, setQuizChoice] = useState<Record<string, number>>({});

  const visibleTopics = GRAMMAR_TOPICS.filter((topic) => {
    const branchMatch = branchFilter === 'all' || topic.branch === branchFilter;
    const effectiveBook =
      topic.sourceBook ||
      (topic.branch === 'Sarf' ? 'মীযানুস ছরফ ও মুনশাঈব' : 'মাবাদিউল আরাবিয়াহ');
    const bookMatch = bookFilter === 'all' || effectiveBook === bookFilter;
    return branchMatch && bookMatch;
  });
  const activeTopic = GRAMMAR_TOPICS.find((tItem) => tItem.id === selectedId) || GRAMMAR_TOPICS[0];

  const grammarScopeContext = useMemo(() => {
    const exLines = activeTopic.examples
      .map((e) => `- ${e.arabic} (${e.pronunciationBn}): ${e.meaningBn} [বিশ্লেষণ: ${e.analysisBn}]`)
      .join('\n');
    return [
      `ব্যাকরণ অধ্যায়: ${activeTopic.titleBn} (${activeTopic.titleAr})`,
      `শ্রেণি ও কিতাব: ${activeTopic.branch} | ${activeTopic.sourceBook || 'মাবাদিউল আরাবিয়াহ / হেদায়েতুন নাহু'}`,
      `ব্যাখ্যা: ${activeTopic.explanationBn}`,
      `মূল নিয়ম:\n- ${activeTopic.rulesBn.join('\n- ')}`,
      `উদাহরণসমূহ:\n${exLines}`,
    ].join('\n\n');
  }, [activeTopic]);

  const handleSelectTopic = (id: string) => {
    setSelectedId(id);
    setShowScopedAi(false);
    setMobileShowDetail(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell
      title={t.sidebar.grammar}
      subtitle={
        lang === 'bn'
          ? `মাবাদিউল আরাবিয়াহ, নাহুমীর, মিয়াতে আমিল, হেদায়েতুন নাহু, কাফিয়া ও মীযানুস ছরফ — ${GRAMMAR_TOPICS.length}টি অধ্যায়`
          : `${GRAMMAR_TOPICS.length} Complete Classical Nahw & Sarf Grammar Modules`
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Picker (Hidden on mobile when reading a topic so it renders cleanly at top) */}
        <div className={`lg:col-span-4 space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="flex gap-1.5">
            {(['all', 'Nahw', 'Sarf'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBranchFilter(b)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold ${
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  bookFilter === book ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {book === 'all' ? 'সব কিতাব' : book}
              </button>
            ))}
          </div>

          <div className="space-y-2 lg:max-h-[700px] lg:overflow-y-auto pe-1">
            {visibleTopics.map((topic) => {
              const active = topic.id === activeTopic.id;
              const done = progress.completedGrammarIds.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                    active
                      ? 'surface-alt border-[var(--border-strong)]'
                      : 'surface-card hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--accent)]">{topic.branch}</span>
                      <span className="font-arabic text-sm text-[var(--text-secondary)]">{topic.titleAr}</span>
                    </div>
                    <div className="text-sm font-bold leading-snug">
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
        <div className={`lg:col-span-8 space-y-5 ${mobileShowDetail ? 'block' : 'hidden lg:block'}`}>
          <button
            type="button"
            onClick={() => setMobileShowDetail(false)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>সব ব্যাকরণ অধ্যায়ের তালিকায় ফিরুন</span>
          </button>

          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[var(--accent)]">
                  <span>{activeTopic.branch}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{activeTopic.sourceBook || 'মাবাদিউল আরাবিয়াহ / হেদায়েতুন নাহু'}</span>
                </div>
                <p className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                  {activeTopic.titleAr}
                </p>
                <h2 className="text-xl font-bold">
                  {lang === 'bn' ? activeTopic.titleBn : activeTopic.titleEn}
                </h2>
              </div>

              {progress.completedGrammarIds.includes(activeTopic.id) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--emerald-highlight)] text-[var(--success)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.common.completed}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    completeGrammarTopic(activeTopic.id, activeTopic.titleBn, activeTopic.titleEn)
                  }
                  className="px-4 py-2 rounded-xl text-xs btn-primary font-bold"
                >
                  অধ্যায় সম্পন্ন করুন (+35 XP)
                </button>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">{activeTopic.summaryBn}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {lang === 'bn' ? activeTopic.explanationBn : activeTopic.explanationEn}
              </p>
            </div>

            <div className="surface-alt rounded-xl p-4 sm:p-5 space-y-2.5">
              <div className="text-xs font-bold text-[var(--accent)]">মূল নিয়মাবলি:</div>
              <ul className="list-disc ps-5 space-y-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                {activeTopic.rulesBn.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--accent)]">উদাহরণ ও পদ-বিশ্লেষণ (হারাকাতসহ):</h3>
              {activeTopic.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="surface-alt rounded-xl p-4 sm:p-5 space-y-2 border border-[var(--border-subtle)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">{ex.arabic}</p>
                    <AudioButton text={ex.arabic} compact />
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    উচ্চারণ: <span className="font-medium text-[var(--text-primary)]">{ex.pronunciationBn}</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    বাংলা অর্থ: {ex.meaningBn}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)] leading-relaxed">
                    <span className="font-semibold text-[var(--accent)]">নাহু/ছরফ বিশ্লেষণ: </span>
                    {ex.analysisBn}
                  </div>
                </div>
              ))}
            </div>

            {/* Practice Quiz */}
            <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--accent)]">অনুশীলন প্রশ্ন:</h3>
              {activeTopic.quiz.map((q) => {
                const chosen = quizChoice[q.id];
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div key={q.id} className="surface-alt rounded-xl p-4 space-y-2.5">
                    <div className="text-sm font-semibold">{lang === 'bn' ? q.questionBn : q.questionEn}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            triggerSound(idx === q.correctIndex ? 'success' : 'error');
                            setQuizChoice((prev) => ({ ...prev, [q.id]: idx }));
                          }}
                          className={`px-3.5 py-2.5 rounded-xl text-sm text-left border ${
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
                      <div className={`text-xs font-medium ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                        {q.explanationBn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Embedded Scoped AI Grammar Practice */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-4">
              <button
                type="button"
                onClick={() => setShowScopedAi((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold btn-primary"
              >
                <Bot className="w-4 h-4" />
                <span>
                  {showScopedAi
                    ? 'AI ব্যাকরণ চর্চা লুকান'
                    : `"${activeTopic.titleBn}" নিয়মটি নিয়ে সরাসরি AI চর্চা করুন`}
                </span>
              </button>

              {showScopedAi && (
                <LessonAiPracticePanel
                  key={activeTopic.id}
                  lessonTitle={`ব্যাকরণ: ${activeTopic.titleBn}`}
                  lessonScopeContext={grammarScopeContext}
                  starterQuestions={[
                    `"${activeTopic.titleBn}" নিয়মটি ৩টি সহজ উদাহরণসহ বোঝান।`,
                    `এই নিয়মের ওপর আমাকে ২টি অনুশীলন বাক্য দিন।`,
                    `এই নিয়ম ব্যবহারে ছাত্ররা কী কী সাধারণ ভুল করে?`,
                  ]}
                  levelLabel={activeTopic.branch}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
