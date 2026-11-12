import React, { useEffect, useRef, useState } from 'react';
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
  Compass,
  Flame,
  GraduationCap,
  Headphones,
  Home,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogIn,
  Menu,
  Mic,
  Moon,
  Palette,
  ScrollText,
  Shield,
  Sparkles,
  Sun,
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

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      triggerSound(getRouteSoundEffect(location.pathname));
    }
  }, [location.pathname, triggerSound]);

  const isDarkTheme = !['sky-cloud', 'light', 'parchment'].includes(theme);

  const navGroups = [
    ...(user
      ? [
          {
            label: 'আমার অ্যাকাউন্ট',
            items: [
              { to: '/dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
              { to: '/leaderboard', label: t.sidebar.leaderboard, icon: Trophy },
              { to: '/certificates', label: t.sidebar.certificates, icon: Award },
            ],
          },
        ]
      : []),
    {
      label: 'ধাপে ধাপে শিক্ষা (Step 1 → 4)',
      items: [
        { to: '/courses/beginners', label: `১. ${t.sidebar.beginners}`, icon: Compass },
        { to: '/courses', label: `২. ${t.sidebar.courses}`, icon: BookOpen },
        { to: '/daily-lessons', label: `৩. ${t.sidebar.dailyLessons}`, icon: ListChecks },
        { to: '/bayna-yadayk', label: `৪. ${t.sidebar.baynaYadayk}`, icon: BookMarked },
        { to: '/safwatul-masadir', label: `৫. ${t.sidebar.safwatulMasadir}`, icon: BookOpenCheck },
        { to: '/grammar', label: `৬. ${t.sidebar.grammar}`, icon: GraduationCap },
        { to: '/quranic-arabic', label: `৭. ${t.sidebar.quranic}`, icon: ScrollText },
        { to: '/vocabulary', label: `৮. ${t.sidebar.vocabulary}`, icon: Layers },
      ],
    },
    {
      label: 'অনুশীলন ও AI ভয়েস (Step 5 → 6)',
      items: [
        { to: '/ai-teacher', label: t.sidebar.aiTeacher, icon: Bot },
        { to: '/listening', label: t.sidebar.listening, icon: Headphones },
        { to: '/speaking', label: t.sidebar.speaking, icon: Mic },
        { to: '/quiz', label: t.sidebar.quiz, icon: ClipboardCheck },
        { to: '/practice', label: t.sidebar.practice, icon: Sparkles },
        { to: '/daily-challenge', label: t.sidebar.dailyChallenge, icon: Target },
      ],
    },
    {
      label: 'সহায়ক ও সেটিংস',
      items: [
        { to: '/prayer-weather', label: t.sidebar.prayerWeather, icon: Clock },
        { to: '/themes', label: t.sidebar.themes, icon: Palette },
        { to: '/profile', label: t.sidebar.profile, icon: User },
        { to: '/auth', label: user ? user.fullName : 'Gmail লগইন / অ্যাকাউন্ট', icon: user ? UserCheck : LogIn },
        ...(user?.isAdmin ? [{ to: '/admin', label: t.sidebar.admin, icon: Shield }] : []),
      ],
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 gap-5">
      <div className="space-y-4">
        <div className="px-2 pt-1 flex items-center justify-between">
          <BrandLogo />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl btn-secondary"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Workspace Switcher Pill (Prodex style) */}
        <Link
          to="/auth"
          onClick={() => setSidebarOpen(false)}
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

        {/* Grouped Navigation */}
        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold tracking-wider text-[var(--text-muted)]">
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-sm'
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

      {/* Bottom Clean Toggle + Founder Badge (Prodex Sidebar Footer style) */}
      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl surface-alt">
          <span className="text-xs font-medium inline-flex items-center gap-2">
            {isDarkTheme ? <Moon className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />}
            <span>{isDarkTheme ? 'ডার্ক মোড' : 'লাইট মোড'}</span>
          </span>
          <button
            type="button"
            onClick={() => setTheme(isDarkTheme ? 'sky-cloud' : 'andalus')}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold btn-primary"
          >
            বদলান
          </button>
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
            onClick={() => setSidebarOpen(false)}
            className="mt-1 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] btn-primary"
          >
            <Palette className="w-3 h-3" />
            <span>থিম স্টুডিও ({t.themes[theme]})</span>
          </Link>
        </div>
      </div>
    </div>
  );

  const mobileDockItems: { to: string; label: string; icon: typeof Home; highlight?: boolean }[] = [
    { to: '/', label: 'হোম', icon: Home },
    user
      ? { to: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard }
      : { to: '/courses', label: 'পাঠ্যক্রম', icon: BookOpen },
    { to: '/ai-teacher', label: 'AI রোবট', icon: Sparkles, highlight: true },
    { to: '/prayer-weather', label: 'নামাজ', icon: Clock },
    { to: '/auth', label: user ? 'অ্যাকাউন্ট' : 'লগইন', icon: user ? UserCheck : LogIn },
  ];

  return (
    <div className="min-h-screen flex bg-transparent text-[var(--text-primary)] relative">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-e border-[var(--border-subtle)] glass-panel sticky top-0 h-screen overflow-y-auto no-print">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div className="w-72 bg-[var(--bg-surface)] border-e border-[var(--border-subtle)] h-full overflow-y-auto backdrop-blur-2xl">
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
        {/* Clean Top App Bar (Prodex style) */}
        <header className="sticky top-0 z-30 glass-panel border-b border-[var(--border-subtle)] px-4 sm:px-8 h-16 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl btn-secondary shrink-0"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold truncate">{title}</h1>
              {subtitle && (
                <p className="text-[11px] text-[var(--text-muted)] truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full surface-alt text-xs font-mono-num">
              <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="font-semibold">{progress.streakDays}d</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="font-semibold text-[var(--accent)]">{progress.xp} XP</span>
            </div>

            <PWAInstallButton compact />
            <NotificationCenter />

            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full surface-alt hover:border-[var(--border-strong)] transition-colors text-xs font-semibold"
            >
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-[11px] font-bold">
                {(user?.fullName || progress.studentName).slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[96px] truncate">
                {user ? user.fullName : 'লগইন'}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1260px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Floating Pill Bottom Dock (Image 2 style) */}
      <nav
        aria-label="Mobile Quick Dock"
        className="lg:hidden fixed bottom-3 inset-x-4 z-40 glass-panel rounded-full px-2 py-1.5 shadow-xl border border-[var(--border-strong)] flex items-center justify-around no-print"
      >
        {mobileDockItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center min-w-[48px] py-1 px-2 rounded-full transition-all ${
                item.highlight
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] w-11 h-11 shadow-md -my-1'
                  : active
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className={item.highlight ? 'w-5 h-5' : 'w-4 h-4'} />
              {!item.highlight && <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
