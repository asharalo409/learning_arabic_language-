import { matchNahwTipForToken } from '../data/nahwQuickTips';
import {
  CurriculumLevelNumber,
  DetailedLesson,
  VocabItem,
  VocabProgressRecord,
} from '../types/academy';
import {
  cleanPunctuation,
  isArabicWordToken,
  lookupTokenInGlossary,
  normalizeArabicTokenKey,
} from './lessonVocabDedupe';

export interface ReadingSegmentInput {
  arabic: string;
  translationBn?: string;
  translationEn?: string;
  sourceLabelBn?: string;
  chapterNumber?: number;
  level?: CurriculumLevelNumber;
  isQuranic?: boolean;
  explicitVocab?: VocabItem[];
}

function stableSlug(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Builds the canonical set of Arabic word keys already registered or learned
 * in the user's vocabulary bank and SRS review progress.
 */
export function buildKnownArabicWordKeySet(
  existingVocab: VocabItem[],
  vocabProgress: Record<string, VocabProgressRecord>
): Set<string> {
  const known = new Set<string>();
  const idToKey = new Map<string, string>();

  for (const item of existingVocab) {
    const k = normalizeArabicTokenKey(item.arabic);
    if (k) {
      known.add(k);
      idToKey.set(item.id, k);
    }
  }

  // Also ensure any explicitly learned/reviewed word IDs are never duplicated
  for (const recId of Object.keys(vocabProgress || {})) {
    known.add(recId);
    const mappedKey = idToKey.get(recId);
    if (mappedKey) known.add(mappedKey);
  }

  return known;
}

/**
 * Parses new reading segments or lessons and extracts ONLY missing Arabic words
 * not already present in the user's vocabulary bank or learned history.
 */
export function extractMissingWordsFromSegments(
  segments: ReadingSegmentInput[],
  existingVocab: VocabItem[],
  vocabProgress: Record<string, VocabProgressRecord>,
  maxNewWordsPerBatch = 35
): VocabItem[] {
  if (!segments || segments.length === 0) return [];

  const knownKeys = buildKnownArabicWordKeySet(existingVocab, vocabProgress);
  const existingIds = new Set(existingVocab.map((v) => v.id));
  const newlyExtracted: VocabItem[] = [];

  const registerCandidate = (candidate: VocabItem, canonicalOverride?: string) => {
    if (newlyExtracted.length >= maxNewWordsPerBatch) return;
    const normKey = canonicalOverride || normalizeArabicTokenKey(candidate.arabic);
    if (!normKey || normKey.length < 2) return;
    if (knownKeys.has(normKey) || existingIds.has(candidate.id) || knownKeys.has(candidate.id)) {
      return;
    }

    knownKeys.add(normKey);
    existingIds.add(candidate.id);
    newlyExtracted.push(candidate);
  };

  for (const seg of segments) {
    if (newlyExtracted.length >= maxNewWordsPerBatch) break;

    const derivedLevel: CurriculumLevelNumber | undefined =
      seg.level ||
      (seg.chapterNumber
        ? ((Math.min(6, Math.max(1, Math.ceil(seg.chapterNumber / 17))) as CurriculumLevelNumber) || 1)
        : undefined);

    // 1. First inspect explicit vocabulary attached to the lesson segment
    if (seg.explicitVocab && seg.explicitVocab.length > 0) {
      for (const v of seg.explicitVocab) {
        const gloss = lookupTokenInGlossary(v.arabic);
        const normKey = gloss?.canonicalKey || normalizeArabicTokenKey(v.arabic);
        registerCandidate(
          {
            ...v,
            chapterNumber: v.chapterNumber ?? seg.chapterNumber,
            level: v.level ?? derivedLevel,
            isQuranic: v.isQuranic ?? seg.isQuranic,
          },
          normKey
        );
      }
    }

    // 2. Parse every Arabic word in the reading segment
    if (!seg.arabic || !seg.arabic.trim()) continue;
    const tokens = seg.arabic.split(/\s+/).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      if (newlyExtracted.length >= maxNewWordsPerBatch) break;
      const rawTok = tokens[i];
      if (!isArabicWordToken(rawTok)) continue;

      const cleanTok = cleanPunctuation(rawTok);
      const rawNormKey = normalizeArabicTokenKey(cleanTok);
      if (!rawNormKey || rawNormKey.length < 2) continue;

      const glossaryHit = lookupTokenInGlossary(rawTok);
      const canonicalKey = glossaryHit?.canonicalKey || rawNormKey;
      if (knownKeys.has(canonicalKey) || knownKeys.has(rawNormKey)) {
        continue;
      }

      if (glossaryHit) {
        const autoId = `auto-v-${stableSlug(canonicalKey)}`;
        registerCandidate(
          {
            id: autoId,
            arabic: glossaryHit.arabic || cleanTok,
            pronunciationBn: glossaryHit.pronunciationBn,
            meaningBn: glossaryHit.meaningBn,
            meaningEn: glossaryHit.meaningEn,
            category: seg.sourceLabelBn || glossaryHit.category || 'পাঠ থেকে স্বয়ংক্রিয় সংগৃহীত',
            root: glossaryHit.root,
            exampleAr: glossaryHit.exampleAr || seg.arabic,
            exampleBn: glossaryHit.exampleBn || seg.translationBn || `${glossaryHit.meaningBn}`,
            exampleEn: glossaryHit.exampleEn || seg.translationEn || glossaryHit.meaningEn,
            chapterNumber: seg.chapterNumber,
            level: derivedLevel,
            chapterTitleBn: seg.sourceLabelBn,
            isQuranic: seg.isQuranic,
          },
          canonicalKey
        );
        continue;
      }

      // 3. Morphological Nahw/Sarf fallback for authentic words not in static dictionary
      const tip = matchNahwTipForToken(rawTok, tokens[i - 1], tokens[i + 1], seg.arabic, i);
      if (tip) {
        const autoId = `auto-v-${stableSlug(rawNormKey)}`;
        const shortCategory = tip.categoryBn.split('·')[0].trim();
        registerCandidate(
          {
            id: autoId,
            arabic: cleanTok,
            pronunciationBn: cleanTok,
            meaningBn: tip.meaningBn || tip.titleBn || shortCategory,
            meaningEn: tip.tarkibRoleBn || shortCategory,
            category: seg.sourceLabelBn || `পাঠ থেকে সংগৃহীত (${shortCategory})`,
            root: tip.rootOrFormBn || tip.tarkibRoleBn,
            exampleAr: seg.arabic,
            exampleBn: seg.translationBn || tip.ruleBn,
            exampleEn: seg.translationEn || tip.exampleBn,
            chapterNumber: seg.chapterNumber,
            level: derivedLevel,
            chapterTitleBn: seg.sourceLabelBn,
            isQuranic: seg.isQuranic,
          },
          rawNormKey
        );
      }
    }
  }

  return newlyExtracted;
}

/**
 * Converts a full DetailedLesson into reading segments for the background scanner.
 */
export function buildSegmentsFromDetailedLesson(lesson: DetailedLesson): ReadingSegmentInput[] {
  const segments: ReadingSegmentInput[] = [];
  const label = `অধ্যায় ${lesson.chapterNumber} · পাঠ ${lesson.lessonNumber} (${lesson.titleBn})`;
  const derivedLevel = Math.min(6, Math.max(1, Math.ceil(lesson.chapterNumber / 17))) as CurriculumLevelNumber;

  if (lesson.newVocabulary.length > 0 || lesson.revisionVocabulary.length > 0) {
    segments.push({
      arabic: lesson.titleAr,
      translationBn: lesson.titleBn,
      translationEn: lesson.titleEn,
      sourceLabelBn: label,
      chapterNumber: lesson.chapterNumber,
      level: derivedLevel,
      explicitVocab: [...lesson.newVocabulary, ...lesson.revisionVocabulary],
    });
  }

  lesson.conversation.forEach((line) => {
    segments.push({
      arabic: line.arabic,
      translationBn: line.translationBn,
      translationEn: line.translationEn,
      sourceLabelBn: label,
      chapterNumber: lesson.chapterNumber,
      level: derivedLevel,
    });
  });

  lesson.grammarExamples.forEach((ex) => {
    segments.push({
      arabic: ex.arabic,
      translationBn: ex.meaningBn,
      translationEn: ex.meaningEn || ex.meaningBn,
      sourceLabelBn: label,
      chapterNumber: lesson.chapterNumber,
      level: derivedLevel,
    });
  });

  if (lesson.writingTargetHintAr) {
    segments.push({
      arabic: lesson.writingTargetHintAr,
      translationBn: lesson.writingPromptBn,
      translationEn: lesson.writingPromptEn,
      sourceLabelBn: label,
      chapterNumber: lesson.chapterNumber,
      level: derivedLevel,
    });
  }

  return segments;
}

/**
 * Schedules parsing on browser idle frames so UI interaction remains 60fps.
 */
export function scheduleBackgroundVocabWork(task: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof win.requestIdleCallback === 'function') {
    const id = win.requestIdleCallback(task, { timeout: 1500 });
    return () => win.cancelIdleCallback?.(id);
  }
  const timer = window.setTimeout(task, 220);
  return () => window.clearTimeout(timer);
}
