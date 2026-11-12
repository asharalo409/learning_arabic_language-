import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Download, LogIn, Palette, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { speakText } from '../utils/speech';

export const WelcomeOverlay: React.FC = () => {
  const {
    welcomeOpen,
    dismissWelcome,
    progress,
    soundEnabled,
    setSoundEnabled,
    triggerSound,
    enableBrowserNotifications,
    browserNotifPermission,
  } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [playedGreeting, setPlayedGreeting] = useState(false);

  useEffect(() => {
    if (!welcomeOpen) return;
    const ok = triggerSound('welcome');
    if (ok) setPlayedGreeting(true);
  }, [welcomeOpen, triggerSound]);

  if (!welcomeOpen) return null;

  const displayName = user?.fullName || progress.studentName || 'প্রিয় শিক্ষার্থী';

  const handlePlayWelcomeGreeting = () => {
    triggerSound('welcome', true);
    setPlayedGreeting(true);
    speakText('السَّلَامُ عَلَيْكُمْ وَأَهْلًا بِكُمْ فِي أَكَادِيمِيَّةِ العَرَبِيَّةِ', 'ar-SA', { rate: 0.92 });
  };

  const handleEnterAcademy = (targetPath?: string) => {
    if (!playedGreeting) {
      triggerSound('welcome', true);
    } else {
      triggerSound('success', true);
    }
    dismissWelcome();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4 no-print overflow-y-auto">
      <div className="surface-card border border-[var(--border-strong)] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={() => handleEnterAcademy()}
          className="absolute top-4 right-4 p-2 rounded-xl btn-secondary"
          aria-label="Close Welcome"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Radiant Arabic Salam Header */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--emerald-highlight)] border border-[var(--border-strong)] text-xs font-semibold text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>আহলান ওয়া সাহলান · AI Arabic Academy</span>
          </div>

          <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)] leading-relaxed pt-1" dir="rtl">
            السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            স্বাগতম, {displayName}!
          </h2>
        </div>

        {/* Dedicated Founder Welcome Card */}
        <div className="surface-alt rounded-2xl p-4 sm:p-5 border border-[var(--border-strong)] space-y-2 text-center">
          <p className="text-xs font-semibold text-[var(--accent)]">
            প্রতিষ্ঠাতার পক্ষ থেকে আন্তরিক স্বাগতম
          </p>
          <p className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
            তাসীন বিল্লাহ
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            আল কুরআন এণ্ড ইসলামিক স্টাডিজ বিভাগ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়
          </p>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
            “কুরআন ও সুন্নাহর ভাষা আরবিকে সহজ, সুন্দর ও আধুনিক প্রযুক্তিতে সবার কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য। প্রতিটি পৃষ্ঠা আলাদা পরিবেশে সাজানো — মন ভরে শিখুন!”
          </p>
        </div>

        {/* Audio & Interactive Experience Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handlePlayWelcomeGreeting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary border-[var(--border-strong)]"
          >
            <Volume2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>স্বাগতম সাউন্ড ও সালাম শুনুন</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs btn-secondary"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>সাউন্ড: চালু</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>সাউন্ড: বন্ধ</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Setup Actions: Account Login, Live Themes, Notification & PWA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleEnterAcademy('/auth')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary"
          >
            <LogIn className="w-4 h-4 text-[var(--accent)]" />
            <span>{user ? 'আমার অ্যাকাউন্ট ও ড্যাশবোর্ড' : 'Gmail দিয়ে লগইন / অ্যাকাউন্ট'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleEnterAcademy('/themes')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary"
          >
            <Palette className="w-4 h-4 text-[var(--accent)]" />
            <span>জীবন্ত থিম ও বুদবুদ স্টুডিও</span>
          </button>

          {browserNotifPermission !== 'granted' && browserNotifPermission !== 'unsupported' && (
            <button
              type="button"
              onClick={() => void enableBrowserNotifications()}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs btn-secondary"
            >
              <Bell className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>দৈনিক নোটিফিকেশন চালু করুন</span>
            </button>
          )}

          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs btn-secondary"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>ফোনে অ্যাপ ইনস্টল করুন</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleEnterAcademy()}
          className="w-full py-3.5 rounded-2xl text-sm font-bold btn-primary flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="font-arabic text-base">بِسْمِ اللَّهِ</span>
          <span>— একাডেমিতে প্রবেশ করুন</span>
        </button>
      </div>
    </div>
  );
};
