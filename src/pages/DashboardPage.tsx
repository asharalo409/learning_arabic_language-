import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Cloud, Flame, Layers, LogIn, Target, Trophy } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { BADGE_DEFINITIONS, useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CURRICULUM_LEVELS } from '../data/curriculum';

export const DashboardPage: React.FC = () => {
  const { t, lang, progress, currentLevelNumber, allChapters, updateProfile } = useApp();
  const { user, supabaseConnected } = useAuth();
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(progress.dailyTargetMinutes);

  const avgQuizScore =
    progress.examHistory.length > 0
      ? Math.round(
          progress.examHistory.reduce((acc, item) => acc + item.percentage, 0) / progress.examHistory.length
        )
      : 0;

  const vocabLearnedCount = Object.keys(progress.vocabProgress).length;

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const clamped = Math.max(5, Math.min(180, Number(targetInput) || 20));
    updateProfile({ dailyTargetMinutes: clamped });
    setEditingTarget(false);
  };

  return (
    <AppShell
      title={t.sidebar.dashboard}
      subtitle={
        lang === 'bn'
          ? `স্বাগতম, ${progress.studentName} — আপনার ব্যক্তিগত শেখার উন্নতি ও অগ্রগতি`
          : `Welcome back, ${progress.studentName}`
      }
    >
      <div className="space-y-8">
        {/* Account Sync Banner */}
        <div className="surface-alt rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <Cloud className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <div>
              {user ? (
                <span>
                  সিঙ্ককৃত অ্যাকাউন্ট: <strong>{user.email}</strong>{' '}
                  ({supabaseConnected ? 'Supabase Cloud' : 'Local Account Sync'})
                </span>
              ) : (
                <span>
                  আপনি এখন গেস্ট মোডে আছেন। সব ডিভাইসে উন্নতি ও লিডারবোর্ড সেভ রাখতে Gmail দিয়ে লগইন করুন।
                </span>
              )}
            </div>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-secondary whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{user ? 'অ্যাকাউন্ট পরিচালনা' : 'Gmail লগইন / সাইনআপ'}</span>
          </Link>
        </div>

        {/* Top Continue Learning Hero Strip */}
        <div className="surface-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-[var(--accent)]">
              {lang === 'bn' ? `বর্তমান স্তর: লেভেল ${currentLevelNumber}` : `Current Level: Level ${currentLevelNumber}`}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {lang === 'bn'
                ? 'আপনার আজকের আরবি শিক্ষা চালিয়ে যান'
                : 'Continue Your Arabic Learning Journey'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {lang === 'bn'
                ? `দৈনিক লক্ষ্য: ${progress.dailyTargetMinutes} মিনিট · এ পর্যন্ত মোট সময়: ${progress.totalMinutesLearned} মিনিট`
                : `Daily Target: ${progress.dailyTargetMinutes} mins · Total Active Time: ${progress.totalMinutesLearned} mins`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/courses/beginners"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm btn-primary whitespace-nowrap"
            >
              <span>{lang === 'bn' ? 'শেখা চালিয়ে যান' : 'Continue Learning'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/daily-challenge"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm btn-secondary whitespace-nowrap"
            >
              <Target className="w-4 h-4 text-[var(--accent)]" />
              <span>{t.sidebar.dailyChallenge}</span>
            </Link>
          </div>
        </div>

        {/* Key KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="surface-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{lang === 'bn' ? 'মোট পাঠ সম্পন্ন' : 'Lessons Done'}</span>
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold font-mono-num">{progress.completedLessonIds.length}</div>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{lang === 'bn' ? 'শেখার সময়' : 'Learning Time'}</span>
              <Clock className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold font-mono-num">{progress.totalMinutesLearned}m</div>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{t.common.xp}</span>
              <Trophy className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold font-mono-num">{progress.xp}</div>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{t.common.streak}</span>
              <Flame className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold font-mono-num">{progress.streakDays}d</div>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{lang === 'bn' ? 'গড় কুইজ স্কোর' : 'Avg Quiz'}</span>
              <Target className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold font-mono-num">{avgQuizScore}%</div>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{lang === 'bn' ? 'শেখা শব্দ' : 'Vocab Learned'}</span>
              <Layers className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold font-mono-num">{vocabLearnedCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Course Progress across 6 Levels */}
          <div className="lg:col-span-7 surface-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {lang === 'bn' ? 'স্তরভিত্তিক কোর্স অগ্রগতি' : 'Course Progress by Level'}
              </h3>
              <Link to="/courses" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                {lang === 'bn' ? 'সব অধ্যায়' : 'All Chapters'}
              </Link>
            </div>

            <div className="space-y-4">
              {CURRICULUM_LEVELS.map((lvl) => {
                const levelChapters = allChapters.filter((c) => c.level === lvl.level);
                const totalLevelLessons = levelChapters.length * 10;
                const completedInLevel = progress.completedLessonIds.filter((id) => {
                  const match = /^ch(\d+)-/.exec(id);
                  if (!match) return false;
                  const chNum = Number(match[1]);
                  return chNum >= lvl.chapterStart && chNum <= lvl.chapterEnd;
                }).length;
                const pct = totalLevelLessons > 0 ? Math.round((completedInLevel / totalLevelLessons) * 100) : 0;

                return (
                  <div key={lvl.level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{lang === 'bn' ? lvl.nameBn : lvl.nameEn}</span>
                      <span className="text-xs font-mono-num text-[var(--text-muted)]">
                        {completedInLevel}/{totalLevelLessons} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-300"
                        style={{ width: `${Math.max(pct, completedInLevel > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Target Editor */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <span className="text-[var(--text-muted)]">
                  {lang === 'bn' ? 'দৈনিক শেখার লক্ষ্য: ' : 'Daily Learning Target: '}
                </span>
                <span className="font-semibold font-mono-num">
                  {progress.dailyTargetMinutes} {t.common.minutes}
                </span>
              </div>
              {editingTarget ? (
                <form onSubmit={handleSaveTarget} className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={targetInput}
                    onChange={(e) => setTargetInput(Number(e.target.value))}
                    className="w-20 px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-mono-num"
                  />
                  <button type="submit" className="px-3 py-1 rounded text-xs btn-primary">
                    {lang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTargetInput(progress.dailyTargetMinutes);
                    setEditingTarget(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
                >
                  {lang === 'bn' ? 'লক্ষ্য পরিবর্তন করুন' : 'Edit Target'}
                </button>
              )}
            </div>
          </div>

          {/* Recent Activities & Unlocked Badges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="surface-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold">
                {lang === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}
              </h3>
              <div className="space-y-3">
                {progress.recentActivities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)] last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {lang === 'bn' ? act.titleBn : act.titleEn}
                      </p>
                      <span className="text-xs text-[var(--text-muted)] font-mono-num">
                        {new Date(act.timestampIso).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs font-semibold font-mono-num text-[var(--accent)] shrink-0">
                      +{act.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {lang === 'bn' ? 'অর্জিত ব্যাজসমূহ' : 'Achievement Badges'}
                </h3>
                <Link to="/leaderboard" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                  {lang === 'bn' ? 'লিডারবোর্ড →' : 'Leaderboard →'}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {BADGE_DEFINITIONS.map((badge) => {
                  const unlocked = progress.unlockedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border text-xs ${
                        unlocked
                          ? 'surface-alt border-[var(--border-strong)]'
                          : 'opacity-50 border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="font-semibold">
                        {lang === 'bn' ? badge.titleBn : badge.titleEn}
                      </div>
                      <div className="text-[var(--text-muted)] mt-0.5">
                        {unlocked ? (lang === 'bn' ? 'অর্জিত' : 'Unlocked') : (lang === 'bn' ? 'লক করা' : 'Locked')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
