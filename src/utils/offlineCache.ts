import { useEffect, useState } from 'react';
import { ChapterInfo, DetailedLesson, VocabItem } from '../types/academy';

const OFFLINE_CACHE_BUCKET = 'aaa-offline-study-v1';
const OFFLINE_MANIFEST_KEY = 'aaa_offline_manifest_v1';

export interface OfflineManifest {
  downloadedLessonIds: string[];
  lessonSnapshots: Record<string, DetailedLesson>;
  vocabularySavedAt: string | null;
  vocabularyCount: number;
  vocabSnapshot: VocabItem[] | null;
  updatedAt: string;
}

const DEFAULT_MANIFEST: OfflineManifest = {
  downloadedLessonIds: [],
  lessonSnapshots: {},
  vocabularySavedAt: null,
  vocabularyCount: 0,
  vocabSnapshot: null,
  updatedAt: '',
};

const listeners = new Set<() => void>();
let cachedManifest: OfflineManifest | null = null;

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function getOfflineManifest(): OfflineManifest {
  if (cachedManifest) return cachedManifest;
  if (typeof window === 'undefined') return DEFAULT_MANIFEST;
  try {
    const raw = localStorage.getItem(OFFLINE_MANIFEST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OfflineManifest>;
      cachedManifest = {
        downloadedLessonIds: Array.isArray(parsed.downloadedLessonIds) ? parsed.downloadedLessonIds : [],
        lessonSnapshots: parsed.lessonSnapshots || {},
        vocabularySavedAt: parsed.vocabularySavedAt || null,
        vocabularyCount: Number(parsed.vocabularyCount) || 0,
        vocabSnapshot: Array.isArray(parsed.vocabSnapshot) ? parsed.vocabSnapshot : null,
        updatedAt: parsed.updatedAt || '',
      };
      return cachedManifest;
    }
  } catch {
    // ignore storage errors
  }
  cachedManifest = { ...DEFAULT_MANIFEST };
  return cachedManifest;
}

function persistManifest(next: OfflineManifest): void {
  cachedManifest = next;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(OFFLINE_MANIFEST_KEY, JSON.stringify(next));
    } catch {
      // If quota exceeded due to large snapshots, keep IDs/counts cleanly
      try {
        const slim: OfflineManifest = {
          downloadedLessonIds: next.downloadedLessonIds,
          lessonSnapshots: {},
          vocabularySavedAt: next.vocabularySavedAt,
          vocabularyCount: next.vocabularyCount,
          vocabSnapshot: null,
          updatedAt: next.updatedAt,
        };
        localStorage.setItem(OFFLINE_MANIFEST_KEY, JSON.stringify(slim));
      } catch {
        // ignore
      }
    }
  }
  notifyListeners();
}

export function subscribeOfflineManifest(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineManifest(): OfflineManifest {
  const [manifest, setManifest] = useState<OfflineManifest>(() => getOfflineManifest());

  useEffect(() => {
    return subscribeOfflineManifest(() => {
      setManifest({ ...getOfflineManifest() });
    });
  }, []);

  return manifest;
}

async function writeToCacheBucket(path: string, payload: unknown): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await window.caches.open(OFFLINE_CACHE_BUCKET);
    const res = new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Offline-Cached-At': new Date().toISOString(),
      },
    });
    await cache.put(path, res);
  } catch {
    // ignore Cache API restrictions
  }
}

async function removeFromCacheBucket(path: string): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await window.caches.open(OFFLINE_CACHE_BUCKET);
    await cache.delete(path);
  } catch {
    // ignore
  }
}

export async function saveLessonOffline(lesson: DetailedLesson): Promise<void> {
  await writeToCacheBucket(`/__offline/lessons/${lesson.id}.json`, lesson);
  const current = getOfflineManifest();
  const nextIds = current.downloadedLessonIds.includes(lesson.id)
    ? current.downloadedLessonIds
    : [...current.downloadedLessonIds, lesson.id];

  persistManifest({
    ...current,
    downloadedLessonIds: nextIds,
    lessonSnapshots: {
      ...current.lessonSnapshots,
      [lesson.id]: lesson,
    },
    updatedAt: new Date().toISOString(),
  });
}

export async function saveChapterOffline(
  chapter: ChapterInfo,
  lessons: DetailedLesson[]
): Promise<void> {
  const current = getOfflineManifest();
  const nextIds = new Set(current.downloadedLessonIds);
  const nextSnapshots = { ...current.lessonSnapshots };

  for (const l of lessons) {
    await writeToCacheBucket(`/__offline/lessons/${l.id}.json`, l);
    nextIds.add(l.id);
    nextSnapshots[l.id] = l;
  }

  await writeToCacheBucket(`/__offline/chapters/${chapter.chapterNumber}.json`, chapter);

  persistManifest({
    ...current,
    downloadedLessonIds: Array.from(nextIds),
    lessonSnapshots: nextSnapshots,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeLessonOffline(lessonId: string): Promise<void> {
  await removeFromCacheBucket(`/__offline/lessons/${lessonId}.json`);
  const current = getOfflineManifest();
  const nextSnapshots = { ...current.lessonSnapshots };
  delete nextSnapshots[lessonId];

  persistManifest({
    ...current,
    downloadedLessonIds: current.downloadedLessonIds.filter((id) => id !== lessonId),
    lessonSnapshots: nextSnapshots,
    updatedAt: new Date().toISOString(),
  });
}

export function isLessonSavedOffline(lessonId: string): boolean {
  return getOfflineManifest().downloadedLessonIds.includes(lessonId);
}

export function getOfflineLesson(lessonId: string): DetailedLesson | null {
  return getOfflineManifest().lessonSnapshots[lessonId] || null;
}

export async function saveAllVocabularyOffline(items: VocabItem[]): Promise<void> {
  await writeToCacheBucket('/__offline/vocabulary/all.json', items);
  const current = getOfflineManifest();
  persistManifest({
    ...current,
    vocabularySavedAt: new Date().toISOString(),
    vocabularyCount: items.length,
    vocabSnapshot: items,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeVocabularyOffline(): Promise<void> {
  await removeFromCacheBucket('/__offline/vocabulary/all.json');
  const current = getOfflineManifest();
  persistManifest({
    ...current,
    vocabularySavedAt: null,
    vocabularyCount: 0,
    vocabSnapshot: null,
    updatedAt: new Date().toISOString(),
  });
}

export async function readOfflineVocabularyFromCache(): Promise<VocabItem[] | null> {
  const manifest = getOfflineManifest();
  if (manifest.vocabSnapshot && manifest.vocabSnapshot.length > 0) {
    return manifest.vocabSnapshot;
  }
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    const cache = await window.caches.open(OFFLINE_CACHE_BUCKET);
    const match = await cache.match('/__offline/vocabulary/all.json');
    if (match) {
      return (await match.json()) as VocabItem[];
    }
  } catch {
    // ignore
  }
  return null;
}
