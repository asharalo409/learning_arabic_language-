import React, { useState } from 'react';
import { Bell, Check, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useApp } from '../context/AppContext';
import { InterfaceLang, LearningTrack, ThemeMode } from '../types/academy';

const ALL_THEMES: { id: ThemeMode; swatch: string; accent: string }[] = [
  { id: 'sky-cloud', swatch: '#bae6fd', accent: '#0284c7' },
  { id: 'emerald', swatch: '#051611', accent: '#d4af37' },
  { id: 'andalus', swatch: '#0c1224', accent: '#38bdf8' },
  { id: 'madinah', swatch: '#061b19', accent: '#e6b979' },
  { id: 'midnight', swatch: '#070d1b', accent: '#e2b74b' },
  { id: 'light', swatch: '#f7f9f7', accent: '#0f6b4e' },
  { id: 'parchment', swatch: '#f6efe2', accent: '#9a5b13' },
  { id: 'kaaba', swatch: '#09090b', accent: '#f0c44d' },
];

export const ProfilePage: React.FC = () => {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    backdropIntensity,
    setBackdropIntensity,
    progress,
    updateProfile,
    resetProgress,
    soundEnabled,
    setSoundEnabled,
    triggerSound,
    reminderSettings,
    updateReminderSettings,
    browserNotifPermission,
    enableBrowserNotifications,
    sendTestNotification,
    openWelcome,
  } = useApp();

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
          ? 'শিক্ষার্থীর নাম, ভাষা, ৮টি জীবন্ত থিম, সাউন্ড ইফেক্ট, নোটিফিকেশন ও ফোন ইনস্টল সেটিংস'
          : 'Manage your profile, 8 living themes, sound effects, notifications, and phone installation'
      }
    >
      <div className="max-w-3xl space-y-6">
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

        {/* 8 Theme Switcher & Language Preferences */}
        <div className="surface-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">থিম (৮টি জীবন্ত থিম) ও ইন্টারফেস ভাষা</h2>

          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)]">{t.sidebar.theme}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {ALL_THEMES.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-colors ${
                    theme === th.id
                      ? 'border-[var(--accent)] bg-[var(--emerald-highlight)] font-semibold'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border border-white/20 flex items-center justify-center"
                    style={{ backgroundColor: th.swatch }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: th.accent }} />
                  </span>
                  <span className="truncate">{t.themes[th.id]}</span>
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

          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)]">ডিএনএ ঢেউ, মেঘ ও বুদবুদ অ্যানিমেশন</div>
            <div className="grid grid-cols-3 gap-2">
              {(['vivid', 'gentle', 'off'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBackdropIntensity(mode)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium ${
                    backdropIntensity === mode ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {mode === 'vivid' ? 'ঝলমলে' : mode === 'gentle' ? 'শান্ত' : 'বন্ধ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sound Effects, Notifications & Phone Installation */}
        <div className="surface-card rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">সাউন্ড ইফেক্ট, নোটিফিকেশন ও ফোন ইনস্টল</h2>

          {/* Sound Controls */}
          <div className="surface-alt rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">সাউন্ড ইফেক্ট (অ্যাপ সাউন্ড ও স্বাগতম ধ্বনি)</div>
                <div className="text-xs text-[var(--text-muted)]">
                  পাঠ সম্পন্ন, কুইজ সাফল্য, ব্যাজ অর্জন ও স্বাগতম জানানোর সময় মনোরম ধ্বনি বাজবে
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${
                  soundEnabled ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => triggerSound('welcome', true)}
                className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
              >
                স্বাগতম সাউন্ড শুনুন
              </button>
              <button
                type="button"
                onClick={() => triggerSound('success', true)}
                className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
              >
                সাফল্য ধ্বনি
              </button>
              <button
                type="button"
                onClick={() => triggerSound('badge', true)}
                className="px-3 py-1.5 rounded-lg text-xs btn-secondary"
              >
                ব্যাজ ধ্বনি
              </button>
              <button
                type="button"
                onClick={openWelcome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-secondary"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>স্বাগতম বার্তা পুনরায় দেখুন</span>
              </button>
            </div>
          </div>

          {/* Notifications & Daily Reminder */}
          <div className="surface-alt rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold">দৈনিক পড়াশোনার নোটিফিকেশন</span>
              </div>
              <span className="text-xs text-[var(--accent)] font-medium">
                {browserNotifPermission === 'granted'
                  ? 'অনুমতি চালু'
                  : browserNotifPermission === 'denied'
                  ? 'ব্রাউজারে ব্লক করা'
                  : 'চালু করা বাকি'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {browserNotifPermission !== 'granted' && browserNotifPermission !== 'unsupported' && (
                <button
                  type="button"
                  onClick={() => void enableBrowserNotifications()}
                  className="px-4 py-2 rounded-lg text-xs btn-primary"
                >
                  নোটিফিকেশন অনুমতি দিন
                </button>
              )}
              <button
                type="button"
                onClick={() => void sendTestNotification()}
                className="px-4 py-2 rounded-lg text-xs btn-secondary"
              >
                টেস্ট নোটিফিকেশন পাঠান
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.enabled}
                  onChange={(e) => updateReminderSettings({ enabled: e.target.checked })}
                  className="accent-[var(--accent)]"
                />
                <span>প্রতিদিন নির্দিষ্ট সময়ে রিমাইন্ডার দিন</span>
              </label>
              <input
                type="time"
                value={reminderSettings.timeHHMM}
                onChange={(e) => updateReminderSettings({ timeHHMM: e.target.value })}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-mono-num"
              />
            </div>
          </div>

          {/* Phone App Installation */}
          <div className="surface-alt rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">ফোন ও ডেস্কটপ অ্যাপ ইনস্টল (PWA)</div>
              <div className="text-xs text-[var(--text-muted)]">
                অ্যাপ হিসেবে ফোনে ইনস্টল করলে অফলাইনেও সফওয়াতুল মাসাদির, ব্যাকরণ ও পাঠ পড়া যাবে
              </div>
            </div>
            <PWAInstallButton />
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
