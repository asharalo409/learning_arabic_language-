import { ChapterInfo, CurriculumLevelInfo, CurriculumLevelNumber, LearningTrack, SyllabusLessonStub } from '../types/academy';

export const CURRICULUM_LEVELS: CurriculumLevelInfo[] = [
  {
    level: 1,
    slug: 'beginners',
    nameBn: 'স্তর ১: প্রারম্ভিক (Beginner)',
    nameEn: 'Level 1: Beginner',
    nameAr: 'المستوى ١: المبتدئ',
    chapterStart: 1,
    chapterEnd: 16,
    descriptionBn: 'আরবি বর্ণমালা, মাখরাজ, হারাকাত, প্রাথমিক অভিবাদন, সর্বনাম এবং সহজ নামবাচক বাক্য।',
    descriptionEn: 'Arabic alphabet, Harakat, essential greetings, pronouns, and foundational nominal sentences.',
  },
  {
    level: 2,
    slug: 'elementary',
    nameBn: 'স্তর ২: প্রাথমিক (Elementary)',
    nameEn: 'Level 2: Elementary',
    nameAr: 'المستوى ٢: الأساسي',
    chapterStart: 17,
    chapterEnd: 33,
    descriptionBn: 'দৈনন্দিন কথোপকথন, বর্তমান কাল (মুদারি), সংখ্যা গণনা, পরিবার, বাজার এবং সময়।',
    descriptionEn: 'Daily conversations, present tense verbs, numbers, family, marketplace, and time.',
  },
  {
    level: 3,
    slug: 'pre-intermediate',
    nameBn: 'স্তর ৩: প্রাক-মধ্যম (Pre-Intermediate)',
    nameEn: 'Level 3: Pre-Intermediate',
    nameAr: 'المستوى ٣: ما قبل المتوسط',
    chapterStart: 34,
    chapterEnd: 50,
    descriptionBn: 'অতীত ও ভবিষ্যৎ কাল, হরফে জার, ইযাফাত, কুরআনিক সাধারণ শব্দ ও সংক্ষিপ্ত অনুচ্ছেদ।',
    descriptionEn: 'Past & future tense, prepositions, Idafah constructs, high-frequency Quranic words, and reading.',
  },
  {
    level: 4,
    slug: 'intermediate',
    nameBn: 'স্তর ৪: মধ্যম (Intermediate)',
    nameEn: 'Level 4: Intermediate',
    nameAr: 'المستوى ٤: المتوسط',
    chapterStart: 51,
    chapterEnd: 67,
    descriptionBn: 'ছরফের বাবসমূহ (আওযান), ভগ্ন বহুবচন, জটিল বাক্য ও ইসলামিক সাহিত্য পাঠ।',
    descriptionEn: 'Sarf verb forms (Awzan), broken plurals, complex clauses, and Islamic & modern texts.',
  },
  {
    level: 5,
    slug: 'upper-intermediate',
    nameBn: 'স্তর ৫: উচ্চ-মধ্যম (Upper-Intermediate)',
    nameEn: 'Level 5: Upper-Intermediate',
    nameAr: 'المستوى ٥: فوق المتوسط',
    chapterStart: 68,
    chapterEnd: 84,
    descriptionBn: 'উচ্চতর নাহু (ইরাব, হাল, তাময়ীয, মানসুবাত) এবং কুরআনিক ভাষাতত্ত্ব বিশ্লেষণ।',
    descriptionEn: 'Advanced Nahw (I’rab, Hal, Tamyiz, Mansubat) and deep Quranic linguistic analysis.',
  },
  {
    level: 6,
    slug: 'advanced',
    nameBn: 'স্তর ৬: উচ্চতর (Advanced)',
    nameEn: 'Level 6: Advanced',
    nameAr: 'المستوى ٦: المتقدم',
    chapterStart: 85,
    chapterEnd: 100,
    descriptionBn: 'বালাগাহ (অলংকারশাস্ত্র), তাফসীর ও হাদীসের পাঠ্য বিশ্লেষণ, এবং সাবলীল রচনা।',
    descriptionEn: 'Balaghah (rhetoric), classical Tafsir reading, academic composition, and full fluency.',
  },
];

interface ChapterBlueprint {
  ar: string;
  bn: string;
  en: string;
  track: LearningTrack;
  objBn: string;
  objEn: string;
}

const CHAPTER_BLUEPRINTS: ChapterBlueprint[] = [
  // Level 1: Chapters 1 - 16
  { ar: 'الحُرُوفُ وَالحَرَكَاتُ', bn: 'আরবি বর্ণমালা ও হারাকাত', en: 'Arabic Alphabet & Harakat', track: 'Combined', objBn: 'সঠিক মাখরাজ ও যবর-যের-পেশসহ ২৯টি হরফ চেনা ও উচ্চারণ করা।', objEn: 'Recognize and pronounce all Arabic letters with Fatha, Kasra, and Damma.' },
  { ar: 'التَّحِيَّاتُ وَالتَّعَارُفُ', bn: 'সালাম, অভিবাদন ও পরিচিতি', en: 'Greetings & Introductions', track: 'MSA', objBn: 'দৈনন্দিন অভিবাদন ও নিজের পরিচয় আরবিতে দেওয়া।', objEn: 'Greet others politely and introduce yourself in Arabic.' },
  { ar: 'الضَّمَائِرُ وَالأَسْمَاءُ', bn: 'সর্বনাম ও প্রাথমিক নামপদ', en: 'Pronouns & Basic Nouns', track: 'Combined', objBn: 'হুয়া, হিয়া, আন্তা, আনা এবং ইসমের লিঙ্গ চেনা।', objEn: 'Master personal pronouns and masculine/feminine noun markers.' },
  { ar: 'أَفْرَادُ الأُسْرَةِ', bn: 'পরিবার ও আত্মীয়তা', en: 'Family & Relationships', track: 'MSA', objBn: 'মা-বাবা, ভাই-বোন ও পরিবারের সদস্যদের নিয়ে কথা বলা।', objEn: 'Describe family members and relationships clearly.' },
  { ar: 'فِي البَيْتِ', bn: 'ঘর ও দৈনন্দিন আসবাব', en: 'At Home & Everyday Objects', track: 'MSA', objBn: 'ঘরের কক্ষ ও আসবাবের নাম এবং ব্যবহারিক বাক্য গঠন।', objEn: 'Name rooms and household items in simple nominal sentences.' },
  { ar: 'أَسْمَاءُ الإِشَارَةِ', bn: 'ইশারা বা নির্দেশক সর্বনাম', en: 'Demonstrative Pronouns', track: 'Combined', objBn: 'হাযা, হাযিহি, যালিকা, তিলকা সঠিকভাবে প্রয়োগ করা।', objEn: 'Use near and far demonstratives accurately in MSA and Quranic Arabic.' },
  { ar: 'فِي المَدْرَسَةِ وَالجَامِعَةِ', bn: 'বিদ্যালয় ও শ্রেণিকক্ষ', en: 'School & Classroom', track: 'MSA', objBn: 'শিক্ষক, শিক্ষার্থী, বই-খাতা ও শ্রেণিকক্ষের সংলাপ।', objEn: 'Conduct basic classroom and academic dialogues.' },
  { ar: 'الأَلْوَانُ وَالصِّفَاتُ', bn: 'রঙ ও মৌলিক বিশেষণ', en: 'Colors & Basic Adjectives', track: 'MSA', objBn: 'মাওসূফ ও সিফাতের সামঞ্জস্য বুঝে বস্তু বর্ণনা করা।', objEn: 'Describe objects using gender-matched Arabic adjectives.' },
  { ar: 'الأَعْدَادُ ١ إِلَى ٢٠', bn: 'সংখ্যা গণনা (১ থেকে ২০)', en: 'Numbers 1 to 20', track: 'MSA', objBn: '১ থেকে ২০ পর্যন্ত আরবি সংখ্যা ও গণনার নিয়ম শেখা।', objEn: 'Count from 1 to 20 with basic noun agreement.' },
  { ar: 'سُورَةُ الفَاتِحَةِ: المُفْرَدَاتُ', bn: 'সূরা ফাতিহা: শব্দার্থ ও মূলধাতু', en: 'Surah Al-Fatihah Vocabulary', track: 'Quranic', objBn: 'সূরা আল-ফাতিহার প্রতিটি শব্দের বাংলা অর্থ ও ব্যাকরণ জানা।', objEn: 'Understand word-by-word meanings of Surah Al-Fatihah.' },
  { ar: 'الأَيَّامُ وَالأَوْقَاتُ', bn: 'সপ্তাহের দিন ও সময়', en: 'Days of the Week & Time', track: 'MSA', objBn: 'সাত দিনের নাম, সকাল-সন্ধ্যা ও সময় জিজ্ঞাসা করা।', objEn: 'Tell time and discuss daily schedules across the week.' },
  { ar: 'الطَّعَامُ وَالشَّرَابُ', bn: 'খাদ্য ও পানীয়', en: 'Food & Drink', track: 'MSA', objBn: 'খাবার টেবিল ও রেস্তোরাঁয় প্রয়োজনীয় আরবি বাক্য বলা।', objEn: 'Order meals and express food preferences politely.' },
  { ar: 'حُرُوفُ الجَرِّ الأَسَاسِيَّةُ', bn: 'মৌলিক হরফে জার', en: 'Essential Prepositions', track: 'Combined', objBn: 'ফি, আলা, মিন, ইলা, বি-এর ব্যবহার ও পরবর্তী শব্দের যের।', objEn: 'Use common prepositions and apply genitive endings.' },
  { ar: 'فِي المَسْجِدِ وَالوُضُوءِ', bn: 'মসজিদ, ওযু ও সালাত', en: 'Mosque, Wudu & Prayer', track: 'Combined', objBn: 'মসজিদ ও ইবাদতের পরিভাষা ও আদব নিয়ে আরবি চর্চা।', objEn: 'Learn core mosque, purification, and prayer vocabulary.' },
  { ar: 'الجُمْلَةُ الاسْمِيَّةُ البَسِيطَةُ', bn: 'মুবতাদা ও খবর (সরল বাক্য)', en: 'Simple Nominal Sentences', track: 'Combined', objBn: 'উদ্দেশ্য (মুবতাদা) ও বিধেয় (খবর) দিয়ে শুদ্ধ বাক্য রচনা।', objEn: 'Construct accurate Mubtada-Khabar nominal sentences.' },
  { ar: 'مُرَاجَعَةُ المُسْتَوَى الأَوَّلِ', bn: 'প্রথম স্তরের সমন্বিত পুনরালোচনা', en: 'Level 1 Mastery Review', track: 'Combined', objBn: '১ থেকে ১৫ অধ্যায়ের শব্দভাণ্ডার ও ব্যাকরণ দৃঢ় করা।', objEn: 'Consolidate all Level 1 vocabulary, dialogues, and core grammar.' },

  // Level 2: Chapters 17 - 33
  { ar: 'الفِعْلُ المُضَارِعُ (الأَسَاسِيّ)', bn: 'বর্তমান কাল (ফেলে মুদারি)', en: 'Present Tense Verbs', track: 'Combined', objBn: 'দৈনন্দিন কাজের ক্রিয়া ও সর্বনাম ভেদে মুদারি রূপান্তর।', objEn: 'Conjugate basic present tense verbs across singular pronouns.' },
  { ar: 'الرُّوتِينُ اليَوْمِيُّ', bn: 'দৈনন্দিন রুটিন ও অভ্যাস', en: 'Daily Routine & Habits', track: 'MSA', objBn: 'ঘুম থেকে ওঠা, পড়াশোনা ও কাজের সময়সূচি বর্ণনা করা।', objEn: 'Narrate your daily morning-to-evening schedule.' },
  { ar: 'فِي السُّوقِ وَالشِّرَاءُ', bn: 'বাজার ও কেনাকাটা', en: 'At the Market & Shopping', track: 'MSA', objBn: 'দাম জিজ্ঞাসা করা, দরকষাকষি ও পরিমাণ প্রকাশ করা।', objEn: 'Ask prices, negotiate politely, and buy goods.' },
  { ar: 'السَّاعَةُ وَالمَوَاعِيدُ', bn: 'ঘড়ি দেখা ও অ্যাপয়েন্টমেন্ট', en: 'Telling Clock Time & Appointments', track: 'MSA', objBn: 'ঘণ্টা, মিনিট ও সময় নির্ধারণ সংক্রান্ত সংলাপ।', objEn: 'Schedule meetings and tell exact clock times.' },
  { ar: 'المِهَنُ وَالأَعْمَالُ', bn: 'পেশা ও কর্মক্ষেত্র', en: 'Professions & Workplaces', track: 'MSA', objBn: 'শিক্ষক, চিকিৎসক, প্রকৌশলী ও বিভিন্ন পেশার পরিচয়।', objEn: 'Discuss careers, workplaces, and aspirations.' },
  { ar: 'وَسَائِلُ النَّقْلِ وَالسَّفَرُ', bn: 'যানবাহন ও ভ্রমণ', en: 'Transportation & Travel', track: 'MSA', objBn: 'বিমানবন্দর, স্টেশন ও পথনির্দেশ চাওয়া।', objEn: 'Navigate travel stations and ask for directions.' },
  { ar: 'الفُصُولُ وَالطَّقْسُ', bn: 'ঋতু ও আবহাওয়া', en: 'Seasons & Weather', track: 'MSA', objBn: 'গ্রীষ্ম, বর্ষা, শীত ও আবহাওয়ার অবস্থা বর্ণনা করা।', objEn: 'Describe weather patterns and seasonal activities.' },
  { ar: 'جِسْمُ الإِنْسَانِ وَالصِّحَّةُ', bn: 'মানবদেহ ও স্বাস্থ্যসেবা', en: 'Human Body & Health', track: 'MSA', objBn: 'অঙ্গপ্রত্যঙ্গের নাম ও চিকিৎসকের সাথে অসুস্থতার কথা বলা।', objEn: 'Name body parts and describe symptoms at a clinic.' },
  { ar: 'الأَسْئِلَةُ وَأَدَوَاتُ الاسْتِفْهَامِ', bn: 'প্রশ্নবোধক শব্দাবলি', en: 'Question Words & Inquiry', track: 'Combined', objBn: 'মা, মান, আইনা, মাতা, কাইফা, কাম, লিমাযা-এর সঠিক প্রয়োগ।', objEn: 'Form accurate questions using all Arabic interrogatives.' },
  { ar: 'المُثَنَّى وَالجَمْعُ السَّالِمُ', bn: 'দ্বিবচন ও শুদ্ধ বহুবচন', en: 'Dual & Sound Plurals', track: 'Combined', objBn: 'একবচন থেকে দ্বিবচন ও মুজাক্কার-মুয়ান্নাস সালিম বহুবচন গঠন।', objEn: 'Form dual and sound masculine/feminine plurals.' },
  { ar: 'قِصَصُ السُّورِ القَصِيرَةِ', bn: 'ছোট সূরাগুলোর শব্দভাণ্ডার', en: 'Short Surahs Vocabulary', track: 'Quranic', objBn: 'সূরা ইখলাস, ফালাক, নাস ও আসরের মূল শব্দগুলো আয়ত্ত করা।', objEn: 'Master key words from Surahs Al-Ikhlas, Al-Falaq, An-Nas, and Al-Asr.' },
  { ar: 'الهِوَايَاتُ وَوَقْتُ الفَرَاغِ', bn: 'শখ ও অবসর সময়', en: 'Hobbies & Leisure', track: 'MSA', objBn: 'পছন্দ-অপছন্দ ও প্রিয় কাজের বিবরণ দেওয়া।', objEn: 'Express interests, reading habits, and sports.' },
  { ar: 'الأَمْرُ وَالنَّهْيُ البَسِيطُ', bn: 'আদেশ ও নিষেধসূচক ক্রিয়া', en: 'Simple Commands & Prohibitions', track: 'Combined', objBn: 'ইফআল ও লা তাফআল ধাঁচে ভদ্র আদেশ ও নিষেধ গঠন।', objEn: 'Form polite imperative commands and negative prohibitions.' },
  { ar: 'المُضَافُ وَالمُضَافُ إِلَيْهِ', bn: 'ইযাফাত বা সম্বন্ধ পদ', en: 'Idafah (Possessive Construct)', track: 'Combined', objBn: 'দুটি ইসমের সম্বন্ধ যুক্ত করে মালিকানা ও সম্পর্ক প্রকাশ।', objEn: 'Build Idafah phrases accurately without Tanwin on the Mudaf.' },
  { ar: 'الأَعْدَادُ ٢٠ إِلَى ١٠٠', bn: 'সংখ্যা (২০ থেকে ১০০ ও ক্রমবাচক)', en: 'Numbers 20 to 100 & Ordinals', track: 'MSA', objBn: 'দশক সংখ্যা ও প্রথম, দ্বিতীয়, তৃতীয় ক্রমবাচক ব্যবহার।', objEn: 'Use tens, compound numbers, and ordinal adjectives.' },
  { ar: 'الطَّبِيعَةُ وَالبِيئَةُ', bn: 'প্রকৃতি, আকাশ ও পৃথিবী', en: 'Nature & Creation', track: 'Combined', objBn: 'কুরআনে ও আধুনিক আরবিতে প্রকৃতির উপাদানগুলোর শব্দভাণ্ডার।', objEn: 'Explore natural phenomena in MSA and Quranic vocabulary.' },
  { ar: 'مُرَاجَعَةُ المُسْتَوَى الثَّانِي', bn: 'দ্বিতীয় স্তরের পূর্ণাঙ্গ মূল্যায়ন', en: 'Level 2 Synthesis & Assessment', track: 'Combined', objBn: 'দ্বিতীয় স্তরের সমস্ত ক্রিয়া, সংলাপ ও ইযাফাত অনুশীলন।', objEn: 'Review all elementary structures through integrated tasks.' },

  // Level 3: Chapters 34 - 50
  { ar: 'الفِعْلُ المَاضِي وَأَوْزَانُهُ', bn: 'অতীত কাল (ফেলে মাদি)', en: 'Past Tense Verbs & Conjugation', track: 'Combined', objBn: 'তিন অক্ষরের মূল ধাতু থেকে মাদি ক্রিয়ার ১৪টি রূপ শেখা।', objEn: 'Conjugate triliteral past tense verbs across all persons.' },
  { ar: 'المُسْتَقْبَلُ (سَـ وَ سَوْفَ)', bn: 'ভবিষ্যৎ কাল ও পরিকল্পনা', en: 'Future Tense & Planning', track: 'MSA', objBn: 'সীন ও সাওফা ব্যবহার করে ভবিষ্যৎ পরিকল্পনা প্রকাশ।', objEn: 'Express near and distant future intentions.' },
  { ar: 'الجُمْلَةُ الفِعْلِيَّةُ: الفَاعِلُ وَالمَفْعُولُ', bn: 'ক্রিয়াবাচক বাক্য: ফায়েল ও মাফউল', en: 'Verbal Sentences: Subject & Object', track: 'Combined', objBn: 'জুমলা ফেলিয়ায় ফায়েলের পেশ ও মাফউল বিহির যবর প্রয়োগ।', objEn: 'Structure VSO verbal sentences with proper case endings.' },
  { ar: 'النَّفْيُ فِي العَرَبِيَّةِ', bn: 'না-বোধক বাক্য (লা, মা, লাম, লান)', en: 'Negation Particles in Arabic', track: 'Combined', objBn: 'মাদি ও মুদারিতে লা, মা, লাম, লান ও লাইসা-এর সূক্ষ্ম পার্থক্য।', objEn: 'Differentiate negation particles across past, present, and future.' },
  { ar: 'حُرُوفُ العَطْفِ وَالرَّبْطِ', bn: 'সংযোজক অব্যয় ও বাক্য জোড়া', en: 'Conjunctions & Connectors', track: 'Combined', objBn: 'ওয়া, ফা, ছুম্মা, আও, লাকিন দিয়ে সাবলীল অনুচ্ছেদ লেখা।', objEn: 'Connect ideas smoothly using Arabic conjunctions.' },
  { ar: 'قِصَصُ الأَنْبِيَاءِ (نُصُوصٌ مُيَسَّرَةٌ)', bn: 'নবীদের সহজবোধ্য আরবি কাহিনি', en: 'Simplified Stories of the Prophets', track: 'Quranic', objBn: 'সহজ আরবিতে ঐতিহাসিক ও কুরআনিক কাহিনি পাঠ ও অনুধাবন।', objEn: 'Read simplified classical narratives with comprehension checks.' },
  { ar: 'المَقْصُورُ وَالمَنْقُوصُ', bn: 'মাকসূর ও মানকূস নামপদ', en: 'Weak-Ending Nouns', track: 'Combined', objBn: 'মূসা, ফাতা, কাদী ধরনের ইসমের রূপান্তর বোঝা।', objEn: 'Understand vowel behavior in nouns ending with Alif or Ya.' },
  { ar: 'كَانَ وَأَخَوَاتُهَا', bn: 'কানা ও তার সমগোত্রীয় ক্রিয়া', en: 'Kana and Its Sisters', track: 'Combined', objBn: 'জুমলা ইসমিয়ায় কানা, আসবাহা, লাইসা প্রবেশের নাহবি পরিবর্তন।', objEn: 'Apply Kana-group case shifts to Mubtada and Khabar.' },
  { ar: 'إِنَّ وَأَخَوَاتُهَا', bn: 'ইন্না ও তার সমগোত্রীয় অব্যয়', en: 'Inna and Its Sisters', track: 'Combined', objBn: 'নিশ্চয়তা ও জোর প্রদানের জন্য ইন্না, আন্না, লাকিন্না ব্যবহার।', objEn: 'Use Inna-group particles for emphasis and subordination.' },
  { ar: 'الجَذْرُ الثُّلَاثِيُّ وَالكَشْفُ فِي المُعْجَمِ', bn: 'ত্রিবর্ণ মূলধাতু ও অভিধান ব্যবহার', en: 'Triliteral Roots & Dictionary Skills', track: 'Combined', objBn: 'যেকোনো আরবি শব্দ থেকে ৩ অক্ষরের মূলধাতু বের করার কৌশল।', objEn: 'Extract 3-letter roots to unlock unfamiliar Arabic words.' },
  { ar: 'الحِوَارُ الأَكَادِيمِيُّ وَالعِلْمُ', bn: 'জ্ঞানচর্চা ও শিক্ষা বিষয়ক সংলাপ', en: 'Education & Knowledge Dialogues', track: 'MSA', objBn: 'গ্রন্থাগার, গবেষণা ও বিশ্ববিদ্যালয় জীবন নিয়ে কথোপকথন।', objEn: 'Discuss study methods, books, and university topics.' },
  { ar: 'المَبْنِيُّ لِلْمَجْهُولِ (البَسِيط)', bn: 'কর্মবাচ্য (মাজহূল ক্রিয়া)', en: 'Passive Voice Basics', track: 'Combined', objBn: 'মা’রূফ থেকে মাজহূল ক্রিয়া ও নায়েবে ফায়েল গঠন।', objEn: 'Transform active verbs into passive voice with Na’ib al-Fa’il.' },
  { ar: 'الظُّرُوفُ (الزَّمَانُ وَالمَكَانُ)', bn: 'কাল ও স্থানবাচক ক্রিয়া-বিশেষণ', en: 'Adverbs of Time & Place', track: 'Combined', objBn: 'ক্বাবলা, বা’দা, আমামা, খালফা, তাাহতা, ফাওকা-এর ব্যবহার।', objEn: 'Express spatial and temporal relations accurately.' },
  { ar: 'التَّفْضِيلُ وَالمُقَارَنَةُ', bn: 'তুলনা ও শ্রেষ্ঠত্ব (ইসমে তাফদীল)', en: 'Comparatives & Superlatives', track: 'MSA', objBn: 'আফআলু ওয়াযনে তুলনামূলক বাক্য গঠন।', objEn: 'Compare qualities using the Af’al pattern.' },
  { ar: 'مُفْرَدَاتُ القُرْآنِ المَكِّيِّ', bn: 'মক্কী সূরার পুনরাবৃত্ত শব্দভাণ্ডার', en: 'High-Frequency Makki Quranic Terms', track: 'Quranic', objBn: 'পুনরুত্থান, তাকওয়া, হেদায়াত ও রব বিষয়ক কুরআনিক শব্দ।', objEn: 'Study foundational theological terms of Makki Surahs.' },
  { ar: 'كِتَابَةُ الفِقْرَةِ وَالتَّلْخِيصُ', bn: 'অনুচ্ছেদ রচনা ও সারাংশ', en: 'Paragraph Writing & Summarizing', track: 'MSA', objBn: '৮-১০ লাইনের নির্ভুল আরবি অনুচ্ছেদ লেখা।', objEn: 'Write cohesive multi-sentence paragraphs in Arabic.' },
  { ar: 'مُرَاجَعَةُ المُسْتَوَى الثَّالِثِ', bn: 'তৃতীয় স্তরের সমন্বিত পরীক্ষা', en: 'Level 3 Mastery Assessment', track: 'Combined', objBn: 'অতীত-ভবিষ্যৎ, কানা-ইন্না ও মূলধাতুর দক্ষতা যাচাই।', objEn: 'Assess Pre-Intermediate mastery across all skills.' },

  // Level 4: Chapters 51 - 67
  { ar: 'أَوْزَانُ الفِعْلِ المَزِيدِ (فَعَّلَ، فَاعَلَ، أَفْعَلَ)', bn: 'মাযীদ ফীহ বাবসমূহ (২, ৩, ৪)', en: 'Augmented Verb Forms II, III, IV', track: 'Combined', objBn: 'মূল ধাতুতে অক্ষর বৃদ্ধির মাধ্যমে অর্থের পরিবর্তন বোঝা।', objEn: 'Understand semantic shifts in Forms II, III, and IV.' },
  { ar: 'أَوْزَانُ الفِعْلِ المَزِيدِ (تَفَعَّلَ، تَفَاعَلَ، انْفَعَلَ)', bn: 'মাযীদ ফীহ বাবসমূহ (৫, ৬, ৭)', en: 'Augmented Verb Forms V, VI, VII', track: 'Combined', objBn: 'পারস্পরিক ও আত্মবাচক ক্রিয়ার প্যাটার্ন ও অনুবাদ।', objEn: 'Master reflexive and reciprocal meanings in Forms V–VII.' },
  { ar: 'أَوْزَانُ الفِعْلِ المَزِيدِ (افْتَعَلَ، اسْتَفْعَلَ)', bn: 'মাযীদ ফীহ বাবসমূহ (৮, ১০)', en: 'Augmented Verb Forms VIII & X', track: 'Combined', objBn: 'ইফতাআলা ও ইস্তাফআলা বাবের কুরআনিক ও আধুনিক প্রয়োগ।', objEn: 'Analyze Forms VIII and X across MSA and Quranic texts.' },
  { ar: 'جُمُوعُ التَّكْسِيرِ المَشْهُورَةُ', bn: 'ভগ্ন বহুবচনের প্রধান ওজনসমূহ', en: 'Major Broken Plural Patterns', track: 'Combined', objBn: 'বহুল ব্যবহৃত জময়ে তাকসীরের ধাঁচ মনে রাখার কৌশল।', objEn: 'Recognize and produce common broken plural patterns.' },
  { ar: 'المُشْتَقَّاتُ: اسْمُ الفَاعِلِ وَالمَفْعُولِ', bn: 'ইসমে ফায়েল ও ইসমে মাফউল', en: 'Active & Passive Participles', track: 'Combined', objBn: 'ক্রিয়া থেকে কর্তা ও কর্মবাচক বিশেষ্য গঠন করা।', objEn: 'Derive active and passive participles from any verb form.' },
  { ar: 'المَصْدَرُ وَالْمَفْعُولُ الْمُطْلَقُ', bn: 'মাসদার ও মাফউলে মুতলাক', en: 'Verbal Nouns & Cognate Accusative', track: 'Combined', objBn: 'ক্রিয়ামূল চেনা এবং বাক্যে জোর প্রদানের কৌশল।', objEn: 'Master Masdar forms and emphatic cognate accusatives.' },
  { ar: 'الأَفْعَالُ المُعْتَلَّةُ (المِثَالُ وَالأَجْوَفُ)', bn: 'দুর্বল হরফযুক্ত ক্রিয়া (মিসাল ও আজওয়াফ)', en: 'Assimilated & Hollow Verbs', track: 'Combined', objBn: 'ওয়াদা, কালা, বা’আ ধরনের ক্রিয়ার ছরফ পরিবর্তন।', objEn: 'Conjugate weak verbs with initial or middle Waw/Ya.' },
  { ar: 'الفِعْلُ النَّاقِصُ وَاللَّفِيفُ', bn: 'নাকিস ও লাফীফ ক্রিয়া', en: 'Defective Verbs', track: 'Combined', objBn: 'দাআ, হাদা, রামা ধরনের শেষ-দুর্বল ক্রিয়ার রূপান্তর।', objEn: 'Conjugate verbs ending in weak letters accurately.' },
  { ar: 'الإِعْلَالُ وَالإِبْدَالُ (مُقَدِّمَةٌ)', bn: 'হরফ পরিবর্তন নীতি (ইলাল ও ইবদাল)', en: 'Introduction to Morphophonemics', track: 'Combined', objBn: 'দুর্বল অক্ষর কীভাবে হারাকাত অনুযায়ী বদলে যায় তা বোঝা।', objEn: 'Understand systematic vowel-weak letter transformations.' },
  { ar: 'العَرَبِيَّةُ الإِعْلَامِيَّةُ وَالأَخْبَارُ', bn: 'সংবাদ ও আধুনিক গণমাধ্যমের আরবি', en: 'Media & News Arabic', track: 'MSA', objBn: 'সংবাদ শিরোনাম ও প্রতিবেদন পড়ে মূল বক্তব্য অনুধাবন।', objEn: 'Read news headlines and current affairs reports.' },
  { ar: 'الأَسْمَاءُ المَوْصُولَةُ', bn: 'সম্বন্ধবাচক সর্বনাম (আল্লাযী, আল্লাতী)', en: 'Relative Pronouns & Clauses', track: 'Combined', objBn: 'আল্লাযী ও মা/মান দিয়ে জটিল বাক্য যুক্ত করা।', objEn: 'Link relative clauses accurately with gender/number agreement.' },
  { ar: 'أُسْلُوبُ الشَّرْطِ الجَازِمُ', bn: 'শর্তসাপেক্ষ বাক্য (ইন, মান, ইযা)', en: 'Conditional Sentences', track: 'Combined', objBn: 'শর্ত ও জাযাউশ শরতের জযম বিধান ও প্রয়োগ।', objEn: 'Construct real and hypothetical conditional sentences.' },
  { ar: 'المَشْرُوبَاتُ وَالأَخْلَاقُ فِي السُّنَّةِ', bn: 'আদব ও শিষ্টাচার বিষয়ক সংক্ষিপ্ত পাঠ', en: 'Ethics & Character Texts', track: 'Quranic', objBn: 'নৈতিকতা ও শিষ্টাচার বিষয়ক বিশুদ্ধ আরবি পাঠ ও বিশ্লেষণ।', objEn: 'Study classical ethical passages with grammatical notes.' },
  { ar: 'حُرُوفُ النَّصْبِ وَالجَزْمِ لِلْمُضَارِعِ', bn: 'মুদারির নসব ও জযম দানকারী হরফ', en: 'Subjunctive & Jussive Moods', track: 'Combined', objBn: 'আন, লান, কাই এবং লাম, লাম্মা দ্বারা মুদারির শেষ অক্ষর পরিবর্তন।', objEn: 'Master Mansub and Majzum verb endings.' },
  { ar: 'الأَفْعَالُ الخَمْسَةُ', bn: 'পাঁচটি বিশেষ ক্রিয়ারূপ (আফআলে খামসা)', en: 'The Five Verbs', track: 'Combined', objBn: 'নূনের উপস্থিতি ও বিলুপ্তি দ্বারা ইরাব নির্ণয়।', objEn: 'Identify I’rab through preservation and dropping of Nun.' },
  { ar: 'مُحَادَثَاتٌ اجْتِمَاعِيَّةٌ مُتَقَدِّمَةٌ', bn: 'সামাজিক ও সাংস্কৃতিক আলোচনা', en: 'Social & Cultural Discussions', track: 'MSA', objBn: 'মতামত প্রকাশ, যুক্তি দেওয়া ও ভদ্র অসম্মতি জানানো।', objEn: 'Express nuanced opinions and engage in debates.' },
  { ar: 'مُرَاجَعَةُ المُسْتَوَى الرَّابِعِ', bn: 'চতুর্থ স্তরের সমন্বিত মূল্যায়ন', en: 'Level 4 Comprehensive Review', track: 'Combined', objBn: 'মাযীদ ফীহ ও নাহুর মধ্যম স্তরের পূর্ণ পরীক্ষা।', objEn: 'Consolidate intermediate Sarf and Nahw.' },

  // Level 5: Chapters 68 - 84
  { ar: 'المَمْنُوعُ مِنَ الصَّرْفِ', bn: 'গাইরে মুনসারিফ নামপদ', en: 'Diptotes (Al-Mamnu min al-Sarf)', track: 'Combined', objBn: 'যেসব ইসম তানভীন ও কাসরা গ্রহণ করে না তার ৯টি কারণ।', objEn: 'Identify diptote nouns and their genitive Fatha behavior.' },
  { ar: 'المَفْعُولُ لِأَجْلِهِ وَالمَفْعُولُ فِيهِ', bn: 'মাফউলে লি-আজলিহি ও ফীহি', en: 'Accusatives of Purpose & Setting', track: 'Combined', objBn: 'কাজের কারণ ও সময়-স্থান প্রকাশক মানসুব পদের বিশ্লেষণ।', objEn: 'Analyze adverbial accusatives of cause, time, and place.' },
  { ar: 'المَفْعُولُ مَعَهُ وَالْمَفْعُولُ بِهِ الثَّانِي', bn: 'মাফউলে মাআহু ও দ্বিকর্মক ক্রিয়া', en: 'Accompaniment & Double-Object Verbs', track: 'Combined', objBn: 'যান্না ও আ’তা শ্রেণির দ্বিকর্মক ক্রিয়া ব্যবহার।', objEn: 'Master verbs that take two direct objects.' },
  { ar: 'الحَالُ وَصَاحِبُ الحَالِ', bn: 'হাল (অবস্থাবাচক পদ)', en: 'The Circumstantial Accusative (Hal)', track: 'Combined', objBn: 'বাক্যে কাজের সময় কর্তার অবস্থা বর্ণনা করার নিয়ম।', objEn: 'Use single-word, verbal, and nominal Hal clauses.' },
  { ar: 'التَّمْيِيزُ وَأَنْوَاعُهُ', bn: 'তাময়ীয (অস্পষ্টতা দূরীকরণ পদ)', en: 'Accusative of Specification (Tamyiz)', track: 'Combined', objBn: 'সংখ্যা, পরিমাপ ও সম্পর্কের অস্পষ্টতা দূর করা।', objEn: 'Clarify quantities and proportions with Tamyiz.' },
  { ar: 'الاسْتِثْنَاءُ وَأَدَوَاتُهُ', bn: 'ইস্তিসনা (ব্যতিক্রম প্রকাশ)', en: 'Exception Clauses (Illaa & Ghayr)', track: 'Combined', objBn: 'ইল্লা, গাইরু, সিওয়া দ্বারা ব্যতিক্রম সূচক বাক্য বিশ্লেষণ।', objEn: 'Apply accurate case rules in exception constructions.' },
  { ar: 'التَّوَابِعُ: النَّعْتُ وَالتَّوْكِيدُ', bn: 'তাওয়াবে: না’ত ও তাওকীদ', en: 'Appositives: Adjective & Emphasis', track: 'Combined', objBn: 'আসল পদ অনুসরণকারী সিফাত ও জোরদার শব্দাবলি।', objEn: 'Use direct/indirect modifiers and corroborative emphasis.' },
  { ar: 'التَّوَابِعُ: البَدَلُ وَالعَطْفُ', bn: 'তাওয়াবে: বদল ও আতফে বয়ান', en: 'Appositives: Substitution (Badal)', track: 'Combined', objBn: 'কুরআন ও হাদীসে বহুল ব্যবহৃত বদল চেনার উপায়।', objEn: 'Identify inclusive, partial, and associative Badal.' },
  { ar: 'النِّدَاءُ وَأَنْوَاعُ المُنَادَى', bn: 'সম্বোধন পদ (নিদা ও মুনাদা)', en: 'The Vocative Particle & Munada', track: 'Combined', objBn: 'ইয়া, আইয়ুহা দিয়ে সম্বোধন ও মুনাদার ইরাব নির্ণয়।', objEn: 'Address individuals and groups with correct Munada endings.' },
  { ar: 'أَفْعَالُ المَدْحِ وَالذَّمِّ وَالتَّعَجُّبُ', bn: 'প্রশংসা, নিন্দা ও বিস্ময়সূচক বাক্য', en: 'Praise, Blame & Exclamation', track: 'Combined', objBn: 'নি’মা, বি’সা এবং মা আফআলা দিয়ে ভাব প্রকাশ।', objEn: 'Express wonder, praise, and disapproval stylistically.' },
  { ar: 'الإِعْرَابُ التَّقْدِيرِيُّ وَالمَحَلِّيُّ', bn: 'তাকদীরী ও মাহাল্লি ইরাব', en: 'Implied & Positional Case', track: 'Combined', objBn: 'অদৃশ্য ইরাব এবং জুমলার মাহাল নির্ণয়ের পদ্ধতি।', objEn: 'Analyze implied vowel endings and clause-level I’rab.' },
  { ar: 'قِرَاءَةُ النُّصُوصِ التُّرَاثِيَّةِ', bn: 'ধ্রুপদী আরবি গদ্য পাঠ', en: 'Reading Classical Arabic Prose', track: 'Combined', objBn: 'প্রাচীন ও মধ্যযুগীয় আরবি সাহিত্য ও জীবনী পাঠ।', objEn: 'Read unadapted classical historical and biographical passages.' },
  { ar: 'تَحْلِيلُ آيَاتِ الأَحْكَامِ (مُفْرَدَاتٌ)', bn: 'কুরআনিক পরিভাষা ও শাব্দিক বিশ্লেষণ', en: 'Quranic Terminology & Word Analysis', track: 'Quranic', objBn: 'তাফসীর পাঠের জন্য মৌলিক কুরআনিক শব্দকোষ ও সারফ।', objEn: 'Analyze morphological nuances in selected Quranic Ayat.' },
  { ar: 'أَسَالِيبُ التَّأْكِيدِ فِي القُرْآنِ', bn: 'কুরআনের জোর প্রদানের রীতিসমূহ', en: 'Emphasis Styles in the Quran', track: 'Quranic', objBn: 'কাসাম, ইন্না, লামুত তাওকীদ ও নূনে সাকীলা-খাফীফার ব্যবহার।', objEn: 'Recognize linguistic emphasis devices in classical texts.' },
  { ar: 'التَّرْجَمَةُ الأَدَبِيَّةُ (عَرَبِي-بَنْغَالِي)', bn: 'আরবি থেকে বাংলা সাহিত্যিক অনুবাদ', en: 'Literary Translation (AR-BN)', track: 'MSA', objBn: 'বাগধারা ও ভাব ঠিক রেখে আরবি থেকে বাংলা অনুবাদ।', objEn: 'Translate idiomatic Arabic prose into natural Bengali.' },
  { ar: 'الكِتَابَةُ البَحْثِيَّةُ وَالمَقَالَاتُ', bn: 'একাডেমিক প্রবন্ধ রচনা', en: 'Academic Essay Composition', track: 'MSA', objBn: 'ভূমিকা, যুক্তি ও উপসংহারসহ আরবি প্রবন্ধ লেখা।', objEn: 'Draft structured academic essays in Modern Standard Arabic.' },
  { ar: 'مُرَاجَعَةُ المُسْتَوَى الخَامِسِ', bn: 'পঞ্চম স্তরের উচ্চতর নাহু পরীক্ষা', en: 'Level 5 Advanced Nahw Review', track: 'Combined', objBn: 'মানসুবাত, তাওয়াবে ও ইরাব বিশ্লেষণের চূড়ান্ত অনুশীলন।', objEn: 'Demonstrate command of complex syntax and analysis.' },

  // Level 6: Chapters 85 - 100
  { ar: 'عِلْمُ البَلَاغَةِ: المَعَانِي (المُقَدِّمَةُ)', bn: 'বালাগাহ: ইলমুল মাআনী পরিচিতি', en: 'Rhetoric: Ilm al-Ma’ani Intro', track: 'Quranic', objBn: 'বাক্যের অবস্থানুযায়ী অর্থের সূক্ষ্মতা ও খবর-ইনশা বিভাজন।', objEn: 'Study situational meaning, Khabar, and Insha statements.' },
  { ar: 'التَّقْدِيمُ وَالتَّأْخِيرُ', bn: 'তাকদীম ও তাখীর (শব্দক্রম অলংকার)', en: 'Foregrounding & Backgrounding', track: 'Quranic', objBn: 'শব্দ আগে-পরে আনার মাধ্যমে সৃষ্ট অর্থগত গুরুত্ব।', objEn: 'Understand rhetorical effects of word order inversion.' },
  { ar: 'القَصْرُ وَالحَصْرُ', bn: 'কাসর ও হাসর (সীমাবদ্ধকরণ রীতি)', en: 'Rhetorical Restriction (Qasr)', track: 'Quranic', objBn: 'ইন্নামা ও নাফী-ইসবাতে ইল্লা দ্বারা অর্থ নির্দিষ্ট করা।', objEn: 'Analyze exclusivity expressions in Quranic & literary prose.' },
  { ar: 'عِلْمُ البَيَانِ: التَّشْبِيهُ', bn: 'ইলমুল বয়ান: তাশবীহ (উপমা)', en: 'Ilm al-Bayan: Simile (Tashbih)', track: 'Combined', objBn: 'মুশাব্বাহ, মুশাব্বাহ বিহি ও ওয়াজহুশ শাবাহ বিশ্লেষণ।', objEn: 'Break down classical Arabic similes and their components.' },
  { ar: 'الاسْتِعَارَةُ وَالكِنَايَةُ', bn: 'ইস্তিআরা (রূপক) ও কিনায়া', en: 'Metaphor & Metonymy', track: 'Combined', objBn: 'রূপক ও ইঙ্গিতপূর্ণ বাক্যের নান্দনিক সৌন্দর্য অনুধাবন।', objEn: 'Interpret implied metaphors and indirect expressions.' },
  { ar: 'عِلْمُ البَدِيعِ: المُحَسِّنَاتُ', bn: 'ইলমুল বাদী: তিবাক, জিনাস ও সাজ’', en: 'Ilm al-Badi: Rhetorical Devices', track: 'Combined', objBn: 'বিপরীত শব্দ, ধ্বনিসাম্য ও ছন্দের সৌন্দর্য বিশ্লেষণ।', objEn: 'Identify antithesis, paronomasia, and rhythmic prose.' },
  { ar: 'إِعْرَابُ القُرْآنِ الكَرِيمِ (تَطْبِيقٌ)', bn: 'কুরআনের আয়াতের পূর্ণাঙ্গ ইরাব চর্চা', en: 'Applied Quranic I’rab Lab', track: 'Quranic', objBn: 'সংক্ষিপ্ত সূরা ও নির্বাচিত আয়াতের পদ-পদান্তর নির্ণয়।', objEn: 'Perform complete grammatical parsing on selected Ayat.' },
  { ar: 'لَطَائِفُ المُتَرَادِفَاتِ القُرْآنِيَّةِ', bn: 'কুরআনিক সমার্থক শব্দের সূক্ষ্ম পার্থক্য', en: 'Subtle Nuances in Quranic Synonyms', track: 'Quranic', objBn: 'যেমন: মা‘আ-বাঈদা, খাওফ-খাশয়াহ-এর পার্থক্য বোঝা।', objEn: 'Distinguish near-synonyms in classical Arabic usage.' },
  { ar: 'مَنْهَجُ القِرَاءَةِ فِي كُتُبِ التَّفْسِيرِ', bn: 'তাফসীর গ্রন্থ পাঠের কৌশল', en: 'Reading Classical Tafsir Works', track: 'Quranic', objBn: 'তাফসীরের পরিভাষা ও বাক্যরীতির সাথে পরিচিত হওয়া।', objEn: 'Navigate classical Tafsir commentaries independently.' },
  { ar: 'نُصُوصُ الحَدِيثِ وَالأَدَبِ النَّبَوِيِّ', bn: 'হাদীস পাঠ ও বাগ্মিতা (জাওয়ামিউল কালিম)', en: 'Hadith Linguistic Clarity', track: 'Quranic', objBn: 'সংক্ষিপ্ত ও গভীর অর্থবহ আরবি বাক্য বিশ্লেষণ।', objEn: 'Appreciate concise eloquence in classical Hadith texts.' },
  { ar: 'الخَطَابَةُ وَالإِلْقَاءُ العَرَبِيُّ', bn: 'আরবি বক্তৃতা ও উপস্থাপনা', en: 'Arabic Public Speaking & Rhetoric', track: 'MSA', objBn: 'সাবলীলভাবে শ্রোতাদের সামনে আরবি বক্তব্য প্রদান।', objEn: 'Deliver structured, persuasive speeches in formal Arabic.' },
  { ar: 'المُنَاظَرَةُ وَالتَّفْكِيرُ النَّقْدِيُّ', bn: 'যুক্তিতর্ক ও সমালোচনামূলক আলোচনা', en: 'Debate & Critical Discourse', track: 'MSA', objBn: 'একাডেমিক বিতর্কে যুক্তি উপস্থাপন ও খণ্ডন।', objEn: 'Formulate rebuttals and formal arguments in MSA.' },
  { ar: 'الصِّيَاغَةُ الأَدَبِيَّةُ وَالشِّعْرُ الكِلَاسِيكِيُّ', bn: 'আরবি কবিতা ও ছন্দ পরিচিতি', en: 'Classical Arabic Poetry Intro', track: 'Combined', objBn: 'সহজ ধ্রুপদী কবিতার অর্থ ও ছন্দ আস্বাদন।', objEn: 'Read and appreciate foundational classical Arabic poetry.' },
  { ar: 'التَّحْقِيقُ وَالنَّقْدُ اللُّغَوِيُّ', bn: 'ভাষাতাত্ত্বিক সম্পাদনা ও প্রুফরিডিং', en: 'Arabic Editing & Proofreading', track: 'MSA', objBn: 'দীর্ঘ আরবি রচনায় নাহু, ছরফ ও বানান ত্রুটি সংশোধন।', objEn: 'Edit complex manuscripts for grammar and stylistic polish.' },
  { ar: 'مَشْرُوعُ التَّخَرُّجِ: بَحْثٌ مُتَكَامِلٌ', bn: 'স্নাতকোত্তর পর্যায়ের সমাপনী গবেষণা', en: 'Capstone Research Project', track: 'Combined', objBn: 'নির্বাচিত একটি কুরআনিক বা আধুনিক বিষয়ের ওপর আরবি প্রবন্ধ উপস্থাপন।', objEn: 'Complete an end-to-end bilingual research composition.' },
  { ar: 'الامْتِحَانُ الشَّامِلُ لِلْأَكَادِيمِيَّةِ', bn: 'একাডেমির চূড়ান্ত মূল্যায়ন ও সনদ', en: 'Academy Final Mastery Exam', track: 'Combined', objBn: '১০০ অধ্যায়ের সমন্বিত দক্ষতা যাচাই ও চূড়ান্ত সনদ অর্জন।', objEn: 'Demonstrate full MSA and Quranic Arabic proficiency.' },
];

const LESSON_FOCUS_TEMPLATES = [
  { ar: 'المُقَدِّمَةُ وَالمُفْرَدَاتُ', bn: 'পরিচিতি ও নতুন শব্দভাণ্ডার', en: 'Introduction & Core Vocabulary', grammar: 'Word Roots & Pronunciation' },
  { ar: 'الحِوَارُ التَّطْبِيقِيُّ', bn: 'বাস্তবসম্মত কথোপকথন', en: 'Applied Dialogue Practice', grammar: 'Sentence Flow & Greetings' },
  { ar: 'القَوَاعِدُ الأَسَاسِيَّةُ', bn: 'মৌলিক ব্যাকরণ (নাহু ও ছরফ)', en: 'Core Grammar (Nahw & Sarf)', grammar: 'Structural Rule Focus' },
  { ar: 'تَدْرِيبَاتُ الاسْتِمَاعِ', bn: 'শ্রবণ ও উচ্চারণ অনুশীলন', en: 'Listening & Articulation', grammar: 'Harakat & Phonetics' },
  { ar: 'القِرَاءَةُ وَالفَهْمُ', bn: 'পাঠ ও অর্থ অনুধাবন', en: 'Reading Comprehension', grammar: 'Contextual Analysis' },
  { ar: 'التَّحَدُّثُ وَالطَّلَاقَةُ', bn: 'সাবলীল কথন চর্চা', en: 'Speaking Fluency Drill', grammar: 'Spontaneous Framing' },
  { ar: 'الكِتَابَةُ وَالإِمْلَاءُ', bn: 'আরবি লেখা ও বানান শুদ্ধি', en: 'Writing & Orthography', grammar: 'Spelling & Connectors' },
  { ar: 'التَّرْجَمَةُ المُزْدَوَجَةُ', bn: 'আরবি-বাংলা দ্বিমুখী অনুবাদ', en: 'Bidirectional Translation', grammar: 'Idiom & Structure Transfer' },
  { ar: 'التَّطْبِيقُ القُرْآنِيُّ وَالعَمَلِيُّ', bn: 'ব্যবহারিক ও কুরআনিক প্রয়োগ', en: 'Quranic & Practical Application', grammar: 'Root & Usage Comparison' },
  { ar: 'المُرَاجَعَةُ وَالاخْتِبَارُ', bn: 'অধ্যায় মূল্যায়ন ও কুইজ', en: 'Chapter Review & Quiz', grammar: 'Comprehensive Synthesis' },
];

// Full detailed lessons IDs that exist in detailedLessons.ts
export const FULL_LESSON_IDS = new Set([
  'ch1-l1',
  'ch1-l2',
  'ch2-l1',
  'ch3-l1',
  'ch10-l1',
  'ch17-l1',
  'ch34-l1',
  'ch51-l1',
  'ch68-l1',
  'ch85-l1',
]);

function getLevelForChapter(chapterNum: number): CurriculumLevelNumber {
  if (chapterNum <= 16) return 1;
  if (chapterNum <= 33) return 2;
  if (chapterNum <= 50) return 3;
  if (chapterNum <= 67) return 4;
  if (chapterNum <= 84) return 5;
  return 6;
}

export const CURRICULUM_CHAPTERS: ChapterInfo[] = CHAPTER_BLUEPRINTS.map((bp, index) => {
  const chapterNumber = index + 1;
  const level = getLevelForChapter(chapterNumber);
  const lessons: SyllabusLessonStub[] = LESSON_FOCUS_TEMPLATES.map((tpl, lIdx) => {
    const lessonNumber = lIdx + 1;
    const id = `ch${chapterNumber}-l${lessonNumber}`;
    return {
      lessonNumber,
      titleAr: `${bp.ar} — ${tpl.ar}`,
      titleBn: `${bp.bn}: ${tpl.bn}`,
      titleEn: `${bp.en}: ${tpl.en}`,
      grammarFocus: tpl.grammar,
      hasFullContent: FULL_LESSON_IDS.has(id),
    };
  });

  return {
    chapterNumber,
    level,
    track: bp.track,
    titleAr: bp.ar,
    titleBn: bp.bn,
    titleEn: bp.en,
    objectiveBn: bp.objBn,
    objectiveEn: bp.objEn,
    lessons,
  };
});
