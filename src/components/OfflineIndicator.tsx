import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, WifiOff } from 'lucide-react';
import { useOfflineManifest, useOnlineStatus } from '../utils/offlineCache';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const manifest = useOfflineManifest();

  if (isOnline) return null;

  const savedLessons = manifest.downloadedLessonIds.length;
  const savedVocab = manifest.vocabularyCount;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-40 flex flex-wrap items-center justify-between sm:justify-start gap-2.5 rounded-2xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-amber-300/40"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <div>
          <span className="font-extrabold">Offline Mode · অফলাইন মোড</span>
          <span className="ms-1.5 font-normal text-amber-100">
            {savedLessons > 0 || savedVocab > 0
              ? `(${savedLessons} পাঠ · ${savedVocab} শব্দ সংরক্ষিত)`
              : '(সংরক্ষিত পাঠ, কুরআন ও গর্দান চালু আছে)'}
          </span>
        </div>
      </div>

      {savedVocab > 0 && (
        <Link
          to="/vocabulary"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>অফলাইন শব্দ পড়ুন</span>
        </Link>
      )}
    </div>
  );
};
