import { CURRICULUM_VOCAB_DECK } from './curriculumVocabDeck';
import { QURAN_ALL_SHORT_SURAHS, QURANIC_AYAT } from './quranicData';

export interface WordGrammarDetail {
  arabic: string;
  pronunciationBn?: string;
  meaningBn: string;
  root: string;
  sarfBn: string;
  nahwBn: string;
  posBn: string;
  isCurated: boolean;
}

/** Strips Arabic harakat, small alif, pause marks, and normalizes hamza/alif variants for reliable matching. */
export function normalizeArabicWord(word: string): string {
  return word
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0621-\u064A]/g, '')
    .trim();
}

const CORE_QURAN_LEXICON: Record<string, Omit<WordGrammarDetail, 'arabic' | 'isCurated'>> = {
  بسم: {
    pronunciationBn: 'বিসমি',
    meaningBn: 'নামে (শুরু করছি)',
    root: 'س م و',
    posBn: 'হরফে জার + ইসম',
    sarfBn: 'بِ (জার অব্যয়) + اِسْم (মূলধাতু س-م-و; আলিফে ওয়াসল পড়ে গেছে)।',
    nahwBn: 'بِ দ্বারা মাজরূর (শেষে কাসরা), এবং পরবর্তী اللَّهِ-এর সাথে মুদাফ।',
  },
  الله: {
    pronunciationBn: 'আল্লা-হু / আল্লা-হি',
    meaningBn: 'আল্লাহ (মহা-মর্যাদাবান সৃষ্টিকর্তা)',
    root: 'أ ل ه',
    posBn: 'ইসমুল জালালাহ',
    sarfBn: 'الإِلَٰه থেকে তা‘যীমসূচক একক নাম; মূলধাতু أ ل ه।',
    nahwBn: 'বাক্যের অবস্থান ভেদে মারফু (দম্মা), মানসুব (ফাতহা) বা মাজরূর (কাসরা) হয়।',
  },
  لله: {
    pronunciationBn: 'লিল্লা-হি',
    meaningBn: 'আল্লাহর জন্য / আল্লাহরই',
    root: 'أ ل ه',
    posBn: 'জার-মাজরূর',
    sarfBn: 'لِ (মালিকানা/উদ্দেশ্যসূচক হরফে জার) + اللَّهِ (সংযোগে আলিফ লুপ্ত)।',
    nahwBn: 'জার ও মাজরূর মিলে খবর বা মুতা‘আল্লিক হয়।',
  },
  الرحمن: {
    pronunciationBn: 'আর-রাহমা-ন',
    meaningBn: 'পরম করুণাময়',
    root: 'ر ح م',
    posBn: 'সিফাতে মুশাব্বাহাহ (গুণবাচক ইসম)',
    sarfBn: 'فَعْلَانُ ওজনে—সবার প্রতি প্রবল ও পরিব্যাপ্ত দয়া বোঝায়; মূলধাতু ر ح م।',
    nahwBn: 'اللَّهِ-এর না‘ত (বিশেষণ); পূর্বের ইসমের ই‘রাব অনুসরণ করে।',
  },
  الرحيم: {
    pronunciationBn: 'আর-রাহীম',
    meaningBn: 'অসীম ও চিরন্তন দয়ালু',
    root: 'ر ح م',
    posBn: 'সিফাতে মুশাব্বাহাহ',
    sarfBn: 'فَعِيلٌ ওজনে—স্থায়ী ও অবিরাম দয়া (মুমিনদের জন্য বিশেষ রহমত)।',
    nahwBn: 'اللَّهِ-এর দ্বিতীয় না‘ত (বিশেষণ)।',
  },
  الحمد: {
    pronunciationBn: 'আল-হামদু',
    meaningBn: 'সকল প্রশংসা ও কৃতজ্ঞতা',
    root: 'ح م د',
    posBn: 'ইসম (মাসদার) · মুবতাদা',
    sarfBn: 'الْ (ইস্তিগরাফ/সর্বব্যাপী) + حَمْدٌ (মূলধাতু ح م د)।',
    nahwBn: 'জুমলা ইসমিয়ার মুবতাদা (উদ্দেশ্য) হওয়ায় মারফু (শেষে পেশ)।',
  },
  رب: {
    pronunciationBn: 'রব্বু / রব্বি',
    meaningBn: 'প্রতিপালক, মালিক, নিয়ন্ত্রক',
    root: 'ر ب ب',
    posBn: 'ইসম (সিফাত / বদল)',
    sarfBn: 'মূলধাতু ر ب ب (মুদা‘আফ — দুইটি বা একত্রিত হয়ে তাশদীদ হয়েছে)।',
    nahwBn: 'সাধারণত পরবর্তী শব্দের সাথে মুদাফ হয়ে বসে।',
  },
  برب: {
    pronunciationBn: 'বিরাব্বি',
    meaningBn: 'প্রতিপালকের নিকট / রবের নামে',
    root: 'ر ب ب',
    posBn: 'হরফে জার + মুদাফ',
    sarfBn: 'بِ (ইস্তি‘আনাহ/আশ্রয় অর্থে জার) + رَبِّ (মূলধাতু ر ب ب)।',
    nahwBn: 'بِ হরফে জারের কারণে رَبِّ মাজরূর (কাসরা) এবং পরের শব্দের মুদাফ।',
  },
  العالمين: {
    pronunciationBn: 'আল-আ-লামীন',
    meaningBn: 'সমস্ত সৃষ্টিজগতের',
    root: 'ع ل م',
    posBn: 'ইসম (জমা মুজাক্কার সালিম মুলহাক)',
    sarfBn: 'عَالَم এর বহুবচন عَالَمُونَ (জর অবস্থায় عَالَمِينَ)।',
    nahwBn: 'মুদাফ ইলাইহি হওয়ায় মাজরূর; জর-এর চিহ্ন ـِينَ-এর ইয়া (ي)।',
  },
  مالك: {
    pronunciationBn: 'মা-লিকি',
    meaningBn: 'অধিপতি, মালিক',
    root: 'م ل ك',
    posBn: 'ইসমু ফা‘ইল (কর্তাবাচক)',
    sarfBn: 'فَاعِل ওজনে মালিক/ক্ষমতাবান; মূলধাতু م ل ك।',
    nahwBn: 'رَبِّ-এর বিশেষণ (না‘ত) হয়ে মাজরূর হয়েছে।',
  },
  يوم: {
    pronunciationBn: 'ইয়াওমি',
    meaningBn: 'দিবস / দিন',
    root: 'ي و م',
    posBn: 'ইসম (মুদাফ)',
    sarfBn: 'তিন অক্ষরের ইসম; মূলধাতু ي و م (আজওয়াফ)।',
    nahwBn: 'مَالِكِ-এর মুদাফ ইলাইহি হয়ে মাজরূর এবং الدِّينِ-এর মুদাফ।',
  },
  الدين: {
    pronunciationBn: 'আদ-দীন',
    meaningBn: 'প্রতিদান / বিচার / দ্বীন',
    root: 'د ي ن',
    posBn: 'ইসম (মাজরূর)',
    sarfBn: 'মাসদার; মূলধাতু د ي ن (প্রতিদান দেওয়া/আনুগত্য করা)।',
    nahwBn: 'মুদাফ ইলাইহি হওয়ায় মাজরূর (শেষে কাসরা)।',
  },
  اياك: {
    pronunciationBn: 'ইয়্যা-কা',
    meaningBn: 'একমাত্র আপনারই',
    root: 'ضمير',
    posBn: 'দমীরে মানসুব মুনফাসিল',
    sarfBn: 'পৃথক কর্মবাচক সর্বনাম; كَ ২য় পুরুষ একবচন পুংলিঙ্গ।',
    nahwBn: 'ক্রিয়ার পূর্বে আগত মাফ‘উল বিহি (মুকাদ্দাম) — একনিষ্ঠতা ও সীমাবদ্ধতা বোঝায়।',
  },
  نعبد: {
    pronunciationBn: 'না‘বুদু',
    meaningBn: 'আমরা ইবাদত করি',
    root: 'ع ب د',
    posBn: 'ফেলে মুদারি',
    sarfBn: 'বাব নাসারা (عَبَدَ – يَعْبُدُ), মুতাকাল্লিম মা‘আল গাইর (نَ আলামত)।',
    nahwBn: 'মারফু ফেলে মুদারি; এর ফায়েল ভেতরে নাহনু (نَحْنُ) উহ্য।',
  },
  نستعين: {
    pronunciationBn: 'নাসতা‘ঈনু',
    meaningBn: 'আমরা সাহায্য চাই',
    root: 'ع و ن',
    posBn: 'ফেলে মুদারি (বাব ইস্তিফ‘আল)',
    sarfBn: 'اِسْتَفْعَلَ – يَسْتَفْعِلُ (মূলধাতু ع و ن); চাহিদা বা প্রার্থনা বোঝায়।',
    nahwBn: 'মারফু ফেলে মুদারি, ফায়েল নাহনু (নহনু) ভেতরে লুকানো।',
  },
  اهدنا: {
    pronunciationBn: 'ইহদিনা',
    meaningBn: 'আমাদেরকে পথ দেখান',
    root: 'ه د ي',
    posBn: 'ফেলে আমর (দু‘আ) + দমীর',
    sarfBn: 'বাব দারাবা (هَدَى – يَهْدِي); নাকিসে ইয়ায়ি হওয়ায় আমরে শেষের ي পড়ে গেছে।',
    nahwBn: 'দু‘আসূচক আমর, ফায়েল أنت উহ্য, نَا ১ম মাফ‘উল বিহি।',
  },
  الصراط: {
    pronunciationBn: 'আস-সিরা-তা',
    meaningBn: 'পথ / মহাসড়ক',
    root: 'ص ر ط',
    posBn: 'ইসম (মাফ‘উল বিহি ২য়)',
    sarfBn: 'প্রশস্ত ও স্পষ্ট পথ বোঝাতে একবচন ইসম।',
    nahwBn: 'اهْدِنَا ক্রিয়ার ২য় মাফ‘উল বিহি হওয়ায় মানসুব (শেষে যবর)।',
  },
  المستقيم: {
    pronunciationBn: 'আল-মুসতাকীম',
    meaningBn: 'সুদৃঢ় ও সরল-সঠিক',
    root: 'ق و م',
    posBn: 'ইসমু ফা‘ইল (বাব ইস্তিফ‘আল)',
    sarfBn: 'اسْتَقَامَ – يَسْتَقِيمُ থেকে مُسْتَقِيم (যে পথ একদম সোজা)।',
    nahwBn: 'الصِّرَاطَ-এর না‘ত (গুণবাচক বিশেষণ), মানসুব।',
  },
  قل: {
    pronunciationBn: 'কুল',
    meaningBn: 'বলুন / ঘোষণা করুন',
    root: 'ق و ل',
    posBn: 'ফেলে আমর (আদেশসূচক ক্রিয়া)',
    sarfBn: 'قَالَ – يَقُولُ (আজওয়াফে ওয়াওই); আমর গঠনে মধ্যবর্তী و লোপ পেয়েছে।',
    nahwBn: 'সুকূনযুক্ত মাবনি ফেলে আমর; ফায়েল ভেতরে أَنْتَ (হে নবী সা.) উহ্য।',
  },
  اعوذ: {
    pronunciationBn: 'আ‘ঊযু',
    meaningBn: 'আমি আশ্রয় প্রার্থনা করছি',
    root: 'ع و ذ',
    posBn: 'ফেলে মুদারি (১ম পুরুষ)',
    sarfBn: 'عَاذَ – يَعُوذُ (আজওয়াফে ওয়াওই, বাব নাসারা); أَ মুতাকাল্লিমের আলামত।',
    nahwBn: 'মারফু ফেলে মুদারি; ফায়েল أَنَا ভেতরে উহ্য।',
  },
  هو: {
    pronunciationBn: 'হুয়া',
    meaningBn: 'তিনি (আল্লাহ)',
    root: 'ضمير',
    posBn: 'দমীরে মুনফাসিল (পৃথক সর্বনাম)',
    sarfBn: '৩য় পুরুষ পুংলিঙ্গ একবচন সর্বনাম।',
    nahwBn: 'মুবতাদা বা দমীরুশ শা‘ন (মহলের দিক থেকে মারফু)।',
  },
  احد: {
    pronunciationBn: 'আহাদুন',
    meaningBn: 'এক ও অদ্বিতীয়',
    root: 'أ ح د',
    posBn: 'ইসম (সিফাত / খবর)',
    sarfBn: 'যার কোনো অংশ, সংখ্যা বা সমকক্ষ নেই (وَاحِد থেকেও অধিক অদ্বিতীয় অর্থবোধক)।',
    nahwBn: 'খবর হওয়ায় মারফু (শেষে দুই পেশ)।',
  },
  الصمد: {
    pronunciationBn: 'আস-সামাদু',
    meaningBn: 'অমুখাপেক্ষী (সকলে তাঁর মুখাপেক্ষী)',
    root: 'ص م د',
    posBn: 'সিফাত (গুণবাচক ইসম)',
    sarfBn: 'মূলধাতু ص م د (সবার আশ্রয়স্থল ও পরিপূর্ণ অমুখাপেক্ষী)।',
    nahwBn: 'اللَّهُ মুবতাদার খবর হওয়ায় মারফু।',
  },
  لم: {
    pronunciationBn: 'লাম',
    meaningBn: 'না / কখনো নয় (অতীত নঞর্থক)',
    root: 'حرف',
    posBn: 'হরফে জযম ও নাফি',
    sarfBn: 'অপরিবর্তনীয় অব্যয় (মাবনি)।',
    nahwBn: 'পরবর্তী ফেলে মুদারিকে জযম (সুকূন) দেয় এবং অর্থ অতীতে নিয়ে যায়।',
  },
  يلد: {
    pronunciationBn: 'ইয়ালিদ',
    meaningBn: 'তিনি জন্ম দেননি',
    root: 'و ل د',
    posBn: 'ফেলে মুদারি মাজযূম',
    sarfBn: 'وَلَدَ – يَلِدُ (মিসালে ওয়াওই); মুদারিতে শুরু ওয়াও লোপ পেয়েছে।',
    nahwBn: 'لَمْ দ্বারা মাজযূম হওয়ায় শেষে সুকূন হয়েছে।',
  },
  يولد: {
    pronunciationBn: 'ইঊলাদ',
    meaningBn: 'তাঁকে জন্ম দেওয়া হয়নি',
    root: 'و ل د',
    posBn: 'ফেলে মুদারি মাজহূল (কর্মবাচ্য)',
    sarfBn: 'প্রথম বর্ণে পেশ ও আইন কালিমায় যবর দিয়ে মাজহূল (passive) রূপ।',
    nahwBn: 'لَمْ দ্বারা মাজযূম (সুকূন), নায়েবে ফায়েল ভেতরে هُوَ উহ্য।',
  },
  يكن: {
    pronunciationBn: 'ইয়াকুন',
    meaningBn: 'হয়নি / ছিল না',
    root: 'ك و ن',
    posBn: 'ফেলে নাকিস (মুদারি মাজযূম)',
    sarfBn: 'كَانَ – يَكُونُ থেকে জযম অবস্থায় মধ্যবর্তী و লোপ পেয়ে يَكُنْ হয়েছে।',
    nahwBn: 'كَانَ-এর অনুরূপ: এর ইসম (أَحَدٌ) মারফু ও খবর (كُفُوًا) মানসুব।',
  },
  كفوا: {
    pronunciationBn: 'কুফুওয়ান',
    meaningBn: 'সমতুল্য / সমকক্ষ',
    root: 'ك ف أ',
    posBn: 'ইসম (খবরে কানা)',
    sarfBn: 'فُعُل ওজনে সমান বা সদৃশ; মূলধাতু ك ف أ।',
    nahwBn: 'يَكُنْ-এর অগ্রবর্তী খবর হওয়ায় মানসুব (দুই যবর)।',
  },
  من: {
    pronunciationBn: 'মিন',
    meaningBn: 'থেকে / হতে',
    root: 'حرف',
    posBn: 'হরফে জার (অব্যয়)',
    sarfBn: 'অপরিবর্তনীয় অব্যয় (মাবনি)।',
    nahwBn: 'পরবর্তী ইসমকে মাজরূর (কাসরা) করে।',
  },
  شر: {
    pronunciationBn: 'শাররি',
    meaningBn: 'অনিষ্ট / ক্ষতি',
    root: 'ش ر ر',
    posBn: 'ইসম মাজরূর ও মুদাফ',
    sarfBn: 'মুদা‘আফ (ش ر ر — দুইটি রা একত্রে তাশদীদ হয়েছে)।',
    nahwBn: 'مِن্ হরফে জারের কারণে মাজরূর (কাসরা)।',
  },
  ما: {
    pronunciationBn: 'মা',
    meaningBn: 'যা / যা কিছু (অথবা না)',
    root: 'اسم / حرف',
    posBn: 'ইসমে মাওসুল বা নাফি অব্যয়',
    sarfBn: 'মাবনি শব্দ (রূপান্তর হয় না)।',
    nahwBn: 'বাক্যের ব্যবহার অনুযায়ী "যা কিছু" (মাওসুল) অথবা "না" (নেতিবাচক) অর্থ দেয়।',
  },
  خلق: {
    pronunciationBn: 'খালাকা',
    meaningBn: 'তিনি সৃষ্টি করেছেন',
    root: 'خ ل ق',
    posBn: 'ফেলে মাদি (অতীত কাল)',
    sarfBn: 'বাব নাসারা (خَلَقَ – يَخْلُقُ); ৩য় পুরুষ একবচন পুংলিঙ্গ।',
    nahwBn: 'ফাতহার ওপর মাবনি ফেলে মাদি; ফায়েল هُوَ (আল্লাহ) উহ্য।',
  },
  اذا: {
    pronunciationBn: 'ইযা',
    meaningBn: 'যখন',
    root: 'ظرف',
    posBn: 'যরফে যামান (সময়বাচক শর্ত)',
    sarfBn: 'সুকূনের ওপর মাবনি।',
    nahwBn: 'ভবিষ্যৎ বা সাধারণ শর্তের সময় নির্দেশ করে এবং পরবর্তী বাক্যে মুদাফ হয়।',
  },
  في: {
    pronunciationBn: 'ফী',
    meaningBn: 'মধ্যে / ভিতরে',
    root: 'حرف',
    posBn: 'হরফে জার',
    sarfBn: 'অপরিবর্তনীয় অব্যয়।',
    nahwBn: 'পরবর্তী ইসমকে কাসরা (মাজরূর) প্রদান করে।',
  },
  لفي: {
    pronunciationBn: 'লাফী',
    meaningBn: 'অবশ্যই (মধ্যে)',
    root: 'حرف',
    posBn: 'লামে তাওকীদ + হরফে জার',
    sarfBn: 'জোরদার করার لَ + হরফে জার فِي।',
    nahwBn: 'إِنَّ-এর খবরে প্রবেশ করে অর্থকে আরও সুদৃঢ় করে।',
  },
  ان: {
    pronunciationBn: 'ইন্না',
    meaningBn: 'নিশ্চয়ই / অবশ্যই',
    root: 'حرف',
    posBn: 'হরফে মুশাব্বাহ বিল ফেল',
    sarfBn: 'মাবনি অব্যয়; নিশ্চয়তা ও গুরুত্ব প্রকাশে ব্যবহৃত।',
    nahwBn: 'এর ইসমকে মানসুব (যবর) এবং খবরকে মারফু (পেশ) করে।',
  },
  انا: {
    pronunciationBn: 'ইন্না (নিশ্চয়ই আমরা)',
    meaningBn: 'নিশ্চয়ই আমি/আমরা',
    root: 'حرف + ضمير',
    posBn: 'ইন্না + দমীর নাহনু',
    sarfBn: 'إِنَّ + نَا একীভূত হয়ে إِنَّا হয়েছে।',
    nahwBn: 'নুন তাশদীদসহ ইন্না-এর ইসম হলো نَا।',
  },
  الناس: {
    pronunciationBn: 'আন-না-স',
    meaningBn: 'মানুষ / মানবজাতি',
    root: 'ن و س / أ ن س',
    posBn: 'ইসমে জাম‘ (সমষ্টিবাচক নাম)',
    sarfBn: 'اَلْ-সহ নির্দিষ্ট সমষ্টিবাচক বিশেষ্য।',
    nahwBn: 'আগে মুদাফ থাকলে মাজরূর (النَّاسِ) হয়।',
  },
  صدور: {
    pronunciationBn: 'সুদূরি',
    meaningBn: 'অন্তরসমূহ / বক্ষসমূহ',
    root: 'ص د ر',
    posBn: 'ইসম (বহুবচন)',
    sarfBn: 'صَدْرٌ-এর জমা তাকসীর (ভগ্ন বহুবচন) فُعُول ওজনে।',
    nahwBn: 'فِي-এর মাজরূর হওয়ায় কাসরা এবং النَّاسِ-এর মুদাফ।',
  },
  الذي: {
    pronunciationBn: 'আল্লাযী',
    meaningBn: 'যিনি / যে',
    root: 'اسم موصول',
    posBn: 'ইসমে মাওসুল (একবচন পুং)',
    sarfBn: 'মাবনি সর্বনাম।',
    nahwBn: 'পূর্বের ইসমের সাথে পরবর্তী সিলাহ বাক্যকে যুক্ত করে।',
  },
  الذين: {
    pronunciationBn: 'আল্লাযীনা',
    meaningBn: 'যারা (বহুবচন)',
    root: 'اسم موصول',
    posBn: 'ইসমে মাওসুল (বহুবচন)',
    sarfBn: 'সকল অবস্থায় রূপ অপরিবর্তনীয় (ফাতহার ওপর মাবনি)।',
    nahwBn: 'পরবর্তী ক্রিয়া ও সিলাহ বাক্য নিয়ে পূর্বের গোষ্ঠীকে বোঝায়।',
  },
  الا: {
    pronunciationBn: 'ইল্লা',
    meaningBn: 'তবে / ব্যতীত / ছাড়া',
    root: 'حرف',
    posBn: 'হরফে ইসতিসনা (ব্যতিক্রম)',
    sarfBn: 'মাবনি অব্যয়।',
    nahwBn: 'সাধারণ নিয়ম থেকে পরবর্তী গোষ্ঠী বা বিষয়কে ব্যতিক্রম হিসেবে পৃথক করে।',
  },
  امنوا: {
    pronunciationBn: 'আ-মানূ',
    meaningBn: 'তারা ঈমান এনেছে',
    root: 'أ م ن',
    posBn: 'ফেলে মাদি (বাব ইফ‘আল)',
    sarfBn: 'آمَنَ – يُؤْمِنُ (আহলুল ইমান); وَاوুল জামা‘আত (তারা) যুক্ত।',
    nahwBn: 'দম্মার ওপর মাবনি ফেলে মাদি; و ফায়েল।',
  },
  وعملوا: {
    pronunciationBn: 'ওয়া আমিলূ',
    meaningBn: 'এবং তারা সৎকর্ম করেছে',
    root: 'ع م ل',
    posBn: 'আতফ + ফেলে মাদি',
    sarfBn: 'বাব সামি‘আ (عَمِلَ – يَعْمَلُ), ৩য় পুরুষ বহুবচন পুংলিঙ্গ।',
    nahwBn: 'আগে ওয়াও আতফ থাকায় آمَنُوا-এর সাথে সংযুক্ত।',
  },
  الصالحات: {
    pronunciationBn: 'আস-সা-লিহা-ত',
    meaningBn: 'সৎকর্মসমূহ / নেক কাজগুলো',
    root: 'ص ل ح',
    posBn: 'ইসম (জমা মুয়ান্নাস সালিম)',
    sarfBn: 'صَالِحَة-এর স্ত্রীবাচক সুস্থ বহুবচন।',
    nahwBn: 'عَمِلُوا ক্রিয়ার মাফ‘উল বিহি; জমা মুয়ান্নাস সালিম মানসুব অবস্থায় কাসরা নেয় (الصَّالِحَاتِ)!',
  },
  والعصر: {
    pronunciationBn: 'ওয়াল-আসর',
    meaningBn: 'সময়ের শপথ!',
    root: 'ع ص ر',
    posBn: 'ওয়াও কাসাম + ইসম মাজরূর',
    sarfBn: 'وَ (শপথ অব্যয়) + الْعَصْرِ (মূলধাতু ع ص ر)।',
    nahwBn: 'ওয়াও কাসাম হরফে জারের মতো কাজ করে পরের ইসমকে কাসরা দিয়েছে।',
  },
  الانسان: {
    pronunciationBn: 'আল-ইনসা-ন',
    meaningBn: 'মানুষ / মানবজাতি',
    root: 'أ ن س',
    posBn: 'ইসম (মানসুব / মারফু)',
    sarfBn: 'মূলধাতু أ ن س বা ن س ي; জাতিবাচক اَلْ যুক্ত।',
    nahwBn: 'إِنَّ-এর পর বসলে ইসমু ইন্না হিসেবে মানসুব (যবর) হয়।',
  },
  خسر: {
    pronunciationBn: 'খুসরিন',
    meaningBn: 'ক্ষতি ও ধ্বংসের মধ্যে',
    root: 'خ س ر',
    posBn: 'মাসদার (ইসম মাজরূর)',
    sarfBn: 'فُعْل ওজনে ক্রিয়ামূল; অনির্দিষ্ট তানভীন দিয়ে গভীর ক্ষতি বোঝানো হয়েছে।',
    nahwBn: 'فِي হরফে জারের কারণে মাজরূর (দুই কাসরা)।',
  },
  لا: {
    pronunciationBn: 'লা',
    meaningBn: 'না / নয়',
    root: 'حرف',
    posBn: 'হরফে নাফি / নাহি',
    sarfBn: 'মাবনি অব্যয়।',
    nahwBn: 'নাকারা/নাফি অর্থে না-বোধক এবং নাহি অর্থে ক্রিয়াকে জযম দেয়।',
  },
  ولا: {
    pronunciationBn: 'ওয়া লা',
    meaningBn: 'এবং না / আরও নয়',
    root: 'حرف',
    posBn: 'আতফ + নাফি অব্যয়',
    sarfBn: 'وَ সংযোজক + لَا না-বোধক অব্যয়।',
    nahwBn: 'পূর্ববর্তী নঞর্থক বক্তব্যকে আরও জোরদার করে।',
  },
  لك: {
    pronunciationBn: 'লাকা',
    meaningBn: 'আপনার জন্য',
    root: 'حرف + ضمير',
    posBn: 'জার-মাজরূর',
    sarfBn: 'لِ হরফে জার + كَ সর্বনাম।',
    nahwBn: 'সর্বনামের পূর্বে জারের লাম ফাতহা (لَ) হয়।',
  },
  لكم: {
    pronunciationBn: 'লাকুম',
    meaningBn: 'তোমাদের জন্য',
    root: 'حرف + ضمير',
    posBn: 'জার-মাজরূর',
    sarfBn: 'لَ + كُمْ (২য় পুরুষ বহুবচন সর্বনাম)।',
    nahwBn: 'অগ্রবর্তী খবর (খবরে মুকাদ্দাম)।',
  },
  دينكم: {
    pronunciationBn: 'দীনুকুম',
    meaningBn: 'তোমাদের দ্বীন / ধর্ম',
    root: 'د ي ن',
    posBn: 'ইসম + দমীর মুদাফ ইলাইহি',
    sarfBn: 'دِينُ (মূলধাতু د ي ن) + كُمْ যুক্ত সর্বনাম।',
    nahwBn: 'বিলম্বিত মুবতাদা (মুবতাদা মুআখখার) হওয়ায় মারফু।',
  },
  اعطيناك: {
    pronunciationBn: 'আ‘তাইনা-কা',
    meaningBn: 'আমি আপনাকে দান করেছি',
    root: 'ع ط و',
    posBn: 'ফেলে মাদি + ফায়েল + মাফ‘উল',
    sarfBn: 'বাব ইফ‘আল (أَعْطَى – يُعْطِي); নাকিস ওয়াওই + نَا (ফায়েল) + كَ (মাফ‘উল)।',
    nahwBn: 'দ্বিকর্মক ক্রিয়া; প্রথম কর্ম كَ, দ্বিতীয় কর্ম الْكَوْثَرَ।',
  },
  الكوثر: {
    pronunciationBn: 'আল-কাওসার',
    meaningBn: 'অফুরন্ত কল্যাণ ও হাউযে কাওসার',
    root: 'ك ث ر',
    posBn: 'ইসম (মাফ‘উল বিহি ২য়)',
    sarfBn: 'فَوْعَل ওজনে আধিক্যসূচক শব্দ; মূলধাতু ك ث ر।',
    nahwBn: 'أَعْطَى ক্রিয়ার ২য় কর্ম হওয়ায় মানসুব (শেষে যবর)।',
  },
  فصل: {
    pronunciationBn: 'ফাসাল্লি',
    meaningBn: 'অতএব নামায পড়ুন',
    root: 'ص ل و',
    posBn: 'ফা তাফরী‘ + ফেলে আমর',
    sarfBn: 'বাব তাফ‘ঈল (صَلَّى – يُصَلِّي); নাকিস হওয়ায় আমরে শেষের ي পড়ে নিচে কাসরা থেকেছে।',
    nahwBn: 'হরুফে ইল্লাত লোপ পাওয়ার ওপর মাবনি ফেলে আমর।',
  },
  لربك: {
    pronunciationBn: 'লিরাব্বিকা',
    meaningBn: 'আপনার প্রতিপালকের উদ্দেশ্যে',
    root: 'ر ب ب',
    posBn: 'জার-মাজরূর + মুদাফ ইলাইহি',
    sarfBn: 'لِ + رَبِّ + كَ।',
    nahwBn: 'لِ জারের কারণে رَبِّ মাজরূর এবং كَ মুদাফ ইলাইহি।',
  },
  وانحر: {
    pronunciationBn: 'ওয়ানহার',
    meaningBn: 'এবং কুরবানি করুন',
    root: 'ن ح ر',
    posBn: 'আতফ + ফেলে আমর',
    sarfBn: 'বাব ফাতাহা (نَحَرَ – يَنْحَرُ); মূলধাতু ن ح ر।',
    nahwBn: 'সুকূনের ওপর মাবনি ফেলে আমর।',
  },
  تبت: {
    pronunciationBn: 'তাব্বাত',
    meaningBn: 'ধ্বংস হোক / ব্যর্থ হয়েছে',
    root: 'ت ب ب',
    posBn: 'ফেলে মাদি (স্ত্রীবাচক একবচন)',
    sarfBn: 'মুদা‘আফ (ت ب ب) + তায়ে তা‘নীস সাকিনাহ (تْ)।',
    nahwBn: 'বদদোয়া/নিশ্চিত ধ্বংস অর্থে অতীত ক্রিয়া, ফায়েল يَدَا।',
  },
  جاء: {
    pronunciationBn: 'জা-আ',
    meaningBn: 'এসেছে / আগমন করেছে',
    root: 'ج ي أ',
    posBn: 'ফেলে মাদি (আজওয়াফে ইয়ায়ি)',
    sarfBn: 'جَاءَ – يَجِيءُ; বাব দারাবা।',
    nahwBn: 'ফাতহার ওপর মাবনি ফেলে মাদি; ফায়েল نَصْرُ।',
  },
  نصر: {
    pronunciationBn: 'নাসরু',
    meaningBn: 'সাহায্য / বিজয়',
    root: 'ن ص ر',
    posBn: 'মাসদার (ফায়েল)',
    sarfBn: 'বাব নাসারা-এর মূল মাসদার।',
    nahwBn: 'جَاءَ ক্রিয়ার ফায়েল হওয়ায় মারফু (শেষে পেশ) এবং اللَّهِ-এর মুদাফ।',
  },
  الم: {
    pronunciationBn: 'আলাম',
    meaningBn: 'নয় কি? / আপনি কি দেখেননি?',
    root: 'حرف',
    posBn: 'হামযাতুল ইসতিফহাম + লাম জযম',
    sarfBn: 'أَ (প্রশ্নবোধক) + لَمْ (না-বোধক জযম অব্যয়)।',
    nahwBn: 'ইসতিফহামে তাকরীরী (নিশ্চিত স্বীকারোক্তি নেওয়ার প্রশ্ন) + পরের মুদারিকে জযম দেয়।',
  },
  والضحى: {
    pronunciationBn: 'ওয়াদ-দুহা',
    meaningBn: 'পূর্বাহ্নের (আলোকোজ্জ্বল সকালের) শপথ!',
    root: 'ض ح و',
    posBn: 'ওয়াও কাসাম + ইসম মাজরূর',
    sarfBn: 'নাকিসে ওয়াওই মূলধাতু ض ح و।',
    nahwBn: 'ওয়াও কাসামের কারণে মাজরূর (মাকসূর হওয়ায় তাকদীরী কাসরা)।',
  },
  والليل: {
    pronunciationBn: 'ওয়াল-লাইলি',
    meaningBn: 'রাতের শপথ!',
    root: 'ل ي ل',
    posBn: 'আতফ/কাসাম + ইসম মাজরূর',
    sarfBn: 'لَيْلٌ একবচন বিশেষ্য।',
    nahwBn: 'الضُّحَىٰ-এর ওপর আতফ হওয়ায় মাজরূর (কাসরা)।',
  },
  والشمس: {
    pronunciationBn: 'ওয়াশ-শামসি',
    meaningBn: 'সূর্যের শপথ!',
    root: 'ش م س',
    posBn: 'ওয়াও কাসাম + ইসম মাজরূর',
    sarfBn: 'শামসী হরফ ش হওয়ায় ل উচ্চারিত না হয়ে তাশদীদ হয়েছে।',
    nahwBn: 'ওয়াও কাসাম দ্বারা মাজরূর।',
  },
  والفجر: {
    pronunciationBn: 'ওয়াল-ফাজরি',
    meaningBn: 'ভোর / ফজরের শপথ!',
    root: 'ف ج ر',
    posBn: 'ওয়াও কাসাম + ইসম মাজরূর',
    sarfBn: 'فَعْل ওজনে; মূলধাতু ف ج ر (ভোর ফুটে বের হওয়া)।',
    nahwBn: 'ওয়াও কাসাম দ্বারা মাজরূর।',
  },
  اقرا: {
    pronunciationBn: 'ইকরা',
    meaningBn: 'পড়ুন! / পাঠ করুন',
    root: 'ق ر أ',
    posBn: 'ফেলে আমর (মাহমুযুল লাম)',
    sarfBn: 'قَرَأَ – يَقْرَأُ (বাব ফাতাহা); আমরে অয়সলী আলিফ যুক্ত হয়েছে।',
    nahwBn: 'সুকূনের ওপর মাবনি ফেলে আমর; ফায়েল أَنْتَ উহ্য।',
  },
  سبح: {
    pronunciationBn: 'সাব্বিহ',
    meaningBn: 'পবিত্রতা ঘোষণা করুন',
    root: 'س ب ح',
    posBn: 'ফেলে আমর (বাব তাফ‘ঈল)',
    sarfBn: 'سَبَّحَ – يُسَبِّحُ ওজনের আমর (আধিক্য ও ধারাবাহিকতা)।',
    nahwBn: 'সুকূনযুক্ত মাবনি ফেলে আমর (ওয়াসল হলে কাসরা দিয়ে পড়া হয়)।',
  },
};

const indexedCache: Map<string, Omit<WordGrammarDetail, 'arabic' | 'isCurated'>> = (() => {
  const map = new Map<string, Omit<WordGrammarDetail, 'arabic' | 'isCurated'>>();

  // 1. Core lexicon first
  Object.entries(CORE_QURAN_LEXICON).forEach(([normKey, val]) => {
    map.set(normKey, val);
  });

  // 2. Surah keyWords from existing QURAN_ALL_SHORT_SURAHS data
  QURAN_ALL_SHORT_SURAHS.forEach((surah) => {
    surah.keyWords.forEach((kw) => {
      const norm = normalizeArabicWord(kw.arabic);
      if (norm && !map.has(norm)) {
        map.set(norm, {
          pronunciationBn: kw.pronunciationBn,
          meaningBn: `${kw.meaningBn} (${kw.meaningEn})`,
          root: kw.root,
          posBn: kw.posBn,
          sarfBn: `মূলধাতু (মাদ্দাহ): ${kw.root} · পদ: ${kw.posBn}`,
          nahwBn: kw.grammarNoteBn,
        });
      }
    });
  });

  // 3. Detailed QURANIC_AYAT word-by-word analyses
  QURANIC_AYAT.forEach((ayah) => {
    ayah.words.forEach((w) => {
      const norm = normalizeArabicWord(w.arabic);
      if (norm) {
        map.set(norm, {
          pronunciationBn: w.pronunciationBn,
          meaningBn: `${w.meaningBn} (${w.meaningEn})`,
          root: w.root,
          posBn: w.posBn,
          sarfBn: `মূলধাতু: ${w.root} · পদ: ${w.posBn}`,
          nahwBn: w.grammarNoteBn,
        });
      }
    });
  });

  // 4. Curriculum Vocab Deck cross-index (for matching common nouns/verbs)
  CURRICULUM_VOCAB_DECK.forEach((v) => {
    const norm = normalizeArabicWord(v.arabic);
    if (norm && !map.has(norm)) {
      map.set(norm, {
        pronunciationBn: v.pronunciationBn,
        meaningBn: `${v.meaningBn} (${v.meaningEn})`,
        root: v.root || 'কুরআনিক/ক্লাসিক্যাল শব্দ',
        posBn: v.category,
        sarfBn: `পাঠ্যক্রম শব্দভাণ্ডার (${v.category})${v.root ? ` · মূলধাতু: ${v.root}` : ''}`,
        nahwBn: `উদাহরণ: ${v.exampleAr} — ${v.exampleBn}`,
      });
    }
  });

  return map;
})();

/** Extracts basic morphological (Sarf) + syntactic (Nahw) cues for any Quranic token. */
export function analyzeQuranWord(
  rawWord: string,
  ayahContext?: { nahwBn?: string; sarfBn?: string }
): WordGrammarDetail {
  const cleanedDisplay = rawWord.replace(/[۞﴿﴾٠-٩0-9]/g, '').trim();
  const norm = normalizeArabicWord(cleanedDisplay);

  // Direct match or strip leading 'و' / 'ف' conjunction to check stem
  const direct = indexedCache.get(norm);
  if (direct) {
    return {
      arabic: cleanedDisplay,
      ...direct,
      isCurated: true,
    };
  }

  if ((norm.startsWith('و') || norm.startsWith('ف')) && norm.length > 3) {
    const stemMatch = indexedCache.get(norm.slice(1));
    if (stemMatch) {
      const prefixBn = norm.startsWith('و') ? 'وَ (এবং/শপথ)' : 'فَ (অতএব/তারপর)';
      return {
        arabic: cleanedDisplay,
        ...stemMatch,
        sarfBn: `সংযুক্ত অব্যয় ${prefixBn} + ${stemMatch.sarfBn}`,
        isCurated: true,
      };
    }
  }

  // Structural morphological & syntactic analysis fallback using Arabic rules
  const sarfNotes: string[] = [];
  const nahwNotes: string[] = [];
  let posBn = 'আরবি পদ (ইসম / ফেল)';

  if (norm.startsWith('و')) {
    sarfNotes.push('শুরুতে وَ (আতফ বা কাসাম) যুক্ত আছে');
  } else if (norm.startsWith('ف')) {
    sarfNotes.push('শুরুতে فَ (তাফরী‘ / সংযোজক অব্যয়) যুক্ত আছে');
  }

  if (norm.startsWith('ال') || norm.startsWith('وال') || norm.startsWith('فال') || norm.startsWith('بال') || norm.startsWith('لل')) {
    posBn = 'ইসম মা‘রিফাহ (নির্দিষ্ট বিশেষ্য)';
    sarfNotes.push('الْـ (আলিফ-লাম) থাকায় এটি একটি নির্দিষ্ট ইসম (বিশেষ্য/বিশেষণ)');
  } else if (/[\u064D\u064C\u064B]/.test(cleanedDisplay)) {
    posBn = 'ইসম নাকিরাহ (অনির্দিষ্ট বিশেষ্য)';
    sarfNotes.push('শেষে তানভীন (ً ٍ ٌ) থাকায় এটি অনির্দিষ্ট ইসম');
  } else if (/^[يتنأ]/.test(norm) && norm.length >= 4 && !norm.startsWith('ال')) {
    posBn = 'ফেলে মুদারি / ফেল';
    sarfNotes.push('শুরুর অক্ষর মুদারি আলামতের (أ ت ي ن) সম্ভাব্য রূপ নির্দেশ করে');
  }

  if (norm.startsWith('ب') && norm.length > 3 && !norm.startsWith('با')) {
    nahwNotes.push('বাক্যে بِ হরফে জার হিসেবে ব্যবহৃত হলে পরবর্তী ইসমকে কাসরা দেয়');
  }

  if (norm.endsWith('ون') || norm.endsWith('ين')) {
    sarfNotes.push('শেষে ـُونَ / ـِينَ থাকায় এটি পুংলিঙ্গ সুস্থ বহুবচন (জমা মুজাক্কার সালিম) বা মুদারি বহুবচন হতে পারে');
  } else if (norm.endsWith('ات')) {
    sarfNotes.push('শেষে ـَات থাকায় স্ত্রীলিঙ্গ সুস্থ বহুবচন (জমা মুয়ান্নাস সালিম)');
  } else if (norm.endsWith('كم') || norm.endsWith('نا') || norm.endsWith('هم') || norm.endsWith('ها')) {
    sarfNotes.push('শেষে যুক্ত সর্বনাম (দমীর মুত্তাসিল) সংযুক্ত রয়েছে');
  }

  // Detect final I'rab vowel on the raw display word
  const lastChar = cleanedDisplay.slice(-1);
  if (lastChar === '\u064F' || lastChar === '\u064C') {
    nahwNotes.push('শেষ বর্ণে দম্মা (পেশ) → রফ‘ (মারফু: ফায়েল/মুবতাদা/খবর) অবস্থা নির্দেশ করে');
  } else if (lastChar === '\u064E' || lastChar === '\u064B') {
    nahwNotes.push('শেষ বর্ণে ফাতহা (যবর) → নসব (মানসুব: মাফ‘উল/হাল) বা মাবনি অবস্থা নির্দেশ করে');
  } else if (lastChar === '\u0650' || lastChar === '\u064D') {
    nahwNotes.push('শেষ বর্ণে কাসরা (যের) → জর (মাজরূর: হরফে জারের পর বা মুদাফ ইলাইহি) অবস্থা নির্দেশ করে');
  } else if (lastChar === '\u0652') {
    nahwNotes.push('শেষ বর্ণে সুকূন → জযম অবস্থা বা আমর/মাবনি ক্রিয়া নির্দেশ করে');
  }

  if (ayahContext?.nahwBn) {
    nahwNotes.push(`আয়াত প্রাসঙ্গিক নাহু: ${ayahContext.nahwBn}`);
  }
  if (ayahContext?.sarfBn && sarfNotes.length === 0) {
    sarfNotes.push(`আয়াত প্রাসঙ্গিক ছরফ: ${ayahContext.sarfBn}`);
  }

  return {
    arabic: cleanedDisplay,
    meaningBn: 'শব্দের গঠন ও ই‘রাব বিশ্লেষণ (আয়াতভিত্তিক)',
    root: 'মূলধাতু ও পদ বিশ্লেষণ',
    posBn,
    sarfBn:
      sarfNotes.join(' · ') ||
      'মৌলিক আরবি কালিমা (ইসম/ফেল/হরফ) — ওপরের সার্বিক ছরফ ব্যাখ্যায় রূপান্তর দেখুন।',
    nahwBn:
      nahwNotes.join(' · ') ||
      'বাক্যের তারকীবে অবস্থান অনুসারে ই‘রাব (রফ‘/নসব/জর) নির্ধারিত হয়েছে।',
    isCurated: false,
  };
}
