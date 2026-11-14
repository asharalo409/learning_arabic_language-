import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ADMIN_EMAIL, isAdminEmail, isSupabaseConfigured, supabase } from '../lib/supabase';
import { LearningTrack, StudentProgress } from '../types/academy';
import { playSound } from '../utils/soundEffects';

export interface AuthUserProfile {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  source: 'supabase' | 'local';
  progressSnapshot?: Partial<StudentProgress> | null;
}

export interface LeaderboardStudent {
  id: string;
  fullName: string;
  email?: string;
  role: 'student' | 'admin';
  preferredTrack: LearningTrack;
  xp: number;
  streakDays: number;
  lessonsCompletedCount: number;
  totalMinutesLearned: number;
  updatedAt?: string;
  isCurrentUser?: boolean;
}

interface LocalAccountRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'student' | 'admin';
  progress: StudentProgress;
  updatedAt: string;
}

const LOCAL_ACCOUNTS_KEY = 'aaa_local_accounts_v1';
const LOCAL_SESSION_KEY = 'aaa_local_session_email_v1';

const SEEDED_COMMUNITY_PEERS: LeaderboardStudent[] = [
  {
    id: 'peer-1',
    fullName: 'মুহাম্মাদ রাশেদ',
    role: 'student',
    preferredTrack: 'Quranic',
    xp: 1450,
    streakDays: 14,
    lessonsCompletedCount: 18,
    totalMinutesLearned: 320,
  },
  {
    id: 'peer-2',
    fullName: 'সাদিয়া আফরিন',
    role: 'student',
    preferredTrack: 'Combined',
    xp: 980,
    streakDays: 9,
    lessonsCompletedCount: 12,
    totalMinutesLearned: 215,
  },
  {
    id: 'peer-3',
    fullName: 'আব্দুর রহমান',
    role: 'student',
    preferredTrack: 'MSA',
    xp: 640,
    streakDays: 6,
    lessonsCompletedCount: 8,
    totalMinutesLearned: 140,
  },
  {
    id: 'peer-4',
    fullName: 'মরিয়ম সিদ্দিকা',
    role: 'student',
    preferredTrack: 'Quranic',
    xp: 340,
    streakDays: 4,
    lessonsCompletedCount: 5,
    totalMinutesLearned: 85,
  },
];

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `lh_${Math.abs(hash)}`;
}

function readLocalAccounts(): Record<string, LocalAccountRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalAccountRecord>) : {};
  } catch {
    return {};
  }
}

function writeLocalAccounts(map: Record<string, LocalAccountRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

interface AuthResult {
  ok: boolean;
  errorBn?: string;
  needsEmailVerify?: boolean;
}

interface AuthContextValue {
  user: AuthUserProfile | null;
  authLoading: boolean;
  supabaseConnected: boolean;
  leaderboard: LeaderboardStudent[];
  leaderboardLoading: boolean;
  signUp: (email: string, password: string, fullName: string, currentProgress: StudentProgress) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  syncProgressToAccount: (progress: StudentProgress) => Promise<void>;
  refreshLeaderboard: (guestProgress?: StudentProgress) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabaseConnected = isSupabaseConfigured();
  const [user, setUser] = useState<AuthUserProfile | null>(() => {
    if (typeof window === 'undefined' || supabaseConnected) return null;
    try {
      const savedEmail = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!savedEmail) return null;
      const accounts = readLocalAccounts();
      const found = accounts[savedEmail.toLowerCase()];
      if (!found) return null;
      return {
        id: found.id,
        email: found.email,
        fullName: found.fullName,
        isAdmin: isAdminEmail(found.email) || found.role === 'admin',
        source: 'local',
        progressSnapshot: found.progress,
      };
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState<boolean>(supabaseConnected);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>(SEEDED_COMMUNITY_PEERS);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);

  const loadSupabaseProfile = useCallback(async (uid: string, email: string, fallbackName: string): Promise<AuthUserProfile> => {
    if (!supabase) {
      return {
        id: uid,
        email,
        fullName: fallbackName,
        isAdmin: isAdminEmail(email),
        source: 'supabase',
      };
    }
    const { data } = await supabase
      .from('student_profiles')
      .select('id, email, full_name, role, preferred_track, daily_target_minutes, xp, streak_days, total_minutes_learned, progress_snapshot')
      .eq('id', uid)
      .maybeSingle();

    const fullName = data?.full_name || fallbackName || email.split('@')[0];
    const snapshot = (data?.progress_snapshot as Partial<StudentProgress> | null) || null;
    const mergedSnapshot: Partial<StudentProgress> | null = data
      ? {
          ...(snapshot || {}),
          studentName: fullName,
          preferredTrack: (data.preferred_track as LearningTrack) || snapshot?.preferredTrack || 'Combined',
          dailyTargetMinutes: data.daily_target_minutes ?? snapshot?.dailyTargetMinutes ?? 20,
          xp: data.xp ?? snapshot?.xp ?? 120,
          streakDays: data.streak_days ?? snapshot?.streakDays ?? 1,
          totalMinutesLearned: data.total_minutes_learned ?? snapshot?.totalMinutesLearned ?? 15,
        }
      : snapshot;

    return {
      id: uid,
      email,
      fullName,
      isAdmin: isAdminEmail(email) || data?.role === 'admin',
      source: 'supabase',
      progressSnapshot: mergedSnapshot,
    };
  }, []);

  const refreshLeaderboard = useCallback(
    async (guestProgress?: StudentProgress) => {
      setLeaderboardLoading(true);
      try {
        if (supabaseConnected && supabase) {
          const { data, error } = await supabase
            .from('student_profiles')
            .select('id, email, full_name, role, preferred_track, xp, streak_days, lessons_completed_count, total_minutes_learned, updated_at')
            .order('xp', { ascending: false })
            .limit(50);

          if (!error && data && data.length > 0) {
            const rows: LeaderboardStudent[] = data.map((row) => ({
              id: row.id,
              fullName: row.full_name || 'শিক্ষার্থী',
              email: row.email,
              role: row.role === 'admin' ? 'admin' : 'student',
              preferredTrack: (row.preferred_track as LearningTrack) || 'Combined',
              xp: Number(row.xp) || 0,
              streakDays: Number(row.streak_days) || 1,
              lessonsCompletedCount: Number(row.lessons_completed_count) || 0,
              totalMinutesLearned: Number(row.total_minutes_learned) || 0,
              updatedAt: row.updated_at,
              isCurrentUser: user?.id === row.id,
            }));
            setLeaderboard(rows);
            return;
          }
        }

        // Fallback: combine local accounts + seeded peers
        const accounts = readLocalAccounts();
        const localStudents: LeaderboardStudent[] = Object.values(accounts).map((acc) => ({
          id: acc.id,
          fullName: acc.fullName,
          email: acc.email,
          role: acc.role,
          preferredTrack: acc.progress.preferredTrack,
          xp: acc.progress.xp,
          streakDays: acc.progress.streakDays,
          lessonsCompletedCount: acc.progress.completedLessonIds.length,
          totalMinutesLearned: acc.progress.totalMinutesLearned,
          updatedAt: acc.updatedAt,
          isCurrentUser: user?.email?.toLowerCase() === acc.email.toLowerCase(),
        }));

        const merged = [...localStudents, ...SEEDED_COMMUNITY_PEERS];
        if (!user && guestProgress) {
          merged.push({
            id: 'guest-current',
            fullName: guestProgress.studentName,
            role: 'student',
            preferredTrack: guestProgress.preferredTrack,
            xp: guestProgress.xp,
            streakDays: guestProgress.streakDays,
            lessonsCompletedCount: guestProgress.completedLessonIds.length,
            totalMinutesLearned: guestProgress.totalMinutesLearned,
            isCurrentUser: true,
          });
        }
        merged.sort((a, b) => b.xp - a.xp);
        setLeaderboard(merged);
      } finally {
        setLeaderboardLoading(false);
      }
    },
    [supabaseConnected, user]
  );

  // Initialize Auth Session
  useEffect(() => {
    let active = true;

    async function init() {
      if (supabaseConnected && supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (active && session?.user?.email) {
          const profile = await loadSupabaseProfile(
            session.user.id,
            session.user.email,
            (session.user.user_metadata?.full_name as string) || session.user.email.split('@')[0]
          );
          if (active) setUser(profile);
        }
        if (active) setAuthLoading(false);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
          if (!active) return;
          if (nextSession?.user?.email) {
            const profile = await loadSupabaseProfile(
              nextSession.user.id,
              nextSession.user.email,
              (nextSession.user.user_metadata?.full_name as string) || nextSession.user.email.split('@')[0]
            );
            if (active) setUser(profile);
          } else if (active) {
            setUser(null);
          }
        });

        return () => {
          active = false;
          subscription.unsubscribe();
        };
      }

      // Local preview fallback session
      const savedEmail = localStorage.getItem(LOCAL_SESSION_KEY);
      if (savedEmail) {
        const accounts = readLocalAccounts();
        const found = accounts[savedEmail.toLowerCase()];
        if (found && active) {
          setUser({
            id: found.id,
            email: found.email,
            fullName: found.fullName,
            isAdmin: isAdminEmail(found.email) || found.role === 'admin',
            source: 'local',
            progressSnapshot: found.progress,
          });
        }
      }
      if (active) setAuthLoading(false);
    }

    void init();
    return () => {
      active = false;
    };
  }, [loadSupabaseProfile, supabaseConnected]);

  useEffect(() => {
    void refreshLeaderboard();
  }, [refreshLeaderboard]);

  const signUp = useCallback(
    async (
      rawEmail: string,
      password: string,
      rawName: string,
      currentProgress: StudentProgress
    ): Promise<AuthResult> => {
      const email = rawEmail.trim().toLowerCase();
      const fullName = rawName.trim() || email.split('@')[0];

      if (!email.includes('@')) {
        return { ok: false, errorBn: 'সঠিক Gmail বা ইমেইল ঠিকানা লিখুন।' };
      }
      if (password.length < 6) {
        return { ok: false, errorBn: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
      }

      if (supabaseConnected && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) {
          return { ok: false, errorBn: error.message };
        }
        if (data.user) {
          const initialSnapshot: StudentProgress = {
            ...currentProgress,
            studentName: fullName,
          };
          // Ensure row exists with current progress if session is active
          if (data.session) {
            await supabase.from('student_profiles').upsert({
              id: data.user.id,
              email,
              full_name: fullName,
              role: isAdminEmail(email) ? 'admin' : 'student',
              preferred_track: initialSnapshot.preferredTrack,
              daily_target_minutes: initialSnapshot.dailyTargetMinutes,
              xp: initialSnapshot.xp,
              streak_days: initialSnapshot.streakDays,
              total_minutes_learned: initialSnapshot.totalMinutesLearned,
              lessons_completed_count: initialSnapshot.completedLessonIds.length,
              progress_snapshot: initialSnapshot,
            });
            const profile = await loadSupabaseProfile(data.user.id, email, fullName);
            setUser(profile);
            playSound('auth', true);
            void refreshLeaderboard();
            return { ok: true };
          }
          playSound('auth', true);
          return { ok: true, needsEmailVerify: true };
        }
      }

      // Local Multi-Account Fallback
      const accounts = readLocalAccounts();
      if (accounts[email]) {
        return { ok: false, errorBn: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে। লগইন করুন।' };
      }
      const nextProgress: StudentProgress = {
        ...currentProgress,
        studentName: fullName,
      };
      const record: LocalAccountRecord = {
        id: `local-${Date.now()}`,
        email,
        passwordHash: simpleHash(password),
        fullName,
        role: isAdminEmail(email) ? 'admin' : 'student',
        progress: nextProgress,
        updatedAt: new Date().toISOString(),
      };
      accounts[email] = record;
      writeLocalAccounts(accounts);
      localStorage.setItem(LOCAL_SESSION_KEY, email);
      setUser({
        id: record.id,
        email: record.email,
        fullName: record.fullName,
        isAdmin: record.role === 'admin',
        source: 'local',
        progressSnapshot: record.progress,
      });
      playSound('auth', true);
      void refreshLeaderboard();
      return { ok: true };
    },
    [loadSupabaseProfile, refreshLeaderboard, supabaseConnected]
  );

  const signIn = useCallback(
    async (rawEmail: string, password: string): Promise<AuthResult> => {
      const email = rawEmail.trim().toLowerCase();
      if (!email.includes('@') || !password) {
        return { ok: false, errorBn: 'ইমেইল ও পাসওয়ার্ড উভয়ই লিখুন।' };
      }

      if (supabaseConnected && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { ok: false, errorBn: 'ইমেইল বা পাসওয়ার্ড সঠিক নয় অথবা ইমেইল ভেরিফাই করা হয়নি।' };
        }
        if (data.user) {
          const profile = await loadSupabaseProfile(
            data.user.id,
            email,
            (data.user.user_metadata?.full_name as string) || email.split('@')[0]
          );
          setUser(profile);
          playSound('auth', true);
          void refreshLeaderboard();
          return { ok: true };
        }
      }

      // Local Multi-Account Fallback
      const accounts = readLocalAccounts();
      const found = accounts[email];
      if (!found || found.passwordHash !== simpleHash(password)) {
        return { ok: false, errorBn: 'অ্যাকাউন্ট পাওয়া যায়নি বা পাসওয়ার্ড ভুল হয়েছে।' };
      }
      localStorage.setItem(LOCAL_SESSION_KEY, email);
      setUser({
        id: found.id,
        email: found.email,
        fullName: found.fullName,
        isAdmin: isAdminEmail(found.email) || found.role === 'admin',
        source: 'local',
        progressSnapshot: found.progress,
      });
      playSound('auth', true);
      void refreshLeaderboard();
      return { ok: true };
    },
    [loadSupabaseProfile, refreshLeaderboard, supabaseConnected]
  );

  const signOut = useCallback(async () => {
    if (supabaseConnected && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    playSound('click', true);
    void refreshLeaderboard();
  }, [refreshLeaderboard, supabaseConnected]);

  const syncProgressToAccount = useCallback(
    async (progress: StudentProgress) => {
      if (!user) return;
      if (user.source === 'supabase' && supabase) {
        await supabase
          .from('student_profiles')
          .update({
            full_name: progress.studentName,
            preferred_track: progress.preferredTrack,
            daily_target_minutes: progress.dailyTargetMinutes,
            xp: progress.xp,
            streak_days: progress.streakDays,
            total_minutes_learned: progress.totalMinutesLearned,
            lessons_completed_count: progress.completedLessonIds.length,
            progress_snapshot: progress,
          })
          .eq('id', user.id);
        return;
      }

      if (user.source === 'local') {
        const accounts = readLocalAccounts();
        const key = user.email.toLowerCase();
        if (accounts[key]) {
          accounts[key] = {
            ...accounts[key],
            fullName: progress.studentName,
            progress,
            updatedAt: new Date().toISOString(),
          };
          writeLocalAccounts(accounts);
        }
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        supabaseConnected,
        leaderboard,
        leaderboardLoading,
        signUp,
        signIn,
        signOut,
        syncProgressToAccount,
        refreshLeaderboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { ADMIN_EMAIL };
