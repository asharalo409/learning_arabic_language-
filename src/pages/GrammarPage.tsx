import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, CheckCircle2, GitBranch } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { QuickNahwText } from '../components/QuickNahwText';
import { TarkibVisualizer } from '../components/TarkibVisualizer';
import { useApp } from '../context/AppContext';
import { GRAMMAR_TOPICS } from '../data/grammarData';
import { localizeGrammarLabel } from '../utils/grammarTerminology';

export const GrammarPage: React.FC = () => {
  const {
    t,
    lang,
    progress,
    completeGrammarTopic,
    triggerSound,
    syncMissingVocabFromSegments,
    grammarTerminologyMode,
    setGrammarTerminologyMode,
  } = useApp();
  const syncedTopicIdsRef = useRef<Set<string>>(new Set());
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
  const [expandedExampleIdx, setExpandedExampleIdx] = useState<number | null>(null);

  const visibleTopics = GRAMMAR_TOPICS.filter((topic) => {
    const branchMatch = branchFilter === 'all' || topic.branch === branchFilter;
    const effectiveBook =
      topic.sourceBook ||
      (topic.branch === 'Sarf' ? 'মীযানুস ছরফ ও মুনশাঈব' : 'মাবাদিউল আরাবিয়াহ');
    const bookMatch = bookFilter === 'all' || effectiveBook === bookFilter;
    return branchMatch && bookMatch;
  });
  const activeTopic = GRAMMAR_TOPICS.find((tItem) => tItem.id === selectedId) || GRAMMAR_TOPICS[0];

  useEffect(() => {
    if (syncedTopicIdsRef.current.has(activeTopic.id)) return;
    syncedTopicIdsRef.current.add(activeTopic.id);
    syncMissingVocabFromSegments(
      activeTopic.examples.map((ex) => ({
        arabic: ex.arabic,
        translationBn: ex.meaningBn,
        sourceLabelBn: `ব্যাকরণ · ${activeTopic.titleBn}`,
      }))
    );
  }, [activeTopic, syncMissingVocabFromSegments]);

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
    setExpandedExampleIdx(null);
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
                        <span className="font-semibold text-[var(--accent)]">
                          {grammarTerminologyMode === 'arabic'
                            ? topic.branch === 'Nahw'
                              ? 'النَّحْوُ'
                              : 'الصَّرْفُ'
                            : topic.branch}
                        </span>
                        <span className="font-arabic text-sm text-[var(--text-secondary)]">{topic.titleAr}</span>
                      </div>
                      <div className="text-sm font-bold leading-snug">
                        {lang === 'bn'
                          ? localizeGrammarLabel(topic.titleBn, grammarTerminologyMode)
                          : topic.titleEn}
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

          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[var(--accent)]">
                  <span>
                    {grammarTerminologyMode === 'arabic'
                      ? activeTopic.branch === 'Nahw'
                        ? 'النَّحْوُ'
                        : 'الصَّرْفُ'
                      : activeTopic.branch}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span>{activeTopic.sourceBook || 'মাবাদিউল আরাবিয়াহ / হেদায়েতুন নাহু'}</span>
                </div>
                <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)]" dir="rtl">
                  {activeTopic.titleAr}
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold">
                  {lang === 'bn'
                    ? localizeGrammarLabel(activeTopic.titleBn, grammarTerminologyMode)
                    : activeTopic.titleEn}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-0.5 text-[11px] font-bold"
                  role="group"
                  aria-label="Grammar terminology language"
                >
                  <button
                    type="button"
                    onClick={() => setGrammarTerminologyMode('arabic')}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      grammarTerminologyMode === 'arabic'
                        ? 'bg-[var(--accent)] text-white shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    title="আরবি পরিভাষা (اسم، فعل، مبتدأ، خبر)"
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrammarTerminologyMode('bengali')}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      grammarTerminologyMode === 'bengali'
                        ? 'bg-[var(--accent)] text-white shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    title="বাংলা পরিভাষা (ইসম, ফেল, মুবতাদা, খবর)"
                  >
                    বাংলা
                  </button>
                </div>

                {progress.completedGrammarIds.includes(activeTopic.id) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--emerald-highlight)] text-[var(--success)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.common.completed}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      completeGrammarTopic(activeTopic.id, activeTopic.titleBn, activeTopic.titleEn)
                    }
                    className="px-4 py-2 rounded-full text-xs btn-primary font-bold"
                  >
                    অধ্যায় সম্পন্ন করুন (+35 XP)
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 pb-4 border-b border-[var(--border-subtle)]">
              <p className="text-base font-bold text-[var(--text-primary)] leading-[1.8]">
                {localizeGrammarLabel(activeTopic.summaryBn, grammarTerminologyMode)}
              </p>
              <p className="text-[15.5px] sm:text-base text-[var(--text-secondary)] leading-[1.85]">
                {lang === 'bn'
                  ? localizeGrammarLabel(activeTopic.explanationBn, grammarTerminologyMode)
                  : activeTopic.explanationEn}
              </p>
            </div>

            <div className="rounded-3xl surface-alt border border-[var(--border-subtle)] p-5 space-y-2.5">
              <div className="text-sm font-extrabold text-[var(--accent)]">মূল নিয়মাবলি:</div>
              <ul className="list-disc ps-5 space-y-2 text-[15.5px] sm:text-base text-[var(--text-primary)] leading-[1.85]">
                {activeTopic.rulesBn.map((r, i) => (
                  <li key={i}>{localizeGrammarLabel(r, grammarTerminologyMode)}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <h3 className="text-base font-extrabold text-[var(--accent)]">উদাহরণ ও পদ-বিশ্লেষণ (হারাকাতসহ):</h3>
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeTopic.examples.map((ex, idx) => {
                  const showTarkib = expandedExampleIdx === idx;
                  return (
                    <div key={idx} className="py-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <QuickNahwText
                            text={ex.arabic}
                            showSentenceTarkibButton={false}
                            className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <AudioButton text={ex.arabic} compact />
                          {ex.arabic.trim().split(/\s+/).length >= 2 && (
                            <button
                              type="button"
                              onClick={() => setExpandedExampleIdx(showTarkib ? null : idx)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                showTarkib ? 'btn-primary' : 'btn-secondary'
                              }`}
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>{showTarkib ? 'ট্রি লুকান' : 'তারকিব ট্রি'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        উচ্চারণ: <span className="font-semibold text-[var(--text-primary)]">{ex.pronunciationBn}</span>
                      </div>
                      <div className="text-[15.5px] sm:text-base font-bold text-[var(--text-primary)]">
                        বাংলা অর্থ: {ex.meaningBn}
                      </div>
                      <div className="text-[15px] text-[var(--text-secondary)] leading-[1.8]">
                        <span className="font-bold text-[var(--accent)]">নাহু/ছরফ বিশ্লেষণ: </span>
                        {localizeGrammarLabel(ex.analysisBn, grammarTerminologyMode)}
                      </div>
                      {showTarkib && (
                        <TarkibVisualizer
                          sentenceAr={ex.arabic}
                          translationBn={ex.meaningBn}
                          compact
                          onClose={() => setExpandedExampleIdx(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Practice Quiz */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-base font-extrabold text-[var(--accent)]">অনুশীলন প্রশ্ন:</h3>
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeTopic.quiz.map((q) => {
                  const chosen = quizChoice[q.id];
                  const isCorrect = chosen === q.correctIndex;
                  return (
                    <div key={q.id} className="py-4 space-y-2.5">
                      <div className="text-base font-bold">{lang === 'bn' ? q.questionBn : q.questionEn}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              triggerSound(idx === q.correctIndex ? 'success' : 'error');
                              setQuizChoice((prev) => ({ ...prev, [q.id]: idx }));
                            }}
                            className={`px-4 py-3 rounded-2xl text-[15px] text-left border ${
                              chosen === idx
                                ? idx === q.correctIndex
                                  ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-bold'
                                  : 'border-[var(--danger)] bg-[var(--danger)]/10'
                                : 'border-[var(--border-subtle)] surface-alt hover:border-[var(--border-strong)]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {chosen !== undefined && (
                        <div className={`text-sm font-medium ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                          {q.explanationBn}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embedded Scoped AI Grammar Practice */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
              <button
                type="button"
                onClick={() => setShowScopedAi((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold btn-primary"
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
