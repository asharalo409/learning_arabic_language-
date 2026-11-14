import { QURAN_GRAMMAR_PART_1, SurahGrammarProfile, AyahGrammarNote } from './quranGrammarPart1';
import { QURAN_GRAMMAR_PART_2 } from './quranGrammarPart2';

export type { SurahGrammarProfile, AyahGrammarNote };

export const QURAN_GRAMMAR_BY_SURAH: Record<number, SurahGrammarProfile> = {
  ...QURAN_GRAMMAR_PART_1,
  ...QURAN_GRAMMAR_PART_2,
};
