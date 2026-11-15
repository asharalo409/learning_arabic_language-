import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, BookOpen, Flame, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SESSION_SNOOZE_KEY = 'aaa_inactivity_snoozed_v1';
const INACTIVITY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const InactivityReminderModal: React.FC = () => {
  const { lastPracticeIso, progress, welcomeOpen, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [hoursElapsed, setHoursElapsed] = useState(0);

  useEffect(() => {
    if (welcomeOpen) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_SNOOZE_KEY) === '1') {
      setOpen(false);
      return;
    }

    const lastMs = Date.parse(lastPracticeIso);
    if (Number.isNaN(lastMs)) return;

    const diffMs = Date.now() - lastMs;
    if (diffMs < INACTIVITY_THRESHOLD_MS) {
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setHoursElapsed(Math.max(24, Math.floor((Date.now() - lastMs) / (1000 * 60 * 60))));
      setOpen(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [lastPracticeIso, welcomeOpen]);

  const handleDismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_SNOOZE_KEY, '1');
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  const daysElapsed = Math.floor(hoursElapsed / 24);
  const isBn = lang !== 'en';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-reminder-title"
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150 print:hidden"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl surface-card border border-[var(--border-strong)] p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-300">
                {isBn
                  ? daysElapsed >= 2
                    ? `গত ${daysElapsed} দিন ধরে বিরতি`
                    : `গত ${hoursElapsed} ঘণ্টা চর্চা হয়নি`
                  : `${hoursElapsed}h since last practice`}
              </div>
              <h3 id="inactivity-reminder-title" className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                {isBn ? 'আজকের আরবি পাঠ কি মিস হয়ে যাচ্ছে?' : 'Ready for today’s Arabic lesson?'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {isBn
            ? `আসসালামু আলাইকুম, ${progress.studentName}! ২৪ ঘণ্টার বেশি সময় ধরে কোনো দৈনিক আরবি পাঠ চর্চা করা হয়নি। মাত্র ৫–১০ মিনিটের অনুশীলনে আপনার ${progress.streakDays} দিনের ধারাবাহিকতা অটুট রাখুন।`
            : `Assalamu Alaikum! It has been over 24 hours since your last Arabic lesson. Practice for just 5 minutes to protect your ${progress.streakDays}-day streak.`}
        </p>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-300">
            <Flame className="w-3.5 h-3.5" />
            <span>স্ট্রিক: {progress.streakDays} দিন</span>
          </span>
          <span className="font-mono-num">লক্ষ্য: {progress.dailyTargetMinutes} মি./দিন</span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2 rounded-full text-xs font-semibold btn-secondary"
          >
            {isBn ? 'পরে মনে করান' : 'Remind me later'}
          </button>
          <Link
            to="/daily-challenge"
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold btn-secondary text-[var(--accent)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'দৈনিক চ্যালেঞ্জ' : 'Daily Challenge'}</span>
          </Link>
          <Link
            to="/courses"
            onClick={handleDismiss}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold btn-primary shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isBn ? 'আজকের পাঠ শুরু করুন' : 'Start Today’s Lesson'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
