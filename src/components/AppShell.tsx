import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Home,
  LayoutDashboard,
  LogIn,
  Minimize2,
  MoreVertical,
  RefreshCw,
  Sparkles,
  UserCheck,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { InstantLookupBar } from './InstantLookupWidget';
import { NotificationCenter } from './NotificationCenter';
import { RootVariantPromptBanner } from './RootVariantPromptBanner';
import { SidebarDrawerContent } from './SidebarDrawerContent';
import { getRouteSoundEffect } from '../utils/soundEffects';
import { useOfflineManifest } from '../utils/offlineCache';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  distractionFree?: boolean;
  onExitDistractionFree?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  subtitle,
  children,
  distractionFree = false,
  onExitDistractionFree,
}) => {
  const {
    progress,
    triggerSound,
    globalGrammarEnabled,
    setGlobalGrammarEnabled,
    toggleQuickGrammar,
    isOnline,
    syncStatus,
    pendingSyncCount,
  } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const offlineManifest = useOfflineManifest();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      triggerSound(getRouteSoundEffect(location.pathname));
    }
  }, [location.pathname, triggerSound]);

  const handleGoBack = () => {
    triggerSound('click');
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
      {/* Desktop Fixed Sidebar (Hidden in Distraction-Free Reading mode) */}
      {!distractionFree && (
        <aside className="hidden lg:block w-64 shrink-0 border-e border-[var(--border-subtle)] glass-panel sticky top-0 h-screen overflow-y-auto no-print">
          <SidebarDrawerContent />
        </aside>
      )}

      {/* Mobile Drawer Overlay */}
      {!distractionFree && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div className="w-72 bg-[var(--bg-surface)] border-e border-[var(--border-subtle)] h-full overflow-y-auto backdrop-blur-2xl">
            <SidebarDrawerContent
              onNavigate={() => setSidebarOpen(false)}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
          <div
            className="flex-1 bg-black/45 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Top App Bar with Instant Lookup, Quick Grammar, Sync Status & Back Controls */}
        {!distractionFree ? (
          <header className="sticky top-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3 shadow-xs no-print">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl btn-secondary shrink-0"
                aria-label="বাম মেনু খুলুন"
                title="মেনু"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl btn-secondary text-xs font-semibold shrink-0"
                title="পূর্ববর্তী পৃষ্ঠায় ফিরুন"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="hidden sm:inline">ফিরে যান</span>
              </button>

              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl btn-secondary text-xs font-semibold shrink-0"
                title="হোমপেজে বের হয়ে যান"
              >
                <Home className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>হোম</span>
              </Link>

              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold truncate">{title}</h1>
                {subtitle && (
                  <p className="text-[11px] text-[var(--text-muted)] truncate hidden xl:block">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <InstantLookupBar compact />

              {(!isOnline || syncStatus === 'offline') && (
                <span
                  title={`অফলাইনে সংরক্ষিত: ${offlineManifest.downloadedLessonIds.length} পাঠ, ${offlineManifest.vocabularyCount} শব্দ`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/45 text-amber-700 dark:text-amber-300 text-[11px] font-extrabold shrink-0 whitespace-nowrap"
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {pendingSyncCount > 0 ? `Offline (${pendingSyncCount})` : 'Offline'}
                  </span>
                </span>
              )}

              {isOnline && syncStatus === 'syncing' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-600 dark:text-sky-300 text-[11px] font-bold shrink-0 whitespace-nowrap">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">সিঙ্কিং...</span>
                </span>
              )}

              {isOnline && syncStatus === 'synced' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shrink-0 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">সিঙ্ক হয়েছে</span>
                </span>
              )}

              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full surface-alt text-xs font-mono-num">
                <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-semibold">{progress.streakDays}d</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="font-semibold text-[var(--accent)]">{progress.xp} XP</span>
              </div>

              <button
                type="button"
                onClick={toggleQuickGrammar}
                title="দ্রুত ব্যাকরণ রেফারেন্স (Quick Grammar Reference)"
                aria-label="দ্রুত ব্যাকরণ রেফারেন্স"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold btn-secondary shrink-0 whitespace-nowrap"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">ব্যাকরণ সার</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setGlobalGrammarEnabled(!globalGrammarEnabled);
                }}
                title={globalGrammarEnabled ? 'গ্লোবাল ব্যাকরণ ও তারকিব টুল চালু (বন্ধ করতে ক্লিক করুন)' : 'গ্লোবাল ব্যাকরণ ও তারকিব টুল বন্ধ (চালু করতে ক্লিক করুন)'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
                  globalGrammarEnabled
                    ? 'bg-[var(--emerald-highlight)] text-[var(--accent)] border border-[var(--accent)]/40'
                    : 'btn-secondary text-[var(--text-muted)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">টুল</span>
              </button>

              <NotificationCenter />

              <Link
                to="/auth"
                className="hidden sm:inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full surface-alt hover:border-[var(--border-strong)] transition-colors text-xs font-semibold"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-[11px] font-bold">
                  {(user?.fullName || progress.studentName).slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[90px] truncate">
                  {user ? user.fullName : 'লগইন'}
                </span>
              </Link>
            </div>
          </header>
        ) : (
          <div className="sticky top-0 z-30 flex items-center justify-between gap-2 px-4 py-2.5 bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-subtle)] no-print">
            <span className="text-xs font-bold text-[var(--accent)] truncate">
              মনোযোগী পাঠ মোড · {title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleQuickGrammar}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold btn-secondary whitespace-nowrap"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                <span>ব্যাকরণ সার</span>
              </button>
              {onExitDistractionFree && (
                <button
                  type="button"
                  onClick={onExitDistractionFree}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold btn-primary whitespace-nowrap"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>স্বাভাবিক ভিউ (Esc)</span>
                </button>
              )}
            </div>
          </div>
        )}

        <main
          className={`flex-1 w-full mx-auto ${
            distractionFree
              ? 'px-4 py-6 sm:p-10 pb-16 max-w-4xl'
              : 'px-3 py-4 sm:p-6 lg:p-8 pb-36 lg:pb-12 max-w-[1320px]'
          }`}
        >
          {children}
        </main>
        {!distractionFree && <RootVariantPromptBanner />}
      </div>

      {/* Mobile Floating Pill Bottom Dock (Hidden in Distraction-Free Reading mode) */}
      {!distractionFree && (
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
      )}
    </div>
  );
};
