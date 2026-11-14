import React, { useState } from 'react';
import { Check, CloudSun, Monitor, Moon, Sliders, Sparkles, Sun, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { BackdropIntensity, ColorSchemeMode, ThemeMode } from '../types/academy';
import skyMosqueImg from '../assets/images/theme_bright_sky_mosque_1794521633239.jpg';
import kaabaImg from '../assets/images/theme_kaaba_sanctuary_1794521633707.jpg';
import madinahImg from '../assets/images/theme_madinah_courtyard_1794521633886.jpg';
import quranArtImg from '../assets/images/quranic_manuscript_art_1794510740673.jpg';

interface ThemeCardMeta {
  id: ThemeMode;
  bgPreview: string;
  imageSrc?: string;
  accentPreview: string;
  vibeBn: string;
  tag?: string;
}

const THEME_SHOWCASE: ThemeCardMeta[] = [
  {
    id: 'sky-cloud',
    bgPreview: 'linear-gradient(145deg, #dff0fb 0%, #eef7f5 50%, #eef2ff 100%)',
    imageSrc: skyMosqueImg,
    accentPreview: '#4f46e5',
    vibeBn: 'হালকা উজ্জ্বল আকাশ, শুভ্র মেঘ ও প্রশান্ত মসজিদ দৃশ্য',
    tag: 'উজ্জ্বল আকাশ',
  },
  {
    id: 'kaaba',
    bgPreview: 'linear-gradient(145deg, #241d0f 0%, #09090b 100%)',
    imageSrc: kaabaImg,
    accentPreview: '#f0c44d',
    vibeBn: 'পবিত্র কাবা শরীফ ও সোনালী গোধূলির নূরানী আবহ',
    tag: 'কাবা শরীফ',
  },
  {
    id: 'madinah',
    bgPreview: 'linear-gradient(145deg, #092c28 0%, #061b19 60%, #103b35 100%)',
    imageSrc: madinahImg,
    accentPreview: '#e6b979',
    vibeBn: 'মসজিদে নববীর প্রশান্ত সবুজ গম্বুজ ও ভোরের স্নিগ্ধ আলো',
    tag: 'মদীনা শরীফ',
  },
  {
    id: 'emerald',
    bgPreview: 'linear-gradient(145deg, #0b2215 0%, #1c472c 65%, #06140c 100%)',
    imageSrc: quranArtImg,
    accentPreview: '#ffffff',
    vibeBn: 'ইসলামিক পাণ্ডুলিপি, গভীর এমারেল্ড ও স্নিগ্ধ গ্লাসমরফিজম',
    tag: 'গ্লাস এমারেল্ড',
  },
  {
    id: 'parchment',
    bgPreview: 'linear-gradient(145deg, #fcf8f0 0%, #ebd9bb 100%)',
    imageSrc: quranArtImg,
    accentPreview: '#9a5b13',
    vibeBn: 'কুরআনিক পাণ্ডুলিপি, ক্যালিগ্রাফি ও উষ্ণ ক্রিম কাগজ',
    tag: 'কুরআনিক',
  },
  {
    id: 'light',
    bgPreview: 'linear-gradient(145deg, #f5f6fa 0%, #ffffff 60%, #e0e7ff 100%)',
    accentPreview: '#4338ca',
    vibeBn: 'পরিচ্ছন্ন সাদা একাডেমিক ড্যাশবোর্ড ও তীক্ষ্ণ কন্ট্রাস্ট',
    tag: 'ক্লিন স্টুডিও',
  },
  {
    id: 'andalus',
    bgPreview: 'linear-gradient(145deg, #091334 0%, #1d397e 55%, #476ec9 100%)',
    accentPreview: '#ffffff',
    vibeBn: 'আন্দালুসীয় স্যাফায়ার আকাশ ও ভাসমান গ্লাস কার্ড',
    tag: 'স্যাফায়ার',
  },
  {
    id: 'midnight',
    bgPreview: 'linear-gradient(145deg, #182a59 0%, #070d1b 100%)',
    accentPreview: '#818cf8',
    vibeBn: 'রাতের নীরব পড়াশোনার জন্য মিডনাইট ইন্ডিগো',
  },
];

export const ThemesPage: React.FC = () => {
  const {
    t,
    theme,
    setTheme,
    colorScheme,
    setColorScheme,
    osPrefersDark,
    backdropIntensity,
    setBackdropIntensity,
    soundEnabled,
    setSoundEnabled,
    triggerSound,
  } = useApp();
  const [tapCount, setTapCount] = useState(0);

  const activeMeta = THEME_SHOWCASE.find((m) => m.id === theme) || THEME_SHOWCASE[0];
  const isLightActive = ['sky-cloud', 'light', 'parchment'].includes(theme) && !activeMeta.imageSrc;

  const handleStageTap = () => {
    setTapCount((c) => c + 1);
    triggerSound('bubble', true);
  };

  return (
    <AppShell
      title={t.sidebar.themes}
      subtitle="মসজিদ, পবিত্র কাবা শরীফ, মদীনা ও হালকা উজ্জ্বল আকাশের ইসলামিক থিম, ডিএনএ ঢেউ এবং বুদবুদ"
    >
      <div className="space-y-6">
        {/* Top Row: Live Scenic Stage Preview + Animation/Sound Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div
            onClick={handleStageTap}
            className="lg:col-span-6 rounded-3xl p-7 flex flex-col justify-between gap-6 cursor-pointer select-none border border-[var(--border-strong)] shadow-lg relative overflow-hidden min-h-[300px]"
            style={{ background: activeMeta.bgPreview }}
          >
            {activeMeta.imageSrc && (
              <>
                <img
                  src={activeMeta.imageSrc}
                  alt={t.themes[theme]}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10, 18, 30, 0.25) 0%, rgba(10, 18, 30, 0.72) 100%)',
                  }}
                />
              </>
            )}

            <div className="relative z-10 flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold shadow"
                style={{
                  backgroundColor: activeMeta.accentPreview,
                  color: activeMeta.accentPreview === '#ffffff' ? '#0f172a' : '#ffffff',
                }}
              >
                {t.themes[theme]}
              </span>
              <span
                className={`text-xs font-mono-num ${
                  isLightActive ? 'text-slate-700' : 'text-white/90'
                }`}
              >
                TAP STAGE · {tapCount}
              </span>
            </div>

            <div className="relative z-10 my-auto py-4 flex flex-col items-center text-center gap-3">
              <div
                className="w-16 h-16 rounded-full shadow-xl flex items-center justify-center animate-float-slow"
                style={{
                  background: `radial-gradient(circle at 30% 30%, #ffffff, ${activeMeta.accentPreview})`,
                }}
              >
                <CloudSun className="w-8 h-8 text-white drop-shadow" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold ${isLightActive ? 'text-slate-900' : 'text-white'}`}>
                ইসলামিক ও জীবন্ত থিম স্টেজ
              </h2>
              <p
                className={`text-xs sm:text-sm max-w-md ${
                  isLightActive ? 'text-slate-700' : 'text-white/85'
                }`}
              >
                মসজিদ, কাবা শরীফ ও হালকা উজ্জ্বল আকাশের ছবির ওপর ডিএনএ ঢেউ ও ভাসমান বুদবুদ হাতের স্পর্শে নেচে ওঠে।
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStageTap();
              }}
              className="relative z-10 w-full py-3 rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-2"
              style={{
                backgroundColor: activeMeta.accentPreview,
                color: activeMeta.accentPreview === '#ffffff' ? '#0f172a' : '#ffffff',
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>বুদবুদ ও ঢেউ তুলুন ({tapCount})</span>
            </button>
          </div>

          {/* Right: Animation & Sound Settings */}
          <div className="lg:col-span-6 surface-card rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Sliders className="w-4 h-4 text-[var(--accent)]" />
                <span>অ্যানিমেশন ও সাউন্ড কন্ট্রোল</span>
              </div>

              <div className="surface-alt rounded-2xl divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)]">
                <div className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">ডিএনএ ঢেউ ও ভাসমান বুদবুদ</div>
                    <div className="text-xs text-[var(--text-muted)]">ব্যাকগ্রাউন্ড মোশন মাত্রা</div>
                  </div>
                  <div className="inline-flex gap-1 bg-[var(--bg-canvas)] p-1 rounded-full border border-[var(--border-subtle)]">
                    {(
                      [
                        { id: 'vivid', label: 'ঝলমলে' },
                        { id: 'gentle', label: 'শান্ত' },
                        { id: 'off', label: 'বন্ধ' },
                      ] as { id: BackdropIntensity; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBackdropIntensity(opt.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          backdropIntensity === opt.id ? 'btn-primary' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">সিস্টেম ডার্ক মোড ও ম্যানুয়াল</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      ডিভাইসের OS: {osPrefersDark ? 'ডার্ক' : 'লাইট'} · কাস্টম থিমের সাথে স্বয়ংক্রিয় সামঞ্জস্য
                    </div>
                  </div>
                  <div className="inline-flex gap-1 bg-[var(--bg-canvas)] p-1 rounded-full border border-[var(--border-subtle)]">
                    {(
                      [
                        { id: 'system', label: 'অটো', icon: Monitor },
                        { id: 'light', label: 'লাইট', icon: Sun },
                        { id: 'dark', label: 'ডার্ক', icon: Moon },
                      ] as { id: ColorSchemeMode; label: string; icon: typeof Monitor }[]
                    ).map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setColorScheme(opt.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                            colorScheme === opt.id ? 'btn-primary' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-[var(--accent)]" />
                    <div>
                      <div className="text-sm font-semibold">ইন্টারঅ্যাক্টিভ সাউন্ড ইফেক্ট</div>
                      <div className="text-xs text-[var(--text-muted)]">পৃষ্ঠা, কুইজ ও বুদবুদ সাউন্ড</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                      soundEnabled ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {soundEnabled ? 'চালু' : 'বন্ধ'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
              🕌 পরামর্শ: দিনের বেলায় পড়ার জন্য <strong>{t.themes['sky-cloud']}</strong>, আর আধ্যাত্মিক পরিবেশের জন্য <strong>{t.themes['kaaba']}</strong> বা <strong>{t.themes['madinah']}</strong> নির্বাচন করুন।
            </div>
          </div>
        </div>

        {/* 8 Islamic Scenic + Studio Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEME_SHOWCASE.map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`text-left surface-card rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                  active
                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-lg'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className="h-32 w-full relative flex items-end justify-between p-3.5 overflow-hidden"
                  style={{ background: item.bgPreview }}
                >
                  {item.imageSrc && (
                    <>
                      <img
                        src={item.imageSrc}
                        alt={t.themes[item.id]}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
                    </>
                  )}

                  <span
                    className="relative z-10 w-7 h-7 rounded-full border-2 border-white/90 shadow"
                    style={{ backgroundColor: item.accentPreview }}
                  />

                  <div className="relative z-10 flex items-center gap-1.5">
                    {item.tag && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-slate-900 text-[10px] font-bold shadow-xs">
                        {item.tag}
                      </span>
                    )}
                    {active && (
                      <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-1">
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
