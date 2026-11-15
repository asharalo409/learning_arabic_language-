import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bot,
  ChevronRight,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  LogIn,
  Mic,
  Monitor,
  Moon,
  Palette,
  ScrollText,
  Search,
  Shield,
  Sun,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ColorSchemeMode, InterfaceLang } from '../types/academy';
import { BrandLogo } from './Navbar';

interface SidebarDrawerContentProps {
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseOnDesktop?: boolean;
}

export const SidebarDrawerContent: React.FC<SidebarDrawerContentProps> = ({
  onNavigate,
  onClose,
  showCloseOnDesktop = false,
}) => {
  const {
    t,
    theme,
    colorScheme,
    setColorScheme,
    resolvedDarkMode,
    lang,
    setLang,
    progress,
    currentLevelNumber,
    quickGrammarOpen,
    setQuickGrammarOpen,
    setInstantLookupOpen,
  } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const isDarkTheme = resolvedDarkMode;

  const navGroups: {
    label: string;
    accentColor: string;
    items: { to: string; label: string; icon: typeof Home }[];
  }[] = [
    ...(user
      ? [
          {
            label: 'আমার ড্যাশবোর্ড',
            accentColor: '#10b981',
            items: [
              { to: '/dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
              { to: '/certificates', label: t.sidebar.certificates, icon: Award },
            ],
          },
        ]
      : []),
    {
      label: '১. ধাপে ধাপে আরবি কোর্স',
      accentColor: '#059669',
      items: [
        { to: '/courses', label: lang === 'bn' ? '১–১০০ ধাপ আরবি কোর্স' : t.sidebar.courses, icon: BookOpen },
      ],
    },
    {
      label: '২. কোরআনের মাধ্যমে পড়ুন ও শব্দ',
      accentColor: '#e11d48',
      items: [
        { to: '/quranic-arabic', label: 'কোরআনের মাধ্যমে পড়ুন (২৬ সূরা)', icon: ScrollText },
        { to: '/vocabulary', label: t.sidebar.vocabulary, icon: Layers },
      ],
    },
    {
      label: '৩. ব্যাকরণ (নাহু ও ছরফ)',
      accentColor: '#d97706',
      items: [
        { to: '/safwatul-masadir', label: t.sidebar.safwatulMasadir, icon: BookOpenCheck },
        { to: '/grammar', label: t.sidebar.grammar, icon: GraduationCap },
      ],
    },
    {
      label: '৪. AI লাইভ ভয়েস ও পরীক্ষা',
      accentColor: '#6366f1',
      items: [
        { to: '/ai-teacher', label: t.sidebar.aiTeacher, icon: Bot },
        { to: '/speaking', label: t.sidebar.speaking, icon: Mic },
        { to: '/quiz', label: t.sidebar.quiz, icon: ClipboardCheck },
      ],
    },
    {
      label: '৫. নামাজ, থিম ও অ্যাকাউন্ট',
      accentColor: '#0284c7',
      items: [
        { to: '/prayer-weather', label: t.sidebar.prayerWeather, icon: Clock },
        { to: '/themes', label: t.sidebar.themes, icon: Palette },
        { to: '/profile', label: t.sidebar.profile, icon: User },
        { to: '/auth', label: user ? user.fullName : 'Gmail লগইন / অ্যাকাউন্ট', icon: user ? UserCheck : LogIn },
        ...(user?.isAdmin ? [{ to: '/admin', label: t.sidebar.admin, icon: Shield }] : []),
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between p-4 gap-5">
      <div className="space-y-4">
        <div className="px-2 pt-1 flex items-center justify-between">
          <BrandLogo />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`${showCloseOnDesktop ? '' : 'lg:hidden '}p-1.5 rounded-xl btn-secondary`}
              aria-label="মেনু বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean Workspace / Student Account Switcher */}
        <Link
          to="/auth"
          onClick={onNavigate}
          className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl surface-alt border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-xs font-bold shrink-0">
              {(user?.fullName || progress.studentName).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{user ? user.fullName : progress.studentName}</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono-num truncate">
                Lv.{currentLevelNumber} · {progress.xp} XP · {user?.isAdmin ? 'Admin' : user ? 'Synced' : 'Guest'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        </Link>

        {/* Grouped Navigation (5 Core Hubs) */}
        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div
                className="px-3 text-[10px] font-bold tracking-wider flex items-center gap-1.5"
                style={{ color: group.accentColor }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: group.accentColor }}
                />
                <span>{group.label}</span>
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all ${
                      active
                        ? 'text-white font-semibold shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]'
                    }`}
                    style={active ? { backgroundColor: group.accentColor } : undefined}
                  >
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: active ? '#ffffff' : group.accentColor }}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Quick Tools: Quick Grammar Reference Modal & Instant Root Lookup */}
        <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setQuickGrammarOpen(!quickGrammarOpen);
              onNavigate?.();
            }}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
              quickGrammarOpen
                ? 'bg-[var(--emerald-highlight)] text-[var(--accent)] border border-[var(--accent)]/40'
                : 'surface-alt text-[var(--text-primary)] hover:border-[var(--accent)]/45 border border-[var(--border-subtle)]'
            }`}
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <BookMarked className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">দ্রুত ব্যাকরণ রেফারেন্স</span>
            </span>
            <span className="text-[10px] font-bold text-[var(--accent)] shrink-0">দেখুন</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInstantLookupOpen(true);
              onNavigate?.();
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold surface-alt text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/45 transition-colors"
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="truncate">তাৎক্ষণিক শব্দ ও মূলধাতু</span>
            </span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] shrink-0">খুঁজুন</span>
          </button>
        </div>
      </div>

      {/* Bottom Clean Mode Switcher (System / Light / Dark) + Language Switcher + Founder Card */}
      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
        <div className="p-2 rounded-xl surface-alt space-y-1.5">
          <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              {isDarkTheme ? (
                <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />
              )}
              <span>{colorScheme === 'system' ? 'সিস্টেম অটো' : isDarkTheme ? 'ডার্ক মোড' : 'লাইট মোড'}</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {isDarkTheme ? 'Dark' : 'Light'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
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
                  className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                    colorScheme === opt.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {(['bn', 'en', 'ar'] as InterfaceLang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap ${
                lang === l ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {l === 'bn' ? 'বাংলা' : l === 'en' ? 'EN' : 'العربية'}
            </button>
          ))}
        </div>

        <div className="p-3 rounded-2xl surface-alt border border-[var(--border-subtle)] space-y-1.5">
          <div className="text-[11px] font-bold text-[var(--text-primary)]">তাসীন বিল্লাহ</div>
          <div className="text-[10px] text-[var(--text-muted)] leading-snug">
            প্রতিষ্ঠাতা · আল কুরআন এণ্ড ইসলামিক স্টাডিজ, কুষ্টিয়া ইবি
          </div>
          <Link
            to="/themes"
            onClick={onNavigate}
            className="mt-1 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] btn-primary"
          >
            <Palette className="w-3 h-3" />
            <span>থিম স্টুডিও ({t.themes[theme]})</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
