import { MasdarEntry } from '../types/academy';

export interface SigahRow {
  index: number;
  sigahAr: string;
  sigahBn: string;
  pronounHint: string;
  madiMaruf: string;
  mudariMaruf: string;
  madiMajhul: string;
  mudariMajhul: string;
}

export interface AmrRow {
  sigahBn: string;
  sigahAr: string;
  amrAr: string;
  nahiAr: string;
}

export interface FullSarfPackage {
  rows14: SigahRow[];
  amrRows6: AmrRow[];
  zarfAr: string;
  alahAr: string;
  sarfNoteBn: string;
}

const SIGAH_META: { sigahAr: string; sigahBn: string; pronounHint: string }[] = [
  { sigahAr: 'وَاحِد مُذَكَّر غَائِب', sigahBn: 'ওয়াহিদ মুযাক্কার গায়েব', pronounHint: 'هُوَ (সে-পুং)' },
  { sigahAr: 'تَثْنِيَة مُذَكَّر غَائِب', sigahBn: 'তাসনিয়া মুযাক্কার গায়েব', pronounHint: 'هُمَا (তারা ২-পুং)' },
  { sigahAr: 'جَمْع مُذَكَّر غَائِب', sigahBn: 'জমা মুযাক্কার গায়েব', pronounHint: 'هُمْ (তারা-পুং)' },
  { sigahAr: 'وَاحِد مُؤَنَّث غَائِب', sigahBn: 'ওয়াহিদ মুয়ান্নাস গায়েব', pronounHint: 'هِيَ (সে-স্ত্রী)' },
  { sigahAr: 'تَثْنِيَة مُؤَنَّث غَائِب', sigahBn: 'তাসনিয়া মুয়ান্নাস গায়েব', pronounHint: 'هُمَا (তারা ২-স্ত্রী)' },
  { sigahAr: 'جَمْع مُؤَنَّث غَائِب', sigahBn: 'জমা মুয়ান্নাস গায়েব', pronounHint: 'هُنَّ (তারা-স্ত্রী)' },
  { sigahAr: 'وَاحِد مُذَكَّر حَاضِر', sigahBn: 'ওয়াহিদ মুযাক্কার হাদির', pronounHint: 'أَنْتَ (তুমি-পুং)' },
  { sigahAr: 'تَثْنِيَة مُذَكَّر حَاضِر', sigahBn: 'তাসনিয়া মুযাক্কার হাদির', pronounHint: 'أَنْتُمَا (তোমরা ২-পুং)' },
  { sigahAr: 'جَمْع مُذَكَّر حَاضِر', sigahBn: 'জমা মুযাক্কার হাদির', pronounHint: 'أَنْتُمْ (তোমরা-পুং)' },
  { sigahAr: 'وَاحِد مُؤَنَّث حَاضِر', sigahBn: 'ওয়াহিদ মুয়ান্নাস হাদির', pronounHint: 'أَنْتِ (তুমি-স্ত্রী)' },
  { sigahAr: 'تَثْنِيَة مُؤَنَّث حَاضِر', sigahBn: 'তাসনিয়া মুয়ান্নাস হাদির', pronounHint: 'أَنْتُمَا (তোমরা ২-স্ত্রী)' },
  { sigahAr: 'جَمْع مُؤَنَّث حَاضِر', sigahBn: 'জমা মুয়ান্নাস হাদির', pronounHint: 'أَنْتُنَّ (তোমরা-স্ত্রী)' },
  { sigahAr: 'وَاحِد مُتَكَلِّم', sigahBn: 'ওয়াহিদ মুতাকাল্লিম', pronounHint: 'أَنَا (আমি)' },
  { sigahAr: 'جَمْع مُتَكَلِّم', sigahBn: 'জমা মুতাকাল্লিম', pronounHint: 'نَحْنُ (আমরা)' },
];

const AMR_META = [
  { sigahBn: 'ওয়াহিদ মুযাক্কার হাদির (তুমি-পুং)', sigahAr: 'وَاحِد مُذَكَّر حَاضِر' },
  { sigahBn: 'তাসনিয়া মুযাক্কার হাদির (তোমরা ২-পুং)', sigahAr: 'تَثْنِيَة مُذَكَّر حَاضِر' },
  { sigahBn: 'জমা মুযাক্কার হাদির (তোমরা-পুং)', sigahAr: 'جَمْع مُذَكَّر حَاضِر' },
  { sigahBn: 'ওয়াহিদ মুয়ান্নাস হাদির (তুমি-স্ত্রী)', sigahAr: 'وَاحِد مُؤَنَّث حَاضِر' },
  { sigahBn: 'তাসনিয়া মুয়ান্নাস হাদির (তোমরা ২-স্ত্রী)', sigahAr: 'تَثْنِيَة مُؤَنَّث حَاضِر' },
  { sigahBn: 'জমা মুয়ান্নাস হাদির (তোমরা-স্ত্রী)', sigahAr: 'جَمْع مُؤَنَّث حَاضِر' },
];

const HARAKAT_REGEX = /[\u064B-\u065F\u0670]/g;

function stripHarakat(text: string): string {
  return text.replace(HARAKAT_REGEX, '');
}

function splitConsonantUnits(word: string): string[] {
  const units: string[] = [];
  for (const ch of word) {
    if (HARAKAT_REGEX.test(ch)) {
      if (units.length > 0) units[units.length - 1] += ch;
    } else {
      units.push(ch);
    }
  }
  return units;
}

function setVowelsOnBase(unit: string, vowel: string): string {
  const letter = stripHarakat(unit);
  return `${letter}${vowel}`;
}

// Explicit overrides for tricky weak/irregular roots (Haft Aqsam) so every vowel is 100% textbook-perfect
const EXPLICIT_MADI_14: Record<string, string[]> = {
  'قَالَ': ['قَالَ', 'قَالَا', 'قَالُوا', 'قَالَتْ', 'قَالَتَا', 'قُلْنَ', 'قُلْتَ', 'قُلْتُمَا', 'قُلْتُمْ', 'قُلْتِ', 'قُلْتُمَا', 'قُلْتُنَّ', 'قُلْتُ', 'قُلْنَا'],
  'كَانَ': ['كَانَ', 'كَانَا', 'كَانُوا', 'كَانَتْ', 'كَانَتَا', 'كُنَّ', 'كُنْتَ', 'كُنْتُمَا', 'كُنْتُمْ', 'كُنْتِ', 'كُنْتُمَا', 'كُنْتُنَّ', 'كُنْتُ', 'كُنَّا'],
  'صَامَ': ['صَامَ', 'صَامَا', 'صَامُوا', 'صَامَتْ', 'صَامَتَا', 'صُمْنَ', 'صُمْتَ', 'صُمْتُمَا', 'صُمْتُمْ', 'صُمْتِ', 'صُمْتُمَا', 'صُمْتُنَّ', 'صُمْتُ', 'صُمْنَا'],
  'قَامَ': ['قَامَ', 'قَامَا', 'قَامُوا', 'قَامَتْ', 'قَامَتَا', 'قُمْنَ', 'قُمْتَ', 'قُمْتُمَا', 'قُمْتُمْ', 'قُمْتِ', 'قُمْتُمَا', 'قُمْتُنَّ', 'قُمْتُ', 'قُمْنَا'],
  'بَاعَ': ['بَاعَ', 'بَاعَا', 'بَاعُوا', 'بَاعَتْ', 'بَاعَتَا', 'بِعْنَ', 'بِعْتَ', 'بِعْتُمَا', 'بِعْتُمْ', 'بِعْتِ', 'بِعْتُمَا', 'بِعْتُنَّ', 'بِعْتُ', 'بِعْنَا'],
  'سَارَ': ['سَارَ', 'سَارَا', 'سَارُوا', 'سَارَتْ', 'سَارَتَا', 'سِرْنَ', 'سِرْتَ', 'سِرْتُمَا', 'سِرْتُمْ', 'سِرْتِ', 'سِرْتُمَا', 'سِرْتُنَّ', 'سِرْتُ', 'سِرْنَا'],
  'خَافَ': ['خَافَ', 'خَافَا', 'خَافُوا', 'خَافَتْ', 'خَافَتَا', 'خِفْنَ', 'خِفْتَ', 'خِفْتُمَا', 'خِفْتُمْ', 'خِفْتِ', 'خِفْتُمَا', 'خِفْتُنَّ', 'خِفْتُ', 'خِفْنَا'],
  'نَامَ': ['نَامَ', 'نَامَا', 'نَامُوا', 'نَامَتْ', 'نَامَتَا', 'نِمْنَ', 'نِمْتَ', 'نِمْتُمَا', 'نِمْتُمْ', 'نِمْتِ', 'نِمْتُمَا', 'نِمْتُنَّ', 'نِمْتُ', 'نِمْنَا'],
  'دَعَا': ['دَعَا', 'دَعَوَا', 'دَعَوْا', 'دَعَتْ', 'دَعَتَا', 'دَعَوْنَ', 'دَعَوْتَ', 'دَعَوْتُمَا', 'دَعَوْتُمْ', 'دَعَوْتِ', 'دَعَوْتُمَا', 'دَعَوْتُنَّ', 'دَعَوْتُ', 'دَعَوْنَا'],
  'تَلَا': ['تَلَا', 'تَلَوَا', 'تَلَوْا', 'تَلَتْ', 'تَلَتَا', 'تَلَوْنَ', 'تَلَوْتَ', 'تَلَوْتُمَا', 'تَلَوْتُمْ', 'تَلَوْتِ', 'تَلَوْتُمَا', 'تَلَوْتُنَّ', 'تَلَوْتُ', 'تَلَوْنَا'],
  'عَفَا': ['عَفَا', 'عَفَوَا', 'عَفَوْا', 'عَفَتْ', 'عَفَتَا', 'عَفَوْنَ', 'عَفَوْتَ', 'عَفَوْتُمَا', 'عَفَوْتُمْ', 'عَفَوْتِ', 'عَفَوْتُمَا', 'عَفَوْتُنَّ', 'عَفَوْتُ', 'عَفَوْنَا'],
  'هَدَى': ['هَدَى', 'هَدَيَا', 'هَدَوْا', 'هَدَتْ', 'هَدَتَا', 'هَدَيْنَ', 'هَدَيْتَ', 'هَدَيْتُمَا', 'هَدَيْتُمْ', 'هَدَيْتِ', 'هَدَيْتُمَا', 'هَدَيْتُنَّ', 'هَدَيْتُ', 'هَدَيْنَا'],
  'مَشَى': ['مَشَى', 'مَشَيَا', 'مَشَوْا', 'مَشَتْ', 'مَشَتَا', 'مَشَيْنَ', 'مَشَيْتَ', 'مَشَيْتُمَا', 'مَشَيْتُمْ', 'مَشَيْتِ', 'مَشَيْتُمَا', 'مَشَيْتُنَّ', 'مَشَيْتُ', 'مَشَيْنَا'],
  'وَقَى': ['وَقَى', 'وَقَيَا', 'وَقَوْا', 'وَقَتْ', 'وَقَتَا', 'وَقَيْنَ', 'وَقَيْتَ', 'وَقَيْتُمَا', 'وَقَيْتُمْ', 'وَقَيْتِ', 'وَقَيْتُمَا', 'وَقَيْتُنَّ', 'وَقَيْتُ', 'وَقَيْنَا'],
  'نَوَى': ['نَوَى', 'نَوَيَا', 'نَوَوْا', 'نَوَتْ', 'نَوَتَا', 'نَوَيْنَ', 'نَوَيْتَ', 'نَوَيْتُمَا', 'نَوَيْتُمْ', 'نَوَيْتِ', 'نَوَيْتُمَا', 'نَوَيْتُنَّ', 'نَوَيْتُ', 'نَوَيْنَا'],
  'أَتَى': ['أَتَى', 'أَتَيَا', 'أَتَوْا', 'أَتَتْ', 'أَتَتَا', 'أَتَيْنَ', 'أَتَيْتَ', 'أَتَيْتُمَا', 'أَتَيْتُمْ', 'أَتَيْتِ', 'أَتَيْتُمَا', 'أَتَيْتُنَّ', 'أَتَيْتُ', 'أَتَيْنَا'],
  'رَضِيَ': ['رَضِيَ', 'رَضِيَا', 'رَضُوا', 'رَضِيَتْ', 'رَضِيَتَا', 'رَضِينَ', 'رَضِيتَ', 'رَضِيتُمَا', 'رَضِيتُمْ', 'رَضِيتِ', 'رَضِيتُمَا', 'رَضِيتُنَّ', 'رَضِيتُ', 'رَضِينَا'],
  'مَدَّ': ['مَدَّ', 'مَدَّا', 'مَدُّوا', 'مَدَّتْ', 'مَدَّتَا', 'مَدَدْنَ', 'مَدَدْتَ', 'مَدَدْتُمَا', 'مَدَدْتُمْ', 'مَدَدْتِ', 'مَدَدْتُمَا', 'مَدَدْتُنَّ', 'مَدَدْتُ', 'مَدَدْنَا'],
  'ظَنَّ': ['ظَنَّ', 'ظَنَّا', 'ظَنُّوا', 'ظَنَّتْ', 'ظَنَّتَا', 'ظَنَنَّ', 'ظَنَنْتَ', 'ظَنَنْتُمَا', 'ظَنَنْتُمْ', 'ظَنَنْتِ', 'ظَنَنْتُمَا', 'ظَنَنْتُنَّ', 'ظَنَنْتُ', 'ظَنَنَّا'],
  'فَرَّ': ['فَرَّ', 'فَرَّا', 'فَرُّوا', 'فَرَّتْ', 'فَرَّتَا', 'فَرَرْنَ', 'فَرَرْتَ', 'فَرَرْتُمَا', 'فَرَرْتُمْ', 'فَرَرْتِ', 'فَرَرْتُمَا', 'فَرَرْتُنَّ', 'فَرَرْتُ', 'فَرَرْنَا'],
  'اِسْتَعَانَ': ['اِسْتَعَانَ', 'اِسْتَعَانَا', 'اِسْتَعَانُوا', 'اِسْتَعَانَتْ', 'اِسْتَعَانَتَا', 'اِسْتَعَنَّ', 'اِسْتَعَنْتَ', 'اِسْتَعَنْتُمَا', 'اِسْتَعَنْتُمْ', 'اِسْتَعَنْتِ', 'اِسْتَعَنْتُمَا', 'اِسْتَعَنْتُنَّ', 'اِسْتَعَنْتُ', 'اِسْتَعَنَّا'],
  'اِحْمَرَّ': ['اِحْمَرَّ', 'اِحْمَرَّا', 'اِحْمَرُّوا', 'اِحْمَرَّتْ', 'اِحْمَرَّتَا', 'اِحْمَرَرْنَ', 'اِحْمَرَرْتَ', 'اِحْمَرَرْتُمَا', 'اِحْمَرَرْتُمْ', 'اِحْمَرَرْتِ', 'اِحْمَرَرْتُمَا', 'اِحْمَرَرْتُنَّ', 'اِحْمَرَرْتُ', 'اِحْمَرَرْنَا'],
  'اِطْمَأَنَّ': ['اِطْمَأَنَّ', 'اِطْمَأَنَّا', 'اِطْمَأَنُّوا', 'اِطْمَأَنَّتْ', 'اِطْمَأَنَّتَا', 'اِطْمَأْنَنَّ', 'اِطْمَأْنَنْتَ', 'اِطْمَأْنَنْتُمَا', 'اِطْمَأْنَنْتُمْ', 'اِطْمَأْنَنْتِ', 'اِطْمَأْنَنْتُمَا', 'اِطْمَأْنَنْتُنَّ', 'اِطْمَأْنَنْتُ', 'اِطْمَأْنَنَّا'],
};

const EXPLICIT_MUDARI_14: Record<string, string[]> = {
  'يَقُولُ': ['يَقُولُ', 'يَقُولَانِ', 'يَقُولُونَ', 'تَقُولُ', 'تَقُولَانِ', 'يَقُلْنَ', 'تَقُولُ', 'تَقُولَانِ', 'تَقُولُونَ', 'تَقُولِينَ', 'تَقُولَانِ', 'تَقُلْنَ', 'أَقُولُ', 'نَقُولُ'],
  'يَكُونُ': ['يَكُونُ', 'يَكُونَانِ', 'يَكُونُونَ', 'تَكُونُ', 'تَكُونَانِ', 'يَكُنَّ', 'تَكُونُ', 'تَكُونَانِ', 'تَكُونُونَ', 'تَكُونِينَ', 'تَكُونَانِ', 'تَكُنَّ', 'أَكُونُ', 'نَكُونُ'],
  'يَصُومُ': ['يَصُومُ', 'يَصُومَانِ', 'يَصُومُونَ', 'تَصُومُ', 'تَصُومَانِ', 'يَصُمْنَ', 'تَصُومُ', 'تَصُومَانِ', 'تَصُومُونَ', 'تَصُومِينَ', 'تَصُومَانِ', 'تَصُمْنَ', 'أَصُومُ', 'نَصُومُ'],
  'يَقُومُ': ['يَقُومُ', 'يَقُومَانِ', 'يَقُومُونَ', 'تَقُومُ', 'تَقُومَانِ', 'يَقُمْنَ', 'تَقُومُ', 'تَقُومَانِ', 'تَقُومُونَ', 'تَقُومِينَ', 'تَقُومَانِ', 'تَقُمْنَ', 'أَقُومُ', 'نَقُومُ'],
  'يَبِيعُ': ['يَبِيعُ', 'يَبِيعَانِ', 'يَبِيعُونَ', 'تَبِيعُ', 'تَبِيعَانِ', 'يَبِعْنَ', 'تَبِيعُ', 'تَبِيعَانِ', 'تَبِيعُونَ', 'تَبِيعِينَ', 'تَبِيعَانِ', 'تَبِعْنَ', 'أَبِيعُ', 'نَبِيعُ'],
  'يَسِيرُ': ['يَسِيرُ', 'يَسِيرَانِ', 'يَسِيرُونَ', 'تَسِيرُ', 'تَسِيرَانِ', 'يَسِرْنَ', 'تَسِيرُ', 'تَسِيرَانِ', 'تَسِيرُونَ', 'تَسِيرِينَ', 'تَسِيرَانِ', 'تَسِرْنَ', 'أَسِيرُ', 'نَسِيرُ'],
  'يَخَافُ': ['يَخَافُ', 'يَخَافَانِ', 'يَخَافُونَ', 'تَخَافُ', 'تَخَافَانِ', 'يَخَفْنَ', 'تَخَافُ', 'تَخَافَانِ', 'تَخَافُونَ', 'تَخَافِينَ', 'تَخَافَانِ', 'تَخَفْنَ', 'أَخَافُ', 'نَخَافُ'],
  'يَنَامُ': ['يَنَامُ', 'يَنَامَانِ', 'يَنَامُونَ', 'تَنَامُ', 'تَنَامَانِ', 'يَنَمْنَ', 'تَنَامُ', 'تَنَامَانِ', 'تَنَامُونَ', 'تَنَامِينَ', 'تَنَامَانِ', 'تَنَمْنَ', 'أَنَامُ', 'نَنَامُ'],
  'يَدْعُو': ['يَدْعُو', 'يَدْعُوَانِ', 'يَدْعُونَ', 'تَدْعُو', 'تَدْعُوَانِ', 'يَدْعُونَ', 'تَدْعُو', 'تَدْعُوَانِ', 'تَدْعُونَ', 'تَدْعِينَ', 'تَدْعُوَانِ', 'تَدْعُونَ', 'أَدْعُو', 'نَدْعُو'],
  'يَتْلُو': ['يَتْلُو', 'يَتْلُوَانِ', 'يَتْلُونَ', 'تَتْلُو', 'تَتْلُوَانِ', 'يَتْلُونَ', 'تَتْلُو', 'تَتْلُوَانِ', 'تَتْلُونَ', 'تَتْلِينَ', 'تَتْلُوَانِ', 'تَتْلُونَ', 'أَتْلُو', 'نَتْلُو'],
  'يَعْفُو': ['يَعْفُو', 'يَعْفُوَانِ', 'يَعْفُونَ', 'تَعْفُو', 'تَعْفُوَانِ', 'يَعْفُونَ', 'تَعْفُو', 'تَعْفُوَانِ', 'تَعْفُونَ', 'تَعْفِينَ', 'تَعْفُوَانِ', 'تَعْفُونَ', 'أَعْفُو', 'نَعْفُو'],
  'يَهْدِي': ['يَهْدِي', 'يَهْدِيَانِ', 'يَهْدُونَ', 'تَهْدِي', 'تَهْدِيَانِ', 'يَهْدِينَ', 'تَهْدِي', 'تَهْدِيَانِ', 'تَهْدُونَ', 'تَهْدِينَ', 'تَهْدِيَانِ', 'تَهْدِينَ', 'أَهْدِي', 'نَهْدِي'],
  'يَمْشِي': ['يَمْشِي', 'يَمْشِيَانِ', 'يَمْشُونَ', 'تَمْشِي', 'تَمْشِيَانِ', 'يَمْشِينَ', 'تَمْشِي', 'تَمْشِيَانِ', 'تَمْشُونَ', 'تَمْشِينَ', 'تَمْشِيَانِ', 'تَمْشِينَ', 'أَمْشِي', 'نَمْشِي'],
  'يَقِي': ['يَقِي', 'يَقِيَانِ', 'يَقُونَ', 'تَقِي', 'تَقِيَانِ', 'يَقِينَ', 'تَقِي', 'تَقِيَانِ', 'تَقُونَ', 'تَقِينَ', 'تَقِيَانِ', 'تَقِينَ', 'أَقِي', 'نَقِي'],
  'يَنْوِي': ['يَنْوِي', 'يَنْوِيَانِ', 'يَنْوُونَ', 'تَنْوِي', 'تَنْوِيَانِ', 'يَنْوِينَ', 'تَنْوِي', 'تَنْوِيَانِ', 'تَنْوُونَ', 'تَنْوِينَ', 'تَنْوِيَانِ', 'تَنْوِينَ', 'أَنْوِي', 'نَنْوِي'],
  'يَأْتِي': ['يَأْتِي', 'يَأْتِيَانِ', 'يَأْتُونَ', 'تَأْتِي', 'تَأْتِيَانِ', 'يَأْتِينَ', 'تَأْتِي', 'تَأْتِيَانِ', 'تَأْتُونَ', 'تَأْتِينَ', 'تَأْتِيَانِ', 'تَأْتِينَ', 'آتِي', 'نَأْتِي'],
  'يَرْضَى': ['يَرْضَى', 'يَرْضَيَانِ', 'يَرْضَوْنَ', 'تَرْضَى', 'تَرْضَيَانِ', 'يَرْضَيْنَ', 'تَرْضَى', 'تَرْضَيَانِ', 'تَرْضَوْنَ', 'تَرْضَيْنَ', 'تَرْضَيَانِ', 'تَرْضَيْنَ', 'أَرْضَى', 'نَرْضَى'],
  'يَمُدُّ': ['يَمُدُّ', 'يَمُدَّانِ', 'يَمُدُّونَ', 'تَمُدُّ', 'تَمُدَّانِ', 'يَمْدُدْنَ', 'تَمُدُّ', 'تَمُدَّانِ', 'تَمُدُّونَ', 'تَمُدِّينَ', 'تَمُدَّانِ', 'تَمْدُدْنَ', 'أَمُدُّ', 'نَمُدُّ'],
  'يَظُنُّ': ['يَظُنُّ', 'يَظُنَّانِ', 'يَظُنُّونَ', 'تَظُنُّ', 'تَظُنَّانِ', 'يَظْنُنَّ', 'تَظُنُّ', 'تَظُنَّانِ', 'تَظُنُّونَ', 'تَظُنِّينَ', 'تَظُنَّانِ', 'تَظْنُنَّ', 'أَظُنُّ', 'نَظُنُّ'],
  'يَفِرُّ': ['يَفِرُّ', 'يَفِرَّانِ', 'يَفِرُّونَ', 'تَفِرُّ', 'تَفِرَّانِ', 'يَفْرِرْنَ', 'تَفِرُّ', 'تَفِرَّانِ', 'تَفِرُّونَ', 'تَفِرِّينَ', 'تَفِرَّانِ', 'تَفْرِرْنَ', 'أَفِرُّ', 'نَفِرُّ'],
  'يَسْتَعِينُ': ['يَسْتَعِينُ', 'يَسْتَعِينَانِ', 'يَسْتَعِينُونَ', 'تَسْتَعِينُ', 'تَسْتَعِينَانِ', 'يَسْتَعِنَّ', 'تَسْتَعِينُ', 'تَسْتَعِينَانِ', 'تَسْتَعِينُونَ', 'تَسْتَعِينِينَ', 'تَسْتَعِينَانِ', 'تَسْتَعِنَّ', 'أَسْتَعِينُ', 'نَسْتَعِينُ'],
  'يَحْمَرُّ': ['يَحْمَرُّ', 'يَحْمَرَّانِ', 'يَحْمَرُّونَ', 'تَحْمَرُّ', 'تَحْمَرَّانِ', 'يَحْمَرِرْنَ', 'تَحْمَرُّ', 'تَحْمَرَّانِ', 'تَحْمَرُّونَ', 'تَحْمَرِّينَ', 'تَحْمَرَّانِ', 'تَحْمَرِرْنَ', 'أَحْمَرُّ', 'نَحْمَرُّ'],
  'يَطْمَئِنُّ': ['يَطْمَئِنُّ', 'يَطْمَئِنَّانِ', 'يَطْمَئِنُّونَ', 'تَطْمَئِنُّ', 'تَطْمَئِنَّانِ', 'يَطْمَأْنِنَّ', 'تَطْمَئِنُّ', 'تَطْمَئِنَّانِ', 'تَطْمَئِنُّونَ', 'تَطْمَئِنِّينَ', 'تَطْمَئِنَّانِ', 'تَطْمَأْنِنَّ', 'أَطْمَئِنُّ', 'نَطْمَئِنُّ'],
};

function conjugateRegularMadi(madiAr: string): string[] {
  const clean = madiAr.trim();
  if (EXPLICIT_MADI_14[clean]) return EXPLICIT_MADI_14[clean];

  const units = splitConsonantUnits(clean);
  if (units.length === 0) return Array(14).fill(clean);

  const last = units[units.length - 1];
  const lastPlain = stripHarakat(last);
  const stemUnits = units.slice(0, -1);
  const stemBase = stemUnits.join('');

  // Standard 3rd-pers fatha ending -> sukun when attached to taa/naa pronouns
  const lastWithFatha = `${lastPlain}َ`;
  const lastWithAlif = `${lastPlain}َا`;
  const lastWithWaw = `${lastPlain}ُوا`;
  const lastWithSukun = `${lastPlain}ْ`;

  // Special case: ends with نَ/نْ -> نَّ
  const femPlural = lastPlain === 'ن' ? `${stemBase}نَّ` : `${stemBase}${lastWithSukun}نَ`;

  return [
    `${stemBase}${lastWithFatha}`,
    `${stemBase}${lastWithAlif}`,
    `${stemBase}${lastWithWaw}`,
    `${stemBase}${lastWithFatha}تْ`,
    `${stemBase}${lastWithFatha}تَا`,
    femPlural,
    `${stemBase}${lastWithSukun}تَ`,
    `${stemBase}${lastWithSukun}تُمَا`,
    `${stemBase}${lastWithSukun}تُمْ`,
    `${stemBase}${lastWithSukun}تِ`,
    `${stemBase}${lastWithSukun}تُمَا`,
    `${stemBase}${lastWithSukun}تُنَّ`,
    `${stemBase}${lastWithSukun}تُ`,
    `${stemBase}${lastWithSukun}نَا`,
  ];
}

function conjugateRegularMudari(mudariAr: string): string[] {
  const clean = mudariAr.trim();
  if (EXPLICIT_MUDARI_14[clean]) return EXPLICIT_MUDARI_14[clean];

  const units = splitConsonantUnits(clean);
  if (units.length < 3) return Array(14).fill(clean);

  // Detect prefix vowel (فَتْحَة for Mujarrad/Infi'al/Istif'al etc., ضَمَّة for If'al/Taf'il/Mufa'alah/Rubai)
  const firstUnit = units[0];
  const hasDammaPrefix = firstUnit.includes('ُ');
  const prefixVowel = hasDammaPrefix ? 'ُ' : 'َ';
  const bodyUnits = units.slice(1);
  const bodyWithoutLast = bodyUnits.slice(0, -1).join('');
  const lastPlain = stripHarakat(bodyUnits[bodyUnits.length - 1]);

  const yPrefix = `ي${prefixVowel}`;
  const tPrefix = `ت${prefixVowel}`;
  const nPrefix = `ن${prefixVowel}`;
  const aPrefix = hasDammaPrefix ? 'أُ' : 'أَ';

  const d = (p: string) => `${p}${bodyWithoutLast}${lastPlain}ُ`;
  const dual = (p: string) => `${p}${bodyWithoutLast}${lastPlain}َانِ`;
  const mPl = (p: string) => `${p}${bodyWithoutLast}${lastPlain}ُونَ`;
  const fSg2 = (p: string) => `${p}${bodyWithoutLast}${lastPlain}ِينَ`;
  const fPl = (p: string) =>
    lastPlain === 'ن'
      ? `${p}${bodyWithoutLast}نَّ`
      : `${p}${bodyWithoutLast}${lastPlain}ْنَ`;

  return [
    d(yPrefix),
    dual(yPrefix),
    mPl(yPrefix),
    d(tPrefix),
    dual(tPrefix),
    fPl(yPrefix),
    d(tPrefix),
    dual(tPrefix),
    mPl(tPrefix),
    fSg2(tPrefix),
    dual(tPrefix),
    fPl(tPrefix),
    d(aPrefix),
    d(nPrefix),
  ];
}

function buildMajhulMadi(entry: MasdarEntry): string[] {
  const units = splitConsonantUnits(entry.madiAr.trim());
  if (entry.sarfType === 'Ajwaf') {
    const r = entry.rootLetters.split(' ');
    const fa = r[0] || '';
    const lam = r[2] || '';
    const base = `${fa}ِي${lam}`;
    return [
      `${base}َ`, `${base}َا`, `${base}ُوا`, `${base}َتْ`, `${base}َتَا`,
      `${fa}ِ${lam}ْنَ`, `${fa}ِ${lam}ْتَ`, `${fa}ِ${lam}ْتُمَا`, `${fa}ِ${lam}ْتُمْ`,
      `${fa}ِ${lam}ْتِ`, `${fa}ِ${lam}ْتُمَا`, `${fa}ِ${lam}ْتُنَّ`, `${fa}ِ${lam}ْتُ`, `${fa}ِ${lam}ْنَا`,
    ];
  }
  if (entry.ismMafulAr === '—' || entry.ismMafulAr.includes(' ')) {
    // Intransitive verb (لازم) still demonstrates theoretical majhul/bi-hi pattern when applicable
    if (entry.babNameBn.includes('কারুমা')) {
      return Array(14).fill('— (লাযিম/অকর্মক)');
    }
  }
  if (units.length === 3 && entry.sarfType !== 'Mudaaf' && entry.sarfType !== 'Naqis' && entry.sarfType !== 'Lafif') {
    const c1 = setVowelsOnBase(units[0], 'ُ');
    const c2 = setVowelsOnBase(units[1], 'ِ');
    const c3 = stripHarakat(units[2]);
    return conjugateRegularMadi(`${c1}${c2}${c3}َ`);
  }
  if (units.length >= 4 && entry.sarfType !== 'Naqis' && entry.sarfType !== 'Mudaaf') {
    // General rule: ضُمَّ أَوَّلُهُ وَكُسِرَ مَا قَبْلَ آخِرِهِ (keeping sukun letters quiet)
    const transformed = units.map((u, idx) => {
      const letter = stripHarakat(u);
      if (idx === units.length - 1) return `${letter}َ`;
      if (idx === units.length - 2) return `${letter}ِ`;
      if (u.includes('ْ')) return `${letter}ْ`;
      if (letter === 'ا' && idx === 1) return 'و'; // فاعَل -> فُوعِلَ
      if (idx === 0) return `${letter}ُ`;
      return `${letter}ُ`;
    });
    return conjugateRegularMadi(transformed.join(''));
  }
  const r = entry.rootLetters.split(' ');
  const fallbackBase = r.length === 3 ? `${r[0]}ُ${r[1]}ِ${r[2]}َ` : entry.madiAr;
  if (entry.sarfType === 'Mudaaf') {
    const c1 = stripHarakat(units[0]);
    const c2 = stripHarakat(units[1]);
    return conjugateRegularMadi(`${c1}ُ${c2}َّ`);
  }
  if (entry.sarfType === 'Naqis' && r.length === 3) {
    return [`${r[0]}ُ${r[1]}ِيَ`, `${r[0]}ُ${r[1]}ِيَا`, `${r[0]}ُ${r[1]}ُوا`, `${r[0]}ُ${r[1]}ِيَتْ`, `${r[0]}ُ${r[1]}ِيَتَا`, `${r[0]}ُ${r[1]}ِينَ`, `${r[0]}ُ${r[1]}ِيتَ`, `${r[0]}ُ${r[1]}ِيتُمَا`, `${r[0]}ُ${r[1]}ِيتُمْ`, `${r[0]}ُ${r[1]}ِيتِ`, `${r[0]}ُ${r[1]}ِيتُمَا`, `${r[0]}ُ${r[1]}ِيتُنَّ`, `${r[0]}ُ${r[1]}ِيتُ`, `${r[0]}ُ${r[1]}ِينَا`];
  }
  return conjugateRegularMadi(fallbackBase);
}

function buildMajhulMudari(entry: MasdarEntry, activeMudari14: string[]): string[] {
  if (entry.babNameBn.includes('কারুমা')) {
    return Array(14).fill('— (লাযিম/অকর্মক)');
  }
  if (entry.sarfType === 'Ajwaf') {
    const r = entry.rootLetters.split(' ');
    if (r.length === 3 && entry.babCategory === 'Thulathi Mujarrad') {
      const fa = r[0];
      const lam = r[2];
      return [
        `يُ${fa}َا${lam}ُ`, `يُ${fa}َا${lam}َانِ`, `يُ${fa}َا${lam}ُونَ`,
        `تُ${fa}َا${lam}ُ`, `تُ${fa}َا${lam}َانِ`, `يُ${fa}َ${lam}ْنَ`,
        `تُ${fa}َا${lam}ُ`, `تُ${fa}َا${lam}َانِ`, `تُ${fa}َا${lam}ُونَ`,
        `تُ${fa}َا${lam}ِينَ`, `تُ${fa}َا${lam}َانِ`, `تُ${fa}َ${lam}ْنَ`,
        `أُ${fa}َا${lam}ُ`, `نُ${fa}َا${lam}ُ`,
      ];
    }
  }
  if (entry.sarfType === 'Mithal') {
    const r = entry.rootLetters.split(' ');
    if (r.length === 3 && entry.babCategory === 'Thulathi Mujarrad') {
      const base = `يُو${r[1]}َ${r[2]}ُ`;
      return conjugateRegularMudari(base);
    }
  }
  if (entry.sarfType === 'Naqis' || entry.sarfType === 'Lafif' || entry.sarfType === 'Mudaaf') {
    return activeMudari14.map((form) => {
      const units = splitConsonantUnits(form);
      if (units.length < 3) return form;
      units[0] = `${stripHarakat(units[0])}ُ`;
      if (entry.sarfType === 'Naqis' || entry.sarfType === 'Lafif') {
        // Basic Yud'a / Yuhda passive approximation
        return units.join('').replace(/يُ([^ْ]+)ْ([^ي])ِي/g, 'يُ$1ْ$2َى').replace(/([يتأن])ُ([^ُ]+)ُّ/, '$1ُ$2َ');
      }
      return units.join('');
    });
  }

  return activeMudari14.map((form) => {
    const units = splitConsonantUnits(form);
    if (units.length < 3) return form;
    units[0] = `${stripHarakat(units[0])}ُ`;
    // Find penultimate root letter (before final lam or suffix انِ / ونَ / ينَ / نَ)
    const plain = stripHarakat(form);
    let stemEndIdx = units.length - 1;
    if (plain.endsWith('ان') || plain.endsWith('ون') || plain.endsWith('ين')) {
      stemEndIdx = units.length - 3;
    } else if (plain.endsWith('ن') && units[units.length - 2]?.includes('ْ')) {
      stemEndIdx = units.length - 2;
    }
    const aynIdx = Math.max(1, stemEndIdx - 1);
    const aynUnit = units[aynIdx];
    const aynLetter = stripHarakat(aynUnit);
    if (aynUnit && !aynUnit.includes('ْ')) {
      units[aynIdx] = aynUnit.includes('ّ') ? `${aynLetter}َّ` : `${aynLetter}َ`;
    }
    return units.join('');
  });
}

function buildAmrAndNahi6(entry: MasdarEntry, mudari14: string[]): AmrRow[] {
  const firstAmr = entry.amrAr.split('/')[0].trim();
  const baseAmrUnits = splitConsonantUnits(firstAmr);
  const lastPlain = baseAmrUnits.length > 0 ? stripHarakat(baseAmrUnits[baseAmrUnits.length - 1]) : '';
  const amrStem = baseAmrUnits.slice(0, -1).join('');

  let amrForms: string[];
  if (entry.sarfType === 'Ajwaf' && baseAmrUnits.length === 2) {
    const r = entry.rootLetters.split(' ');
    const midLong = entry.mudariAr.includes('ُو') ? 'و' : entry.mudariAr.includes('ِي') ? 'ي' : 'ا';
    const fa = baseAmrUnits[0];
    const lam = stripHarakat(baseAmrUnits[1]);
    const prefixLong = `${fa}${midLong}${lam}`;
    amrForms = [
      firstAmr,
      `${prefixLong}َا`,
      `${prefixLong}ُوا`,
      `${prefixLong}ِي`,
      `${prefixLong}َا`,
      `${firstAmr.replace('ْ', '')}ْنَ`.replace('لْنَ', 'لْنَ'),
    ];
    if (r[2] === 'ن') amrForms[5] = `${fa}نَّ`;
  } else if (entry.sarfType === 'Naqis' || entry.sarfType === 'Lafif') {
    const r = entry.rootLetters.split(' ');
    const weakRestore = entry.mudariAr.endsWith('ُو') ? 'وُ' : 'يِ';
    const baseNoEnd = baseAmrUnits.slice(0, -1).join('');
    if (r.length === 3 && entry.sarfType === 'Lafif' && firstAmr === 'قِ') {
      amrForms = ['قِ', 'قِيَا', 'قُوا', 'قِي', 'قِيَا', 'قِينَ'];
    } else if (entry.mudariAr.endsWith('َى')) {
      amrForms = [firstAmr, `${baseNoEnd}يَا`, `${baseNoEnd}وْا`, `${baseNoEnd}يْ`, `${baseNoEnd}يَا`, `${baseNoEnd}يْنَ`];
    } else {
      amrForms = [
        firstAmr,
        `${baseNoEnd}${weakRestore === 'وُ' ? 'وَا' : 'يَا'}`,
        `${baseNoEnd}وا`,
        `${baseNoEnd}ي`,
        `${baseNoEnd}${weakRestore === 'وُ' ? 'وَا' : 'يَا'}`,
        `${baseNoEnd}${weakRestore === 'وُ' ? 'ونَ' : 'ينَ'}`,
      ];
    }
  } else if (entry.sarfType === 'Mudaaf') {
    const alt = entry.amrAr.split('/')[1]?.trim() || firstAmr;
    const altBase = stripHarakat(alt);
    amrForms = [
      firstAmr,
      `${firstAmr.replace(/[َُِ]$/, '')}َا`,
      `${firstAmr.replace(/[َُِ]$/, '')}ُوا`,
      `${firstAmr.replace(/[َُِ]$/, '')}ِي`,
      `${firstAmr.replace(/[َُِ]$/, '')}َا`,
      `${altBase.slice(0, -1)}نَ`,
    ];
  } else {
    amrForms = [
      firstAmr,
      `${amrStem}${lastPlain}َا`,
      `${amrStem}${lastPlain}ُوا`,
      `${amrStem}${lastPlain}ِي`,
      `${amrStem}${lastPlain}َا`,
      lastPlain === 'ن' ? `${amrStem}نَّ` : `${amrStem}${lastPlain}ْنَ`,
    ];
  }

  // Build Nahi (لَا + جزم from mudari indices 6..11)
  const hadhirIndices = [6, 7, 8, 9, 10, 11];
  const nahiForms = hadhirIndices.map((idx, pos) => {
    const mForm = mudari14[idx] || '';
    if (pos === 0) {
      // Singular masc jussive
      if (entry.sarfType === 'Ajwaf') {
        return `لَا ${mForm.replace(/([ويا])(.)ُ$/, '$2ْ')}`;
      }
      if (entry.sarfType === 'Naqis' || entry.sarfType === 'Lafif') {
        return `لَا ${mForm.replace(/[يواى]$/, '')}`;
      }
      return `لَا ${mForm.replace(/ُ$/, 'ْ').replace(/ُّ$/, 'َّ')}`;
    }
    if (pos === 5) {
      return `لَا ${mForm}`; // Fem plural stays mabni
    }
    return `لَا ${mForm.replace(/نِ$/, '').replace(/نَ$/, 'ا')}`;
  });

  return AMR_META.map((meta, i) => ({
    sigahBn: meta.sigahBn,
    sigahAr: meta.sigahAr,
    amrAr: amrForms[i] || firstAmr,
    nahiAr: nahiForms[i] || `لَا ${mudari14[6 + i] || ''}`,
  }));
}

export function buildFullSarfPackage(entry: MasdarEntry): FullSarfPackage {
  const madiMaruf = conjugateRegularMadi(entry.madiAr);
  const mudariMaruf = conjugateRegularMudari(entry.mudariAr);
  const madiMajhul = buildMajhulMadi(entry);
  const mudariMajhul = buildMajhulMudari(entry, mudariMaruf);
  const amrRows6 = buildAmrAndNahi6(entry, mudariMaruf);

  const rows14: SigahRow[] = SIGAH_META.map((meta, idx) => ({
    index: idx + 1,
    sigahAr: meta.sigahAr,
    sigahBn: meta.sigahBn,
    pronounHint: meta.pronounHint,
    madiMaruf: madiMaruf[idx] || entry.madiAr,
    mudariMaruf: mudariMaruf[idx] || entry.mudariAr,
    madiMajhul: madiMajhul[idx] || '—',
    mudariMajhul: mudariMajhul[idx] || '—',
  }));

  const roots = entry.rootLetters.split(' ').filter(Boolean);
  let zarfAr = '—';
  let alahAr = '—';
  if (entry.babCategory === 'Thulathi Mujarrad' && roots.length === 3) {
    const [f, a, l] = roots;
    const isMafIl = entry.babNameBn.includes('দরাবা') || entry.sarfType === 'Mithal';
    zarfAr = isMafIl ? `مَ${f}ْ${a}ِلٌ` : `مَ${f}ْ${a}َلٌ`;
    alahAr = `مِ${f}ْ${a}َلٌ`;
  } else if (entry.ismMafulAr && entry.ismMafulAr !== '—' && !entry.ismMafulAr.includes(' ')) {
    zarfAr = `${entry.ismMafulAr} (ইসমে মাফউলের ওজনে)`;
  }

  let sarfNoteBn = 'সহীহ (তিন মূল অক্ষরে কোনো হরফে ইল্লাত বা হামযা নেই)।';
  switch (entry.sarfType) {
    case 'Mahmuz':
      sarfNoteBn = 'মাহমুয: মূল অক্ষরে হামযা (أ) আছে। আমর বা মুদারিতে তাখফীফের (হালকা করার) নিয়ম প্রযোজ্য হতে পারে।';
      break;
    case 'Mudaaf':
      sarfNoteBn = 'মুদাআফ: আইন ও লাম কালিমা একই হরফ। জমা মুয়ান্নাস থেকে মুতাকাল্লিম পর্যন্ত ইদগাম (তাশদীদ) খুলে যায় (যেমন: مَدَدْتُ)।';
      break;
    case 'Mithal':
      sarfNoteBn = 'মিসালে ওয়াভী: ফা কালিমার و মুদারি মা‘রূফ ও আমরে বিলুপ্ত হয় (যেমন: وَعَدَ → يَعِدُ → عِدْ)।';
      break;
    case 'Ajwaf':
      sarfNoteBn = 'আজওয়াফ: আইন কালিমা দুর্বল অক্ষর। জমা মুয়ান্নাস গায়েব থেকে নুনে তাসনিয়া/তা-ই ফায়েল যুক্ত হলে মাঝের আলিফ পড়ে যায় (যেমন: قَالَ → قُلْتُ)।';
      break;
    case 'Naqis':
      sarfNoteBn = 'নাক্বিস: লাম কালিমা দুর্বল অক্ষর (و/ي)। জমা মুযাক্কার ও ওয়াহিদ মুয়ান্নাস গায়েবে তা‘লীলের নিয়মে পরিবর্তিত হয়।';
      break;
    case 'Lafif':
      sarfNoteBn = 'লাফীফ: মূলে দুটি দুর্বল অক্ষর আছে। এর সাথে মিসাল ও নাক্বিস উভয়ের বিধান একসাথে কার্যকর হয়।';
      break;
    default:
      if (entry.babCategory === 'Rubai') {
        sarfNoteBn = 'রুবাই (৪ মূল অক্ষর): মুনশাঈবের নিয়ম অনুযায়ী এর মুদারির আলামতে সর্বদা পেশ (يُفَعْلِلُ) হয়।';
      } else if (entry.babCategory === 'Thulathi Mazid') {
        sarfNoteBn = `সুলাসি মাজীদ ফীহ (${entry.babNameBn}): মূল তিন অক্ষরের সাথে অতিরিক্ত হরফ যুক্ত হয়ে নতুন অর্থবৈচিত্র্য তৈরি করে।`;
      }
      break;
  }

  return {
    rows14,
    amrRows6,
    zarfAr,
    alahAr,
    sarfNoteBn,
  };
}
