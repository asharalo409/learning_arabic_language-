import { ChapterInfo, DetailedLesson, VocabItem } from '../types/academy';
import { CURRICULUM_VOCAB_DECK } from '../data/curriculumVocabDeck';
import { DAILY_LESSON_GROUPS } from '../data/dailyLessonsData';
import { ALL_ISM_CATEGORIES } from '../data/ismCategoriesPart2';
import { buildDetailedLessonForSlot } from '../data/lessonGenerator';
import { DOMAIN_BANK_PART1, MabadiVocabItem } from '../data/mabadiDailyBank';
import { DOMAIN_BANK_PART2 } from '../data/mabadiDailyBankPart2';
import { SAFWATUL_MASADIR_LIST } from '../data/safwatulMasadirData';
import { SIFAT_CATEGORIES } from '../data/sifatBankData';

interface GlossaryEntry {
  canonicalKey: string;
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  category: string;
  root?: string;
  exampleAr?: string;
  exampleBn?: string;
  exampleEn?: string;
}

export interface DeduplicatedCurriculumVocabResult {
  words: VocabItem[];
  skippedPreviouslyTaughtCount: number;
  totalExtractedCandidates: number;
}

export interface DeduplicatedDailyVocabResult {
  words: MabadiVocabItem[];
  skippedPreviouslyTaughtCount: number;
}

function stripDiacritics(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .trim();
}

export function cleanPunctuation(raw: string): string {
  return raw.replace(/[؟،.!:,;"'«»()\[\]{}0-9٠-٩]/g, '').trim();
}

export function normalizeArabicTokenKey(raw: string): string {
  return stripDiacritics(cleanPunctuation(raw)).replace(/\s+/g, ' ').trim();
}

export function isArabicWordToken(raw: string): boolean {
  const cleaned = stripDiacritics(cleanPunctuation(raw));
  return /[\u0621-\u064A]{2,}/.test(cleaned);
}

const ESSENTIAL_DIALOGUE_LEXICON: Array<{
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  category: string;
  root?: string;
  aliases?: string[];
}> = [
  { arabic: 'السَّلَامُ', pronunciationBn: 'আসসালামু', meaningBn: 'শান্তি / নিরাপত্তা', meaningEn: 'Peace', category: 'অভিবাদন', root: 'س ل م' },
  { arabic: 'عَلَيْكُمْ', pronunciationBn: 'আলাইকুম', meaningBn: 'আপনাদের ওপর', meaningEn: 'Upon you', category: 'হরফে জার ও সর্বনাম', aliases: ['عَلَيْكَ', 'عَلَيْكِ', 'عَلَيْهِ'] },
  { arabic: 'وَرَحْمَةُ', pronunciationBn: 'ওয়া রাহমাতু', meaningBn: 'এবং দয়া / করুণা', meaningEn: 'And mercy', category: 'ইবাদত ও দুআ', root: 'ر ح م', aliases: ['رَحْمَةُ', 'رَحْمَةٌ'] },
  { arabic: 'اللَّهِ', pronunciationBn: 'আল্লাহি', meaningBn: 'আল্লাহ (মহান স্রষ্টা)', meaningEn: 'Allah', category: 'আকীদা', aliases: ['اللَّهُ', 'اللَّهَ', 'بِاللَّهِ', 'لِلَّهِ'] },
  { arabic: 'وَبَرَكَاتُهُ', pronunciationBn: 'ওয়া বারাকাতুহু', meaningBn: 'এবং তাঁর বরকতসমূহ', meaningEn: 'And His blessings', category: 'অভিবাদন', root: 'ب ر ك' },
  { arabic: 'أَهْلًا', pronunciationBn: 'আহলান', meaningBn: 'স্বাগতম', meaningEn: 'Welcome', category: 'অভিবাদন' },
  { arabic: 'سَهْلًا', pronunciationBn: 'সাহলান', meaningBn: 'সহজ ও আনন্দময় আগমন', meaningEn: 'Welcome warmly', category: 'অভিবাদন', aliases: ['وَسَهْلًا'] },
  { arabic: 'مَرْحَبًا', pronunciationBn: 'মারহাবান', meaningBn: 'সাদর সম্ভাষণ / স্বাগতম', meaningEn: 'Hello / Welcome', category: 'অভিবাদন' },
  { arabic: 'صَبَاحُ', pronunciationBn: 'সাবাহু', meaningBn: 'সকালবেলা', meaningEn: 'Morning', category: 'সময়', root: 'ص ب ح', aliases: ['صَبَاحًا'] },
  { arabic: 'مَسَاءُ', pronunciationBn: 'মাসাউ', meaningBn: 'সন্ধ্যাবেলা', meaningEn: 'Evening', category: 'সময়', root: 'م س و', aliases: ['مَسَاءً'] },
  { arabic: 'الخَيْرِ', pronunciationBn: 'আল-খাইরি', meaningBn: 'কল্যাণ / মঙ্গল', meaningEn: 'Goodness', category: 'অভিবাদন', root: 'خ ي ر', aliases: ['خَيْرٌ', 'خَيْرٍ'] },
  { arabic: 'النُّورِ', pronunciationBn: 'আন-নূরি', meaningBn: 'আলো / জ্যোতি', meaningEn: 'Light', category: 'গুণ', root: 'ن و ر', aliases: ['نُورٌ'] },
  { arabic: 'كَيْفَ', pronunciationBn: 'কাইফা', meaningBn: 'কেমন / কীভাবে', meaningEn: 'How', category: 'প্রশ্নবোধক' },
  { arabic: 'حَالُكَ', pronunciationBn: 'হালুকা', meaningBn: 'তোমার অবস্থা', meaningEn: 'Your condition', category: 'কথোপকথন', root: 'ح و ل', aliases: ['حَالُكِ', 'حَالِي', 'حَالٌ'] },
  { arabic: 'بِخَيْرٍ', pronunciationBn: 'বি-খাইরিন', meaningBn: 'ভালো / কল্যাণের সাথে', meaningEn: 'Fine / Well', category: 'কথোপকথন' },
  { arabic: 'الحَمْدُ', pronunciationBn: 'আল-হামদু', meaningBn: 'সকল প্রশংসা', meaningEn: 'All praise', category: 'ইবাদত ও দুআ', root: 'ح م د', aliases: ['حَمْدٌ'] },
  { arabic: 'شُكْرًا', pronunciationBn: 'শুকরান', meaningBn: 'ধন্যবাদ', meaningEn: 'Thank you', category: 'ভদ্রতা', root: 'ش ك ر' },
  { arabic: 'عَفْوًا', pronunciationBn: 'আফওয়ান', meaningBn: 'স্বাগতম / ক্ষমা করবেন', meaningEn: 'You are welcome / Excuse me', category: 'ভদ্রতা', root: 'ع ف و' },
  { arabic: 'نَعَمْ', pronunciationBn: 'না‘আম', meaningBn: 'হ্যাঁ / জি', meaningEn: 'Yes', category: 'মৌলিক' },
  { arabic: 'لَا', pronunciationBn: 'লা', meaningBn: 'না / নয়', meaningEn: 'No / Not', category: 'নাফী ও নাহী' },
  { arabic: 'أَنَا', pronunciationBn: 'আনা', meaningBn: 'আমি', meaningEn: 'I', category: 'সর্বনাম (দমীর)' },
  { arabic: 'نَحْنُ', pronunciationBn: 'নাহনু', meaningBn: 'আমরা', meaningEn: 'We', category: 'সর্বনাম (দমীর)' },
  { arabic: 'أَنْتَ', pronunciationBn: 'আন্তা', meaningBn: 'তুমি (পুং)', meaningEn: 'You (m.)', category: 'সর্বনাম (দমীর)' },
  { arabic: 'أَنْتِ', pronunciationBn: 'আনতি', meaningBn: 'তুমি (স্ত্রী)', meaningEn: 'You (f.)', category: 'সর্বনাম (দমীর)' },
  { arabic: 'أَنْتُمْ', pronunciationBn: 'আন্তুম', meaningBn: 'তোমরা', meaningEn: 'You (pl.)', category: 'সর্বনাম (দমীর)' },
  { arabic: 'هُوَ', pronunciationBn: 'হুয়া', meaningBn: 'সে / তিনি (পুং)', meaningEn: 'He / It', category: 'সর্বনাম (দমীর)' },
  { arabic: 'هِيَ', pronunciationBn: 'হিয়া', meaningBn: 'সে / তিনি (স্ত্রী)', meaningEn: 'She / It', category: 'সর্বনাম (দমীর)' },
  { arabic: 'هُمْ', pronunciationBn: 'হুম', meaningBn: 'তারা (পুং)', meaningEn: 'They (m.)', category: 'সর্বনাম (দমীর)' },
  { arabic: 'هٰذَا', pronunciationBn: 'হাযা', meaningBn: 'এটি / এই (পুং)', meaningEn: 'This (m.)', category: 'ইসমে ইশারা', aliases: ['هَذَا'] },
  { arabic: 'هٰذِهِ', pronunciationBn: 'হাযিহি', meaningBn: 'এটি / এই (স্ত্রী)', meaningEn: 'This (f.)', category: 'ইসমে ইশারা', aliases: ['هَذِهِ'] },
  { arabic: 'ذٰلِكَ', pronunciationBn: 'যালিকা', meaningBn: 'ঐটি (পুং)', meaningEn: 'That (m.)', category: 'ইসমে ইশারা', aliases: ['ذَلِكَ'] },
  { arabic: 'تِلْكَ', pronunciationBn: 'তিলকা', meaningBn: 'ঐটি (স্ত্রী)', meaningEn: 'That (f.)', category: 'ইসমে ইশারা' },
  { arabic: 'هُنَا', pronunciationBn: 'হুনা', meaningBn: 'এখানে', meaningEn: 'Here', category: 'যরফ (স্থান)' },
  { arabic: 'هُنَاكَ', pronunciationBn: 'হুনাকা', meaningBn: 'সেখানে', meaningEn: 'There', category: 'যরফ (স্থান)' },
  { arabic: 'فِي', pronunciationBn: 'ফী', meaningBn: 'মধ্যে / ভিতরে', meaningEn: 'In / Inside', category: 'হরফে জার' },
  { arabic: 'مِنْ', pronunciationBn: 'মিন', meaningBn: 'থেকে / হতে', meaningEn: 'From', category: 'হরফে জার', aliases: ['مِنَ'] },
  { arabic: 'إِلَى', pronunciationBn: 'ইলা', meaningBn: 'দিকে / পর্যন্ত', meaningEn: 'To / Towards', category: 'হরফে জার' },
  { arabic: 'عَلَى', pronunciationBn: 'আলা', meaningBn: 'উপরে / দায়িত্বে', meaningEn: 'On / Upon', category: 'হরফে জার' },
  { arabic: 'عَنْ', pronunciationBn: 'আন', meaningBn: 'সম্পর্কে / থেকে', meaningEn: 'About / From', category: 'হরফে জার', aliases: ['عَنِ'] },
  { arabic: 'مَعَ', pronunciationBn: 'মা‘আ', meaningBn: 'সাথে / সঙ্গে', meaningEn: 'With', category: 'যরফ' },
  { arabic: 'عِنْدَ', pronunciationBn: 'ইনদা', meaningBn: 'নিকটে / কাছে', meaningEn: 'At / With / Near', category: 'যরফ', aliases: ['عِنْدِي', 'عِنْدَكَ'] },
  { arabic: 'بَيْنَ', pronunciationBn: 'বাইনা', meaningBn: 'মাঝে / মধ্যে', meaningEn: 'Between', category: 'যরফ' },
  { arabic: 'أَمَامَ', pronunciationBn: 'আমামা', meaningBn: 'সামনে', meaningEn: 'In front of', category: 'যরফ' },
  { arabic: 'خَلْفَ', pronunciationBn: 'খালফা', meaningBn: 'পিছনে', meaningEn: 'Behind', category: 'যরফ' },
  { arabic: 'قَبْلَ', pronunciationBn: 'ক্বাবলা', meaningBn: 'পূর্বে / আগে', meaningEn: 'Before', category: 'যরফ' },
  { arabic: 'بَعْدَ', pronunciationBn: 'বা‘দা', meaningBn: 'পরে', meaningEn: 'After', category: 'যরফ' },
  { arabic: 'هَلْ', pronunciationBn: 'হাল', meaningBn: 'কি (প্রশ্নবোধক)', meaningEn: 'Is / Do (question)', category: 'প্রশ্নবোধক' },
  { arabic: 'مَا', pronunciationBn: 'মা', meaningBn: 'কী / যা / না', meaningEn: 'What / Not', category: 'প্রশ্নবোধক' },
  { arabic: 'مَاذَا', pronunciationBn: 'মাযা', meaningBn: 'কী (ক্রিয়ামুখী প্রশ্ন)', meaningEn: 'What', category: 'প্রশ্নবোধক' },
  { arabic: 'مَنْ', pronunciationBn: 'মান', meaningBn: 'কে / যিনি', meaningEn: 'Who', category: 'প্রশ্নবোধক' },
  { arabic: 'أَيْنَ', pronunciationBn: 'আইনা', meaningBn: 'কোথায়', meaningEn: 'Where', category: 'প্রশ্নবোধক' },
  { arabic: 'مَتَى', pronunciationBn: 'মাতা', meaningBn: 'কখন', meaningEn: 'When', category: 'প্রশ্নবোধক' },
  { arabic: 'كَمْ', pronunciationBn: 'কাম', meaningBn: 'কত / কতটি', meaningEn: 'How many / How much', category: 'প্রশ্নবোধক' },
  { arabic: 'لِمَاذَا', pronunciationBn: 'লিমাযা', meaningBn: 'কেন', meaningEn: 'Why', category: 'প্রশ্নবোধক' },
  { arabic: 'الَّذِي', pronunciationBn: 'আল্লাযী', meaningBn: 'যিনি / যেটি (পুং)', meaningEn: 'Who / Which (m.)', category: 'ইসমে মাওসূল' },
  { arabic: 'الَّتِي', pronunciationBn: 'আল্লাতী', meaningBn: 'যিনি / যেটি (স্ত্রী)', meaningEn: 'Who / Which (f.)', category: 'ইসমে মাওসূল' },
  { arabic: 'الَّذِينَ', pronunciationBn: 'আল্লাযীনা', meaningBn: 'যাঁরা / যারা', meaningEn: 'Who / Those who', category: 'ইসমে মাওসূল' },
  { arabic: 'إِنَّ', pronunciationBn: 'ইন্না', meaningBn: 'নিশ্চয়ই', meaningEn: 'Indeed / Verily', category: 'হরফে মুশাব্বাহ' },
  { arabic: 'أَنَّ', pronunciationBn: 'আন্না', meaningBn: 'যে / নিশ্চয়ই', meaningEn: 'That', category: 'হরফে মুশাব্বাহ' },
  { arabic: 'لٰكِنَّ', pronunciationBn: 'লাকিন্না', meaningBn: 'কিন্তু / তথাপি', meaningEn: 'But / However', category: 'হরফে মুশাব্বাহ', aliases: ['لَكِنَّ', 'لَكِنْ'] },
  { arabic: 'كَانَ', pronunciationBn: 'কানা', meaningBn: 'ছিল / হতো', meaningEn: 'Was / Were', category: 'আফআলে নাকিছাহ', aliases: ['كَانَتْ', 'كُنْتُ'] },
  { arabic: 'لَيْسَ', pronunciationBn: 'লাইসা', meaningBn: 'নয় / নেই', meaningEn: 'Is not', category: 'আফআলে নাকিছাহ', aliases: ['لَيْسَتْ'] },
  { arabic: 'لَمْ', pronunciationBn: 'লাম', meaningBn: 'না (অতীত না-বোধক)', meaningEn: 'Did not', category: 'আমিল' },
  { arabic: 'لَنْ', pronunciationBn: 'লান', meaningBn: 'কখনো না (ভবিষ্যৎ)', meaningEn: 'Will never', category: 'আমিল' },
  { arabic: 'يَا', pronunciationBn: 'ইয়া', meaningBn: 'হে / ওহে', meaningEn: 'O (vocative)', category: 'হরফে নিদা' },
  { arabic: 'ثُمَّ', pronunciationBn: 'ছুম্মা', meaningBn: 'তারপর / অতঃপর', meaningEn: 'Then', category: 'সংযোজক (আতফ)' },
  { arabic: 'أَوْ', pronunciationBn: 'আও', meaningBn: 'অথবা / কিংবা', meaningEn: 'Or', category: 'সংযোজক (আতফ)' },
  { arabic: 'أَيْضًا', pronunciationBn: 'আইদান', meaningBn: 'আরও / এবং তা-ও', meaningEn: 'Also / Too', category: 'কথোপকথন' },
  { arabic: 'جِدًّا', pronunciationBn: 'জিদ্দান', meaningBn: 'অত্যন্ত / খুব', meaningEn: 'Very / Extremely', category: 'বিশেষণ সহায়ক' },
  { arabic: 'كَثِيرًا', pronunciationBn: 'কাছীরান', meaningBn: 'অনেক / প্রচুর', meaningEn: 'Much / Often', category: 'পরিমাণ' },
  { arabic: 'قَلِيلًا', pronunciationBn: 'ক্বালীলান', meaningBn: 'অল্প / কিছু', meaningEn: 'A little', category: 'পরিমাণ' },
  { arabic: 'كُلُّ', pronunciationBn: 'কুল্লু', meaningBn: 'প্রত্যেক / সকল', meaningEn: 'Every / All', category: 'সমষ্টিবাচক', aliases: ['كُلَّ', 'كُلِّ'] },
  { arabic: 'بَعْضُ', pronunciationBn: 'বা‘দু', meaningBn: 'কিছু / কোনো কোনো', meaningEn: 'Some', category: 'সমষ্টিবাচক' },
  { arabic: 'اليَوْمَ', pronunciationBn: 'আল-ইয়াওমা', meaningBn: 'আজ / আজকের দিন', meaningEn: 'Today', category: 'সময়', aliases: ['يَوْمٌ', 'يَوْمٍ'] },
  { arabic: 'غَدًا', pronunciationBn: 'গাদান', meaningBn: 'আগামীকাল', meaningEn: 'Tomorrow', category: 'সময়' },
  { arabic: 'أَمْسِ', pronunciationBn: 'আমসি', meaningBn: 'গতকাল', meaningEn: 'Yesterday', category: 'সময়' },
  { arabic: 'الآنَ', pronunciationBn: 'আল-আনা', meaningBn: 'এখন / বর্তমানে', meaningEn: 'Now', category: 'সময়' },
  { arabic: 'دَائِمًا', pronunciationBn: 'দা-ইমান', meaningBn: 'সর্বদা / সবসময়', meaningEn: 'Always', category: 'সময়' },
  { arabic: 'طَالِبٌ', pronunciationBn: 'তালিবুন', meaningBn: 'ছাত্র / শিক্ষার্থী', meaningEn: 'Student', category: 'শিক্ষা', root: 'ط ل ب', aliases: ['الطَّالِبُ', 'طَالِبَةٌ'] },
  { arabic: 'تِلْمِيذٌ', pronunciationBn: 'তিলমীযুন', meaningBn: 'ছাত্র / শিষ্য', meaningEn: 'Pupil / Student', category: 'শিক্ষা', aliases: ['التِّلْمِيذُ', 'تِلْمِيذَةٌ'] },
  { arabic: 'أُسْتَاذٌ', pronunciationBn: 'উস্তাযুন', meaningBn: 'শিক্ষক / অধ্যাপক', meaningEn: 'Teacher / Professor', category: 'শিক্ষা', aliases: ['الأُسْتَاذُ', 'أُسْتَاذِي'] },
  { arabic: 'مُعَلِّمٌ', pronunciationBn: 'মু‘আল্লিমুন', meaningBn: 'শিক্ষক', meaningEn: 'Teacher', category: 'শিক্ষা', aliases: ['المُعَلِّمُ', 'مُعَلِّمَةٌ'] },
  { arabic: 'اِسْمٌ', pronunciationBn: 'ইসমুন', meaningBn: 'নাম / বিশেষ্য', meaningEn: 'Name / Noun', category: 'মৌলিক', aliases: ['اسْمِي', 'اسْمُكَ', 'الِاسْمُ'] },
  { arabic: 'لُغَةٌ', pronunciationBn: 'লুগাতুন', meaningBn: 'ভাষা', meaningEn: 'Language', category: 'শিক্ষা', aliases: ['اللُّغَةَ', 'اللُّغَةُ'] },
  { arabic: 'العَرَبِيَّةُ', pronunciationBn: 'আল-আরাবিয়্যাহ', meaningBn: 'আরবি ভাষা', meaningEn: 'Arabic language', category: 'শিক্ষা', aliases: ['العَرَبِيَّةِ', 'عَرَبِيَّةٌ', 'العَرَبِيَّةَ'] },
  { arabic: 'جُمْلَةٌ', pronunciationBn: 'জুমলাতুন', meaningBn: 'বাক্য', meaningEn: 'Sentence', category: 'নাহু', aliases: ['جُمْلَةٍ'] },
  { arabic: 'مُفِيدَةٌ', pronunciationBn: 'মুফীদাতুন', meaningBn: 'উপকারী / অর্থপূর্ণ', meaningEn: 'Useful / Meaningful', category: 'গুণ', aliases: ['مُفِيدٌ'] },
  { arabic: 'بِإِذْنِ', pronunciationBn: 'বি-ইযনি', meaningBn: 'অনুমতিক্রমে / ইচ্ছায়', meaningEn: 'With permission of', category: 'দুআ' },
  { arabic: 'إِنْ', pronunciationBn: 'ইন', meaningBn: 'যদি', meaningEn: 'If', category: 'শর্ত' },
  { arabic: 'شَاءَ', pronunciationBn: 'শা-আ', meaningBn: 'ইচ্ছা করেছেন', meaningEn: 'Willed', category: 'ক্রিয়া', root: 'ش ي أ' },
  { arabic: 'فَضْلِكَ', pronunciationBn: 'ফাদলিকা', meaningBn: 'আপনার অনুগ্রহে (দয়া করে)', meaningEn: 'Please (by your grace)', category: 'ভদ্রতা', root: 'ف ض ل' },
  { arabic: 'جَمِيلٌ', pronunciationBn: 'জামীলুন', meaningBn: 'সুন্দর', meaningEn: 'Beautiful', category: 'সিফাত', aliases: ['جَمِيلَةٌ', 'الجَمِيلُ'] },
  { arabic: 'جَيِّدٌ', pronunciationBn: 'জাইয়্যিদুন', meaningBn: 'উত্তম / ভালো', meaningEn: 'Good / Well', category: 'সিফাত', aliases: ['جَيِّدًا'] },
  { arabic: 'حَسَنًا', pronunciationBn: 'হাসানান', meaningBn: 'বেশ ভালো / আচ্ছা', meaningEn: 'Okay / Good', category: 'কথোপকথন' },
  { arabic: 'طَيِّبٌ', pronunciationBn: 'তাইয়্যিবুন', meaningBn: 'পবিত্র / ভালো', meaningEn: 'Good / Pure', category: 'সিফাত', aliases: ['طَيِّبًا'] },
  { arabic: 'القُرْآنُ', pronunciationBn: 'আল-কুরআনু', meaningBn: 'মহাগ্রন্থ আল-কুরআন', meaningEn: 'The Noble Quran', category: 'কুরআনিক', aliases: ['القُرْآنَ', 'القُرْآنِ'] },
  { arabic: 'رَبِّ', pronunciationBn: 'রাব্বি', meaningBn: 'প্রতিপালক / রব', meaningEn: 'Lord', category: 'আকীদা', aliases: ['رَبُّ', 'رَبَّنَا'] },
  { arabic: 'العَالَمِينَ', pronunciationBn: 'আল-আলামীন', meaningBn: 'সকল জগতবাসী', meaningEn: 'All the worlds', category: 'কুরআনিক' },
];

let cachedGlossary: Map<string, GlossaryEntry> | null = null;

function getMasterGlossary(): Map<string, GlossaryEntry> {
  if (cachedGlossary) return cachedGlossary;
  const map = new Map<string, GlossaryEntry>();

  const register = (keyRaw: string, entry: GlossaryEntry) => {
    const key = normalizeArabicTokenKey(keyRaw);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, entry);
    }
  };

  // 1. Essential dialogue & function words
  for (const item of ESSENTIAL_DIALOGUE_LEXICON) {
    const canonicalKey = normalizeArabicTokenKey(item.arabic);
    const entry: GlossaryEntry = {
      canonicalKey,
      arabic: item.arabic,
      pronunciationBn: item.pronunciationBn,
      meaningBn: item.meaningBn,
      meaningEn: item.meaningEn,
      category: item.category,
      root: item.root,
    };
    register(item.arabic, entry);
    item.aliases?.forEach((a) => register(a, entry));
  }

  // 2. Categorized Ism (350) & Sifat (140)
  for (const cat of [...ALL_ISM_CATEGORIES, ...SIFAT_CATEGORIES]) {
    for (const item of cat.entries) {
      const canonicalKey = normalizeArabicTokenKey(item.arabic);
      const entry: GlossaryEntry = {
        canonicalKey,
        arabic: item.arabic,
        pronunciationBn: item.pronunciationBn,
        meaningBn: item.meaningBn,
        meaningEn: item.meaningEn,
        category: item.categoryTitleBn,
        root: item.rootLetters,
        exampleAr: item.exampleAr,
        exampleBn: item.exampleBn,
      };
      register(item.arabic, entry);
      if (item.pluralOrFemAr) {
        register(item.pluralOrFemAr, entry);
      }
    }
  }

  // 3. Safwatul Masadir (877 Masdars + Madi/Mudari/Amr/Fail/Maful forms)
  for (const m of SAFWATUL_MASADIR_LIST) {
    const canonicalKey = normalizeArabicTokenKey(m.masdarAr);
    const entry: GlossaryEntry = {
      canonicalKey,
      arabic: m.masdarAr,
      pronunciationBn: m.masdarPronunciationBn,
      meaningBn: m.meaningBn,
      meaningEn: m.meaningEn,
      category: m.babNameBn,
      root: `${m.rootLetters} · মাদি: ${m.madiAr} · মুদারি: ${m.mudariAr}`,
      exampleAr: m.exampleAr,
      exampleBn: m.exampleBn,
    };
    register(m.masdarAr, entry);
    register(m.madiAr, { ...entry, arabic: m.madiAr });
    register(m.mudariAr, { ...entry, arabic: m.mudariAr });
    register(m.amrAr, { ...entry, arabic: m.amrAr });
    register(m.ismFailAr, { ...entry, arabic: m.ismFailAr });
    register(m.ismMafulAr, { ...entry, arabic: m.ismMafulAr });
  }

  // 4. Domain vocabulary banks (Mabadiul Arabiyyah 20 themes)
  for (const dom of [...DOMAIN_BANK_PART1, ...DOMAIN_BANK_PART2]) {
    for (const v of dom.vocabulary) {
      const canonicalKey = normalizeArabicTokenKey(v.arabic);
      const entry: GlossaryEntry = {
        canonicalKey,
        arabic: v.arabic,
        pronunciationBn: v.pronunciationBn,
        meaningBn: v.meaningBn,
        meaningEn: v.meaningEn,
        category: dom.mabadiLevelBn,
        root: v.masdarNote,
      };
      register(v.arabic, entry);
    }
  }

  // 5. Complete curriculum vocab deck
  for (const v of CURRICULUM_VOCAB_DECK) {
    const canonicalKey = normalizeArabicTokenKey(v.arabic);
    const entry: GlossaryEntry = {
      canonicalKey,
      arabic: v.arabic,
      pronunciationBn: v.pronunciationBn,
      meaningBn: v.meaningBn,
      meaningEn: v.meaningEn,
      category: v.category,
      root: v.root,
      exampleAr: v.exampleAr,
      exampleBn: v.exampleBn,
      exampleEn: v.exampleEn,
    };
    register(v.arabic, entry);
  }

  cachedGlossary = map;
  return map;
}

export function lookupTokenInGlossary(rawToken: string): GlossaryEntry | null {
  const glossary = getMasterGlossary();
  const base = normalizeArabicTokenKey(rawToken);
  if (!base || base.length < 2) return null;

  const candidates: string[] = [base];

  // Strip conjunctions و / ف
  if ((base.startsWith('و') || base.startsWith('ف')) && base.length >= 3) {
    candidates.push(base.slice(1));
  }

  // Expand each candidate with common Arabic prefixes/suffixes
  const expanded: string[] = [];
  for (const c of candidates) {
    expanded.push(c);
    if ((c.startsWith('ب') || c.startsWith('ل') || c.startsWith('ك')) && c.length >= 4) {
      expanded.push(c.slice(1));
    }
    if (c.startsWith('لل') && c.length >= 4) {
      expanded.push('ال' + c.slice(2));
      expanded.push(c.slice(2));
    }
  }

  for (const c of [...expanded]) {
    if (c.startsWith('ال') && c.length >= 4) {
      expanded.push(c.slice(2));
    } else if (!c.startsWith('ال')) {
      expanded.push('ال' + c);
    }
  }

  // Possessive pronoun suffixes (-ي, -ك, -ه, -ها, -نا, -هم)
  for (const c of [...expanded]) {
    for (const suf of ['نا', 'ها', 'هم', 'كم']) {
      if (c.endsWith(suf) && c.length - suf.length >= 3) {
        const stem = c.slice(0, -suf.length);
        expanded.push(stem);
        if (stem.endsWith('ت')) expanded.push(stem.slice(0, -1) + 'ة');
      }
    }
    for (const suf of ['ي', 'ك', 'ه']) {
      if (c.endsWith(suf) && c.length - 1 >= 3) {
        const stem = c.slice(0, -1);
        expanded.push(stem);
        if (stem.endsWith('ت')) expanded.push(stem.slice(0, -1) + 'ة');
      }
    }
    // Feminine plural/tashkeel-taa normalization
    if (c.endsWith('ه') && c.length >= 3) {
      expanded.push(c.slice(0, -1) + 'ة');
    }
  }

  for (const cand of expanded) {
    const found = glossary.get(cand);
    if (found) return found;
  }

  return null;
}

function collectSentencesFromLesson(lesson: DetailedLesson): { arabic: string; bn: string; en: string }[] {
  const out: { arabic: string; bn: string; en: string }[] = [];
  lesson.conversation.forEach((line) => {
    out.push({ arabic: line.arabic, bn: line.translationBn, en: line.translationEn });
  });
  lesson.grammarExamples.forEach((ex) => {
    out.push({ arabic: ex.arabic, bn: ex.meaningBn, en: ex.meaningEn || ex.meaningBn });
  });
  if (lesson.writingTargetHintAr) {
    out.push({
      arabic: lesson.writingTargetHintAr,
      bn: lesson.writingPromptBn,
      en: lesson.writingPromptEn,
    });
  }
  return out;
}

function processSingleCurriculumLesson(
  lesson: DetailedLesson,
  seenWords: Set<string>
): DeduplicatedCurriculumVocabResult {
  const words: VocabItem[] = [];
  let skippedPreviouslyTaughtCount = 0;
  let totalExtractedCandidates = 0;

  const tryAddWord = (item: VocabItem, canonicalOverride?: string) => {
    const key = canonicalOverride || normalizeArabicTokenKey(item.arabic);
    if (!key) return;
    totalExtractedCandidates++;
    if (seenWords.has(key)) {
      skippedPreviouslyTaughtCount++;
      return;
    }
    seenWords.add(key);
    words.push(item);
  };

  // 1. Explicit lesson newVocabulary first (prioritized authored definitions)
  for (const v of lesson.newVocabulary) {
    const matched = lookupTokenInGlossary(v.arabic);
    tryAddWord(v, matched?.canonicalKey || normalizeArabicTokenKey(v.arabic));
  }

  // 2. Scan every sentence in dialogue, grammar examples, and hints to capture ALL words used in the lesson
  const sentences = collectSentencesFromLesson(lesson);
  for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
    const sent = sentences[sIdx];
    const tokens = sent.arabic.split(/\s+/);
    for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
      const rawTok = tokens[tIdx];
      if (!isArabicWordToken(rawTok)) continue;
      const entry = lookupTokenInGlossary(rawTok);
      if (!entry) continue;
      const cleanTok = cleanPunctuation(rawTok);
      tryAddWord(
        {
          id: `${lesson.id}-ext-${sIdx}-${tIdx}`,
          arabic: entry.arabic || cleanTok,
          pronunciationBn: entry.pronunciationBn,
          meaningBn: entry.meaningBn,
          meaningEn: entry.meaningEn,
          category: entry.category,
          root: entry.root,
          chapterNumber: lesson.chapterNumber,
          exampleAr: sent.arabic,
          exampleBn: sent.bn,
          exampleEn: sent.en,
        },
        entry.canonicalKey
      );
    }
  }

  return { words, skippedPreviouslyTaughtCount, totalExtractedCandidates };
}

/**
 * Computes strictly sequential non-duplicating complete vocabulary for a curriculum lesson.
 * Every word introduced in ch1-l1 .. chN-lM is marked seen chronologically so later lessons never repeat earlier words.
 */
export function getDeduplicatedCurriculumLessonVocab(
  targetChapterNumber: number,
  targetLessonNumber: number,
  allChapters: ChapterInfo[],
  allDetailedLessons: Record<string, DetailedLesson>
): DeduplicatedCurriculumVocabResult {
  const seenWords = new Set<string>();
  const sortedChapters = [...allChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  for (const chapter of sortedChapters) {
    if (chapter.chapterNumber > targetChapterNumber) break;
    const maxLesson = chapter.chapterNumber === targetChapterNumber ? targetLessonNumber : 10;

    for (let ls = 1; ls <= maxLesson; ls++) {
      const lessonId = `ch${chapter.chapterNumber}-l${ls}`;
      const lesson = allDetailedLessons[lessonId] || buildDetailedLessonForSlot(chapter, ls);
      const res = processSingleCurriculumLesson(lesson, seenWords);
      if (chapter.chapterNumber === targetChapterNumber && ls === targetLessonNumber) {
        return res;
      }
    }
  }

  return { words: [], skippedPreviouslyTaughtCount: 0, totalExtractedCandidates: 0 };
}

let cachedDailyVocabMap: Map<number, DeduplicatedDailyVocabResult> | null = null;

function ensureDailyVocabMap(): Map<number, DeduplicatedDailyVocabResult> {
  if (cachedDailyVocabMap) return cachedDailyVocabMap;
  const map = new Map<number, DeduplicatedDailyVocabResult>();
  const seenWords = new Set<string>();

  for (const grp of DAILY_LESSON_GROUPS) {
    for (const lesson of grp.lessons) {
      const words: MabadiVocabItem[] = [];
      let skipped = 0;

      const tryAddDaily = (item: MabadiVocabItem, canonicalOverride?: string) => {
        const key = canonicalOverride || normalizeArabicTokenKey(item.arabic);
        if (!key) return;
        if (seenWords.has(key)) {
          skipped++;
          return;
        }
        seenWords.add(key);
        words.push(item);
      };

      for (const v of lesson.newVocabulary) {
        const matched = lookupTokenInGlossary(v.arabic);
        tryAddDaily(v, matched?.canonicalKey || normalizeArabicTokenKey(v.arabic));
      }

      const textSources = [
        ...lesson.sentences.map((s) => s.arabic),
        lesson.grammarRule.exampleAr,
      ];

      for (const sentenceText of textSources) {
        const tokens = sentenceText.split(/\s+/);
        for (const rawTok of tokens) {
          if (!isArabicWordToken(rawTok)) continue;
          const entry = lookupTokenInGlossary(rawTok);
          if (!entry) continue;
          tryAddDaily(
            {
              arabic: entry.arabic || cleanPunctuation(rawTok),
              pronunciationBn: entry.pronunciationBn,
              meaningBn: entry.meaningBn,
              meaningEn: entry.meaningEn,
              masdarNote: entry.root || entry.category,
            },
            entry.canonicalKey
          );
        }
      }

      map.set(lesson.lessonNumber, {
        words,
        skippedPreviouslyTaughtCount: skipped,
      });
    }
  }

  cachedDailyVocabMap = map;
  return map;
}

/**
 * Returns strictly sequential non-duplicating vocabulary for Mabadiul Arabiyyah Daily Lessons 1..100.
 */
export function getDeduplicatedDailyLessonVocab(lessonNumber: number): DeduplicatedDailyVocabResult {
  const map = ensureDailyVocabMap();
  return map.get(lessonNumber) || { words: [], skippedPreviouslyTaughtCount: 0 };
}
