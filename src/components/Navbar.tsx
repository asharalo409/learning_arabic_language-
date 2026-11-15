import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Clock, LogIn, MoreVertical, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { InstantLookupBar } from './InstantLookupWidget';
import { NotificationCenter } from './NotificationCenter';
import { SidebarDrawerContent } from './SidebarDrawerContent';

export const BrandLogo: React.FC = () => {
  const { t } = useApp();
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="3" y="3" width="26" height="26" rx="6" stroke="var(--accent)" strokeWidth="1.75" />
        <path d="M16 7L24 16L16 25L8 16L16 7Z" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="3" fill="var(--accent)" />
      </svg>
      <span>{t.brandName}</span>
    </Link>
  );
};

export const Navbar: React.FC = () => {
  const { t, toggleQuickGrammar } = useApp();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-[var(--border-subtle)] no-print">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: Direct 3-dot Menu Trigger + BrandLogo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="মেনু খুলুন"
              title="মেনু ও সেটিংস"
              className="p-2 rounded-xl btn-secondary text-[var(--text-primary)] hover:text-[var(--accent)] shrink-0"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <BrandLogo />
          </div>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[var(--text-secondary)]">
            <Link to="/courses" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
              {t.nav.courses}
            </Link>
            <Link to="/quranic-arabic" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
              কুরআনিক আরবি
            </Link>
            <Link to="/ai-teacher" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
              {t.nav.aiTeacher}
            </Link>
            <Link to="/prayer-weather" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{t.sidebar.prayerWeather}</span>
            </Link>
            {user && (
              <Link to="/dashboard" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
                {t.nav.dashboard}
              </Link>
            )}
          </nav>

          {/* Right: Instant Lookup + Quick Grammar Reference + Notifications + Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <InstantLookupBar compact />

            <button
              type="button"
              onClick={toggleQuickGrammar}
              title="দ্রুত আরবি ব্যাকরণ রেফারেন্স (Quick Grammar Reference)"
              aria-label="দ্রুত ব্যাকরণ রেফারেন্স"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold btn-secondary whitespace-nowrap shrink-0"
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden xl:inline">দ্রুত ব্যাকরণ</span>
            </button>

            <NotificationCenter />

            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs btn-secondary whitespace-nowrap shrink-0"
            >
              {user ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span className="max-w-[110px] truncate">{user.fullName}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{t.sidebar.auth}</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Unified Left-Side Slide-in Navigation Drawer (matches inner AppShell sidebar) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex no-print">
          <aside className="w-72 max-w-[84vw] bg-[var(--bg-surface)] border-e border-[var(--border-subtle)] h-full overflow-y-auto shadow-2xl backdrop-blur-2xl">
            <SidebarDrawerContent
              onNavigate={() => setDrawerOpen(false)}
              onClose={() => setDrawerOpen(false)}
              showCloseOnDesktop
            />
          </aside>
          <div
            className="flex-1 bg-black/45 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
        </div>
      )}
    </>
  );
};
