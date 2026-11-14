import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityLogEntry,
  AdminCustomContent,
  BackdropIntensity,
  ChapterInfo,
  ColorSchemeMode,
  DetailedLesson,
  ExamHistoryEntry,
  ExamQuestion,
  InterfaceLang,
  StudentProgress,
  ThemeMode,
  VocabItem,
  WeeklyDayActivity,
} from '../types/academy';
import { I18N, Translations } from '../data/i18n';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import { DETAILED_LESSONS } from '../data/detailedLessons';
import { EXAM_QUESTION_BANK } from '../data/practiceAndVocabData';
import { computeSm2Next, CURRICULUM_VOCAB_DECK, Sm2Quality } from '../data/curriculumVocabDeck';
import { isSoundEnabled, playSound, setSoundEnabledPref, SoundEffectType } from '../utils/soundEffects';
import { setPreferredVoiceGender } from '../utils/speech';
import { normalizeArabicTokenKey } from '../utils/lessonVocabDedupe';
import {
  buildSegmentsFromDetailedLesson,
  extractMissingWordsFromSegments,
  ReadingSegmentInput,
  scheduleBackgroundVocabWork,
} from '../utils/vocabAutoSync';
import {
  AcademyNotification,
  dispatchBrowserNotification,
  getBrowserNotificationStatus,
  getReminderSettings,
  getStoredNotifications,
  ReminderSettings,
  requestBrowserNotificationPermission,
  saveReminderSettings,
  saveStoredNotifications,
} from '../utils/notifications';
import { useAuth } from './AuthContext';

const STORAGE_KEYS = {
  theme: 'aaa_theme_v1',
  colorScheme: 'aaa_color_scheme_v1',
  preferredLightTheme: 'aaa_pref_light_theme_v1',
  preferredDarkTheme: 'aaa_pref_dark_theme_v1',
  backdrop: 'aaa_backdrop_intensity_v1',
  lang: 'aaa_lang_v1',
  progress: 'aaa_progress_v1',
  admin: 'aaa_admin_content_v1',
  welcomeSeen: 'aaa_welcome_seen_forever_v1',
  dailyStudyLog: 'aaa_daily_study_log_v1',
  weeklyActivity: 'aaa_weekly_activity_v1',
};

type WeeklyActivityStore = Record<string, { minutesStudied: number; vocabLearned: number }>;

function dateKeyDaysAgo(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function readWeeklyActivityMap(initialTodayMinutes: number): WeeklyActivityStore {
  const today = todayDateKey();
  if (typeof window === 'undefined') {
    return { [today]: { minutesStudied: initialTodayMinutes, vocabLearned: 0 } };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.weeklyActivity);
    if (!raw) {
      return { [today]: { minutesStudied: initialTodayMinutes, vocabLearned: 0 } };
    }
    const parsed = JSON.parse(raw) as WeeklyActivityStore;
    const todayEntry = parsed[today] || { minutesStudied: 0, vocabLearned: 0 };
    return {
      ...parsed,
      [today]: {
        minutesStudied: Math.max(todayEntry.minutesStudied || 0, initialTodayMinutes),
        vocabLearned: todayEntry.vocabLearned || 0,
      },
    };
  } catch {
    return { [today]: { minutesStudied: initialTodayMinutes, vocabLearned: 0 } };
  }
}

function saveWeeklyActivityMap(map: WeeklyActivityStore): void {
  if (typeof window === 'undefined') return;
  try {
    const cutoff = dateKeyDaysAgo(30);
    const pruned: WeeklyActivityStore = {};
    Object.entries(map).forEach(([date, val]) => {
      if (date >= cutoff) {
        pruned[date] = {
          minutesStudied: Math.max(0, Math.round(val.minutesStudied || 0)),
          vocabLearned: Math.max(0, Math.round(val.vocabLearned || 0)),
        };
      }
    });
    localStorage.setItem(STORAGE_KEYS.weeklyActivity, JSON.stringify(pruned));
  } catch {
    // ignore
  }
}

function readTodayMinutes(): number {
  if (typeof window === 'undefined') return 5;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.dailyStudyLog);
    if (!raw) return 5;
    const parsed = JSON.parse(raw) as { date?: string; minutes?: number };
    if (parsed.date === todayDateKey() && typeof parsed.minutes === 'number') {
      return Math.max(0, parsed.minutes);
    }
    return 0;
  } catch {
    return 5;
  }
}

function saveTodayMinutes(minutes: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEYS.dailyStudyLog,
      JSON.stringify({ date: todayDateKey(), minutes: Math.max(0, minutes) })
    );
  } catch {
    // ignore
  }
}

const LIGHT_THEMES: ThemeMode[] = ['sky-cloud', 'light', 'parchment'];
const DARK_THEMES: ThemeMode[] = ['emerald', 'midnight', 'madinah', 'kaaba', 'andalus'];

export function isLightThemeMode(mode: ThemeMode): boolean {
  return LIGHT_THEMES.includes(mode);
}

const VALID_THEMES: ThemeMode[] = [...LIGHT_THEMES, ...DARK_THEMES];

const THEME_BAR_COLORS: Record<ThemeMode, string> = {
  'sky-cloud': '#dff2ff',
  emerald: '#041510',
  midnight: '#060b18',
  light: '#f2f8f5',
  madinah: '#051a18',
  kaaba: '#09090b',
  parchment: '#f6efe2',
  andalus: '#0b1224',
};

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultProgress(name = 'প্রিয় শিক্ষার্থী'): StudentProgress {
  return {
    studentName: name,
    preferredTrack: 'Combined',
    voiceGender: 'male',
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
    personalVocab: [],
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

export type BadgeIconName =
  | 'sparkles'
  | 'book'
  | 'compass'
  | 'layers'
  | 'award'
  | 'graduation'
  | 'crown'
  | 'flame'
  | 'trophy'
  | 'star';

export interface BadgeDefinition {
  id: string;
  titleBn: string;
  titleEn: string;
  criteriaBn: string;
  criteriaEn: string;
  iconName: BadgeIconName;
  accentGrad: string;
  check: (p: StudentProgress) => boolean;
  getProgress: (p: StudentProgress) => { current: number; target: number };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'starter-niyyah',
    titleBn: 'বিশুদ্ধ নিয়ত (প্রথম পদক্ষেপ)',
    titleEn: 'First Step Scholar',
    criteriaBn: 'একাডেমিতে আরবি শেখার যাত্রা শুরু করা',
    criteriaEn: 'Started learning at AI Arabic Academy',
    iconName: 'sparkles',
    accentGrad: 'from-emerald-500 to-teal-600',
    check: () => true,
    getProgress: () => ({ current: 1, target: 1 }),
  },
  {
    id: 'first-lesson',
    titleBn: 'প্রথম পাঠ সম্পন্ন',
    titleEn: 'Lesson Pioneer',
    criteriaBn: 'কমপক্ষে ১টি পূর্ণাঙ্গ পাঠ সম্পন্ন করা',
    criteriaEn: 'Complete at least 1 lesson',
    iconName: 'book',
    accentGrad: 'from-sky-500 to-blue-600',
    check: (p) => p.completedLessonIds.length >= 1,
    getProgress: (p) => ({ current: Math.min(1, p.completedLessonIds.length), target: 1 }),
  },
  {
    id: 'curriculum-explorer',
    titleBn: 'পাঠ্যক্রম অভিযাত্রী',
    titleEn: 'Curriculum Explorer',
    criteriaBn: '১০০ অধ্যায়ের সিলেবাস থেকে ৫টি পাঠ সম্পন্ন করা',
    criteriaEn: 'Complete 5 lessons from the 100-chapter curriculum',
    iconName: 'compass',
    accentGrad: 'from-cyan-500 to-indigo-600',
    check: (p) => p.completedLessonIds.length >= 5,
    getProgress: (p) => ({ current: Math.min(5, p.completedLessonIds.length), target: 5 }),
  },
  {
    id: 'vocab-keeper',
    titleBn: 'শব্দভাণ্ডার সংরক্ষক',
    titleEn: 'Lexicon Keeper',
    criteriaBn: '৫টি আরবি শব্দ অনুশীলন বা প্রিয় তালিকায় যোগ করা',
    criteriaEn: 'Practice or favorite 5+ vocabulary words',
    iconName: 'layers',
    accentGrad: 'from-teal-500 to-emerald-600',
    check: (p) => Object.keys(p.vocabProgress).length >= 5,
    getProgress: (p) => ({ current: Math.min(5, Object.keys(p.vocabProgress).length), target: 5 }),
  },
  {
    id: 'vocab-expert',
    titleBn: 'শব্দভাণ্ডার বিশেষজ্ঞ (Vocabulary Expert)',
    titleEn: 'Vocabulary Expert',
    criteriaBn: '২০টি শব্দ অনুশীলন বা ৮টি শব্দ SRS-এ আয়ত্ত করা',
    criteriaEn: 'Practice 20+ words or master 8+ SM-2 flashcards',
    iconName: 'award',
    accentGrad: 'from-amber-500 to-orange-600',
    check: (p) => {
      const entries = Object.values(p.vocabProgress);
      const mastered = entries.filter((v) => v.repetitions >= 2).length;
      return entries.length >= 20 || mastered >= 8;
    },
    getProgress: (p) => ({ current: Math.min(20, Object.keys(p.vocabProgress).length), target: 20 }),
  },
  {
    id: 'nahw-explorer',
    titleBn: 'নাহু ও ছরফ অন্বেষক',
    titleEn: 'Grammar Explorer',
    criteriaBn: '৩টি ব্যাকরণ অধ্যায় সম্পন্ন করা',
    criteriaEn: 'Complete 3 grammar topics',
    iconName: 'graduation',
    accentGrad: 'from-indigo-500 to-violet-600',
    check: (p) => p.completedGrammarIds.length >= 3,
    getProgress: (p) => ({ current: Math.min(3, p.completedGrammarIds.length), target: 3 }),
  },
  {
    id: 'grammar-master',
    titleBn: 'ব্যাকরণ মাস্টার (Grammar Master)',
    titleEn: 'Grammar Master',
    criteriaBn: '৬টি নাহু-ছরফ মডিউল বা ৫+ ব্যাকরণ ও পাঠ সমন্বয়ে আয়ত্ত করা',
    criteriaEn: 'Complete 6+ grammar modules (Nahw & Sarf mastery)',
    iconName: 'crown',
    accentGrad: 'from-purple-600 to-fuchsia-600',
    check: (p) =>
      p.completedGrammarIds.length >= 6 ||
      (p.completedGrammarIds.length >= 4 && p.completedLessonIds.length >= 5),
    getProgress: (p) => ({ current: Math.min(6, p.completedGrammarIds.length), target: 6 }),
  },
  {
    id: 'streak-keeper',
    titleBn: 'ধারাবাহিকতা রক্ষক (৩+ দিন)',
    titleEn: '3-Day Streak Keeper',
    criteriaBn: 'টানা ৩ দিন বা তার বেশি আরবি অনুশীলন বজায় রাখা',
    criteriaEn: 'Maintain a 3+ day daily learning streak',
    iconName: 'flame',
    accentGrad: 'from-orange-500 to-rose-600',
    check: (p) => p.streakDays >= 3,
    getProgress: (p) => ({ current: Math.min(3, p.streakDays), target: 3 }),
  },
  {
    id: 'exam-achiever',
    titleBn: 'পরীক্ষা কৃতিত্ব',
    titleEn: 'Quiz Achiever',
    criteriaBn: 'যেকোনো পরীক্ষায় ৭৫% বা তার বেশি নম্বর অর্জন',
    criteriaEn: 'Score 75%+ on any examination',
    iconName: 'trophy',
    accentGrad: 'from-yellow-500 to-amber-600',
    check: (p) => p.examHistory.some((e) => e.percentage >= 75),
    getProgress: (p) => {
      const best = p.examHistory.reduce((mx, e) => Math.max(mx, e.percentage), 0);
      return { current: Math.min(75, Math.round(best)), target: 75 };
    },
  },
  {
    id: 'daily-challenger',
    titleBn: 'দৈনিক চ্যালেঞ্জ বিজয়ী',
    titleEn: 'Daily Challenger',
    criteriaBn: 'দৈনিক চ্যালেঞ্জ সম্পন্ন করা',
    criteriaEn: 'Complete a Daily Challenge',
    iconName: 'star',
    accentGrad: 'from-rose-500 to-pink-600',
    check: (p) => p.dailyChallengeCompletedDates.length >= 1,
    getProgress: (p) => ({ current: Math.min(1, p.dailyChallengeCompletedDates.length), target: 1 }),
  },
  {
    id: 'xp-champion',
    titleBn: 'ইলম চ্যাম্পিয়ন (১,০০০ XP)',
    titleEn: 'Knowledge Champion',
    criteriaBn: 'সর্বমোট ১,০০০ XP পয়েন্ট অর্জন করা',
    criteriaEn: 'Earn 1,000+ total XP across all academy activities',
    iconName: 'crown',
    accentGrad: 'from-emerald-600 to-cyan-600',
    check: (p) => p.xp >= 1000,
    getProgress: (p) => ({ current: Math.min(1000, p.xp), target: 1000 }),
  },
];

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  colorScheme: ColorSchemeMode;
  setColorScheme: (mode: ColorSchemeMode) => void;
  resolvedDarkMode: boolean;
  osPrefersDark: boolean;
  backdropIntensity: BackdropIntensity;
  setBackdropIntensity: (b: BackdropIntensity) => void;
  lang: InterfaceLang;
  setLang: (l: InterfaceLang) => void;
  t: Translations;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  triggerSound: (type: SoundEffectType, force?: boolean) => boolean;
  notifications: AcademyNotification[];
  unreadNotificationCount: number;
  activeToast: AcademyNotification | null;
  dismissToast: () => void;
  pushNotification: (
    item: Omit<AcademyNotification, 'id' | 'timestampIso' | 'read'>,
    alsoBrowserNotify?: boolean
  ) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  reminderSettings: ReminderSettings;
  updateReminderSettings: (updates: Partial<ReminderSettings>) => void;
  browserNotifPermission: NotificationPermission | 'unsupported';
  enableBrowserNotifications: () => Promise<NotificationPermission | 'unsupported'>;
  sendTestNotification: () => Promise<void>;
  welcomeOpen: boolean;
  openWelcome: () => void;
  dismissWelcome: () => void;
  progress: StudentProgress;
  todayMinutesLearned: number;
  weeklyActivity: WeeklyDayActivity[];
  logStudyMinutes: (minutes: number) => void;
  currentLevelNumber: number;
  allChapters: ChapterInfo[];
  allDetailedLessons: Record<string, DetailedLesson>;
  allVocabulary: VocabItem[];
  allExamQuestions: ExamQuestion[];
  adminContent: AdminCustomContent;
  awardXp: (amount: number, activity: Omit<ActivityLogEntry, 'id' | 'timestampIso' | 'xpEarned'>) => void;
  completeLesson: (lessonId: string, lessonTitleBn: string, lessonTitleEn: string) => void;
  completeGrammarTopic: (topicId: string, titleBn: string, titleEn: string) => void;
  reviewVocabWord: (wordId: string, quality: Sm2Quality) => void;
  toggleFavoriteVocab: (wordId: string) => void;
  recordExamResult: (entry: Omit<ExamHistoryEntry, 'id' | 'dateIso'>) => void;
  completeDailyChallenge: (score: number, total: number) => void;
  updateProfile: (
    updates: Partial<Pick<StudentProgress, 'studentName' | 'preferredTrack' | 'voiceGender' | 'dailyTargetMinutes'>>
  ) => void;
  resetProgress: () => void;
  addCustomChapter: (chapter: ChapterInfo) => void;
  saveCustomLesson: (lesson: DetailedLesson) => void;
  addCustomVocab: (item: VocabItem) => void;
  addCustomQuestion: (q: ExamQuestion) => void;
  syncMissingVocabFromSegments: (segments: ReadingSegmentInput[]) => void;
  globalGrammarEnabled: boolean;
  setGlobalGrammarEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function computeBadges(progress: StudentProgress): string[] {
  return BADGE_DEFINITIONS.filter((b) => b.check(progress)).map((b) => b.id);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, syncProgressToAccount } = useAuth();

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'sky-cloud';
    const saved = localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    return saved && VALID_THEMES.includes(saved) ? saved : 'sky-cloud';
  });

  const [colorScheme, setColorSchemeState] = useState<ColorSchemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const savedScheme = localStorage.getItem(STORAGE_KEYS.colorScheme) as ColorSchemeMode | null;
    if (savedScheme === 'system' || savedScheme === 'light' || savedScheme === 'dark') {
      return savedScheme;
    }
    const legacyTheme = localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    if (legacyTheme && VALID_THEMES.includes(legacyTheme)) {
      return isLightThemeMode(legacyTheme) ? 'light' : 'dark';
    }
    return 'system';
  });

  const [preferredLightTheme, setPreferredLightTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'sky-cloud';
    const saved = localStorage.getItem(STORAGE_KEYS.preferredLightTheme) as ThemeMode | null;
    return saved && isLightThemeMode(saved) ? saved : 'sky-cloud';
  });

  const [preferredDarkTheme, setPreferredDarkTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'andalus';
    const saved = localStorage.getItem(STORAGE_KEYS.preferredDarkTheme) as ThemeMode | null;
    return saved && VALID_THEMES.includes(saved) && !isLightThemeMode(saved) ? saved : 'andalus';
  });

  const [osPrefersDark, setOsPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setOsPrefersDark(e.matches);
    setOsPrefersDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedDarkMode = useMemo(() => {
    if (colorScheme === 'dark') return true;
    if (colorScheme === 'light') return false;
    return osPrefersDark;
  }, [colorScheme, osPrefersDark]);

  const effectiveTheme = useMemo<ThemeMode>(() => {
    if (resolvedDarkMode) {
      return isLightThemeMode(theme) ? preferredDarkTheme : theme;
    }
    return isLightThemeMode(theme) ? theme : preferredLightTheme;
  }, [resolvedDarkMode, theme, preferredDarkTheme, preferredLightTheme]);

  const [backdropIntensity, setBackdropIntensityState] = useState<BackdropIntensity>(() => {
    if (typeof window === 'undefined') return 'vivid';
    const saved = localStorage.getItem(STORAGE_KEYS.backdrop) as BackdropIntensity | null;
    return saved === 'vivid' || saved === 'gentle' || saved === 'off' ? saved : 'vivid';
  });

  const [lang, setLangState] = useState<InterfaceLang>(() => {
    if (typeof window === 'undefined') return 'bn';
    const saved = localStorage.getItem(STORAGE_KEYS.lang);
    return saved === 'en' || saved === 'ar' || saved === 'bn' ? saved : 'bn';
  });

  const [globalGrammarEnabled, setGlobalGrammarEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('aaa_global_grammar_enabled_v1');
    return saved === null ? true : saved === '1';
  });

  const setGlobalGrammarEnabled = useCallback((enabled: boolean) => {
    setGlobalGrammarEnabledState(enabled);
    try {
      localStorage.setItem('aaa_global_grammar_enabled_v1', enabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, []);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => isSoundEnabled());
  const [notifications, setNotifications] = useState<AcademyNotification[]>(() => getStoredNotifications());
  const [activeToast, setActiveToast] = useState<AcademyNotification | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => getReminderSettings());
  const [browserNotifPermission, setBrowserNotifPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getBrowserNotificationStatus()
  );

  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hasSession = Boolean(localStorage.getItem('aaa_local_session_email_v1'));
    const alreadySeen = Boolean(localStorage.getItem(STORAGE_KEYS.welcomeSeen));
    return !hasSession && !alreadySeen;
  });

  const [progress, setProgress] = useState<StudentProgress>(() => {
    if (typeof window === 'undefined') return getDefaultProgress();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      if (!raw) return getDefaultProgress();
      const parsed = JSON.parse(raw) as StudentProgress;
      if (parsed.studentName === 'তাসীন বিল্লাহ (Student)') {
        parsed.studentName = 'প্রিয় শিক্ষার্থী';
      }
      const hydrated = { ...getDefaultProgress(), ...parsed };
      hydrated.unlockedBadgeIds = Array.from(
        new Set([...(hydrated.unlockedBadgeIds || []), ...computeBadges(hydrated)])
      );
      setPreferredVoiceGender(hydrated.voiceGender || 'male');
      return hydrated;
    } catch {
      return getDefaultProgress();
    }
  });

  const [todayMinutesLearned, setTodayMinutesLearned] = useState<number>(() => readTodayMinutes());
  const [weeklyActivityMap, setWeeklyActivityMap] = useState<WeeklyActivityStore>(() =>
    readWeeklyActivityMap(readTodayMinutes())
  );

  const recordWeeklyDelta = useCallback((deltaMinutes: number, deltaVocab: number) => {
    const today = todayDateKey();
    setWeeklyActivityMap((prev) => {
      const existing = prev[today] || { minutesStudied: 0, vocabLearned: 0 };
      const nextMap: WeeklyActivityStore = {
        ...prev,
        [today]: {
          minutesStudied: Math.max(0, existing.minutesStudied + deltaMinutes),
          vocabLearned: Math.max(0, existing.vocabLearned + deltaVocab),
        },
      };
      saveWeeklyActivityMap(nextMap);
      return nextMap;
    });
  }, []);

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

  const toastTimerRef = useRef<number | null>(null);
  const hydratedUserRef = useRef<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);

  // Hydrate progress when an authenticated user logs in and skip welcome modal
  useEffect(() => {
    if (!user) {
      hydratedUserRef.current = null;
      return;
    }
    setWelcomeOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.welcomeSeen, '1');
    } catch {
      // ignore
    }
    if (hydratedUserRef.current === user.id) return;
    hydratedUserRef.current = user.id;

    if (user.progressSnapshot) {
      if (user.progressSnapshot.voiceGender) {
        setPreferredVoiceGender(user.progressSnapshot.voiceGender);
      }
      setProgress((prev) => {
        const merged: StudentProgress = {
          ...getDefaultProgress(user.fullName),
          ...prev,
          ...user.progressSnapshot,
          studentName: user.progressSnapshot?.studentName || user.fullName || prev.studentName,
        };
        merged.unlockedBadgeIds = Array.from(
          new Set([...(merged.unlockedBadgeIds || []), ...computeBadges(merged)])
        );
        return merged;
      });
    } else {
      setProgress((prev) => ({
        ...prev,
        studentName: user.fullName || prev.studentName,
      }));
    }
  }, [user]);

  // Debounced cloud/account progress sync whenever signed-in progress updates
  useEffect(() => {
    if (!user) return;
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => {
      void syncProgressToAccount(progress);
    }, 900);
    return () => {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    };
  }, [progress, user, syncProgressToAccount]);

  const triggerSound = useCallback(
    (type: SoundEffectType, force = false) => {
      if (!force && !soundEnabled) return false;
      return playSound(type, force);
    },
    [soundEnabled]
  );

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    setSoundEnabledPref(enabled);
    if (enabled) {
      playSound('success', true);
    }
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const pushNotification = useCallback(
    (
      item: Omit<AcademyNotification, 'id' | 'timestampIso' | 'read'>,
      alsoBrowserNotify = false
    ) => {
      const entry: AcademyNotification = {
        ...item,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestampIso: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => {
        const next = [entry, ...prev].slice(0, 30);
        saveStoredNotifications(next);
        return next;
      });
      setActiveToast(entry);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setActiveToast(null), 5000);

      if (soundEnabled) {
        playSound(item.category === 'achievement' ? 'badge' : 'notification');
      }
      if (alsoBrowserNotify) {
        void dispatchBrowserNotification(entry.titleBn, entry.bodyBn);
      }
    },
    [soundEnabled]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveStoredNotifications(next);
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    saveStoredNotifications([]);
  }, []);

  const updateReminderSettings = useCallback((updates: Partial<ReminderSettings>) => {
    setReminderSettings((prev) => {
      const next = { ...prev, ...updates };
      saveReminderSettings(next);
      return next;
    });
  }, []);

  const enableBrowserNotifications = useCallback(async () => {
    const result = await requestBrowserNotificationPermission();
    setBrowserNotifPermission(result);
    if (result === 'granted') {
      pushNotification(
        {
          titleBn: 'নোটিফিকেশন সফলভাবে চালু হয়েছে!',
          titleEn: 'Notifications Enabled!',
          bodyBn: 'প্রতিদিন আরবি অনুশীলনের স্মারক ও সাফল্যের বার্তা আপনি সময়মতো পাবেন।',
          bodyEn: 'You will now receive daily Arabic practice reminders and achievement alerts.',
          category: 'system',
        },
        true
      );
    }
    return result;
  }, [pushNotification]);

  const sendTestNotification = useCallback(async () => {
    const perm = getBrowserNotificationStatus();
    setBrowserNotifPermission(perm);
    if (perm === 'default') {
      const asked = await requestBrowserNotificationPermission();
      setBrowserNotifPermission(asked);
    }
    pushNotification(
      {
        titleBn: 'আসসালামু আলাইকুম! আজকের আরবি পাঠ প্রস্তুত',
        titleEn: 'Assalamu Alaikum! Today’s Arabic lesson is ready',
        bodyBn: 'সফওয়াতুল মাসাদির, মাবাদিউল আরাবিয়াহ ও AI শিক্ষকের সাথে ১০ মিনিট চর্চা করুন।',
        bodyEn: 'Practice 10 minutes with Safwatul Masadir, Mabadiul Arabiyyah, and AI Teacher.',
        category: 'reminder',
      },
      true
    );
  }, [pushNotification]);

  const openWelcome = useCallback(() => {
    setWelcomeOpen(true);
    triggerSound('welcome');
  }, [triggerSound]);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.welcomeSeen, '1');
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      localStorage.setItem(STORAGE_KEYS.theme, next);
      const nextScheme: ColorSchemeMode = isLightThemeMode(next) ? 'light' : 'dark';
      setColorSchemeState(nextScheme);
      localStorage.setItem(STORAGE_KEYS.colorScheme, nextScheme);
      if (isLightThemeMode(next)) {
        setPreferredLightTheme(next);
        localStorage.setItem(STORAGE_KEYS.preferredLightTheme, next);
      } else {
        setPreferredDarkTheme(next);
        localStorage.setItem(STORAGE_KEYS.preferredDarkTheme, next);
      }
      triggerSound('theme');
    },
    [triggerSound]
  );

  const setColorScheme = useCallback(
    (mode: ColorSchemeMode) => {
      setColorSchemeState(mode);
      localStorage.setItem(STORAGE_KEYS.colorScheme, mode);
      const targetDark = mode === 'dark' ? true : mode === 'light' ? false : osPrefersDark;
      const targetTheme = targetDark ? preferredDarkTheme : preferredLightTheme;
      setThemeState(targetTheme);
      localStorage.setItem(STORAGE_KEYS.theme, targetTheme);
      triggerSound('theme');
    },
    [osPrefersDark, preferredDarkTheme, preferredLightTheme, triggerSound]
  );

  const setBackdropIntensity = useCallback(
    (next: BackdropIntensity) => {
      setBackdropIntensityState(next);
      localStorage.setItem(STORAGE_KEYS.backdrop, next);
      triggerSound('bubble');
    },
    [triggerSound]
  );

  const setLang = useCallback(
    (next: InterfaceLang) => {
      setLangState(next);
      localStorage.setItem(STORAGE_KEYS.lang, next);
      triggerSound('click');
    },
    [triggerSound]
  );

  // Apply resolved theme, light/dark class, and PWA theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);
    if (!resolvedDarkMode) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', THEME_BAR_COLORS[effectiveTheme]);
    }
  }, [effectiveTheme, resolvedDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  // Persist local progress and admin content
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

  // Daily study reminder checker
  useEffect(() => {
    const checkReminder = () => {
      if (!reminderSettings.enabled) return;
      const today = todayDateKey();
      if (reminderSettings.lastReminderDate === today) return;
      const now = new Date();
      const [targetH, targetM] = reminderSettings.timeHHMM.split(':').map(Number);
      if (
        Number.isFinite(targetH) &&
        Number.isFinite(targetM) &&
        (now.getHours() > targetH || (now.getHours() === targetH && now.getMinutes() >= targetM))
      ) {
        updateReminderSettings({ lastReminderDate: today });
        pushNotification(
          {
            titleBn: 'দৈনিক আরবি অনুশীলনের সময় হয়েছে!',
            titleEn: 'Time for Your Daily Arabic Study!',
            bodyBn: `আপনার দৈনিক ${progress.dailyTargetMinutes} মিনিটের আরবি পাঠ এখন শুরু করুন।`,
            bodyEn: `Start your daily ${progress.dailyTargetMinutes}-minute Arabic session now.`,
            category: 'reminder',
          },
          true
        );
      }
    };
    checkReminder();
    const id = window.setInterval(checkReminder, 60000);
    return () => window.clearInterval(id);
  }, [progress.dailyTargetMinutes, pushNotification, reminderSettings, updateReminderSettings]);

  // Active study timer
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setProgress((prev) => ({
          ...prev,
          totalMinutesLearned: prev.totalMinutesLearned + 1,
        }));
        setTodayMinutesLearned((prev) => {
          const next = prev + 1;
          saveTodayMinutes(next);
          return next;
        });
        recordWeeklyDelta(1, 0);
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, [recordWeeklyDelta]);

  const logStudyMinutes = useCallback(
    (minutes: number) => {
      const safeMins = Math.max(1, Math.min(120, Math.round(minutes)));
      setTodayMinutesLearned((prev) => {
        const next = prev + safeMins;
        saveTodayMinutes(next);
        if (prev < progress.dailyTargetMinutes && next >= progress.dailyTargetMinutes) {
          pushNotification(
            {
              titleBn: 'আজকের দৈনিক অধ্যয়ন লক্ষ্য সম্পন্ন হয়েছে!',
              titleEn: 'Daily Study Target Completed!',
              bodyBn: `মাশাআল্লাহ! আপনি আজ ${next} মিনিট অধ্যয়ন পূর্ণ করেছেন।`,
              bodyEn: `MashaAllah! You completed ${next} minutes of study today.`,
              category: 'achievement',
            },
            false
          );
        }
        return next;
      });
      recordWeeklyDelta(safeMins, 0);
      setProgress((prev) => ({
        ...prev,
        xp: prev.xp + safeMins * 2,
        totalMinutesLearned: prev.totalMinutesLearned + safeMins,
        lastActiveDate: todayDateKey(),
      }));
      triggerSound('success');
    },
    [progress.dailyTargetMinutes, pushNotification, recordWeeklyDelta, triggerSound]
  );

  // Daily streak check (+ badge evaluation)
  useEffect(() => {
    const today = todayDateKey();
    setProgress((prev) => {
      if (prev.lastActiveDate === today) return prev;
      const last = new Date(prev.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      const nextStreak = diffDays === 1 ? prev.streakDays + 1 : diffDays > 1 ? 1 : prev.streakDays;
      const updated: StudentProgress = {
        ...prev,
        streakDays: nextStreak,
        lastActiveDate: today,
      };
      return {
        ...updated,
        unlockedBadgeIds: Array.from(new Set([...prev.unlockedBadgeIds, ...computeBadges(updated)])),
      };
    });
  }, []);

  const updateWithBadges = useCallback(
    (updater: (prev: StudentProgress) => StudentProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        const nextBadges = computeBadges(next);
        const newlyUnlocked = nextBadges.filter((id) => !prev.unlockedBadgeIds.includes(id));
        if (newlyUnlocked.length > 0) {
          const def = BADGE_DEFINITIONS.find((b) => b.id === newlyUnlocked[0]);
          if (def) {
            window.setTimeout(() => {
              pushNotification(
                {
                  titleBn: `নতুন ব্যাজ অর্জিত: ${def.titleBn}!`,
                  titleEn: `New Badge Unlocked: ${def.titleEn}!`,
                  bodyBn: def.criteriaBn,
                  bodyEn: def.criteriaEn,
                  category: 'achievement',
                },
                true
              );
            }, 50);
          }
        }
        return {
          ...next,
          unlockedBadgeIds: nextBadges,
        };
      });
    },
    [pushNotification]
  );

  const awardXp = useCallback(
    (amount: number, activity: Omit<ActivityLogEntry, 'id' | 'timestampIso' | 'xpEarned'>) => {
      triggerSound('success');
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
    [triggerSound, updateWithBadges]
  );

  const completeLesson = useCallback(
    (lessonId: string, lessonTitleBn: string, lessonTitleEn: string) => {
      triggerSound('success');
      const alreadyDone = progress.completedLessonIds.includes(lessonId);
      recordWeeklyDelta(0, alreadyDone ? 1 : 5);
      updateWithBadges((prev) => {
        const done = prev.completedLessonIds.includes(lessonId);
        const xpGain = done ? 10 : 50;
        return {
          ...prev,
          xp: prev.xp + xpGain,
          lastActiveDate: todayDateKey(),
          completedLessonIds: done ? prev.completedLessonIds : [...prev.completedLessonIds, lessonId],
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              timestampIso: new Date().toISOString(),
              titleBn: `${done ? 'পুনরালোচনা সম্পন্ন' : 'পাঠ সম্পন্ন'}: ${lessonTitleBn}`,
              titleEn: `${done ? 'Reviewed' : 'Completed'}: ${lessonTitleEn}`,
              xpEarned: xpGain,
              type: 'lesson' as const,
            },
            ...prev.recentActivities,
          ].slice(0, 20),
        };
      });
    },
    [progress.completedLessonIds, recordWeeklyDelta, triggerSound, updateWithBadges]
  );

  const completeGrammarTopic = useCallback(
    (topicId: string, titleBn: string, titleEn: string) => {
      triggerSound('success');
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
    [triggerSound, updateWithBadges]
  );

  const reviewVocabWord = useCallback(
    (wordId: string, quality: Sm2Quality) => {
      triggerSound(quality === 'again' ? 'click' : 'success');
      recordWeeklyDelta(0, 1);
      updateWithBadges((prev) => {
        const existing = prev.vocabProgress[wordId] || {
          wordId,
          ease: 2.5,
          intervalDays: 0,
          nextReviewIso: new Date().toISOString(),
          repetitions: 0,
          favorite: false,
        };
        const sm2 = computeSm2Next(existing, quality);

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + sm2.intervalDays);

        const xpMap: Record<Sm2Quality, number> = {
          again: 3,
          hard: 7,
          good: 10,
          easy: 15,
        };

        return {
          ...prev,
          xp: prev.xp + xpMap[quality],
          vocabProgress: {
            ...prev.vocabProgress,
            [wordId]: {
              ...existing,
              ease: sm2.ease,
              intervalDays: sm2.intervalDays,
              repetitions: sm2.repetitions,
              nextReviewIso: nextDate.toISOString(),
            },
          },
        };
      });
    },
    [recordWeeklyDelta, triggerSound, updateWithBadges]
  );

  const toggleFavoriteVocab = useCallback(
    (wordId: string) => {
      triggerSound('bubble');
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
    [triggerSound, updateWithBadges]
  );

  const recordExamResult = useCallback(
    (entry: Omit<ExamHistoryEntry, 'id' | 'dateIso'>) => {
      triggerSound(entry.percentage >= 60 ? 'badge' : 'click');
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
    [triggerSound, updateWithBadges]
  );

  const completeDailyChallenge = useCallback(
    (score: number, total: number) => {
      triggerSound('badge');
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
    [triggerSound, updateWithBadges]
  );

  const updateProfile = useCallback(
    (
      updates: Partial<Pick<StudentProgress, 'studentName' | 'preferredTrack' | 'voiceGender' | 'dailyTargetMinutes'>>
    ) => {
      if (updates.voiceGender) {
        setPreferredVoiceGender(updates.voiceGender);
      }
      setProgress((prev) => ({ ...prev, ...updates }));
      triggerSound('success');
    },
    [triggerSound]
  );

  const resetProgress = useCallback(() => {
    const fresh = getDefaultProgress(user?.fullName || 'নতুন শিক্ষার্থী');
    setProgress(fresh);
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(fresh));
    setTodayMinutesLearned(0);
    saveTodayMinutes(0);
    const freshWeekly: WeeklyActivityStore = { [todayDateKey()]: { minutesStudied: 0, vocabLearned: 0 } };
    setWeeklyActivityMap(freshWeekly);
    saveWeeklyActivityMap(freshWeekly);
  }, [user?.fullName]);

  const addCustomChapter = useCallback((chapter: ChapterInfo) => {
    setAdminContent((prev) => ({
      ...prev,
      customChapters: [...prev.customChapters.filter((c) => c.chapterNumber !== chapter.chapterNumber), chapter],
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
    const merged: VocabItem[] = [];
    const seen = new Set<string>();
    const combined = [
      ...(progress.personalVocab || []),
      ...adminContent.customVocab,
      ...CURRICULUM_VOCAB_DECK,
    ];
    for (const item of combined) {
      const key = normalizeArabicTokenKey(item.arabic);
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      merged.push(item);
    }
    return merged;
  }, [progress.personalVocab, adminContent.customVocab]);

  const allVocabRef = useRef<VocabItem[]>(allVocabulary);
  allVocabRef.current = allVocabulary;

  const syncMissingVocabFromSegments = useCallback((segments: ReadingSegmentInput[]) => {
    if (!segments || segments.length === 0) return;
    scheduleBackgroundVocabWork(() => {
      setProgress((prev) => {
        const existingPool = [
          ...(prev.personalVocab || []),
          ...allVocabRef.current,
        ];
        const missing = extractMissingWordsFromSegments(
          segments,
          existingPool,
          prev.vocabProgress,
          30
        );
        if (missing.length === 0) return prev;
        const currentPersonal = prev.personalVocab || [];
        return {
          ...prev,
          personalVocab: [...missing, ...currentPersonal].slice(0, 600),
        };
      });
    });
  }, []);

  const saveCustomLesson = useCallback(
    (lesson: DetailedLesson) => {
      setAdminContent((prev) => ({
        ...prev,
        customLessons: { ...prev.customLessons, [lesson.id]: lesson },
      }));
      syncMissingVocabFromSegments(buildSegmentsFromDetailedLesson(lesson));
    },
    [syncMissingVocabFromSegments]
  );

  // Background idle pass: scan any newly added admin custom lessons automatically
  useEffect(() => {
    const customList = Object.values(adminContent.customLessons);
    if (customList.length === 0) return;
    const cancel = scheduleBackgroundVocabWork(() => {
      const segments = customList.flatMap((ls) => buildSegmentsFromDetailedLesson(ls));
      if (segments.length > 0) {
        syncMissingVocabFromSegments(segments);
      }
    });
    return cancel;
  }, [adminContent.customLessons, syncMissingVocabFromSegments]);

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

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const weeklyActivity = useMemo<WeeklyDayActivity[]>(() => {
    const today = todayDateKey();
    return Array.from({ length: 7 }, (_, i) => {
      const daysBack = 6 - i;
      const date = dateKeyDaysAgo(daysBack);
      const entry = weeklyActivityMap[date];
      const minutes =
        date === today
          ? Math.max(entry?.minutesStudied ?? 0, todayMinutesLearned)
          : entry?.minutesStudied ?? 0;
      const vocab = entry?.vocabLearned ?? 0;
      return {
        date,
        minutesStudied: minutes,
        vocabLearned: vocab,
      };
    });
  }, [todayMinutesLearned, weeklyActivityMap]);

  const value: AppContextValue = {
    theme: effectiveTheme,
    setTheme,
    colorScheme,
    setColorScheme,
    resolvedDarkMode,
    osPrefersDark,
    backdropIntensity,
    setBackdropIntensity,
    lang,
    setLang,
    t: I18N[lang],
    soundEnabled,
    setSoundEnabled,
    triggerSound,
    notifications,
    unreadNotificationCount,
    activeToast,
    dismissToast,
    pushNotification,
    markAllNotificationsRead,
    clearNotifications,
    reminderSettings,
    updateReminderSettings,
    browserNotifPermission,
    enableBrowserNotifications,
    sendTestNotification,
    welcomeOpen,
    openWelcome,
    dismissWelcome,
    progress,
    todayMinutesLearned,
    weeklyActivity,
    logStudyMinutes,
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
    syncMissingVocabFromSegments,
    globalGrammarEnabled,
    setGlobalGrammarEnabled,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
