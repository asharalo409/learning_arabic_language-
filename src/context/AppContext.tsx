import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityLogEntry,
  AdminCustomContent,
  ChapterInfo,
  DetailedLesson,
  ExamHistoryEntry,
  ExamQuestion,
  InterfaceLang,
  LearningTrack,
  StudentProgress,
  ThemeMode,
  VocabItem,
} from '../types/academy';
import { I18N, Translations } from '../data/i18n';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import { DETAILED_LESSONS } from '../data/detailedLessons';
import { EXAM_QUESTION_BANK, VOCABULARY_BANK } from '../data/practiceAndVocabData';

const STORAGE_KEYS = {
  theme: 'aaa_theme_v1',
  lang: 'aaa_lang_v1',
  progress: 'aaa_progress_v1',
  admin: 'aaa_admin_content_v1',
};

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultProgress(): StudentProgress {
  return {
    studentName: 'তাসীন বিল্লাহ (Student)',
    preferredTrack: 'Combined',
    dailyTargetMinutes: 20,
    xp: 120,
    streakDays: 1,
    lastActiveDate: todayDateKey(),
    totalMinutesLearned: 15,
    completedLessonIds: [],
    completedGrammarIds: [],
    dailyChallengeCompletedDates: [],
    vocabProgress: {},
    examHistory: [],
    recentActivities: [
      {
        id: 'init-1',
        timestampIso: new Date().toISOString(),
        titleBn: 'AI Arabic Academy-তে স্বাগতম! প্রথম পাঠের জন্য প্রস্তুত।',
        titleEn: 'Joined AI Arabic Academy and ready for Lesson 1.',
        xpEarned: 120,
        type: 'lesson',
      },
    ],
    unlockedBadgeIds: ['starter-niyyah'],
  };
}

function getDefaultAdminContent(): AdminCustomContent {
  return {
    customChapters: [],
    customLessons: {},
    customVocab: [],
    customQuestions: [],
  };
}

export interface BadgeDefinition {
  id: string;
  titleBn: string;
  titleEn: string;
  criteriaBn: string;
  criteriaEn: string;
  check: (p: StudentProgress) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'starter-niyyah',
    titleBn: 'বিশুদ্ধ নিয়ত (প্রথম পদক্ষেপ)',
    titleEn: 'First Step Scholar',
    criteriaBn: 'একাডেমিতে যাত্রা শুরু করা',
    criteriaEn: 'Started learning at AI Arabic Academy',
    check: () => true,
  },
  {
    id: 'first-lesson',
    titleBn: 'প্রথম পাঠ সম্পন্ন',
    titleEn: 'Lesson Pioneer',
    criteriaBn: 'কমপক্ষে ১টি পূর্ণাঙ্গ পাঠ সম্পন্ন করা',
    criteriaEn: 'Complete at least 1 lesson',
    check: (p) => p.completedLessonIds.length >= 1,
  },
  {
    id: 'vocab-keeper',
    titleBn: 'শব্দভাণ্ডার সংরক্ষক',
    titleEn: 'Lexicon Keeper',
    criteriaBn: '৫টি আরবি শব্দ অনুশীলন বা প্রিয় তালিকায় যোগ করা',
    criteriaEn: 'Practice or favorite 5+ vocabulary words',
    check: (p) => Object.keys(p.vocabProgress).length >= 5,
  },
  {
    id: 'nahw-explorer',
    titleBn: 'নাহু ও ছরফ অন্বেষক',
    titleEn: 'Grammar Explorer',
    criteriaBn: '৩টি ব্যাকরণ অধ্যায় সম্পন্ন করা',
    criteriaEn: 'Complete 3 grammar topics',
    check: (p) => p.completedGrammarIds.length >= 3,
  },
  {
    id: 'exam-achiever',
    titleBn: 'পরীক্ষা কৃতিত্ব',
    titleEn: 'Quiz Achiever',
    criteriaBn: 'যেকোনো পরীক্ষায় ৭৫% বা তার বেশি নম্বর অর্জন',
    criteriaEn: 'Score 75%+ on any examination',
    check: (p) => p.examHistory.some((e) => e.percentage >= 75),
  },
  {
    id: 'daily-challenger',
    titleBn: 'দৈনিক চ্যালেঞ্জ বিজয়ী',
    titleEn: 'Daily Challenger',
    criteriaBn: 'দৈনিক চ্যালেঞ্জ সম্পন্ন করা',
    criteriaEn: 'Complete a Daily Challenge',
    check: (p) => p.dailyChallengeCompletedDates.length >= 1,
  },
];

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  lang: InterfaceLang;
  setLang: (l: InterfaceLang) => void;
  t: Translations;
  progress: StudentProgress;
  currentLevelNumber: number;
  allChapters: ChapterInfo[];
  allDetailedLessons: Record<string, DetailedLesson>;
  allVocabulary: VocabItem[];
  allExamQuestions: ExamQuestion[];
  adminContent: AdminCustomContent;
  awardXp: (amount: number, activity: Omit<ActivityLogEntry, 'id' | 'timestampIso' | 'xpEarned'>) => void;
  completeLesson: (lessonId: string, lessonTitleBn: string, lessonTitleEn: string) => void;
  completeGrammarTopic: (topicId: string, titleBn: string, titleEn: string) => void;
  reviewVocabWord: (wordId: string, quality: 'again' | 'good' | 'easy') => void;
  toggleFavoriteVocab: (wordId: string) => void;
  recordExamResult: (entry: Omit<ExamHistoryEntry, 'id' | 'dateIso'>) => void;
  completeDailyChallenge: (score: number, total: number) => void;
  updateProfile: (updates: Partial<Pick<StudentProgress, 'studentName' | 'preferredTrack' | 'dailyTargetMinutes'>>) => void;
  resetProgress: () => void;
  addCustomChapter: (chapter: ChapterInfo) => void;
  saveCustomLesson: (lesson: DetailedLesson) => void;
  addCustomVocab: (item: VocabItem) => void;
  addCustomQuestion: (q: ExamQuestion) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function computeBadges(progress: StudentProgress): string[] {
  return BADGE_DEFINITIONS.filter((b) => b.check(progress)).map((b) => b.id);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'emerald';
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    return saved === 'midnight' || saved === 'light' || saved === 'emerald' ? saved : 'emerald';
  });

  const [lang, setLangState] = useState<InterfaceLang>(() => {
    if (typeof window === 'undefined') return 'bn';
    const saved = localStorage.getItem(STORAGE_KEYS.lang);
    return saved === 'en' || saved === 'ar' || saved === 'bn' ? saved : 'bn';
  });

  const [progress, setProgress] = useState<StudentProgress>(() => {
    if (typeof window === 'undefined') return getDefaultProgress();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      if (!raw) return getDefaultProgress();
      const parsed = JSON.parse(raw) as StudentProgress;
      return { ...getDefaultProgress(), ...parsed };
    } catch {
      return getDefaultProgress();
    }
  });

  const [adminContent, setAdminContent] = useState<AdminCustomContent>(() => {
    if (typeof window === 'undefined') return getDefaultAdminContent();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.admin);
      if (!raw) return getDefaultAdminContent();
      return { ...getDefaultAdminContent(), ...(JSON.parse(raw) as AdminCustomContent) };
    } catch {
      return getDefaultAdminContent();
    }
  });

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
  }, []);

  const setLang = useCallback((next: InterfaceLang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEYS.lang, next);
  }, []);

  // Apply theme & RTL direction to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  // Persist progress and admin content
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    } catch {
      // ignore storage quota errors
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(adminContent));
    } catch {
      // ignore storage quota errors
    }
  }, [adminContent]);

  // Real active study timer: increments totalMinutesLearned every 60s when tab is visible
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setProgress((prev) => ({
          ...prev,
          totalMinutesLearned: prev.totalMinutesLearned + 1,
        }));
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  // Check and update daily streak on mount
  useEffect(() => {
    const today = todayDateKey();
    setProgress((prev) => {
      if (prev.lastActiveDate === today) return prev;
      const last = new Date(prev.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      const nextStreak = diffDays === 1 ? prev.streakDays + 1 : diffDays > 1 ? 1 : prev.streakDays;
      return {
        ...prev,
        streakDays: nextStreak,
        lastActiveDate: today,
      };
    });
  }, []);

  const updateWithBadges = useCallback((updater: (prev: StudentProgress) => StudentProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      return {
        ...next,
        unlockedBadgeIds: computeBadges(next),
      };
    });
  }, []);

  const awardXp = useCallback(
    (amount: number, activity: Omit<ActivityLogEntry, 'id' | 'timestampIso' | 'xpEarned'>) => {
      updateWithBadges((prev) => ({
        ...prev,
        xp: prev.xp + amount,
        lastActiveDate: todayDateKey(),
        recentActivities: [
          {
            id: `act-${Date.now()}`,
            timestampIso: new Date().toISOString(),
            xpEarned: amount,
            ...activity,
          },
          ...prev.recentActivities,
        ].slice(0, 20),
      }));
    },
    [updateWithBadges]
  );

  const completeLesson = useCallback(
    (lessonId: string, lessonTitleBn: string, lessonTitleEn: string) => {
      updateWithBadges((prev) => {
        const alreadyDone = prev.completedLessonIds.includes(lessonId);
        const xpGain = alreadyDone ? 10 : 50;
        return {
          ...prev,
          xp: prev.xp + xpGain,
          lastActiveDate: todayDateKey(),
          completedLessonIds: alreadyDone ? prev.completedLessonIds : [...prev.completedLessonIds, lessonId],
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              timestampIso: new Date().toISOString(),
              titleBn: `${alreadyDone ? 'পুনরালোচনা সম্পন্ন' : 'পাঠ সম্পন্ন'}: ${lessonTitleBn}`,
              titleEn: `${alreadyDone ? 'Reviewed' : 'Completed'}: ${lessonTitleEn}`,
              xpEarned: xpGain,
              type: 'lesson' as const,
            },
            ...prev.recentActivities,
          ].slice(0, 20),
        };
      });
    },
    [updateWithBadges]
  );

  const completeGrammarTopic = useCallback(
    (topicId: string, titleBn: string, titleEn: string) => {
      updateWithBadges((prev) => {
        const alreadyDone = prev.completedGrammarIds.includes(topicId);
        const xpGain = alreadyDone ? 5 : 35;
        return {
          ...prev,
          xp: prev.xp + xpGain,
          completedGrammarIds: alreadyDone ? prev.completedGrammarIds : [...prev.completedGrammarIds, topicId],
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              timestampIso: new Date().toISOString(),
              titleBn: `ব্যাকরণ অধ্যায়: ${titleBn}`,
              titleEn: `Grammar mastered: ${titleEn}`,
              xpEarned: xpGain,
              type: 'lesson' as const,
            },
            ...prev.recentActivities,
          ].slice(0, 20),
        };
      });
    },
    [updateWithBadges]
  );

  const reviewVocabWord = useCallback(
    (wordId: string, quality: 'again' | 'good' | 'easy') => {
      updateWithBadges((prev) => {
        const existing = prev.vocabProgress[wordId] || {
          wordId,
          ease: 2.5,
          intervalDays: 0,
          nextReviewIso: new Date().toISOString(),
          repetitions: 0,
          favorite: false,
        };
        let nextInterval = 1;
        let nextEase = existing.ease;
        let nextReps = existing.repetitions;

        if (quality === 'again') {
          nextInterval = 0;
          nextReps = 0;
          nextEase = Math.max(1.3, existing.ease - 0.2);
        } else if (quality === 'good') {
          nextReps += 1;
          nextInterval = nextReps === 1 ? 1 : nextReps === 2 ? 3 : Math.round(existing.intervalDays * existing.ease);
        } else {
          nextReps += 1;
          nextEase = Math.min(3.0, existing.ease + 0.15);
          nextInterval = nextReps === 1 ? 3 : Math.round(Math.max(2, existing.intervalDays) * nextEase * 1.2);
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + nextInterval);

        return {
          ...prev,
          xp: prev.xp + (quality === 'again' ? 3 : 10),
          vocabProgress: {
            ...prev.vocabProgress,
            [wordId]: {
              ...existing,
              ease: nextEase,
              intervalDays: nextInterval,
              repetitions: nextReps,
              nextReviewIso: nextDate.toISOString(),
            },
          },
        };
      });
    },
    [updateWithBadges]
  );

  const toggleFavoriteVocab = useCallback(
    (wordId: string) => {
      updateWithBadges((prev) => {
        const existing = prev.vocabProgress[wordId] || {
          wordId,
          ease: 2.5,
          intervalDays: 0,
          nextReviewIso: new Date().toISOString(),
          repetitions: 0,
          favorite: false,
        };
        return {
          ...prev,
          vocabProgress: {
            ...prev.vocabProgress,
            [wordId]: { ...existing, favorite: !existing.favorite },
          },
        };
      });
    },
    [updateWithBadges]
  );

  const recordExamResult = useCallback(
    (entry: Omit<ExamHistoryEntry, 'id' | 'dateIso'>) => {
      updateWithBadges((prev) => {
        const xpGain = Math.max(15, Math.round(entry.percentage * 0.6));
        const newEntry: ExamHistoryEntry = {
          ...entry,
          id: `exam-${Date.now()}`,
          dateIso: new Date().toISOString(),
        };
        return {
          ...prev,
          xp: prev.xp + xpGain,
          examHistory: [newEntry, ...prev.examHistory].slice(0, 30),
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              timestampIso: new Date().toISOString(),
              titleBn: `পরীক্ষা সম্পন্ন (${entry.mode}): ${entry.percentage}%`,
              titleEn: `Exam completed (${entry.mode}): ${entry.percentage}%`,
              xpEarned: xpGain,
              type: 'quiz' as const,
            },
            ...prev.recentActivities,
          ].slice(0, 20),
        };
      });
    },
    [updateWithBadges]
  );

  const completeDailyChallenge = useCallback(
    (score: number, total: number) => {
      const today = todayDateKey();
      updateWithBadges((prev) => {
        const already = prev.dailyChallengeCompletedDates.includes(today);
        const xpGain = already ? 15 : 60 + score * 10;
        return {
          ...prev,
          xp: prev.xp + xpGain,
          dailyChallengeCompletedDates: already
            ? prev.dailyChallengeCompletedDates
            : [...prev.dailyChallengeCompletedDates, today],
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              timestampIso: new Date().toISOString(),
              titleBn: `দৈনিক চ্যালেঞ্জ সম্পন্ন (${score}/${total})`,
              titleEn: `Daily Challenge completed (${score}/${total})`,
              xpEarned: xpGain,
              type: 'daily' as const,
            },
            ...prev.recentActivities,
          ].slice(0, 20),
        };
      });
    },
    [updateWithBadges]
  );

  const updateProfile = useCallback(
    (updates: Partial<Pick<StudentProgress, 'studentName' | 'preferredTrack' | 'dailyTargetMinutes'>>) => {
      setProgress((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetProgress = useCallback(() => {
    const fresh = getDefaultProgress();
    setProgress(fresh);
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(fresh));
  }, []);

  const addCustomChapter = useCallback((chapter: ChapterInfo) => {
    setAdminContent((prev) => ({
      ...prev,
      customChapters: [...prev.customChapters.filter((c) => c.chapterNumber !== chapter.chapterNumber), chapter],
    }));
  }, []);

  const saveCustomLesson = useCallback((lesson: DetailedLesson) => {
    setAdminContent((prev) => ({
      ...prev,
      customLessons: { ...prev.customLessons, [lesson.id]: lesson },
    }));
  }, []);

  const addCustomVocab = useCallback((item: VocabItem) => {
    setAdminContent((prev) => ({
      ...prev,
      customVocab: [item, ...prev.customVocab],
    }));
  }, []);

  const addCustomQuestion = useCallback((q: ExamQuestion) => {
    setAdminContent((prev) => ({
      ...prev,
      customQuestions: [q, ...prev.customQuestions],
    }));
  }, []);

  const allChapters = useMemo(() => {
    const map = new Map<number, ChapterInfo>();
    CURRICULUM_CHAPTERS.forEach((ch) => map.set(ch.chapterNumber, ch));
    adminContent.customChapters.forEach((ch) => map.set(ch.chapterNumber, ch));
    return Array.from(map.values()).sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [adminContent.customChapters]);

  const allDetailedLessons = useMemo(() => {
    return { ...DETAILED_LESSONS, ...adminContent.customLessons };
  }, [adminContent.customLessons]);

  const allVocabulary = useMemo(() => {
    return [...adminContent.customVocab, ...VOCABULARY_BANK];
  }, [adminContent.customVocab]);

  const allExamQuestions = useMemo(() => {
    return [...adminContent.customQuestions, ...EXAM_QUESTION_BANK];
  }, [adminContent.customQuestions]);

  const currentLevelNumber = useMemo(() => {
    if (progress.xp >= 2500) return 6;
    if (progress.xp >= 1500) return 5;
    if (progress.xp >= 900) return 4;
    if (progress.xp >= 500) return 3;
    if (progress.xp >= 250) return 2;
    return 1;
  }, [progress.xp]);

  const value: AppContextValue = {
    theme,
    setTheme,
    lang,
    setLang,
    t: I18N[lang],
    progress,
    currentLevelNumber,
    allChapters,
    allDetailedLessons,
    allVocabulary,
    allExamQuestions,
    adminContent,
    awardXp,
    completeLesson,
    completeGrammarTopic,
    reviewVocabWord,
    toggleFavoriteVocab,
    recordExamResult,
    completeDailyChallenge,
    updateProfile,
    resetProgress,
    addCustomChapter,
    saveCustomLesson,
    addCustomVocab,
    addCustomQuestion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
