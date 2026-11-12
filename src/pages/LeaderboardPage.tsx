import React from 'react';
import { Award, Flame, Trophy } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { BADGE_DEFINITIONS, useApp } from '../context/AppContext';

const COHORT_PEERS = [
  { name: 'মুহাম্মাদ রাশেদ', track: 'Quranic', xp: 1450, streak: 14, lessons: 18 },
  { name: 'সাদিয়া আফরিন', track: 'Combined', xp: 980, streak: 9, lessons: 12 },
  { name: 'আব্দুর রহমান', track: 'MSA', xp: 640, streak: 6, lessons: 8 },
  { name: 'মরিয়ম সিদ্দিকা', track: 'Quranic', xp: 340, streak: 4, lessons: 5 },
  { name: 'যুবায়ের আহমেদ', track: 'MSA', xp: 190, streak: 2, lessons: 2 },
];

export const LeaderboardPage: React.FC = () => {
  const { t, lang, progress, currentLevelNumber } = useApp();

  const board = [
    ...COHORT_PEERS.map((p) => ({ ...p, isYou: false })),
    {
      name: progress.studentName,
      track: progress.preferredTrack,
      xp: progress.xp,
      streak: progress.streakDays,
      lessons: progress.completedLessonIds.length,
      isYou: true,
    },
  ].sort((a, b) => b.xp - a.xp);

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
          ? 'শিক্ষার্থী র‍্যাঙ্কিং, অর্জিত ব্যাজ এবং মাইলফলকসমূহ'
          : 'Academy cohort leaderboard, achievement badges & milestones'
      }
    >
      <div className="space-y-8">
        {/* Leaderboard Table */}
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--accent)]" />
              <span>{lang === 'bn' ? 'একাডেমি কোহর্ট লিডারবোর্ড' : 'Academy Cohort Standings'}</span>
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              আপনার বর্তমান স্তর: Level {currentLevelNumber} · {progress.xp} XP
            </span>
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
                  <th className="py-2.5 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {board.map((row, idx) => (
                  <tr
                    key={`${row.name}-${idx}`}
                    className={row.isYou ? 'bg-[var(--emerald-highlight)] font-semibold' : ''}
                  >
                    <td className="py-3 pe-4 font-mono-num">#{idx + 1}</td>
                    <td className="py-3 pe-4">
                      {row.name}{' '}
                      {row.isYou && (
                        <span className="text-xs text-[var(--accent)] ms-1">(আপনি)</span>
                      )}
                    </td>
                    <td className="py-3 pe-4 text-xs text-[var(--text-muted)]">{row.track}</td>
                    <td className="py-3 pe-4 font-mono-num">{row.lessons}</td>
                    <td className="py-3 pe-4 font-mono-num">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
                        {row.streak}d
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono-num text-[var(--accent)]">{row.xp}</td>
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
