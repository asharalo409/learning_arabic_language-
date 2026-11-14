import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  Crown,
  PartyPopper,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { ChapterInfo, CurriculumLevelNumber, InterfaceLang } from '../types/academy';
import { CelebrationConfetti } from './CelebrationConfetti';
import { SoundEffectType } from '../utils/soundEffects';

interface CurriculumProgressGaugeProps {
  allChapters: ChapterInfo[];
  completedLessonIds: string[];
  lang: InterfaceLang;
  onCelebrateSound?: (type: SoundEffectType) => void;
}

const MILESTONE_STORAGE_KEY = 'aaa_celebrated_gauge_milestones_v1';

const LEVEL_COLORS: Record<
  CurriculumLevelNumber,
  { stroke: string; badgeBg: string; softBg: string; labelBn: string; labelEn: string }
> = {
  1: {
    stroke: '#10b981',
    badgeBg: 'bg-emerald-500 text-white',
    softBg: 'bg-emerald-500/12 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
    labelBn: 'স্তর ১',
    labelEn: 'Lv.1',
  },
  2: {
    stroke: '#0ea5e9',
    badgeBg: 'bg-sky-500 text-white',
    softBg: 'bg-sky-500/12 border-sky-500/30 text-sky-600 dark:text-sky-300',
    labelBn: 'স্তর ২',
    labelEn: 'Lv.2',
  },
  3: {
    stroke: '#6366f1',
    badgeBg: 'bg-indigo-500 text-white',
    softBg: 'bg-indigo-500/12 border-indigo-500/30 text-indigo-600 dark:text-indigo-300',
    labelBn: 'স্তর ৩',
    labelEn: 'Lv.3',
  },
  4: {
    stroke: '#f59e0b',
    badgeBg: 'bg-amber-500 text-slate-950',
    softBg: 'bg-amber-500/12 border-amber-500/30 text-amber-600 dark:text-amber-300',
    labelBn: 'স্তর ৪',
    labelEn: 'Lv.4',
  },
  5: {
    stroke: '#f43f5e',
    badgeBg: 'bg-rose-500 text-white',
    softBg: 'bg-rose-500/12 border-rose-500/30 text-rose-600 dark:text-rose-300',
    labelBn: 'স্তর ৫',
    labelEn: 'Lv.5',
  },
  6: {
    stroke: '#a855f7',
    badgeBg: 'bg-purple-600 text-white',
    softBg: 'bg-purple-500/12 border-purple-500/30 text-purple-600 dark:text-purple-300',
    labelBn: 'স্তর ৬',
    labelEn: 'Lv.6',
  },
};

export const CurriculumProgressGauge: React.FC<CurriculumProgressGaugeProps> = ({
  allChapters,
  completedLessonIds,
  lang,
  onCelebrateSound,
}) => {
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  const chapterProgressList = useMemo(() => {
    return allChapters.map((ch) => {
      const doneLessons = ch.lessons.filter((l) =>
        completedSet.has(`ch${ch.chapterNumber}-l${l.lessonNumber}`)
      ).length;
      const totalLessons = ch.lessons.length || 10;
      const pct = Math.round((doneLessons / totalLessons) * 100);
      const status: 'completed' | 'in-progress' | 'open' =
        doneLessons >= totalLessons ? 'completed' : doneLessons > 0 ? 'in-progress' : 'open';

      return {
        chapter: ch,
        doneLessons,
        totalLessons,
        pct,
        status,
      };
    });
  }, [allChapters, completedSet]);

  const stats = useMemo(() => {
    const totalChapters = allChapters.length || 100;
    const totalLessons = chapterProgressList.reduce((acc, item) => acc + item.totalLessons, 0) || 1000;
    const completedLessons = chapterProgressList.reduce((acc, item) => acc + item.doneLessons, 0);
    const completedChapters = chapterProgressList.filter((c) => c.status === 'completed').length;
    const inProgressChapters = chapterProgressList.filter((c) => c.status === 'in-progress').length;
    const exactPct = (completedLessons / totalLessons) * 100;
    const roundedPct = Math.round(exactPct);
    const displayPct =
      completedLessons === 0
        ? '0%'
        : exactPct < 1
        ? `${exactPct.toFixed(1)}%`
        : `${roundedPct}%`;

    const nextActive =
      chapterProgressList.find((c) => c.status === 'in-progress') ||
      chapterProgressList.find((c) => c.status === 'open') ||
      chapterProgressList[0];

    const perLevel = CURRICULUM_LEVELS.map((lvl) => {
      const items = chapterProgressList.filter((c) => c.chapter.level === lvl.level);
      const lvlDoneLessons = items.reduce((a, b) => a + b.doneLessons, 0);
      const lvlTotalLessons = Math.max(1, items.reduce((a, b) => a + b.totalLessons, 0));
      const lvlDoneChapters = items.filter((c) => c.status === 'completed').length;
      return {
        ...lvl,
        doneChapters: lvlDoneChapters,
        totalChapters: items.length,
        doneLessons: lvlDoneLessons,
        totalLessons: lvlTotalLessons,
        pct: Math.round((lvlDoneLessons / lvlTotalLessons) * 100),
      };
    });

    return {
      totalChapters,
      totalLessons,
      completedLessons,
      completedChapters,
      inProgressChapters,
      exactPct,
      roundedPct,
      displayPct,
      nextActive,
      perLevel,
    };
  }, [allChapters.length, chapterProgressList]);

  // Compute current milestone achievements
  const earnedMilestones = useMemo(() => {
    const list: { id: string; titleBn: string; titleEn: string; isFullGoal?: boolean }[] = [];
    if (stats.completedLessons >= 1) {
      list.push({
        id: 'first-lesson',
        titleBn: 'প্রথম পাঠের সূচনা মাইলফলক অর্জিত!',
        titleEn: 'First Lesson Milestone Reached!',
      });
    }
    if (stats.completedChapters >= 1) {
      list.push({
        id: 'first-chapter',
        titleBn: 'প্রথম পূর্ণাঙ্গ অধ্যায় (১০/১০) সম্পন্ন!',
        titleEn: 'First Full Chapter Mastered!',
      });
    }
    [5, 10, 25, 50, 75].forEach((n) => {
      if (stats.completedChapters >= n) {
        list.push({
          id: `ch-${n}`,
          titleBn: `${n}টি অধ্যায় সম্পূর্ণ করার দারুণ মাইলফলক!`,
          titleEn: `${n} Chapters Completed Milestone!`,
        });
      }
    });
    stats.perLevel.forEach((lvl) => {
      if (lvl.pct >= 100) {
        list.push({
          id: `lvl-${lvl.level}`,
          titleBn: `স্তর ${lvl.level} (${lvl.nameBn}) ১০০% সম্পন্ন!`,
          titleEn: `Level ${lvl.level} 100% Mastered!`,
          isFullGoal: true,
        });
      }
    });
    if (stats.exactPct >= 100 || stats.completedChapters >= 100) {
      list.push({
        id: 'goal-100',
        titleBn: 'অভিনন্দন! ১০০ অধ্যায় পাঠ্যক্রম ১০০% সম্পন্ন হয়েছে!',
        titleEn: 'Congratulations! 100% Curriculum Goal Achieved!',
        isFullGoal: true,
      });
    }
    return list;
  }, [stats.completedChapters, stats.completedLessons, stats.exactPct, stats.perLevel]);

  const [confettiActive, setConfettiActive] = useState(false);
  const [milestoneBanner, setMilestoneBanner] = useState<{
    titleBn: string;
    titleEn: string;
    isFullGoal?: boolean;
  } | null>(null);

  const triggerCelebration = useCallback(
    (milestone: { titleBn: string; titleEn: string; isFullGoal?: boolean }) => {
      setMilestoneBanner(milestone);
      setConfettiActive(true);
      onCelebrateSound?.('badge');
    },
    [onCelebrateSound]
  );

  // Detect any newly reached milestone on Dashboard load or progress change
  useEffect(() => {
    if (earnedMilestones.length === 0) return;
    let seen: string[] = [];
    try {
      const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
      if (raw) seen = JSON.parse(raw) as string[];
    } catch {
      seen = [];
    }

    const unseen = earnedMilestones.filter((m) => !seen.includes(m.id));
    if (unseen.length > 0) {
      const latest = unseen[unseen.length - 1];
      const updated = Array.from(new Set([...seen, ...unseen.map((u) => u.id)]));
      try {
        localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      triggerCelebration(latest);
    }
  }, [earnedMilestones, triggerCelebration]);

  const [selectedChapterNum, setSelectedChapterNum] = useState<number | null>(null);
  const [levelFilter, setLevelFilter] = useState<CurriculumLevelNumber | 'all'>('all');

  const inspectedChapter = useMemo(() => {
    const targetNum = selectedChapterNum ?? stats.nextActive?.chapter.chapterNumber ?? 1;
    return (
      chapterProgressList.find((c) => c.chapter.chapterNumber === targetNum) || chapterProgressList[0]
    );
  }, [chapterProgressList, selectedChapterNum, stats.nextActive]);

  // SVG Circular Gauge Geometry
  const outerRadius = 76;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerFillRatio = Math.max(
    stats.completedLessons > 0 ? Math.max(0.015, stats.exactPct / 100) : 0,
    0
  );
  const outerDashOffset = outerCircumference * (1 - Math.min(1, outerFillRatio));

  // Inner 6-Level segmented progress ring
  const innerRadius = 58;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const levelArcSegments = useMemo(() => {
    let cursor = 0;
    const gap = 4;
    return stats.perLevel.map((lvl) => {
      const segTotalLen = (lvl.totalChapters / Math.max(1, stats.totalChapters)) * innerCircumference;
      const drawableLen = Math.max(4, segTotalLen - gap);
      const filledLen = (lvl.pct / 100) * drawableLen;
      const segOffset = -cursor;
      cursor += segTotalLen;
      return {
        level: lvl.level,
        color: LEVEL_COLORS[lvl.level].stroke,
        trackDashArray: `${drawableLen} ${innerCircumference}`,
        fillDashArray: `${lvl.doneLessons > 0 ? Math.max(4, filledLen) : 0} ${innerCircumference}`,
        dashOffset: segOffset,
      };
    });
  }, [innerCircumference, stats.perLevel, stats.totalChapters]);

  const visibleGridChapters = useMemo(() => {
    if (levelFilter === 'all') return chapterProgressList;
    return chapterProgressList.filter((c) => c.chapter.level === levelFilter);
  }, [chapterProgressList, levelFilter]);

  const isBn = lang === 'bn';
  const latestEarned = earnedMilestones[earnedMilestones.length - 1];
  const isGoal100 = stats.exactPct >= 100 || stats.completedChapters >= 100;

  return (
    <>
      <CelebrationConfetti
        active={confettiActive}
        onComplete={() => setConfettiActive(false)}
      />

      <section
        aria-label="100-Chapter Curriculum Progress Tracker"
        className="surface-card rounded-3xl p-5 sm:p-7 border border-[var(--border-strong)] space-y-5 shadow-sm relative overflow-hidden"
      >
        {/* Celebratory Milestone Banner */}
        {milestoneBanner && (
          <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-white shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {milestoneBanner.isFullGoal ? (
                  <Crown className="w-5 h-5 text-amber-200" />
                ) : (
                  <PartyPopper className="w-5 h-5 text-amber-200" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-100">
                  {isBn ? 'নতুন মাইলফলক অর্জিত!' : 'Milestone Unlocked!'}
                </div>
                <div className="text-sm font-bold truncate">
                  {isBn ? milestoneBanner.titleBn : milestoneBanner.titleEn}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMilestoneBanner(null)}
              className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold"
            >
              {isBn ? 'ধন্যবাদ!' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
              <BookOpenCheck className="w-4 h-4" />
              <span>
                {isBn
                  ? '১০০ অধ্যায় পাঠ্যক্রম প্রোগ্রেস ট্র্যাকার'
                  : '100-Chapter Curriculum Visual Tracker'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              {isBn
                ? 'সম্পূর্ণ আরবি কোর্স সমাপ্তির হার ও অধ্যায় মানচিত্র'
                : 'Overall Curriculum Completion & Chapter Matrix'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {latestEarned && (
              <button
                type="button"
                onClick={() => triggerCelebration(latestEarned)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/35 text-xs font-bold transition-colors"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>{isBn ? 'উৎসব দেখুন' : 'Celebrate'}</span>
              </button>
            )}

            {stats.nextActive && (
              <Link
                to={`/courses/chapter/${stats.nextActive.chapter.chapterNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold btn-primary shadow-sm whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isBn
                    ? `অধ্যায় ${stats.nextActive.chapter.chapterNumber} চালু করুন`
                    : `Resume Ch. ${stats.nextActive.chapter.chapterNumber}`}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Main Split: Circular Gauge Left + 100-Chapter Matrix Right */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          {/* Left Column: Dual-Ring Circular Progress Gauge + Quick Milestones */}
          <div
            className={`xl:col-span-5 flex flex-col items-center justify-center p-5 rounded-3xl surface-alt border space-y-5 transition-all ${
              isGoal100
                ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                : 'border-[var(--border-subtle)]'
            }`}
          >
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full -rotate-90 drop-shadow-sm"
                role="img"
                aria-label={`Curriculum completion ${stats.displayPct}`}
              >
                <defs>
                  <linearGradient id="curriculumGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isGoal100 ? '#f59e0b' : '#10b981'} />
                    <stop offset="50%" stopColor={isGoal100 ? '#10b981' : '#0ea5e9'} />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Outer Gauge Track */}
                <circle
                  cx="100"
                  cy="100"
                  r={outerRadius}
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="14"
                />

                {/* Outer Gauge Fill Arc */}
                <circle
                  cx="100"
                  cy="100"
                  r={outerRadius}
                  fill="none"
                  stroke="url(#curriculumGaugeGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={outerCircumference}
                  strokeDashoffset={outerDashOffset}
                  className="transition-all duration-700 ease-out"
                />

                {/* Inner 6-Level Track Arcs */}
                {levelArcSegments.map((seg) => (
                  <circle
                    key={`track-${seg.level}`}
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="none"
                    stroke={seg.color}
                    strokeOpacity="0.18"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={seg.trackDashArray}
                    strokeDashoffset={seg.dashOffset}
                  />
                ))}

                {/* Inner 6-Level Filled Arcs */}
                {levelArcSegments.map((seg) => (
                  <circle
                    key={`fill-${seg.level}`}
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={seg.fillDashArray}
                    strokeDashoffset={seg.dashOffset}
                    className="transition-all duration-700 ease-out"
                  />
                ))}
              </svg>

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isGoal100
                    ? isBn
                      ? 'লক্ষ্য পূরণ!'
                      : '100% Goal!'
                    : isBn
                    ? 'মোট অগ্রগতি'
                    : 'Completed'}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono-num text-[var(--text-primary)] leading-tight mt-0.5">
                  {stats.displayPct}
                </span>
                <span className="text-[11px] font-semibold font-mono-num text-[var(--accent)] mt-1">
                  {stats.completedChapters}/{stats.totalChapters} {isBn ? 'অধ্যায়' : 'Chapters'}
                </span>
                <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                  {stats.completedLessons}/{stats.totalLessons} {isBn ? 'পাঠ' : 'Lessons'}
                </span>
              </div>
            </div>

            {/* Milestone Progress Bar toward next Goal */}
            <div className="w-full space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {isBn ? '১০০% লক্ষ্যের মাইলফলক' : 'Milestones to 100%'}
                  </span>
                </span>
                <span className="font-mono-num font-bold text-[var(--accent)]">
                  {earnedMilestones.length} / 9
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 10, 25, 50, 75, 100].map((mark) => {
                  const reached = stats.exactPct >= mark;
                  return (
                    <div key={mark} className="flex-1 text-center space-y-1">
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          reached ? 'bg-emerald-500' : 'bg-[var(--border-subtle)]'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-mono-num block ${
                          reached ? 'text-emerald-500 font-bold' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {mark}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 Compact Summary Stat Pills */}
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              <div className="p-2.5 rounded-2xl surface-card border border-[var(--border-subtle)]">
                <div className="text-base font-extrabold font-mono-num text-emerald-500">
                  {stats.completedChapters}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium">
                  {isBn ? 'সমাপ্ত অধ্যায়' : 'Mastered'}
                </div>
              </div>
              <div className="p-2.5 rounded-2xl surface-card border border-[var(--border-subtle)]">
                <div className="text-base font-extrabold font-mono-num text-sky-500">
                  {stats.inProgressChapters}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium">
                  {isBn ? 'চলমান অধ্যায়' : 'In Progress'}
                </div>
              </div>
              <div className="p-2.5 rounded-2xl surface-card border border-[var(--border-subtle)]">
                <div className="text-base font-extrabold font-mono-num text-indigo-500">
                  {stats.completedLessons}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium">
                  {isBn ? 'সমাপ্ত পাঠ' : 'Lessons Done'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 100-Chapter Matrix + Level Pills + Inspector */}
          <div className="xl:col-span-7 space-y-4">
            {/* Level Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLevelFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  levelFilter === 'all'
                    ? 'btn-primary shadow-xs'
                    : 'surface-alt border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isBn ? `সকল ১০০ (${stats.completedChapters}/১০০)` : `All 100 (${stats.completedChapters}/100)`}
              </button>

              {stats.perLevel.map((lvl) => {
                const active = levelFilter === lvl.level;
                const palette = LEVEL_COLORS[lvl.level];
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setLevelFilter(lvl.level)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      active
                        ? `${palette.badgeBg} border-transparent shadow-xs`
                        : `${palette.softBg} hover:brightness-95`
                    }`}
                  >
                    <span>{isBn ? palette.labelBn : palette.labelEn}</span>
                    <span className="font-mono-num opacity-90">{lvl.pct}%</span>
                  </button>
                );
              })}
            </div>

            {/* 100-Chapter Visual Tile Grid */}
            <div className="p-3.5 sm:p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] space-y-3">
              <div className="grid grid-cols-10 gap-1.5">
                {visibleGridChapters.map(({ chapter, status, doneLessons, totalLessons }) => {
                  const isSelected = inspectedChapter?.chapter.chapterNumber === chapter.chapterNumber;
                  const isNext = stats.nextActive?.chapter.chapterNumber === chapter.chapterNumber;
                  const palette = LEVEL_COLORS[chapter.level];

                  return (
                    <button
                      key={chapter.chapterNumber}
                      type="button"
                      onClick={() => setSelectedChapterNum(chapter.chapterNumber)}
                      onMouseEnter={() => setSelectedChapterNum(chapter.chapterNumber)}
                      title={`অধ্যায় ${chapter.chapterNumber}: ${isBn ? chapter.titleBn : chapter.titleEn} (${doneLessons}/${totalLessons})`}
                      className={`relative aspect-square rounded-lg text-[10px] sm:text-[11px] font-bold font-mono-num flex items-center justify-center transition-all focus:outline-none ${
                        status === 'completed'
                          ? `${palette.badgeBg} shadow-xs`
                          : status === 'in-progress'
                          ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-2 border-sky-500'
                          : 'surface-card text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                      } ${isSelected ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-surface)] scale-105 z-10' : ''}`}
                    >
                      {chapter.chapterNumber}
                      {isNext && status !== 'completed' && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Compact Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                    <span>{isBn ? 'সমাপ্ত (১০/১০)' : 'Mastered'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sky-500/25 border border-sky-500 inline-block" />
                    <span>{isBn ? 'চলমান' : 'In Progress'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs surface-card border border-[var(--border-subtle)] inline-block" />
                    <span>{isBn ? 'খোলা আছে' : 'Open'}</span>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold">
                  <Compass className="w-3 h-3" />
                  <span>{isBn ? 'যেকোনো অধ্যায়ে চাপুন' : 'Tap any chapter'}</span>
                </span>
              </div>
            </div>

            {/* Selected / Active Chapter Inspector Strip */}
            {inspectedChapter && (
              <div className="p-4 rounded-2xl surface-card border border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${LEVEL_COLORS[inspectedChapter.chapter.level].badgeBg}`}
                    >
                      {isBn ? `অধ্যায় ${inspectedChapter.chapter.chapterNumber}` : `Chapter ${inspectedChapter.chapter.chapterNumber}`}
                    </span>
                    <span className="font-mono-num font-semibold text-[var(--text-muted)]">
                      {inspectedChapter.doneLessons}/{inspectedChapter.totalLessons} {isBn ? 'পাঠ' : 'lessons'} ({inspectedChapter.pct}%)
                    </span>
                    {inspectedChapter.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সম্পন্ন' : 'Done'}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="text-sm font-bold truncate">
                      {isBn ? inspectedChapter.chapter.titleBn : inspectedChapter.chapter.titleEn}
                    </h4>
                    <span className="font-arabic text-base text-[var(--accent)]" dir="rtl">
                      {inspectedChapter.chapter.titleAr}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/courses/chapter/${inspectedChapter.chapter.chapterNumber}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-primary shrink-0 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পাঠে প্রবেশ করুন' : 'Open Chapter'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
