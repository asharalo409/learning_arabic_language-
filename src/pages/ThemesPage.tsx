import React, { useState } from 'react';
import { Check, CloudSun, Sparkles, Volume2, Waves } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { BackdropIntensity, ThemeMode } from '../types/academy';

interface ThemeCardMeta {
  id: ThemeMode;
  bgPreview: string;
  accentPreview: string;
  vibeBn: string;
  isNew?: boolean;
}

const THEME_SHOWCASE: ThemeCardMeta[] = [
  {
    id: 'sky-cloud',
    bgPreview: 'linear-gradient(135deg, #bae6fd 0%, #f0f9ff 60%, #fef3c7 100%)',
    accentPreview: '#0284c7',
    vibeBn: 'উজ্জ্বল নীল আকাশ, সাদা ভাসমান মেঘ ও সোনালি রোদের ঝলমলে পরিবেশ',
    isNew: true,
  },
  {
    id: 'emerald',
    bgPreview: 'linear-gradient(135deg, #063125 0%, #0a221a 100%)',
    accentPreview: '#e5c158',
    vibeBn: 'গভীর ইসলামিক পান্না সবুজ ও স্বর্ণালী ক্যালিগ্রাফি আবহ',
  },
  {
    id: 'andalus',
    bgPreview: 'linear-gradient(135deg, #102a5c 0%, #0b1224 100%)',
    accentPreview: '#38bdf8',
    vibeBn: 'আন্দালুসিয়ান রাতের আকাশে উজ্জ্বল নীলাভ ঢেউ ও তারকা',
  },
  {
    id: 'madinah',
    bgPreview: 'linear-gradient(135deg, #0d3b36 0%, #061b19 100%)',
    accentPreview: '#e6b979',
    vibeBn: 'মদীনা রোজ-টিল প্রশান্তি ও কোমল সোনালি আভা',
  },
  {
    id: 'midnight',
    bgPreview: 'linear-gradient(135deg, #15254d 0%, #060b18 100%)',
    accentPreview: '#e2b74b',
    vibeBn: 'রাতের নীরব পড়াশোনার জন্য আরামদায়ক মিডনাইট আকাশ',
  },
  {
    id: 'light',
    bgPreview: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)',
    accentPreview: '#0f6b4e',
    vibeBn: 'দিনে পড়ার জন্য স্বচ্ছ সবুজ-সাদা একাডেমিক পরিবেশ',
  },
  {
    id: 'parchment',
    bgPreview: 'linear-gradient(135deg, #f6efe2 0%, #e7d4b3 100%)',
    accentPreview: '#9a5b13',
    vibeBn: 'ক্লাসিক্যাল আরবি পাণ্ডুলিপি ও প্রাচীন কিতাবের উষ্ণ কাগজ',
  },
  {
    id: 'kaaba',
    bgPreview: 'linear-gradient(135deg, #1f1a10 0%, #09090b 100%)',
    accentPreview: '#f0c44d',
    vibeBn: 'কিসওয়া কালো ও স্বর্ণালী জৌলুসের গাম্ভীর্যপূর্ণ রূপ',
  },
];

export const ThemesPage: React.FC = () => {
  const { t, theme, setTheme, backdropIntensity, setBackdropIntensity, triggerSound } = useApp();
  const [tapCount, setTapCount] = useState(0);

  const handleStageTap = () => {
    setTapCount((c) => c + 1);
    triggerSound('bubble', true);
  };

  return (
    <AppShell
      title={t.sidebar.themes}
      subtitle="হাত দিয়ে ছুঁয়ে দেখুন — জীবন্ত আকাশ, মেঘ, বুদবুদ ও ডিএনএ-সদৃশ ঢেউয়ের ঝলমলে থিম স্টুডিও"
    >
      <div className="space-y-8">
        {/* Interactive Touch Stage */}
        <div
          onClick={handleStageTap}
          className="surface-card rounded-3xl p-6 sm:p-8 border border-[var(--border-strong)] cursor-pointer select-none transition-transform active:scale-[0.995]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
                <CloudSun className="w-4 h-4" />
                <span>ইন্টারঅ্যাক্টিভ থিম প্লেগ্রাউন্ড · বর্তমান: {t.themes[theme]}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                যেকোনো জায়গায় হাত বোলালে বা ট্যাপ করলে ডিএনএর ঢেউ ও বুদবুদ নেচে উঠবে!
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                আঙুল বা মাউস নাড়াচাড়া করে পেছনের ডিএনএ-সদৃশ জোড়া ঢেউ, ভাসমান বুদবুদ এবং উজ্জ্বল মেঘ অনুভব করুন। এখানে ট্যাপ করলে বুদবুদের মিষ্টি শব্দও শোনা যাবে।
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStageTap();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm btn-primary shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>বুদবুদ ও ঢেউ তুলুন ({tapCount})</span>
              </button>
              <span className="text-[11px] text-[var(--text-muted)] inline-flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                প্রতিটি থিম পরিবর্তনে আলাদা ঝলমলে সাউন্ড বাজবে
              </span>
            </div>
          </div>
        </div>

        {/* Motion Intensity Control */}
        <div className="surface-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Waves className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <div className="text-sm font-bold">ডিএনএ ঢেউ, মেঘ ও বুদবুদের গতি</div>
              <div className="text-xs text-[var(--text-muted)]">
                আপনার পছন্দ অনুযায়ী জীবন্ত ব্যাকগ্রাউন্ডের মাত্রা ঠিক করুন
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'vivid', label: 'ঝলমলে (Vivid)' },
                { id: 'gentle', label: 'শান্ত (Gentle)' },
                { id: 'off', label: 'বন্ধ (Static)' },
              ] as { id: BackdropIntensity; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setBackdropIntensity(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  backdropIntensity === opt.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Living Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {THEME_SHOWCASE.map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`text-left surface-card rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                  active
                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/35 shadow-lg'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className="h-28 w-full relative flex items-end justify-between p-4"
                  style={{ background: item.bgPreview }}
                >
                  <span
                    className="w-8 h-8 rounded-full border-2 border-white/80 shadow-md"
                    style={{ backgroundColor: item.accentPreview }}
                  />
                  {item.isNew && (
                    <span className="px-2.5 py-1 rounded-full bg-white/90 text-[#0284c7] text-[10px] font-bold shadow-xs">
                      নতুন · সুপারিশকৃত
                    </span>
                  )}
                  {active && (
                    <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{t.themes[item.id]}</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.vibeBn}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
