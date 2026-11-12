export interface BaynaDialogueLine {
  speakerAr: string;
  speakerBn: string;
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
}

export interface BaynaDialogue {
  id: string;
  titleAr: string;
  titleBn: string;
  titleEn: string;
  lines: BaynaDialogueLine[];
}

export interface BaynaPatternDrill {
  patternAr: string;
  patternBn: string;
  exampleAr: string;
  exampleBn: string;
  substitutions: { promptBn: string; resultAr: string; resultBn: string }[];
}

export interface BaynaUnit {
  unitNumber: number;
  bookNumber: 1 | 2 | 3 | 4;
  bookNameAr: string;
  bookNameBn: string;
  titleAr: string;
  titleBn: string;
  titleEn: string;
  dialogues: BaynaDialogue[];
  vocabulary: { arabic: string; pronunciationBn: string; meaningBn: string; meaningEn: string }[];
  patternDrills: BaynaPatternDrill[];
  soundsFocus: { letters: string; noteBn: string; examples: string[] };
}

export const BAYNA_YADAYK_UNITS: BaynaUnit[] = [
  {
    unitNumber: 1,
    bookNumber: 1,
    bookNameAr: 'الكِتَابُ الأَوَّلُ',
    bookNameBn: 'খণ্ড ১ (শুরুর স্তর)',
    titleAr: 'الوَحْدَةُ الأُولَى: التَّحِيَّةُ وَالتَّعَارُفُ',
    titleBn: 'অধ্যায় ১: সালাম, অভিবাদন ও পরিচিতি',
    titleEn: 'Unit 1: Greetings & Introductions',
    dialogues: [
      {
        id: 'by-u1-d1',
        titleAr: 'الحِوَارُ الأَوَّلُ',
        titleBn: 'সংলাপ ১: দুই বন্ধুর পরিচয় (পুরুষ)',
        titleEn: 'Dialogue 1: Male Introduction',
        lines: [
          { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'السَّلَامُ عَلَيْكُمْ.', pronunciationBn: 'আসসালামু আলাইকুম।', meaningBn: 'আপনার ওপর শান্তি বর্ষিত হোক।', meaningEn: 'Peace be upon you.' },
          { speakerAr: 'خَلِيلٌ', speakerBn: 'খলীল', arabic: 'وَعَلَيْكُمُ السَّلَامُ.', pronunciationBn: 'ওয়া আলাইকুমুস সালাম।', meaningBn: 'আপনার ওপরও শান্তি বর্ষিত হোক।', meaningEn: 'And upon you be peace.' },
          { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'اِسْمِي خَالِدٌ، مَا اسْمُكَ؟', pronunciationBn: 'ইসমী খালিদুন, মা ইসমুকা?', meaningBn: 'আমার নাম খালিদ, আপনার নাম কী?', meaningEn: 'My name is Khalid, what is your name?' },
          { speakerAr: 'خَلِيلٌ', speakerBn: 'খলীল', arabic: 'اِسْمِي خَلِيلٌ.', pronunciationBn: 'ইসমী খলীলুন।', meaningBn: 'আমার নাম খলীল।', meaningEn: 'My name is Khalil.' },
          { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'كَيْفَ حَالُكَ؟', pronunciationBn: 'কাইফা হালুকা?', meaningBn: 'আপনি কেমন আছেন?', meaningEn: 'How are you?' },
          { speakerAr: 'خَلِيلٌ', speakerBn: 'খলীল', arabic: 'بِخَيْرٍ، وَالحَمْدُ لِلَّهِ. وَكَيْفَ حَالُكَ أَنْتَ؟', pronunciationBn: 'বিখইরিন, ওয়ালহামদু লিল্লাহ। ওয়া কাইফা হালুকা আন্তা?', meaningBn: 'আলহামদুলিল্লাহ ভালো আছি। আর আপনি কেমন আছেন?', meaningEn: 'Fine, praise be to Allah. And how are you?' },
          { speakerAr: 'خَالِدٌ', speakerBn: 'খালিদ', arabic: 'بِخَيْرٍ، وَالحَمْدُ لِلَّهِ.', pronunciationBn: 'বিখইরিন, ওয়ালহামদু লিল্লাহ।', meaningBn: 'আলহামদুলিল্লাহ, ভালো আছি।', meaningEn: 'Fine, praise be to Allah.' },
        ],
      },
      {
        id: 'by-u1-d2',
        titleAr: 'الحِوَارُ الثَّانِي',
        titleBn: 'সংলাপ ২: জাতীয়তা ও দেশ পরিচয়',
        titleEn: 'Dialogue 2: Nationality & Country',
        lines: [
          { speakerAr: 'مُحَمَّدٌ', speakerBn: 'মুহাম্মাদ', arabic: 'السَّلَامُ عَلَيْكُمْ.', pronunciationBn: 'আসসালামু আলাইকুম।', meaningBn: 'আসসালামু আলাইকুম।', meaningEn: 'Peace be upon you.' },
          { speakerAr: 'شَرِيفٌ', speakerBn: 'শরীফ', arabic: 'وَعَلَيْكُمُ السَّلَامُ.', pronunciationBn: 'ওয়া আলাইকুমুস সালাম।', meaningBn: 'ওয়া আলাইকুমুস সালাম।', meaningEn: 'And upon you be peace.' },
          { speakerAr: 'مُحَمَّدٌ', speakerBn: 'মুহাম্মাদ', arabic: 'مِنْ أَيْنَ أَنْتَ؟', pronunciationBn: 'মিন আইনা আন্তা?', meaningBn: 'আপনি কোথা থেকে এসেছেন?', meaningEn: 'Where are you from?' },
          { speakerAr: 'شَرِيفٌ', speakerBn: 'শরীফ', arabic: 'أَنَا مِنْ بَاكِسْتَانَ، وَأَنْتَ؟', pronunciationBn: 'আনা মিন বাকিসতানা, ওয়া আন্তা?', meaningBn: 'আমি পাকিস্তান থেকে, আর আপনি?', meaningEn: 'I am from Pakistan, and you?' },
          { speakerAr: 'مُحَمَّدٌ', speakerBn: 'মুহাম্মাদ', arabic: 'أَنَا مِنْ بَنْغْلَادِيشَ، أَنَا بَنْغْلَادِيشِيٌّ.', pronunciationBn: 'আনা মিন বাংলাদেশ, আনা বাংলাদেশিয়্যুন।', meaningBn: 'আমি বাংলাদেশ থেকে, আমি বাংলাদেশি।', meaningEn: 'I am from Bangladesh, I am Bangladeshi.' },
          { speakerAr: 'شَرِيفٌ', speakerBn: 'শরীফ', arabic: 'أَهْلًا وَسَهْلًا.', pronunciationBn: 'আহলান ওয়া সাহলান।', meaningBn: 'স্বাগতম!', meaningEn: 'Welcome!' },
        ],
      },
      {
        id: 'by-u1-d3',
        titleAr: 'الحِوَارُ الثَّالِثُ',
        titleBn: 'সংলাপ ৩: তৃতীয় ব্যক্তির সাথে পরিচয় করিয়ে দেওয়া',
        titleEn: 'Dialogue 3: Introducing Someone Else',
        lines: [
          { speakerAr: 'أَحْمَدُ', speakerBn: 'আহমদ', arabic: 'السَّلَامُ عَلَيْكُمْ.', pronunciationBn: 'আসসালামু আলাইকুম।', meaningBn: 'আসসালামু আলাইকুম।', meaningEn: 'Peace be upon you.' },
          { speakerAr: 'بَدْرٌ', speakerBn: 'বদর', arabic: 'وَعَلَيْكُمُ السَّلَامُ.', pronunciationBn: 'ওয়া আলাইকুমুস সালাম।', meaningBn: 'ওয়া আলাইকুমুস সালাম।', meaningEn: 'And upon you be peace.' },
          { speakerAr: 'أَحْمَدُ', speakerBn: 'আহমদ', arabic: 'هٰذَا أَخِي، هُوَ مُدَرِّسٌ.', pronunciationBn: 'হাযা আখী, হুয়া মুদাররিসুন।', meaningBn: 'ইনি আমার ভাই, উনি একজন শিক্ষক।', meaningEn: 'This is my brother, he is a teacher.' },
          { speakerAr: 'بَدْرٌ', speakerBn: 'বদর', arabic: 'أَهْلًا وَسَهْلًا!', pronunciationBn: 'আহলান ওয়া সাহলান!', meaningBn: 'স্বাগতম!', meaningEn: 'Welcome!' },
          { speakerAr: 'أَحْمَدُ', speakerBn: 'আহমদ', arabic: 'هٰذَا صَدِيقِي، هُوَ مُهَنْدِسٌ.', pronunciationBn: 'হাযা সাদীকী, হুয়া মুহানদিসুন।', meaningBn: 'ইনি আমার বন্ধু, উনি একজন প্রকৌশলী।', meaningEn: 'This is my friend, he is an engineer.' },
          { speakerAr: 'الأَخُ', speakerBn: 'ভাই', arabic: 'مَعَ السَّلَامَةِ.', pronunciationBn: 'মা‘আস সালামাতি।', meaningBn: 'নিরাপদে বিদায় (আল্লাহ হাফেজ)।', meaningEn: 'Goodbye (with peace).' },
        ],
      },
    ],
    vocabulary: [
      { arabic: 'أَخٌ / أُخْتٌ', pronunciationBn: 'আখুন / উখতুন', meaningBn: 'ভাই / বোন', meaningEn: 'Brother / Sister' },
      { arabic: 'صَدِيقٌ / صَدِيقَةٌ', pronunciationBn: 'সাদীকুন / সাদীকাতুন', meaningBn: 'বন্ধু / বান্ধবী', meaningEn: 'Friend (m/f)' },
      { arabic: 'مُدَرِّسٌ / طَالِبٌ', pronunciationBn: 'মুদাররিসুন / তালিবুন', meaningBn: 'শিক্ষক / ছাত্র', meaningEn: 'Teacher / Student' },
      { arabic: 'طَبِيبٌ / مُهَنْدِسٌ', pronunciationBn: 'তাবীবুন / মুহানদিসুন', meaningBn: 'চিকিৎসক / প্রকৌশলী', meaningEn: 'Doctor / Engineer' },
    ],
    patternDrills: [
      {
        patternAr: 'هٰذَا [أَخِي]، هُوَ [مُدَرِّسٌ]',
        patternBn: 'তাদরীব (প্যাটার্ন অনুশীলন): ইনি আমার ___, উনি একজন ___।',
        exampleAr: 'هٰذَا أَخِي، هُوَ مُدَرِّسٌ.',
        exampleBn: 'ইনি আমার ভাই, উনি একজন শিক্ষক।',
        substitutions: [
          { promptBn: 'বন্ধু + চিকিৎসক', resultAr: 'هٰذَا صَدِيقِي، هُوَ طَبِيبٌ.', resultBn: 'ইনি আমার বন্ধু, উনি একজন চিকিৎসক।' },
          { promptBn: 'বোন + ছাত্রী (স্ত্রী)', resultAr: 'هٰذِهِ أُخْتِي، هِيَ طَالِبَةٌ.', resultBn: 'ইনি আমার বোন, উনি একজন ছাত্রী।' },
          { promptBn: 'সহপাঠী + প্রকৌশলী', resultAr: 'هٰذَا زَمِيلِي، هُوَ مُهَنْدِسٌ.', resultBn: 'ইনি আমার সহপাঠী, উনি একজন প্রকৌশলী।' },
        ],
      },
    ],
    soundsFocus: {
      letters: 'ح / خ / هـ',
      noteBn: 'কণ্ঠনালির ৩টি কাছাকাছি ধ্বনির পার্থক্য: ح (মিষ্টি হা), خ (খ—খসখসে), هـ (সহজ হা)।',
      examples: ['حَالُكَ', 'خَالِدٌ', 'هٰذَا'],
    },
  },
  {
    unitNumber: 2,
    bookNumber: 1,
    bookNameAr: 'الكِتَابُ الأَوَّلُ',
    bookNameBn: 'খণ্ড ১ (শুরুর স্তর)',
    titleAr: 'الوَحْدَةُ الثَّانِيَةُ: الأُسْرَةُ',
    titleBn: 'অধ্যায় ২: পরিবার ও পারিবারিক সম্পর্ক',
    titleEn: 'Unit 2: The Family',
    dialogues: [
      {
        id: 'by-u2-d1',
        titleAr: 'الحِوَارُ الأَوَّلُ',
        titleBn: 'সংলাপ ১: পারিবারিক ছবি পরিচিতি',
        titleEn: 'Dialogue 1: Looking at Family Photos',
        lines: [
          { speakerAr: 'عَلِيٌّ', speakerBn: 'আলী', arabic: 'السَّلَامُ عَلَيْكُمْ.', pronunciationBn: 'আসসালামু আলাইকুম।', meaningBn: 'আসসালামু আলাইকুম।', meaningEn: 'Peace be upon you.' },
          { speakerAr: 'عَمَّارٌ', speakerBn: 'আম্মার', arabic: 'وَعَلَيْكُمُ السَّلَامُ.', pronunciationBn: 'ওয়া আলাইকুমুস সালাম।', meaningBn: 'ওয়া আলাইকুমুস সালাম।', meaningEn: 'And upon you be peace.' },
          { speakerAr: 'عَلِيٌّ', speakerBn: 'আলী', arabic: 'هٰذِهِ صُورَةُ أُسْرَتِي.', pronunciationBn: 'হাযিহি সূরাতু উসরাতি।', meaningBn: 'এটি আমার পরিবারের ছবি।', meaningEn: 'This is a photo of my family.' },
          { speakerAr: 'عَمَّارٌ', speakerBn: 'আম্মার', arabic: 'مَا شَاءَ اللَّهُ! مَنْ هٰذَا؟', pronunciationBn: 'মাশাআল্লাহ! মান হাযা?', meaningBn: 'মাশাআল্লাহ! ইনি কে?', meaningEn: 'MashaAllah! Who is this?' },
          { speakerAr: 'عَلِيٌّ', speakerBn: 'আলী', arabic: 'هٰذَا وَالِدِي عَدْنَانُ، هُوَ مُهَنْدِسٌ.', pronunciationBn: 'হাযা ওয়ালিদী আদনানু, হুয়া মুহানদিসুন।', meaningBn: 'ইনি আমার বাবা আদনান, উনি প্রকৌশলী।', meaningEn: 'This is my father Adnan, he is an engineer.' },
          { speakerAr: 'عَمَّارٌ', speakerBn: 'আম্মার', arabic: 'وَمَنْ هٰذِهِ؟', pronunciationBn: 'ওয়া মান হাযিহি?', meaningBn: 'আর ইনি কে?', meaningEn: 'And who is this?' },
          { speakerAr: 'عَلِيٌّ', speakerBn: 'আলী', arabic: 'هٰذِهِ وَالِدَتِي، هِيَ طَبِيبَةٌ.', pronunciationBn: 'হাযিহি ওয়ালিদাতী, হিয়া তাবীবাতুন।', meaningBn: 'ইনি আমার মা, উনি একজন চিকিৎসক।', meaningEn: 'This is my mother, she is a doctor.' },
        ],
      },
      {
        id: 'by-u2-d2',
        titleAr: 'الحِوَارُ الثَّانِي',
        titleBn: 'সংলাপ ২: মসজিদে ফজরের প্রস্তুতি',
        titleEn: 'Dialogue 2: Preparing for Fajr at the Mosque',
        lines: [
          { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'هٰذَا أَذَانُ الفَجْرِ.', pronunciationBn: 'হাযা আযানুল ফাজরি।', meaningBn: 'এটি ফজরের আযান।', meaningEn: 'This is the Fajr call to prayer.' },
          { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ. أَيْنَ الأَوْلَادُ؟', pronunciationBn: 'আল্লাহু আকবার। আইনাল আওলাদু?', meaningBn: 'আল্লাহু আকবার। সন্তানেরা কোথায়?', meaningEn: 'Allah is Greatest. Where are the children?' },
          { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'سَعْدٌ فِي الحَمَّامِ يَتَوَضَّأُ.', pronunciationBn: 'সা‘দুন ফিল হাম্মামি ইয়াতাওয়াদ্দাউ।', meaningBn: 'সাদ ওযুখানায় ওযু করছে।', meaningEn: 'Sa’d is in the washroom making Wudu.' },
          { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'وَأَيْنَ سَعِيدٌ؟', pronunciationBn: 'ওয়া আইনা সা‘ঈদুন?', meaningBn: 'আর সাঈদ কোথায়?', meaningEn: 'And where is Sa’id?' },
          { speakerAr: 'الأُمُّ', speakerBn: 'মা', arabic: 'سَعِيدٌ فِي الغُرْفَةِ يَقْرَأُ القُرْآنَ.', pronunciationBn: 'সা‘ঈদুন ফিল গুরফাতি ইয়াকরাউল কুরআনা।', meaningBn: 'সাঈদ কক্ষে কুরআন তিলাওয়াত করছে।', meaningEn: 'Sa’id is in the room reading Quran.' },
          { speakerAr: 'الأَبُ', speakerBn: 'বাবা', arabic: 'هَيَّا بِنَا إِلَى المَسْجِدِ.', pronunciationBn: 'হাইয়া বিনা ইলাল মাসজিদি।', meaningBn: 'চলো আমরা মসজিদে যাই।', meaningEn: 'Let us go to the mosque.' },
        ],
      },
    ],
    vocabulary: [
      { arabic: 'وَالِدٌ / وَالِدَةٌ', pronunciationBn: 'ওয়ালিদুন / ওয়ালিদাতুন', meaningBn: 'পিতা / মাতা', meaningEn: 'Father / Mother' },
      { arabic: 'جَدٌّ / جَدَّةٌ', pronunciationBn: 'জাদ্দুন / জাদ্দাতুন', meaningBn: 'দাদা-নানা / দাদি-নানি', meaningEn: 'Grandfather / Grandmother' },
      { arabic: 'عَمٌّ / خَالٌ', pronunciationBn: 'আম্মুন / খালুন', meaningBn: 'চাচা / মামা', meaningEn: 'Paternal uncle / Maternal uncle' },
      { arabic: 'يَتَوَضَّأُ', pronunciationBn: 'ইয়াতাওয়াদ্দাউ', meaningBn: 'সে ওযু করছে', meaningEn: 'He performs Wudu' },
    ],
    patternDrills: [
      {
        patternAr: 'أَيْنَ [سَعِيدٌ]؟ — هُوَ فِي [الغُرْفَةِ] [يَقْرَأُ القُرْآنَ]',
        patternBn: 'স্থান ও কাজের তাদরীব: ___ কোথায়? — সে ___ কক্ষে ___ করছে।',
        exampleAr: 'أَيْنَ سَعِيدٌ؟ — هُوَ فِي الغُرْفَةِ يَقْرَأُ القُرْآنَ.',
        exampleBn: 'সাঈদ কোথায়? — সে কক্ষে কুরআন পড়ছে।',
        substitutions: [
          { promptBn: 'বাবা + মসজিদ + সালাত আদায় করছে', resultAr: 'أَيْنَ الوَالِدُ؟ — هُوَ فِي المَسْجِدِ يُصَلِّي.', resultBn: 'বাবা কোথায়? — তিনি মসজিদে সালাত আদায় করছেন।' },
          { promptBn: 'মা + রান্নাঘর + খাবার তৈরি করছেন', resultAr: 'أَيْنَ الوَالِدَةُ؟ — هِيَ فِي المَطْبَخِ تُعِدُّ الطَّعَامَ.', resultBn: 'মা কোথায়? — তিনি রান্নাঘরে খাবার তৈরি করছেন।' },
        ],
      },
    ],
    soundsFocus: {
      letters: 'ص / س / ض / د',
      noteBn: 'মোটা (তাফখীম) হরফ ص ও ض-এর সাথে চিকন হরফ س ও د-এর উচ্চারণ পার্থক্য।',
      examples: ['صُورَةٌ', 'سَعِيدٌ', 'يَتَوَضَّأُ', 'وَالِدِي'],
    },
  },
  {
    unitNumber: 3,
    bookNumber: 2,
    bookNameAr: 'الكِتَابُ الثَّانِي',
    bookNameBn: 'খণ্ড ২ (প্রাথমিক-মধ্যম)',
    titleAr: 'الوَحْدَةُ الثَّالِثَةُ: الطَّعَامُ وَالشَّرَابُ وَالسُّوقُ',
    titleBn: 'অধ্যায় ৩: খাবার, পানীয় ও বাজার',
    titleEn: 'Unit 3: Food, Drink & Shopping',
    dialogues: [
      {
        id: 'by-u3-d1',
        titleAr: 'الحِوَارُ الأَوَّلُ',
        titleBn: 'সংলাপ ১: খাবারের টেবিলে অতিথি',
        titleEn: 'Dialogue 1: Meals & Hospitality',
        lines: [
          { speakerAr: 'قَاسِمٌ', speakerBn: 'কাসিম', arabic: 'كَمْ وَجْبَةً تَأْكُلُ فِي اليَوْمِ؟', pronunciationBn: 'কাম ওয়াজবাতান তা’কুলু ফিল ইয়াওমি?', meaningBn: 'আপনি দিনে কয় বেলা খাবার খান?', meaningEn: 'How many meals do you eat per day?' },
          { speakerAr: 'سَالِمٌ', speakerBn: 'সালিম', arabic: 'آكُلُ ثَلَاثَ وَجَبَاتٍ: الفُطُورَ، وَالغَدَاءَ، وَالعَشَاءَ.', pronunciationBn: 'আ-কুলু ছালাছা ওয়াজাবাতিন: আল-ফুতূরা, ওয়াল গাদাআ, ওয়াল আশাআ।', meaningBn: 'আমি তিন বেলা খাই: সকালের নাস্তা, দুপুরের খাবার ও রাতের খাবার।', meaningEn: 'I eat three meals: breakfast, lunch, and dinner.' },
          { speakerAr: 'قَاسِمٌ', speakerBn: 'কাসিম', arabic: 'مَاذَا تَشْرَبُ فِي الصَّبَاحِ؟', pronunciationBn: 'মাযা তাশরাবু ফিস সবাহি?', meaningBn: 'সকালে আপনি কী পান করেন?', meaningEn: 'What do you drink in the morning?' },
          { speakerAr: 'سَالِمٌ', speakerBn: 'সালিম', arabic: 'أَشْرَبُ الشَّايَ بِالحَلِيبِ أَوِ القَهْوَةَ.', pronunciationBn: 'আশরাবুশ শায়া বিল-হালীবি আওয়িল কাহওয়াতা।', meaningBn: 'আমি দুধ-চা অথবা কফি পান করি।', meaningEn: 'I drink tea with milk or coffee.' },
        ],
      },
    ],
    vocabulary: [
      { arabic: 'الفُطُورُ / الغَدَاءُ / العَشَاءُ', pronunciationBn: 'আল-ফুতূর / আল-গাদা / আল-আশা', meaningBn: 'নাস্তা / দুপুরের খাবার / রাতের খাবার', meaningEn: 'Breakfast / Lunch / Dinner' },
      { arabic: 'خُبْزٌ / أَرُزٌّ / لَحْمٌ', pronunciationBn: 'খুবযুন / আরুযযুন / লাহমুন', meaningBn: 'রুটি / ভাত / মাংস', meaningEn: 'Bread / Rice / Meat' },
      { arabic: 'كَمْ ثَمَنُ هٰذَا؟', pronunciationBn: 'কাম ছামানু হাযা?', meaningBn: 'এটার দাম কত?', meaningEn: 'How much is this?' },
    ],
    patternDrills: [
      {
        patternAr: 'مَاذَا [تَشْرَبُ]؟ — [أَشْرَبُ] [الشَّايَ]',
        patternBn: 'ক্রিয়া পরিবর্তনের তাদরীব: আপনি কী ___? — আমি ___।',
        exampleAr: 'مَاذَا تَأْكُلُ؟ — آكُلُ الأَرُزَّ وَالسَّمَكَ.',
        exampleBn: 'আপনি কী খাচ্ছেন? — আমি ভাত ও মাছ খাচ্ছি।',
        substitutions: [
          { promptBn: 'পান করা + ঠাণ্ডা পানি', resultAr: 'مَاذَا تَشْرَبُ؟ — أَشْرَبُ المَاءَ البَارِدَ.', resultBn: 'আপনি কী পান করছেন? — আমি ঠাণ্ডা পানি পান করছি।' },
          { promptBn: 'চাওয়া + গরম রুটি', resultAr: 'مَاذَا تُرِيدُ؟ — أُرِيدُ الخُبْزَ السَّاخِنَ.', resultBn: 'আপনি কী চান? — আমি গরম রুটি চাই।' },
        ],
      },
    ],
    soundsFocus: {
      letters: 'ق / ك',
      noteBn: 'কণ্ঠমূলের ভারী কাফ (ق) ও জিহ্বার কিনারা থেকে ক্বাফ/কাফ (ك)-এর পার্থক্য।',
      examples: ['قَهْوَةٌ', 'قَاسِمٌ', 'كَمْ', 'تَأْكُلُ'],
    },
  },
  {
    unitNumber: 4,
    bookNumber: 3,
    bookNameAr: 'الكِتَابُ الثَّالِثُ',
    bookNameBn: 'খণ্ড ৩ (মধ্যম স্তর)',
    titleAr: 'الوَحْدَةُ الرَّابِعَةُ: السَّفَرُ وَالحَجُّ وَالعُمْرَةُ',
    titleBn: 'অধ্যায় ৪: সফর, হজ্জ ও উমরাহ',
    titleEn: 'Unit 4: Travel, Hajj & Umrah',
    dialogues: [
      {
        id: 'by-u4-d1',
        titleAr: 'الحِوَارُ الأَوَّلُ',
        titleBn: 'সংলাপ ১: মক্কায় সফর ও উমরাহর প্রস্তুতি',
        titleEn: 'Dialogue 1: Preparing for Umrah',
        lines: [
          { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মকর্তা', arabic: 'أَهْلًا وَسَهْلًا، جَوَازُ السَّفَرِ مِنْ فَضْلِكَ.', pronunciationBn: 'আহলান ওয়া সাহলান, জাওয়াযুস সাফারি মিন ফাদলিকা।', meaningBn: 'স্বাগতম, অনুগ্রহ করে আপনার পাসপোর্ট দিন।', meaningEn: 'Welcome, your passport please.' },
          { speakerAr: 'المُسَافِرُ', speakerBn: 'যাত্রী', arabic: 'تَفَضَّلْ، هٰذَا جَوَازُ السَّفَرِ وَالتَّذْكِرَةُ.', pronunciationBn: 'তাফাদ্দাল, হাযা জাওয়াযুস সাফারি ওয়াত-তাযকিরাতু।', meaningBn: 'নিন, এই যে পাসপোর্ট ও টিকেট।', meaningEn: 'Here you go, this is the passport and ticket.' },
          { speakerAr: 'المُوَظَّفُ', speakerBn: 'কর্মকর্তা', arabic: 'إِلَى أَيْنَ أَنْتَ مُسَافِرٌ؟', pronunciationBn: 'ইলা আইনা আন্তা মুসাফিরুন?', meaningBn: 'আপনি কোথায় সফর করছেন?', meaningEn: 'Where are you traveling to?' },
          { speakerAr: 'المُسَافِرُ', speakerBn: 'যাত্রী', arabic: 'أَنَا مُسَافِرٌ إِلَى مَكَّةَ المُكَرَّمَةِ لِأَدَاءِ العُمْرَةِ.', pronunciationBn: 'আনা মুসাফিরুন ইলা মাক্কাতাল মুকাররামাতি লিআদায়িল উমরাতি।', meaningBn: 'আমি উমরাহ আদায়ের জন্য মক্কা মুকাররামায় সফর করছি।', meaningEn: 'I am traveling to Makkah to perform Umrah.' },
        ],
      },
    ],
    vocabulary: [
      { arabic: 'جَوَازُ السَّفَرِ / التَّذْكِرَةُ', pronunciationBn: 'জাওয়াযুস সাফার / আত-তাযকিরাহ', meaningBn: 'পাসপোর্ট / টিকেট', meaningEn: 'Passport / Ticket' },
      { arabic: 'المَطَارُ / الطَّائِرَةُ', pronunciationBn: 'আল-মাতার / আত-তায়িরাতু', meaningBn: 'বিমানবন্দর / উড়োজাহাজ', meaningEn: 'Airport / Airplane' },
      { arabic: 'الإِحْرَامُ / الطَّوَافُ / السَّعْيُ', pronunciationBn: 'আল-ইহরাম / আত-তাওয়াফ / আস-সা‘য়ু', meaningBn: 'ইহরাম / তাওয়াফ / সা‘ঈ', meaningEn: 'Ihram / Tawaf / Sa’y' },
    ],
    patternDrills: [
      {
        patternAr: 'أَنَا مُسَافِرٌ إِلَى [مَكَّةَ] لِـ[أَدَاءِ العُمْرَةِ]',
        patternBn: 'উদ্দেশ্য প্রকাশের তাদরীব: আমি ___ যাচ্ছি ___ জন্য।',
        exampleAr: 'أَنَا مُسَافِرٌ إِلَى المَدِينَةِ لِزِيَارَةِ المَسْجِدِ النَّبَوِيِّ.',
        exampleBn: 'আমি মসজিদে নববী যিয়ারতের জন্য মদীনায় যাচ্ছি।',
        substitutions: [
          { promptBn: 'বিশ্ববিদ্যালয় + আরবি ভাষা শেখা', resultAr: 'أَنَا ذَاهِبٌ إِلَى الجَامِعَةِ لِتَعَلُّمِ اللُّغَةِ العَرَبِيَّةِ.', resultBn: 'আমি আরবি ভাষা শেখার জন্য বিশ্ববিদ্যালয়ে যাচ্ছি।' },
        ],
      },
    ],
    soundsFocus: {
      letters: 'ع / غ',
      noteBn: 'গলার গভীর থেকে আইন (ع) ও গাইন (غ)-এর বিশুদ্ধ উচ্চারণ।',
      examples: ['العُمْرَةُ', 'السَّعْيُ', 'مَسْجِدٌ', 'بَنْغْلَادِيشُ'],
    },
  },
];
