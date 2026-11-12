import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Crown, Flame, LogIn, RefreshCw, Trophy } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { BADGE_DEFINITIONS, useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const LeaderboardPage: React.FC = () => {
  const { t, lang, progress, currentLevelNumber, triggerSound } = useApp();
  const { user, supabaseConnected, leaderboard, leaderboardLoading, refreshLeaderboard } = useAuth();

  useEffect(() => {
    void refreshLeaderboard(progress);
  }, [progress, refreshLeaderboard]);

  const topThree = leaderboard.slice(0, 3);
  const myIndex = leaderboard.findIndex((r) => r.isCurrentUser);

  const milestones = [
    { labelBn: 'প্রথম ১০০ XP অর্জন', target: 100, current: progress.xp },
    { labelBn: '৫০০ XP (স্তর ৩ আনলক)', target: 500, current: progress.xp },
    { labelBn: '১০টি পাঠ সম্পন্ন', target: 10, current: progress.completedLessonIds.length },
    { labelBn: '১,৫০০ XP (উচ্চতর পর্যায়)', target: 1500, current: progress.xp },
  ];

  return (
    <AppShell
      title={t.sidebar.leaderboard}
      subtitle={
        lang === 'bn'
          ? 'সকল শিক্ষার্থীর পয়েন্ট, র‍্যাঙ্কিং, দৈনিক স্ট্রিক ও অর্জিত সম্মাননা'
          : 'Academy live student standings, points, streaks & badges'
      }
    >
      <div className="space-y-8">
        {/* Top 3 Podium Cards */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((student, idx) => (
              <div
                key={student.id}
                className={`surface-card rounded-3xl p-5 flex flex-col justify-between gap-4 border ${
                  idx === 0
                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/25'
                    : 'border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                    <Crown className="w-4 h-4" />
                    <span>স্থান #{idx + 1}</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full surface-alt text-[var(--text-muted)]">
                    {student.preferredTrack}
                  </span>
                </div>

                <div>
                  <div className="text-lg font-bold truncate">
                    {student.fullName} {student.isCurrentUser ? '(আপনি)' : ''}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {student.lessonsCompletedCount} পাঠ · {student.streakDays} দিন স্ট্রিক
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)]">মোট পয়েন্ট</span>
                  <span className="text-2xl font-bold font-mono-num text-[var(--accent)]">
                    {student.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Live Leaderboard Table */}
        <div className="surface-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--accent)]" />
                <span>
                  {supabaseConnected ? 'লাইভ Supabase লিডারবোর্ড' : 'একাডেমি শিক্ষার্থী লিডারবোর্ড'}
                </span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                আপনার অবস্থান: {myIndex >= 0 ? `#${myIndex + 1}` : '—'} · Level {currentLevelNumber} · {progress.xp} XP
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!user && (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold btn-primary whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>তালিকায় নাম তুলতে লগইন করুন</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  void refreshLeaderboard(progress);
                }}
                disabled={leaderboardLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs btn-secondary"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${leaderboardLoading ? 'animate-spin' : ''}`} />
                <span>রিফ্রেশ</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-2.5 pe-4">ক্রম</th>
                  <th className="py-2.5 pe-4">শিক্ষার্থী</th>
                  <th className="py-2.5 pe-4">ট্র্যাক</th>
                  <th className="py-2.5 pe-4">পাঠ</th>
                  <th className="py-2.5 pe-4">স্ট্রিক</th>
                  <th className="py-2.5 text-right">পয়েন্ট (XP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {leaderboard.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={row.isCurrentUser ? 'bg-[var(--emerald-highlight)] font-semibold' : ''}
                  >
                    <td className="py-3 pe-4 font-mono-num">#{idx + 1}</td>
                    <td className="py-3 pe-4">
                      <span>{row.fullName}</span>
                      {row.role === 'admin' && (
                        <span className="text-[10px] ms-2 px-1.5 py-0.5 rounded bg-[var(--emerald-highlight)] text-[var(--accent)]">
                          Founder
                        </span>
                      )}
                      {row.isCurrentUser && (
                        <span className="text-xs text-[var(--accent)] ms-1.5">(আপনি)</span>
                      )}
                    </td>
                    <td className="py-3 pe-4 text-xs text-[var(--text-muted)]">{row.preferredTrack}</td>
                    <td className="py-3 pe-4 font-mono-num">{row.lessonsCompletedCount}</td>
                    <td className="py-3 pe-4 font-mono-num">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
                        {row.streakDays}d
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono-num text-[var(--accent)] font-bold">
                      {row.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Milestones & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold">শেখার মাইলফলক (Milestones)</h3>
            <div className="space-y-4">
              {milestones.map((m) => {
                const pct = Math.min(100, Math.round((m.current / m.target) * 100));
                return (
                  <div key={m.labelBn} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{m.labelBn}</span>
                      <span className="font-mono-num text-[var(--text-muted)]">
                        {Math.min(m.current, m.target)}/{m.target} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden">
                      <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--accent)]" />
              <span>অর্জিত ব্যাজসমূহ ({progress.unlockedBadgeIds.length}/{BADGE_DEFINITIONS.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGE_DEFINITIONS.map((b) => {
                const unlocked = progress.unlockedBadgeIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border ${
                      unlocked
                        ? 'surface-alt border-[var(--border-strong)]'
                        : 'opacity-50 border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="text-sm font-semibold">{lang === 'bn' ? b.titleBn : b.titleEn}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {lang === 'bn' ? b.criteriaBn : b.criteriaEn}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
