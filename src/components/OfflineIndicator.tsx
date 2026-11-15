import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CloudUpload, RefreshCw, WifiOff, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOfflineManifest } from '../utils/offlineCache';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, syncStatus, pendingSyncCount, syncNoticeBn, dismissSyncNotice, syncNow } = useApp();
  const manifest = useOfflineManifest();

  const savedLessons = manifest.downloadedLessonIds.length;
  const savedVocab = manifest.vocabularyCount;

  // 1. Offline mode banner with pending queue summary
  if (!isOnline || syncStatus === 'offline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 flex flex-wrap items-center justify-between sm:justify-start gap-2.5 rounded-2xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-amber-300/40 no-print"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <div>
            <span className="font-extrabold">অফলাইন মোড (Offline)</span>
            <span className="ms-1.5 font-normal text-amber-100">
              {pendingSyncCount > 0
                ? `· ${pendingSyncCount}টি অগ্রগতি অপেক্ষমাণ (অনলাইন হলেই সার্ভারে যাবে)`
                : savedLessons > 0 || savedVocab > 0
                ? `(${savedLessons} পাঠ · ${savedVocab} শব্দ সংরক্ষিত)`
                : '(সংরক্ষিত পাঠ, কুরআন ও গর্দান চালু আছে)'}
            </span>
          </div>
        </div>

        {savedVocab > 0 && (
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>অফলাইন শব্দ পড়ুন</span>
          </Link>
        )}
      </div>
    );
  }

  // 2. Actively syncing queued offline progress
  if (syncStatus === 'syncing') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 inline-flex items-center gap-2 rounded-2xl bg-sky-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white shadow-xl border border-sky-300/40 no-print"
      >
        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
        <span>অফলাইনে করা অগ্রগতি সার্ভারে সিঙ্ক হচ্ছে...</span>
      </div>
    );
  }

  // 3. Pending manual retry prompt if connectivity returned with queued updates
  if (syncStatus === 'pending' && pendingSyncCount > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white shadow-xl border border-indigo-300/40 no-print"
      >
        <CloudUpload className="w-4 h-4 shrink-0" />
        <span>{pendingSyncCount}টি অফলাইন পরিবর্তন সিঙ্কের জন্য প্রস্তুত</span>
        <button
          type="button"
          onClick={() => void syncNow()}
          className="px-2.5 py-1 rounded-full bg-white text-indigo-900 text-[11px] font-extrabold hover:bg-indigo-50"
        >
          এখনই সিঙ্ক করুন
        </button>
      </div>
    );
  }

  // 4. Synced confirmation notice after pushing offline progress to server
  if (syncStatus === 'synced' || syncNoticeBn) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white shadow-xl border border-emerald-300/40 no-print"
      >
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>{syncNoticeBn || 'অফলাইনে করা অগ্রগতি সার্ভারে সিঙ্ক হয়েছে!'}</span>
        <button
          type="button"
          onClick={dismissSyncNotice}
          className="p-0.5 rounded-full hover:bg-white/20"
          aria-label="বার্তা বন্ধ করুন"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};
