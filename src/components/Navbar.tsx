import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterfaceLang, ThemeMode } from '../types/academy';

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
        <path
          d="M16 7L24 16L16 25L8 16L16 7Z"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
        <circle cx="16" cy="16" r="3" fill="var(--accent)" />
      </svg>
      <span>{t.brandName}</span>
    </Link>
  );
};

export const Navbar: React.FC = () => {
  const { t, theme, setTheme, lang, setLang } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-[var(--border-subtle)] no-print">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <BrandLogo />

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
          <Link to="/courses" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
            {t.nav.courses}
          </Link>
          <Link to="/ai-teacher" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
            {t.nav.aiTeacher}
          </Link>
          <Link to="/practice" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
            {t.nav.practice}
          </Link>
          <Link to="/quranic-arabic" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
            {t.nav.quranic}
          </Link>
          <Link to="/dashboard" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0">
            {t.nav.dashboard}
          </Link>
        </nav>

        {/* Zone 3: 1 primary CTA button (+ mobile toggle on small viewports) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/courses/beginners"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm btn-primary whitespace-nowrap shrink-0"
          >
            {t.nav.startLearning}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
            className="md:hidden p-2 rounded-lg btn-secondary"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 space-y-4">
          <div className="flex flex-col gap-2 text-sm font-medium">
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-[var(--bg-surface-alt)]">
              {t.nav.courses}
            </Link>
            <Link to="/ai-teacher" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-[var(--bg-surface-alt)]">
              {t.nav.aiTeacher}
            </Link>
            <Link to="/practice" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-[var(--bg-surface-alt)]">
              {t.nav.practice}
            </Link>
            <Link to="/quranic-arabic" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-[var(--bg-surface-alt)]">
              {t.nav.quranic}
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-[var(--bg-surface-alt)]">
              {t.nav.dashboard}
            </Link>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-muted)]">{t.sidebar.language}</span>
              <div className="flex items-center gap-1">
                {(['bn', 'en', 'ar'] as InterfaceLang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      lang === l ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {l === 'bn' ? 'বাংলা' : l === 'en' ? 'EN' : 'عربي'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-muted)]">{t.sidebar.theme}</span>
              <div className="flex items-center gap-1">
                {(['emerald', 'midnight', 'light'] as ThemeMode[]).map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setTheme(th)}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      theme === th ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {th === 'emerald' ? 'Emerald' : th === 'midnight' ? 'Midnight' : 'Light'}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/courses/beginners"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm btn-primary"
            >
              {t.nav.startLearning}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
