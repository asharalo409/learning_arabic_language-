import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  Bookmark,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Cloud,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  LogIn,
  Play,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppShell } from '../components/AppShell';
import { CurriculumProgressGauge } from '../components/CurriculumProgressGauge';
import { DailyGoalTracker } from '../components/DailyGoalTracker';
import { GrammarMasteryRadar } from '../components/GrammarMasteryRadar';
import { LearningVelocityChart } from '../components/LearningVelocityChart';
import { MuslimCompanionStrip } from '../components/MuslimCompanionStrip';
import { BADGE_DEFINITIONS, useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { computeVocabDeckSummary } from '../utils/vocabStatus';

const WEEKDAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export const DashboardPage: React.FC = () => {
  const {
    t,
    lang,
    progress,
    todayMinutesLearned,
    weeklyActivity,
    weeklyLessonVelocity,
    logStudyMinutes,
    currentLevelNumber,
    allChapters,
    allVocabulary,
    grammarTerminologyMode,
    updateProfile,
    toggleFavoriteLesson,
    triggerSound,
  } = useApp();
  const { user, supabaseConnected } = useAuth();
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(progress.dailyTargetMinutes);
  const [chartTab, setChartTab] = useState<'levels' | 'skills'>('levels');
  const [activeBarIdx, setActiveBarIdx] = useState<number>(0);

  const vocabDeckSummary = useMemo(
    () => computeVocabDeckSummary(allVocabulary, progress.vocabProgress),
    [allVocabulary, progress.vocabProgress]
  );

  // Resolve last lesson worked on for direct 'Continue Learning' button
  const continueTarget = useMemo(() => {
    const parseLessonId = (lid?: string) => {
      if (!lid) return null;
      const m = /^ch(\d+)-l(\d+)$/.exec(lid);
      if (!m) return null;
      const chNum = Number(m[1]);
      const lsNum = Number(m[2]);
      const chapter = allChapters.find((c) => c.chapterNumber === chNum);
      const lesson = chapter?.lessons.find((l) => l.lessonNumber === lsNum);
      if (!chapter || !lesson) return null;
      return {
        chapterNumber: chNum,
        lessonNumber: lsNum,
        titleBn: lesson.titleBn,
        titleEn: lesson.titleEn,
        isResume: true,
      };
    };

    const fromSaved = parseLessonId(progress.lastLessonId);
    if (fromSaved) return fromSaved;

    for (const ch of allChapters) {
      for (const ls of ch.lessons) {
        const lid = `ch${ch.chapterNumber}-l${ls.lessonNumber}`;
        if (!progress.completedLessonIds.includes(lid)) {
          return {
            chapterNumber: ch.chapterNumber,
            lessonNumber: ls.lessonNumber,
            titleBn: ls.titleBn,
            titleEn: ls.titleEn,
            isResume: false,
          };
        }
      }
    }

    const firstCh = allChapters[0];
    const firstLs = firstCh?.lessons[0];
    return {
      chapterNumber: firstCh?.chapterNumber || 1,
      lessonNumber: firstLs?.lessonNumber || 1,
      titleBn: firstLs?.titleBn || 'প্রথম পাঠ',
      titleEn: firstLs?.titleEn || 'Lesson 1',
      isResume: false,
    };
  }, [allChapters, progress.completedLessonIds, progress.lastLessonId]);

  const favoriteLessons = useMemo(() => {
    const ids = progress.favoriteLessonIds || [];
    return ids
      .map((lid) => {
        const m = /^ch(\d+)-l(\d+)$/.exec(lid);
        if (!m) return null;
        const chNum = Number(m[1]);
        const lsNum = Number(m[2]);
        const chapter = allChapters.find((c) => c.chapterNumber === chNum);
        const lesson = chapter?.lessons.find((l) => l.lessonNumber === lsNum);
        if (!chapter || !lesson) return null;
        return {
          lessonId: lid,
          chapterNumber: chNum,
          lessonNumber: lsNum,
          titleBn: lesson.titleBn,
          titleEn: lesson.titleEn,
          titleAr: lesson.titleAr,
          grammarFocus: lesson.grammarFocus,
          isDone: progress.completedLessonIds.includes(lid),
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [allChapters, progress.completedLessonIds, progress.favoriteLessonIds]);

  const avgQuizScore =
    progress.examHistory.length > 0
      ? Math.round(
          progress.examHistory.reduce((acc, item) => acc + item.percentage, 0) / progress.examHistory.length
        )
      : 0;

  const vocabLearnedCount = Object.keys(progress.vocabProgress).length;

  const levelStats = useMemo(() => {
    return CURRICULUM_LEVELS.map((lvl) => {
      const levelChapters = allChapters.filter((c) => c.level === lvl.level);
      const totalLevelLessons = Math.max(1, levelChapters.length * 10);
      const completedInLevel = progress.completedLessonIds.filter((id) => {
        const match = /^ch(\d+)-/.exec(id);
        if (!match) return false;
        const chNum = Number(match[1]);
        return chNum >= lvl.chapterStart && chNum <= lvl.chapterEnd;
      }).length;
      const pct = Math.round((completedInLevel / totalLevelLessons) * 100);
      return {
        ...lvl,
        completedInLevel,
        totalLevelLessons,
        pct,
      };
    });
  }, [allChapters, progress.completedLessonIds]);

  const barData = useMemo(() => {
    if (chartTab === 'levels') {
      return levelStats.map((l) => ({
        label: `Lv.${l.level}`,
        title: lang === 'bn' ? l.nameBn : l.nameEn,
        value: Math.max(l.completedInLevel, l.level === 1 ? 1 : 0),
        max: l.totalLevelLessons,
        pct: Math.max(l.pct, l.completedInLevel > 0 ? 14 : 6),
        detailA: `সম্পন্ন: ${l.completedInLevel} পাঠ`,
        detailB: `মোট: ${l.totalLevelLessons} পাঠ`,
      }));
    }
    return [
      {
        label: 'পাঠ',
        title: 'কোর্স ও সংলাপ',
        value: progress.completedLessonIds.length,
        max: 40,
        pct: Math.min(100, Math.max(12, Math.round((progress.completedLessonIds.length / 20) * 100))),
        detailA: `সম্পন্ন পাঠ: ${progress.completedLessonIds.length}`,
        detailB: `স্তর: ${currentLevelNumber}`,
      },
      {
        label: 'ব্যাকরণ',
        title: 'নাহু ও ছরফ',
        value: progress.completedGrammarIds.length,
        max: 45,
        pct: Math.min(100, Math.max(10, Math.round((progress.completedGrammarIds.length / 45) * 100))),
        detailA: `সম্পন্ন মডিউল: ${progress.completedGrammarIds.length}`,
        detailB: 'মোট মডিউল: ৪৫',
      },
      {
        label: 'শব্দ',
        title: 'শব্দভাণ্ডার (SRS)',
        value: vocabLearnedCount,
        max: 60,
        pct: Math.min(100, Math.max(12, Math.round((vocabLearnedCount / 40) * 100))),
        detailA: `অনুশীলিত শব্দ: ${vocabLearnedCount}`,
        detailB: 'SRS রিভিউ সক্রিয়',
      },
      {
        label: 'পরীক্ষা',
        title: 'কুইজ পারফরম্যান্স',
        value: avgQuizScore,
        max: 100,
        pct: Math.max(12, avgQuizScore),
        detailA: `গড় স্কোর: ${avgQuizScore}%`,
        detailB: `মোট পরীক্ষা: ${progress.examHistory.length}`,
      },
      {
        label: 'চ্যালেঞ্জ',
        title: 'দৈনিক চ্যালেঞ্জ',
        value: progress.dailyChallengeCompletedDates.length,
        max: 15,
        pct: Math.min(100, Math.max(10, progress.dailyChallengeCompletedDates.length * 16)),
        detailA: `সম্পন্ন দিন: ${progress.dailyChallengeCompletedDates.length}`,
        detailB: `স্ট্রিক: ${progress.streakDays} দিন`,
      },
      {
        label: 'সময়',
        title: 'অধ্যয়ন সময়',
        value: progress.totalMinutesLearned,
        max: 120,
        pct: Math.min(100, Math.max(15, Math.round((progress.totalMinutesLearned / 120) * 100))),
        detailA: `মোট সময়: ${progress.totalMinutesLearned} মি.`,
        detailB: `লক্ষ্য: ${progress.dailyTargetMinutes} মি./দিন`,
      },
    ];
  }, [
    avgQuizScore,
    chartTab,
    currentLevelNumber,
    lang,
    levelStats,
    progress.completedGrammarIds.length,
    progress.completedLessonIds.length,
    progress.dailyChallengeCompletedDates.length,
    progress.dailyTargetMinutes,
    progress.examHistory.length,
    progress.streakDays,
    progress.totalMinutesLearned,
    vocabLearnedCount,
  ]);

  const activeBar = barData[activeBarIdx] || barData[0];

  // Donut Chart Segments (SVG circumference = 2 * PI * 44 ≈ 276.46)
  const donutSegments = useMemo(() => {
    const lessonsWeight = Math.max(1, progress.completedLessonIds.length * 4 + 4);
    const grammarWeight = Math.max(1, progress.completedGrammarIds.length * 4 + 3);
    const vocabWeight = Math.max(1, vocabLearnedCount * 2 + 3);
    const examWeight = Math.max(1, progress.examHistory.length * 5 + 2);
    const total = lessonsWeight + grammarWeight + vocabWeight + examWeight;

    const raw = [
      { label: 'কোর্স ও সংলাপ', count: `${progress.completedLessonIds.length} পাঠ`, weight: lessonsWeight, color: '#4f46e5' },
      { label: 'নাহু ও ছরফ', count: `${progress.completedGrammarIds.length} অধ্যায়`, weight: grammarWeight, color: '#06b6d4' },
      { label: 'শব্দভাণ্ডার', count: `${vocabLearnedCount} শব্দ`, weight: vocabWeight, color: '#10b981' },
      { label: 'কুইজ ও পরীক্ষা', count: `${avgQuizScore}% গড়`, weight: examWeight, color: '#f59e0b' },
    ];

    const circ = 2 * Math.PI * 44;
    let offset = 0;
    return raw.map((seg) => {
      const pct = Math.round((seg.weight / total) * 100);
      const len = (seg.weight / total) * circ;
      const item = { ...seg, pct, dashArray: `${Math.max(4, len - 3)} ${circ}`, dashOffset: -offset };
      offset += len;
      return item;
    });
  }, [avgQuizScore, progress.completedGrammarIds.length, progress.completedLessonIds.length, progress.examHistory.length, vocabLearnedCount]);

  // 7-Day Strip centered on today
  const weekStrip = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (5 - i));
      const isToday = i === 5;
      return {
        dayName: WEEKDAYS_BN[d.getDay()],
        dayNum: d.getDate(),
        isToday,
        active: isToday || i >= Math.max(0, 6 - progress.streakDays),
      };
    });
  }, [progress.streakDays]);

  const weeklyChartData = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return weeklyActivity.map((entry) => {
      const parsed = new Date(`${entry.date}T00:00:00`);
      const isToday = entry.date === todayKey;
      const weekdayBn = Number.isNaN(parsed.getTime()) ? entry.date : WEEKDAYS_BN[parsed.getDay()];
      const shortDate = Number.isNaN(parsed.getTime())
        ? entry.date.slice(5)
        : `${parsed.getDate()}/${parsed.getMonth() + 1}`;
      return {
        date: entry.date,
        label: isToday ? (lang === 'bn' ? 'আজ' : 'Today') : weekdayBn,
        shortDate,
        hoursStudied: Number((entry.minutesStudied / 60).toFixed(2)),
        minutesStudied: entry.minutesStudied,
        vocabLearned: entry.vocabLearned,
      };
    });
  }, [lang, weeklyActivity]);

  const weeklyTotals = useMemo(() => {
    const totalMins = weeklyChartData.reduce((acc, d) => acc + d.minutesStudied, 0);
    const totalVocab = weeklyChartData.reduce((acc, d) => acc + d.vocabLearned, 0);
    return {
      totalMinutes: totalMins,
      totalHours: (totalMins / 60).toFixed(2),
      totalVocab,
    };
  }, [weeklyChartData]);

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const clamped = Math.max(5, Math.min(180, Number(targetInput) || 20));
    updateProfile({ dailyTargetMinutes: clamped });
    setEditingTarget(false);
  };

  const kpis = [
    {
      label: 'সম্পন্ন পাঠ',
      value: progress.completedLessonIds.length,
      sub: `স্তর ${currentLevelNumber}`,
      icon: BookOpen,
      tint: 'bg-indigo-500/12 text-indigo-500',
    },
    {
      label: 'মোট অধ্যয়ন',
      value: `${progress.totalMinutesLearned}m`,
      sub: `লক্ষ্য ${progress.dailyTargetMinutes}m`,
      icon: Clock,
      tint: 'bg-sky-500/12 text-sky-500',
    },
    {
      label: 'অর্জিত পয়েন্ট',
      value: progress.xp,
      sub: 'মোট XP',
      icon: Trophy,
      tint: 'bg-emerald-500/12 text-emerald-500',
    },
    {
      label: 'দৈনিক স্ট্রিক',
      value: `${progress.streakDays}d`,
      sub: `${avgQuizScore}% কুইজ`,
      icon: Flame,
      tint: 'bg-amber-500/12 text-amber-500',
    },
  ];

  if (!user) {
    return (
      <AppShell
        title={t.sidebar.dashboard}
        subtitle="ব্যক্তিগত ড্যাশবোর্ড ও শেখার পরিসংখ্যান দেখতে লগইন করুন"
      >
        <div className="max-w-xl mx-auto my-8 surface-card rounded-3xl p-7 sm:p-9 border border-[var(--border-strong)] text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">গেস্ট মোডে ড্যাশবোর্ড নেই</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              আপনি বর্তমানে লগইন না করে <strong>গেস্ট (Guest)</strong> হিসেবে একাডেমিতে আছেন। গেস্ট হিসেবে সকল পাঠ, ব্যাকরণ, সফওয়াতুল মাসাদির, AI রোবট এবং নামাজ-আবহাওয়া ব্যবহার করতে পারবেন। নিজের ব্যক্তিগত ড্যাশবোর্ড, অগ্রগতি চার্ট ও লিডারবোর্ড সেভ রাখতে লগইন করুন।
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold btn-primary shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Gmail দিয়ে লগইন / অ্যাকাউন্ট</span>
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold btn-secondary"
            >
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              <span>গেস্ট হিসেবে পাঠ পড়ুন</span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t.sidebar.dashboard}
      subtitle={`আসসালামু আলাইকুম, ${progress.studentName} — আপনার ব্যক্তিগত শেখার বিশ্লেষণ`}
    >
      <div className="space-y-6">
        {/* Top Greeting + Dedicated Header Daily Streak Counter + 7-Day Strip */}
        <div className="surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[var(--accent)]">
              <Cloud className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {user
                  ? `${user.email} · ${supabaseConnected ? 'Supabase Synced' : 'Account Synced'}`
                  : 'গেস্ট মোড · সব ডিভাইসে সেভ রাখতে লগইন করুন'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-2xl font-bold">
                স্বাগতম, {progress.studentName}
              </h2>
              {/* Dashboard Header Daily Streak Counter */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300"
                title="টানা অধ্যয়নের দিন (Consecutive Days of Study)"
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold font-mono-num">{progress.streakDays} দিন</span>
                <span className="text-[10px] sm:text-[11px] font-semibold">টানা স্ট্রিক</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                to={`/courses/lesson/${continueTarget.chapterNumber}/${continueTarget.lessonNumber}`}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold btn-primary shadow-sm"
                title={lang === 'bn' ? continueTarget.titleBn : continueTarget.titleEn}
              >
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
                <span>
                  {continueTarget.isResume
                    ? `পড়া চালিয়ে যান: অধ্যায় ${continueTarget.chapterNumber} · পাঠ ${continueTarget.lessonNumber}`
                    : `শেখা শুরু করুন: অধ্যায় ${continueTarget.chapterNumber} · পাঠ ${continueTarget.lessonNumber}`}
                </span>
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold btn-secondary"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>সব ১০০ অধ্যায়</span>
              </Link>
              {!user && (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold btn-secondary"
                >
                  <LogIn className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Gmail লগইন</span>
                </Link>
              )}
            </div>
          </div>

          {/* 7-Day Horizontal Calendar Pill Strip */}
          <div className="grid grid-cols-7 lg:flex items-center gap-1 sm:gap-2 pb-1">
            {weekStrip.map((d, i) => (
              <div
                key={`${d.dayNum}-${i}`}
                className={`lg:min-w-[46px] py-1.5 sm:py-2.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-center border transition-all ${
                  d.isToday
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent shadow-md'
                    : d.active
                    ? 'surface-alt border-[var(--border-strong)]'
                    : 'surface-alt border-[var(--border-subtle)] opacity-75'
                }`}
              >
                <div className="text-[9px] sm:text-[10px] font-medium opacity-80 truncate">{d.dayName}</div>
                <div className="text-xs sm:text-sm font-bold font-mono-num mt-0.5">{d.dayNum}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Habit Builder: Daily Study Streak + Daily Target Counter alongside 100-Chapter Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Daily Study Streak Counter */}
          <div className="surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-amber-500/35 bg-gradient-to-br from-amber-500/12 via-transparent to-orange-500/5 flex flex-col justify-between gap-3.5 sm:gap-4">
            <div className="flex items-start justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shrink-0">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
                    {lang === 'bn' ? 'দৈনিক অধ্যয়ন স্ট্রিক (Daily Study Streak)' : 'Daily Study Streak'}
                  </div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono-num">{progress.streakDays}</span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                      {lang === 'bn' ? 'দিন একটানা সক্রিয়' : 'days running'}
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold shrink-0">
                {progress.streakDays >= 7 ? 'ধারাবাহিক সাধক' : 'নিয়মিত চর্চা'}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {weekStrip.map((d, i) => (
                <div
                  key={`streak-${d.dayNum}-${i}`}
                  className={`py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-center border text-[10px] sm:text-[11px] transition-all ${
                    d.isToday
                      ? 'bg-amber-500 text-white border-transparent font-bold shadow'
                      : d.active
                      ? 'bg-amber-500/15 border-amber-500/35 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'surface-alt border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <div className="truncate">{d.dayName}</div>
                  <div className="font-mono-num mt-0.5">{d.active ? '●' : '○'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Goal Tracker with SVG Progress Ring */}
          <DailyGoalTracker
            todayMinutesLearned={todayMinutesLearned}
            dailyTargetMinutes={progress.dailyTargetMinutes}
            streakDays={progress.streakDays}
            lang={lang}
            onAdjustTarget={(nextTarget) => updateProfile({ dailyTargetMinutes: nextTarget })}
            onLogMinutes={logStudyMinutes}
          />
        </div>

        {/* 4-Column Prodex KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="surface-card rounded-2xl p-3 sm:p-5 flex items-center gap-2.5 sm:gap-3.5"
              >
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${item.tint}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate">{item.label}</div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
                    <span className="text-lg sm:text-2xl font-bold font-mono-num">{item.value}</span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-[var(--success)] truncate">{item.sub}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 100-Chapter Curriculum Circular Gauge & Chapter Matrix */}
        <CurriculumProgressGauge
          allChapters={allChapters}
          completedLessonIds={progress.completedLessonIds}
          lang={lang}
          onCelebrateSound={triggerSound}
        />

        {/* Favorite / Bookmarked Lessons Quick Access */}
        <section className="surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 border border-amber-500/25">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>
                  {lang === 'en' ? 'Favorite Lessons (Bookmarks)' : 'পছন্দের পাঠসমূহ (Favorites)'}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-0.5">
                গুরুত্বপূর্ণ পাঠগুলো বুকমার্ক করে রাখলে এখান থেকে সরাসরি এক ক্লিকে খুলতে পারবেন
              </p>
            </div>
            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-mono-num font-bold">
              {favoriteLessons.length}টি সংরক্ষিত
            </span>
          </div>

          {favoriteLessons.length === 0 ? (
            <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
              <p className="text-xs text-[var(--text-secondary)]">
                এখনো কোনো পাঠ পছন্দের তালিকায় সংরক্ষণ করা হয়নি। যেকোনো পাঠের ভেতর থেকে <strong>“পছন্দের তালিকায়”</strong> বাটনে চাপ দিন।
              </p>
              <Link
                to={`/courses/lesson/${continueTarget.chapterNumber}/${continueTarget.lessonNumber}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold btn-secondary"
              >
                <span>পাঠ খুলুন</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {favoriteLessons.map((fav) => (
                <div
                  key={fav.lessonId}
                  className="rounded-2xl surface-alt border border-[var(--border-subtle)] hover:border-amber-500/45 p-3 sm:p-3.5 flex flex-col justify-between gap-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono-num font-bold text-[var(--accent)]">
                        <span>অধ্যায় {fav.chapterNumber} · পাঠ {fav.lessonNumber}</span>
                        {fav.isDone && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[10px]">
                            সম্পন্ন ✓
                          </span>
                        )}
                      </div>
                      <p className="font-arabic text-base text-[var(--accent)] truncate" dir="rtl">
                        {fav.titleAr}
                      </p>
                      <div className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                        {lang === 'bn' ? fav.titleBn : fav.titleEn}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavoriteLesson(fav.lessonId)}
                      title="পছন্দের তালিকা থেকে সরান"
                      aria-label="Remove favorite lesson"
                      className="p-1.5 rounded-full bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 shrink-0"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[var(--text-muted)] truncate">{fav.grammarFocus}</span>
                    <Link
                      to={`/courses/lesson/${fav.chapterNumber}/${fav.lessonNumber}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline shrink-0"
                    >
                      <span>খুলুন</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Vocabulary Deck Status Summary (Learning / Mastered / Review) + Grammar Mastery Radar */}
        <div className="surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {lang === 'en'
                    ? 'Vocabulary Deck Summary'
                    : 'ভোকাবুলারি ডেক সারাংশ (Learning · Mastered · Review)'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                মোট {vocabDeckSummary.totalDeck}টি শব্দের মধ্যে {vocabDeckSummary.trackedTotal}টি আপনার সক্রিয় ডেকে যুক্ত আছে
              </p>
            </div>
            <Link
              to="/vocabulary"
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
            >
              <span>ডেক খুলুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] text-center py-2">
            <div className="px-2">
              <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-sky-600 dark:text-sky-400">
                {vocabDeckSummary.learning}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Learning</div>
              <div className="text-[10px] text-[var(--text-muted)]">শিখছেন</div>
            </div>
            <div className="px-2">
              <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-emerald-600 dark:text-emerald-400">
                {vocabDeckSummary.mastered}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Mastered</div>
              <div className="text-[10px] text-[var(--text-muted)]">আয়ত্তকৃত</div>
            </div>
            <div className="px-2">
              <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-amber-600 dark:text-amber-400">
                {vocabDeckSummary.review}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Review</div>
              <div className="text-[10px] text-[var(--text-muted)]">পুনর্বিবেচনা</div>
            </div>
          </div>

          <div className="h-2 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden flex">
            {vocabDeckSummary.trackedTotal > 0 ? (
              <>
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(vocabDeckSummary.mastered / vocabDeckSummary.trackedTotal) * 100}%` }}
                />
                <div
                  className="bg-sky-500 h-full transition-all"
                  style={{ width: `${(vocabDeckSummary.learning / vocabDeckSummary.trackedTotal) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(vocabDeckSummary.review / vocabDeckSummary.trackedTotal) * 100}%` }}
                />
              </>
            ) : (
              <div className="bg-[var(--border-subtle)] h-full w-full" />
            )}
          </div>
        </div>

        <GrammarMasteryRadar
          progress={progress}
          lang={lang}
          grammarTerminologyMode={grammarTerminologyMode}
        />

        {/* Live Muslim Companion Strip */}
        <MuslimCompanionStrip compact />

        {/* Weekly Activity Chart (Recharts: Hours Studied + Vocabulary Learned over last 7 days) */}
        <div className="surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                <span>
                  {lang === 'bn'
                    ? 'সাপ্তাহিক অধ্যয়ন চার্ট (Weekly Activity Chart)'
                    : 'Weekly Activity Chart'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {lang === 'bn'
                  ? 'গত ৭ দিনে দৈনিক অধ্যয়ন সময় (ঘণ্টা) এবং শেখা/অনুশীলিত শব্দের সংখ্যা'
                  : 'Hours studied and vocabulary words learned over the last 7 days'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-mono-num">
              <div>
                <span className="text-[var(--text-muted)]">মোট সময়: </span>
                <span className="font-bold text-[var(--accent)]">
                  {weeklyTotals.totalHours} ঘ. ({weeklyTotals.totalMinutes} মি.)
                </span>
              </div>
              <span className="text-[var(--border-strong)]">·</span>
              <div>
                <span className="text-[var(--text-muted)]">শেখা শব্দ: </span>
                <span className="font-bold text-emerald-500">{weeklyTotals.totalVocab} টি</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[290px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={weeklyChartData} margin={{ top: 10, right: 12, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="hours"
                  orientation="left"
                  allowDecimals
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                  unit="h"
                />
                <YAxis
                  yAxisId="vocab"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: 'var(--bg-surface-alt)', opacity: 0.45 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const row = payload[0]?.payload as (typeof weeklyChartData)[number] | undefined;
                    if (!row) return null;
                    return (
                      <div className="surface-card border border-[var(--border-strong)] rounded-2xl px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                        <div className="font-bold text-[var(--text-primary)]">
                          {row.label} ({row.shortDate})
                        </div>
                        <div className="flex items-center justify-between gap-4 font-mono-num">
                          <span className="text-[var(--text-secondary)]">অধ্যয়ন সময়:</span>
                          <span className="font-bold text-indigo-500">
                            {row.hoursStudied} ঘ. ({row.minutesStudied} মি.)
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 font-mono-num">
                          <span className="text-[var(--text-secondary)]">শেখা শব্দ:</span>
                          <span className="font-bold text-emerald-500">{row.vocabLearned} টি</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => (
                    <span className="text-[var(--text-secondary)] font-medium">{value}</span>
                  )}
                />
                <Bar
                  yAxisId="hours"
                  dataKey="hoursStudied"
                  name={lang === 'bn' ? 'অধ্যয়ন (ঘণ্টা)' : 'Hours Studied'}
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                />
                <Line
                  yAxisId="vocab"
                  type="monotone"
                  dataKey="vocabLearned"
                  name={lang === 'bn' ? 'শেখা শব্দ (সংখ্যা)' : 'Vocabulary Learned'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'var(--bg-surface)' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Learning Velocity Chart (Recharts: Lessons Completed per Week) */}
        <LearningVelocityChart data={weeklyLessonVelocity} lang={lang} />

        {/* Middle 2-Column Analytics: Bar Chart + Donut Ring (Image 1 Prodex style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left: Activity / Level Bar Chart */}
          <div className="lg:col-span-7 surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  <span>অগ্রগতির বিশ্লেষণ</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  যেকোনো বারে ক্লিক বা হোভার করে বিস্তারিত দেখুন
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl surface-alt border border-[var(--border-subtle)] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setChartTab('levels');
                    setActiveBarIdx(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    chartTab === 'levels' ? 'btn-primary' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  ৬টি স্তর
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setChartTab('skills');
                    setActiveBarIdx(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    chartTab === 'skills' ? 'btn-primary' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  বিষয়ভিত্তিক
                </button>
              </div>
            </div>

            {/* Interactive Pill Bar Chart + Floating Tooltip */}
            <div className="relative pt-2">
              <div className="grid grid-cols-6 gap-2.5 sm:gap-4 items-end h-48">
                {barData.map((bar, idx) => {
                  const selected = idx === activeBarIdx;
                  return (
                    <button
                      key={bar.label}
                      type="button"
                      onClick={() => {
                        triggerSound('click');
                        setActiveBarIdx(idx);
                      }}
                      onMouseEnter={() => setActiveBarIdx(idx)}
                      className="h-full flex flex-col items-center justify-end gap-2 group focus:outline-none"
                    >
                      <div className="w-full max-w-[44px] flex-1 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] p-1 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-xl transition-all duration-300 ${
                            selected
                              ? 'bg-[var(--accent)] shadow-md'
                              : 'bg-[var(--accent)]/45 group-hover:bg-[var(--accent)]/75'
                          }`}
                          style={{ height: `${Math.max(12, bar.pct)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-mono-num ${
                          selected ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {bar.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeBar && (
                <div className="mt-4 p-3.5 rounded-2xl surface-alt border border-[var(--border-strong)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="font-semibold text-[var(--text-primary)]">{activeBar.title}</div>
                  <div className="flex items-center gap-4 text-[var(--text-secondary)] font-mono-num">
                    <span>• {activeBar.detailA}</span>
                    <span>• {activeBar.detailB}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Donut Mastery Breakdown (Image 1 Top Categories style) */}
          <div className="lg:col-span-5 surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--accent)]" />
                <span>দক্ষতা বণ্টন</span>
              </h3>
              <Link to="/leaderboard" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                র‍্যাঙ্কিং →
              </Link>
            </div>

            {/* SVG Donut Ring */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
                <circle
                  cx="55"
                  cy="55"
                  r="44"
                  fill="none"
                  stroke="var(--bg-surface-alt)"
                  strokeWidth="12"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.label}
                    cx="55"
                    cy="55"
                    r="44"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-[var(--text-muted)]">মোট স্কোর</span>
                <span className="text-xl font-bold font-mono-num">{progress.xp} XP</span>
              </div>
            </div>

            {/* Clean Legend Rows */}
            <div className="space-y-2.5 text-xs">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-[var(--text-secondary)] truncate">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono-num shrink-0">
                    <span className="font-semibold">{seg.count}</span>
                    <span className="text-[var(--text-muted)] w-8 text-right">{seg.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 2-Column Split: Recent Activity + Curriculum Matrix Table (Prodex style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-5 surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">সাম্প্রতিক কার্যক্রম</h3>
              <span className="text-xs text-[var(--text-muted)] font-mono-num">
                {progress.recentActivities.length} এন্ট্রি
              </span>
            </div>

            <div className="space-y-3">
              {progress.recentActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl surface-alt"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate">
                        {lang === 'bn' ? act.titleBn : act.titleEn}
                      </p>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono-num">
                        {new Date(act.timestampIso).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--emerald-highlight)] text-[var(--accent)] text-[11px] font-bold font-mono-num shrink-0">
                    +{act.xpEarned} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Badges quick strip */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                অর্জিত ব্যাজ: {progress.unlockedBadgeIds.length}/{BADGE_DEFINITIONS.length}
              </span>
              <Link to="/certificates" className="font-semibold text-[var(--accent)] hover:underline">
                সার্টিফিকেট দেখুন →
              </Link>
            </div>
          </div>

          {/* Curriculum Progress Table */}
          <div className="lg:col-span-7 surface-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
                <span>৬-স্তরের পাঠ্যক্রম তালিকা</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                {editingTarget ? (
                  <form onSubmit={handleSaveTarget} className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={targetInput}
                      onChange={(e) => setTargetInput(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono-num"
                    />
                    <button type="submit" className="px-2.5 py-1 rounded-lg btn-primary">
                      সেভ
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetInput(progress.dailyTargetMinutes);
                      setEditingTarget(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl btn-secondary"
                  >
                    <Target className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>লক্ষ্য: {progress.dailyTargetMinutes} মি./দিন</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="text-[11px] text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="py-2.5 pe-3">স্তর</th>
                    <th className="py-2.5 pe-3">অধ্যায়</th>
                    <th className="py-2.5 pe-3">অগ্রগতি</th>
                    <th className="py-2.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {levelStats.map((lvl) => (
                    <tr key={lvl.level} className="hover:bg-[var(--bg-surface-alt)]/60 transition-colors">
                      <td className="py-3 pe-3">
                        <div className="font-semibold">{lang === 'bn' ? lvl.nameBn : lvl.nameEn}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-arabic-ui">{lvl.nameAr}</div>
                      </td>
                      <td className="py-3 pe-3 font-mono-num text-xs text-[var(--text-muted)]">
                        {lvl.chapterStart}–{lvl.chapterEnd}
                      </td>
                      <td className="py-3 pe-3 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)] rounded-full"
                              style={{ width: `${Math.max(lvl.pct, lvl.completedInLevel > 0 ? 6 : 0)}%` }}
                            />
                          </div>
                          <span className="font-mono-num text-[11px] text-[var(--text-muted)] w-9 text-right">
                            {lvl.pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/courses?level=${lvl.level}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
                        >
                          <span>পড়ুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <Link to="/vocabulary" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs btn-secondary">
                <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>শব্দভাণ্ডার ({vocabLearnedCount})</span>
              </Link>
              <Link to="/daily-challenge" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs btn-secondary">
                <Target className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>দৈনিক চ্যালেঞ্জ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
