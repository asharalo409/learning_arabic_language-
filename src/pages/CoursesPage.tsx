import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, Crown, Layers, Play, ScrollText, Search, Sparkles, Star, X } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { QURAN_ALL_SHORT_SURAHS } from '../data/quranicData';
import { ChapterInfo, CurriculumLevelNumber, LearningTrack, SyllabusLessonStub, VocabItem } from '../types/academy';

function stripArabicHarakat(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

const LEVEL_THEMES: Record<
  CurriculumLevelNumber,
  { accentBg: string; ringColor: string; bannerGrad: string; labelBn: string }
> = {
  1: {
    accentBg: 'from-emerald-500 to-teal-600',
    ringColor: '#10b981',
    bannerGrad: 'linear-gradient(135deg, #065f46 0%, #0f766e 100%)',
    labelBn: 'স্তর ১ · প্রারম্ভিক',
  },
  2: {
    accentBg: 'from-sky-500 to-blue-600',
    ringColor: '#0ea5e9',
    bannerGrad: 'linear-gradient(135deg, #075985 0%, #1d4ed8 100%)',
    labelBn: 'স্তর ২ · প্রাথমিক',
  },
  3: {
    accentBg: 'from-indigo-500 to-violet-600',
    ringColor: '#6366f1',
    bannerGrad: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)',
    labelBn: 'স্তর ৩ · প্রাক-মধ্যম',
  },
  4: {
    accentBg: 'from-amber-500 to-orange-600',
    ringColor: '#f59e0b',
    bannerGrad: 'linear-gradient(135deg, #92400e 0%, #c2410c 100%)',
    labelBn: 'স্তর ৪ · মধ্যম',
  },
  5: {
    accentBg: 'from-rose-500 to-pink-600',
    ringColor: '#f43f5e',
    bannerGrad: 'linear-gradient(135deg, #9f1239 0%, #be185d 100%)',
    labelBn: 'স্তর ৫ · উচ্চ-মধ্যম',
  },
  6: {
    accentBg: 'from-purple-600 to-fuchsia-600',
    ringColor: '#a855f7',
    bannerGrad: 'linear-gradient(135deg, #581c87 0%, #86198f 100%)',
    labelBn: 'স্তর ৬ · উচ্চতর',
  },
};

// Smooth horizontal wave offsets (px) to create Duolingo-like single-line winding path
const WAVE_OFFSETS = [0, 36, 56, 36, 0, -36, -56, -36];

export const CoursesPage: React.FC<{ initialLevel?: CurriculumLevelNumber }> = ({ initialLevel }) => {
  const { t, lang, progress, allChapters, allVocabulary } = useApp();
  const [searchParams] = useSearchParams();

  const chParam = searchParams.get('chapter');
  const lsParam = searchParams.get('lesson');

  const [levelFilter, setLevelFilter] = useState<CurriculumLevelNumber | 'all'>(initialLevel ?? 'all');
  const [trackFilter, setTrackFilter] = useState<LearningTrack | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'chapters' | 'lessons' | 'vocab'>('all');

  useEffect(() => {
    const lvlParam = searchParams.get('level');
    if (lvlParam) {
      const parsed = Number(lvlParam) as CurriculumLevelNumber;
      if (parsed >= 1 && parsed <= 6) setLevelFilter(parsed);
    } else if (initialLevel) {
      setLevelFilter(initialLevel);
    }
  }, [searchParams, initialLevel]);

  // Calculate exact progress across all 6 Levels ("কোন লেভেল পড়লাম তার হিসাব")
  const levelStats = useMemo(() => {
    return CURRICULUM_LEVELS.map((lvl) => {
      const chaptersInLvl = allChapters.filter((c) => c.level === lvl.level);
      const totalLessons = chaptersInLvl.length * 10;
      let completedLessons = 0;
      let completedChapters = 0;
      let startedChapters = 0;

      for (const ch of chaptersInLvl) {
        const doneInCh = ch.lessons.filter((l) =>
          progress.completedLessonIds.includes(`ch${ch.chapterNumber}-l${l.lessonNumber}`)
        ).length;
        completedLessons += doneInCh;
        if (doneInCh === 10) completedChapters += 1;
        if (doneInCh > 0) startedChapters += 1;
      }

      const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        ...lvl,
        totalChapters: chaptersInLvl.length,
        totalLessons,
        completedLessons,
        completedChapters,
        startedChapters,
        pct,
      };
    });
  }, [allChapters, progress.completedLessonIds]);

  const totalCompletedLessons = progress.completedLessonIds.length;
  const totalCompletedChapters = useMemo(() => {
    return allChapters.filter((ch) =>
      ch.lessons.every((l) =>
        progress.completedLessonIds.includes(`ch${ch.chapterNumber}-l${l.lessonNumber}`)
      )
    ).length;
  }, [allChapters, progress.completedLessonIds]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedArabicQuery = stripArabicHarakat(searchQuery.trim());

  const globalSearch = useMemo(() => {
    if (!normalizedQuery) {
      return {
        chapters: [] as ChapterInfo[],
        lessons: [] as { chapter: ChapterInfo; lesson: SyllabusLessonStub }[],
        vocab: [] as VocabItem[],
      };
    }

    const matchedChapters = allChapters.filter((ch) => {
      if (levelFilter !== 'all' && ch.level !== levelFilter) return false;
      if (trackFilter !== 'all' && ch.track !== trackFilter) return false;
      return (
        ch.titleBn.toLowerCase().includes(normalizedQuery) ||
        ch.titleEn.toLowerCase().includes(normalizedQuery) ||
        ch.objectiveBn.toLowerCase().includes(normalizedQuery) ||
        stripArabicHarakat(ch.titleAr).includes(normalizedArabicQuery) ||
        String(ch.chapterNumber) === normalizedQuery ||
        `অধ্যায় ${ch.chapterNumber}`.includes(normalizedQuery)
      );
    });

    const matchedLessons: { chapter: ChapterInfo; lesson: SyllabusLessonStub }[] = [];
    for (const ch of allChapters) {
      if (levelFilter !== 'all' && ch.level !== levelFilter) continue;
      if (trackFilter !== 'all' && ch.track !== trackFilter) continue;
      for (const ls of ch.lessons) {
        const refCode = `${ch.chapterNumber}.${ls.lessonNumber}`;
        if (
          ls.titleBn.toLowerCase().includes(normalizedQuery) ||
          ls.titleEn.toLowerCase().includes(normalizedQuery) ||
          ls.grammarFocus.toLowerCase().includes(normalizedQuery) ||
          stripArabicHarakat(ls.titleAr).includes(normalizedArabicQuery) ||
          refCode === normalizedQuery
        ) {
          matchedLessons.push({ chapter: ch, lesson: ls });
          if (matchedLessons.length >= 18) break;
        }
      }
      if (matchedLessons.length >= 18) break;
    }

    const matchedVocab: VocabItem[] = [];
    for (const v of allVocabulary) {
      if (levelFilter !== 'all' && v.level && v.level !== levelFilter) continue;
      if (
        stripArabicHarakat(v.arabic).includes(normalizedArabicQuery) ||
        v.pronunciationBn.toLowerCase().includes(normalizedQuery) ||
        v.meaningBn.toLowerCase().includes(normalizedQuery) ||
        v.meaningEn.toLowerCase().includes(normalizedQuery) ||
        v.category.toLowerCase().includes(normalizedQuery) ||
        (v.root && stripArabicHarakat(v.root).includes(normalizedArabicQuery))
      ) {
        matchedVocab.push(v);
        if (matchedVocab.length >= 18) break;
      }
    }

    return { chapters: matchedChapters, lessons: matchedLessons, vocab: matchedVocab };
  }, [allChapters, allVocabulary, levelFilter, trackFilter, normalizedQuery, normalizedArabicQuery]);

  const filteredChapters = useMemo(() => {
    return allChapters.filter((ch) => {
      if (levelFilter !== 'all' && ch.level !== levelFilter) return false;
      if (trackFilter !== 'all' && ch.track !== trackFilter) return false;
      if (normalizedQuery) {
        const chapterMatch =
          ch.titleBn.toLowerCase().includes(normalizedQuery) ||
          ch.titleEn.toLowerCase().includes(normalizedQuery) ||
          ch.objectiveBn.toLowerCase().includes(normalizedQuery) ||
          stripArabicHarakat(ch.titleAr).includes(normalizedArabicQuery) ||
          String(ch.chapterNumber).includes(normalizedQuery);
        const lessonMatch = ch.lessons.some(
          (ls) =>
            ls.titleBn.toLowerCase().includes(normalizedQuery) ||
            ls.titleEn.toLowerCase().includes(normalizedQuery) ||
            ls.grammarFocus.toLowerCase().includes(normalizedQuery) ||
            stripArabicHarakat(ls.titleAr).includes(normalizedArabicQuery)
        );
        return chapterMatch || lessonMatch;
      }
      return true;
    });
  }, [allChapters, levelFilter, trackFilter, normalizedQuery, normalizedArabicQuery]);

  // Group visible chapters by Level so each Level gets its own vibrant Banner + single-line winding path
  const groupedByLevel = useMemo(() => {
    const map = new Map<CurriculumLevelNumber, ChapterInfo[]>();
    for (const ch of filteredChapters) {
      const arr = map.get(ch.level) || [];
      arr.push(ch);
      map.set(ch.level, arr);
    }
    return CURRICULUM_LEVELS.map((lvl) => ({
      levelInfo: lvl,
      stats: levelStats.find((s) => s.level === lvl.level)!,
      chapters: map.get(lvl.level) || [],
    })).filter((g) => g.chapters.length > 0);
  }, [filteredChapters, levelStats]);

  // Next suggested active chapter
  const activeChapterSuggestion = useMemo(() => {
    const firstIncomplete = allChapters.find((ch) =>
      ch.lessons.some((l) => !progress.completedLessonIds.includes(`ch${ch.chapterNumber}-l${l.lessonNumber}`))
    );
    return firstIncomplete || allChapters[0];
  }, [allChapters, progress.completedLessonIds]);

  // Backwards-compatible redirects
  if (chParam && lsParam) {
    return <Navigate to={`/courses/lesson/${Number(chParam) || 1}/${Number(lsParam) || 1}`} replace />;
  }
  if (chParam) {
    return <Navigate to={`/courses/chapter/${Number(chParam) || 1}`} replace />;
  }

  return (
    <AppShell
      title={lang === 'bn' ? '১–১০০ ধাপ আরবি কোর্স' : t.sidebar.courses}
      subtitle={
        lang === 'bn'
          ? '৬টি স্তরের ১০০টি ধাপ (যে কোনো স্তরে পড়ুন — প্রতিটি স্তরের হিসাব সংরক্ষিত থাকবে)'
          : '100-Step Arabic Learning Path Across 6 Open Levels'
      }
    >
      <div className="space-y-6">
        {/* Overall Level Mastery & Open-Access Ledger */}
        <div className="surface-card rounded-3xl p-5 sm:p-6 space-y-4 border border-[var(--border-strong)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[var(--accent)]">আপনার পাঠ্যক্রম হিসাব (যেকোনো স্তর খোলা আছে)</div>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5">
                মোট সম্পন্ন: {totalCompletedChapters}/১০০ ধাপ · {totalCompletedLessons}/১,০০০ পাঠ
              </h2>
            </div>

            {activeChapterSuggestion && (
              <Link
                to={`/courses/chapter/${activeChapterSuggestion.chapterNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold btn-primary shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ধাপ {activeChapterSuggestion.chapterNumber} চালু করুন</span>
              </Link>
            )}
          </div>

          {/* 6-Level Interactive Cards showing exact progress in every level */}
          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              className={`min-w-[130px] p-3 rounded-2xl border text-left transition-all shrink-0 flex flex-col justify-between ${
                levelFilter === 'all'
                  ? 'surface-alt border-[var(--accent)] ring-1 ring-[var(--accent)]'
                  : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="text-xs font-bold text-[var(--accent)]">সকল স্তর (১–৬)</div>
              <div className="text-base font-bold font-mono-num mt-1">{totalCompletedChapters}/100</div>
              <div className="text-[11px] text-[var(--text-muted)]">১০০টি ধাপ দেখুন</div>
            </button>

            {levelStats.map((st) => {
              const selected = levelFilter === st.level;
              const levelTheme = LEVEL_THEMES[st.level];
              const statusText =
                st.completedChapters === st.totalChapters
                  ? 'সম্পন্ন'
                  : st.completedLessons > 0
                  ? 'চলমান'
                  : 'খোলা আছে';
              return (
                <button
                  key={st.level}
                  type="button"
                  onClick={() => setLevelFilter(st.level)}
                  className="min-w-[160px] p-3.5 rounded-2xl text-left transition-all shrink-0 space-y-1.5 text-white shadow-md hover:brightness-105"
                  style={{
                    background: levelTheme.bannerGrad,
                    outline: selected ? '3px solid #ffffff' : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-extrabold">স্তর {st.level}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                      {statusText}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-mono-num">
                    {st.completedChapters}/{st.totalChapters} ধাপ · {st.completedLessons} পাঠ
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-300 transition-all"
                      style={{
                        width: `${Math.max(st.completedLessons > 0 ? 10 : 0, st.pct)}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Global Search Across 100 Chapters, 1,000 Lessons & Curriculum Vocabulary */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="অধ্যায়, পাঠ (যেমন: 2.3), গ্রামার বা আরবি/বাংলা শব্দ খুঁজুন..."
                aria-label="Global curriculum search"
                className="w-full ps-9 pe-9 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value as LearningTrack | 'all')}
              aria-label="Track Filter"
              className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]"
            >
              <option value="all">সকল ট্র্যাক (MSA + কুরআনিক)</option>
              <option value="MSA">শুধু আধুনিক আরবি (MSA)</option>
              <option value="Quranic">শুধু কুরআনিক আরবি</option>
              <option value="Combined">সমন্বিত (Combined)</option>
            </select>
          </div>
        </div>

        {/* Instant Global Search Results Panel (Chapters, Lessons, Vocabulary) */}
        {normalizedQuery && (
          <section className="surface-card rounded-3xl p-5 sm:p-6 space-y-4 border border-[var(--accent)]/40 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[var(--accent)]">গ্লোবাল কারিকুলাম সার্চ ফলাফল</div>
                <h3 className="text-base sm:text-lg font-bold">
                  "{searchQuery.trim()}" এর জন্য পাওয়া গেছে: {globalSearch.chapters.length} অধ্যায় ·{' '}
                  {globalSearch.lessons.length} পাঠ · {globalSearch.vocab.length} শব্দ
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'all', label: 'সব ফলাফল' },
                    { id: 'chapters', label: `অধ্যায় (${globalSearch.chapters.length})` },
                    { id: 'lessons', label: `পাঠ (${globalSearch.lessons.length})` },
                    { id: 'vocab', label: `শব্দ (${globalSearch.vocab.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSearchScope(tab.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                      searchScope === tab.id ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {globalSearch.chapters.length === 0 &&
            globalSearch.lessons.length === 0 &&
            globalSearch.vocab.length === 0 ? (
              <div className="surface-alt rounded-2xl p-6 text-center text-sm text-[var(--text-muted)]">
                কোনো অধ্যায়, পাঠ বা শব্দ পাওয়া যায়নি। অন্য কীওয়ার্ড (যেমন: কিতাব, নাম, মubtada, ২.১ বা আরবি শব্দ) চেষ্টা করুন।
              </div>
            ) : (
              <div className="space-y-5">
                {/* Matched Lessons */}
                {(searchScope === 'all' || searchScope === 'lessons') && globalSearch.lessons.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>মিল পাওয়া পাঠসমূহ (সরাসরি পাঠে যান)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {globalSearch.lessons.slice(0, 10).map(({ chapter, lesson }) => {
                        const done = progress.completedLessonIds.includes(
                          `ch${chapter.chapterNumber}-l${lesson.lessonNumber}`
                        );
                        return (
                          <Link
                            key={`${chapter.chapterNumber}-${lesson.lessonNumber}`}
                            to={`/courses/lesson/${chapter.chapterNumber}/${lesson.lessonNumber}`}
                            className="p-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 text-[11px] font-mono-num text-[var(--accent)] font-bold">
                                <span>
                                  অধ্যায় {chapter.chapterNumber} · পাঠ {lesson.lessonNumber}
                                </span>
                                {done && <span className="text-emerald-500">· সম্পন্ন</span>}
                              </div>
                              <div className="text-sm font-bold truncate">
                                {lang === 'bn' ? lesson.titleBn : lesson.titleEn}
                              </div>
                              <div className="text-xs text-[var(--text-muted)] truncate">
                                ব্যাকরণ: {lesson.grammarFocus}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Matched Vocabulary */}
                {(searchScope === 'all' || searchScope === 'vocab') && globalSearch.vocab.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-muted)] inline-flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>শব্দভাণ্ডার ফলাফল</span>
                      </span>
                      <Link to="/vocabulary" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                        SRS ফ্ল্যাশকার্ড ল্যাব →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {globalSearch.vocab.slice(0, 12).map((v) => (
                        <div
                          key={v.id}
                          className="p-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-arabic text-xl text-[var(--accent)]" dir="rtl">
                                {v.arabic}
                              </span>
                              <span className="text-[11px] text-[var(--text-muted)] truncate">
                                ({v.pronunciationBn})
                              </span>
                            </div>
                            <div className="text-xs font-bold truncate">
                              {lang === 'bn' ? v.meaningBn : v.meaningEn}
                            </div>
                            {v.chapterNumber && (
                              <Link
                                to={`/courses/chapter/${v.chapterNumber}`}
                                className="inline-block text-[11px] text-[var(--accent)] hover:underline font-mono-num"
                              >
                                অধ্যায় {v.chapterNumber} দেখুন →
                              </Link>
                            )}
                          </div>
                          <AudioButton text={v.arabic} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Chapters summary pills when scope is chapters */}
                {searchScope === 'chapters' && globalSearch.chapters.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {globalSearch.chapters.slice(0, 12).map((ch) => {
                      const doneInSearchCh = ch.lessons.filter((l) =>
                        progress.completedLessonIds.includes(`ch${ch.chapterNumber}-l${l.lessonNumber}`)
                      ).length;
                      const searchPct = Math.round((doneInSearchCh / 10) * 100);
                      return (
                        <Link
                          key={ch.chapterNumber}
                          to={`/courses/chapter/${ch.chapterNumber}`}
                          className="p-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] hover:border-[var(--border-strong)] space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[11px] font-mono-num font-bold text-[var(--accent)]">
                                অধ্যায় {ch.chapterNumber} · স্তর {ch.level} ({doneInSearchCh}/10 পাঠ)
                              </div>
                              <div className="text-sm font-bold truncate">
                                {lang === 'bn' ? ch.titleBn : ch.titleEn}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--accent)] transition-all"
                              style={{ width: `${searchPct}%` }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Quick Quran Reading Strip when browsing Quranic track */}
        {trackFilter === 'Quranic' && (
          <section className="surface-card rounded-3xl p-5 space-y-3 border border-emerald-500/35">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <ScrollText className="w-4 h-4" />
                <span>কোরআনের মাধ্যমে পড়ুন — সূরা আল-ফাতিহা ও শেষ ২৫ সূরা</span>
              </div>
              <Link to="/quranic-arabic" className="text-xs font-bold text-[var(--accent)] hover:underline">
                সব সূরা ও গ্রামার ল্যাব →
              </Link>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {QURAN_ALL_SHORT_SURAHS.map((s) => (
                <Link
                  key={s.surahNumber}
                  to={`/quranic-arabic?surah=${s.surahNumber}`}
                  className="shrink-0 px-3 py-2 rounded-2xl surface-alt border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-semibold flex items-center gap-2"
                >
                  <span className="font-mono-num text-[var(--accent)] font-bold">{s.surahNumber}.</span>
                  <span>{s.nameBn.replace('সূরা ', '')}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Duolingo-Style Single-Line Winding Game Path */}
        {groupedByLevel.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 text-center text-sm text-[var(--text-muted)]">
            এই ফিল্টারে কোনো ধাপ পাওয়া যায়নি। অন্য স্তর বা ট্র্যাক নির্বাচন করুন।
          </div>
        ) : (
          <div className="space-y-10 pb-24">
            {groupedByLevel.map(({ levelInfo, stats, chapters }) => {
              const themeStyle = LEVEL_THEMES[levelInfo.level];
              return (
                <section key={levelInfo.level} className="space-y-8">
                  {/* Duolingo-Style Unit / Level Section Banner */}
                  <div
                    className="rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-4"
                    style={{ background: themeStyle.bannerGrad }}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                        {themeStyle.labelBn} · অধ্যায় {levelInfo.chapterStart}–{levelInfo.chapterEnd}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {lang === 'bn' ? levelInfo.nameBn : levelInfo.nameEn}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/85 max-w-xl">
                        {lang === 'bn' ? levelInfo.descriptionBn : levelInfo.descriptionEn}
                      </p>
                    </div>

                    <div className="bg-black/25 backdrop-blur-md rounded-2xl px-4 py-3 text-center min-w-[155px] space-y-1.5">
                      <div className="text-[11px] text-white/75">স্তরের হিসাব</div>
                      <div className="text-lg font-bold font-mono-num">
                        {stats.completedChapters}/{stats.totalChapters} ধাপ
                      </div>
                      <div className="text-[11px] text-emerald-200 font-mono-num">
                        {stats.completedLessons}/{stats.totalLessons} পাঠ ({stats.pct}%)
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden" aria-label={`Section progress ${stats.pct}%`}>
                        <div
                          className="h-full rounded-full bg-amber-300 transition-all duration-500"
                          style={{ width: `${stats.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Single-Column Winding S-Curve Stepping Path */}
                  <div className="relative max-w-xl mx-auto flex flex-col items-center">
                    {chapters.map((chapter, idx) => {
                      const completedCount = chapter.lessons.filter((l) =>
                        progress.completedLessonIds.includes(`ch${chapter.chapterNumber}-l${l.lessonNumber}`)
                      ).length;
                      const isComplete = completedCount === 10;
                      const isStarted = completedCount > 0 && completedCount < 10;
                      const isCurrentTarget = activeChapterSuggestion?.chapterNumber === chapter.chapterNumber;

                      const offsetX = WAVE_OFFSETS[idx % WAVE_OFFSETS.length];
                      const nextOffsetX =
                        idx < chapters.length - 1 ? WAVE_OFFSETS[(idx + 1) % WAVE_OFFSETS.length] : offsetX;

                      const pct = (completedCount / 10) * 100;
                      const radius = 34;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDashoffset = circumference - (pct / 100) * circumference;

                      return (
                        <div key={chapter.chapterNumber} className="w-full flex flex-col items-center">
                          {/* Step Node Row */}
                          <div
                            className="relative flex flex-col items-center group transition-transform duration-300"
                            style={{ transform: `translateX(${offsetX}px)` }}
                          >
                            {isCurrentTarget && (
                              <div className="mb-2 px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[11px] font-bold shadow-md animate-bounce">
                                এখান থেকে পড়ুন!
                              </div>
                            )}

                            {/* Circular Game Medallion with SVG Progress Ring */}
                            <Link
                              to={`/courses/chapter/${chapter.chapterNumber}`}
                              className="relative w-20 h-20 flex items-center justify-center focus:outline-none"
                              aria-label={`অধ্যায় ${chapter.chapterNumber}: ${chapter.titleBn}`}
                            >
                              {/* Progress Ring */}
                              <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r={radius}
                                  fill="none"
                                  stroke="var(--border-subtle)"
                                  strokeWidth="5"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r={radius}
                                  fill="none"
                                  stroke={isComplete ? '#eab308' : themeStyle.ringColor}
                                  strokeWidth="5"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-500"
                                />
                              </svg>

                              {/* 3D Tactile Medallion Core */}
                              <div
                                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-108 active:translate-y-0.5 border-b-4 ${
                                  isComplete
                                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-700 text-slate-950'
                                    : isStarted || isCurrentTarget
                                    ? `bg-gradient-to-b ${themeStyle.accentBg} border-black/30 text-white`
                                    : 'surface-card border-[var(--border-strong)] text-[var(--text-primary)]'
                                }`}
                              >
                                {isComplete ? (
                                  <Crown className="w-6 h-6" />
                                ) : (
                                  <span className="text-lg font-extrabold font-mono-num leading-none">
                                    {chapter.chapterNumber}
                                  </span>
                                )}
                              </div>

                              {/* Small Completion Star Badge */}
                              {isComplete && (
                                <span className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {isStarted && (
                                <span className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </span>
                              )}
                            </Link>

                            {/* Compact Floating Step Info Card with Visual Progress Bar */}
                            <Link
                              to={`/courses/chapter/${chapter.chapterNumber}`}
                              className="mt-2 surface-card rounded-2xl px-4 py-2.5 text-center shadow-sm hover:border-[var(--border-strong)] transition-colors w-[225px] sm:w-[255px]"
                            >
                              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold">
                                <span style={{ color: themeStyle.ringColor }}>ধাপ {chapter.chapterNumber}</span>
                                <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                                <span className="font-mono-num text-[var(--text-muted)]">{completedCount}/10 পাঠ</span>
                                {isStarted && (
                                  <span className="text-amber-500 font-bold">· চলমান</span>
                                )}
                              </div>
                              <p className="font-arabic text-base text-[var(--accent)] truncate mt-0.5" dir="rtl">
                                {chapter.titleAr}
                              </p>
                              <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                                {lang === 'bn' ? chapter.titleBn : chapter.titleEn}
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: isComplete ? '#10b981' : themeStyle.ringColor,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono-num font-bold text-[var(--text-muted)] w-7 text-right">
                                  {Math.round(pct)}%
                                </span>
                              </div>
                            </Link>
                          </div>

                          {/* Smooth Winding Connector Line to Next Step */}
                          {idx < chapters.length - 1 && (
                            <svg
                              width="160"
                              height="34"
                              viewBox="-80 0 160 34"
                              className="overflow-visible pointer-events-none my-0.5"
                              aria-hidden="true"
                            >
                              <path
                                d={`M ${offsetX} 0 C ${offsetX} 18, ${nextOffsetX} 16, ${nextOffsetX} 34`}
                                fill="none"
                                stroke={isComplete ? '#eab308' : themeStyle.ringColor}
                                strokeWidth="3.5"
                                strokeDasharray={isComplete ? undefined : '6 5'}
                                opacity={isComplete ? 0.85 : 0.45}
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </div>
                      );
                    })}

                    {/* Level Finale Marker */}
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full surface-alt border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>স্তর {levelInfo.level} সমাপ্তি ({chapters.length}টি ধাপ)</span>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};
