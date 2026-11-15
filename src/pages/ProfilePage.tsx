import React, { useState } from 'react';
import {
  Award,
  Bell,
  BookOpen,
  Check,
  Compass,
  Crown,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  Monitor,
  Moon,
  RotateCcw,
  Sliders,
  Sparkles,
  Star,
  Sun,
  Trophy,
  UserCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { BADGE_DEFINITIONS, BadgeIconName, useApp } from '../context/AppContext';
import {
  ColorSchemeMode,
  GrammarTerminologyMode,
  InterfaceLang,
  LearningTrack,
  SpeechEngineMode,
  ThemeMode,
  VoiceGender,
} from '../types/academy';
import {
  getSpeechTuning,
  setSpeechTuning,
  speakBilingualText,
  speakText,
  SpeechTuning,
  VOICE_EMOTION_PRESETS,
  VoiceEmotion,
} from '../utils/speech';

const BADGE_ICONS: Record<BadgeIconName, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  book: BookOpen,
  compass: Compass,
  layers: Layers,
  award: Award,
  graduation: GraduationCap,
  crown: Crown,
  flame: Flame,
  trophy: Trophy,
  star: Star,
};

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
    colorScheme,
    setColorScheme,
    resolvedDarkMode,
    osPrefersDark,
    backdropIntensity,
    setBackdropIntensity,
    progress,
    currentLevelNumber,
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
    grammarTerminologyMode,
    setGrammarTerminologyMode,
    speechEngine,
    setSpeechEngine,
  } = useApp();

  const earnedBadgeSet = new Set(progress.unlockedBadgeIds);
  const earnedCount = BADGE_DEFINITIONS.filter((b) => earnedBadgeSet.has(b.id) || b.check(progress)).length;
  const totalBadges = BADGE_DEFINITIONS.length;
  const badgePct = Math.round((earnedCount / totalBadges) * 100);

  const [name, setName] = useState(progress.studentName);
  const [track, setTrack] = useState<LearningTrack>(progress.preferredTrack);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(progress.voiceGender || 'male');
  const [speechTuning, setSpeechTuningState] = useState<SpeechTuning>(() => getSpeechTuning());
  const [dailyMins, setDailyMins] = useState(progress.dailyTargetMinutes);
  const [savedToast, setSavedToast] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      studentName: name.trim() || 'প্রিয় শিক্ষার্থী',
      preferredTrack: track,
      voiceGender,
      dailyTargetMinutes: Math.max(5, Math.min(180, Number(dailyMins) || 20)),
    });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  };

  const handleSelectVoiceGender = (gender: VoiceGender) => {
    setVoiceGender(gender);
    updateProfile({ voiceGender: gender });
    speakBilingualText(
      gender === 'male'
        ? 'السَّلَامُ عَلَيْكُمْ، أَنَا أُسْتَاذُ اللُّغَةِ الْعَرَبِيَّةِ। আসসালামু আলাইকুম, আমি এখন পুরুষ (উস্তায) কণ্ঠে আরবি ও বাংলা পড়াব।'
        : 'السَّلَامُ عَلَيْكُمْ، أَنَا أُسْتَاذَةُ اللُّغَةِ الْعَرَبِيَّةِ। আসসালামু আলাইকুম, আমি এখন নারী (উস্তাধা) কণ্ঠে আরবি ও বাংলা পড়াব।',
      { voiceGender: gender }
    );
  };

  const handleTuningChange = (updates: Partial<SpeechTuning>) => {
    const next = setSpeechTuning(updates);
    setSpeechTuningState(next);
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
      <div className="max-w-4xl space-y-6">
        {/* User Achievements & Visual Badge Gallery */}
        <section className="surface-card rounded-3xl p-6 space-y-5 border border-[var(--border-strong)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                <Trophy className="w-4 h-4" />
                <span>অর্জন ও সম্মাননা (User Achievements)</span>
              </div>
              <h2 className="text-xl font-bold">
                অর্জিত ব্যাজ: {earnedCount}/{totalBadges}টি · লেভেল {currentLevelNumber}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                পাঠ, নাহু-ছরফ ব্যাকরণ ও শব্দভাণ্ডার (SRS) মাইলফলক পূর্ণ হলে স্বয়ংক্রিয়ভাবে ব্যাজ আনলক হয়
              </p>
            </div>

            <div className="min-w-[160px] surface-alt rounded-2xl px-4 py-3 text-right space-y-1">
              <div className="text-xs font-mono-num font-bold text-[var(--accent)]">
                {progress.xp} XP · {badgePct}%
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.max(8, badgePct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BADGE_DEFINITIONS.map((badge) => {
              const unlocked = earnedBadgeSet.has(badge.id) || badge.check(progress);
              const { current, target } = badge.getProgress(progress);
              const pct = Math.min(100, Math.round((current / Math.max(1, target)) * 100));
              const Icon = BADGE_ICONS[badge.iconName];

              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                    unlocked
                      ? 'surface-alt border-[var(--border-strong)] shadow-sm'
                      : 'bg-[var(--bg-canvas)]/55 border-[var(--border-subtle)] opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        unlocked
                          ? `bg-gradient-to-br ${badge.accentGrad} text-white`
                          : 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {unlocked ? '● অর্জিত' : 'লক করা'}
                        </span>
                        <span className="text-[11px] font-mono-num text-[var(--text-muted)]">
                          {current}/{target}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold leading-snug text-[var(--text-primary)]">
                        {lang === 'bn' ? badge.titleBn : badge.titleEn}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {lang === 'bn' ? badge.criteriaBn : badge.criteriaEn}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        unlocked ? `bg-gradient-to-r ${badge.accentGrad}` : 'bg-[var(--text-muted)]/40'
                      }`}
                      style={{ width: `${Math.max(unlocked ? 100 : 4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
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

          <div className="p-4 sm:p-5 rounded-2xl surface-alt border border-[var(--border-strong)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">AI শিক্ষক ও কথোপকথন কণ্ঠ সেটিংস (Voice Synthesis)</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    পুরুষ (উস্তায) বা নারী (উস্তাধা) কণ্ঠ নির্বাচন করলে স্পিকিং প্র্যাকটিস, পাঠ অডিও ও AI শিক্ষকের সিন্থেসিস স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    voiceGender === 'male'
                      ? 'السَّلَامُ عَلَيْكُمْ، أَنَا أُسْتَاذُكَ فِي اللُّغَةِ الْعَرَبِيَّةِ'
                      : 'السَّلَامُ عَلَيْكُمْ، أَنَا أُسْتَاذَتُكَ فِي اللُّغَةِ الْعَرَبِيَّةِ',
                    'ar-SA',
                    { voiceGender }
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary"
              >
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>আরবি কণ্ঠ পরীক্ষা</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectVoiceGender('male')}
                className={`py-3 px-4 rounded-xl text-left border transition-all ${
                  voiceGender === 'male'
                    ? 'btn-primary border-transparent shadow-sm'
                    : 'btn-secondary border-[var(--border-subtle)]'
                }`}
              >
                <div className="text-xs font-bold">পুরুষ কণ্ঠ — উস্তায (Male AI Teacher)</div>
                <div className="text-[11px] opacity-85 mt-0.5">প্রাকৃতিক স্পষ্ট পুরুষ স্বর (বাংলা ও আরবি উভয়ই পুরুষ)</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectVoiceGender('female')}
                className={`py-3 px-4 rounded-xl text-left border transition-all ${
                  voiceGender === 'female'
                    ? 'btn-primary border-transparent shadow-sm'
                    : 'btn-secondary border-[var(--border-subtle)]'
                }`}
              >
                <div className="text-xs font-bold">নারী কণ্ঠ — উস্তাধা (Female AI Teacher)</div>
                <div className="text-[11px] opacity-85 mt-0.5">স্পষ্ট কোমল নারী স্বর (বাংলা ও আরবি উভয়ই নারী)</div>
              </button>
            </div>

            {/* Speech Engine Selector (Natural AI Studio Voice vs Native) */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                অডিও ইঞ্জিন মোড (Voice Quality Engine)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    {
                      id: 'auto' as SpeechEngineMode,
                      title: 'AI প্রাকৃতিক কণ্ঠ (Auto)',
                      desc: 'অনলাইনে পরিষ্কার AI কণ্ঠ, অফলাইনে ডিভাইস ভয়েস',
                    },
                    {
                      id: 'gemini-tts' as SpeechEngineMode,
                      title: 'Gemini Studio TTS',
                      desc: 'সরাসরি প্রাকৃতিক স্টুডিও ভয়েস (ঘ্যারঘ্যারমুক্ত)',
                    },
                    {
                      id: 'native' as SpeechEngineMode,
                      title: 'ডিভাইস ভয়েস (Native)',
                      desc: 'দ্রুত অফলাইন ব্রাউজার সিন্থেসিস',
                    },
                  ]
                ).map((eng) => {
                  const active = speechEngine === eng.id;
                  return (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => setSpeechEngine(eng.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        active
                          ? 'btn-primary border-transparent shadow-sm'
                          : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="text-xs font-bold">{eng.title}</div>
                      <div className="text-[11px] opacity-85 mt-0.5">{eng.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Synthesis Speed, Pitch & Emotion Tuning */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>উচ্চারণের গতি (Rate)</span>
                    </span>
                    <span className="font-mono-num font-bold text-[var(--accent)]">
                      {speechTuning.rateMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.7}
                    max={1.35}
                    step={0.05}
                    value={speechTuning.rateMultiplier}
                    onChange={(e) => handleTuningChange({ rateMultiplier: Number(e.target.value) })}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: 'ধীরে 0.8x', val: 0.8 },
                      { label: 'স্বাভাবিক 1.0x', val: 1.0 },
                      { label: 'দ্রুত 1.15x', val: 1.15 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleTuningChange({ rateMultiplier: preset.val })}
                        className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition-colors ${
                          Math.abs(speechTuning.rateMultiplier - preset.val) < 0.04
                            ? 'btn-primary border-transparent'
                            : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">স্বরের পিচ (Pitch Fine-Tune)</span>
                    <span className="font-mono-num font-bold text-[var(--accent)]">
                      {speechTuning.pitchOffset >= 0 ? '+' : ''}
                      {speechTuning.pitchOffset.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-0.3}
                    max={0.3}
                    step={0.03}
                    value={speechTuning.pitchOffset}
                    onChange={(e) => handleTuningChange({ pitchOffset: Number(e.target.value) })}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>গভীর (-0.30)</span>
                    <button
                      type="button"
                      onClick={() => handleTuningChange({ pitchOffset: 0 })}
                      className="text-[var(--accent)] hover:underline font-semibold"
                    >
                      রিসেট (0.00)
                    </button>
                    <span>তীক্ষ্ণ (+0.30)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  কণ্ঠের ভাব ও ভঙ্গি (Emotion / Speaking Style)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['formal', 'friendly', 'encouraging'] as VoiceEmotion[]).map((em) => {
                    const info = VOICE_EMOTION_PRESETS[em];
                    const active = (speechTuning.emotion || 'formal') === em;
                    return (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handleTuningChange({ emotion: em })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          active
                            ? 'btn-primary border-transparent shadow-sm'
                            : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="text-xs font-bold">{info.labelBn}</div>
                        <div className="text-[11px] opacity-85 mt-0.5">{info.descBn}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
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

        {/* Appearance Mode (System Auto + Manual Override) & 8 Theme Switcher */}
        <div className="surface-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">ডার্ক মোড (OS + ম্যানুয়াল), থিম ও ভাষা</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                আপনার ডিভাইসের OS মোড: <strong>{osPrefersDark ? 'ডার্ক' : 'লাইট'}</strong> · বর্তমানে সক্রিয়:{' '}
                <strong>{resolvedDarkMode ? 'ডার্ক মোড' : 'লাইট মোড'}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--text-muted)]">সিস্টেম-ব্যাপী মোড (Color Scheme)</div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'system', label: 'সিস্টেম অটো', sub: osPrefersDark ? 'OS: ডার্ক' : 'OS: লাইট', icon: Monitor },
                  { id: 'light', label: 'লাইট মোড', sub: 'উজ্জ্বল দিন', icon: Sun },
                  { id: 'dark', label: 'ডার্ক মোড', sub: 'সন্ধ্যা/রাত', icon: Moon },
                ] as { id: ColorSchemeMode; label: string; sub: string; icon: typeof Monitor }[]
              ).map((opt) => {
                const Icon = opt.icon;
                const active = colorScheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setColorScheme(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      active
                        ? 'btn-primary border-transparent shadow-sm'
                        : 'btn-secondary border-[var(--border-subtle)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{opt.label}</div>
                      <div className="text-[10px] opacity-80 truncate">{opt.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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

          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              তারকিব ও ব্যাকরণ পরিভাষা (Grammar Terminology)
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              পাঠ, কুরআন তারকিব ও পপওভারে ব্যাকরণগত পদের নাম মূল আরবি হরফে (যেমন: اِسْم، فِعْل، مُبْتَدَأ، خَبَر) নাকি বাংলায় দেখাবে তা নির্বাচন করুন।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  {
                    id: 'arabic' as GrammarTerminologyMode,
                    title: 'মূল আরবি পরিভাষা (العربية)',
                    sub: 'اِسْم · فِعْل · مُبْتَدَأ · خَبَر · مُضَاف إِلَيْهِ (টুলটিপে বাংলা ব্যাখ্যা)',
                  },
                  {
                    id: 'bengali' as GrammarTerminologyMode,
                    title: 'বাংলা পরিভাষা (বাংলা)',
                    sub: 'ইসম · ফেল · মুবতাদা · খবর · মুদাফ ইলাইহি',
                  },
                ]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGrammarTerminologyMode(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    grammarTerminologyMode === opt.id
                      ? 'btn-primary border-transparent shadow-sm'
                      : 'btn-secondary border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.title}</div>
                  <div className="text-[11px] opacity-85 mt-0.5 font-arabic-ui">{opt.sub}</div>
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
