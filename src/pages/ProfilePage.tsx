import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { InterfaceLang, LearningTrack, ThemeMode } from '../types/academy';

export const ProfilePage: React.FC = () => {
  const { t, lang, setLang, theme, setTheme, progress, updateProfile, resetProgress } = useApp();
  const [name, setName] = useState(progress.studentName);
  const [track, setTrack] = useState<LearningTrack>(progress.preferredTrack);
  const [dailyMins, setDailyMins] = useState(progress.dailyTargetMinutes);
  const [savedToast, setSavedToast] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      studentName: name.trim() || 'Student',
      preferredTrack: track,
      dailyTargetMinutes: Math.max(5, Math.min(180, Number(dailyMins) || 20)),
    });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <AppShell
      title={t.sidebar.profile}
      subtitle={
        lang === 'bn'
          ? 'শিক্ষার্থীর নাম, ভাষা, থিম এবং শেখার লক্ষ্যমাত্রা নির্ধারণ'
          : 'Manage your student profile, interface language, theme, and study preferences'
      }
    >
      <div className="max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="surface-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">শিক্ষার্থীর তথ্য</h2>

          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">পূর্ণ নাম (সার্টিফিকেটে প্রদর্শিত হবে)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">পছন্দের আরবি ধারা (Track)</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as LearningTrack)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              >
                <option value="Combined">MSA + Quranic (Combined)</option>
                <option value="MSA">Modern Standard Arabic (MSA)</option>
                <option value="Quranic">Quranic Arabic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">দৈনিক লক্ষ্য (মিনিট)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={dailyMins}
                onChange={(e) => setDailyMins(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-mono-num"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="px-5 py-2.5 rounded-lg text-sm btn-primary">
              তথ্য সংরক্ষণ করুন
            </button>
            {savedToast && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
                <Check className="w-4 h-4" /> সংরক্ষিত হয়েছে
              </span>
            )}
          </div>
        </form>

        {/* Theme & Language Preferences */}
        <div className="surface-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">থিম ও ইন্টারফেস ভাষা</h2>

          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)]">{t.sidebar.theme}</div>
            <div className="grid grid-cols-3 gap-2">
              {(['emerald', 'midnight', 'light'] as ThemeMode[]).map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setTheme(th)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium ${
                    theme === th ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {t.themes[th]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)]">{t.sidebar.language}</div>
            <div className="grid grid-cols-3 gap-2">
              {(['bn', 'en', 'ar'] as InterfaceLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium ${
                    lang === l ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {l === 'bn' ? 'বাংলা' : l === 'en' ? 'English' : 'العربية (RTL)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="surface-card rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold">অগ্রগতি রিসেট</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            আপনার সমস্ত XP, সম্পন্ন পাঠ ও পরীক্ষার ইতিহাস মুছে নতুন করে শুরু করতে চাইলে নিচের বাটন ব্যবহার করুন।
          </p>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs border border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>অগ্রগতি রিসেট করুন</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 rounded-lg text-xs bg-[var(--danger)] text-white font-semibold"
              >
                হ্যাঁ, সব রিসেট করুন
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-lg text-xs btn-secondary"
              >
                বাতিল
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
