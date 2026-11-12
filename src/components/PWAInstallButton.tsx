import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { lang, triggerSound } = useApp();
  const [showGuide, setShowGuide] = useState(false);

  // Suppress if already running as installed standalone app
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    triggerSound('click');
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        triggerSound('badge');
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
          compact
            ? 'px-2.5 py-1.5 text-xs btn-secondary'
            : 'px-3.5 py-2 text-xs btn-secondary border-[var(--border-strong)]'
        }`}
        title={lang === 'bn' ? 'ফোনে অ্যাপ হিসেবে ইনস্টল করুন' : 'Install as Phone App'}
      >
        <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>{lang === 'bn' ? 'অ্যাপ ইনস্টল' : lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="surface-card w-full max-w-md rounded-2xl p-6 space-y-4 border border-[var(--border-strong)] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl surface-alt flex items-center justify-center text-[var(--accent)]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {isIOS ? 'iPhone / iPad-এ ইনস্টল করুন' : 'ফোনে ও ডেস্কটপে অ্যাপ ইনস্টল করুন'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">AI Arabic Academy (Offline PWA)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg btn-secondary"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal ps-5">
                <li>
                  Safari ব্রাউজারের নিচে বা ওপরে থাকা <strong>Share (শেয়ার)</strong> আইকনে ট্যাপ করুন।
                </li>
                <li>
                  নিচে স্ক্রল করে <strong>“Add to Home Screen”</strong> সিলেক্ট করুন।
                </li>
                <li>
                  ডানপাশে <strong>“Add”</strong> চাপলেই ফোনের হোম স্ক্রিনে অ্যাপ আইকন চলে আসবে।
                </li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal ps-5">
                <li>
                  সরাসরি ডিপ্লয়েড লিংক (Vercel / মূল ব্রাউজার ট্যাব) Chrome বা Edge-এ খুলুন।
                </li>
                <li>
                  উপরের ডানপাশের ব্রাউজার মেনু (<strong>⋮</strong>) খুলুন।
                </li>
                <li>
                  <strong>“Install app”</strong> অথবা <strong>“Add to Home screen”</strong>-এ ট্যাপ করে কনফার্ম করুন।
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-lg text-sm btn-primary"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};
