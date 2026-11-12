import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityLogEntry,
  AdminCustomContent,
  BackdropIntensity,
  ChapterInfo,
  DetailedLesson,
  ExamHistoryEntry,
  ExamQuestion,
  InterfaceLang,
  StudentProgress,
  ThemeMode,
  VocabItem,
} from '../types/academy';
import { I18N, Translations } from '../data/i18n';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import { DETAILED_LESSONS } from '../data/detailedLessons';
import { EXAM_QUESTION_BANK, VOCABULARY_BANK } from '../data/practiceAndVocabData';
import { isSoundEnabled, playSound, setSoundEnabledPref, SoundEffectType } from '../utils/soundEffects';
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
  backdrop: 'aaa_backdrop_intensity_v1',
  lang: 'aaa_lang_v1',
  progress: 'aaa_progress_v1',
  admin: 'aaa_admin_content_v1',
  welcomeSeen: 'aaa_welcome_session_v1',
};

const VALID_THEMES: ThemeMode[] = [
  'sky-cloud',
  'emerald',
  'midnight',
  'light',
  'madinah',
  'kaaba',
  'parchment',
  'andalus',
];

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

export function getDefaultProgress(name = 'নতুন শিক্ষার্থী'): StudentProgress {
  return {
    studentName: name,
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
  const { user, syncProgressToAccount } = useAuth();

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'sky-cloud';
    const saved = localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    return saved && VALID_THEMES.includes(saved) ? saved : 'sky-cloud';
  });

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

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => isSoundEnabled());
  const [notifications, setNotifications] = useState<AcademyNotification[]>(() => getStoredNotifications());
  const [activeToast, setActiveToast] = useState<AcademyNotification | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => getReminderSettings());
  const [browserNotifPermission, setBrowserNotifPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getBrowserNotificationStatus()
  );

  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem(STORAGE_KEYS.welcomeSeen);
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

  const toastTimerRef = useRef<number | null>(null);
  const hydratedUserRef = useRef<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);

  // Hydrate progress when an authenticated user logs in
  useEffect(() => {
    if (!user) {
      hydratedUserRef.current = null;
      return;
    }
    if (hydratedUserRef.current === user.id) return;
    hydratedUserRef.current = user.id;

    if (user.progressSnapshot) {
      setProgress((prev) => ({
        ...getDefaultProgress(user.fullName),
        ...prev,
        ...user.progressSnapshot,
        studentName: user.progressSnapshot?.studentName || user.fullName || prev.studentName,
      }));
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
    sessionStorage.setItem(STORAGE_KEYS.welcomeSeen, '1');
  }, []);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      localStorage.setItem(STORAGE_KEYS.theme, next);
      triggerSound('theme');
    },
    [triggerSound]
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

  // Apply theme, light/dark class, and PWA theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light' || theme === 'parchment' || theme === 'sky-cloud') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', THEME_BAR_COLORS[theme]);
    }
  }, [theme]);

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
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  // Daily streak check
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
    [triggerSound, updateWithBadges]
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
    (wordId: string, quality: 'again' | 'good' | 'easy') => {
      triggerSound(quality === 'again' ? 'click' : 'success');
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
    [triggerSound, updateWithBadges]
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
    (updates: Partial<Pick<StudentProgress, 'studentName' | 'preferredTrack' | 'dailyTargetMinutes'>>) => {
      setProgress((prev) => ({ ...prev, ...updates }));
      triggerSound('success');
    },
    [triggerSound]
  );

  const resetProgress = useCallback(() => {
    const fresh = getDefaultProgress(user?.fullName || 'নতুন শিক্ষার্থী');
    setProgress(fresh);
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(fresh));
  }, [user?.fullName]);

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

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value: AppContextValue = {
    theme,
    setTheme,
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
