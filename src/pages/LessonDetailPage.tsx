import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Home,
  Mic,
  MicOff,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { useApp } from '../context/AppContext';
import { buildDetailedLessonForSlot } from '../data/lessonGenerator';
import { DetailedLesson } from '../types/academy';
import { startVoiceRecognition } from '../utils/speech';

type LessonTab = 'overview' | 'vocab' | 'grammar' | 'dialogue' | 'practice' | 'quiz' | 'ai-practice';

export const LessonDetailPage: React.FC = () => {
  const { chapterNumber, lessonNumber } = useParams<{ chapterNumber: string; lessonNumber: string }>();
  const { t, lang, progress, allChapters, allDetailedLessons, completeLesson, awardXp, triggerSound } = useApp();

  const chNum = Math.max(1, Math.min(100, Number(chapterNumber) || 1));
  const lsNum = Math.max(1, Math.min(10, Number(lessonNumber) || 1));

  const chapter = allChapters.find((c) => c.chapterNumber === chNum) || allChapters[0];
  const lessonId = `ch${chapter.chapterNumber}-l${lsNum}`;

  const activeLesson: DetailedLesson = useMemo(() => {
    return allDetailedLessons[lessonId] || buildDetailedLessonForSlot(chapter, lsNum);
  }, [allDetailedLessons, lessonId, chapter, lsNum]);

  const [activeTab, setActiveTab] = useState<LessonTab>('overview');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [aiWritingFeedback, setAiWritingFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [revealedTransIdx, setRevealedTransIdx] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [listeningMic, setListeningMic] = useState(false);

  // Reset per-lesson state & scroll to top when navigating between lessons
  useEffect(() => {
    setActiveTab('overview');
    setWritingAnswer('');
    setAiWritingFeedback(null);
    setRevealedTransIdx([]);
    setQuizAnswers({});
    window.scrollTo({ top: 0 });
  }, [chNum, lsNum]);

  const lessonScopeContext = useMemo(() => {
    const vocabLines = activeLesson.newVocabulary
      .map((v) => `- ${v.arabic} (${v.pronunciationBn}): ${v.meaningBn}${v.root ? ` [মূলধাতু/নোট: ${v.root}]` : ''}`)
      .join('\n');
    const dialogueSample = activeLesson.conversation
      .slice(0, 6)
      .map((d) => `${d.speaker}: ${d.arabic} (${d.translationBn})`)
      .join('\n');

    return [
      `পাঠ: অধ্যায় ${activeLesson.chapterNumber}, পাঠ ${activeLesson.lessonNumber} — ${activeLesson.titleBn}`,
      `ব্যাকরণ বিষয়: ${activeLesson.grammarTopicBn} (${activeLesson.grammarTopicAr})`,
      `ব্যাকরণ সারসংক্ষেপ: ${activeLesson.grammarExplanationBn}`,
      `এই পাঠের নতুন শব্দভাণ্ডার:\n${vocabLines}`,
      `সংলাপের নমুনা:\n${dialogueSample}`,
    ].join('\n\n');
  }, [activeLesson]);

  const starterQuestions = useMemo(
    () => [
      `"${activeLesson.titleBn}" পাঠের শব্দগুলো দিয়ে আমাকে ১টি প্রশ্ন করুন।`,
      `এই পাঠের সংলাপ থেকে একটি আরবি বাক্য দিন, আমি অর্থ বলব।`,
      `"${activeLesson.grammarTopicBn}" নিয়মটি এই পাঠের উদাহরণ দিয়ে অনুশীলন করান।`,
    ],
    [activeLesson]
  );

  const handleCheckWritingWithAi = async () => {
    if (!writingAnswer.trim() || aiLoading) return;
    setAiLoading(true);
    setAiWritingFeedback(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'correct-writing',
          level: `Chapter ${activeLesson.chapterNumber}, Lesson ${activeLesson.lessonNumber}`,
          interfaceLang: lang,
          message: `Lesson: ${activeLesson.titleBn}\nGrammar focus: ${activeLesson.grammarTopicBn}\nPrompt: ${activeLesson.writingPromptBn}\nExpected hint: ${activeLesson.writingTargetHintAr}\nStudent wrote: ${writingAnswer}`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'লেখা যাচাই করা যায়নি।');
      setAiWritingFeedback(data.reply);
      awardXp(15, {
        titleBn: `লেখার অনুশীলন: পাঠ ${activeLesson.chapterNumber}.${activeLesson.lessonNumber}`,
        titleEn: `Writing practice: Lesson ${activeLesson.chapterNumber}.${activeLesson.lessonNumber}`,
        type: 'ai',
      });
    } catch (err: unknown) {
      setAiWritingFeedback(err instanceof Error ? err.message : 'লেখা যাচাই করতে সমস্যা হয়েছে।');
    } finally {
      setAiLoading(false);
    }
  };

  const prevLink =
    lsNum > 1
      ? `/courses/lesson/${chNum}/${lsNum - 1}`
      : chNum > 1
      ? `/courses/lesson/${chNum - 1}/10`
      : null;

  const nextLink =
    lsNum < 10
      ? `/courses/lesson/${chNum}/${lsNum + 1}`
      : chNum < allChapters.length
      ? `/courses/lesson/${chNum + 1}/1`
      : null;

  const isDone = progress.completedLessonIds.includes(activeLesson.id);

  return (
    <AppShell
      title={`অধ্যায় ${activeLesson.chapterNumber} · পাঠ ${activeLesson.lessonNumber}`}
      subtitle={lang === 'bn' ? activeLesson.titleBn : activeLesson.titleEn}
    >
      <div className="space-y-6">
        {/* Top Exit & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/courses/chapter/${activeLesson.chapterNumber}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>অধ্যায় {activeLesson.chapterNumber}-এ ফিরুন</span>
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium btn-secondary"
            >
              <span>১০০ অধ্যায়</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium btn-secondary"
            >
              <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>হোম</span>
            </Link>
          </div>

          {isDone ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--emerald-highlight)] text-[var(--success)]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.common.completed}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => completeLesson(activeLesson.id, activeLesson.titleBn, activeLesson.titleEn)}
              className="px-4 py-2 rounded-xl text-xs btn-primary font-bold"
            >
              {t.common.markComplete} (+50 XP)
            </button>
          )}
        </div>

        {/* Dedicated Top-of-Page Lesson Reader Card */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-6 border border-[var(--border-strong)]">
          {/* Header */}
          <div className="pb-4 border-b border-[var(--border-subtle)] space-y-2 pt-1">
            <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--accent)]">
              <span>অধ্যায় {activeLesson.chapterNumber}</span>
              <span aria-hidden="true">|</span>
              <span>পাঠ {activeLesson.lessonNumber}</span>
              <span aria-hidden="true">|</span>
              <span>স্তর {chapter.level}</span>
              <span aria-hidden="true">|</span>
              <span>{activeLesson.track}</span>
            </div>
            <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] leading-loose" dir="rtl">
              {activeLesson.titleAr}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              {lang === 'bn' ? activeLesson.titleBn : activeLesson.titleEn}
            </h2>
          </div>

          {/* Clean Single-Row Horizontal Scrollable Tab Bar (No pill clutter) */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)] -mx-2 px-2 pb-px">
            {(
              [
                { id: 'overview', labelBn: 'উদ্দেশ্য', labelEn: 'Objectives' },
                { id: 'vocab', labelBn: 'শব্দভাণ্ডার', labelEn: 'Vocabulary' },
                { id: 'grammar', labelBn: 'ব্যাকরণ', labelEn: 'Grammar' },
                { id: 'dialogue', labelBn: `সংলাপ (${activeLesson.conversation.length})`, labelEn: 'Dialogue' },
                { id: 'practice', labelBn: 'লেখা ও অনুবাদ', labelEn: 'Practice' },
                { id: 'quiz', labelBn: 'কুইজ', labelEn: 'Quiz' },
                { id: 'ai-practice', labelBn: 'AI চর্চা', labelEn: 'AI Practice' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                    active
                      ? 'border-[var(--accent)] text-[var(--accent)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Objectives & Revision */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="surface-alt rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-[var(--accent)]">
                  পাঠের শিখনফল (Learning Objectives)
                </h3>
                <ul className="space-y-2.5 text-sm text-[var(--text-secondary)] list-disc ps-5 leading-relaxed">
                  {(lang === 'bn' ? activeLesson.objectivesBn : activeLesson.objectivesEn).map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div className="surface-alt rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-[var(--accent)]">
                  পূর্ববর্তী শব্দ পুনরালোচনা (সফওয়াতুল মাসাদির)
                </h3>
                <div className="space-y-3">
                  {activeLesson.revisionVocabulary.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                          {v.arabic}
                        </span>
                        <AudioButton text={v.arabic} compact />
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div>
                          <span className="text-[var(--text-muted)]">উচ্চারণ: </span>
                          <span className="font-medium text-[var(--text-primary)]">{v.pronunciationBn}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">বাংলা অর্থ: </span>
                          <span className="font-semibold text-[var(--text-primary)]">{v.meaningBn}</span>
                        </div>
                        {v.root && (
                          <div>
                            <span className="text-[var(--text-muted)]">মূলধাতু ও ক্রিয়া: </span>
                            <span className="font-arabic-ui text-[var(--text-secondary)]">{v.root}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cleanly Separated Vocabulary Cards */}
          {activeTab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLesson.newVocabulary.map((word) => (
                <div
                  key={word.id}
                  className="surface-alt rounded-xl p-4 sm:p-5 space-y-3 border border-[var(--border-subtle)]"
                >
                  <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                        {word.arabic}
                      </p>
                      <div className="text-xs text-[var(--text-muted)]">
                        উচ্চারণ: <span className="font-semibold text-[var(--text-primary)]">{word.pronunciationBn}</span>
                      </div>
                    </div>
                    <AudioButton text={word.arabic} showSlow compact />
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">বাংলা অর্থ: </span>
                      <span className="font-bold text-[var(--text-primary)]">{word.meaningBn}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">ইংরেজি: </span>
                      <span className="text-xs text-[var(--text-secondary)]">{word.meaningEn}</span>
                    </div>
                    {word.category && (
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">শ্রেণি / বাব: </span>
                        <span className="text-xs font-medium text-[var(--accent)]">{word.category}</span>
                      </div>
                    )}
                    {word.root && (
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">মূলধাতু / নোট: </span>
                        <span className="font-arabic-ui text-xs text-[var(--text-secondary)]">{word.root}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[var(--accent)]">বাক্যে উদাহরণ:</span>
                      <AudioButton text={word.exampleAr} compact showSlow={false} />
                    </div>
                    <p className="font-arabic text-lg text-[var(--text-primary)]" dir="rtl">
                      {word.exampleAr}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{word.exampleBn}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Clean Grammar Explanation & Examples */}
          {activeTab === 'grammar' && (
            <div className="space-y-5">
              <div className="surface-alt rounded-xl p-5 space-y-3">
                <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                  {activeLesson.grammarTopicAr}
                </p>
                <h3 className="text-lg font-bold">{activeLesson.grammarTopicBn}</h3>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {lang === 'bn' ? activeLesson.grammarExplanationBn : activeLesson.grammarExplanationEn}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[var(--accent)]">উদাহরণ ও পদ-বিশ্লেষণ:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeLesson.grammarExamples.map((ex, i) => (
                    <div key={i} className="surface-alt rounded-xl p-4 space-y-2 border border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                          {ex.arabic}
                        </p>
                        <AudioButton text={ex.arabic} compact />
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div>
                          <span className="text-[var(--text-muted)]">উচ্চারণ: </span>
                          <span className="font-medium">{ex.pronunciationBn}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">বাংলা অর্থ: </span>
                          <span className="font-semibold">{ex.meaningBn}</span>
                        </div>
                        {ex.meaningEn && ex.meaningEn !== ex.meaningBn && (
                          <div className="pt-1 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                            <span className="font-semibold text-[var(--accent)]">বিশ্লেষণ: </span>
                            {ex.meaningEn}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 15-20 Line Dialogue */}
          {activeTab === 'dialogue' && (
            <div className="space-y-4">
              <div className="surface-alt rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[var(--accent)]">
                  {activeLesson.conversation.length} লাইনের বাস্তবসম্মত আরবি সংলাপ
                </h3>
                <AudioButton text={activeLesson.conversation.map((c) => c.arabic).join(' ')} showSlow />
              </div>

              <div className="space-y-3">
                {activeLesson.conversation.map((line, index) => (
                  <div
                    key={index}
                    className="surface-alt rounded-xl p-4 sm:p-5 space-y-2.5 border border-[var(--border-subtle)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-[var(--accent)]">
                        <span className="font-mono-num me-2">{String(index + 1).padStart(2, '0')}.</span>
                        <span className="font-arabic-ui text-sm me-2">{line.speaker}</span>
                        <span className="text-[var(--text-muted)] font-normal">({line.speakerRoleBn})</span>
                      </div>
                      <AudioButton text={line.arabic} showSlow compact />
                    </div>
                    <p className="font-arabic text-2xl text-[var(--text-primary)] leading-relaxed" dir="rtl">
                      {line.arabic}
                    </p>
                    <div className="space-y-1 text-xs sm:text-sm pt-1 border-t border-[var(--border-subtle)]">
                      <div>
                        <span className="text-[var(--text-muted)]">উচ্চারণ: </span>
                        <span className="font-medium text-[var(--text-secondary)]">{line.pronunciationBn}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">বাংলা অনুবাদ: </span>
                        <span className="font-semibold text-[var(--text-primary)]">{line.translationBn}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Writing & Translation */}
          {activeTab === 'practice' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="surface-alt rounded-xl p-5 space-y-3.5">
                <h3 className="font-bold text-sm text-[var(--accent)]">
                  আরবি লেখার অনুশীলন ও AI সংশোধন
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {lang === 'bn' ? activeLesson.writingPromptBn : activeLesson.writingPromptEn}
                </p>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={writingAnswer}
                  onChange={(e) => setWritingAnswer(e.target.value)}
                  placeholder="اكتب الجملة العربية هنا..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-lg focus:outline-none focus:border-[var(--accent)]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (listeningMic) return;
                      setListeningMic(true);
                      startVoiceRecognition('ar-SA', {
                        onResult: (transcript) => {
                          setListeningMic(false);
                          setWritingAnswer(transcript);
                        },
                        onError: (msg) => {
                          setListeningMic(false);
                          setAiWritingFeedback(msg);
                        },
                        onEnd: () => setListeningMic(false),
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs ${
                      listeningMic ? 'bg-[var(--danger)] text-white' : 'btn-secondary'
                    }`}
                  >
                    {listeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent)]" />}
                    <span>{listeningMic ? 'শুনছি...' : 'ভয়েসে বলুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckWritingWithAi}
                    disabled={aiLoading || !writingAnswer.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs btn-primary disabled:opacity-50"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{aiLoading ? 'যাচাই হচ্ছে...' : 'AI দিয়ে লেখা যাচাই করুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWritingAnswer(activeLesson.writingTargetHintAr)}
                    className="px-3 py-2 rounded-xl text-xs btn-secondary"
                  >
                    নমুনা উত্তর বসান
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai-practice')}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    এই পাঠ নিয়ে AI চর্চায় যান →
                  </button>
                </div>
                {aiWritingFeedback && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm whitespace-pre-wrap leading-relaxed">
                    {aiWritingFeedback}
                  </div>
                )}
              </div>

              <div className="surface-alt rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-[var(--accent)]">অনুবাদ অনুশীলন</h3>
                {activeLesson.translationExercises.map((ex, idx) => {
                  const revealed = revealedTransIdx.includes(idx);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2"
                    >
                      <div className="text-xs font-semibold text-[var(--accent)]">
                        {ex.direction === 'ar-to-bn' ? 'আরবি → বাংলা অনুবাদ' : 'বাংলা → আরবি অনুবাদ'}
                      </div>
                      <p className={ex.direction === 'ar-to-bn' ? 'font-arabic text-xl' : 'text-sm font-medium'}>
                        {ex.prompt}
                      </p>
                      <div className="text-xs text-[var(--text-muted)]">ইঙ্গিত: {ex.hint}</div>
                      {revealed ? (
                        <p className="text-sm font-semibold text-[var(--success)] pt-1">{ex.answer}</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRevealedTransIdx((prev) => [...prev, idx])}
                          className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
                        >
                          উত্তর দেখুন
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {activeLesson.quiz.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const isAnswered = chosen !== undefined;
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div key={q.id} className="surface-alt rounded-xl p-5 space-y-3">
                    <div className="text-sm font-bold">
                      {qIdx + 1}. {lang === 'bn' ? q.questionBn : q.questionEn}
                    </div>
                    {q.arabicPrompt && (
                      <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                        {q.arabicPrompt}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            triggerSound(oIdx === q.correctIndex ? 'success' : 'error');
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                          }}
                          className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                            chosen === oIdx
                              ? oIdx === q.correctIndex
                                ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold'
                                : 'border-[var(--danger)] bg-[var(--danger)]/10'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {isAnswered && (
                      <div className={`text-xs font-medium ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                        {isCorrect ? 'সঠিক উত্তর! ' : 'আবার দেখুন: '}
                        {lang === 'bn' ? q.explanationBn : q.explanationEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 7: Embedded Strictly Scoped AI Lesson Practice */}
          {activeTab === 'ai-practice' && (
            <LessonAiPracticePanel
              lessonTitle={`অধ্যায় ${activeLesson.chapterNumber} · পাঠ ${activeLesson.lessonNumber}: ${activeLesson.titleBn}`}
              lessonScopeContext={lessonScopeContext}
              starterQuestions={starterQuestions}
              levelLabel={`Level ${chapter.level}`}
            />
          )}
        </div>

        {/* Clean Footer Lesson Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {prevLink ? (
            <Link
              to={prevLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
              <span>পূর্ববর্তী পাঠ</span>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/chapter/${activeLesson.chapterNumber}`}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary"
            >
              অধ্যায় {activeLesson.chapterNumber} সূচি
            </Link>
            {nextLink && (
              <Link
                to={nextLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold btn-primary"
              >
                <span>পরবর্তী পাঠ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
