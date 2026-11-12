import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Home,
  Layers,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';

export const ChapterDetailPage: React.FC = () => {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const { lang, progress, allChapters, allDetailedLessons } = useApp();

  const chNum = Math.max(1, Math.min(100, Number(chapterNumber) || 1));
  const chapter = allChapters.find((c) => c.chapterNumber === chNum) || allChapters[0];

  const completedCount = chapter.lessons.filter((l) =>
    progress.completedLessonIds.includes(`ch${chapter.chapterNumber}-l${l.lessonNumber}`)
  ).length;

  const prevChapter = chapter.chapterNumber > 1 ? chapter.chapterNumber - 1 : null;
  const nextChapter = chapter.chapterNumber < allChapters.length ? chapter.chapterNumber + 1 : null;

  return (
    <AppShell
      title={
        lang === 'bn'
          ? `অধ্যায় ${chapter.chapterNumber}: ${chapter.titleBn}`
          : `Chapter ${chapter.chapterNumber}: ${chapter.titleEn}`
      }
      subtitle={
        lang === 'bn'
          ? `স্তর ${chapter.level} · ${chapter.track} · ১০টি ধারাবাহিক পাঠ`
          : `Level ${chapter.level} · ${chapter.track} · 10 Structured Lessons`
      }
    >
      <div className="space-y-6">
        {/* Clear Top Exit & Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{lang === 'bn' ? '১০০ অধ্যায় সূচিতে ফিরুন' : 'All Chapters'}</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
            >
              <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {prevChapter && (
              <Link
                to={`/courses/chapter/${prevChapter}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium btn-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>অধ্যায় {prevChapter}</span>
              </Link>
            )}
            {nextChapter && (
              <Link
                to={`/courses/chapter/${nextChapter}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium btn-secondary"
              >
                <span>অধ্যায় {nextChapter}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Chapter Overview Hero Card */}
        <div className="surface-card rounded-2xl p-6 space-y-4 border border-[var(--border-strong)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--accent)]">
                <Layers className="w-4 h-4" />
                <span>অধ্যায় {chapter.chapterNumber}</span>
                <span aria-hidden="true">|</span>
                <span>স্তর {chapter.level}</span>
                <span aria-hidden="true">|</span>
                <span>{chapter.track}</span>
              </div>
              <p className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                {chapter.titleAr}
              </p>
              <h2 className="text-2xl font-bold">
                {lang === 'bn' ? chapter.titleBn : chapter.titleEn}
              </h2>
            </div>

            <div className="surface-alt rounded-xl px-4 py-3 text-center shrink-0">
              <div className="text-[11px] text-[var(--text-muted)]">অগ্রগতি</div>
              <div className="text-xl font-bold font-mono-num text-[var(--accent)]">
                {completedCount} / 10
              </div>
            </div>
          </div>

          <div className="surface-alt rounded-xl p-4 space-y-1">
            <div className="text-xs font-semibold text-[var(--accent)]">অধ্যায়ের লক্ষ্য ও বিষয়বস্তু:</div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {lang === 'bn' ? chapter.objectiveBn : chapter.objectiveEn}
            </p>
          </div>
        </div>

        {/* Clean 10 Lessons Directory Linking to Dedicated Lesson Pages */}
        <div className="space-y-3">
          <h3 className="text-base font-bold px-1">
            {lang === 'bn' ? `অধ্যায় ${chapter.chapterNumber}-এর ১০টি পাঠ (যেকোনো পাঠে প্রবেশ করুন)` : '10 Lessons in This Chapter'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {chapter.lessons.map((lesson) => {
              const lessonId = `ch${chapter.chapterNumber}-l${lesson.lessonNumber}`;
              const hasRich = Boolean(allDetailedLessons[lessonId]);
              const isDone = progress.completedLessonIds.includes(lessonId);

              return (
                <Link
                  key={lesson.lessonNumber}
                  to={`/courses/lesson/${chapter.chapterNumber}/${lesson.lessonNumber}`}
                  className="surface-card rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[var(--border-strong)] transition-all group"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-md bg-[var(--emerald-highlight)] text-[var(--accent)] font-mono-num font-bold">
                        পাঠ {chapter.chapterNumber}.{lesson.lessonNumber}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {hasRich ? 'পূর্ণাঙ্গ পাঠ ও ১৬ সংলাপ' : 'মাবাদি + সংলাপ + শব্দভাণ্ডার + AI চর্চা'}
                      </span>
                    </div>

                    <div className="text-base font-bold text-[var(--text-primary)] leading-snug">
                      {lang === 'bn' ? lesson.titleBn : lesson.titleEn}
                    </div>

                    <div className="text-xs font-medium text-[var(--accent)] inline-flex items-center gap-1 pt-0.5">
                      <span>{isDone ? 'সম্পন্ন · পুনরায় পড়ুন' : 'নতুন পৃষ্ঠায় পাঠ শুরু করুন'}</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-xl surface-alt flex items-center justify-center shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-[var(--accent)]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
