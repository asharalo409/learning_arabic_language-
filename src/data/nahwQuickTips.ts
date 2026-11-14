import { ALL_ISM_CATEGORIES } from './ismCategoriesPart2';
import { CURRICULUM_VOCAB_DECK } from './curriculumVocabDeck';
import { SAFWATUL_MASADIR_LIST } from './safwatulMasadirData';
import { SIFAT_CATEGORIES } from './sifatBankData';

export interface NahwQuickTip {
  id: string;
  titleAr: string;
  titleBn: string;
  categoryBn: string;
  ruleBn: string;
  irabEffectBn: string;
  exampleAr: string;
  exampleBn: string;
  meaningBn?: string;
  rootOrFormBn?: string;
  tarkibRoleBn?: string;
  tarkibReasonBn?: string;
}

export const NAHW_QUICK_TIPS: Record<string, NahwQuickTip> = {
  fi: {
    id: 'fi',
    titleAr: 'فِي (حَرْفُ جَرٍّ)',
    titleBn: 'ফি (হরফে জার — মধ্যে / ভিতরে)',
    categoryBn: 'হরফে জার (পদান্বয়ী অব্যয়)',
    ruleBn: 'কোনো স্থান, সময় বা বিষয়ের অবস্থান বোঝাতে ব্যবহৃত হয়।',
    irabEffectBn: 'এর পরবর্তী ইসমের শেষ অক্ষরে কাসরা (যের) বা জারের অবস্থা হয়।',
    exampleAr: 'الطَّالِبُ فِي الفَصْلِ.',
    exampleBn: 'ছাত্রটি শ্রেণিকক্ষের মধ্যে আছে।',
  },
  min: {
    id: 'min',
    titleAr: 'مِنْ (حَرْفُ جَرٍّ)',
    titleBn: 'মিন (হরফে জার — হতে / থেকে)',
    categoryBn: 'হরফে জার (পদান্বয়ী অব্যয়)',
    ruleBn: 'উৎপত্তি, সূচনা, অংশ বা তুলনা বোঝাতে "মِنْ" ব্যবহৃত হয়।',
    irabEffectBn: 'পরবর্তী ইসমকে মাজরূর (যেরযুক্ত) করে; আল-এর সাথে যুক্ত হলে "مِنَ" পড়া হয়।',
    exampleAr: 'خَرَجَ المُعَلِّمُ مِنَ المَسْجِدِ.',
    exampleBn: 'শিক্ষক মসজিদ থেকে বের হলেন।',
  },
  ila: {
    id: 'ila',
    titleAr: 'إِلَى (حَرْفُ جَرٍّ)',
    titleBn: 'ইলা (হরফে জার — দিকে / পর্যন্ত)',
    categoryBn: 'হরফে জার (পদান্বয়ী অব্যয়)',
    ruleBn: 'গন্তব্য, দিক বা সময়ের শেষ সীমা নির্দেশ করতে ব্যবহৃত হয়।',
    irabEffectBn: 'পরবর্তী ইসমের শেষে যের (কাসরা) প্রদান করে।',
    exampleAr: 'ذَهَبْتُ إِلَى المَدْرَسَةِ صَبَاحًا.',
    exampleBn: 'আমি সকালে বিদ্যালয়ের দিকে গেলাম।',
  },
  ala: {
    id: 'ala',
    titleAr: 'عَلَى (حَرْفُ جَرٍّ)',
    titleBn: 'আলা (হরফে জার — উপরে / দায়িত্বে)',
    categoryBn: 'হরফে জার (পদান্বয়ী অব্যয়)',
    ruleBn: 'কোনো কিছুর উপরিভাগ, আবশ্যকতা বা অনুগ্রহ বোঝাতে বসে।',
    irabEffectBn: 'পরবর্তী ইসমকে মাজরূর (যেরযুক্ত) করে।',
    exampleAr: 'الكِتَابُ عَلَى المَكْتَبِ.',
    exampleBn: 'বইটি টেবিলের উপরে আছে।',
  },
  an: {
    id: 'an',
    titleAr: 'عَنْ (حَرْفُ جَرٍّ)',
    titleBn: 'আন (হরফে জার — সম্পর্কে / থেকে দূরে)',
    categoryBn: 'হরফে জার (পদান্বয়ী অব্যয়)',
    ruleBn: 'কোনো বিষয় সম্পর্কে বলা, বর্ণনা করা (হাদীস) বা দূরত্ব বোঝাতে আসে।',
    irabEffectBn: 'পরবর্তী ইসমের শেষে কাসরা (যের) দেয়।',
    exampleAr: 'سَأَلْتُ الأُسْتَاذَ عَنِ الدَّرْسِ.',
    exampleBn: 'আমি উস্তাযকে পাঠ সম্পর্কে জিজ্ঞাসা করলাম।',
  },
  maaa: {
    id: 'maaa',
    titleAr: 'مَعَ (ظَرْفُ مَكَانٍ / مُصَاحَبَة)',
    titleBn: 'মা‘আ (যরফ — সাথে / সঙ্গে)',
    categoryBn: 'যরফ ও মুদাফ (সঙ্গবাচক)',
    ruleBn: 'কারও সাথে থাকা বা সহযোগিতা বোঝাতে ব্যবহৃত হয় এবং সাধারণত মুদাফ হয়ে আসে।',
    irabEffectBn: 'এর পরবর্তী ইসম মুদাফ ইলাইহি হিসেবে যের (মাজরূর) পায়।',
    exampleAr: 'أَدْرُسُ العَرَبِيَّةَ مَعَ أَخِي.',
    exampleBn: 'আমি আমার ভাইয়ের সাথে আরবি পড়ি।',
  },
  inda: {
    id: 'inda',
    titleAr: 'عِنْدَ (ظَرْفٌ)',
    titleBn: 'ইনদা (যরফ — নিকটে / কাছে / সময়ে)',
    categoryBn: 'যরফে মাকান ও যমান',
    ruleBn: 'মালিকানা ("আমার কাছে"), নৈকট্য বা নির্দিষ্ট সময় বোঝাতে বসে।',
    irabEffectBn: 'পরবর্তী শব্দ মুদাফ ইলাইহি হিসেবে যের (কাসরা) গ্রহণ করে।',
    exampleAr: 'عِنْدِي قَلَمٌ جَدِيدٌ.',
    exampleBn: 'আমার কাছে একটি নতুন কলম আছে।',
  },
  bism: {
    id: 'bism',
    titleAr: 'بِـ + اِسْم (جَارٌّ وَمَجْرُورٌ)',
    titleBn: 'বিসম (বা-য়ে জার + ইসম)',
    categoryBn: 'জার-মাজরূর ও ইযাফাত',
    ruleBn: 'শুরুতে "بِـ" (দ্বারা/নামে) হরফে জার এবং এরপর ইসম শব্দে ইযাফাত হয়েছে।',
    irabEffectBn: '"بِـ"-এর কারণে "اِسْمِ"-এর শেষে যের এবং পরবর্তী আল্লাহর নামেও মুদাফ ইলাইহির যের হয়েছে।',
    exampleAr: 'بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ.',
    exampleBn: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।',
  },
  inna: {
    id: 'inna',
    titleAr: 'إِنَّ (حَرْفٌ مُشَبَّهٌ بِالفِعْلِ)',
    titleBn: 'ইন্না (নিশ্চয়ই — দৃঢ়তাবাচক অব্যয়)',
    categoryBn: 'হরফে মুশাব্বাহ বিল-ফেল',
    ruleBn: 'বাক্যের শুরুতে এসে বক্তব্যকে জোরালো ও নিশ্চিত করে।',
    irabEffectBn: 'এর ইসম (প্রথম পদ) যবরযুক্ত (মানসুব) এবং খবর (দ্বিতীয় পদ) পেশযুক্ত (মারফু) হয়।',
    exampleAr: 'إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ.',
    exampleBn: 'নিশ্চয়ই আল্লাহ ক্ষমাশীল ও দয়ালু।',
  },
  anna: {
    id: 'anna',
    titleAr: 'أَنَّ (حَرْفٌ مُشَبَّهٌ بِالفِعْلِ)',
    titleBn: 'আন্না (যে / নিশ্চয়ই — মধ্যবর্তী অব্যয়)',
    categoryBn: 'হরফে মুশাব্বাহ বিল-ফেল',
    ruleBn: 'বাক্যের মাঝখানে বসে পূর্ববর্তী ক্রিয়ার সাথে পরবর্তী বাক্যাংশকে সংযুক্ত করে।',
    irabEffectBn: 'ইসমকে যবর (ফাতহা) ও খবরকে পেশ (দম্মা) দেয়।',
    exampleAr: 'أَعْلَمُ أَنَّ العِلْمَ نَافِعٌ.',
    exampleBn: 'আমি জানি যে জ্ঞান উপকারী।',
  },
  lakinna: {
    id: 'lakinna',
    titleAr: 'لٰكِنَّ (لِلاسْتِدْرَاكِ)',
    titleBn: 'লাকিন্না (কিন্তু / তথাপি)',
    categoryBn: 'হরফে মুশাব্বাহ বিল-ফেল',
    ruleBn: 'পূর্বের কথা থেকে ব্যতিক্রম বা সংশোধন তুলে ধরতে ব্যবহৃত হয়।',
    irabEffectBn: 'নিজের ইসমকে মানসুব (যবর) ও খবরকে মারফু (পেশ) করে।',
    exampleAr: 'الدَّرْسُ طَوِيلٌ لٰكِنَّهُ سَهْلٌ.',
    exampleBn: 'পাঠটি দীর্ঘ, কিন্তু তা সহজ।',
  },
  kana: {
    id: 'kana',
    titleAr: 'كَانَ (فِعْلٌ نَاقِصٌ)',
    titleBn: 'কানা (আফআলে নাকিছাহ — ছিল / হতো)',
    categoryBn: 'কানা ও তার ভগিনী (অসম্পূর্ণ ক্রিয়া)',
    ruleBn: 'ইসম ও খবরের বাক্যে অতীতকালের অবস্থা বা ধারাবাহিক গুণ বোঝাতে আসে।',
    irabEffectBn: 'ইন্নার বিপরীত: এর ইসম পেশযুক্ত (মারফু) এবং খবর যবরযুক্ত (মানসুব) হয়।',
    exampleAr: 'كَانَ الوَلَدُ مُجْتَهِدًا.',
    exampleBn: 'বালকটি পরিশ্রমী ছিল।',
  },
  laysa: {
    id: 'laysa',
    titleAr: 'لَيْسَ (لِلنَّفْيِ)',
    titleBn: 'লাইসা (আফআলে নাকিছাহ — নয় / নেই)',
    categoryBn: 'কানা ও তার ভগিনী (নেতিবাচক)',
    ruleBn: 'নামবাচক বাক্যকে (জুমলা ইসমিয়াহ) বর্তমান সময়ের জন্য না-বোধক করে।',
    irabEffectBn: 'ইসমকে পেশ ও খবরকে যবর দেয়; কখনো খবরে অতিরিক্ত "بِـ" যুক্ত হয়।',
    exampleAr: 'لَيْسَ الكَسَلُ مَحْمُودًا.',
    exampleBn: 'অলসতা প্রশংসনীয় নয়।',
  },
  asbaha: {
    id: 'asbaha',
    titleAr: 'أَصْبَحَ (فِعْلٌ نَاقِصٌ)',
    titleBn: 'আসবাহা (হয়ে গেল / সকালে উপনীত হলো)',
    categoryBn: 'কানা ও তার ভগিনী',
    ruleBn: 'সকালবেলার অবস্থা বা নতুন কোনো অবস্থায় রূপান্তর বোঝায়।',
    irabEffectBn: 'ইসমকে মারফু (পেশ) ও খবরকে মানসুব (যবর) করে।',
    exampleAr: 'أَصْبَحَ الجَوُّ جَمِيلًا.',
    exampleBn: 'আবহাওয়া সুন্দর হয়ে গেছে।',
  },
  hadha: {
    id: 'hadha',
    titleAr: 'هٰذَا (اِسْمُ إِشَارَةٍ لِلمُذَكَّرِ)',
    titleBn: 'হাযা (ইসমে ইশারা — এটি / এই পুংলিঙ্গ)',
    categoryBn: 'ইসমে ইশারা (নির্দেশক সর্বনাম)',
    ruleBn: 'নিকটবর্তী একবচন পুংলিঙ্গ ব্যক্তি বা বস্তুকে নির্দেশ করতে বসে।',
    irabEffectBn: 'মাবনি (অপরিবর্তনশীল) পদ; অবস্থানভেদে ফায়েল, মুবতাদা বা মাফউল হয়।',
    exampleAr: 'هٰذَا كِتَابٌ مُفِيدٌ.',
    exampleBn: 'এটি একটি উপকারী বই।',
  },
  hadhihi: {
    id: 'hadhihi',
    titleAr: 'هٰذِهِ (اِسْمُ إِشَارَةٍ لِلمُؤَنَّثِ)',
    titleBn: 'হাযিহি (ইসমে ইশারা — এটি / এই স্ত্রীলিঙ্গ)',
    categoryBn: 'ইসমে ইশারা (নির্দেশক সর্বনাম)',
    ruleBn: 'নিকটবর্তী একবচন স্ত্রীলিঙ্গ এবং অচেতন বহুবচন (জমা মুকাসসার) নির্দেশ করতে ব্যবহৃত হয়।',
    irabEffectBn: 'মাবনি (শেষ হরফ সবসময় যের); পরবর্তী আলিফ-লামযুক্ত শব্দ এর "বদল" হয়।',
    exampleAr: 'هٰذِهِ مَدْرَسَتُنَا الجَمِيلَةُ.',
    exampleBn: 'এটি আমাদের সুন্দর বিদ্যালয়।',
  },
  dhalika: {
    id: 'dhalika',
    titleAr: 'ذٰلِكَ (اِسْمُ إِشَارَةٍ لِلبَعِيدِ)',
    titleBn: 'যালিকা (দূরবর্তী ইসমে ইশারা — ঐটি)',
    categoryBn: 'ইসমে ইশারা (দূরবর্তী)',
    ruleBn: 'দূরবর্তী একবচন পুংলিঙ্গ বা মর্যাদাপূর্ণ বিষয় নির্দেশ করতে ব্যবহৃত হয়।',
    irabEffectBn: 'মাবনি পদ; বাক্যে মুবতাদা বা অন্যান্য কারক হিসেবে স্থান পায়।',
    exampleAr: 'ذٰلِكَ الكِتَابُ لَا رَيْبَ فِيهِ.',
    exampleBn: 'ঐ কিতাব—যাতে কোনো সন্দেহ নেই।',
  },
  tilka: {
    id: 'tilka',
    titleAr: 'تِلْكَ (اِسْمُ إِشَارَةٍ لِلبَعِيدِ)',
    titleBn: 'তিলকা (দূরবর্তী স্ত্রীলিঙ্গ ইশারা — ঐটি)',
    categoryBn: 'ইসমে ইশারা (দূরবর্তী)',
    ruleBn: 'দূরবর্তী স্ত্রীলিঙ্গ একবচন ও অচেতন বহুবচনকে নির্দেশ করতে ব্যবহৃত হয়।',
    irabEffectBn: 'মাবনি পদ; বাক্যে নিজ অবস্থান অনুযায়ী ই‘রাবের স্থানে বসে।',
    exampleAr: 'تِلْكَ آيَاتُ الكِتَابِ المُبِينِ.',
    exampleBn: 'ঐগুলো সুস্পষ্ট কিতাবের আয়াত।',
  },
  alladhi: {
    id: 'alladhi',
    titleAr: 'الَّذِي (اِسْمٌ مَوْصُولٌ)',
    titleBn: 'আল্লাযী (ইসমে মাওসূল — যিনি / যেটি)',
    categoryBn: 'ইসমে মাওসূল (সম্বন্ধ সর্বনাম)',
    ruleBn: 'দুটি বাক্যাংশকে সংযুক্ত করে; একবচন পুংলিঙ্গের জন্য ব্যবহৃত হয়।',
    irabEffectBn: 'মাবনি এবং এর পর একটি "সিলাহ" (পূর্ণ বাক্য) থাকা আবশ্যক।',
    exampleAr: 'نَجَحَ الطَّالِبُ الَّذِي اجْتَهَدَ.',
    exampleBn: 'যে ছাত্র পরিশ্রম করেছে সে সফল হয়েছে।',
  },
  allati: {
    id: 'allati',
    titleAr: 'الَّتِي (اِسْمٌ مَوْصُولٌ)',
    titleBn: 'আল্লাতী (স্ত্রীলিঙ্গ ইসমে মাওসূল — যিনি / যা)',
    categoryBn: 'ইসমে মাওসূল (সম্বন্ধ সর্বনাম)',
    ruleBn: 'একবচন স্ত্রীলিঙ্গ বা অচেতন বহুবচনের জন্য ব্যবহৃত সম্বোধক যুক্তপদ।',
    irabEffectBn: 'মাবনি; পূর্ববর্তী নির্দিষ্ট ইসমের সিফাত হিসেবেও ব্যবহৃত হয়।',
    exampleAr: 'هٰذِهِ الحَدِيقَةُ الَّتِي زُرْنَاهَا.',
    exampleBn: 'এটি সেই বাগান যা আমরা পরিদর্শন করেছি।',
  },
  alladhina: {
    id: 'alladhina',
    titleAr: 'الَّذِينَ (اِسْمٌ مَوْصُولٌ لِلجَمْعِ)',
    titleBn: 'আল্লাযীনা (বহুবচন মাওসূল — যাঁরা / যারা)',
    categoryBn: 'ইসমে মাওসূল (বহুবচন)',
    ruleBn: 'জ্ঞানসম্পন্ন পুং-বহুবচন বা মিশ্র জনগোষ্ঠীকে নির্দেশ করতে ব্যবহৃত হয়।',
    irabEffectBn: 'সর্বদা ফাতহা-র উপর মাবনি থাকে এবং এরপর বহুবচন ক্রিয়া আসে।',
    exampleAr: 'أَفْلَحَ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ.',
    exampleBn: 'যারা ঈমান এনেছে ও সৎকর্ম করেছে তারা সফল হয়েছে।',
  },
  ana: {
    id: 'ana',
    titleAr: 'أَنَا (ضَمِيرٌ مُنْفَصِلٌ)',
    titleBn: 'আনা (উত্তম পুরুষ সর্বনাম — আমি)',
    categoryBn: 'দমীরে মুনফাসিল (বিচ্ছিন্ন সর্বনাম)',
    ruleBn: 'বক্তা নিজের পরিচয় দিতে পুং ও স্ত্রী উভয় ক্ষেত্রেই এটি ব্যবহার করেন।',
    irabEffectBn: 'মাবনি পদ; নামবাচক বাক্যে সাধারণত মুবতাদা (উদ্দেশ্য) হয়।',
    exampleAr: 'أَنَا طَالِبُ العِلْمِ.',
    exampleBn: 'আমি জ্ঞানের একজন অন্বেষী।',
  },
  nahnu: {
    id: 'nahnu',
    titleAr: 'نَحْنُ (ضَمِيرُ المُتَكَلِّمِ)',
    titleBn: 'নাহনু (বহুবচন উত্তম পুরুষ — আমরা)',
    categoryBn: 'দমীরে মুনফাসিল',
    ruleBn: 'দুই বা ততোধিক বক্তা নিজেদের বোঝাতে ব্যবহৃত হয়।',
    irabEffectBn: 'দম্মার উপর মাবনি এবং সাধারণত মুবতাদা হয়; পরবর্তী খবরও বহুবচন হয়।',
    exampleAr: 'نَحْنُ نَتَعَلَّمُ اللُّغَةَ العَرَبِيَّةَ.',
    exampleBn: 'আমরা আরবি ভাষা শিখছি।',
  },
  anta: {
    id: 'anta',
    titleAr: 'أَنْتَ / أَنْتِ (ضَمِيرُ المُخَاطَبِ)',
    titleBn: 'আন্তা / আনতি (মধ্যম পুরুষ — তুমি)',
    categoryBn: 'দমীরে মুনফাসিল',
    ruleBn: 'পুংলিঙ্গে "أَنْتَ" (যবর) এবং স্ত্রীলিঙ্গে "أَنْتِ" (যের) ব্যবহৃত হয়।',
    irabEffectBn: 'মাবনি সর্বনাম; বাক্যে সাধারণত মুবতাদা হিসেবে বসে।',
    exampleAr: 'أَنْتَ مُجْتَهِدٌ فِي دُرُوسِكَ.',
    exampleBn: 'তুমি তোমার পাঠে পরিশ্রমী।',
  },
  huwa_hiya: {
    id: 'huwa_hiya',
    titleAr: 'هُوَ / هِيَ (ضَمِيرُ الغَائِبِ)',
    titleBn: 'হুয়া / হিয়া (নাম পুরুষ — সে / তিনি)',
    categoryBn: 'দমীরে মুনফাসিল',
    ruleBn: 'অনুপস্থিত বা তৃতীয় ব্যক্তি পুংলিঙ্গের জন্য "هُوَ" এবং স্ত্রীলিঙ্গের জন্য "هِيَ" বসে।',
    irabEffectBn: 'মাবনি সর্বনাম; বাক্যের প্রথমে এলে মুবতাদা হয়।',
    exampleAr: 'هُوَ مُعَلِّمٌ وَهِيَ مُعَلِّمَةٌ.',
    exampleBn: 'তিনি একজন শিক্ষক এবং তিনি একজন শিক্ষিকা।',
  },
  hal: {
    id: 'hal',
    titleAr: 'هَلْ (حَرْفُ اسْتِفْهَامٍ)',
    titleBn: 'হাল (প্রশ্নবোধক হরফ — কি?)',
    categoryBn: 'হরফে ইস্তিফহাম (প্রশ্ন)',
    ruleBn: '"হ্যাঁ" অথবা "না" উত্তরযোগ্য প্রশ্ন তৈরি করতে বাক্যের শুরুতে বসে।',
    irabEffectBn: 'ই‘রাবে কোনো পরিবর্তন ঘটায় না; শুধু প্রশ্নবোধক অর্থ যুক্ত করে।',
    exampleAr: 'هَلْ فَهِمْتَ الدَّرْسَ؟ نَعَمْ، فَهِمْتُهُ.',
    exampleBn: 'তুমি কি পাঠটি বুঝেছ? হ্যাঁ, আমি বুঝেছি।',
  },
  kayfa: {
    id: 'kayfa',
    titleAr: 'كَيْفَ (اِسْمُ اسْتِفْهَامٍ)',
    titleBn: 'কাইফা (কেমন / কীভাবে?)',
    categoryBn: 'ইসমে ইস্তিফহাম',
    ruleBn: 'অবস্থা, কুশল বা কাজের পদ্ধতি জানতে ব্যবহৃত হয়।',
    irabEffectBn: 'মাবনি; ইসমের পূর্বে থাকলে মুকাদ্দাম খবর এবং ক্রিয়ার পূর্বে থাকলে হাল হয়।',
    exampleAr: 'كَيْفَ حَالُكَ اليَوْمَ؟',
    exampleBn: 'আজ তোমার অবস্থা কেমন?',
  },
  ayna: {
    id: 'ayna',
    titleAr: 'أَيْنَ (ظَرْفُ اسْتِفْهَامٍ)',
    titleBn: 'আইনা (কোথায়?)',
    categoryBn: 'ইসমে ইস্তিফহাম (স্থান)',
    ruleBn: 'কোনো ব্যক্তি বা বস্তুর অবস্থান/স্থান জিজ্ঞাসা করতে ব্যবহৃত হয়।',
    irabEffectBn: 'ফাতহার উপর মাবনি এবং যরফে মাকান হিসেবে অগ্রবর্তী খবর হয়।',
    exampleAr: 'أَيْنَ تَسْكُنُ يَا أَخِي؟',
    exampleBn: 'হে ভাই, তুমি কোথায় বসবাস করো?',
  },
  mata: {
    id: 'mata',
    titleAr: 'مَتَى (ظَرْفُ اسْتِفْهَامٍ)',
    titleBn: 'মাতা (কখন?)',
    categoryBn: 'ইসমে ইস্তিফহাম (সময়)',
    ruleBn: 'কোনো কাজ বা ঘটনার সময় জানতে প্রশ্নবোধক হিসেবে বসে।',
    irabEffectBn: 'যরফে যমান হিসেবে ফী-এর অর্থ ধারণ করে এবং সাধারণত মানসুবের স্থানে থাকে।',
    exampleAr: 'مَتَى يَبْدَأُ الدَّرْسُ؟',
    exampleBn: 'পাঠটি কখন শুরু হয়?',
  },
  limadha: {
    id: 'limadha',
    titleAr: 'لِمَاذَا / لِمَ (لِلتَّعْلِيلِ)',
    titleBn: 'লিমাযা (কেন / কী কারণে?)',
    categoryBn: 'ইসমে ইস্তিফহাম (কারণ)',
    ruleBn: 'কোনো কাজের কারণ বা উদ্দেশ্য জিজ্ঞাসা করতে ব্যবহৃত হয়।',
    irabEffectBn: '"لِـ" (হরফে জার) ও "مَاذَا" মিলে গঠিত প্রশ্নবোধক পদ।',
    exampleAr: 'لِمَاذَا نَتَعَلَّمُ اللُّغَةَ العَرَبِيَّةَ؟',
    exampleBn: 'আমরা কেন আরবি ভাষা শিখি?',
  },
  ma_madha: {
    id: 'ma_madha',
    titleAr: 'مَا / مَاذَا (اِسْمُ اسْتِفْهَامٍ)',
    titleBn: 'মা / মাযা (কী / কোন বস্তু?)',
    categoryBn: 'ইসমে ইস্তিফহাম ও নাফী',
    ruleBn: 'বস্তুর পরিচয় জানতে "مَا", কাজের বিবরণ জানতে "مَاذَا", আর অতীত ক্রিয়ার পূর্বে থাকলে না-বোধক হয়।',
    irabEffectBn: 'মাবনি পদ; বাক্যে প্রশ্ন বা নেতিবাচকতা সৃষ্টি করে।',
    exampleAr: 'مَا اسْمُكَ؟ وَمَاذَا تَقْرَأُ؟',
    exampleBn: 'তোমার নাম কী? এবং তুমি কী পড়ছ?',
  },
  lam_lan: {
    id: 'lam_lan',
    titleAr: 'لَمْ / لَنْ (عَوَامِلُ المُضَارِعِ)',
    titleBn: 'লাম (অতীত না-বোধক) ও লান (ভবিষ্যৎ না-বোধক)',
    categoryBn: 'মুদারির আমিল (জাযম ও নসব)',
    ruleBn: '"لَمْ" বর্তমান ক্রিয়াকে অতীত না-বোধক করে আর "لَنْ" ভবিষ্যতে দৃঢ়ভাবে অস্বীকার করে।',
    irabEffectBn: '"لَمْ" মুদারির শেষে জযম (সুকুন) দেয় এবং "لَنْ" শেষে নসব (যবর) দেয়।',
    exampleAr: 'لَمْ أَتَأَخَّرْ، وَلَنْ أَكْسَلَ.',
    exampleBn: 'আমি দেরি করিনি, এবং কখনো অলসতা করব না।',
  },
  la_nahi: {
    id: 'la_nahi',
    titleAr: 'لَا (النَّافِيَةُ وَالنَّاهِيَةُ)',
    titleBn: 'লা (নেতিবাচক বা নিষেধাজ্ঞা)',
    categoryBn: 'হরফে নাফী ও নাহী',
    ruleBn: 'সাধারণভাবে কাজ না-হওয়া বোঝালে নাফিয়াহ, আর "করো না" নিষেধ করলে নাহিয়াহ।',
    irabEffectBn: 'লা নাহিয়াহ (নিষেধ) মুদারির শেষে সুকুন/জযম দেয়; নাফিয়াহ ই‘রাব বদলায় না।',
    exampleAr: 'لَا تَخَفْ، إِنَّ اللَّهَ مَعَنَا.',
    exampleBn: 'ভয় করো না, নিশ্চয়ই আল্লাহ আমাদের সাথে আছেন।',
  },
  ya_nida: {
    id: 'ya_nida',
    titleAr: 'يَا (حَرْفُ النِّدَاءِ)',
    titleBn: 'ইয়া (হরফে নিদা — হে / ওহে)',
    categoryBn: 'সম্বোধন অব্যয় (নিদা)',
    ruleBn: 'কাউকে ডাকার বা মনোযোগ আকর্ষণ করার জন্য নামের পূর্বে বসে।',
    irabEffectBn: 'একবচন নির্দিষ্ট মুনাদা পেশযুক্ত (রফা) হয়; আর মুদাফ হলে (যেমন يَا رَبَّنَا) যবর পায়!',
    exampleAr: 'يَا رَبِّ زِدْنِي عِلْمًا.',
    exampleBn: 'হে আমার রব, আমার জ্ঞান বৃদ্ধি করে দিন।',
  },
  an_masdariyah: {
    id: 'an_masdariyah',
    titleAr: 'أَنْ (المَصْدَرِيَّةُ النَّاصِبَةُ)',
    titleBn: 'আন (হরফে নসব — যেন / করতে)',
    categoryBn: 'হুরুফে নাসিবাহ (ক্রিয়া-সংযোজক)',
    ruleBn: 'দুটি ক্রিয়াকে যুক্ত করে ("চাই যে পড়তে" -> أُرِيدُ أَنْ أَقْرَأَ) এবং পরবর্তী ক্রিয়াকে মাসদারের অর্থে নেয়।',
    irabEffectBn: 'পরবর্তী মুদারি ক্রিয়ার শেষ অক্ষরে ফাতহা (যবর) বা নূন বিলুপ্ত করে।',
    exampleAr: 'أُحِبُّ أَنْ أَتَكَلَّمَ بِالعَرَبِيَّةِ.',
    exampleBn: 'আমি আরবিতে কথা বলতে ভালোবাসি।',
  },
  future_sawfa: {
    id: 'future_sawfa',
    titleAr: 'سَـ / سَوْفَ (لِلمُسْتَقْبَلِ)',
    titleBn: 'সা / সাওফা (ভবিষ্যৎ নির্দেশক)',
    categoryBn: 'আলামতে মুস্তাকবিল',
    ruleBn: 'মুদারি (বর্তমান) ক্রিয়ার আগে "سَـ" বসলে নিকট-ভবিষ্যৎ এবং "سَوْفَ" বসলে দূর-ভবিষ্যৎ বোঝায়।',
    irabEffectBn: 'ক্রিয়ার ই‘রাবে কোনো পরিবর্তন করে না, কেবল সময়কে ভবিষ্যতে রূপান্তর করে।',
    exampleAr: 'سَأُتْقِنُ القَوَاعِدَ إِنْ شَاءَ اللَّهُ.',
    exampleBn: 'ইনশাআল্লাহ আমি ব্যাকরণে দক্ষ হব।',
  },
  mawsoof_sifat: {
    id: 'mawsoof_sifat',
    titleAr: 'المَوْصُوفُ وَالصِّفَةُ',
    titleBn: 'মাওসূফ ও সিফাত (বিশেষ্য ও বিশেষণ)',
    categoryBn: 'ইসমীয় বাক্যাংশ (তাবে‘)',
    ruleBn: 'দ্বিতীয় শব্দটি প্রথম শব্দের গুণ বর্ণনা করে; উভয়ের আলিফ-লাম (নির্দিষ্টতা), লিঙ্গ ও বচন এক হয়।',
    irabEffectBn: 'মাওসূফের শেষ হরকত (পেশ/যবর/যের) হুবহু সিফাতের শেষে অনুসৃত হয়।',
    exampleAr: 'القُرْآنُ الكَرِيمُ كِتَابٌ مُبَارَكٌ.',
    exampleBn: 'সম্মানিত কুরআন এক বরকতময় কিতাব।',
  },
  jar_prefix: {
    id: 'jar_prefix',
    titleAr: 'بِـ / لِـ / كَـ (حَرْفُ جَرٍّ مُتَّصِلٌ)',
    titleBn: 'সংযুক্ত হরফে জার (দ্বারা / জন্য / মতো)',
    categoryBn: 'জার-মাজরূর (উপসর্গ)',
    ruleBn: 'শব্দের শুরুতে সংযুক্ত "بِـ" (দ্বারা/সাথে), "لِـ" (জন্য), অথবা "كَـ" (মতো) যুক্ত হয়েছে।',
    irabEffectBn: 'মূল ইসমের শেষ অক্ষরে কাসরা (যের) বা জারের চিহ্ন প্রদান করে।',
    exampleAr: 'أَكْتُبُ بِالقَلَمِ لِلعِلْمِ.',
    exampleBn: 'আমি জ্ঞানার্জনের জন্য কলম দিয়ে লিখি।',
  },
  mansub_tanwin: {
    id: 'mansub_tanwin',
    titleAr: 'المَنْصُوبُ (حَالٌ / تَمْيِيزٌ / مَفْعُولٌ)',
    titleBn: 'মানসুব তানবীন (হাল, যরফ বা মাফউল)',
    categoryBn: 'মানসুবাত (যবরযুক্ত পদ)',
    ruleBn: 'শব্দের শেষে দুই যবর (তানবীন ফাতহা) অবস্থা (হাল), সময়/পরিমাণ বা কর্ম (মাফউল) নির্দেশ করে।',
    irabEffectBn: 'কর্ম, অবস্থা বা ক্রিয়া-বিশেষণ হওয়ার কারণে নসব (দুই যবর) গ্রহণ করেছে।',
    exampleAr: 'أَتَعَلَّمُ جَيِّدًا وَأَسْتَيْقِظُ مُبَكِّرًا.',
    exampleBn: 'আমি ভালোভাবে শিখি এবং ভোরে ঘুম থেকে উঠি।',
  },
  jam_mudhakkar: {
    id: 'jam_mudhakkar',
    titleAr: 'جَمْعُ المُذَكَّرِ السَّالِمُ',
    titleBn: 'জমা মুযাক্কার সালিম (নিয়মিত পুং-বহুবচন)',
    categoryBn: 'বহুবচনের ই‘রাব',
    ruleBn: 'শব্দের মূল রূপ অক্ষুণ্ণ রেখে শেষে "ـُونَ" (পেশের স্থানে) বা "ـِينَ" (যবর/যেরের স্থানে) যুক্ত হয়।',
    irabEffectBn: 'এর রফা চিহ্ন হলো "و" (ওয়াও) এবং নসব/জার চিহ্ন হলো "ي" (ইয়া)।',
    exampleAr: 'أَفْلَحَ المُؤْمِنُونَ الخَاشِعُونَ.',
    exampleBn: 'বিনয়ী মুমিনগণ সফলকাম হয়েছে।',
  },
};

export function stripDiacriticsAndPunct(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[؟،.!:,;"'«»()\[\]{}]/g, '')
    .trim();
}

const EXACT_TOKEN_MAP: Record<string, string> = {
  في: 'fi',
  فيها: 'fi',
  فيه: 'fi',
  من: 'min',
  منه: 'min',
  منها: 'min',
  منهم: 'min',
  الي: 'ila',
  اليه: 'ila',
  اليها: 'ila',
  علي: 'ala',
  عليه: 'ala',
  عليها: 'ala',
  عليكم: 'ala',
  عن: 'an',
  عنه: 'an',
  عنها: 'an',
  مع: 'maaa',
  معي: 'maaa',
  معنا: 'maaa',
  معك: 'maaa',
  عند: 'inda',
  عندي: 'inda',
  عندك: 'inda',
  عنده: 'inda',
  بسم: 'bism',
  ان: 'inna',
  انه: 'inna',
  انها: 'inna',
  انني: 'inna',
  اننا: 'inna',
  انك: 'inna',
  لكن: 'lakinna',
  لكنه: 'lakinna',
  كان: 'kana',
  كانت: 'kana',
  كنت: 'kana',
  ليس: 'laysa',
  ليست: 'laysa',
  اصبح: 'asbaha',
  اصبحت: 'asbaha',
  هذا: 'hadha',
  هذه: 'hadhihi',
  ذلك: 'dhalika',
  تلك: 'tilka',
  الذي: 'alladhi',
  التي: 'allati',
  الذين: 'alladhina',
  انا: 'ana',
  نحن: 'nahnu',
  انت: 'anta',
  هو: 'huwa_hiya',
  هي: 'huwa_hiya',
  هل: 'hal',
  كيف: 'kayfa',
  اين: 'ayna',
  متي: 'mata',
  لماذا: 'limadha',
  لم: 'lam_lan',
  لن: 'lam_lan',
  ما: 'ma_madha',
  ماذا: 'ma_madha',
  لا: 'la_nahi',
  يا: 'ya_nida',
  ايها: 'ya_nida',
  ايتها: 'ya_nida',
  سوف: 'future_sawfa',
};

interface LexiconRecord {
  arabic: string;
  meaningBn: string;
  pronunciationBn?: string;
  posCategoryBn: string;
  rootOrFormBn?: string;
  exampleAr?: string;
  exampleBn?: string;
}

let cachedLexiconMap: Map<string, LexiconRecord> | null = null;

function registerLexiconKey(map: Map<string, LexiconRecord>, rawArabic: string, rec: LexiconRecord) {
  const norm = stripDiacriticsAndPunct(rawArabic);
  if (!norm || norm.length < 2) return;
  if (!map.has(norm)) {
    map.set(norm, rec);
  }
  if (norm.startsWith('ال') && norm.length >= 4) {
    const bare = norm.slice(2);
    if (!map.has(bare)) {
      map.set(bare, rec);
    }
  }
}

function getLexiconMap(): Map<string, LexiconRecord> {
  if (cachedLexiconMap) return cachedLexiconMap;
  const map = new Map<string, LexiconRecord>();

  // 1. High-frequency everyday Arabic words & classical names/verbs not always listed individually
  const highFreq: [string, LexiconRecord][] = [
    [
      'تَفْعَلُ',
      {
        arabic: 'تَفْعَلُ',
        meaningBn: 'তুমি করছ / করো (বা সে স্ত্রী করে)',
        pronunciationBn: 'তাফ‘আলু',
        posCategoryBn: 'ফেলে মুদারি (বর্তমান/ভবিষ্যৎ ক্রিয়া)',
        rootOrFormBn: 'মূলধাতু: ف ع ل · বাব ফাতাহা · ওযন: تَفْعَلُ (মধ্যম পুরুষ পুং একবচন)',
        exampleAr: 'مَاذَا تَفْعَلُ الآنَ؟',
        exampleBn: 'তুমি এখন কী করছ?',
      },
    ],
    [
      'يَفْعَلُ',
      {
        arabic: 'يَفْعَلُ',
        meaningBn: 'সে করছে / করে',
        pronunciationBn: 'ইয়াফ‘আলু',
        posCategoryBn: 'ফেলে মুদারি (বর্তমান/ভবিষ্যৎ ক্রিয়া)',
        rootOrFormBn: 'মূলধাতু: ف ع ل · ওযন: يَفْعَلُ (নাম পুরুষ পুং একবচন)',
        exampleAr: 'يَفْعَلُ الخَيْرَ دَائِمًا.',
        exampleBn: 'সে সর্বদা ভালো কাজ করে।',
      },
    ],
    [
      'أَفْعَلُ',
      {
        arabic: 'أَفْعَلُ',
        meaningBn: 'আমি করছি / করি',
        pronunciationBn: 'আফ‘আলু',
        posCategoryBn: 'ফেলে মুদারি (উত্তম পুরুষ একবচন)',
        rootOrFormBn: 'মূলধাতু: ف ع ل · ওযন: أَفْعَلُ',
        exampleAr: 'أَفْعَلُ وَاجِبِي المَنْزِلِيَّ.',
        exampleBn: 'আমি আমার বাড়ির কাজ করছি।',
      },
    ],
    [
      'الحَاسُوبِ',
      {
        arabic: 'الحَاسُوبُ',
        meaningBn: 'কম্পিউটার / গণকযন্ত্র',
        pronunciationBn: 'আল-হাসূব',
        posCategoryBn: 'ইসম (বিশেষ্য — যন্ত্রবাচক)',
        rootOrFormBn: 'মূলধাতু: ح س ب · বহুবচন: الحَوَاسِيبُ',
        exampleAr: 'أَكْتُبُ الدَّرْسَ عَلَى الحَاسُوبِ.',
        exampleBn: 'আমি কম্পিউটারে পাঠ লিখি।',
      },
    ],
    [
      'رَاشِدُ',
      {
        arabic: 'رَاشِدٌ',
        meaningBn: 'রাশিদ (ব্যক্তিনাম — সুপথপ্রাপ্ত)',
        pronunciationBn: 'রাশিদ',
        posCategoryBn: 'ইসমে আলাম (ব্যক্তিনাম / ইসমে ফায়েল)',
        rootOrFormBn: 'মূলধাতু: ر ش د · ওযন: فَاعِلٌ',
        exampleAr: 'يَا رَاشِدُ، اقْرَأِ الدَّرْسَ.',
        exampleBn: 'হে রাশিদ, পাঠটি পড়ো।',
      },
    ],
    [
      'مَحْمُودٌ',
      {
        arabic: 'مَحْمُودٌ',
        meaningBn: 'মাহমূদ (ব্যক্তিনাম — প্রশংসিত)',
        pronunciationBn: 'মাহমূদ',
        posCategoryBn: 'ইসমে আলাম / ইসমে মাফউল',
        rootOrFormBn: 'মূলধাতু: ح م د · ওযন: مَفْعُولٌ',
        exampleAr: 'مَحْمُودٌ طَالِبٌ مُجْتَهِدٌ.',
        exampleBn: 'মাহমূদ একজন পরিশ্রমী ছাত্র।',
      },
    ],
    [
      'اللَّهُ',
      {
        arabic: 'اللَّهُ',
        meaningBn: 'আল্লাহ (মহান সৃষ্টিকর্তা)',
        pronunciationBn: 'আল্লাহু',
        posCategoryBn: 'ইসমে জালালাহ (সর্বোচ্চ নির্দিষ্ট নাম)',
        rootOrFormBn: 'মূলধাতু: أ ل ه',
        exampleAr: 'اللَّهُ خَالِقُ كُلِّ شَيْءٍ.',
        exampleBn: 'আল্লাহ সবকিছুর সৃষ্টিকর্তা।',
      },
    ],
    [
      'نَعَمْ',
      {
        arabic: 'نَعَمْ',
        meaningBn: 'হ্যাঁ / জি',
        pronunciationBn: 'না‘আম',
        posCategoryBn: 'হরফে জাওয়াব (স্বীকৃতিবাচক অব্যয়)',
        rootOrFormBn: 'মাবনি (সুকূনের উপর অপরিবর্তনশীল)',
        exampleAr: 'نَعَمْ، فَهِمْتُ الدَّرْسَ.',
        exampleBn: 'হ্যাঁ, আমি পাঠটি বুঝেছি।',
      },
    ],
    [
      'أَبْحَثُ',
      {
        arabic: 'أَبْحَثُ',
        meaningBn: 'আমি খুঁজছি / গবেষণা করছি',
        pronunciationBn: 'আবহাসু',
        posCategoryBn: 'ফেলে মুদারি (উত্তম পুরুষ একবচন)',
        rootOrFormBn: 'মূলধাতু: ب ح ث · ওযন: أَفْعَلُ',
        exampleAr: 'أَبْحَثُ عَنْ مَعْلُومَاتٍ جَدِيدَةٍ.',
        exampleBn: 'আমি নতুন তথ্য খুঁজছি।',
      },
    ],
    [
      'أُرِيدُ',
      {
        arabic: 'أُرِيدُ',
        meaningBn: 'আমি চাই / ইচ্ছা করি',
        pronunciationBn: 'উরীদু',
        posCategoryBn: 'ফেলে মুদারি (বাবে ইফআল · আজওয়াফ)',
        rootOrFormBn: 'মূলধাতু: ر و د · মাসদার: الإِرَادَةُ',
        exampleAr: 'أُرِيدُ أَنْ أَتَعَلَّمَ العَرَبِيَّةَ.',
        exampleBn: 'আমি আরবি শিখতে চাই।',
      },
    ],
    [
      'أُحِبُّ',
      {
        arabic: 'أُحِبُّ',
        meaningBn: 'আমি ভালোবাসি / পছন্দ করি',
        pronunciationBn: 'উহিব্বু',
        posCategoryBn: 'ফেলে মুদারি (বাবে ইফআল · মুদাআফ)',
        rootOrFormBn: 'মূলধাতু: ح ب ب · মাসদার: المَحَبَّةُ / الإِحْبَابُ',
        exampleAr: 'أُحِبُّ القِرَاءَةَ كَثِيرًا.',
        exampleBn: 'আমি পড়াশোনা খুব ভালোবাসি।',
      },
    ],
  ];

  for (const [k, rec] of highFreq) {
    registerLexiconKey(map, k, rec);
  }

  // 2. Safwatul Masadir (877+ Masadars and their verbal derivatives)
  for (const m of SAFWATUL_MASADIR_LIST) {
    const baseExAr = m.exampleAr || `نَتَعَلَّمُ ${m.masdarAr}.`;
    const baseExBn = m.exampleBn || `${m.meaningBn} অনুশীলন করি।`;
    const babNote = `মূলধাতু: ${m.rootLetters} · ${m.babNameBn}`;

    registerLexiconKey(map, m.masdarAr, {
      arabic: m.masdarAr,
      meaningBn: m.meaningBn,
      pronunciationBn: m.masdarPronunciationBn,
      posCategoryBn: 'মাসদার (ক্রিয়ামূল — ইসম)',
      rootOrFormBn: babNote,
      exampleAr: baseExAr,
      exampleBn: baseExBn,
    });
    registerLexiconKey(map, m.madiAr, {
      arabic: m.madiAr,
      meaningBn: `${m.meaningBn} (অতীত: সে করেছে)`,
      posCategoryBn: 'ফেলে মাদি (অতীত ক্রিয়া)',
      rootOrFormBn: babNote,
      exampleAr: baseExAr,
      exampleBn: baseExBn,
    });
    registerLexiconKey(map, m.mudariAr, {
      arabic: m.mudariAr,
      meaningBn: `${m.meaningBn} (বর্তমান/ভবিষ্যৎ: সে করে/করবে)`,
      posCategoryBn: 'ফেলে মুদারি (বর্তমান/ভবিষ্যৎ ক্রিয়া)',
      rootOrFormBn: babNote,
      exampleAr: baseExAr,
      exampleBn: baseExBn,
    });
    if (m.amrAr) {
      registerLexiconKey(map, m.amrAr, {
        arabic: m.amrAr,
        meaningBn: `${m.meaningBn} (আদেশ: করো!)`,
        posCategoryBn: 'ফেলে আমর (আদেশসূচক ক্রিয়া)',
        rootOrFormBn: babNote,
        exampleAr: baseExAr,
        exampleBn: baseExBn,
      });
    }
    if (m.ismFailAr) {
      registerLexiconKey(map, m.ismFailAr, {
        arabic: m.ismFailAr,
        meaningBn: `কর্তা (${m.meaningBn}-কারী)`,
        posCategoryBn: 'ইসমে ফায়েল (কর্তৃবাচক বিশেষ্য)',
        rootOrFormBn: babNote,
        exampleAr: baseExAr,
        exampleBn: baseExBn,
      });
    }
    if (m.ismMafulAr) {
      registerLexiconKey(map, m.ismMafulAr, {
        arabic: m.ismMafulAr,
        meaningBn: `কর্ম (${m.meaningBn}-কৃত)`,
        posCategoryBn: 'ইসমে মাফউল (কর্মবাচক বিশেষ্য)',
        rootOrFormBn: babNote,
        exampleAr: baseExAr,
        exampleBn: baseExBn,
      });
    }
  }

  // 3. Topic-based Ism & Sifat Banks
  for (const cat of ALL_ISM_CATEGORIES) {
    for (const e of cat.entries) {
      const rec: LexiconRecord = {
        arabic: e.arabic,
        meaningBn: e.meaningBn,
        pronunciationBn: e.pronunciationBn,
        posCategoryBn: `ইসম (${cat.titleBn})`,
        rootOrFormBn: e.pluralOrFemAr ? `বহুবচন: ${e.pluralOrFemAr}` : cat.titleAr,
        exampleAr: e.exampleAr,
        exampleBn: e.exampleBn,
      };
      registerLexiconKey(map, e.arabic, rec);
      if (e.pluralOrFemAr) {
        registerLexiconKey(map, e.pluralOrFemAr, {
          ...rec,
          arabic: e.pluralOrFemAr,
          posCategoryBn: `ইসম বহুবচন (${cat.titleBn})`,
          rootOrFormBn: `একবচন: ${e.arabic}`,
        });
      }
    }
  }

  for (const cat of SIFAT_CATEGORIES) {
    for (const e of cat.entries) {
      const rec: LexiconRecord = {
        arabic: e.arabic,
        meaningBn: e.meaningBn,
        pronunciationBn: e.pronunciationBn,
        posCategoryBn: `সিফাত / বিশেষণ (${cat.titleBn})`,
        rootOrFormBn: e.pluralOrFemAr ? `স্ত্রী/বহুবচন: ${e.pluralOrFemAr}` : cat.titleAr,
        exampleAr: e.exampleAr,
        exampleBn: e.exampleBn,
      };
      registerLexiconKey(map, e.arabic, rec);
      if (e.pluralOrFemAr) {
        registerLexiconKey(map, e.pluralOrFemAr, {
          ...rec,
          arabic: e.pluralOrFemAr,
          rootOrFormBn: `মূল সিফাত: ${e.arabic}`,
        });
      }
    }
  }

  // 4. Curriculum Vocab Deck
  for (const v of CURRICULUM_VOCAB_DECK) {
    const rec: LexiconRecord = {
      arabic: v.arabic,
      meaningBn: v.meaningBn,
      pronunciationBn: v.pronunciationBn,
      posCategoryBn: v.category ? `শব্দ (${v.category})` : 'আরবি শব্দ',
      rootOrFormBn: v.root ? `মূলধাতু/তথ্য: ${v.root}` : undefined,
      exampleAr: v.exampleAr,
      exampleBn: v.exampleBn,
    };
    registerLexiconKey(map, v.arabic, rec);
  }

  cachedLexiconMap = map;
  return map;
}

const JAR_PREV_SET = new Set([
  'في',
  'من',
  'الي',
  'علي',
  'عن',
  'ب',
  'ل',
  'ك',
  'مع',
  'عند',
  'امام',
  'خلف',
  'فوق',
  'تحت',
  'بين',
  'قبل',
  'بعد',
  'حول',
  'دون',
]);

const NIDA_PREV_SET = new Set(['يا', 'ايها', 'ايتها']);
const NASB_NOUN_PREV_SET = new Set(['انها', 'لكن', 'كان', 'ليت', 'لعل']);
const JAZM_VERB_PREV_SET = new Set(['لم', 'لما', 'لا']);
const NASB_VERB_PREV_SET = new Set(['لن', 'كي', 'لكي', 'حتي']);

function detectFinalIrabNote(
  noPunctRaw: string,
  prevNorm: string,
  prevRaw: string,
  isVerbCandidate: boolean
): { caseNameBn: string; irabDetailBn: string } {
  // Check trailing harakat
  const lastChar = noPunctRaw.slice(-1);
  const lastTwo = noPunctRaw.slice(-2);

  const isPrevAnMasdariyah = /^[ووف]?أَنْ$/.test(prevRaw);
  const isPrevInnaSister =
    /^[ووف]?(?:إِنَّ|أَنَّ|لٰكِنَّ|لَعَلَّ|لَيْتَ|كَأَنَّ)/.test(prevRaw) ||
    NASB_NOUN_PREV_SET.has(prevNorm);

  if (prevNorm && JAR_PREV_SET.has(prevNorm) && !isVerbCandidate) {
    return {
      caseNameBn: 'মাজরূর (যেরযুক্ত অবস্থা)',
      irabDetailBn: `পূর্ববর্তী হরফে জার বা যরফ থাকায় এই ইসমটি মাজরূর (কাসরা/যেরযুক্ত) হয়েছে।`,
    };
  }

  if (prevNorm && NIDA_PREV_SET.has(prevNorm)) {
    return {
      caseNameBn: 'মুনাদা (সম্বোধিত পদ)',
      irabDetailBn: `পূর্ববর্তী হরফে নিদা (يَا) দ্বারা ডাকায় একবচন নির্দিষ্ট মুনাদা পেশ (দম্মা)-এর উপর মাবনি হয়।`,
    };
  }

  if (isVerbCandidate && prevNorm && JAZM_VERB_PREV_SET.has(prevNorm)) {
    return {
      caseNameBn: 'মাজযূম (জযম/সুকূনযুক্ত)',
      irabDetailBn: `পূর্ববর্তী '${prevRaw || prevNorm}' আমিলের প্রভাবে ফেলে মুদারি মাজযূম (সুকূন বা নূন লোপ) হয়েছে।`,
    };
  }

  if (isVerbCandidate && (isPrevAnMasdariyah || (prevNorm && NASB_VERB_PREV_SET.has(prevNorm)))) {
    return {
      caseNameBn: 'মানসুব (নসব/যবরযুক্ত)',
      irabDetailBn: `পূর্ববর্তী হরফে নাসিবাহ '${prevRaw || prevNorm}'-এর কারণে মুদারি ক্রিয়াটি মানসুব (যবরযুক্ত) হয়েছে।`,
    };
  }

  if (!isVerbCandidate && isPrevInnaSister) {
    return {
      caseNameBn: 'ইসমু হরফে মুশাব্বাহ (মানসুব)',
      irabDetailBn: `পূর্ববর্তী ইন্না/আন্না/লাকিন্না-র ইসম হওয়ায় মানসুব (যবরযুক্ত) হয়।`,
    };
  }

  if (lastChar === 'ٌ' || lastChar === 'ُ' || lastTwo === 'ُونَ') {
    return {
      caseNameBn: 'মারফু (পেশযুক্ত অবস্থা)',
      irabDetailBn: isVerbCandidate
        ? 'নসব বা জযমদাতা আমিল না থাকায় ফেলে মুদারি মারফু (শেষ অক্ষরে দম্মা/পেশ) হয়েছে।'
        : 'বাক্যে মুবতাদা, খবর বা ফায়েল (কর্তা) হিসেবে মারফু (দম্মা/পেশযুক্ত) অবস্থায় রয়েছে।',
    };
  }

  if (lastChar === 'ً' || noPunctRaw.endsWith('ًا')) {
    return {
      caseNameBn: 'মানসুব তানবীন (দুই যবর)',
      irabDetailBn: 'কর্ম (মাফউল), অবস্থা (হাল) বা সময়-স্থান (যরফ) হিসেবে মানসুব (নসব) হয়েছে।',
    };
  }

  if (lastChar === 'َ') {
    return {
      caseNameBn: isVerbCandidate ? 'ফাতহা / মাবনি বা মানসুব' : 'মানসুব (যবরযুক্ত)',
      irabDetailBn: isVerbCandidate
        ? 'মাদি ক্রিয়া হলে ফাতহার উপর মাবনি; অথবা মুদারি নসবদাতা অব্যয়ের পরে মানসুব হয়েছে।'
        : 'মাফউল (কর্ম), মুদাফ বা বিশেষ অবস্থানভেদে ফাতহা (যবর) গ্রহণ করেছে।',
    };
  }

  if (lastChar === 'ٍ' || lastChar === 'ِ') {
    return {
      caseNameBn: 'মাজরূর (যেরযুক্ত অবস্থা)',
      irabDetailBn: 'হরফে জার অথবা ইযাফাত (মুদাফ ইলাইহি) হওয়ার কারণে কাসরা (যের) গ্রহণ করেছে।',
    };
  }

  if (lastChar === 'ْ') {
    return {
      caseNameBn: 'সুকূনযুক্ত (মাবনি বা মাজযূম)',
      irabDetailBn: isVerbCandidate
        ? 'আমর (আদেশ), মাদি যুক্ত সর্বনাম বা জযমের প্রভাবে শেষ হরফে সুকূন রয়েছে।'
        : 'শব্দের শেষে সুকূন বা ওয়াকফ (থামা) অবস্থায় উচ্চারিত হচ্ছে।',
    };
  }

  return {
    caseNameBn: isVerbCandidate ? 'ক্রিয়াপদ (ফেল)' : 'নামপদ (ইসম)',
    irabDetailBn: 'বাক্যে নিজের ব্যাকরণিক অবস্থান (ফায়েল/মাফউল/মুদাফ ইলাইহি) অনুযায়ী ই‘রাব গ্রহণ করে।',
  };
}

function lookupWithAffixStripping(
  norm: string,
  lexicon: Map<string, LexiconRecord>
): { record: LexiconRecord | null; attachedPrefixBn?: string; attachedSuffixBn?: string } {
  const direct = lexicon.get(norm);
  if (direct) return { record: direct };

  // Strip attached suffixes (attached pronouns ـه/ـها/ـهم/ـك/ـكم/ـنا/ـي)
  const suffixes: [string, string][] = [
    ['هما', 'সংযুক্ত সর্বনাম "ـهُمَا" (তাদের দুজনের / তাদের দুজনকে)'],
    ['كما', 'সংযুক্ত সর্বনাম "ـكُمَا" (তোমাদের দুজনের)'],
    ['هم', 'সংযুক্ত সর্বনাম "ـهُمْ" (তাদের / তাদেরকে)'],
    ['هن', 'সংযুক্ত সর্বনাম "ـهُنَّ" (তাদের — স্ত্রী)'],
    ['كم', 'সংযুক্ত সর্বনাম "ـكُمْ" (তোমাদের / তোমাদেরকে)'],
    ['كن', 'সংযুক্ত সর্বনাম "ـكُنَّ" (তোমাদের — স্ত্রী)'],
    ['ها', 'সংযুক্ত সর্বনাম "ـهَا" (তার / তাকে — স্ত্রী)'],
    ['نا', 'সংযুক্ত সর্বনাম "ـنَا" (আমাদের / আমাদেরকে)'],
    ['ي', 'সংযুক্ত সর্বনাম "ـي" (আমার / আমাকে)'],
    ['ك', 'সংযুক্ত সর্বনাম "ـكَ/ـكِ" (তোমার / তোমাকে)'],
    ['ه', 'সংযুক্ত সর্বনাম "ـهُ" (তার / তাকে)'],
  ];

  // Try stripping prefix (و / ف / ب / ل / ك / س)
  const prefixes: [string, string][] = [
    ['و', 'সংযুক্ত অব্যয় "وَ" (এবং)'],
    ['ف', 'সংযুক্ত অব্যয় "فَ" (অতঃপর / তাই)'],
    ['ب', 'সংযুক্ত হরফে জার "بِـ" (দ্বারা / সাথে)'],
    ['ل', 'সংযুক্ত হরফে জার "لِـ" (জন্য)'],
    ['ك', 'সংযুক্ত হরফে জার "كَـ" (মতো)'],
    ['س', 'ভবিষ্যৎ নির্দেশক "سَـ" (অচিরেই / ভবিষ্যতে)'],
  ];

  for (const [suf, sufNote] of suffixes) {
    if (norm.endsWith(suf) && norm.length - suf.length >= 3) {
      const stem = norm.slice(0, norm.length - suf.length);
      const hit = lexicon.get(stem);
      if (hit) return { record: hit, attachedSuffixBn: sufNote };
      // Also handle taa marbuta turning into regular ت before pronoun suffix
      if (stem.endsWith('ت')) {
        const hitTa = lexicon.get(stem.slice(0, -1) + 'ة');
        if (hitTa) return { record: hitTa, attachedSuffixBn: sufNote };
      }
    }
  }

  for (const [pre, preNote] of prefixes) {
    if (norm.startsWith(pre) && norm.length >= 4) {
      const rest = norm.slice(1);
      // Note: لِـ + الـ drops initial alif -> لل...
      if (pre === 'ل' && rest.startsWith('ل')) {
        const withAl = lexicon.get('ال' + rest.slice(1));
        if (withAl) return { record: withAl, attachedPrefixBn: preNote };
      }
      const hit = lexicon.get(rest);
      if (hit) return { record: hit, attachedPrefixBn: preNote };

      for (const [suf, sufNote] of suffixes) {
        if (rest.endsWith(suf) && rest.length - suf.length >= 3) {
          const stem = rest.slice(0, rest.length - suf.length);
          const hit2 = lexicon.get(stem);
          if (hit2) {
            return { record: hit2, attachedPrefixBn: preNote, attachedSuffixBn: sufNote };
          }
        }
      }
    }
  }

  return { record: null };
}

function enrichTipWithTarkib(
  tip: NahwQuickTip,
  token: string,
  prevToken?: string,
  nextToken?: string,
  sentenceContext?: string,
  tokenIndex?: number
): NahwQuickTip {
  if (sentenceContext) {
    const tarkib = analyzeSentenceTarkib(sentenceContext);
    const cleanTarget = token.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
    const matchedWord =
      (typeof tokenIndex === 'number' && tarkib.words[tokenIndex]) ||
      tarkib.words.find((w) => w.raw === token || w.clean === cleanTarget);
    if (matchedWord) {
      return {
        ...tip,
        tarkibRoleBn: matchedWord.tarkibRoleBn,
        tarkibReasonBn: matchedWord.tarkibDetailBn,
      };
    }
  }
  const fallbackSent = [prevToken, token, nextToken].filter(Boolean).join(' ');
  const mini = analyzeSentenceTarkib(fallbackSent);
  const cleanTarget = token.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
  const matchedMini = mini.words.find((w) => w.raw === token || w.clean === cleanTarget);
  return {
    ...tip,
    tarkibRoleBn: matchedMini?.tarkibRoleBn || tip.categoryBn,
    tarkibReasonBn: matchedMini?.tarkibDetailBn || tip.irabEffectBn,
  };
}

function matchBaseNahwTipForToken(
  token: string,
  prevToken?: string,
  nextToken?: string
): NahwQuickTip | null {
  const noPunctRaw = token.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
  // Require at least one Arabic letter so standalone digits/punctuation don't get grammar popups
  if (!/[\u0621-\u064A]/.test(noPunctRaw)) {
    return null;
  }

  const norm = stripDiacriticsAndPunct(token);
  if (!norm) return null;
  const prevNorm = prevToken ? stripDiacriticsAndPunct(prevToken) : '';
  const prevRaw = prevToken ? prevToken.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim() : '';

  // 1. Distinguish أَنَّ / أَنْ / إِنَّ / مَنْ explicitly before normalized map
  if (/^[ووف]?أَنَّ/.test(noPunctRaw)) {
    return NAHW_QUICK_TIPS.anna;
  }
  if (/^[ووف]?أَنْ$/.test(noPunctRaw)) {
    return NAHW_QUICK_TIPS.an_masdariyah;
  }
  if (/^[ووف]?مَنْ$/.test(noPunctRaw)) {
    return NAHW_QUICK_TIPS.ma_madha;
  }

  // 2. Exact particle / pronoun / functional tip match
  const directKey = EXACT_TOKEN_MAP[norm];
  if (directKey && NAHW_QUICK_TIPS[directKey]) {
    return NAHW_QUICK_TIPS[directKey];
  }

  if ((norm.startsWith('و') || norm.startsWith('ف')) && norm.length >= 3) {
    const subKey = EXACT_TOKEN_MAP[norm.slice(1)];
    if (subKey && NAHW_QUICK_TIPS[subKey]) {
      return NAHW_QUICK_TIPS[subKey];
    }
  }

  // 3. Lexicon lookup across 1,500+ Masadars, Ism, Sifat & Curriculum Vocab
  const lexicon = getLexiconMap();
  const { record, attachedPrefixBn, attachedSuffixBn } = lookupWithAffixStripping(norm, lexicon);

  // Heuristic POS detection (used both to enrich Lexicon matches and handle unknown words/proper names)
  const startsWithAl =
    norm.startsWith('ال') ||
    norm.startsWith('وال') ||
    norm.startsWith('فال') ||
    norm.startsWith('بال') ||
    norm.startsWith('لل') ||
    norm.startsWith('كال');
  const hasTanwin = /[ًٌٍ]/.test(noPunctRaw);
  const hasTaMarbuta = norm.endsWith('ة') || noPunctRaw.includes('ة');
  const isSoundMascPlural =
    (noPunctRaw.endsWith('ُونَ') || noPunctRaw.endsWith('ِينَ')) && norm.length >= 5;
  const isSoundFemPlural =
    (noPunctRaw.endsWith('َاتٌ') ||
      noPunctRaw.endsWith('َاتٍ') ||
      noPunctRaw.endsWith('َاتِ') ||
      noPunctRaw.endsWith('َاتُ')) &&
    norm.length >= 4;

  const isPrevVerbParticle =
    /^[ووف]?أَنْ$/.test(prevRaw) ||
    NASB_VERB_PREV_SET.has(prevNorm) ||
    JAZM_VERB_PREV_SET.has(prevNorm);

  const lexiconIsNoun =
    Boolean(record) &&
    !record!.posCategoryBn.includes('ফেল') &&
    !record!.posCategoryBn.includes('ক্রিয়া');

  const isMudariPrefix =
    !lexiconIsNoun &&
    !startsWithAl &&
    !hasTanwin &&
    !hasTaMarbuta &&
    norm.length >= 4 &&
    /^[يتان]/.test(norm) &&
    (/^تَ|^يَ|^أَ|^نَ|^تُ|^يُ|^أُ|^نُ/.test(noPunctRaw) ||
      isPrevVerbParticle ||
      (record?.posCategoryBn.includes('মুদারি') ?? false));

  const isVerbCandidate =
    !lexiconIsNoun &&
    (record?.posCategoryBn.includes('ফেল') ||
      record?.posCategoryBn.includes('ক্রিয়া') ||
      isMudariPrefix) &&
    !startsWithAl &&
    !hasTanwin &&
    !hasTaMarbuta;

  const irabInfo = detectFinalIrabNote(noPunctRaw, prevNorm, prevRaw, Boolean(isVerbCandidate));

  if (record) {
    const extraAffixNotes = [attachedPrefixBn, attachedSuffixBn].filter(Boolean).join(' · ');
    const isDefiniteNoun = startsWithAl;
    const definitenessNote = !isVerbCandidate
      ? isDefiniteNoun
        ? 'শুরুতে "ال" থাকায় এটি মা‘রিফাহ (নির্দিষ্ট ইসম)।'
        : hasTanwin
        ? 'শেষে তানবীন থাকায় এটি নাকিরাহ (অনির্দিষ্ট ইসম)।'
        : ''
      : '';

    const ruleParts = [
      `অর্থ: "${record.meaningBn}"${record.pronunciationBn ? ` (${record.pronunciationBn})` : ''}।`,
      definitenessNote,
      extraAffixNotes ? `যুক্ত অংশ: ${extraAffixNotes}।` : '',
      nextToken && prevNorm && JAR_PREV_SET.has(prevNorm)
        ? 'পূর্ববর্তী হরফে জারের সাথে মিলে জার-মাজরূর গঠন করেছে।'
        : '',
    ].filter(Boolean);

    return {
      id: `lex-${norm}`,
      titleAr: noPunctRaw,
      titleBn: `${record.meaningBn} (${record.posCategoryBn})`,
      categoryBn: `${record.posCategoryBn} · ${irabInfo.caseNameBn}`,
      meaningBn: record.meaningBn,
      rootOrFormBn: record.rootOrFormBn,
      ruleBn: ruleParts.join(' '),
      irabEffectBn: irabInfo.irabDetailBn,
      exampleAr: record.exampleAr || noPunctRaw,
      exampleBn: record.exampleBn || `উদাহরণ অর্থ: ${record.meaningBn}।`,
    };
  }

  // 4. Special structural patterns if not directly in lexicon
  if (/^سَ[أايتن]/.test(noPunctRaw) && norm.length >= 4) {
    return NAHW_QUICK_TIPS.future_sawfa;
  }

  if (/^(بِال|لِل|كَال|بِسْم)/.test(noPunctRaw) || /^(بال|لل|كال)/.test(norm)) {
    return NAHW_QUICK_TIPS.jar_prefix;
  }

  if (isSoundMascPlural) {
    return NAHW_QUICK_TIPS.jam_mudhakkar;
  }

  if (prevToken) {
    if (
      prevNorm.startsWith('ال') &&
      norm.startsWith('ال') &&
      prevNorm.length >= 4 &&
      norm.length >= 4 &&
      !EXACT_TOKEN_MAP[norm]
    ) {
      return {
        ...NAHW_QUICK_TIPS.mawsoof_sifat,
        id: `mawsoof-${norm}`,
        titleAr: noPunctRaw,
        titleBn: `${noPunctRaw} — মাওসূফ ও সিফাত (${irabInfo.caseNameBn})`,
        irabEffectBn: `${irabInfo.irabDetailBn} পাশাপাশি দুটি নির্দিষ্ট ইসম হওয়ায় দ্বিতীয়টি প্রথমটির সিফাত (বিশেষণ) হওয়ার সম্ভাবনা প্রবল।`,
      };
    }
  }

  if (noPunctRaw.endsWith('ًا') && norm.length >= 4) {
    return NAHW_QUICK_TIPS.mansub_tanwin;
  }

  // 5. Universal Fallback Analyzer for EVERY remaining Arabic word (verbs, nouns, adjectives, proper names)
  let posTitleBn = 'ইসম (নামপদ / বিশেষ্য বা বিশেষণ)';
  let morphologyBn = 'ইসমের সাধারণ চিহ্ন (হুরুফে নসব/জার বা আল/তানবীন) গ্রহণ করে।';

  if (isVerbCandidate) {
    const firstChar = noPunctRaw.startsWith('أ') ? 'أ' : norm[0];
    const personNote =
      firstChar === 'أ' || firstChar === 'ا'
        ? 'উত্তম পুরুষ একবচন (আমি)'
        : firstChar === 'ن'
        ? 'উত্তম পুরুষ বহুবচন (আমরা)'
        : firstChar === 'ت'
        ? 'মধ্যম পুরুষ পুং একবচন (তুমি) অথবা নাম পুরুষ স্ত্রী একবচন (সে)'
        : 'নাম পুরুষ পুং একবচন (সে)';
    posTitleBn = `ফেলে মুদারি (বর্তমান/ভবিষ্যৎ ক্রিয়া — ${personNote})`;
    morphologyBn = `শব্দের শুরুতে আলামতে মুদারি '${firstChar}' এবং শেষে ক্রিয়া-ই‘রাব রয়েছে। ক্রিয়া পদ কখনো তানবীন বা হরফে জার গ্রহণ করে না।`;
  } else if (isSoundFemPlural) {
    posTitleBn = 'জমা মুয়ান্নাস সালিম (নিয়মিত স্ত্রী-বহুবচন)';
    morphologyBn = 'শেষে "ـَات" যুক্ত থাকায় এটি নিয়মিত স্ত্রীলিঙ্গ বহুবচন; এর রফা পেশ ও নসব-জার কাসরা (যের) দ্বারা হয়।';
  } else if (startsWithAl) {
    posTitleBn = 'মা‘রিফাহ ইসম (الـ যুক্ত নির্দিষ্ট বিশেষ্য)';
    morphologyBn = 'শুরুতে "ال" (আলিফ-লাম) থাকায় শব্দটি নির্দিষ্ট (Definite) বিশেষ্য এবং শেষে তানবীন বর্জন করেছে।';
  } else if (hasTaMarbuta) {
    posTitleBn = 'মুয়ান্নাস ইসম (ة যুক্ত স্ত্রীলিঙ্গ বিশেষ্য)';
    morphologyBn = 'শেষে গোল তা (ة) থাকায় শব্দটি স্ত্রীলিঙ্গ বিশেষ্য বা বিশেষণ।';
  } else if (prevNorm && NIDA_PREV_SET.has(prevNorm)) {
    posTitleBn = 'মুনাদা (সম্বোধিত নামপদ)';
    morphologyBn = 'হরফে নিদা "يَا"-এর পরে আসায় এটি সম্বোধিত ব্যক্তিনাম বা পদ।';
  }

  return {
    id: `auto-${norm}`,
    titleAr: noPunctRaw,
    titleBn: `${noPunctRaw} — ${posTitleBn}`,
    categoryBn: `${posTitleBn} · ${irabInfo.caseNameBn}`,
    ruleBn: `${morphologyBn}${attachedPrefixBn ? ` (${attachedPrefixBn})` : ''}${
      attachedSuffixBn ? ` (${attachedSuffixBn})` : ''
    }`,
    irabEffectBn: irabInfo.irabDetailBn,
    exampleAr: noPunctRaw,
    exampleBn: `বাক্যে পদটির ধরন: ${posTitleBn} (${irabInfo.caseNameBn})।`,
  };
}

export function matchNahwTipForToken(
  token: string,
  prevToken?: string,
  nextToken?: string,
  sentenceContext?: string,
  tokenIndex?: number
): NahwQuickTip | null {
  const baseTip = matchBaseNahwTipForToken(token, prevToken, nextToken);
  if (!baseTip) return null;
  return enrichTipWithTarkib(baseTip, token, prevToken, nextToken, sentenceContext, tokenIndex);
}

// ---------------------------------------------------------------------------
// Full Sentence Tarkib (তারকিব — Syntactic Sentence Structure) Engine
// ---------------------------------------------------------------------------

export interface SentenceTarkibWord {
  index: number;
  raw: string;
  clean: string;
  norm: string;
  posShortBn: string;
  tarkibRoleBn: string;
  tarkibDetailBn: string;
  meaningBn?: string;
}

export interface SentenceTarkibPhrase {
  arabicChunk: string;
  roleBn: string;
  explanationBn: string;
}

export interface SentenceTarkibResult {
  sentenceAr: string;
  sentenceTypeAr: string;
  sentenceTypeBn: string;
  structureSummaryBn: string;
  words: SentenceTarkibWord[];
  phrases: SentenceTarkibPhrase[];
}

const INTERROGATIVE_NORM_SET = new Set([
  'هل',
  'ماذا',
  'ما',
  'من',
  'اين',
  'متي',
  'كيف',
  'كم',
  'لماذا',
  'بكم',
]);
const ATIF_NORM_SET = new Set(['و', 'ف', 'ثم', 'او', 'بل']);
const DEMONSTRATIVE_NORM_SET = new Set(['هذا', 'هذه', 'ذلك', 'تلك', 'هؤلاء']);
const PRONOUN_NORM_SET = new Set([
  'انا',
  'نحن',
  'انت',
  'انتم',
  'هو',
  'هي',
  'هم',
  'هن',
]);

const COMMON_PROPER_NAMES_NORM = new Set([
  'احمد',
  'محمد',
  'ابراهيم',
  'اسماعيل',
  'اسحاق',
  'يعقوب',
  'يوسف',
  'يونس',
  'يحيي',
  'ادم',
  'عمر',
  'عثمان',
  'علي',
  'زيد',
  'خالد',
  'طارق',
  'راشد',
  'رشيد',
  'سعيد',
  'سعد',
  'بلال',
  'ياسر',
  'نبيل',
  'اسامة',
  'حمزة',
  'معاذ',
  'انس',
  'فاطمة',
  'عائشة',
  'مريم',
  'زينب',
  'خديجة',
  'سلمى',
  'حفصة',
  'الله',
]);

function inferTokenPosTag(
  raw: string,
  baseTip: NahwQuickTip | null,
  prevRaw?: string
): 'verb' | 'naqis' | 'jar' | 'nida' | 'inshi' | 'interrog' | 'inna' | 'verb-nasb' | 'verb-jazm' | 'atif' | 'pronoun' | 'noun' {
  const clean = raw.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
  const norm = stripDiacriticsAndPunct(clean);
  const prevClean = prevRaw ? prevRaw.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim() : '';
  const prevNorm = stripDiacriticsAndPunct(prevClean);

  if (ATIF_NORM_SET.has(norm)) return 'atif';
  if (NIDA_PREV_SET.has(norm)) return 'nida';
  if (JAR_PREV_SET.has(norm)) return 'jar';
  if (/^[ووف]?أَنْ$/.test(clean) || NASB_VERB_PREV_SET.has(norm)) return 'verb-nasb';
  if (JAZM_VERB_PREV_SET.has(norm)) return 'verb-jazm';
  if (/^[ووف]?(?:إِنَّ|أَنَّ|لٰكِنَّ|لَعَلَّ|لَيْتَ|كَأَنَّ)/.test(clean) || NASB_NOUN_PREV_SET.has(norm)) {
    return 'inna';
  }
  if (norm === 'كان' || norm === 'كانت' || norm === 'كنت' || norm === 'ليس' || norm === 'ليست' || norm === 'اصبح') {
    return 'naqis';
  }
  if (INTERROGATIVE_NORM_SET.has(norm)) return 'interrog';
  if (PRONOUN_NORM_SET.has(norm) || DEMONSTRATIVE_NORM_SET.has(norm)) return 'pronoun';
  if (COMMON_PROPER_NAMES_NORM.has(norm)) return 'noun';

  const cat = baseTip?.categoryBn || '';
  const isLexiconNoun =
    Boolean(baseTip?.id.startsWith('lex-')) &&
    !cat.includes('ফেল') &&
    !cat.includes('ক্রিয়া');
  if (isLexiconNoun && !NASB_VERB_PREV_SET.has(prevNorm) && !JAZM_VERB_PREV_SET.has(prevNorm)) {
    return 'noun';
  }

  const startsWithAl =
    norm.startsWith('ال') ||
    norm.startsWith('وال') ||
    norm.startsWith('فال') ||
    norm.startsWith('بال') ||
    norm.startsWith('لل') ||
    norm.startsWith('كال');
  const hasTanwin = /[ًٌٍ]/.test(clean);
  const hasTaMarbuta = norm.endsWith('ة') || clean.includes('ة');

  if (
    !startsWithAl &&
    !hasTanwin &&
    !hasTaMarbuta &&
    (cat.includes('ফেল') ||
      cat.includes('ক্রিয়া') ||
      /^(تَ|يَ|أَ|نَ|تُ|يُ|أُ|نُ)/.test(clean) ||
      (/^[ووف]?أَنْ$/.test(prevClean) || NASB_VERB_PREV_SET.has(prevNorm) || JAZM_VERB_PREV_SET.has(prevNorm)))
  ) {
    return 'verb';
  }
  return 'noun';
}

function getHiddenPronounHint(cleanVerb: string, normVerb: string): string {
  if (/^أ[َُ]/.test(cleanVerb) || cleanVerb.endsWith('تُ')) return 'أَنَا (আমি)';
  if (/^ن[َُ]/.test(cleanVerb) || cleanVerb.endsWith('نَا')) return 'نَحْنُ (আমরা)';
  if (/^ت[َُ]/.test(cleanVerb) || cleanVerb.endsWith('تَ')) return 'أَنْتَ (তুমি) / هِيَ (সে)';
  if (/^ي[َُ]/.test(cleanVerb) || normVerb.length >= 3) return 'هُوَ (সে)';
  return 'দমীর (সর্বনাম)';
}

const tarkibCache = new Map<string, SentenceTarkibResult>();

export function analyzeSentenceTarkib(sentenceAr: string): SentenceTarkibResult {
  const cached = tarkibCache.get(sentenceAr);
  if (cached) return cached;

  const rawTokens = sentenceAr
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => /[\u0621-\u064A]/.test(t));

  if (rawTokens.length === 0) {
    const empty: SentenceTarkibResult = {
      sentenceAr,
      sentenceTypeAr: 'كَلِمَةٌ / جُمْلَةٌ',
      sentenceTypeBn: 'আরবি শব্দগুচ্ছ',
      structureSummaryBn: 'বাক্যে একাধিক আরবি পদ যুক্ত হয়ে পূর্ণ অর্থ প্রকাশ করে।',
      words: [],
      phrases: [],
    };
    return empty;
  }

  const baseTips = rawTokens.map((tok, i) =>
    matchBaseNahwTipForToken(tok, rawTokens[i - 1], rawTokens[i + 1])
  );
  const posTags = rawTokens.map((tok, i) => inferTokenPosTag(tok, baseTips[i], rawTokens[i - 1]));

  // Determine overall sentence kind (Nominal vs Verbal vs Interrogative/Vocative)
  const firstCoreIdx = posTags.findIndex((p) => p !== 'atif');
  const firstTag = firstCoreIdx >= 0 ? posTags[firstCoreIdx] : 'noun';
  const hasQuestionMark = sentenceAr.includes('؟') || sentenceAr.includes('?');
  const hasMainVerb = posTags.some((p) => p === 'verb' || p === 'naqis');
  const firstVerbIdx = posTags.findIndex((p) => p === 'verb' || p === 'naqis');

  let sentenceTypeAr = 'جُمْلَةٌ اسْمِيَّةٌ';
  let sentenceTypeBn = 'জুমলা ইসমিয়াহ (নামবাচক বাক্য)';

  if (firstTag === 'interrog' || hasQuestionMark) {
    sentenceTypeAr = hasMainVerb ? 'جُمْلَةٌ فِعْلِيَّةٌ اسْتِفْهَامِيَّةٌ' : 'جُمْلَةٌ اسْمِيَّةٌ اسْتِفْهَامِيَّةٌ';
    sentenceTypeBn = hasMainVerb
      ? 'জুমলা ফি‘লিয়াহ ইস্তিফহামিয়াহ (প্রশ্নবোধক ক্রিয়াবাচক বাক্য)'
      : 'জুমলা ইসমিয়াহ ইস্তিফহামিয়াহ (প্রশ্নবোধক নামবাচক বাক্য)';
  } else if (firstTag === 'nida') {
    sentenceTypeAr = 'جُمْلَةٌ إِنْشَائِيَّةٌ (نِدَاءٌ)';
    sentenceTypeBn = 'জুমলা ইনশাইয়াহ (সম্বোধনমূলক বাক্য)';
  } else if (firstTag === 'verb' || (firstVerbIdx >= 0 && firstVerbIdx <= 1)) {
    sentenceTypeAr = 'جُمْلَةٌ فِعْلِيَّةٌ';
    sentenceTypeBn = 'জুমলা ফি‘লিয়াহ (ক্রিয়াবাচক বাক্য)';
  }

  const words: SentenceTarkibWord[] = [];
  const phrases: SentenceTarkibPhrase[] = [];

  let seenVerb = false;
  let seenExplicitFail = false;
  let seenMubtada = false;
  let seenInna = false;
  let seenInnaIsm = false;
  let seenKana = false;
  let seenKanaIsm = false;
  let consumedByPairIdx = -1;

  for (let i = 0; i < rawTokens.length; i++) {
    const raw = rawTokens[i];
    const clean = raw.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
    const norm = stripDiacriticsAndPunct(clean);
    const prevRaw = i > 0 ? rawTokens[i - 1] : '';
    const prevClean = prevRaw.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
    const prevNorm = stripDiacriticsAndPunct(prevClean);
    const nextRaw = i < rawTokens.length - 1 ? rawTokens[i + 1] : '';
    const nextClean = nextRaw.replace(/[؟،.!:,;"'«»()\[\]{}]/g, '').trim();
    const nextNorm = stripDiacriticsAndPunct(nextClean);

    const tag = posTags[i];
    const nextTag = i < posTags.length - 1 ? posTags[i + 1] : undefined;
    const tip = baseTips[i];
    const lastChar = clean.slice(-1);
    const hasTanwin = /[ًٌٍ]/.test(clean);
    const isMarfuEnd = lastChar === 'ُ' || lastChar === 'ٌ' || clean.endsWith('ُونَ');
    const isMansubEnd = lastChar === 'َ' || lastChar === 'ً' || clean.endsWith('ًا');
    const isMajrurEnd = lastChar === 'ِ' || lastChar === 'ٍ';
    const hasAttachedJarPrefix =
      /^(بِال|لِل|كَال|بِسْم|بِـ)/.test(clean) ||
      (/^(ب|ل|ك)ال/.test(norm) && norm.length >= 5) ||
      (norm.startsWith('لل') && norm.length >= 4);

    let roleBn = 'ইসম (বাক্যাংশের পদ)';
    let detailBn = 'বাক্যের প্রাসঙ্গিক অর্থ পূরণে অংশগ্রহণ করেছে।';
    let posShortBn = tip?.categoryBn.split('·')[0].trim() || 'ইসম';

    if (i === consumedByPairIdx) {
      // Role already paired by preceding particle; generate exact matching label
      if (posTags[i - 1] === 'jar') {
        roleBn = 'মাজরূর (মুতা‘আল্লিক বিল-ফেল / খবর)';
        detailBn = `পূর্ববর্তী হরফে জার "${prevClean}"-এর কারণে মাজরূর হয়ে "${prevClean} ${clean}" — জার ও মাজরূর গঠন করেছে।`;
      } else if (posTags[i - 1] === 'nida') {
        roleBn = 'মুনাদা (সম্বোধিত পদ)';
        detailBn = `পূর্ববর্তী হরফে নিদা "${prevClean}" দ্বারা ডাকায় মুনাদা হয়েছে; উভয়ে মিলে নিদা ও মুনাদা।`;
      } else if (posTags[i - 1] === 'verb-nasb') {
        roleBn = 'ফেলে মুদারি মানসুব (মাফঊল/মাসদার স্থানীয়)';
        detailBn = `পূর্ববর্তী "${prevClean}"-এর প্রভাবে মানসুব হয়েছে ও পূর্ববর্তী ক্রিয়ার উদ্দেশ্য/কর্ম হিসেবে বসেছে।`;
      } else if (posTags[i - 1] === 'verb-jazm') {
        roleBn = 'ফেলে মুদারি মাজযূম';
        detailBn = `পূর্ববর্তী "${prevClean}"-এর প্রভাবে জযম (সুকূন) গ্রহণ করেছে এবং অতীত/নিষেধের ক্রিয়া হয়েছে।`;
      }
    } else if (hasAttachedJarPrefix) {
      roleBn = 'জার ও মাজরূর (মুতা‘আল্লিক বিল-ফেল / খবর)';
      detailBn = `শব্দের শুরুতে সংযুক্ত হরফে জার (بِـ / لِـ / كَـ) থাকায় পুরো পদটি জার ও মাজরূর হয়ে ক্রিয়া বা খবরের সাথে সম্পর্কিত (মুতা‘আল্লিক) হয়েছে।`;
      phrases.push({
        arabicChunk: clean,
        roleBn: 'মুরাক্কাবে জারী (জার + মাজরূর)',
        explanationBn: `সংযুক্ত হরফে জারসহ ইসমটি মাজরূর অবস্থায় মুতা‘আল্লিক বিল-ফেল বা খবর হিসেবে কাজ করছে।`,
      });
    } else if (tag === 'atif') {
      roleBn = 'হরফে আতফ (সংযোজক অব্যয়)';
      detailBn = `পূর্ববর্তী ও পরবর্তী পদ বা বাক্যাংশকে সংযুক্ত করেছে; পরবর্তী পদ এর মাধ্যমে 'মা‘তূফ' হয়।`;
    } else if (tag === 'interrog') {
      if (norm === 'هل') {
        roleBn = 'হরফে ইস্তিফহাম (প্রশ্নবোধক অব্যয়)';
        detailBn = 'হ্যাঁ/না বোধক প্রশ্ন তৈরি করেছে; বাক্যের মূল ই‘রাবে এর স্বতন্ত্র স্থান নেই।';
      } else if ((norm === 'ماذا' || norm === 'ما') && nextTag === 'verb') {
        roleBn = 'ইসমে ইস্তিফহাম — মাফঊলে বিহী মুকাদ্দাম (অগ্রবর্তী কর্ম)';
        detailBn = `"${nextClean}" ক্রিয়ার কর্ম (কী করছ/কী পড়ছ) হিসেবে বাক্যের শুরুতে অবস্থান নিয়েছে।`;
        phrases.push({
          arabicChunk: clean,
          roleBn: 'মাফঊলে বিহী মুকাদ্দাম (প্রশ্নবোধক)',
          explanationBn: 'প্রশ্নবোধক সর্বনামটি ক্রিয়ার অগ্রবর্তী কর্ম (Object) হিসেবে ব্যবহৃত হয়েছে।',
        });
      } else {
        roleBn = 'ইসমে ইস্তিফহাম — খবর মুকাদ্দাম / মুতা‘আল্লিক';
        detailBn = 'বাক্যের শুরুতে প্রশ্নবোধক ইসম হিসেবে অবস্থান, সময়, বা অবস্থা নির্দেশ করছে।';
        phrases.push({
          arabicChunk: clean,
          roleBn: 'খবর মুকাদ্দাম / ইসমে ইস্তিফহাম',
          explanationBn: 'বাক্যের শুরুতে বসে প্রশ্ন জিজ্ঞাসা করছে।',
        });
      }
    } else if (tag === 'nida') {
      roleBn = 'হরফে নিদা (সম্বোধন অব্যয়)';
      detailBn = nextClean
        ? `পরবর্তী পদ "${nextClean}"-কে আহ্বান করেছে (সম্বোধনমূলক অব্যয়)।`
        : 'কোনো ব্যক্তিকে ডাকার জন্য ব্যবহৃত সম্বোধন অব্যয়।';
      if (nextClean) {
        consumedByPairIdx = i + 1;
        phrases.push({
          arabicChunk: `${clean} ${nextClean}`,
          roleBn: 'হরফে নিদা + মুনাদা (সম্বোধন খণ্ড)',
          explanationBn: `"${clean}" হরফে নিদা এবং "${nextClean}" মুনাদা (সম্বোধিত ব্যক্তি/বস্তু)।`,
        });
      }
    } else if (tag === 'jar') {
      roleBn = 'হরফে জার (পদান্বয়ী অব্যয়)';
      detailBn = nextClean
        ? `পরবর্তী ইসম "${nextClean}"-কে মাজরূর (যেরযুক্ত) করে জার-মাজরূর গঠন করেছে।`
        : 'পরবর্তী ইসমকে যের প্রদান করে।';
      if (nextClean) {
        consumedByPairIdx = i + 1;
        phrases.push({
          arabicChunk: `${clean} ${nextClean}`,
          roleBn: 'জার ও মাজরূর (মুতা‘আল্লিক)',
          explanationBn: `"${clean}" হরফে জার এবং "${nextClean}" মাজরূর — উভয়ে মিলে ${
            seenVerb || hasMainVerb ? 'মুতা‘আল্লিক বিল-ফেল (ক্রিয়ার সম্পূরক)' : 'খবরে মুতা‘আল্লিক (বিধেয়)'
          }।`,
        });
      }
    } else if (tag === 'verb-nasb') {
      roleBn = 'হরফে নাসিবাহ (ফেল-সংযোজক)';
      detailBn = nextClean
        ? `পরবর্তী ফেলে মুদারি "${nextClean}"-কে মানসুব (যবরযুক্ত) করে মাসদারের অর্থে পরিণত করেছে।`
        : 'পরবর্তী মুদারি ক্রিয়াকে নসব প্রদান করে।';
      if (nextClean && nextTag === 'verb') {
        consumedByPairIdx = i + 1;
        phrases.push({
          arabicChunk: `${clean} ${nextClean}`,
          roleBn: 'মাসদারে মুআউওয়াল (أَنْ + ক্রিয়া)',
          explanationBn: `"${clean} ${nextClean}" মিলে একটি ক্রিয়ামূলের অর্থ দেয় ও পূর্ববর্তী ক্রিয়ার মাফঊলে বিহী (কর্ম) স্থানীয় হয়।`,
        });
      }
    } else if (tag === 'verb-jazm') {
      roleBn = 'হরফে জাযিমাহ (জযমদানকারী)';
      detailBn = nextClean
        ? `পরবর্তী মুদারি ক্রিয়া "${nextClean}"-কে মাজযূম (সুকূনযুক্ত) করেছে।`
        : 'মুদারি ক্রিয়ায় জযম দেয়।';
      if (nextClean && nextTag === 'verb') {
        consumedByPairIdx = i + 1;
        phrases.push({
          arabicChunk: `${clean} ${nextClean}`,
          roleBn: 'নাফী/নাহী ও মাজযূম ক্রিয়া',
          explanationBn: `"${clean}" অব্যয় "${nextClean}" ক্রিয়াটিকে জযম দিয়ে না-বোধক অর্থ গঠন করেছে।`,
        });
      }
    } else if (tag === 'inna') {
      seenInna = true;
      seenInnaIsm = false;
      roleBn = 'হরফে মুশাব্বাহ বিল-ফেল';
      detailBn = 'জুমলা ইসমিয়াহ-কে নিশ্চিত করতে এসেছে; এর ইসম মানসুব (যবর) এবং খবর মারফু (পেশ) হয়।';
    } else if (tag === 'naqis') {
      seenKana = true;
      seenKanaIsm = false;
      seenVerb = true;
      roleBn = 'ফেলে নাকিছ (অসম্পূর্ণ ক্রিয়া)';
      detailBn = 'বাক্যের ইসমকে মারফু (পেশ) এবং খবরকে মানসুব (যবর) রূপে গ্রহণ করে।';
    } else if (tag === 'verb') {
      seenVerb = true;
      const nextCanBeExplicitFail =
        nextTag === 'noun' && !clean.endsWith('تُ') && !clean.startsWith('أ') && !clean.startsWith('ن') &&
        !(nextClean.endsWith('َ') || nextClean.endsWith('ً') || nextClean.endsWith('ِ'));
      const hiddenHint = getHiddenPronounHint(clean, norm);
      if (nextCanBeExplicitFail) {
        roleBn = 'ফেল (মূল ক্রিয়াপদ)';
        detailBn = `বাক্যের ক্রিয়া (মুসনাদ); এর পরবর্তী প্রকাশ্য মারফু ইসমটির কর্তা (ফায়েল) হওয়ার সম্ভাবনা রয়েছে।`;
        phrases.push({
          arabicChunk: clean,
          roleBn: 'ফেল (ক্রিয়া)',
          explanationBn: `বাক্যের মূল ক্রিয়া হিসেবে কাজ করছে।`,
        });
      } else {
        roleBn = `ফেল ও ফায়েল (উহ্য সর্বনাম ${hiddenHint})`;
        detailBn = `ক্রিয়া এবং এর সাথে অন্তর্নিহিত কর্তা 'দমীরে মুস্তাতির' ${hiddenHint} যুক্ত রয়েছে।`;
        phrases.push({
          arabicChunk: clean,
          roleBn: 'ফেল + দমীরে মুস্তাতির (ফায়েল)',
          explanationBn: `"${clean}" ক্রিয়া ও এর উহ্য ফায়েল ${hiddenHint} মিলে জুমলা ফি‘লিয়ার ভিত্তি।`,
        });
        seenExplicitFail = true;
      }
    } else if (seenInna && !seenInnaIsm) {
      seenInnaIsm = true;
      roleBn = 'ইসমু ইন্না / হরফে মুশাব্বাহ-র ইসম (মানসুব)';
      detailBn = 'পূর্ববর্তী হরফে মুশাব্বাহ বিল-ফেল (إِنَّ/أَنَّ)-এর প্রভাবের কারণে ইসম হিসেবে মানসুব হয়েছে।';
      phrases.push({
        arabicChunk: clean,
        roleBn: 'ইসমু হরফে মুশাব্বাহ (মানসুব)',
        explanationBn: 'إِنَّ বা তার ভগিনীর ইসম হিসেবে যবরযুক্ত হয়েছে।',
      });
    } else if (seenInna && seenInnaIsm && isMarfuEnd) {
      roleBn = 'খবরু ইন্না (মারফু বিধেয়)';
      detailBn = 'ইন্না-র ইসম সম্পর্কে মূল সংবাদ/বিধেয় প্রদান করছে এবং মারফু (পেশযুক্ত) রয়েছে।';
      phrases.push({
        arabicChunk: clean,
        roleBn: 'খবরু হরফে মুশাব্বাহ (মারফু)',
        explanationBn: 'বাক্যের বিধেয় অংশ পূরণ করেছে।',
      });
    } else if (seenKana && !seenKanaIsm) {
      seenKanaIsm = true;
      roleBn = 'ইসমু কানা / লাইসা (মারফু)';
      detailBn = 'ফেলে নাকিছ-এর উদ্দেশ্য বা কর্তা হিসেবে মারফু (পেশযুক্ত) রয়েছে।';
      phrases.push({
        arabicChunk: clean,
        roleBn: 'ইসমু কানা (মারফু)',
        explanationBn: 'كَانَ বা তার ভগিনীর ইসম হিসেবে পেশযুক্ত।',
      });
    } else if (seenKana && seenKanaIsm && (isMansubEnd || lastChar === 'ً')) {
      roleBn = 'খবরু কানা / লাইসা (মানসুব বিধেয়)';
      detailBn = 'كَانَ / لَيْسَ-এর প্রভাবের কারণে বিধেয় (খবর) হিসেবে মানসুব (যবরযুক্ত) হয়েছে।';
      phrases.push({
        arabicChunk: clean,
        roleBn: 'খবরু কানা (মানসুব)',
        explanationBn: 'كَانَ-এর বিধেয় হিসেবে যবরযুক্ত হয়েছে।',
      });
    } else if (seenVerb) {
      // Inside a verbal sentence (after verb)
      const prevWasDefiniteNoun =
        i > 0 &&
        posTags[i - 1] === 'noun' &&
        (prevNorm.startsWith('ال') || !prevNorm.startsWith('ال')) &&
        words[i - 1]?.tarkibRoleBn.includes('মাওসূফ');

      if (prevNorm.startsWith('ال') && norm.startsWith('ال') && posTags[i - 1] === 'noun' && !EXACT_TOKEN_MAP[norm]) {
        roleBn = 'সিফাত / না‘ত (গুণবাচক বিশেষণ)';
        detailBn = `পূর্ববর্তী নির্দিষ্ট ইসম "${prevClean}" (মাওসূফ)-এর গুণ বা বৈশিষ্ট্য বর্ণনা করে তার ই‘রাব অনুসরণ করেছে।`;
        if (words[i - 1]) {
          words[i - 1].tarkibRoleBn = `${words[i - 1].tarkibRoleBn} (ও মাওসূফ)`;
        }
        phrases.push({
          arabicChunk: `${prevClean} ${clean}`,
          roleBn: 'মাওসূফ + সিফাত (মুরাক্কাবে তাওসীফী)',
          explanationBn: `"${prevClean}" বিশেষ্য (মাওসূফ) এবং "${clean}" বিশেষণ (সিফাত) মিলে একক বিশেষ্য খণ্ড গঠন করেছে।`,
        });
      } else if (isMajrurEnd && posTags[i - 1] === 'noun' && !prevNorm.startsWith('ال')) {
        roleBn = 'মুদাফ ইলাইহি (মাজরূর — সম্বন্ধীয় দ্বিতীয় পদ)';
        detailBn = `পূর্ববর্তী মুদাফ "${prevClean}"-এর সাথে সম্বন্ধযুক্ত হয়ে যের (কাসরা) গ্রহণ করেছে।`;
        if (words[i - 1]) {
          words[i - 1].tarkibRoleBn = `${words[i - 1].tarkibRoleBn} · মুদাফ`;
        }
        phrases.push({
          arabicChunk: `${prevClean} ${clean}`,
          roleBn: 'মুদাফ + মুদাফ ইলাইহি (মুরাক্কাবে ইযাফী)',
          explanationBn: `উভয়ে মিলে সম্বন্ধবাচক পদগুচ্ছ (যেমন: "আল্লাহর কিতাব" / "...এর ...") গঠন করেছে।`,
        });
      } else if (!seenExplicitFail && !isMansubEnd && !isMajrurEnd) {
        seenExplicitFail = true;
        roleBn = 'ফায়েল (ক্রিয়ার কর্তা — মারফু)';
        detailBn = 'বাক্যে ক্রিয়া সম্পাদনকারী মূল কর্তা (Subject) হিসেবে মারফু (পেশযুক্ত) রয়েছে।';
        phrases.push({
          arabicChunk: clean,
          roleBn: 'ফায়েল (কর্তা)',
          explanationBn: `"${clean}" পদটি ক্রিয়া সম্পাদনকারী হিসেবে ফায়েল।`,
        });
      } else if (clean.endsWith('ًا') || lastChar === 'ً') {
        roleBn = 'মাফঊল / হাল বা যরফ (মানসুব তানবীন)';
        detailBn = 'বাক্যে ক্রিয়ার কর্ম, অবস্থা (হাল) অথবা সময়-স্থান (মাফঊলে ফীহ) হিসেবে মানসুব হয়েছে।';
        phrases.push({
          arabicChunk: clean,
          roleBn: 'মাফঊল / হাল (মানসুব)',
          explanationBn: 'দুই যবরযুক্ত হয়ে ক্রিয়ার অবস্থা বা কর্ম প্রকাশ করছে।',
        });
      } else if (isMansubEnd) {
        roleBn = 'মাফঊলে বিহী (ক্রিয়ার কর্ম — মানসুব)';
        detailBn = 'যার ওপর ক্রিয়ার কাজ পতিত হয়েছে (Direct Object), তাই মানসুব (যবরযুক্ত) হয়েছে।';
        phrases.push({
          arabicChunk: clean,
          roleBn: 'মাফঊলে বিহী (কর্ম)',
          explanationBn: `"${clean}" পদটি ক্রিয়ার প্রত্যক্ষ কর্ম হিসেবে যবর পেয়েছে।`,
        });
      } else if (isMarfuEnd && !prevWasDefiniteNoun) {
        roleBn = seenExplicitFail ? 'তাবে‘ / বদল বা খবর (মারফু)' : 'ফায়েল (কর্তা — মারফু)';
        seenExplicitFail = true;
        detailBn = 'পেশযুক্ত (মারফু) অবস্থায় বাক্যের প্রধান নামপদ হিসেবে ব্যবহৃত হয়েছে।';
      } else if (posTags[i - 1] === 'atif') {
        roleBn = 'মা‘তূফ (সংযুক্ত পদ)';
        detailBn = `পূর্ববর্তী হরফে আতফ "${prevClean}"-এর মাধ্যমে আগের পদের ই‘রাব অনুযায়ী যুক্ত হয়েছে।`;
      }
    } else {
      // Nominal Sentence (Jumla Ismiyah) before any main verb
      if (posTags[i - 1] === 'atif') {
        roleBn = 'মা‘তূফ (সংযুক্ত পদ)';
        detailBn = `পূর্ববর্তী হরফে আতফ "${prevClean}"-এর মাধ্যমে আগের পদের সাথে যুক্ত হয়েছে।`;
      } else if (!seenMubtada) {
        seenMubtada = true;
        roleBn = tag === 'pronoun' ? 'মুবতাদা (সর্বনাম / ইশারা — মাবনি ফি মাহাল্লি রাফ‘)' : 'মুবতাদা (বাক্যের উদ্দেশ্য — মারফু)';
        detailBn = 'নামবাচক বাক্যের সূচনাকারী উদ্দেশ্য (Subject), যার সম্পর্কে পরবর্তী পদে সংবাদ দেওয়া হচ্ছে।';
        phrases.push({
          arabicChunk: clean,
          roleBn: 'মুবতাদা (উদ্দেশ্য)',
          explanationBn: `"${clean}" হলো বাক্যের মূল উদ্দেশ্য (যাকে কেন্দ্র করে বক্তব্য বলা হয়েছে)।`,
        });
      } else if (
        prevNorm.startsWith('ال') &&
        norm.startsWith('ال') &&
        posTags[i - 1] === 'noun' &&
        !EXACT_TOKEN_MAP[norm]
      ) {
        roleBn = 'সিফাত / না‘ত (গুণবাচক বিশেষণ)';
        detailBn = `পূর্ববর্তী নির্দিষ্ট ইসম "${prevClean}" (মাওসূফ)-এর সিফাত হয়ে একই ই‘রাব গ্রহণ করেছে।`;
        if (words[i - 1]) {
          words[i - 1].tarkibRoleBn = `${words[i - 1].tarkibRoleBn} · মাওসূফ`;
        }
        phrases.push({
          arabicChunk: `${prevClean} ${clean}`,
          roleBn: 'মাওসূফ + সিফাত (মুরাক্কাবে তাওসীফী)',
          explanationBn: `"${prevClean}" মাওসূফ এবং "${clean}" সিফাত মিলে একক অর্থবোধক খণ্ড গঠন করেছে।`,
        });
      } else if (
        !prevNorm.startsWith('ال') &&
        hasTanwin &&
        posTags[i - 1] === 'noun' &&
        i >= 2 &&
        words[i - 1]?.tarkibRoleBn.includes('খবর')
      ) {
        roleBn = 'সিফাত (খবরের বিশেষণ)';
        detailBn = `পূর্ববর্তী অনির্দিষ্ট খবর "${prevClean}" (মাওসূফ)-এর গুণ বর্ণনাকারী সিফাত।`;
        if (words[i - 1]) {
          words[i - 1].tarkibRoleBn = 'খবর ও মাওসূফ';
        }
        phrases.push({
          arabicChunk: `${prevClean} ${clean}`,
          roleBn: 'খবর (মাওসূফ + সিফাত)',
          explanationBn: `"${prevClean} ${clean}" মাওসূফ-সিফাত মিলে মুবতাদার খবর হয়েছে।`,
        });
      } else if (isMajrurEnd && posTags[i - 1] === 'noun' && !prevNorm.startsWith('ال')) {
        roleBn = 'মুদাফ ইলাইহি (মাজরূর — সম্বন্ধীয় পদ)';
        detailBn = `পূর্ববর্তী মুদাফ "${prevClean}"-এর সাথে সম্বন্ধযুক্ত হয়ে যেরযুক্ত হয়েছে।`;
        if (words[i - 1]) {
          words[i - 1].tarkibRoleBn = `${words[i - 1].tarkibRoleBn} · মুদাফ`;
        }
        phrases.push({
          arabicChunk: `${prevClean} ${clean}`,
          roleBn: 'মুদাফ + মুদাফ ইলাইহি (মুরাক্কাবে ইযাফী)',
          explanationBn: `দুটি ইসমের সম্বন্ধীয় গঠন (মুদাফ + মুদাফ ইলাইহি)।`,
        });
      } else {
        roleBn = 'খবর (বাক্যের বিধেয় — মারফু)';
        detailBn = 'মুবতাদা (উদ্দেশ্য) সম্পর্কে মূল সংবাদ বা বিধেয় (Predicate) প্রকাশ করে বাক্য সম্পূর্ণ করেছে।';
        phrases.push({
          arabicChunk: clean,
          roleBn: 'খবর (বিধেয়)',
          explanationBn: `"${clean}" মুবতাদার সম্পর্কে তথ্য দিয়ে নামবাচক বাক্য সম্পূর্ণ করেছে।`,
        });
      }
    }

    words.push({
      index: i,
      raw,
      clean,
      norm,
      posShortBn,
      tarkibRoleBn: roleBn,
      tarkibDetailBn: detailBn,
      meaningBn: tip?.meaningBn,
    });
  }

  const structureSummaryBn =
    phrases.length > 0
      ? `${sentenceTypeBn}: ${phrases.map((p) => `[${p.arabicChunk} = ${p.roleBn}]`).join(' + ')} → সম্পূর্ণ অর্থবোধক বাক্য (জুমলা মুফীদাহ)।`
      : `${sentenceTypeBn}: ${words.map((w) => `${w.clean} (${w.tarkibRoleBn})`).join(' + ')}।`;

  const result: SentenceTarkibResult = {
    sentenceAr,
    sentenceTypeAr,
    sentenceTypeBn,
    structureSummaryBn,
    words,
    phrases,
  };

  if (tarkibCache.size > 400) tarkibCache.clear();
  tarkibCache.set(sentenceAr, result);
  return result;
}

