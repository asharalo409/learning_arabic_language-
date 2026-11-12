import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bot,
  Compass,
  Flame,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Layers,
  ListChecks,
  Menu,
  Mic,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  X,
  ClipboardCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './Navbar';
import { InterfaceLang, ThemeMode } from '../types/academy';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, subtitle, children }) => {
  const { t, theme, setTheme, lang, setLang, progress, currentLevelNumber } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      label: 'Academy',
      items: [
        { to: '/daily-challenge', label: t.sidebar.dailyChallenge, icon: Target },
        { to: '/leaderboard', label: t.sidebar.leaderboard, icon: Trophy },
        { to: '/certificates', label: t.sidebar.certificates, icon: Award },
        { to: '/profile', label: t.sidebar.profile, icon: User },
        { to: '/admin', label: t.sidebar.admin, icon: Shield },
      ],
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 gap-6">
      <div className="space-y-6">
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

        {/* Compact Student Telemetry Strip */}
        <div className="px-3 py-2.5 rounded-xl surface-alt flex items-center justify-between text-xs">
          <div>
            <span className="text-[var(--text-muted)] block">{t.common.level} {currentLevelNumber}</span>
            <span className="font-semibold font-mono-num text-[var(--text-primary)]">{progress.xp} {t.common.xp}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--accent)] font-mono-num font-semibold">
            <Flame className="w-4 h-4" />
            <span>{progress.streakDays} {t.common.days}</span>
          </div>
        </div>

        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-xs font-medium text-[var(--text-muted)]">
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold'
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

      {/* Theme & Language Preferences */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>{t.sidebar.theme}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['emerald', 'midnight', 'light'] as ThemeMode[]).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTheme(th)}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  theme === th ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {th === 'emerald' ? 'Emerald' : th === 'midnight' ? 'Navy' : 'Light'}
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
                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
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
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-e border-[var(--border-subtle)] bg-[var(--bg-surface)] sticky top-0 h-screen overflow-y-auto no-print">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div className="w-72 bg-[var(--bg-surface)] border-e border-[var(--border-subtle)] h-full overflow-y-auto">
            {renderSidebarContent()}
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-xs"
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
            <Link
              to="/ai-teacher"
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium btn-primary whitespace-nowrap shrink-0"
            >
              {t.nav.aiTeacher}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
