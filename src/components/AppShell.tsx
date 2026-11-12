import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  Compass,
  Flame,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogIn,
  Menu,
  Mic,
  Palette,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './Navbar';
import { InterfaceLang, ThemeMode } from '../types/academy';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationCenter } from './NotificationCenter';
import { getRouteSoundEffect } from '../utils/soundEffects';

const THEME_LIST: ThemeMode[] = [
  'sky-cloud',
  'emerald',
  'andalus',
  'madinah',
  'midnight',
  'light',
  'parchment',
  'kaaba',
];

function getPageAtmosphere(pathname: string): {
  badgeBn: string;
  gradientClass: string;
} {
  if (pathname === '/themes') {
    return {
      badgeBn: 'ইন্টারঅ্যাক্টিভ থিম প্লেগ্রাউন্ড',
      gradientClass: 'from-sky-500/15 via-amber-400/10 to-cyan-500/15',
    };
  }
  if (pathname === '/auth') {
    return {
      badgeBn: 'সুরক্ষিত অ্যাকাউন্ট ও ক্লাউড সিঙ্ক',
      gradientClass: 'from-emerald-500/15 via-sky-500/10 to-amber-400/15',
    };
  }
  if (pathname === '/quranic-arabic') {
    return {
      badgeBn: 'কুরআনিক তাদাব্বুর ও শব্দ বিশ্লেষণ',
      gradientClass: 'from-amber-500/15 via-emerald-500/10 to-transparent',
    };
  }
  if (pathname === '/safwatul-masadir' || pathname === '/grammar') {
    return {
      badgeBn: 'নাহু ও ছরফ কিতাবি মডিউল',
      gradientClass: 'from-teal-500/15 via-amber-500/10 to-transparent',
    };
  }
  if (pathname === '/leaderboard' || pathname === '/certificates') {
    return {
      badgeBn: 'একাডেমি র‍্যাঙ্কিং ও সম্মাননা',
      gradientClass: 'from-amber-400/20 via-yellow-500/10 to-transparent',
    };
  }
  if (pathname === '/ai-teacher' || pathname === '/speaking') {
    return {
      badgeBn: 'লাইভ AI ও ভয়েস অনুশীলন',
      gradientClass: 'from-indigo-500/15 via-cyan-500/10 to-transparent',
    };
  }
  if (pathname === '/admin') {
    return {
      badgeBn: 'অ্যাডমিন কন্ট্রোল ও ডাটাবেজ',
      gradientClass: 'from-rose-500/12 via-amber-500/10 to-transparent',
    };
  }
  return {
    badgeBn: 'আরবি একাডেমি কর্মক্ষেত্র',
    gradientClass: 'from-[var(--emerald-highlight)] via-transparent to-transparent',
  };
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, subtitle, children }) => {
  const { t, theme, setTheme, lang, setLang, progress, currentLevelNumber, triggerSound } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prevPathRef = useRef(location.pathname);

  // Play distinct section sound effect whenever switching between separate pages
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      triggerSound(getRouteSoundEffect(location.pathname));
    }
  }, [location.pathname, triggerSound]);

  const atmosphere = getPageAtmosphere(location.pathname);

  const navGroups = [
    {
      label: t.sidebar.overview,
      items: [
        { to: '/dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
        { to: '/ai-teacher', label: t.sidebar.aiTeacher, icon: Bot },
        { to: '/courses', label: t.sidebar.courses, icon: BookOpen },
        { to: '/courses/beginners', label: t.sidebar.beginners, icon: Compass },
        { to: '/daily-lessons', label: t.sidebar.dailyLessons, icon: ListChecks },
        { to: '/bayna-yadayk', label: t.sidebar.baynaYadayk, icon: BookMarked },
        { to: '/safwatul-masadir', label: t.sidebar.safwatulMasadir, icon: BookOpenCheck },
      ],
    },
    {
      label: t.nav.practice,
      items: [
        { to: '/listening', label: t.sidebar.listening, icon: Headphones },
        { to: '/speaking', label: t.sidebar.speaking, icon: Mic },
        { to: '/grammar', label: t.sidebar.grammar, icon: GraduationCap },
        { to: '/quranic-arabic', label: t.sidebar.quranic, icon: ScrollText },
        { to: '/vocabulary', label: t.sidebar.vocabulary, icon: Layers },
        { to: '/quiz', label: t.sidebar.quiz, icon: ClipboardCheck },
        { to: '/practice', label: t.sidebar.practice, icon: Sparkles },
      ],
    },
    {
      label: 'অ্যাকাউন্ট ও পরিবেশ',
      items: [
        { to: '/auth', label: user ? user.fullName : t.sidebar.auth, icon: user ? UserCheck : LogIn },
        { to: '/themes', label: t.sidebar.themes, icon: Palette },
        { to: '/daily-challenge', label: t.sidebar.dailyChallenge, icon: Target },
        { to: '/leaderboard', label: t.sidebar.leaderboard, icon: Trophy },
        { to: '/certificates', label: t.sidebar.certificates, icon: Award },
        { to: '/profile', label: t.sidebar.profile, icon: User },
        { to: '/admin', label: t.sidebar.admin, icon: Shield },
      ],
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 gap-5">
      <div className="space-y-5">
        <div className="px-2 pt-1 flex items-center justify-between">
          <BrandLogo />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg btn-secondary"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account & Student XP Strip */}
        <Link
          to="/auth"
          onClick={() => setSidebarOpen(false)}
          className="block px-3 py-2.5 rounded-xl surface-alt hover:border-[var(--border-strong)] transition-colors space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] truncate">
              {user ? user.fullName : progress.studentName}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--emerald-highlight)] text-[var(--accent)] font-semibold">
              {user?.isAdmin ? 'Admin' : user ? 'Synced' : 'Guest'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-mono-num">
              Lv.{currentLevelNumber} · {progress.xp} XP
            </span>
            <span className="flex items-center gap-1 text-[var(--accent)] font-mono-num font-semibold">
              <Flame className="w-3.5 h-3.5" />
              {progress.streakDays}d
            </span>
          </div>
        </Link>

        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-[var(--text-muted)]">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Compact Theme & Language Controls */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>{t.sidebar.theme}</span>
            </span>
            <Link to="/themes" onClick={() => setSidebarOpen(false)} className="text-[11px] text-[var(--accent)] hover:underline">
              স্টুডিও →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_LIST.map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTheme(th)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors truncate ${
                  theme === th ? 'btn-primary' : 'btn-secondary'
                }`}
                title={t.themes[th]}
              >
                {t.themes[th]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1.5">{t.sidebar.language}</div>
          <div className="grid grid-cols-3 gap-1">
            {(['bn', 'en', 'ar'] as InterfaceLang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  lang === l ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {l === 'bn' ? 'বাংলা' : l === 'en' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-transparent text-[var(--text-primary)] relative">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-e border-[var(--border-subtle)] glass-panel sticky top-0 h-screen overflow-y-auto no-print">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div className="w-72 bg-[var(--bg-surface)] border-e border-[var(--border-subtle)] h-full overflow-y-auto backdrop-blur-xl">
            {renderSidebarContent()}
          </div>
          <div
            className="flex-1 bg-black/45 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Workspace Header */}
        <header className="sticky top-0 z-30 glass-panel border-b border-[var(--border-subtle)] px-4 sm:px-8 h-16 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg btn-secondary shrink-0"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[var(--text-muted)] truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton compact />
            <NotificationCenter />
            <Link
              to="/themes"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs btn-secondary whitespace-nowrap shrink-0"
              title={t.sidebar.themes}
            >
              <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>থিম</span>
            </Link>
            <Link
              to="/ai-teacher"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-medium btn-primary whitespace-nowrap shrink-0"
            >
              {t.nav.aiTeacher}
            </Link>
          </div>
        </header>

        {/* Distinct Per-Page Atmosphere Strip */}
        <div
          className={`bg-gradient-to-r ${atmosphere.gradientClass} border-b border-[var(--border-subtle)] px-4 sm:px-8 py-2 flex items-center justify-between text-[11px] text-[var(--text-secondary)] no-print`}
        >
          <span className="font-medium">{atmosphere.badgeBn}</span>
          <span className="hidden sm:inline text-[var(--text-muted)]">
            প্রতিষ্ঠাতা: তাসীন বিল্লাহ · আল কুরআন এণ্ড ইসলামিক স্টাডিজ, কুষ্টিয়া ইবি
          </span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
