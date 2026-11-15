import { VocabDeckStatus, VocabItem, VocabProgressRecord } from '../types/academy';

export function resolveVocabStatus(record?: VocabProgressRecord): VocabDeckStatus {
  if (!record) return 'learning';
  if (record.status === 'learning' || record.status === 'mastered' || record.status === 'review') {
    return record.status;
  }
  if (record.intervalDays >= 3) return 'mastered';
  const isDue = new Date(record.nextReviewIso).getTime() <= Date.now();
  if (record.repetitions > 0 && (record.intervalDays === 0 || isDue)) {
    return 'review';
  }
  return 'learning';
}

export interface VocabDeckSummary {
  totalDeck: number;
  trackedTotal: number;
  learning: number;
  mastered: number;
  review: number;
  unseen: number;
}

export function computeVocabDeckSummary(
  words: VocabItem[],
  vocabProgress: Record<string, VocabProgressRecord>
): VocabDeckSummary {
  let learning = 0;
  let mastered = 0;
  let review = 0;
  let trackedTotal = 0;

  for (const w of words) {
    const rec = vocabProgress[w.id];
    if (!rec) continue;
    trackedTotal += 1;
    const status = resolveVocabStatus(rec);
    if (status === 'mastered') mastered += 1;
    else if (status === 'review') review += 1;
    else learning += 1;
  }

  return {
    totalDeck: words.length,
    trackedTotal,
    learning,
    mastered,
    review,
    unseen: Math.max(0, words.length - trackedTotal),
  };
}
