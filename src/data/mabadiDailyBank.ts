import { ClassicalSourceBook } from '../types/academy';

export interface MabadiDialogueLine {
  speakerAr: string;
  speakerBn: string;
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
}

export interface MabadiVocabItem {
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  masdarNote?: string;
}

export interface MabadiGrammarRule {
  sourceBook: ClassicalSourceBook;
  titleAr: string;
  titleBn: string;
  explanationBn: string;
  exampleAr: string;
  exampleBn: string;
}

export interface ThematicDomainData {
  groupIndex: number; // 0..19 (for Lessons 1-5 .. 96-100)
  mabadiLevelBn: string;
  difficultyLabel: 'স্তর ১ (সহজ)' | 'স্তর ২ (প্রাথমিক)' | 'স্তর ৩ (মধ্যম)' | 'স্তর ৪ (উচ্চ-মধ্যম)' | 'স্তর ৫ (উন্নত)' | 'স্তর ৬ (উচ্চতর)';
  grammar: MabadiGrammarRule;
  vocabulary: MabadiVocabItem[];
  dialogue: MabadiDialogueLine[]; // 16 authentic progressive Arabic lines
}

export const DOMAIN_BANK_PART1: ThematicDomainData[] = [
  // Group 0 (পাঠ ১–৫): মাবাদিউল আরাবিয়াহ ১ম খণ্ড — পরিচিতি, পরিবার, ঘর ও সহজ প্রশ্নোত্তর
  {
    groupIndex: 0,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ১ (সহজ ইসমিয়া বাক্য)',
    difficultyLabel: 'স্তর ১ (সহজ)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'اِسْمُ الإِشَارَةِ وَالِاسْتِفْهَامُ (هٰذَا، هٰذِهِ، مَا، مَنْ، أَيْنَ)',
      titleBn: 'ইসমে ইশারা ও সহজ প্রশ্নবোধক বাক্য (هٰذَا / هٰذِهِ / مَا / أَيْنَ)',
      explanationBn:
        'মাবাদিউল আরাবিয়াহ ১ম খণ্ডের শুরুতে কাছের পুংলিঙ্গ বোঝাতে هٰذَا এবং স্ত্রীলিঙ্গ বোঝাতে هٰذِهِ বসে। বস্তু সম্পর্কে প্রশ্ন করতে مَا এবং ব্যক্তি সম্পর্কে প্রশ্ন করতে مَنْ ব্যবহার হয়। স্থান জানতে أَيْنَ বসে।',
      exampleAr: 'مَا هٰذَا؟ هٰذَا كِتَابٌ. وَمَنْ هٰذِهِ؟ هٰذِهِ أُخْتِي.',
      exampleBn: 'এটি কী? এটি একটি বই। এবং ইনি কে? ইনি আমার বোন।',
    },
    vocabulary: [
      { arabic: 'أُسْرَةٌ', pronunciationBn: 'উসরাতুন', meaningBn: 'পরিবার', meaningEn: 'Family', masdarNote: 'বহুবচন: أُسَرٌ' },
      { arabic: 'بَيْتٌ', pronunciationBn: 'বাইতুন', meaningBn: 'ঘর / বাড়ি', meaningEn: 'House', masdarNote: 'বহুবচন: بُيُوتٌ' },
      { arabic: 'كِتَابٌ', pronunciationBn: 'কিতাবুন', meaningBn: 'বই', meaningEn: 'Book', masdarNote: 'মূলধাতু: ك ت ب' },
      { arabic: 'قَلَمٌ', pronunciationBn: 'ক্বালামুন', meaningBn: 'কলম', meaningEn: 'Pen', masdarNote: 'বহুবচন: أَقْلَامٌ' },
      { arabic: 'غُرْفَةٌ', pronunciationBn: 'গুরফাতুন', meaningBn: 'কক্ষ / রুম', meaningEn: 'Room', masdarNote: 'বহুবচন: غُرَفٌ' },
      { arabic: 'وَالِدٌ', pronunciationBn: 'ওয়ালিদুন', meaningBn: 'পিতা', meaningEn: 'Father', masdarNote: 'মাসদার: وِلَادَةٌ' },
    ],
    dialogue: [
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ.', pronunciationBn: 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।', meaningBn: 'আপনার ওপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।', meaningEn: 'Peace and mercy of Allah be upon you.' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'وَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللَّهِ، أَهْلًا يَا أَخِي.', pronunciationBn: 'ওয়া আলাইকুমুস সালামু ওয়া রাহমাতুল্লাহ, আহলান ইয়া আখী।', meaningBn: 'ওয়া আলাইকুমুস সালাম, স্বাগতম আমার ভাই।', meaningEn: 'And upon you be peace, welcome my brother.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'مَا اسْمُكَ؟ وَمِنْ أَيْنَ أَنْتَ؟', pronunciationBn: 'মাসমুকা? ওয়া মিন আইনা আনতা?', meaningBn: 'তোমার নাম কী? এবং তুমি কোথা থেকে এসেছ?', meaningEn: 'What is your name? And where are you from?' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'اِسْمِي زَيْدٌ، وَأَنَا مِنْ بَنْغْلَادِيشَ.', pronunciationBn: 'ইসমী যাইদুন, ওয়া আনা মিন বাংলাদেশ।', meaningBn: 'আমার নাম যাইদ, এবং আমি বাংলাদেশ থেকে এসেছি।', meaningEn: 'My name is Zayd, and I am from Bangladesh.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'هٰذَا بَيْتٌ جَمِيلٌ! هَلْ هٰذَا بَيْتُكَ؟', pronunciationBn: 'হাযা বাইতুন জামীলুন! হাল হাযা বাইতুকা?', meaningBn: 'এটি একটি সুন্দর বাড়ি! এটি কি তোমার বাড়ি?', meaningEn: 'This is a beautiful house! Is this your house?' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'نَعَمْ، هٰذَا بَيْتِي، وَفِيهِ أُسْرَتِي الكَرِيمَةُ.', pronunciationBn: 'না‘আম, হাযা বাইতী, ওয়া ফীহি উসরাতিল কারীমাতু।', meaningBn: 'হ্যাঁ, এটি আমার বাড়ি, এবং এতে আমার সম্মানিত পরিবার থাকে।', meaningEn: 'Yes, this is my house, and my noble family lives in it.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'مَنْ هٰذَا الرَّجُلُ الجَالِسُ فِي الغُرْفَةِ؟', pronunciationBn: 'মান হাযার রাজুলুল জালিসু ফিল গুরফাতি?', meaningBn: 'কক্ষে উপবিষ্ট এই ব্যক্তিটি কে?', meaningEn: 'Who is this man sitting in the room?' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'هٰذَا وَالِدِي، هُوَ مُعَلِّمٌ فِي المَدْرَسَةِ.', pronunciationBn: 'হাযা ওয়ালিদী, হুয়া মু‘আল্লিমুন ফিল মাদরাসাতি।', meaningBn: 'ইনি আমার পিতা, তিনি মাদরাসার একজন শিক্ষক।', meaningEn: 'This is my father, he is a teacher at the school.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'وَمَا هٰذَا عَلَى الطَّاوِلَةِ؟', pronunciationBn: 'ওয়া মা হাযা আলাত তাউইলাতি?', meaningBn: 'এবং টেবিলের ওপর এটি কী?', meaningEn: 'And what is this on the table?' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'هٰذَا كِتَابُ مَبَادِئِ العَرَبِيَّةِ وَهٰذَا قَلَمٌ جَدِيدٌ.', pronunciationBn: 'হাযা কিতাবু মাবাদিইল আরাবিয়্যাতি ওয়া হাযা ক্বালামুন জাদীদুন।', meaningBn: 'এটি মাবাদিউল আরাবিয়াহ বই এবং এটি একটি নতুন কলম।', meaningEn: 'This is the Mabadiul Arabiyyah book and this is a new pen.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'أَيْنَ أَخُوكَ الصَّغِيرُ سَعِيدٌ؟', pronunciationBn: 'আইনা আখূকাস সাগীরু সাঈদুন?', meaningBn: 'তোমার ছোট ভাই সাঈদ কোথায়?', meaningEn: 'Where is your younger brother Sa’id?' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'هُوَ فِي حَدِيقَةِ البَيْتِ يَقْرَأُ دَرْسَهُ.', pronunciationBn: 'হুয়া ফী হাদীকাতিল বাইতি ইয়াকরাউ দারসাহু।', meaningBn: 'সে বাড়ির বাগানে বসে তার পাঠ পড়ছে।', meaningEn: 'He is in the house garden reading his lesson.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'هَلْ لَكَ أُخْتٌ أَيْضًا؟', pronunciationBn: 'হাল লাকা উখতুন আইদান?', meaningBn: 'তোমার কি কোনো বোনও আছে?', meaningEn: 'Do you also have a sister?' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'نَعَمْ، لِي أُخْتٌ صَالِحَةٌ وَهِيَ تَحْفَظُ القُرْآنَ.', pronunciationBn: 'না‘আম, লী উখতুন সালিহাতুন ওয়া হিয়া তাহফাযুল কুরআনা।', meaningBn: 'হ্যাঁ, আমার একজন নেককার বোন আছে এবং সে কুরআন মুখস্থ করছে।', meaningEn: 'Yes, I have a righteous sister and she memorizes the Quran.' },
      { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'مَا شَاءَ اللَّهُ! بَارَكَ اللَّهُ فِي أُسْرَتِكَ.', pronunciationBn: 'মাশাআল্লাহ! বারাকাল্লাহু ফী উসरातিকা।', meaningBn: 'মাশাআল্লাহ! আল্লাহ তোমার পরিবারে বরকত দিন।', meaningEn: 'MashaAllah! May Allah bless your family.' },
      { speakerAr: 'زَيْدٌ', speakerBn: 'যাইদ', arabic: 'شُكْرًا لَكَ، تَفَضَّلْ بِالدُّخُولِ وَالجُلُوسِ.', pronunciationBn: 'শুকরান লাকা, তাফাদ্দাল বিদ-দুখূলি ওয়াল-জুলূসি।', meaningBn: 'ধন্যবাদ, অনুগ্রহ করে ভেতরে প্রবেশ করো এবং বসো।', meaningEn: 'Thank you, please enter and sit down.' },
    ],
  },

  // Group 1 (পাঠ ৬–১০): খাবার, পানীয়, রান্না ও রেস্টুরেন্ট
  {
    groupIndex: 1,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ১ (আদেশসূচক ক্রিয়া ও খাবার)',
    difficultyLabel: 'স্তর ১ (সহজ)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'الجُمْلَةُ الإِسْمِيَّةُ: المُبْتَدَأُ وَالخَبَرُ',
      titleBn: 'জুমলায়ে ইসমিয়া: মুবতাদা ও খবরের লিঙ্গ-বচন সামঞ্জস্য',
      explanationBn:
        'বাক্যের উদ্দেশ্যকে মুবতাদা এবং বিধেয়কে খবর বলে। উভয়টি রাফ‘আ (পেশ) গ্রহণ করে এবং বচন ও লিঙ্গে পরস্পর সামঞ্জস্য রাখে। যেমন: الطَّعَامُ لَذِيذٌ (খাবারটি সুস্বাদু), المَاءُ بَارِدٌ (পানি ঠান্ডা)।',
      exampleAr: 'الفَاكِهَةُ طَازَجَةٌ وَالشَّايُ سَاخِنٌ.',
      exampleBn: 'ফলটি তাজা এবং চা গরম।',
    },
    vocabulary: [
      { arabic: 'طَعَامٌ', pronunciationBn: 'ত্বা‘আমুন', meaningBn: 'খাবার', meaningEn: 'Food', masdarNote: 'মাসদার: طُعْمٌ' },
      { arabic: 'مَاءٌ بَارِدٌ', pronunciationBn: 'মাউন বারিদুন', meaningBn: 'ঠান্ডা পানি', meaningEn: 'Cold water', masdarNote: 'বহুবচন: مِيَاهٌ' },
      { arabic: 'خُبْزٌ', pronunciationBn: 'খুবযুন', meaningBn: 'রুটি', meaningEn: 'Bread', masdarNote: 'মাসদার: خَبْزٌ' },
      { arabic: 'شَايٌ', pronunciationBn: 'শাইউন', meaningBn: 'চা', meaningEn: 'Tea' },
      { arabic: 'فَاكِهَةٌ', pronunciationBn: 'ফাকিহাতুন', meaningBn: 'ফল', meaningEn: 'Fruit', masdarNote: 'বহুবচন: فَوَاكِهُ' },
      { arabic: 'لَذِيذٌ', pronunciationBn: 'লাযীযুন', meaningBn: 'সুস্বাদু', meaningEn: 'Delicious', masdarNote: 'মাসদার: لَذَّةٌ' },
    ],
    dialogue: [
      { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'صَبَاحُ الخَيْرِ يَا بُنَيَّ، الفَطُورُ جَاهِزٌ.', pronunciationBn: 'সবাহুল খইরি ইয়া বুনাইয়া, আল-ফাতূরু জাহিযুন।', meaningBn: 'সুপ্রভাত প্রিয় সন্তান, সকালের নাস্তা প্রস্তুত।', meaningEn: 'Good morning my son, breakfast is ready.' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'صَبَاحُ النُّورِ يَا أُمِّي، مَاذَا أَعْدَدْتِ اليَوْمَ؟', pronunciationBn: 'সবাহুন নূরি ইয়া উম্মী, মাযা আ‘দাদতিল ইয়াওমা?', meaningBn: 'শুভ সকাল আম্মু, আজ কী তৈরি করেছ?', meaningEn: 'Good morning mother, what did you prepare today?' },
      { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'أَعْدَدْتُ خُبْزًا سَاخِنًا وَعَسَلًا وَبَيْضًا.', pronunciationBn: 'আ‘দাদতু খুবযান সাখিনান ওয়া আসালান ওয়া বাইদান।', meaningBn: 'আমি গরম রুটি, মধু ও ডিম তৈরি করেছি।', meaningEn: 'I prepared warm bread, honey, and eggs.' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'أَنَا جَائِعٌ جِدًّا، وَأُرِيدُ كُوبَ حَلِيبٍ.', pronunciationBn: 'আনা জা-ই‘উন জিদ্দান, ওয়া উরীদু কূবা হালীবি।', meaningBn: 'আমি খুবই ক্ষুধার্ত, এবং এক গ্লাস দুধ চাই।', meaningEn: 'I am very hungry, and I want a glass of milk.' },
      { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'تَفَضَّلْ، قُلْ بِسْمِ اللَّهِ قَبْلَ الأَكْلِ.', pronunciationBn: 'তাফাদ্দাল, কুল বিসমিল্লাহি ক্বাবলাল আকলি।', meaningBn: 'নাও, খাওয়ার আগে বিসমিল্লাহ বলো।', meaningEn: 'Here you go, say Bismillah before eating.' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'بِسْمِ اللَّهِ. مَا أَلَذَّ هٰذَا الطَّعَامَ!', pronunciationBn: 'বিসমিল্লাহি। মা আলায্যা হাযাত ত্বা‘আমা!', meaningBn: 'বিসমিল্লাহ। এই খাবার কতই না সুস্বাদু!', meaningEn: 'Bismillah. How delicious this food is!' },
      { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'هَلْ هُنَاكَ مَاءٌ بَارِدٌ فِي الثَّلَّاجَةِ؟', pronunciationBn: 'হাল হুনাকা মাউন বারিদুন ফিছ ছাল্লাজাতি?', meaningBn: 'ফ্রিজে কি ঠান্ডা পানি আছে?', meaningEn: 'Is there cold water in the fridge?' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'نَعَمْ يَا أَبِي، هٰذِهِ زُجَاجَةُ مَاءٍ نَقِيٍّ.', pronunciationBn: 'না‘আম ইয়া আবী, হাযিহি যুজাযাতু মায়িন নাক্বিয়্যিন।', meaningBn: 'হ্যাঁ বাবা, এই যে বিশুদ্ধ পানির বোতল।', meaningEn: 'Yes father, here is a bottle of pure water.' },
      { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'جَزَاكَ اللَّهُ خَيْرًا، اِشْرَبِ المَاءَ جَالِسًا.', pronunciationBn: 'জাযাকাল্লাহু খইরান, ইশরাবিল মাআ জালিসান।', meaningBn: 'আল্লাহ তোমাকে উত্তম প্রতিদান দিন, বসে পানি পান করো।', meaningEn: 'May Allah reward you, drink water while sitting.' },
      { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'هَلْ تَشْرَبُونَ الشَّايَ بَعْدَ الفَطُورِ؟', pronunciationBn: 'হাল তাশরাবূনাশ শাইআ বা‘দাল ফাতূরি?', meaningBn: 'নাস্তার পর তোমরা কি চা পান করবে?', meaningEn: 'Will you drink tea after breakfast?' },
      { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'نَعَمْ، فِنْجَانَ شَايٍ بِقَلِيلٍ مِنَ السُّكَّرِ.', pronunciationBn: 'না‘আম, ফিনজানা শাইইন বিক্বালীলিন মিনাস সুক্কারি।', meaningBn: 'হ্যাঁ, অল্প চিনি দিয়ে এক কাপ চা।', meaningEn: 'Yes, a cup of tea with a little sugar.' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'وَأَنَا أُحِبُّ عَصِيرَ البُرْتُقَالِ الطَّازَجَ.', pronunciationBn: 'ওয়া আনা উহিব্বু আসীরাল বুরতুকালিত তাযাঝা।', meaningBn: 'আর আমি তাজা কমলার জুস পছন্দ করি।', meaningEn: 'And I love fresh orange juice.' },
      { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'كُلُوا الفَاكِهَةَ أَيْضًا، إِنَّهَا مُفِيدَةٌ لِلصِّحَّةِ.', pronunciationBn: 'কুলুল ফাকিহাতা আইদান, ইন্নাহা মুফীদাতুন লিস-সিহহাতি।', meaningBn: 'ফলও খাও, নিশ্চয়ই তা স্বাস্থ্যের জন্য উপকারী।', meaningEn: 'Eat the fruit too, it is beneficial for health.' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا.', pronunciationBn: 'আলহামদু লিল্লাহিল্লাযী আত‘আমানা ওয়া সাক্বানা।', meaningBn: 'সকল প্রশংসা আল্লাহর যিনি আমাদের খাওয়ালেন ও পান করালেন।', meaningEn: 'Praise be to Allah who fed us and gave us drink.' },
      { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'هَيَّا نَغْسِلْ أَيْدِيَنَا الآنَ قَبْلَ الخُرُوجِ.', pronunciationBn: 'হাইয়া নাগসিল আইদিয়ানাল আনা কাবলাল খুরূজি।', meaningBn: 'চলো বের হওয়ার আগে এখন হাত ধুয়ে নিই।', meaningEn: 'Let us wash our hands now before going out.' },
      { speakerAr: 'أَنَسٌ', speakerBn: 'আনাস', arabic: 'حَاضِرٌ يَا أَبِي، أَنَا مُسْتَعِدٌّ لِلْمَدْرَسَةِ.', pronunciationBn: 'হাদিরুন ইয়া আবী, আনা মুসতা‘ইদ্দুন লিল-মাদরাসাতি।', meaningBn: 'জি বাবা, আমি মাদরাসায় যাওয়ার জন্য প্রস্তুত।', meaningEn: 'Ready father, I am prepared for school.' },
    ],
  },

  // Group 2 (পাঠ ১১–১৫): বাজার, দোকান, দাম ও কেনাকাটা
  {
    groupIndex: 2,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ১/২ (সংখ্যা, দাম ও হরুফে জার)',
    difficultyLabel: 'স্তর ১ (সহজ)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'الأَعْدَادُ وَحَرْفُ الجَرِّ (بِـ)',
      titleBn: 'সংখ্যা, মূল্য জিজ্ঞাসা (بِكَمْ) ও হরুফে জার (بِـ)',
      explanationBn:
        'কোনো জিনিসের দাম জানতে بِكَمْ (কত টাকায়) ব্যবহৃত হয়। উত্তর দেওয়ার সময় মূল্যের আগে بِـ হরফে জার বসে, যা পরের শব্দটিকে যের দেয়। যেমন: بِعَشَرَةِ رِيَالَاتٍ (দশ রিয়ালে)।',
      exampleAr: 'بِكَمْ هٰذَا القَمِيصُ؟ هُوَ بِخَمْسِينَ رِيَالًا.',
      exampleBn: 'এই জামাটির দাম কত? এটি পঞ্চাশ রিয়াল।',
    },
    vocabulary: [
      { arabic: 'سُوقٌ', pronunciationBn: 'সূকুন', meaningBn: 'বাজার', meaningEn: 'Market', masdarNote: 'বহুবচন: أَسْوَاقٌ' },
      { arabic: 'بَائِعٌ', pronunciationBn: 'বা-ই‘উন', meaningBn: 'বিক্রেতা', meaningEn: 'Seller', masdarNote: 'মাসদার: البَيْعُ' },
      { arabic: 'مُشْتَرٍ', pronunciationBn: 'মুশতারিন', meaningBn: 'ক্রেতা', meaningEn: 'Buyer', masdarNote: 'মাসদার: الاِشْتِرَاءُ' },
      { arabic: 'ثَمَنٌ / سِعْرٌ', pronunciationBn: 'ছামানুন / সি‘রুন', meaningBn: 'মূল্য / দাম', meaningEn: 'Price' },
      { arabic: 'رَخِيصٌ', pronunciationBn: 'রাখীসুন', meaningBn: 'সস্তা', meaningEn: 'Cheap', masdarNote: 'বিপরীত: غَالٍ (দামি)' },
      { arabic: 'قَمِيصٌ', pronunciationBn: 'ক্বামীসুন', meaningBn: 'জামা', meaningEn: 'Shirt', masdarNote: 'বহুবচন: قُمْصَانٌ' },
    ],
    dialogue: [
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'السَّلَامُ عَلَيْكُمْ، هَلْ هٰذَا دُكَّانُ المَلَابِسِ؟', pronunciationBn: 'আসসালামু আলাইকুম, হাল হাযা দুক্কানুল মালাবিসি?', meaningBn: 'আসসালামু আলাইকুম, এটি কি কাপড়ের দোকান?', meaningEn: 'Peace be upon you, is this the clothing shop?' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'وَعَلَيْكُمُ السَّلَامُ، نَعَمْ، تَفَضَّلْ مَاذَا تُرِيدُ؟', pronunciationBn: 'ওয়া আলাইকুমুস সালাম, না‘আম, তাফাদ্দাল মাযা তুরীদু?', meaningBn: 'ওয়া আলাইকুমুস সালাম, জি, বলুন আপনার কী লাগবে?', meaningEn: 'Peace be upon you, yes, please what would you like?' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'أُرِيدُ قَمِيصًا أَبْيَضَ وَثَوْبًا جَدِيدًا.', pronunciationBn: 'উরীদু ক্বামীসান আবইয়াদা ওয়া ছাওবান জাদিদান।', meaningBn: 'আমি একটি সাদা শার্ট এবং একটি নতুন জুব্বা চাই।', meaningEn: 'I want a white shirt and a new robe.' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'انْظُرْ هٰذَا القَمِيصَ القُطْنِيَّ، جَوْدَتُهُ مُمْتَازَةٌ.', pronunciationBn: 'উনযুর হাযাল ক্বামীসাল কুতনিইয়া, জাওদাতুহু মুমতাজাতুন।', meaningBn: 'এই সুতি শার্টটি দেখুন, এর মান চমৎকার।', meaningEn: 'Look at this cotton shirt, its quality is excellent.' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'جَمِيلٌ جِدًّا! بِكَمْ هٰذَا القَمِيصُ؟', pronunciationBn: 'জামীলুন জিদ্দান! বিকাম হাযাল ক্বামীসু?', meaningBn: 'খুব সুন্দর! এই শার্টটির দাম কত?', meaningEn: 'Very nice! How much is this shirt?' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'ثَمَنُهُ سِتُّونَ رِيَالًا فَقَطْ.', pronunciationBn: 'ছামানুহু সিত্তূনা রিয়ালান ফাক্বাত।', meaningBn: 'এর দাম মাত্র ষাট রিয়াল।', meaningEn: 'Its price is sixty riyals only.' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'هٰذَا غَالٍ قَلِيلًا، هَلْ يُمْكِنُ التَّخْفِيضُ؟', pronunciationBn: 'হাযা গালিন ক্বালীলান, হাল ইয়ুমকিনুত তাখফীদু?', meaningBn: 'এটা একটু দামি, কিছু কমানো যাবে কি?', meaningEn: 'That is a bit expensive, is a discount possible?' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'خُذْهُ بِخَمْسِينَ رِيَالًا مِنْ أَجْلِكَ.', pronunciationBn: 'খুযহু বিখামসীনা রিয়ালান মিন আজলিকা।', meaningBn: 'আপনার খাতিরে পঞ্চাশ রিয়ালে নিন।', meaningEn: 'Take it for fifty riyals for your sake.' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'هٰذَا سِعْرٌ مُنَاسِبٌ. وَبِكَمْ كِيلُو التُّفَّاحِ هُنَاكَ؟', pronunciationBn: 'হাযা সি‘রুন মুনাসিবুন। ওয়া বিকাম কীলুত তুফফাহি হুনাকা?', meaningBn: 'এটি উপযুক্ত দাম। আর ওখানে এক কেজি আপেলের দাম কত?', meaningEn: 'This is a fair price. And how much is a kilo of apples over there?' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'التُّفَّاحُ الطَّازَجُ بِعَشَرَةِ رِيَالَاتٍ، وَهُوَ رَخِيصٌ اليَوْمَ.', pronunciationBn: 'আত-তুফফাহুত তাযাজু বি‘আশারাতি রিয়ালাতিন, ওয়া হুয়া রাখীসুল ইয়াওমা।', meaningBn: 'তাজা আপেল দশ রিয়াল কেজি, আজ এটা সস্তা।', meaningEn: 'Fresh apples are ten riyals, and they are cheap today.' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'أَعْطِنِي كِيلُوغْرَامَيْنِ مِنَ التُّفَّاحِ وَكِيلُو مَوْزٍ.', pronunciationBn: 'আ‘তিনী কীলূগরামাইনি মিনাত তুফফাহি ওয়া কীলূ মাওযিন।', meaningBn: 'আমাকে দুই কেজি আপেল এবং এক কেজি কলা দিন।', meaningEn: 'Give me two kilos of apples and one kilo of bananas.' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'حَاضِرٌ، هَلْ تُرِيدُ خُضْرَوَاتٍ أُخْرَى؟', pronunciationBn: 'হাদিরুন, হাল তুরীদু খুদরাওয়াতিন উখরা?', meaningBn: 'জি আচ্ছা, আপনি কি অন্য কোনো সবজি নেবেন?', meaningEn: 'Certainly, do you want any other vegetables?' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'لَا، شُكْرًا. كَمِ المَجْمُوعُ الكُلِّيُّ؟', pronunciationBn: 'লা, শুকরান। কামিল মাজমূ‘উল কুল্লিয়্যু?', meaningBn: 'না, ধন্যবাদ। সর্বমোট কত টাকা হলো?', meaningEn: 'No, thank you. What is the grand total?' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'المَجْمُوعُ ثَمَانُونَ رِيَالًا.', pronunciationBn: 'আল-মাজমূ‘উ ছামানূনা রিয়ালান।', meaningBn: 'মোট আশি রিয়াল হয়েছে।', meaningEn: 'The total is eighty riyals.' },
      { speakerAr: 'المُشْتَرِي', speakerBn: 'ক্রেতা', arabic: 'تَفَضَّلْ هٰذِهِ مِائَةُ رِيَالٍ.', pronunciationBn: 'তাফাদ্দাল হাযিহি মিআতু রিয়ালিন।', meaningBn: 'এই নিন একশ রিয়ালের নোট।', meaningEn: 'Here is a hundred riyal note.' },
      { speakerAr: 'البَائِعُ', speakerBn: 'বিক্রেতা', arabic: 'شُكْرًا، وَهٰذَا البَاقِي عِشْرُونَ رِيَالًا. بَارَكَ اللَّهُ لَكَ.', pronunciationBn: 'শুকরান, ওয়া হাযাল বাক্বী ইশরূনা রিয়ালান। বারাকাল্লাহু লাকা।', meaningBn: 'ধন্যবাদ, আর এই যে বাকি বিশ রিয়াল। আল্লাহ আপনার বরকত দিন।', meaningEn: 'Thank you, and here is your twenty riyals change. May Allah bless you.' },
    ],
  },

  // Group 3 (পাঠ ১৬–২০): রাস্তা, যানবাহন, ভ্রমণ ও দিকনির্দেশনা
  {
    groupIndex: 3,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ২ (যারফে মাকান ও হরুফে জার)',
    difficultyLabel: 'স্তর ২ (প্রাথমিক)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'ظَرْفُ المَكَانِ (أَمَامَ، خَلْفَ، يَمِينَ، شِمَالَ)',
      titleBn: 'যারফে মাকান (দিক ও অবস্থানবাচক শব্দ)',
      explanationBn:
        'স্থান ও দিক বোঝাতে أَمَامَ (সামনে), خَلْفَ (পিছনে), فَوْقَ (উপরে), تَحْتَ (নিচে), যবরের ওপর ব্যবহৃত হয় এবং এদের পরবর্তী শব্দ ইদাফার কারণে মাজরূর (যেরযুক্ত) হয়। যেমন: أَمَامَ المَحَطَّةِ।',
      exampleAr: 'المَسْجِدُ أَمَامَ المَدْرَسَةِ وَيَمِينَ الشَّارِعِ.',
      exampleBn: 'মসজিদটি মাদরাসার সামনে এবং রাস্তার ডানদিকে।',
    },
    vocabulary: [
      { arabic: 'طَرِيقٌ / شَارِعٌ', pronunciationBn: 'ত্বারীকুন / শারি‘উন', meaningBn: 'রাস্তা / সড়ক', meaningEn: 'Road / street' },
      { arabic: 'مَحَطَّةٌ', pronunciationBn: 'মাহাত্তাতুন', meaningBn: 'স্টেশন', meaningEn: 'Station' },
      { arabic: 'مَطَارٌ', pronunciationBn: 'মাতারুন', meaningBn: 'বিমানবন্দর', meaningEn: 'Airport' },
      { arabic: 'حَافِلَةٌ', pronunciationBn: 'হাফিলাতুন', meaningBn: 'বাস', meaningEn: 'Bus' },
      { arabic: 'فُنْدُقٌ', pronunciationBn: 'ফুনদুকুন', meaningBn: 'হোটেল', meaningEn: 'Hotel' },
      { arabic: 'جَوَازُ السَّفَرِ', pronunciationBn: 'জাওয়াযুস সাফারি', meaningBn: 'পাসপোর্ট', meaningEn: 'Passport', masdarNote: 'মাসদার: السَّفَرُ' },
    ],
    dialogue: [
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'عَفْوًا يَا أَخِي، أَيْنَ مَحَطَّةُ القِطَارِ مِنْ فَضْلِكَ؟', pronunciationBn: 'আফওয়ান ইয়া আখী, আইনা মাহাত্তাতুল ক্বিতারি মিন ফাদলিকা?', meaningBn: 'মাফ করবেন ভাই, অনুগ্রহ করে বলবেন রেলস্টেশন কোথায়?', meaningEn: 'Excuse me brother, where is the train station please?' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'اِتَّجِهْ مُبَاشَرَةً، ثُمَّ انْعَطِفْ يَمِينًا بَعْدَ الإِشَارَةِ.', pronunciationBn: 'ইত্তাজিহ মুবাশারাতান, ছুম্মান‘আতিফ ইয়ামীنان বা‘দাল ইশারাতি।', meaningBn: 'সোজা এগিয়ে যান, তারপর ট্রাফিক সিগন্যালের পর ডানে ঘুরুন।', meaningEn: 'Go straight ahead, then turn right after the traffic light.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'هَلْ المَحَطَّةُ بَعِيدَةٌ مِنْ هُنَا؟', pronunciationBn: 'হালিল মাহাত্তাতু বা‘ঈদাতুন মিন হুনা?', meaningBn: 'স্টেশনটি কি এখান থেকে দূরে?', meaningEn: 'Is the station far from here?' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'لَا، هِيَ قَرِيبَةٌ جِدًّا، أَمَامَ الفُنْدُقِ الكَبِيرِ.', pronunciationBn: 'লা, হিয়া কারীবাতুন জিদ্দান, আমামাল ফুনদুকিল কাবীরি।', meaningBn: 'না, এটি খুবই কাছে—বড় হোটেলটির ঠিক সামনে।', meaningEn: 'No, it is very close, right in front of the big hotel.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'أَيُّ حَافِلَةٍ تَذْهَبُ إِلَى المَطَارِ الدَّوْلِيِّ؟', pronunciationBn: 'আইয়ু হাফিলাতিন তাযহাবু ইলাল মাতারিদ দাওলিয়্যি?', meaningBn: 'কোন বাস আন্তর্জাতিক বিমানবন্দরে যায়?', meaningEn: 'Which bus goes to the international airport?' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'الحَافِلَةُ رَقْمُ عَشَرَةٍ تَنْطَلِقُ كُلَّ نِصْفِ سَاعَةٍ.', pronunciationBn: 'আল-হাফিলাতু রাক্বমু আশারাতিন তানতালিক্বু কুল্লা নিসফি সা‘আতিন।', meaningBn: 'দশ নম্বর বাস প্রতি আধঘণ্টা পরপর ছাড়ে।', meaningEn: 'Bus number ten departs every half hour.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'مَتَى تَصِلُ الرِّحْلَةُ إِلَى المَدِينَةِ المُنَوَّرَةِ؟', pronunciationBn: 'মাতা তাসিলুর রিহলাতু ইলাল মাদীনাতিল মুনাওয়ারাতি?', meaningBn: 'ভ্রমণটি মদীনা মুনাওয়ারায় কখন পৌঁছাবে?', meaningEn: 'When does the trip arrive in Madinah Munawwarah?' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'تَسْتَغْرِقُ الرِّحْلَةُ أَرْبَعَ سَاعَاتٍ بِإِذْنِ اللَّهِ.', pronunciationBn: 'তাসতাগরিক্বুর রিহলাতু আরবা‘আ সা‘আতিন বি-ইযনিল্লাহি।', meaningBn: 'আল্লাহর ইচ্ছায় সফরটি চার ঘণ্টা সময় নেবে।', meaningEn: 'The journey takes four hours by Allah’s leave.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'هَلْ حَجْزُ التَّذْكِرَةِ مُتَاحٌ الآنَ؟', pronunciationBn: 'হাল হাজযুত তাযকিরাতি মুতাহুনিল আনা?', meaningBn: 'এখন কি টিকিট বুকিং পাওয়া যাবে?', meaningEn: 'Is ticket booking available now?' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'نَعَمْ، أَرِنِي جَوَازَ السَّفَرِ مِنْ فَضْلِكَ.', pronunciationBn: 'না‘আম, আরিনী জাওয়াযাস সাফারি মিন ফাদলিকা।', meaningBn: 'জি, অনুগ্রহ করে আমাকে আপনার পাসপোর্টটি দেখান।', meaningEn: 'Yes, show me your passport please.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'تَفَضَّلْ، وَأُرِيدُ مَقْعَدًا بِجَانِبِ النَّافِذَةِ.', pronunciationBn: 'তাফাদ্দাল, ওয়া উরীদু মাক্ব‘আদান বিজানিবিন নাফিযাতি।', meaningBn: 'এই নিন, আর আমি জানালার পাশে একটি আসন চাই।', meaningEn: 'Here you go, and I would like a window seat.' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'لَقَدْ حَجَزْتُ لَكَ المَقْعَدَ السَّابِعَ فِي الدَّرَجَةِ الأُولَى.', pronunciationBn: 'লাক্বাদ হাজাযতু লাকাল মাক্ব‘আদাস সাবি‘আ ফিদ দারাজাতিল ঊলা।', meaningBn: 'আমি প্রথম শ্রেণিতে আপনার জন্য ৭ নম্বর আসন বুক করেছি।', meaningEn: 'I booked seat number seven for you in first class.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'أَيْنَ أَضَعُ الحَقِيبَةَ الكَبِيرَةَ؟', pronunciationBn: 'আইনা আদা‘উল হাক্বীবাতাল কাবীরাতা?', meaningBn: 'বড় ব্যাগটি আমি কোথায় রাখব?', meaningEn: 'Where should I place the large suitcase?' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'ضَعْهَا فِي صُنْدُوقِ الأَمْتِعَةِ أَسْفَلَ الحَافِلَةِ.', pronunciationBn: 'দা‘হা ফী সুন্দূকিল আমতি‘আতি আসফালাল হাফিলাতি।', meaningBn: 'এটি বাসের নিচে মালামালের বক্সে রাখুন।', meaningEn: 'Put it in the luggage compartment beneath the bus.' },
      { speakerAr: 'المُسَافِرُ', speakerBn: 'মুসাফির', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا، شُكْرًا لَكَ.', pronunciationBn: 'সুবহানাল্লাযী সাখখারা লানা হাযা, শুকরান লাকা।', meaningBn: 'পবিত্র সেই সত্তা যিনি এটি আমাদের বশীভূত করে দিয়েছেন, ধন্যবাদ।', meaningEn: 'Glory be to Him who subjected this to us, thank you.' },
      { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মচারী', arabic: 'أَسْتَوْدِعُ اللَّهَ دِينَكَ وَأَمَانَتَكَ، رِحْلَةً سَعِيدَةً.', pronunciationBn: 'আসতাওদি‘উল্লাহা দীনাকা ওয়া আমানাতাকা, রিহলাতান সা‘ঈদাতান।', meaningBn: 'আপনার দ্বীন ও আমানত আল্লাহর জিম্মায় সোপর্দ করলাম, শুভ সফর।', meaningEn: 'I entrust your faith and safety to Allah, have a blessed journey.' },
    ],
  },

  // Group 4 (পাঠ ২১–২৫): স্কুল, পড়াশোনা, সময়, অফিস ও ফোনে কথা
  {
    groupIndex: 4,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ২ (ফেল মাদি, মুদারি ও সময়)',
    difficultyLabel: 'স্তর ২ (প্রাথমিক)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'الفِعْلُ المَاضِي وَالمُضَارِعُ',
      titleBn: 'ফেলে মাদি (অতীত) ও ফেলে মুদারি (বর্তমান/ভবিষ্যৎ) ক্রিয়া',
      explanationBn:
        'অতীত কালের কাজ বোঝাতে ফেলে মাদি (যেমন: دَرَسَ, كَتَبَ) এবং বর্তমান বা ভবিষ্যতের কাজ বোঝাতে ফেলে মুদারি (يَدْرُسُ, يَكْتُبُ) ব্যবহৃত হয়। মুদারির শুরুতে أَتَيْنَ (أ، ت، ي، ن) চিহ্ন থাকে।',
      exampleAr: 'ذَهَبْتُ إِلَى المَدْرَسَةِ أَمْسِ، وَأَذْهَبُ إِلَى المَكْتَبِ غَدًا.',
      exampleBn: 'গতকাল আমি স্কুলে গিয়েছিলাম এবং আগামীকাল অফিসে যাব।',
    },
    vocabulary: [
      { arabic: 'مَدْرَسَةٌ', pronunciationBn: 'মাদরাসাতুন', meaningBn: 'বিদ্যালয় / মাদরাসা', meaningEn: 'School', masdarNote: 'মূলধাতু: د ر س' },
      { arabic: 'سَاعَةٌ', pronunciationBn: 'সা‘আতুন', meaningBn: 'ঘড়ি / ঘণ্টা', meaningEn: 'Hour / Watch' },
      { arabic: 'اِمْتِحَانٌ', pronunciationBn: 'ইমতিহানুন', meaningBn: 'পরীক্ষা', meaningEn: 'Exam', masdarNote: 'ইফতিআল বাব' },
      { arabic: 'وَاجِبٌ مَنْزِلِيٌّ', pronunciationBn: 'ওয়াজিবুন মানযিলিয়্যুন', meaningBn: 'বাড়ির কাজ', meaningEn: 'Homework' },
      { arabic: 'هَاتِفٌ', pronunciationBn: 'হাতিফুন', meaningBn: 'ফোন', meaningEn: 'Phone' },
      { arabic: 'مَوْعِدٌ', pronunciationBn: 'মাও‘ইদুন', meaningBn: 'নির্ধারিত সময় / সাক্ষাৎ', meaningEn: 'Appointment', masdarNote: 'মাসদার: الوَعْدُ' },
    ],
    dialogue: [
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'أَهْلًا بِكُمْ يَا أَبْنَائِي، كَمِ السَّاعَةُ الآنَ؟', pronunciationBn: 'আহলান বিকুম ইয়া আবনা-ই, কামিস সা‘আতুল আনা?', meaningBn: 'স্বাগতম প্রিয় শিক্ষার্থীরা, এখন কয়টা বাজে?', meaningEn: 'Welcome my sons, what time is it now?' },
      { speakerAr: 'حَامِدٌ', speakerBn: 'হামিদ', arabic: 'السَّاعَةُ الثَّامِنَةُ صَبَاحًا يَا أُسْتَاذُ.', pronunciationBn: 'আসসা‘আতুছ ছামিনাতু সবাহান ইয়া উস্তাযু।', meaningBn: 'সকাল আটটা বাজে, হে শিক্ষক।', meaningEn: 'It is eight o’clock in the morning, teacher.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'مَتَى اسْتَيْقَظْتَ اليَوْمَ يَا حَامِدُ؟', pronunciationBn: 'মাতাস-তাইক্বাযতাল ইয়াওমা ইয়া হামিদু?', meaningBn: 'হামিদ, আজ তুমি কখন ঘুম থেকে উঠেছ?', meaningEn: 'When did you wake up today, Hamid?' },
      { speakerAr: 'حَامِدٌ', speakerBn: 'হামিদ', arabic: 'اِسْتَيْقَظْتُ فِي السَّاعَةِ الخَامِسَةِ لِصَلَاةِ الفَجْرِ.', pronunciationBn: 'ইসতাইক্বাযতু ফিস সা‘আতিল খামিসাতি লিসালাতিল ফাজরি।', meaningBn: 'আমি ফজরের নামাজের জন্য পাঁচটায় উঠেছি।', meaningEn: 'I woke up at five o’clock for Fajr prayer.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'مُمْتَازٌ! هَلْ كَتَبْتُمْ الوَاجِبَ المَنْزِلِيَّ؟', pronunciationBn: 'মুমতাযুন! হাল কাতাবতুমুল ওয়াজিবাল মানযিলিইয়া?', meaningBn: 'চমৎকার! তোমরা কি বাড়ির কাজ লিখে এনেছ?', meaningEn: 'Excellent! Did you write the homework?' },
      { speakerAr: 'يَاسِرٌ', speakerBn: 'ইয়াসির', arabic: 'نَعَمْ، كَتَبْنَا التَّمْرِينَ وَحَفِظْنَا العَشْرَ كَلِمَاتٍ.', pronunciationBn: 'না‘আম, কাতাবনাত তামরীনা ওয়া হাফিযনাল আশরা কালিমাতিন।', meaningBn: 'জি, আমরা অনুশীলনী লিখেছি এবং দশটি শব্দ মুখস্থ করেছি।', meaningEn: 'Yes, we wrote the exercise and memorized the ten words.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'مَا الدَّرْسُ القَادِمُ فِي الجَدْوَلِ الأُسْبُوعِيِّ؟', pronunciationBn: 'মাদ-দারসুল কাদিমু ফিল জাদওয়ালিল উসবূ‘ইয়্যি?', meaningBn: 'সাপ্তাহিক রুটিনে পরবর্তী পাঠ কী?', meaningEn: 'What is the next lesson on the weekly schedule?' },
      { speakerAr: 'حَامِدٌ', speakerBn: 'হামিদ', arabic: 'يَوْمُ الثُّلَاثَاءِ نَدْرُسُ قَوَاعِدَ الصَّرْفِ وَالنَّحْوِ.', pronunciationBn: 'ইয়াওমুছ ছুলাসায়ি নাদরুসু ক্বাওয়া‘ইদাস সরফি ওয়ান নাহউই।', meaningBn: 'মঙ্গলবার আমরা ছরফ ও নাহুর নিয়মাবলি পড়ি।', meaningEn: 'On Tuesday we study the rules of Sarf and Nahw.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'وَمَتَى الاِمْتِحَانُ الشَّهْرِيُّ؟', pronunciationBn: 'ওয়া মাতাল ইমতিহানুশ শাহরিয়্যু?', meaningBn: 'এবং মাসিক পরীক্ষা কবে?', meaningEn: 'And when is the monthly exam?' },
      { speakerAr: 'يَاسِرٌ', speakerBn: 'ইয়াসির', arabic: 'يَبْدَأُ الاِمْتِحَانُ يَوْمَ الأَرْبِعَاءِ القَادِمِ.', pronunciationBn: 'ইয়াবদাউল ইমতিহানু ইয়াওমুল আরবি‘আয়িল ক্বাদিমি।', meaningBn: 'আগামী বুধবার পরীক্ষা শুরু হবে।', meaningEn: 'The exam begins next Wednesday.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'كَمْ سَاعَةً تَدْرُسُونَ فِي البَيْتِ؟', pronunciationBn: 'কাম সা‘আতান তাদরুসূনা ফিল বাইতি?', meaningBn: 'বাড়িতে তোমরা কত ঘণ্টা পড়াশোনা করো?', meaningEn: 'How many hours do you study at home?' },
      { speakerAr: 'حَامِدٌ', speakerBn: 'হামিদ', arabic: 'أَدْرُسُ ثَلَاثَ سَاعَاتٍ كُلَّ مَسَاءٍ.', pronunciationBn: 'আদরুসু ছালাছা সা‘আতিন কুল্লা মাসায়িন।', meaningBn: 'আমি প্রতি সন্ধ্যায় তিন ঘণ্টা পড়াশোনা করি।', meaningEn: 'I study for three hours every evening.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'هَلْ تَتَّصِلُ بِأُسْتَاذِكَ عَبْرَ الهَاتِفِ إِذَا أَشْكَلَ عَلَيْكَ شَيْءٌ؟', pronunciationBn: 'হাল তাত্তাসিলু বি-উস্তাযিকা আবরাল হাতিফি ইযা আশকালা আলাইকা শাইউন?', meaningBn: 'কোনো বিষয় কঠিন লাগলে কি তুমি ফোনে শিক্ষকের সাথে যোগাযোগ করো?', meaningEn: 'Do you contact your teacher by phone if something seems difficult?' },
      { speakerAr: 'حَامِدٌ', speakerBn: 'হামিদ', arabic: 'نَعَمْ، وَأُسَجِّلُ المُلَاحَظَاتِ فِي دَفْتَرِي.', pronunciationBn: 'না‘আম, ওয়া উসাজ্জিলুল মুলাহাজাতি ফী দাফতারী।', meaningBn: 'জি, এবং আমি আমার খাতায় নোট লিখে রাখি।', meaningEn: 'Yes, and I record the notes in my notebook.' },
      { speakerAr: 'الأُسْتَاذُ', speakerBn: 'শিক্ষক', arabic: 'الوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ.', pronunciationBn: 'আল-ওয়াক্তু কাস-সাইফি ইন লাম তাকতা‘হু ক্বাতা‘আকা।', meaningBn: 'সময় তরবারির মতো, তুমি একে কাজে না লাগালে এটি তোমাকে কেটে ফেলবে।', meaningEn: 'Time is like a sword; if you do not cut it, it cuts you.' },
      { speakerAr: 'يَاسِرٌ', speakerBn: 'ইয়াসির', arabic: 'صَدَقْتَ يَا أُسْتَاذُ، سَنَجْتَهِدُ فِي طَلَبِ العِلْمِ.', pronunciationBn: 'সাদাক্বতা ইয়া উস্তাযু, সানাজতাহিদু ফী তালাবিল ইলমি।', meaningBn: 'আপনি ঠিক বলেছেন হে শিক্ষক, আমরা জ্ঞানার্জনে পরিশ্রম করব।', meaningEn: 'You spoke the truth teacher, we will strive in seeking knowledge.' },
    ],
  },

  // Group 5 (পাঠ ২৬–৩০): ওযু, মসজিদ, নামাজ, জুমআ ও ইবাদত
  {
    groupIndex: 5,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ২ (ইদাফা ও ইবাদতের পরিভাষা)',
    difficultyLabel: 'স্তর ২ (প্রাথমিক)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'المُضَافُ وَالمُضَافُ إِلَيْهِ (الإِضَافَةُ)',
      titleBn: 'ইদাফা বা সম্বন্ধ পদ (মুদাফ ও মুদাফ ইলাইহি)',
      explanationBn:
        'দুটি ইসম মিলে সম্বন্ধ বোঝালে প্রথমটিকে মুদাফ এবং দ্বিতীয়টিকে মুদাফ ইলাইহি বলে। মুদাফে তানবীন ও আল (ال) থাকে না এবং মুদাফ ইলাইহি সর্বদা মাজরূর (যেরযুক্ত) হয়। যেমন: صَلَاةُ الفَجْرِ, مَسْجِدُ القَرْيَةِ, بَيْتُ اللَّهِ।',
      exampleAr: 'أَذَانُ المَغْرِبِ قَرِيبٌ، وَصَلَاةُ الجَمَاعَةِ أَفْضَلُ.',
      exampleBn: 'মাগরিবের আযান নিকটবর্তী এবং জামাআতে নামাজ উত্তম।',
    },
    vocabulary: [
      { arabic: 'وُضُوءٌ', pronunciationBn: 'উদূউন', meaningBn: 'ওযু / পবিত্রতা', meaningEn: 'Ablution', masdarNote: 'মাসদার: الوَضَاءَةُ' },
      { arabic: 'أَذَانٌ', pronunciationBn: 'আযানুন', meaningBn: 'আযান', meaningEn: 'Call to prayer' },
      { arabic: 'صَلَاةُ الجَمَاعَةِ', pronunciationBn: 'সালাতুল জামা‘আতি', meaningBn: 'জামাআতের নামাজ', meaningEn: 'Congregational prayer' },
      { arabic: 'خُطْبَةٌ', pronunciationBn: 'খুতবাতুন', meaningBn: 'খুতবা / ভাষণ', meaningEn: 'Sermon' },
      { arabic: 'صِيَامٌ', pronunciationBn: 'সিয়ামুন', meaningBn: 'রোযা / সাওম', meaningEn: 'Fasting', masdarNote: 'মূলধাতু: ص و م' },
      { arabic: 'تِلَاوَةٌ', pronunciationBn: 'তিলাওয়াতুন', meaningBn: 'কুরআন তিলাওয়াত', meaningEn: 'Recitation' },
    ],
    dialogue: [
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'سَمِعْتُ أَذَانَ الظُّهْرِ، هَيَّا نَتَوَضَّأُ لِلصَّلَاةِ.', pronunciationBn: 'সামি‘তু আযানায যুহরি, হাইয়া নাতাওয়াদ্দাউ লিস-সালাতি।', meaningBn: 'আমি যোহরের আযান শুনেছি, চলো নামাজের জন্য ওযু করি।', meaningEn: 'I heard the Dhuhr Adhan, let us make Wudu for prayer.' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'نَعَمْ، الوُضُوءُ شَرْطٌ لِصِحَّةِ الصَّلَاةِ.', pronunciationBn: 'না‘আম, আল-উদূউ শারতুন লিসিহহাতিস সালাতি।', meaningBn: 'হ্যাঁ, নামাজ বিশুদ্ধ হওয়ার জন্য ওযু শর্ত।', meaningEn: 'Yes, Wudu is a condition for the validity of prayer.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'هَلْ تَدْخُلُ المَسْجِدَ بِرِجْلِكَ اليُمْنَى؟', pronunciationBn: 'হাল তাদখুলুল মাসজিদা বিরিজলিকাল ইউমনা?', meaningBn: 'তুমি কি ডান পা দিয়ে মসজিদে প্রবেশ করো?', meaningEn: 'Do you enter the mosque with your right foot?' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'بِالتَّأْكِيدِ، وَأَقُولُ: اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.', pronunciationBn: 'বিত-তা’কীদি, ওয়া আকূলু: আল্লাহুম্মাফতাহ লী আবওয়াবা রাহমাতিকা।', meaningBn: 'অবশ্যই, এবং আমি পড়ি: হে আল্লাহ, আমার জন্য আপনার রহমতের দরজাসমূহ খুলে দিন।', meaningEn: 'Certainly, and I say: O Allah, open for me the doors of Your mercy.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'كَمْ رَكْعَةً نُصَلِّي قَبْلَ الظُّهْرِ؟', pronunciationBn: 'কাম রাক‘আতান নুসাল্লী ক্বাবলায যুহরি?', meaningBn: 'যোহরের ফরজের আগে আমরা কয় রাকআত নামাজ পড়ি?', meaningEn: 'How many rak’ahs do we pray before Dhuhr?' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'نُصَلِّي أَرْبَعَ رَكَعَاتٍ سُنَّةً مُؤَكَّدَةً.', pronunciationBn: 'নুসাল্লী আরবা‘আ রাকা‘আতিন সুন্নাতান মুআক্কাদাতান।', meaningBn: 'আমরা চার রাকআত সুন্নতে মুআক্কাদা আদায় করি।', meaningEn: 'We pray four rak’ahs of emphasized Sunnah.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'مَا فَضْلُ صَلَاةِ الجَمَاعَةِ فِي المَسْجِدِ؟', pronunciationBn: 'মা ফাদলু সালাতিল জামা‘আতি ফিল মাসজিদি?', meaningBn: 'মসজিদে জামাআতে নামাজের ফজিলত কী?', meaningEn: 'What is the virtue of congregational prayer in the mosque?' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'تَفْضُلُ صَلَاةَ الفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً.', pronunciationBn: 'তাফদুলু সালাতাল ফাযযি বিসাব‘ইন ওয়া ইশরীনা দারাজাতান।', meaningBn: 'তা একাকী নামাজের চেয়ে সাতাশ গুণ বেশি মর্যাদাসম্পন্ন।', meaningEn: 'It surpasses individual prayer by twenty-seven degrees.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'يَوْمُ الجُمُعَةِ غَدًا، مَتَى نَذْهَبُ لِلْخُطْبَةِ؟', pronunciationBn: 'ইয়াওমুল জুমু‘আতি গাদান, মাতা নাযহাবু লিল-খুতবাতি?', meaningBn: 'আগামীকাল শুক্রবার, আমরা খুতবার জন্য কখন যাব?', meaningEn: 'Tomorrow is Friday, when should we go for the Khutbah?' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'نَذْهَبُ مُبَكِّرِينَ بَعْدَ الغُسْلِ وَالطِّيبِ.', pronunciationBn: 'নাযহাবু মুবাক্কিরীনা বা‘দাল গুসলি ওয়াত-তীব।', meaningBn: 'গোসল ও সুগন্ধি ব্যবহারের পর আমরা সকাল সকাল যাব।', meaningEn: 'We will go early after bathing and applying perfume.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'هَلْ تَقْرَأُ سُورَةَ الكَهْفِ كُلَّ جُمُعَةٍ؟', pronunciationBn: 'হাল তাক্বরাউ সূরাতাল কাহফি কুল্লা জুমু‘আতিন?', meaningBn: 'তুমি কি প্রতি জুমআয় সূরা কাহফ তিলাওয়াত করো?', meaningEn: 'Do you recite Surah Al-Kahf every Friday?' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'نَعَمْ، إِنَّهَا نُورٌ مَا بَيْنَ الجُمُعَتَيْنِ.', pronunciationBn: 'না‘আম, ইন্নাহা নূরুন মা বাইনাল জুমু‘আতাইনি।', meaningBn: 'হ্যাঁ, নিশ্চয়ই তা দুই জুমআর মাঝে আলোকবর্তিকা।', meaningEn: 'Yes, it is a light between the two Fridays.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'وَمَاذَا عَنْ صِيَامِ شَهْرِ رَمَضَانَ وَالزَّكَاةِ؟', pronunciationBn: 'ওয়া মাযা আন সিয়ামি শাহরি রামাদানা ওয়ায-যাকাতি?', meaningBn: 'এবং রমযান মাসের রোযা ও যাকাত সম্পর্কে কী বলো?', meaningEn: 'And what about fasting in Ramadan and Zakah?' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'هُمَا رُكْنَانِ عَظِيمَانِ مِنْ أَرْكَانِ الإِسْلَامِ.', pronunciationBn: 'হুমা রুকনানি আযীমানি মিন আরকানিল ইসলামি।', meaningBn: 'উভয়টি ইসলামের মহান রুকনসমূহের অন্তর্ভুক্ত।', meaningEn: 'They are two great pillars of Islam.' },
      { speakerAr: 'عُمَرُ', speakerBn: 'উমর', arabic: 'لَا تَنْسَنِي مِنْ صَالِحِ دُعَائِكَ عِنْدَ الإِفْطَارِ.', pronunciationBn: 'লা তানসানী মিন সালিহি দু‘আ-ইকা ইনদাল ইফতারি।', meaningBn: 'ইফতারের সময় তোমার নেক দোয়ায় আমাকে ভুলে যেও না।', meaningEn: 'Do not forget me in your righteous supplications at Iftar.' },
      { speakerAr: 'بِلَالٌ', speakerBn: 'বিলাল', arabic: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكَ الصَّلَاةَ وَالدُّعَاءَ.', pronunciationBn: 'তাক্বাব্বালাল্লাহু মিন্না ওয়া মিনকাস সালাতা ওয়াদ-দু‘আআ।', meaningBn: 'আল্লাহ আমাদের ও আপনার নামাজ ও দোয়া কবুল করুন।', meaningEn: 'May Allah accept prayer and supplication from us and from you.' },
    ],
  },

  // Group 6 (পাঠ ৩১–৩৫): বন্ধু, সাক্ষাৎ, আমন্ত্রণ ও ভদ্রতা
  {
    groupIndex: 6,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ২ (নাত-মানউত ও দমীর মুত্তাসিল)',
    difficultyLabel: 'স্তর ২ (প্রাথমিক)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'النَّعْتُ وَالمَنْعُوتُ (الصِّفَةُ وَالمَوْصُوفُ)',
      titleBn: 'নাত-মানউত (বিশেষণ ও বিশেষ্য-এর ৪টি বিষয়ে মিল)',
      explanationBn:
        'বিশেষণ (নাত) তার পূর্ববর্তী বিশেষ্যের (মানউত) সাথে ৪টি বিষয়ে মিল রাখে: (১) ই‘রাব (পেশ/যবর/যের), (২) বচন (এক/দ্বি/বহুবচন), (৩) লিঙ্গ (পুং/স্ত্রী), এবং (৪) মা‘রিফাহ-নাকিরাহ (ال থাকা বা না থাকা)। যেমন: الصَّدِيقُ المُخْلِصُ, ضَيْفٌ كَرِيمٌ।',
      exampleAr: 'زَارَنَا الصَّدِيقُ الوَفِيُّ فِي يَوْمٍ مُبَارَكٍ.',
      exampleBn: 'বিশ্বস্ত বন্ধু একটি বরকতময় দিনে আমাদের সাথে সাক্ষাৎ করেছে।',
    },
    vocabulary: [
      { arabic: 'صَدِيقٌ مُخْلِصٌ', pronunciationBn: 'সাদীকুন মুখলিসুন', meaningBn: 'একনিষ্ঠ বন্ধু', meaningEn: 'Sincere friend' },
      { arabic: 'دَعْوَةٌ', pronunciationBn: 'দা‘ওয়াতুন', meaningBn: 'আমন্ত্রণ / দাওয়াত', meaningEn: 'Invitation', masdarNote: 'মাসদার: الدُّعَاءُ' },
      { arabic: 'ضِيَافَةٌ', pronunciationBn: 'দিয়াফাতুন', meaningBn: 'মেহমানদারি', meaningEn: 'Hospitality' },
      { arabic: 'هَدِيَّةٌ', pronunciationBn: 'হাদিইয়াতুন', meaningBn: 'উপহার', meaningEn: 'Gift', masdarNote: 'বহুবচন: هَدَايَا' },
      { arabic: 'زِيَارَةٌ', pronunciationBn: 'যিয়ারাতুন', meaningBn: 'সাক্ষাৎ / পরিদর্শন', meaningEn: 'Visit' },
      { arabic: 'وَدَاعٌ', pronunciationBn: 'ওয়াদা‘উন', meaningBn: 'বিদায়', meaningEn: 'Farewell' },
    ],
    dialogue: [
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'مَرْحَبًا يَا طَارِقُ، لَمْ أَرَكَ مُنْذُ أُسْبُوعٍ!', pronunciationBn: 'মারহাবান ইয়া তারিক্বু, লাম আরাকা মুনযু উসবূ‘ইন!', meaningBn: 'স্বাগতম তারিক, এক সপ্তাহ ধরে তোমাকে দেখিনি!', meaningEn: 'Welcome Tariq, I have not seen you for a week!' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'أَهْلًا بِكَ يَا صَدِيقِي، كُنْتُ مَشْغُولًا بِالعَمَلِ.', pronunciationBn: 'আহলান বিকা ইয়া সাদীক্বী, কুনতু মাশগূলান বিল-আমালি।', meaningBn: 'তোমাকেও স্বাগতম বন্ধু, আমি কাজে ব্যস্ত ছিলাম।', meaningEn: 'Welcome my friend, I was busy with work.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'أَدْعُوكَ إِلَى الغَدَاءِ فِي بَيْتِنَا غَدًا.', pronunciationBn: 'আদ‘ঊকা ইলাল গাদায়ি ফী বাইতিনা গাদান।', meaningBn: 'আগামীকাল আমি তোমাকে আমাদের বাসায় দুপুরের খাবারের দাওয়াত দিচ্ছি।', meaningEn: 'I invite you to lunch at our house tomorrow.' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'شُكْرًا عَلَى الدَّعْوَةِ الكَرِيمَةِ، يَسُرُّنِي ذٰلِكَ.', pronunciationBn: 'শুকরান আলাদ-দা‘ওয়াতিল কারীমাতি, ইয়াসুররুনী যালিকা।', meaningBn: 'সদয় আমন্ত্রণের জন্য ধন্যবাদ, এতে আমি খুব আনন্দিত হব।', meaningEn: 'Thank you for the kind invitation, that pleases me.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'مَتَى تَسْتَطِيعُ الحُضُورَ، أَفِي الظُّهْرِ أَمْ بَعْدَهُ؟', pronunciationBn: 'মাতা তাসতাতী‘উল হুদূরা, আফিয যুহরি আম বা‘দাহু?', meaningBn: 'তুমি কখন আসতে পারবে, যোহরের সময় নাকি এরপর?', meaningEn: 'When can you come, at noon or after it?' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'سَأَحْضُرُ فِي السَّاعَةِ الثَّانِيَةِ بَعْدَ الظُّهْرِ إِنْ شَاءَ اللَّهُ.', pronunciationBn: 'সা-আহদুরু ফিস সা‘আতিছ ছানিয়াতি বা‘দায যুহরি ইনশাআল্লাহ।', meaningBn: 'ইনশাআল্লাহ আমি দুপুর দুইটায় উপস্থিত হব।', meaningEn: 'I will attend at two o’clock in the afternoon, God willing.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'أَتَعْرِفُ عُنْوَانَ مَنْزِلِنَا الجَدِيدِ؟', pronunciationBn: 'আতা‘রিফু উনওয়ানা মানযিলিনাল জাদীদি?', meaningBn: 'তুমি কি আমাদের নতুন বাসার ঠিকানা জানো?', meaningEn: 'Do you know the address of our new home?' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'نَعَمْ، هُوَ بِجِوَارِ المَسْجِدِ الكَبِيرِ.', pronunciationBn: 'না‘আম, হুয়া বিজিওয়ারিল মাসজিদিল কাবীরি।', meaningBn: 'হ্যাঁ, এটি বড় মসজিদের পাশেই অবস্থিত।', meaningEn: 'Yes, it is next to the grand mosque.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'مَاذَا أَحْضَرْتَ مَعَكَ فِي هٰذِهِ الحَقِيبَةِ الصَّغِيرَةِ؟', pronunciationBn: 'মাযা আহদারতা মা‘আকা ফী হাযিহিল হাক্বীবাতিস সাগীরাতি?', meaningBn: 'এই ছোট ব্যাগে তুমি সাথে কী এনেছ?', meaningEn: 'What did you bring with you in this small bag?' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'هٰذِهِ هَدِيَّةٌ بَسِيطَةٌ لَكَ، تَهَادَوْا تَحَابُّوا.', pronunciationBn: 'হাযিহি হাদিইয়াতুন বাসীতাতুন লাকা, তাহাদাও তাহাব্বু।', meaningBn: 'এটি তোমার জন্য সামান্য উপহার; হাদিয়া বিনিময় করো, ভালোবাসা বাড়বে।', meaningEn: 'This is a simple gift for you; exchange gifts and you will love one another.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'جَزَاكَ اللَّهُ خَيْرًا، كِتَابٌ قَيِّمٌ فِي الأَدَبِ العَرَبِيِّ!', pronunciationBn: 'জাযাকাল্লাহু খইরান, কিতাবুন ক্বাইয়িমুন ফিল আদাবিল আরাবিয়্যি!', meaningBn: 'জাযাকাল্লাহু খইরান, আরবি সাহিত্যের এক মূল্যবান গ্রন্থ!', meaningEn: 'May Allah reward you, a valuable book on Arabic literature!' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'لَقَدِ اسْتَمْتَعْتُ بِالحَدِيثِ مَعَكَ كَثِيرًا.', pronunciationBn: 'লাক্বাদিস-তামতা‘তু বিলহাদীছি মা‘আকা কাছীরান।', meaningBn: 'তোমার সাথে কথা বলে আমি অত্যন্ত আনন্দ পেয়েছি।', meaningEn: 'I enjoyed speaking with you very much.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'بَقِيَ لَنَا أَنْ نَتَوَاصَلَ دَائِمًا وَلَا نَنْقَطِعَ.', pronunciationBn: 'বাক্বিয়া লানা আন নাতাওয়াসালা দা-ইমান ওয়া লা নানক্বাতি‘আ।', meaningBn: 'আমাদের উচিত সর্বদা যোগাযোগ রাখা ও সম্পর্ক ছিন্ন না করা।', meaningEn: 'We should stay in touch always and not cut off contact.' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'الآنَ يَحِينُ وَقْتُ الوَدَاعِ، وَسَأَزُورُكَ قَرِيبًا.', pronunciationBn: 'আল-আনা ইয়াহীনু ওয়াক্তুল ওয়াদা‘ই, ওয়া সা-আযূরুকা কারীবান।', meaningBn: 'এখন বিদায়ের সময় হলো, শীঘ্রই আবার দেখা করব।', meaningEn: 'Now it is time to say farewell, and I will visit you soon.' },
      { speakerAr: 'سَلْمَانُ', speakerBn: 'সালমান', arabic: 'أَشْكُرُكَ عَلَى حُسْنِ الزِّيَارَةِ، رَافَقَتْكَ السَّلَامَةُ.', pronunciationBn: 'আশকুরুকা আলা হুসনিয যিয়ারাতি, রাফাক্বাতকাস সালামাতু।', meaningBn: 'সুন্দর সাক্ষাতের জন্য ধন্যবাদ, নিরাপত্তা তোমার সঙ্গী হোক।', meaningEn: 'Thank you for the pleasant visit, safety accompany you.' },
      { speakerAr: 'طَارِقٌ', speakerBn: 'তারিক', arabic: 'فِي أَمَانِ اللَّهِ، إِلَى اللِّقَاءِ فِي مَوْعِدٍ قَرِيبٍ.', pronunciationBn: 'ফী আমানিল্লাহি, ইলাল লিকায়ি ফী মাও‘ইদিন কারীবিন।', meaningBn: 'আল্লাহর হেফাজতে থেকো, শীঘ্রই নির্ধারিত সময়ে দেখা হবে।', meaningEn: 'In Allah’s protection, until we meet again soon.' },
    ],
  },

  // Group 7 (পাঠ ৩৬–৪০): স্বাস্থ্য, অসুস্থতা বর্ণনা (পাঠ ৩৮!), চিকিৎসক ও ফার্মেসি
  {
    groupIndex: 7,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ৩ (কানা ও ইন্না এবং অবস্থার বর্ণনা)',
    difficultyLabel: 'স্তর ৩ (মধ্যম)',
    grammar: {
      sourceBook: 'হেদায়েতুন নাহু',
      titleAr: 'كَانَ وَأَخَوَاتُهَا (الأَفْعَالُ النَّاقِصَةُ)',
      titleBn: 'কানা ও তার ভগিনীগণ (كَانَ، أَصْبَحَ، لَيْسَ، مَا زَالَ)',
      explanationBn:
        'জুমলায়ে ইসমিয়ার শুরুতে كَانَ বসলে তা মুবতাদাকে রাফ‘আ (ইসমু কানা) দেয় এবং খবরকে নসব/যবর (খবরু কানা) দেয়। যেমন: كَانَ المَرِيضُ مُتْعَبًا (রোগী ক্লান্ত ছিল), أَصْبَحَ الطَّقْسُ بَارِدًا (আবহাওয়া ঠান্ডা হয়ে গেছে)।',
      exampleAr: 'كَانَ الأَلَمُ شَدِيدًا، فَأَصْبَحَ المَرِيضُ سَلِيمًا بِفَضْلِ اللَّهِ.',
      exampleBn: 'ব্যথা তীব্র ছিল, অতঃপর আল্লাহর অনুগ্রহে রোগী সুস্থ হয়ে গেছে।',
    },
    vocabulary: [
      { arabic: 'صُدَاعٌ', pronunciationBn: 'সুদা‘উন', meaningBn: 'মাথাব্যথা', meaningEn: 'Headache' },
      { arabic: 'حُمَّى', pronunciationBn: 'হুম্মা', meaningBn: 'জ্বর', meaningEn: 'Fever' },
      { arabic: 'طَبِيبٌ', pronunciationBn: 'ত্বাবীবুন', meaningBn: 'চিকিৎসক / ডাক্তার', meaningEn: 'Doctor', masdarNote: 'বহুবচন: أَطِبَّاءُ' },
      { arabic: 'مُسْتَشْفًى', pronunciationBn: 'মুসতাশফান', meaningBn: 'হাসপাতাল', meaningEn: 'Hospital', masdarNote: 'মাসদার: الِاسْتِشْفَاءُ' },
      { arabic: 'دَوَاءٌ', pronunciationBn: 'দাওয়াউন', meaningBn: 'ওষুধ', meaningEn: 'Medicine', masdarNote: 'বহুবচন: أَدْوِيَةٌ' },
      { arabic: 'شِفَاءٌ', pronunciationBn: 'শিফাউন', meaningBn: 'সুস্থতা / আরোগ্য', meaningEn: 'Recovery / Cure', masdarNote: 'মূলধাতু: ش ف ي' },
    ],
    dialogue: [
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'أَهْلًا بِكَ، مِمَّ تَشْكُو اليَوْمَ يَا أَخِي؟', pronunciationBn: 'আহলান বিকা, মিম্মা তাশকুল ইয়াওমা ইয়া আখী?', meaningBn: 'স্বাগতম, ভাই আজ আপনার কী শারীরিক সমস্যা হচ্ছে?', meaningEn: 'Welcome, what are you suffering from today, my brother?' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'أَشْعُرُ بِأَلَمٍ شَدِيدٍ فِي رَأْسِي وَارْتِفَاعِ الحَرَارَةِ.', pronunciationBn: 'আশ‘উরু বি-আলামিন শাদীদিন ফী রা’সী ওয়ারতিফা‘ইল হারারাতি।', meaningBn: 'আমি প্রচণ্ড মাথাব্যথা এবং শরীরের তাপমাত্রা বৃদ্ধি অনুভব করছি।', meaningEn: 'I feel severe pain in my head and a high fever.' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'مُنْذُ مَتَى بَدَأَتْ هٰذِهِ الحُمَّى وَالصُّدَاعُ؟', pronunciationBn: 'মুনযু মাতা বাদাআত হাযিহিল হুম্মা ওয়াস-সুদা‘উ?', meaningBn: 'এই জ্বর ও মাথাব্যথা কবে থেকে শুরু হয়েছে?', meaningEn: 'Since when did this fever and headache start?' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'بَدَأَتْ مُنْذُ لَيْلَةِ أَمْسِ، وَلَمْ أَنَمْ جَيِّدًا.', pronunciationBn: 'বাদাআত মুনযু লাইলাতি আমসি, ওয়া লাম আনাম জাইয়িদান।', meaningBn: 'গত রাত থেকে শুরু হয়েছে এবং আমি ভালোভাবে ঘুমাতে পারিনি।', meaningEn: 'It started last night, and I could not sleep well.' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'هَلْ تُعَانِي مِنْ سُعَالٍ أَوْ أَلَمٍ فِي الحَلْقِ أَيْضًا؟', pronunciationBn: 'হাল তু‘আনী মিন সু‘আলিন আও আলামিন ফিল হালক্বি আইদান?', meaningBn: 'আপনার কি কাশি অথবা গলায় ব্যথাও আছে?', meaningEn: 'Are you also suffering from a cough or sore throat?' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'نَعَمْ، عِنْدِي سُعَالٌ خَفِيفٌ وَإِرْهَاقٌ فِي الجِسْمِ.', pronunciationBn: 'না‘আম, ইনদী সু‘আলুন খাফীফুন ওয়া ইরহাকুন ফিল জিসমি।', meaningBn: 'জি, আমার হালকা কাশি ও শরীরে দুর্বলতা রয়েছে।', meaningEn: 'Yes, I have a mild cough and body fatigue.' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'اِفْتَحْ فَمَكَ وَتَنَفَّسْ بِعُمْقٍ لِأَفْحَصَ صَدْرَكَ.', pronunciationBn: 'ইফতাহ ফামাকা ওয়া তানাফফাস বিউমক্বিন লি-আফহাসা সদরাকা।', meaningBn: 'মুখ খুলুন এবং গভীরভাবে শ্বাস নিন, আমি আপনার বুক পরীক্ষা করব।', meaningEn: 'Open your mouth and breathe deeply so I can examine your chest.' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'هَلِ الأَمْرُ خَطِيرٌ يَا دُكْتُورُ؟', pronunciationBn: 'হালিল আমরু খাতীরুন ইয়া দুকতূরু?', meaningBn: 'ব্যাপারটি কি গুরুতর, ডাক্তার সাহেব?', meaningEn: 'Is the condition serious, doctor?' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'لَا تَقْلَقْ، إِنَّهَا نَزْلَةُ بَرْدٍ بَسِيطَةٌ، وَسَتَزُولُ قَرِيبًا.', pronunciationBn: 'লা তাকলাক, ইন্নাহা নাযলাতু বারদিন বাসীতাতুন, ওয়া সাতাজূলু কারীবান।', meaningBn: 'চিন্তা করবেন না, এটি সাধারণ সর্দি-জ্বর, শীঘ্রই সেরে যাবে।', meaningEn: 'Do not worry, it is a mild cold, and it will pass soon.' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'مَا الدَّوَاءُ الَّذِي تَنْصَحُنِي بِتَنَاوُلِهِ؟', pronunciationBn: 'মাদ-দাওয়াউল্লাযী তানসাহুনী বিতানাউলিহী?', meaningBn: 'আপনি আমাকে কোন ওষুধ সেবনের পরামর্শ দিচ্ছেন?', meaningEn: 'What medicine do you advise me to take?' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'كَتَبْتُ لَكَ هٰذِهِ الوَصْفَةَ، خُذْ قُرْصًا بَعْدَ الطَّعَامِ.', pronunciationBn: 'কাতাবতু লাকা হাযিহিল ওয়াসফাতা, খুয কুরসান বা‘দাত ত্বা‘আমি।', meaningBn: 'আমি আপনার জন্য এই প্রেসক্রিপশন লিখে দিয়েছি, খাবারের পর একটি করে ট্যাবলেট খাবেন।', meaningEn: 'I wrote this prescription for you; take one tablet after meals.' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'أَيْنَ تَقَعُ أَقْرَبُ صَيْدَلِيَّةٍ مِنَ المُسْتَشْفَى؟', pronunciationBn: 'আইনা তাক্বা‘উ আকরাবু সাইদালিইয়াতিন মিনাল মুসতাশফা?', meaningBn: 'হাসপাতালের সবচেয়ে কাছের ফার্মেসি কোথায় অবস্থিত?', meaningEn: 'Where is the nearest pharmacy to the hospital?' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'الصَّيْدَلِيَّةُ فِي الطَّابَقِ الأَرْضِيِّ بِجَانِبِ المَدْخَلِ.', pronunciationBn: 'আস-সাইদালিইয়াতু ফিত ত্বাবাকিল আরদিয়্যি বিজানিবিল মাদখালি।', meaningBn: 'ফার্মেসিটি নিচতলায় প্রবেশদ্বারের পাশেই।', meaningEn: 'The pharmacy is on the ground floor next to the entrance.' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'هَلْ هُنَاكَ أَطْعِمَةٌ يَجِبُ أَنْ أَتَجَنَّبَهَا؟', pronunciationBn: 'হাল হুনাকা আত‘ইমাতুন ইয়াজিবু আন আতাজান্নাবাহা?', meaningBn: 'এমন কোনো খাবার আছে কি যা আমার এড়িয়ে চলা উচিত?', meaningEn: 'Are there any foods I should avoid?' },
      { speakerAr: 'الطَّبِيبُ', speakerBn: 'চিকিৎসক', arabic: 'تَجَنَّبِ المَشْرُوبَاتِ المَثْلُوجَةَ، وَاشْرَبْ سَوَائِلَ دَافِئَةً وَارْتَحْ.', pronunciationBn: 'তাজান্নাবিল মাশরূবাতিল মাছলূজাতা, ওয়াশরাব সাওয়া-ইলা দাফিআতান ওয়ারতাহ।', meaningBn: 'বরফ-ঠান্ডা পানীয় পরিহার করুন, উষ্ণ তরল পান করুন ও বিশ্রাম নিন।', meaningEn: 'Avoid iced drinks, drink warm fluids, and rest.' },
      { speakerAr: 'المَرِيضُ', speakerBn: 'রোগী', arabic: 'شُكْرًا جَزِيلًا، أَسْأَلُ اللَّهَ العَظِيمَ أَنْ يَشْفِيَ جَمِيعَ المَرْضَى.', pronunciationBn: 'শুকরান জাযীলান, আসআলুল্লাহাল আযীমা আন ইয়াশফিয়া জামী‘আল মারদা।', meaningBn: 'অসংখ্য ধন্যবাদ, আমি মহান আল্লাহর নিকট সকল রোগীর আরোগ্য কামনা করি।', meaningEn: 'Thank you very much, I ask Almighty Allah to heal all patients.' },
    ],
  },

  // Group 8 (পাঠ ৪১–৪৫): আবহাওয়া, ঋতু, প্রকৃতি ও পরিবেশ
  {
    groupIndex: 8,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ৩ (ইন্না ও তার ভগিনীগণ)',
    difficultyLabel: 'স্তর ৩ (মধ্যম)',
    grammar: {
      sourceBook: 'হেদায়েতুন নাহু',
      titleAr: 'إِنَّ وَأَخَوَاتُهَا (الحُرُوفُ المُشَبَّهَةُ بِالفِعْلِ)',
      titleBn: 'হরুফে মুশাব্বাহা বিল-ফেল (إِنَّ، أَنَّ، لٰكِنَّ، كَأَنَّ، لَعَلَّ)',
      explanationBn:
        'হরুফে মুশাব্বাহা বিল-ফেল ৬টি: إِنَّ، أَنَّ، كَأَنَّ، لٰكِنَّ، لَيْتَ، لَعَلَّ। এগুলো কানা-র বিপরীত আমল করে—অর্থাৎ ইসমকে নসব (যবর) দেয় এবং খবরকে রাফ‘আ (পেশ) দেয়। যেমন: إِنَّ السَّمَاءَ صَافِيَةٌ (নিশ্চয়ই আকাশ নির্মল)।',
      exampleAr: 'إِنَّ المَطَرَ نِعْمَةٌ عَظِيمَةٌ، لٰكِنَّ البَرْدَ قَارِسٌ.',
      exampleBn: 'নিশ্চয়ই বৃষ্টি এক মহান নেয়ামত, কিন্তু শীত তীব্র।',
    },
    vocabulary: [
      { arabic: 'طَقْسٌ', pronunciationBn: 'ত্বাক্বসুন', meaningBn: 'আবহাওয়া', meaningEn: 'Weather' },
      { arabic: 'مَطَرٌ', pronunciationBn: 'মাতারুন', meaningBn: 'বৃষ্টি', meaningEn: 'Rain', masdarNote: 'বহুবচন: أَمْطَارٌ' },
      { arabic: 'سَحَابٌ', pronunciationBn: 'সাহাবুন', meaningBn: 'মেঘ', meaningEn: 'Clouds' },
      { arabic: 'فَصْلُ الشِّتَاءِ', pronunciationBn: 'ফাসলুশ শিতায়ি', meaningBn: 'শীতকাল', meaningEn: 'Winter season' },
      { arabic: 'رَبِيعٌ', pronunciationBn: 'রাবী‘উন', meaningBn: 'বসন্তকাল', meaningEn: 'Spring' },
      { arabic: 'هَوَاءٌ نَقِيٌّ', pronunciationBn: 'হাওয়াউন নাক্বিয়্যুন', meaningBn: 'নির্মল বাতাস', meaningEn: 'Fresh air' },
    ],
    dialogue: [
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'انْظُرْ إِلَى السَّمَاءِ! السُّحُبُ تَتَجَمَّعُ بِسُرْعَةٍ.', pronunciationBn: 'উনযুর ইলাস সামায়ি! আস-সুহুবু তাতাজাম্মা‘উ বিসুর‘আতিন।', meaningBn: 'আকাশের দিকে তাকাও! মেঘ দ্রুত জমা হচ্ছে।', meaningEn: 'Look at the sky! The clouds are gathering quickly.' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'نَعَمْ، يَبْدُو أَنَّ المَطَرَ سَيَنْزِلُ بَعْدَ قَلِيلٍ.', pronunciationBn: 'না‘আম, ইয়াবদু আন্নাল মাতার সা-ইয়ানযিলু বা‘দা ক্বালীলিন।', meaningBn: 'হ্যাঁ, মনে হচ্ছে কিছুক্ষণের মধ্যেই বৃষ্টি নামবে।', meaningEn: 'Yes, it seems the rain will fall shortly.' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'كَانَ الجَوُّ حَارًّا فِي الصَّيْفِ، أَمَّا الآنَ فَقَدِ اعْتَدَلَ.', pronunciationBn: 'কানাল জাউউ হাররান ফিস-সাইফি, আম্মাল আনা ফাক্বাদ ই‘তাদালা।', meaningBn: 'গ্রীষ্মে আবহাওয়া গরম ছিল, তবে এখন সহনীয় হয়েছে।', meaningEn: 'The weather was hot in summer, but now it has become moderate.' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'إِنَّ المَطَرَ رَحْمَةٌ مِنَ اللَّهِ يُحْيِي بِهِ الأَرْضَ.', pronunciationBn: 'ইন্নাল মাতারা রাহমাতুন মিনাল্লাহি ইয়ুহয়ী বিহিল আরদা।', meaningBn: 'নিশ্চয়ই বৃষ্টি আল্লাহর রহমত, যার দ্বারা তিনি ভূমিকে সজীব করেন।', meaningEn: 'Indeed rain is a mercy from Allah by which He revives the earth.' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'أَيُّ فُصُولِ السَّنَةِ أَحَبُّ إِلَيْكَ؟', pronunciationBn: 'আইয়ু ফুসূলিস সানাতি আহাব্বু ইলাইকা?', meaningBn: 'বছরের কোন ঋতু তোমার কাছে সবচেয়ে প্রিয়?', meaningEn: 'Which season of the year is dearest to you?' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'أُحِبُّ فَصْلَ الرَّبِيعِ؛ لِأَنَّ الأَزْهَارَ تَتَفَتَّحُ فِيهِ.', pronunciationBn: 'উহিব্বু ফাসলার রাবী‘ই; লি-আন্নাল আযহারা তাতাফাত্তাহু ফীহি।', meaningBn: 'আমি বসন্তকাল পছন্দ করি; কারণ এতে ফুলগুলো প্রস্ফুটিত হয়।', meaningEn: 'I love spring; because flowers blossom in it.' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'وَفِي الشِّتَاءِ تَبْرُدُ الرِّيَاحُ وَيَطُولُ اللَّيْلُ.', pronunciationBn: 'ওয়া ফিশ-শিতায়ি তাবরুদুর রিয়াহু ওয়া ইয়াতূলুল লাইলু।', meaningBn: 'আর শীতকালে বাতাস ঠান্ডা হয় এবং রাত দীর্ঘ হয়।', meaningEn: 'And in winter the winds grow cold and the night lengthens.' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'الشِّتَاءُ رَبِيعُ المُؤْمِنِ؛ يَصُومُ نَهَارَهُ وَيَقُومُ لَيْلَهُ.', pronunciationBn: 'আশ-শিতাউ রাবী‘উল মু’মিনি; ইয়াসূমু নাহারাহু ওয়া ইয়াকূমু লাইলাহু।', meaningBn: 'শীতকাল মুমিনের বসন্ত; সে এর দিনে রোযা রাখে ও রাতে নামাজ পড়ে।', meaningEn: 'Winter is the spring of the believer; he fasts its day and prays its night.' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'مَا أَجْمَلَ هٰذِهِ الحَدِيقَةَ الخَضْرَاءَ وَالأَشْجَارَ العَالِيَةَ!', pronunciationBn: 'মা আজমালা হাযিহিল হাদীক্বাতাল খাদরাআ ওয়াল-আশজারাল আলিয়াতা!', meaningBn: 'এই সবুজ বাগান ও উঁচু বৃক্ষগুলো কতই না সুন্দর!', meaningEn: 'How beautiful is this green garden and the tall trees!' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'عَلَيْنَا أَنْ نُحَافِظَ عَلَى نَظَافَةِ البِيئَةِ وَلا نُلَوِّثَ المَاءَ.', pronunciationBn: 'আলাইনা আন নুহাফিজা আলা নাযাফাতিল বীআতি ওয়া লা নুলাওউইছাল মাআ।', meaningBn: 'আমাদের পরিবেশের পরিচ্ছন্নতা রক্ষা করা উচিত এবং পানি দূষিত করা উচিত নয়।', meaningEn: 'We must preserve the cleanliness of the environment and not pollute water.' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'الشَّمْسُ تَغْرُبُ الآنَ، وَالهَوَاءُ عَلِيلٌ جِدًّا.', pronunciationBn: 'আশ-শামসু তাগরুবুল আনা, ওয়াল-হাওয়াউ আলীলুন জিদ্দান।', meaningBn: 'সূর্য এখন অস্ত যাচ্ছে এবং বাতাস অত্যন্ত মৃদু-শীতল।', meaningEn: 'The sun is setting now, and the breeze is very gentle.' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'انْظُرْ إِلَى القَمَرِ المُنِيرِ وَالنُّجُومِ فِي السَّمَاءِ الصَّافِيَةِ.', pronunciationBn: 'উনযুর ইলাল ক্বামারিল মুনীরি ওয়ান-নুজূমি ফিস-সামায়িস সাফিয়াতি।', meaningBn: 'পরিষ্কার আকাশে আলোকোজ্জ্বল চাঁদ ও তারকারাজির দিকে তাকাও।', meaningEn: 'Look at the luminous moon and the stars in the clear sky.' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالأَرْضِ لَآيَاتٍ لِأُولِي الأَلْبَابِ.', pronunciationBn: 'ইন্না ফী খালক্বিস সামাওয়াতি ওয়াল-আরদি লা-আয়াতিন লি-উলিল আলবাব।', meaningBn: 'নিশ্চয়ই আসমান ও জমিনের সৃষ্টিতে জ্ঞানীদের জন্য নিদর্শন রয়েছে।', meaningEn: 'Indeed in the creation of heavens and earth are signs for people of understanding.' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'مَاذَا تَقُولُ عِنْدَ نُزُولِ المَطَرِ؟', pronunciationBn: 'মাযা তাকূলু ইনদা নুযূলিল মাতার?', meaningBn: 'বৃষ্টি নামার সময় তুমি কী দোয়া পড়ো?', meaningEn: 'What do you say when rain falls?' },
      { speakerAr: 'عَادِلٌ', speakerBn: 'আদিল', arabic: 'أَقُولُ: اللَّهُمَّ صَيِّبًا نَافِعًا.', pronunciationBn: 'আকূলু: আল্লাহুম্মা সাইয়িবান নাফি‘আন।', meaningBn: 'আমি বলি: হে আল্লাহ, উপকারী বৃষ্টি বর্ষণ করুন।', meaningEn: 'I say: O Allah, make it a beneficial downpour.' },
      { speakerAr: 'فَيْصَلٌ', speakerBn: 'ফয়সাল', arabic: 'آمِينَ، هَيَّا نَعُدْ إِلَى البَيْتِ قَبْلَ اشْتِدَادِ الرِّيحِ.', pronunciationBn: 'আমীন, হাইয়া না‘উদ ইলাল বাইতি ক্বাবলাশ-তিদাদির রীহি।', meaningBn: 'আমীন, চলো বাতাস তীব্র হওয়ার আগেই বাসায় ফিরে যাই।', meaningEn: 'Ameen, let us return home before the wind intensifies.' },
    ],
  },

  // Group 9 (পাঠ ৪৬–৫০): প্রযুক্তি, ইন্টারনেট ও অধ্যয়ন অভ্যাস
  {
    groupIndex: 9,
    mabadiLevelBn: 'মাবাদিউল আরাবিয়াহ — খণ্ড ৩ (ইসমুল মওসূল ও আধুনিক পরিভাষা)',
    difficultyLabel: 'স্তর ৩ (মধ্যম)',
    grammar: {
      sourceBook: 'মাবাদিউল আরাবিয়াহ',
      titleAr: 'الأَسْمَاءُ المَوْصُولَةُ (الَّذِي، الَّتِي، الَّذِينَ)',
      titleBn: 'ইসমে মওসূল (যিনি, যা, যারা — সংযোজক সর্বনাম)',
      explanationBn:
        'দুটি বাক্যকে যুক্ত করতে ইসমে মওসূল ব্যবহৃত হয়। একবচন পুংলিঙ্গে الَّذِي, স্ত্রীলিঙ্গে الَّتِي এবং বহুবচন পুংলিঙ্গে الَّذِينَ বসে। এর পরের বাক্যাংশকে সিলাহ (صِلَة) বলে।',
      exampleAr: 'البَرْنَامَجُ الَّذِي نَسْتَخْدِمُهُ يُسَاعِدُ عَلَى حِفْظِ اللُّغَةِ.',
      exampleBn: 'যে প্রোগ্রামটি আমরা ব্যবহার করি তা ভাষা সংরক্ষণে সাহায্য করে।',
    },
    vocabulary: [
      { arabic: 'حَاسُوبٌ', pronunciationBn: 'হাসূবুন', meaningBn: 'কম্পিউটার', meaningEn: 'Computer', masdarNote: 'মূলধাতু: ح س ب' },
      { arabic: 'شَبَكَةُ الإِنْتَرْنِت', pronunciationBn: 'শাবাকাতুল ইনতারনিত', meaningBn: 'ইন্টারনেট নেটওয়ার্ক', meaningEn: 'Internet network' },
      { arabic: 'دَرْسٌ مُبَاشِرٌ', pronunciationBn: 'দারসুন মুবাশিরুন', meaningBn: 'লাইভ / সরাসরি ক্লাস', meaningEn: 'Live class' },
      { arabic: 'بَرِيدٌ إِلِكْتُرُونِيٌّ', pronunciationBn: 'বারীদুন ইলিকতুরূনিইয়ুন', meaningBn: 'ইমেইল', meaningEn: 'Email' },
      { arabic: 'تَطْبِيقٌ', pronunciationBn: 'তাত্ববীক্বুন', meaningBn: 'অ্যাপ্লিকেশন / অ্যাপ', meaningEn: 'Application', masdarNote: 'বাবে তাফঈল' },
      { arabic: 'بَحْثٌ عِلْمِيٌّ', pronunciationBn: 'বাহছুন ইলমিইয়ুন', meaningBn: 'একাডেমিক গবেষণা', meaningEn: 'Research', masdarNote: 'মাসদার: البَحْثُ' },
    ],
    dialogue: [
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'مَاذَا تَفْعَلُ عَلَى الحَاسُوبِ يَا رَاشِدُ؟', pronunciationBn: 'মাযা তাফ‘আলু আলাল হাসূবি ইয়া রাশিদু?', meaningBn: 'রাশিদ, তুমি কম্পিউটারে কী করছ?', meaningEn: 'What are you doing on the computer, Rashid?' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'أُتَابِعُ دَرْسًا تَفَاعُلِيًّا فِي اللُّغَةِ العَرَبِيَّةِ عَبْرَ الإِنْتَرْنِت.', pronunciationBn: 'উতাবি‘উ দারসান তাফা‘উলিয়্যান ফিল লুগাতিল আরাবিয়্যাতি আবরাল ইনতারনিত।', meaningBn: 'আমি ইন্টারনেটে আরবি ভাষার একটি ইন্টারেক্টিভ পাঠ অনুসরণ করছি।', meaningEn: 'I am following an interactive Arabic lesson via the internet.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'أَتَعْنِي المِنَصَّةَ الَّتِي تَجْمَعُ بَيْنَ النَّحْوِ وَالحِوَارِ الصَّوْتِيِّ؟', pronunciationBn: 'আতা‘নিল মিনাসসাতাল্লাতী তাজমা‘উ বাইনান নাহউই ওয়াল-হিওয়ারিস সাওতিয়্যি?', meaningBn: 'তুমি কি সেই প্ল্যাটফর্মের কথা বলছ যা নাহু ও ভয়েস সংলাপ একত্র করেছে?', meaningEn: 'Do you mean the platform that combines Nahw and voice dialogue?' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'نَعَمْ، فِيهَا مُعَلِّمٌ ذَكِيٌّ يُصَحِّحُ نُطْقِي وَأَخْطَائِي النَّحْوِيَّةَ.', pronunciationBn: 'না‘আম, ফীহা মু‘আল্লিমুন যাকিয়্যুন ইয়ুসাহহিহু নুতক্বী ওয়া আখতা-ইন্ নাহউইইয়াতা।', meaningBn: 'হ্যাঁ, এতে একজন স্মার্ট শিক্ষক আছেন যিনি আমার উচ্চারণ ও নাহুর ভুল সংশোধন করে দেন।', meaningEn: 'Yes, it has an intelligent teacher who corrects my pronunciation and grammar mistakes.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'هَلْ أَرْسَلْتَ التَّقْرِيرَ العِلْمِيَّ بِالبَرِيدِ الإِلِكْتُرُونِيِّ؟', pronunciationBn: 'হাল আরসালতাত তাকরীরাল ইলমিইয়া বিল-বারীদিল ইলিকতুরূনিয়্যি?', meaningBn: 'তুমি কি একাডেমিক প্রতিবেদনটি ইমেইলে পাঠিয়েছ?', meaningEn: 'Did you send the academic report by email?' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'نَعَمْ، أَرْسَلْتُهُ قَبْلَ سَاعَةٍ مَعَ المَصَادِرِ وَالمَرَاجِعِ.', pronunciationBn: 'না‘আম, আরসালতুহু ক্বাবলা সা‘আতিন মা‘আল মাসাদিরি ওয়াল-মারাজি‘ই।', meaningBn: 'হ্যাঁ, এক ঘণ্টা আগে তথ্যসূত্র ও রেফারেন্সসহ পাঠিয়েছি।', meaningEn: 'Yes, I sent it an hour ago with the sources and references.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'كَيْفَ نَسْتَفِيدُ مِنَ التِّقْنِيَةِ الحَدِيثَةِ دُونَ إِضَاعَةِ الوَقْتِ؟', pronunciationBn: 'কাইফা নাসতাফীদু মিনাত তিক্বনিইয়াতিল হাদীছাতি দূনা ইদা‘আতিল ওয়াক্বতি?', meaningBn: 'সময় নষ্ট না করে আমরা আধুনিক প্রযুক্তি থেকে কীভাবে উপকৃত হতে পারি?', meaningEn: 'How do we benefit from modern technology without wasting time?' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'بِتَحْدِيدِ وَقْتٍ مُنَظَّمٍ لِلْمُطَالَعَةِ وَالبَحْثِ النَّافِعِ.', pronunciationBn: 'বিতাহদীদি ওয়াক্বতিন মুনাজ্জামিন লিল-মুতালা‘আতি ওয়াল-বাহছিন নাফি‘ই।', meaningBn: 'অধ্যয়ন ও উপকারী গবেষণার জন্য সুশৃঙ্খল সময় নির্ধারণ করার মাধ্যমে।', meaningEn: 'By setting an organized time for reading and beneficial research.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'وَهَلْ تَحْتَفِظُ بِالكَلِمَاتِ الجَدِيدَةِ فِي تَطْبِيقِ التَّكْرَارِ؟', pronunciationBn: 'ওয়া হাল তাহতাফিযু বিল-কালিমাতিল জাদীদাতি ফী তাত্ববীক্বিত তাকরারি?', meaningBn: 'এবং তুমি কি পুনরাবৃত্তি অ্যাপে নতুন শব্দগুলো সংরক্ষণ করো?', meaningEn: 'And do you save the new words in the repetition app?' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'أَجَلْ، أُرَاجِعُ عِشْرِينَ كَلِمَةً كُلَّ صَبَاحٍ قَبْلَ العَمَلِ.', pronunciationBn: 'আজাল, উরাজি‘উ ইশরীনা কালিমাতান কুল্লা সবাহিন ক্বাবলাল আমালি।', meaningBn: 'হ্যাঁ, কাজের আগে প্রতিদিন সকালে আমি বিশটি শব্দ রিভিশন দিই।', meaningEn: 'Yes, I review twenty words every morning before work.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'أَيُّ المَعَاجِمِ العَرَبِيَّةِ تَسْتَعْمِلُ فِي البَحْثِ؟', pronunciationBn: 'আইয়ুল মা‘আজিামিল আরাবিয়্যাতি তাসতা‘মিলু ফিল বাহছি?', meaningBn: 'গবেষণায় তুমি কোন আরবি অভিধান ব্যবহার করো?', meaningEn: 'Which Arabic dictionaries do you use in research?' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'أَرْجِعُ إِلَى لِسَانِ العَرَبِ وَالمُعْجَمِ الوَسِيطِ غَالِبًا.', pronunciationBn: 'আরজি‘উ ইলা লিসানিল আরাবি ওয়াল-মু‘জামিল ওয়াসীতি গালিবান।', meaningBn: 'আমি সাধারণত লিসানুল আরব ও আল-মু‘জামুল ওয়াসীত দেখি।', meaningEn: 'I usually refer to Lisan al-Arab and al-Mu’jam al-Wasit.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'لَكِنَّ القِرَاءَةَ فِي الكُتُبِ الوَرَقِيَّةِ لَا تُعَوَّضُ أَبَدًا.', pronunciationBn: 'লাকিন্নাল ক্বিরাআতা ফিল কুতুবিল ওয়ারাক্বিইয়াতি লা তু‘আওয়াদু আবাদান।', meaningBn: 'তবে কাগজের বইয়ে পড়ার বিকল্প কখনো হয় না।', meaningEn: 'However, reading paper books can never be fully replaced.' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'صَحِيحٌ، نَجْمَعُ بَيْنَ أَصَالَةِ الكِتَابِ وَسُهُولَةِ التِّقْنِيَةِ.', pronunciationBn: 'সাহীহুন, নাজমা‘উ বাইনা আসালাতিল কিতাবি ওয়া সুহূলাতিত তিক্বনিইয়াতি।', meaningBn: 'ঠিক বলেছ, আমরা বইয়ের মৌলিকত্ব ও প্রযুক্তির সহজতাকে একত্র করি।', meaningEn: 'True, we combine the authenticity of books and the ease of technology.' },
      { speakerAr: 'مَحْمُودٌ', speakerBn: 'মাহমুদ', arabic: 'أَرْسِلْ لِي رَابِطَ الدَّرْسِ حَتَّى أَشْتَرِكَ فِيهِ اليَوْمَ.', pronunciationBn: 'আরসিল লী রাবিতাদ দারসি হাত্তা আশতারিকা ফীহিল ইয়াওমা।', meaningBn: 'আমাকে পাঠের লিংকটি পাঠাও যাতে আমিও আজ যোগ দিতে পারি।', meaningEn: 'Send me the lesson link so I can join today.' },
      { speakerAr: 'رَاشِدٌ', speakerBn: 'রাশিদ', arabic: 'بِكُلِّ سُرُورٍ، قَدْ وَصَلَتْكَ الرِّسَالَةُ الآنَ.', pronunciationBn: 'বিকুল্লি সুরূরিন, ক্বাদ ওয়াসালাতকার রিসালাতুল আনা।', meaningBn: 'অত্যন্ত আনন্দের সাথে, বার্তাটি এখনই তোমার কাছে পৌঁছেছে।', meaningEn: 'With pleasure, the message has reached you now.' },
    ],
  },
];
