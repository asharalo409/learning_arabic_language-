import { CurriculumLevelNumber, VocabItem, VocabProgressRecord } from '../types/academy';
import { CURRICULUM_CHAPTERS } from './curriculum';
import { DETAILED_LESSONS } from './detailedLessons';
import { DOMAIN_BANK_PART1 } from './mabadiDailyBank';
import { DOMAIN_BANK_PART2 } from './mabadiDailyBankPart2';
import { VOCABULARY_BANK } from './practiceAndVocabData';

export type Sm2Quality = 'again' | 'hard' | 'good' | 'easy';

function normalizeArabicKey(ar: string): string {
  return ar
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function levelForChapter(chNum: number): CurriculumLevelNumber {
  if (chNum <= 16) return 1;
  if (chNum <= 33) return 2;
  if (chNum <= 50) return 3;
  if (chNum <= 67) return 4;
  if (chNum <= 84) return 5;
  return 6;
}

/**
 * Computes next SM-2 interval, ease factor, and repetition count.
 */
export function computeSm2Next(
  existing: VocabProgressRecord | undefined,
  quality: Sm2Quality
): { ease: number; intervalDays: number; repetitions: number } {
  const ease = existing?.ease ?? 2.5;
  const intervalDays = existing?.intervalDays ?? 0;
  const repetitions = existing?.repetitions ?? 0;

  if (quality === 'again') {
    return {
      ease: Math.max(1.3, Number((ease - 0.2).toFixed(2))),
      intervalDays: 0,
      repetitions: 0,
    };
  }

  if (quality === 'hard') {
    const nextReps = repetitions + 1;
    const nextInt = repetitions === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
    return {
      ease: Math.max(1.3, Number((ease - 0.15).toFixed(2))),
      intervalDays: nextInt,
      repetitions: nextReps,
    };
  }

  if (quality === 'good') {
    const nextReps = repetitions + 1;
    const nextInt =
      nextReps === 1 ? 1 : nextReps === 2 ? 6 : Math.max(2, Math.round(intervalDays * ease));
    return {
      ease,
      intervalDays: nextInt,
      repetitions: nextReps,
    };
  }

  // 'easy'
  const nextReps = repetitions + 1;
  const nextEase = Math.min(3.0, Number((ease + 0.15).toFixed(2)));
  const nextInt =
    nextReps === 1
      ? 4
      : nextReps === 2
      ? 8
      : Math.max(4, Math.round(Math.max(2, intervalDays) * nextEase * 1.3));
  return {
    ease: nextEase,
    intervalDays: nextInt,
    repetitions: nextReps,
  };
}

function buildCurriculumVocabDeck(): VocabItem[] {
  const seenArabic = new Set<string>();
  const deck: VocabItem[] = [];

  const pushUnique = (item: VocabItem) => {
    const key = normalizeArabicKey(item.arabic);
    if (!key || seenArabic.has(key)) return;
    seenArabic.add(key);
    deck.push(item);
  };

  // 1. Add vocabulary directly from Detailed Lessons (with exact chapter links)
  Object.values(DETAILED_LESSONS).forEach((lesson) => {
    const ch = CURRICULUM_CHAPTERS.find((c) => c.chapterNumber === lesson.chapterNumber);
    const lvl = ch?.level ?? levelForChapter(lesson.chapterNumber);
    lesson.newVocabulary.forEach((v) => {
      pushUnique({
        ...v,
        chapterNumber: lesson.chapterNumber,
        level: lvl,
        chapterTitleBn: ch?.titleBn || `অধ্যায় ${lesson.chapterNumber}`,
        isQuranic: lesson.track === 'Quranic' || v.isQuranic,
      });
    });
  });

  // 2. Add thematic vocabulary across all 20 groups spanning Chapters 1–100 (Levels 1–6)
  const allDomains = [...DOMAIN_BANK_PART1, ...DOMAIN_BANK_PART2];
  allDomains.forEach((domain) => {
    const startCh = domain.groupIndex * 5 + 1;
    domain.vocabulary.forEach((v, idx) => {
      const chNum = Math.min(100, startCh + (idx % 5));
      const ch = CURRICULUM_CHAPTERS.find((c) => c.chapterNumber === chNum);
      const lvl = ch?.level ?? levelForChapter(chNum);
      const dialogueSample = domain.dialogue[idx % domain.dialogue.length];

      pushUnique({
        id: `curr-g${domain.groupIndex}-v${idx}`,
        arabic: v.arabic,
        pronunciationBn: v.pronunciationBn,
        meaningBn: v.meaningBn,
        meaningEn: v.meaningEn,
        category: ch?.titleBn || domain.mabadiLevelBn,
        root: v.masdarNote,
        exampleAr: dialogueSample?.arabic || domain.grammar.exampleAr,
        exampleBn: dialogueSample?.meaningBn || domain.grammar.exampleBn,
        exampleEn: dialogueSample?.meaningEn || v.meaningEn,
        chapterNumber: chNum,
        level: lvl,
        chapterTitleBn: ch?.titleBn,
        isQuranic: ch?.track === 'Quranic',
      });
    });
  });

  // 3. Include remaining core practice vocabulary bank items mapped neatly to Chapters 1–20
  VOCABULARY_BANK.forEach((v, idx) => {
    const chNum = Math.min(20, (idx % 16) + 1);
    const ch = CURRICULUM_CHAPTERS.find((c) => c.chapterNumber === chNum);
    pushUnique({
      ...v,
      chapterNumber: v.chapterNumber ?? chNum,
      level: v.level ?? ch?.level ?? 1,
      chapterTitleBn: v.chapterTitleBn ?? ch?.titleBn,
    });
  });

  return deck.sort((a, b) => (a.chapterNumber || 1) - (b.chapterNumber || 1));
}

export const CURRICULUM_VOCAB_DECK: VocabItem[] = buildCurriculumVocabDeck();
