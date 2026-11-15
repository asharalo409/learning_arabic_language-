import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Home,
  Layers,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { buildDetailedLessonForSlot } from '../data/lessonGenerator';
import { saveChapterOffline, useOfflineManifest } from '../utils/offlineCache';

const LESSON_ACCENTS = [
  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
  'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
];

export const ChapterDetailPage: React.FC = () => {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const { lang, progress, allChapters, allDetailedLessons, triggerSound, toggleFavoriteLesson } = useApp();
  const offlineManifest = useOfflineManifest();
  const [downloadingChapter, setDownloadingChapter] = useState(false);

  const chNum = Math.max(1, Math.min(100, Number(chapterNumber) || 1));
  const chapter = allChapters.find((c) => c.chapterNumber === chNum) || allChapters[0];

  const completedCount = chapter.lessons.filter((l) =>
    progress.completedLessonIds.includes(`ch${chapter.chapterNumber}-l${l.lessonNumber}`)
  ).length;

  const savedInChapterCount = chapter.lessons.filter((l) =>
    offlineManifest.downloadedLessonIds.includes(`ch${chapter.chapterNumber}-l${l.lessonNumber}`)
  ).length;
  const allSavedInChapter = savedInChapterCount === chapter.lessons.length;

  const handleDownloadChapterOffline = async () => {
    setDownloadingChapter(true);
    try {
      const builtLessons = chapter.lessons.map((l) => {
        const lid = `ch${chapter.chapterNumber}-l${l.lessonNumber}`;
        return allDetailedLessons[lid] || buildDetailedLessonForSlot(chapter, l.lessonNumber);
      });
      await saveChapterOffline(chapter, builtLessons);
      triggerSound('success');
    } finally {
      setDownloadingChapter(false);
    }
  };

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
        {/* Top Exit, Offline Download & Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold btn-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{lang === 'bn' ? '১০০ ধাপ সূচি' : 'All Chapters'}</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold btn-secondary"
            >
              <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
            </Link>

            <button
              type="button"
              onClick={() => void handleDownloadChapterOffline()}
              disabled={downloadingChapter}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                allSavedInChapter
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35'
                  : 'btn-primary'
              }`}
            >
              {allSavedInChapter ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>সব ১০ পাঠ অফলাইনে সংরক্ষিত</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {downloadingChapter ? 'সেভ হচ্ছে...' : 'সম্পূর্ণ অধ্যায় অফলাইন ডাউনলোড'}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {prevChapter && (
              <Link
                to={`/courses/chapter/${prevChapter}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium btn-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>অধ্যায় {prevChapter}</span>
              </Link>
            )}
            {nextChapter && (
              <Link
                to={`/courses/chapter/${nextChapter}`}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium btn-secondary"
              >
                <span>অধ্যায় {nextChapter}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Gradient Chapter Overview Hero Banner */}
        <div
          className="rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-3"
          style={{ background: LESSON_ACCENTS[(chapter.chapterNumber - 1) % LESSON_ACCENTS.length] }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex flex-wrap items-center gap-2 text-xs font-bold text-white/90">
                <Layers className="w-4 h-4" />
                <span>অধ্যায় {chapter.chapterNumber}</span>
                <span>·</span>
                <span>স্তর {chapter.level}</span>
                <span>·</span>
                <span>{chapter.track}</span>
              </div>
              <p className="font-arabic text-3xl text-amber-200" dir="rtl">
                {chapter.titleAr}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold">
                {lang === 'bn' ? chapter.titleBn : chapter.titleEn}
              </h2>
            </div>

            <div className="rounded-2xl bg-black/20 backdrop-blur-md px-4 py-3 text-center shrink-0 min-w-[120px] space-y-1.5">
              <div className="text-[11px] text-white/80">সম্পন্ন পাঠ</div>
              <div className="text-xl font-extrabold font-mono-num">
                {completedCount} / 10
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all duration-500"
                  style={{ width: `${Math.round((completedCount / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-sm sm:text-base text-white/95 leading-relaxed pt-1 border-t border-white/20">
            {lang === 'bn' ? chapter.objectiveBn : chapter.objectiveEn}
          </p>
        </div>

        {/* Clean 10 Lesson Tiles */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] px-1">
            {lang === 'bn' ? `অধ্যায় ${chapter.chapterNumber}-এর ১০টি পাঠ:` : '10 Lessons in This Chapter'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chapter.lessons.map((lesson, idx) => {
              const lessonId = `ch${chapter.chapterNumber}-l${lesson.lessonNumber}`;
              const hasRich = Boolean(allDetailedLessons[lessonId]);
              const isDone = progress.completedLessonIds.includes(lessonId);
              const isBookmarked = (progress.favoriteLessonIds || []).includes(lessonId);
              const isSaved = offlineManifest.downloadedLessonIds.includes(lessonId);
              const badgeGrad = LESSON_ACCENTS[idx % LESSON_ACCENTS.length];

              return (
                <Link
                  key={lesson.lessonNumber}
                  to={`/courses/lesson/${chapter.chapterNumber}/${lesson.lessonNumber}`}
                  className="surface-card rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3.5 hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl text-white font-mono-num font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md"
                      style={{ background: badgeGrad }}
                    >
                      {chapter.chapterNumber}.{lesson.lessonNumber}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="text-[15px] sm:text-base font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                        {lang === 'bn' ? lesson.titleBn : lesson.titleEn}
                      </div>
                      <div className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                        <span>{isDone ? 'সম্পন্ন · পুনরায় দেখুন' : hasRich ? 'পূর্ণাঙ্গ পাঠ ও সংলাপ' : 'পাঠ শুরু করুন'}</span>
                        {isSaved && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">· অফলাইন ✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavoriteLesson(lessonId);
                      }}
                      title={isBookmarked ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় সংরক্ষণ করুন'}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                      className={`p-1.5 rounded-full transition-colors ${
                        isBookmarked
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--bg-surface-alt)]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                    )}
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
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
