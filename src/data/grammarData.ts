import { GrammarTopic } from '../types/academy';
import { CLASSICAL_KITAB_TOPICS } from './classicalKitabGrammar';

const BASE_GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'kalimah',
    titleAr: 'الكَلِمَةُ وَأَقْسَامُهَا',
    titleBn: 'কালিমা ও এর তিন প্রকার (ইসম, ফেল, হরফ)',
    titleEn: 'Al-Kalimah (Word Categories)',
    branch: 'Nahw',
    summaryBn: 'অর্থবোধক প্রতিটি আরবি শব্দকে কালিমা বলে, যা ৩ ভাগে বিভক্ত: ইসম, ফেল ও হরফ।',
    explanationBn:
      'আরবি ভাষার সমস্ত শব্দ মাত্র তিনটি শ্রেণির অন্তর্ভুক্ত: (১) ইসম (বিশেষ্য/বিশেষণ/সর্বনাম), (২) ফেল (ক্রিয়াপদ—যা অতীত, বর্তমান বা আদেশ কাল বোঝায়), এবং (৩) হরফ (অব্যয়—যা ইসম বা ফেলের সাথে যুক্ত না হলে পূর্ণ অর্থ দেয় না)।',
    explanationEn: 'Every meaningful Arabic word is either an Ism (noun), Fi’l (verb), or Harf (particle).',
    rulesBn: [
      'কোনো বাক্যের শুরুতে الكلمة চিনতে পারলে নাহুর অর্ধেক সহজ হয়ে যায়।',
      'ইসম কাল-নিরপেক্ষ, ফেল কাল-নির্ভর, আর হরফ সংযোগকারী।',
    ],
    examples: [
      { arabic: 'ذَهَبَ زَيْدٌ إِلَى المَسْجِدِ.', pronunciationBn: 'যাহাবা যাইদুন ইলাল মাসজিদি।', meaningBn: 'যায়েদ মসজিদে গিয়েছে।', analysisBn: 'ذَهَبَ = ফেল, زَيْدٌ = ইসম, إِلَى = হরফ, المَسْجِدِ = ইসম।' },
    ],
    quiz: [
      { id: 'gq-kal-1', questionBn: 'আরবিতে কালিমা কয় প্রকার?', questionEn: 'How many categories of Kalimah exist?', options: ['২ প্রকার', '৩ প্রকার', '৪ প্রকার', '৫ প্রকার'], correctIndex: 1, explanationBn: 'কালিমা ৩ প্রকার: ইসম, ফেল ও হরফ।', explanationEn: 'Three: Ism, Fi’l, and Harf.' },
    ],
  },
  {
    id: 'nahw',
    titleAr: 'النَّحْوُ',
    titleBn: 'নাহু (বাক্যতত্ত্ব পরিচিতি)',
    titleEn: 'Nahw (Arabic Syntax)',
    branch: 'Nahw',
    summaryBn: 'বাক্যে শব্দের পারস্পরিক সম্পর্ক ও শেষ অক্ষরের পরিবর্তন (ইরাব) বোঝার শাস্ত্র।',
    explanationBn:
      'ইলমুন নাহু হলো আরবি ব্যাকরণের সেই শাখা যা বাক্যের মধ্যে একটি শব্দের অবস্থান নির্ণয় করে—কে কর্তা (ফায়েল), কে কর্ম (মাফউল), আর শব্দের শেষ অক্ষরে পেশ, যবর না যের হবে তা ঠিক করে।',
    explanationEn: 'Nahw governs sentence structure and grammatical case endings (I’rab).',
    rulesBn: [
      'বাক্যে শব্দের ভূমিকা অনুযায়ী শেষ অক্ষরের হরকত বদলায়।',
      'একই শব্দ কর্তা হলে পেশ, কর্ম হলে যবর এবং হরফে জারের পর এলে যের পায়।',
    ],
    examples: [
      { arabic: 'نَصَرَ اللَّهُ المُؤْمِنِينَ.', pronunciationBn: 'নাসারাল্লাহুল মু’মিনীনা।', meaningBn: 'আল্লাহ মুমিনদের সাহায্য করেছেন।', analysisBn: 'اللَّهُ ফায়েল (মারফু/পেশ), المُؤْمِنِينَ মাফউল বিহি (মানসুব)।' },
    ],
    quiz: [
      { id: 'gq-nahw-1', questionBn: 'ইলমুন নাহুর প্রধান আলোচ্য বিষয় কী?', questionEn: 'What is the primary focus of Nahw?', options: ['বর্ণের উচ্চারণ', 'বাক্যে শব্দের অবস্থান ও শেষ অক্ষরের ইরাব', 'শুধু শব্দের মূলধাতু', 'কবিতার ছন্দ'], correctIndex: 1, explanationBn: 'নাহু বাক্যের গঠন ও শেষ অক্ষরের ইরাব আলোচনা করে।', explanationEn: 'Nahw studies syntax and word endings.' },
    ],
  },
  {
    id: 'sarf',
    titleAr: 'الصَّرْفُ وَالمِيزَانُ الصَّرْفِيُّ',
    titleBn: 'ছরফ ও মীযানুছ ছরফ (ف ع ل ছাঁচ)',
    titleEn: 'Sarf & Morphological Scale',
    branch: 'Sarf',
    summaryBn: 'একটি মূলধাতু (মাদ্দাহ) থেকে কীভাবে অসংখ্য শব্দ ও ক্রিয়ার রূপ তৈরি হয় তা শেখার শাস্ত্র।',
    explanationBn:
      'ইলমুস ছরফ শব্দের অভ্যন্তরীণ গঠন নিয়ে কাজ করে। বেশিরভাগ আরবি শব্দের ৩টি মূল অক্ষর (ف ع ل ছাঁচে) থাকে। যেমন: ك-ت-ب থেকে كَتَبَ (লিখেছে), كَاتِبٌ (লেখক), مَكْتُوبٌ (লিখিত), مَكْتَبَةٌ (গ্রন্থাগার)।',
    explanationEn: 'Sarf uses the fa-ayn-lam (ف ع ل) template to derive words from triliteral roots.',
    rulesBn: [
      'মূল ৩টি অক্ষরকে ফা-কালেমা, আইন-কালেমা ও লাম-কালেমা বলে।',
      'অতিরিক্ত অক্ষরগুলো মীযানে হুবহু রাখা হয়, যেমন أَكْرَمَ-এর ওজন أَفْعَلَ।',
    ],
    examples: [
      { arabic: 'عَلِمَ ← عَالِمٌ ← مَعْلُومٌ ← تَعْلِيمٌ', pronunciationBn: 'আলিমা ← আলিমুন ← মা’লূমুন ← তা’লীমুন', meaningBn: 'জেনেছে ← জ্ঞানী ← জ্ঞাত ← শিক্ষাদান', analysisBn: 'সবগুলো শব্দের মূলধাতু ع ل م।' },
    ],
    quiz: [
      { id: 'gq-sarf-1', questionBn: 'مَكْتَبَةٌ ও كِتَابٌ শব্দের মূলধাতু কোনটি?', questionEn: 'What is the shared root of مَكْتَبَةٌ and كِتَابٌ?', options: ['ق ر أ', 'ك ت ب', 'ع ل م', 'ذ ه ب'], correctIndex: 1, explanationBn: 'উভয় শব্দের ত্রিবর্ণ মূলধাতু ك ت ب (লেখা)।', explanationEn: 'Both derive from k-t-b.' },
    ],
  },
  {
    id: 'marifah-nakirah',
    titleAr: 'المَعْرِفَةُ وَالنَّكِرَةُ',
    titleBn: 'মা‘রিফাহ (নির্দিষ্ট) ও নাকিরাহ (অনির্দিষ্ট)',
    titleEn: 'Definite & Indefinite Nouns',
    branch: 'Nahw',
    summaryBn: 'নির্দিষ্ট কোনো ব্যক্তি-বস্তু (মা‘রিফাহ) এবং সাধারণ অনির্দিষ্ট নাম (নাকিরাহ) চেনার ৭টি নিয়ম।',
    explanationBn:
      'নাকিরাহ শব্দের শেষে সাধারণত তানভীন থাকে (যেমন كِتَابٌ = একটি বই)। আর মা‘রিফাহ ৭ প্রকার: (১) সর্বনাম (هُوَ), (২) ব্যক্তির নাম (زَيْدٌ), (৩) ইশারা সর্বনাম (هٰذَا), (৪) মাওসূলাহ (الَّذِي), (৫) ال যুক্ত শব্দ (الكِتَابُ), (৬) মা‘রিফার দিকে মুদাফ (كِتَابُ زَيْدٍ), (৭) নির্দিষ্ট মুনাদা।',
    explanationEn: 'Indefinite nouns typically carry Tanwin; definite nouns include Al-, proper names, pronouns, demonstratives, and Idafah to a definite noun.',
    rulesBn: [
      'তানভীন অনির্দিষ্টতার চিহ্ন, আর ال নির্দিষ্টতার চিহ্ন।',
      'كِتَابُ اللَّهِ এখানে كِتَابُ শব্দটি اللَّهِ-এর সাথে যুক্ত হয়ে মা‘রিফাহ হয়েছে।',
    ],
    examples: [
      { arabic: 'قَلَمٌ (একটি কলম) ← القَلَمُ (কলমটি)', pronunciationBn: 'কালামুন ← আল-কালামু', meaningBn: 'অনির্দিষ্ট কলম ← নির্দিষ্ট কলমটি', analysisBn: 'ال যুক্ত হওয়ায় তানভীন উঠে গিয়ে নির্দিষ্ট হয়েছে।' },
    ],
    quiz: [
      { id: 'gq-mn-1', questionBn: 'নিচের কোন শব্দটি মা‘রিফাহ (নির্দিষ্ট)?', questionEn: 'Which noun is definite (Ma’rifah)?', options: ['رَجُلٌ', 'بَيْتٌ', 'المَسْجِدُ', 'قَلَمٌ'], correctIndex: 2, explanationBn: 'المَسْجِدُ শব্দের শুরুতে ال থাকায় এটি নির্দিষ্ট (মা‘রিফাহ)।', explanationEn: 'Al-Masjidu has Al- prefix.' },
    ],
  },
  {
    id: 'mudhakkar-muannath',
    titleAr: 'المُذَكَّرُ وَالمُؤَنَّثُ',
    titleBn: 'মুযাক্কার (পুংলিঙ্গ) ও মুয়ান্নাস (স্ত্রীলিঙ্গ)',
    titleEn: 'Masculine & Feminine Gender',
    branch: 'Nahw',
    summaryBn: 'আরবিতে প্রতিটি নামপদ পুংলিঙ্গ অথবা স্ত্রীলিঙ্গ—চিহ্নযুক্ত ও প্রাকৃতিক স্ত্রীলিঙ্গ চেনার উপায়।',
    explanationBn:
      'স্ত্রীলিঙ্গ চেনার ৩টি চিহ্ন: (১) গোল তা (ة) যেমন جَنَّةٌ, (২) আলিফে মাকসূরাহ (ى) যেমন كُبْرَى, (৩) আলিফে মামদূদাহ (اء) যেমন صَحْرَاءُ। এছাড়াও কিছু শব্দ চিহ্ন ছাড়াই সামা‘ঈ স্ত্রীলিঙ্গ হয়, যেমন شَمْسٌ (সূর্য), أَرْضٌ (পৃথিবী), نَفْسٌ (আত্মা), يَدٌ (হাত) ও শরীরের জোড়া অঙ্গ।',
    explanationEn: 'Feminine markers include ة, ى, and اء, plus naturally feminine and paired body parts.',
    rulesBn: [
      'শরীরের জোড়া অঙ্গসমূহ (যেমন عَيْنٌ চোখ, أُذُنٌ কান, يَدٌ হাত) স্ত্রীলিঙ্গ হিসেবে ব্যবহৃত হয়।',
      'শহর ও দেশের নাম সাধারণত স্ত্রীলিঙ্গ হয়।',
    ],
    examples: [
      { arabic: 'الشَّمْسُ مُشْرِقَةٌ.', pronunciationBn: 'আশশামসু মুশরিকাতুন।', meaningBn: 'সূর্য উদিত/উজ্জ্বল।', analysisBn: 'الشَّمْسُ স্ত্রীলিঙ্গ হওয়ায় খবর مُشْرِقَةٌ-তে গোল তা (ة) এসেছে।' },
    ],
    quiz: [
      { id: 'gq-mm-1', questionBn: 'কোন শব্দটি চিহ্ন ছাড়াই আরবিতে স্ত্রীলিঙ্গ (মুয়ান্নাস সামা‘ঈ)?', questionEn: 'Which word is feminine without a feminine suffix?', options: ['قَمَرٌ', 'كِتَابٌ', 'شَمْسٌ', 'بَابٌ'], correctIndex: 2, explanationBn: 'شَمْسٌ (সূর্য) চিহ্ন ছাড়াই আরবিতে স্ত্রীলিঙ্গ।', explanationEn: 'Shams (sun) is feminine by usage.' },
    ],
  },
  {
    id: 'ism',
    titleAr: 'الاسْمُ وَعَلَامَاتُهُ',
    titleBn: 'ইসম (বিশেষ্য) ও ইসম চেনার আলামত',
    titleEn: 'Al-Ism & Its Markers',
    branch: 'Nahw',
    summaryBn: 'ব্যক্তি, বস্তু, স্থান, গুণ বা ধারণা—ইসম চেনার ৪টি সহজ পরিচয়চিহ্ন।',
    explanationBn:
      'ইসম চেনার ৪টি প্রধান আলামত: (১) শুরুতে ال থাকা, (২) শেষে তানভীন (ً ٍ ٌ) থাকা, (৩) শেষে গোল তা (ة) থাকা, (৪) হরফে জারের পর বসা বা জর (যের) গ্রহণ করা।',
    explanationEn: 'Recognize an Ism by Al-, Tanwin, Ta Marbuta, or genitive case.',
    rulesBn: [
      'একই শব্দে কখনো ال এবং তানভীন একসাথে বসে না।',
      'মুনাদা (যেমন يَا زَيْدُ) ও শুধু ইসমের ক্ষেত্রেই হয়।',
    ],
    examples: [
      { arabic: 'المَسْجِدُ كَبِيرٌ.', pronunciationBn: 'আল-মাসজিদু কাবীরুন।', meaningBn: 'মসজিদটি বড়।', analysisBn: 'المَسْجِدُ-তে ال এবং كَبِيرٌ-এ তানভীন উভয়ই ইসমের চিহ্ন।' },
    ],
    quiz: [
      { id: 'gq-ism-1', questionBn: 'নিচের কোনটি শুদ্ধ আরবি ইসম?', questionEn: 'Which Arabic noun form is valid?', options: ['الكِتَابٌ', 'القَلَمُ', 'البَيْتٍ', 'الذَّهَبَ يَذْهَبُ'], correctIndex: 1, explanationBn: 'القَلَمُ-তে ال থাকায় তানভীন নেই, তাই এটি শুদ্ধ।', explanationEn: 'Al-Qalamu has Al- without Tanwin.' },
    ],
  },
  {
    id: 'isharah',
    titleAr: 'أَسْمَاءُ الإِشَارَةِ',
    titleBn: 'ইসমুল ইশারাহ (নির্দেশক সর্বনাম)',
    titleEn: 'Demonstrative Pronouns',
    branch: 'Nahw',
    summaryBn: 'কাছের ও দূরের ব্যক্তি-বস্তু নির্দেশ করতে هٰذَا، هٰذِهِ، ذٰلِكَ، تِلْكَ، هٰؤُلَاءِ-এর ব্যবহার।',
    explanationBn:
      'কাছের জন্য: هٰذَا (এই-পুং), هٰذِهِ (এই-স্ত্রী/অবস্তু বহুবচন), هٰؤُلَاءِ (এরা-ব্যক্তি বহুবচন)। দূরের জন্য: ذٰلِكَ (ঐ-পুং), تِلْكَ (ঐ-স্ত্রী/অবস্তু বহুবচন), أُولٰئِكَ (ঐরা-ব্যক্তি বহুবচন)।',
    explanationEn: 'Near: hadha (m), hadhihi (f), ha’ula’i (pl). Far: dhalika (m), tilka (f), ula’ika (pl).',
    rulesBn: [
      'ইশারার পর ال যুক্ত শব্দ এলে "এই বইটি" (هٰذَا الكِتَابُ) হয়; আর ال ছাড়া এলে পূর্ণ বাক্য "এটি একটি বই" (هٰذَا كِتَابٌ) হয়।',
    ],
    examples: [
      { arabic: 'ذٰلِكَ الكِتَابُ لَا رَيْبَ فِيهِ (البقرة ٢:٢)', pronunciationBn: 'যালিকাল কিতাবু লা রাইবা ফীহি', meaningBn: 'ঐ কিতাব, যাতে কোনো সন্দেহ নেই।', analysisBn: 'ذٰلِكَ দূরের পুংবাচক ইশারা এবং الكِتَابُ বদল/মুশার ইলাইহি।' },
    ],
    quiz: [
      { id: 'gq-ish-1', questionBn: '"এটি একটি ঘড়ি" (سَاعَةٌ স্ত্রীবাচক)—শুদ্ধ বাক্য কোনটি?', questionEn: 'Which means "This is a watch" (سَاعَةٌ is feminine)?', options: ['هٰذَا سَاعَةٌ', 'هٰذِهِ سَاعَةٌ', 'ذٰلِكَ سَاعَةٌ', 'هٰؤُلَاءِ سَاعَةٌ'], correctIndex: 1, explanationBn: 'سَاعَةٌ স্ত্রীলিঙ্গ হওয়ায় هٰذِهِ ব্যবহৃত হবে।', explanationEn: 'Hadhihi agrees with feminine Sa’ah.' },
    ],
  },
  {
    id: 'mawsul',
    titleAr: 'الأَسْمَاءُ المَوْصُولَةُ',
    titleBn: 'ইসমুল মাওসূল (সম্বন্ধবাচক সর্বনাম)',
    titleEn: 'Relative Pronouns (Alladhi, Allati)',
    branch: 'Nahw',
    summaryBn: '"যে / যিনি / যা" অর্থে বাক্যাংশ যুক্ত করতে الَّذِي، الَّتِي، الَّذِينَ، مَنْ، مَا ব্যবহার।',
    explanationBn:
      'الَّذِي (যিনি-পুং একবচন), الَّتِي (যিনি-স্ত্রী একবচন/অবস্তু বহুবচন), الَّذِينَ (যারা-পুং বহুবচন), اللَّاتِي (যারা-স্ত্রী বহুবচন)। সাধারণ মানুষের জন্য مَنْ এবং বস্তুর জন্য مَا ব্যবহৃত হয়।',
    explanationEn: 'Alladhi (m.sg), Allati (f.sg), Alladhina (m.pl) link relative clauses (Silah) with a returning pronoun.',
    rulesBn: [
      'মাওসূলের পরের বাক্যকে সিলাতুল মাওসূল বলে এবং তাতে একটি দমীরে আয়িদ থাকা জরুরি।',
    ],
    examples: [
      { arabic: 'جَاءَ الطَّالِبُ الَّذِي نَجَحَ.', pronunciationBn: 'জা-আত তালিবুল্লাযী নাজাহা।', meaningBn: 'সেই ছাত্রটি এসেছে যে সফল হয়েছে।', analysisBn: 'الَّذِي মাওসূল, নাজাহা তার সিলাহ।' },
    ],
    quiz: [
      { id: 'gq-maw-1', questionBn: 'মুমিন পুরুষদের বহুবচনের জন্য কোন মাওসূল ব্যবহৃত হয়?', questionEn: 'Which relative pronoun is used for masculine plural?', options: ['الَّذِي', 'الَّتِي', 'الَّذِينَ', 'اللَّاتِي'], correctIndex: 2, explanationBn: 'বহুবচন পুংলিঙ্গের জন্য الَّذِينَ ব্যবহৃত হয়।', explanationEn: 'Alladhina is masculine plural.' },
    ],
  },
  {
    id: 'idafah',
    titleAr: 'المُضَافُ وَالمُضَافُ إِلَيْهِ (الإِضَافَةُ)',
    titleBn: 'ইযাফাত (মুদাফ ও মুদাফ ইলাইহি)',
    titleEn: 'Idafah (Possessive Construct)',
    branch: 'Nahw',
    summaryBn: 'দুটি ইসমের সম্বন্ধ যুক্ত করে মালিকানা বা সম্পর্ক বোঝানোর গুরুত্বপূর্ণ নিয়ম।',
    explanationBn:
      'বাংলায় "এর / র" যুক্ত সম্পর্ক বোঝাতে ইযাফাত হয়: ১ম শব্দ মুদাফ (কখনো ال এবং তানভীন পায় না, এমনকি দ্বিবচন/বহুবচনের নূন-ও পড়ে যায়) এবং ২য় শব্দ মুদাফ ইলাইহি (সর্বদা মাজরূর বা কাসরাযুক্ত হয়)।',
    explanationEn: 'Mudaf drops Al- and Tanwin; Mudaf Ilayhi is always in Jarr (genitive).',
    rulesBn: [
      'মুদাফ-এ কখনো ال ও তানভীন থাকবে না: যেমন بَيْتُ اللَّهِ (কখনো البَيْتُ اللَّهِ নয়)।',
      'মুদাফ ইলাইহি সর্বদা মাজরূর (যের/কাসরা) হবে।',
    ],
    examples: [
      { arabic: 'بَابُ المَسْجِدِ مَفْتُوحٌ.', pronunciationBn: 'বাবুল মাসজিদি মাফতূহুন।', meaningBn: 'মসজিদের দরজা খোলা।', analysisBn: 'بَابُ মুদাফ (পেশ, ال-তানভীন মুক্ত), المَسْجِدِ মুদাফ ইলাইহি (কাসরা)।' },
    ],
    quiz: [
      { id: 'gq-ida-1', questionBn: '"শিক্ষকের বই"—শুদ্ধ ইযাফাত কোনটি?', questionEn: 'Which Idafah accurately means "the teacher’s book"?', options: ['الكِتَابُ المُعَلِّمِ', 'كِتَابٌ المُعَلِّمِ', 'كِتَابُ المُعَلِّمِ', 'كِتَابُ المُعَلِّمُ'], correctIndex: 2, explanationBn: 'মুদাফে (كِتَابُ) ال ও তানভীন থাকবে না এবং মুদাফ ইলাইহি (المُعَلِّمِ) কাসরা পাবে।', explanationEn: 'Kitabu al-Mu’allimi.' },
    ],
  },
  {
    id: 'naat-manut',
    titleAr: 'النَّعْتُ وَالمَنْعُوتُ (الصِّفَةُ وَالمَوْصُوفُ)',
    titleBn: 'মাওসূফ ও সিফাত (বিশেষ্য ও বিশেষণ)',
    titleEn: 'Adjective Agreement (Na’t & Man’ut)',
    branch: 'Nahw',
    summaryBn: 'বিশেষণ (না’ত/সিফাত) তার পূর্ববর্তী বিশেষ্যকে ৪টি বিষয়ে হুবহু অনুসরণ করে।',
    explanationBn:
      'আরবিতে বিশেষ্য আগে এবং বিশেষণ পরে বসে। সিফাতকে মাওসূফের সাথে (১) ইরাব (রফা/নসব/জর), (২) লিঙ্গ (পুং/স্ত্রী), (৩) বচন (এক/দ্বি/বহু), এবং (৪) নির্দিষ্টতা (মা‘রিফাহ/নাকিরাহ) — এই ৪টি দিকেই মিলতে হয়।',
    explanationEn: 'An Arabic adjective follows the noun and agrees in case, gender, number, and definiteness.',
    rulesBn: [
      'দুটোতেই ال থাকলে বা দুটোতেই তানভীন থাকলে মাওসূফ-সিফাত হয় (যেমন: الوَلَدُ الصَّالِحُ)।',
      'প্রথমটিতে ال আর পরেরটিতে তানভীন থাকলে তা মুবতাদা-খবর হয়ে যায় (الوَلَدُ صَالِحٌ = ছেলেটি নেককার)।',
    ],
    examples: [
      { arabic: 'قَرَأْتُ كِتَابًا جَدِيدًا.', pronunciationBn: 'ক্বারা’তু কিতাবান জাদীদান।', meaningBn: 'আমি একটি নতুন বই পড়েছি।', analysisBn: 'উভয় শব্দ অনির্দিষ্ট, পুংলিঙ্গ, একবচন ও মানসুব (দুই যবর)।' },
    ],
    quiz: [
      { id: 'gq-naat-1', questionBn: 'المَدْرَسَةُ _____ (বড় বিদ্যালয়টি)—শূন্যস্থানে কোনটি বসবে?', questionEn: 'Complete "The big school": المَدْرَسَةُ _____', options: ['كَبِيرَةٌ', 'الكَبِيرُ', 'الكَبِيرَةُ', 'كَبِيرٌ'], correctIndex: 2, explanationBn: 'المَدْرَسَةُ নির্দিষ্ট, স্ত্রীলিঙ্গ ও পেশযুক্ত—তাই সিফাতও الكَبِيرَةُ হবে।', explanationEn: 'Al-Kabiratu agrees in all 4 aspects.' },
    ],
  },
  {
    id: 'mubtada-khabar',
    titleAr: 'المُبْتَدَأُ وَالخَبَرُ',
    titleBn: 'মুবতাদা ও খবর (উদ্দেশ্য ও বিধেয়)',
    titleEn: 'Mubtada & Khabar',
    branch: 'Nahw',
    summaryBn: 'নামবাচক বাক্যের দুটি প্রধান অংশ—যাকে নিয়ে কথা বলা হয় (মুবতাদা) এবং যা বলা হয় (খবর)।',
    explanationBn:
      'মুবতাদা সাধারণত নির্দিষ্ট (মা’রিফাহ) ও মারফু (পেশযুক্ত) হয়। খবর সাধারণত অনির্দিষ্ট (নাকিরাহ, তানভীনসহ) ও মারফু হয়। খবর ৩ ধরনের হতে পারে: মুফরাদ (এক শব্দ), জুমলা (বাক্য), ও শিবহু জুমলা (জার-মাজরূর বা যারফ)।',
    explanationEn: 'Mubtada is nominative subject; Khabar can be a single word, a clause, or a prepositional phrase.',
    rulesBn: [
      'উভয়েই মারফু (রফা অবস্থা) হয়।',
      'শিবহু জুমলা খবর আগে আসলে মুবতাদা পরে বসতে পারে: فِي البَيْتِ رَجُلٌ।',
    ],
    examples: [
      { arabic: 'الصَّبْرُ جَمِيلٌ.', pronunciationBn: 'আসসাবরু জামীলুন।', meaningBn: 'ধৈর্য সুন্দর।', analysisBn: 'الصَّبْرُ মুবতাদা, جَمِيلٌ খবর।' },
    ],
    quiz: [
      { id: 'gq-mk-1', questionBn: 'البَيْتُ মুবতাদা হলে তার শুদ্ধ খবর কোনটি?', questionEn: 'If البَيْتُ is Mubtada, which Khabar agrees correctly?', options: ['جَدِيدَةٌ', 'جَدِيدٌ', 'جَدِيدٍ', 'جَدِيدًا'], correctIndex: 1, explanationBn: 'البَيْتُ পুংলিঙ্গ ও মারফু, তাই খবরও جَدِيدٌ হবে।', explanationEn: 'Jadidun agrees in gender and case.' },
    ],
  },
  {
    id: 'kana-inna',
    titleAr: 'كَانَ وَأَخَوَاتُهَا وَإِنَّ وَأَخَوَاتُهَا',
    titleBn: 'কানা ও ইন্না (নাসিখ ক্রিয়া ও অব্যয়)',
    titleEn: 'Kana & Inna and Their Sisters',
    branch: 'Nahw',
    summaryBn: 'জুমলা ইসমিয়ার ওপর কানা (পেশ-যবর) এবং ইন্না (যবর-পেশ)-এর বিপরীতমুখী ইরাব প্রভাব।',
    explanationBn:
      'كَانَ (ছিল), أَصْبَحَ, لَيْسَ মুবতাদাকে পেশ দেয় এবং খবরকে যবর দেয়: كَانَ الجَوُّ جَمِيلًا। পক্ষান্তরে إِنَّ (নিশ্চয়ই), أَنَّ, لٰكِنَّ, لَعَلَّ মুবতাদাকে যবর দেয় এবং খবরকে পেশ দেয়: إِنَّ اللَّهَ غَفُورٌ।',
    explanationEn: 'Kana keeps the subject nominative and puts predicate in Nasb; Inna puts subject in Nasb and predicate in Raf’.',
    rulesBn: [
      'কানা (كَانَ) = ইসম মারফু (পেশ) + খবর মানসুব (যবর)।',
      'ইন্না (إِنَّ) = ইসম মানসুব (যবর) + খবর মারফু (পেশ)।',
    ],
    examples: [
      { arabic: 'كَانَ الطَّقْسُ بَارِدًا. | إِنَّ اللَّهَ عَلِيمٌ.', pronunciationBn: 'কানাত তাকসু বারিদান | ইন্নাল্লাহা আলীমুন', meaningBn: 'আবহাওয়া ঠাণ্ডা ছিল। | নিশ্চয়ই আল্লাহ সর্বজ্ঞ।', analysisBn: 'بَارِدًا মানসুব হয়েছে كَانَ-এর কারণে; اللَّهَ মানসুব হয়েছে إِنَّ-এর কারণে।' },
    ],
    quiz: [
      { id: 'gq-ki-1', questionBn: 'إِنَّ বসার কারণে কোন বাক্যটি শুদ্ধ?', questionEn: 'Which sentence correctly applies إِنَّ?', options: ['إِنَّ الدَّرْسُ سَهْلًا', 'إِنَّ الدَّرْسَ سَهْلٌ', 'إِنَّ الدَّرْسَ سَهْلًا', 'إِنَّ الدَّرْسُ سَهْلٌ'], correctIndex: 1, explanationBn: 'إِنَّ-এর ইসম (الدَّرْسَ) মানসুব ও খবর (سَهْلٌ) মারফু হয়।', explanationEn: 'Inna puts its Ism in Nasb and Khabar in Raf’.' },
    ],
  },
  {
    id: 'jumlah-ismiyyah',
    titleAr: 'الجُمْلَةُ الاسْمِيَّةُ',
    titleBn: 'জুমলা ইসমিয়া (নামবাচক বাক্য)',
    titleEn: 'Nominal Sentence',
    branch: 'Nahw',
    summaryBn: 'যে বাক্য ইসম (নামপদ) বা সর্বনাম দিয়ে শুরু হয়, তাকে জুমলা ইসমিয়া বলে।',
    explanationBn: 'জুমলা ইসমিয়া স্থায়িত্ব ও অবস্থা বোঝায়। এর গঠন: মুবতাদা + খবর।',
    explanationEn: 'A nominal sentence starts with a noun or pronoun and states a permanent quality or fact.',
    rulesBn: ['প্রথম শব্দ ইসম হলেই বাক্যটি জুমলা ইসমিয়া।'],
    examples: [
      { arabic: 'اللَّهُ غَفُورٌ رَحِيمٌ.', pronunciationBn: 'আল্লাহু গাফূরুন রাহীমুন।', meaningBn: 'আল্লাহ ক্ষমাশীল, অসীম দয়ালু।', analysisBn: 'اللَّهُ দিয়ে শুরু হওয়ায় এটি জুমলা ইসমিয়া।' },
    ],
    quiz: [
      { id: 'gq-ji-1', questionBn: 'নিচের কোনটি জুমলা ইসমিয়া?', questionEn: 'Which is a nominal sentence?', options: ['ذَهَبَ زَيْدٌ', 'يَقْرَأُ أَحْمَدُ', 'المَسْجِدُ قَرِيبٌ', 'اُكْتُبْ الدَّرْسَ'], correctIndex: 2, explanationBn: 'المَسْجِدُ (ইসম) দিয়ে শুরু হওয়ায় এটি জুমলা ইসমিয়া।', explanationEn: 'Starts with noun Al-Masjid.' },
    ],
  },
  {
    id: 'jumlah-filiyyah',
    titleAr: 'الجُمْلَةُ الفِعْلِيَّةُ',
    titleBn: 'জুমলা ফেলিয়া (ক্রিয়াবাচক বাক্য)',
    titleEn: 'Verbal Sentence',
    branch: 'Nahw',
    summaryBn: 'যে বাক্য ফেল (ক্রিয়াপদ) দিয়ে শুরু হয়: ফেল + ফায়েল + মাফউল।',
    explanationBn: 'জুমলা ফেলিয়া কোনো কাজের সংঘটন বোঝায়। শুরুতে ক্রিয়া বসলে কর্তা বহুবচন হলেও ক্রিয়া একবচনই থাকে।',
    explanationEn: 'Verbal sentences start with a verb and keep the verb singular even before a plural noun subject.',
    rulesBn: ['ফেল দিয়ে শুরু হলে কর্তা দ্বিবচন বা বহুবচন হলেও ফেল একবচনই থাকে।'],
    examples: [
      { arabic: 'فَتَحَ المُعَلِّمُ البَابَ.', pronunciationBn: 'ফাতাহাল মু‘আল্লিমুল বাবা।', meaningBn: 'শিক্ষক দরজাটি খুলেছেন।', analysisBn: 'فَتَحَ ক্রিয়া দিয়ে শুরু হওয়ায় এটি জুমলা ফেলিয়া।' },
    ],
    quiz: [
      { id: 'gq-jf-1', questionBn: 'বহুবচন কর্তার আগে ক্রিয়া বসলে ক্রিয়ার বচন কী হয়?', questionEn: 'Verb number before a plural subject?', options: ['বহুবচন', 'দ্বিবচন', 'একবচন', 'যেকোনোটি'], correctIndex: 2, explanationBn: 'জুমলা ফেলিয়ায় শুরুতে ক্রিয়া সর্বদা একবচন থাকে।', explanationEn: 'Initial verb stays singular.' },
    ],
  },
  {
    id: 'fail-maful',
    titleAr: 'الفَاعِلُ وَالمَفْعُولُ بِهِ',
    titleBn: 'ফায়েল (কর্তা) ও মাফউল বিহি (কর্ম)',
    titleEn: 'Fa’il & Maf’ul Bihi',
    branch: 'Nahw',
    summaryBn: 'ক্রিয়াবাচক বাক্যে যে কাজটি করে সে ফায়েল (পেশ পায়), আর যার ওপর কাজটি হয় সে মাফউল (যবর পায়)।',
    explanationBn: 'ফায়েল সর্বদা মারফু (পেশ) এবং মাফউল বিহি সর্বদা মানসুব (যবর) হয়।',
    explanationEn: 'Subject takes Raf’ (Damma) and direct object takes Nasb (Fatha).',
    rulesBn: ['ফায়েল = পেশ; মাফউল বিহি = যবর।'],
    examples: [
      { arabic: 'كَتَبَ الطَّالِبُ الدَّرْسَ.', pronunciationBn: 'কাতাবাত তালিবুদ দারসা।', meaningBn: 'ছাত্রটি পাঠটি লিখেছে।', analysisBn: 'الطَّالِبُ ফায়েল (পেশ), الدَّرْسَ মাফউল বিহি (যবর)।' },
    ],
    quiz: [
      { id: 'gq-fm-1', questionBn: 'شَرِبَ الوَلَدُ المَاءَ বাক্যে المَاءَ শব্দে যবর কেন হয়েছে?', questionEn: 'Why does المَاءَ have Fatha?', options: ['এটি ফায়েল', 'এটি মুবতাদা', 'এটি মাফউল বিহি', 'হরফে জারের পর'], correctIndex: 2, explanationBn: 'পানি হলো কর্ম (মাফউল বিহি), তাই যবর হয়েছে।', explanationEn: 'It is the direct object.' },
    ],
  },
  {
    id: 'fil-madi',
    titleAr: 'الفِعْلُ المَاضِي وَتَصْرِيفُهُ',
    titleBn: 'ফেলে মাদি (অতীত কাল ও ১৪ সীগাহ গর্দান)',
    titleEn: 'Past Tense Conjugation',
    branch: 'Sarf',
    summaryBn: 'অতীত কালের ক্রিয়া ও সর্বনাম ভেদে ১৪টি পূর্ণ রূপান্তর (كَتَبَ থেকে كَتَبْنَا)।',
    explanationBn:
      'মাদি ক্রিয়ার ৩য় পুরুষ: كَتَبَ (সে পুং), كَتَبَا (তারা ২ পুং), كَتَبُوا (তারা বহু পুং), كَتَبَتْ (সে স্ত্রী), كَتَبَتَا (তারা ২ স্ত্রী), كَتَبْنَ (তারা বহু স্ত্রী)। ২য় পুরুষ: كَتَبْتَ, كَتَبْتُمَا, كَتَبْتُمْ, كَتَبْتِ, كَتَبْتُمَا, كَتَبْتُنَّ। ১ম পুরুষ: كَتَبْتُ (আমি), كَتَبْنَا (আমরা)।',
    explanationEn: 'Past tense conjugates across 14 person/gender/number forms via suffixes.',
    rulesBn: [
      'মাদি ক্রিয়া সর্বদা মাবনী (স্থির শেষ স্বর)।',
      'جمع مؤنث غائب (كَتَبْنَ) এবং পরের সব রূপে মূল শেষ অক্ষরে সুকূন হয়।',
    ],
    examples: [
      { arabic: 'ذَهَبَ — ذَهَبُوا — ذَهَبَتْ — ذَهَبْتُ — ذَهَبْنَا', pronunciationBn: 'যাহাবা — যাহাবূ — যাহাবাত — যাহাবতু — যাহাবনা', meaningBn: 'সে গেছে — তারা গেছে — সে (স্ত্রী) গেছে — আমি গেছি — আমরা গেছি', analysisBn: 'মূলধাতু ذ ه ب থেকে মাদি গর্দান।' },
    ],
    quiz: [
      { id: 'gq-madi-1', questionBn: '"তোমরা সবাই (পুরুষ) লিখেছ"—কোনটি সঠিক?', questionEn: 'Which means "you all (m.pl) wrote"?', options: ['كَتَبُوا', 'كَتَبْتُمْ', 'كَتَبْنَا', 'كَتَبْتُنَّ'], correctIndex: 1, explanationBn: '২য় পুরুষ বহুবচন পুংলিঙ্গে ـتُمْ প্রত্যয় যুক্ত হয়ে كَتَبْتُمْ হয়।', explanationEn: '-tum suffix is masculine plural "you".' },
    ],
  },
  {
    id: 'fil-mudari',
    titleAr: 'الفِعْلُ المُضَارِعُ (الرَّفْعُ وَالنَّصْبُ وَالجَزْمُ)',
    titleBn: 'ফেলে মুদারি (বর্তমান/ভবিষ্যৎ কাল ও রফা-নসব-জযম)',
    titleEn: 'Present Tense & Moods',
    branch: 'Sarf',
    summaryBn: 'অ-ন-ইয়-ত আলামতসহ ১৪টি মুদারি সীগাহ এবং নসব (أَنْ/لَنْ) ও জযম (لَمْ) পরিবর্তন।',
    explanationBn:
      'মুদারির শুরুতে أَ، نَ، يَ، تَ থাকে: يَكْتُبُ، يَكْتُبَانِ، يَكْتُبُونَ، تَكْتُبُ، تَكْتُبَانِ، يَكْتُبْنَ، تَكْتُبُ، تَكْتُبَانِ، تَكْتُبُونَ، تَكْتُبِينَ، تَكْتُبَانِ، تَكْتُبْنَ، أَكْتُبُ، نَكْتُبُ। নসব (لَنْ) এলে শেষে যবর ও আফআলে খামসার নূন পড়ে যায়; জযম (لَمْ) এলে সুকূন ও নূন পড়ে যায়।',
    explanationEn: 'Mudari takes prefixes أ ن ي ت and shifts endings for Raf’ (u), Nasb (a), and Jazm (sukun).',
    rulesBn: [
      'يَكْتُبْنَ ও تَكْتُبْنَ কখনো পরিবর্তিত হয় না (নূনে নিসওয়া)।',
      'لَنْ يَذْهَبُوا (তারা কখনো যাবে না — নূন পড়ে গেছে)।',
    ],
    examples: [
      { arabic: 'يَدْرُسُ ← لَنْ يَدْرُسَ ← لَمْ يَدْرُسْ', pronunciationBn: 'ইয়াদরুসু ← লান ইয়াদরুসা ← লাম ইয়াদরুস', meaningBn: 'সে পড়ে ← সে কখনো পড়বে না ← সে পড়েনি', analysisBn: 'রফা (পেশ) → নসব (যবর) → জযম (সুকূন)।' },
    ],
    quiz: [
      { id: 'gq-mud-1', questionBn: 'لَنْ يَكْتُبَ বাক্যে يَكْتُبَ শেষে যবর কেন?', questionEn: 'Why does يَكْتُبَ end in Fatha after لَنْ?', options: ['লান হরফে জযম', 'লান হরফে নসব', 'লান হরফে জার', 'এটি মাদি'], correctIndex: 1, explanationBn: 'لَنْ হরফে নসব হওয়ায় ফেলে মুদারিকে যবর (নসব) দেয়।', explanationEn: 'Lan is a subjunctive particle.' },
    ],
  },
  {
    id: 'amr-nahi',
    titleAr: 'الأَمْرُ وَالنَّهْيُ',
    titleBn: 'ফেলে আমর (আদেশ) ও নাহী (নিষেধ)',
    titleEn: 'Imperative & Prohibition',
    branch: 'Sarf',
    summaryBn: 'মুদারি ২য় পুরুষ থেকে জযমের মাধ্যমে আদেশ (اِفْعَلْ) এবং لَا দিয়ে নিষেধ (لَا تَفْعَلْ) গঠন।',
    explanationBn:
      'আদেশ বানাতে ২য় পুরুষ মুদারির শুরু থেকে تَ বাদ দিয়ে শেষে জযম দিন; পরের অক্ষরে সুকূন থাকলে শুরুতে হামযাতুল ওয়াসল আনুন (আইন-কালেমায় পেশ থাকলে উ, নতুবা ই): تَكْتُبُ ← اُكْتُبْ (লেখো), تَفْتَحُ ← اِفْتَحْ (খোলো)। নিষেধ: لَا تَكْتُبْ (লিখো না)।',
    explanationEn: 'Drop the ت prefix from 2nd-person Mudari and apply Jazm; add Hamzat al-Wasl if needed. Prohibition uses لَا + Jazm.',
    rulesBn: [
      'আদেশের হামযায় পেশ হয় শুধু আইন-কালেমায় পেশ থাকলে (যেমন: اُنْصُرْ, اُدْخُلْ)।',
      'নারীকে আদেশ করতে শেষে ইয়া যোগ হয়: اِقْرَئِي (পড়ো-স্ত্রী)।',
    ],
    examples: [
      { arabic: 'اُدْخُلْ بِسَلَامٍ. | لَا تَحْزَنْ.', pronunciationBn: 'উদখুল বিসালামিন | লা তাহযান', meaningBn: 'নিরাপদে প্রবেশ করো। | দুঃখ করো না।', analysisBn: 'اُدْخُلْ আমর, لَا تَحْزَنْ নাহী।' },
    ],
    quiz: [
      { id: 'gq-an-1', questionBn: 'يَنْصُرُ থেকে সঠিক ফেলে আমর কোনটি?', questionEn: 'What is the imperative of يَنْصُرُ?', options: ['اِنْصُرْ', 'اُنْصُرْ', 'نَصَرْ', 'لَا تَنْصُرْ'], correctIndex: 1, explanationBn: 'আইন-কালেমায় (صُ) পেশ থাকায় হামযায় পেশ হবে: اُنْصُرْ।', explanationEn: 'Since the middle vowel is Damma, the prefix vowel is u: Unsur.' },
    ],
  },
  {
    id: 'majhul',
    titleAr: 'المَبْنِيُّ لِلْمَعْلُومِ وَالمَجْهُولِ',
    titleBn: 'মা‘রূফ ও মাজহূল (সক্রিয় ও কর্মবাচ্য)',
    titleEn: 'Active & Passive Voice',
    branch: 'Sarf',
    summaryBn: 'কর্তা উল্লেখ না থাকলে ক্রিয়াকে মাজহূল ও কর্মকে নায়েবে ফায়েল (পেশযুক্ত) করার নিয়ম।',
    explanationBn:
      'মাদিতে: শেষ অক্ষরের আগের অক্ষরে যের এবং তার আগের সব হারাকাতে পেশ (فَعَلَ ← فُعِلَ, যেমন كُتِبَ = লেখা হয়েছে)। মুদারিতে: শুরুতে পেশ এবং শেষের আগের অক্ষরে যবর (يَفْعَلُ ← يُفْعَلُ, যেমন يُكْتَبُ = লেখা হয়)।',
    explanationEn: 'Madi passive: u-i-a (كُتِبَ). Mudari passive: u-a (يُكْتَبُ). The object becomes Na’ib al-Fa’il (nominative).',
    rulesBn: [
      'মাজহূলের পর কর্মটি নায়েবে ফায়েল হয়ে মারফু (পেশ) পায়: كُتِبَ الدَّرْسُ (পাঠটি লেখা হয়েছে)।',
    ],
    examples: [
      { arabic: 'خُلِقَ الإِنْسَانُ ضَعِيفًا (النساء ٤:٢٨)', pronunciationBn: 'খুলিকাল ইনসানু দা‘ঈফান', meaningBn: 'মানুষকে দুর্বল করে সৃষ্টি করা হয়েছে।', analysisBn: 'خُلِقَ ফেলে মাদি মাজহূল, الإِنْسَانُ নায়েবে ফায়েল।' },
    ],
    quiz: [
      { id: 'gq-maj-1', questionBn: 'فَتَحَ-এর মাজহূল রূপ কোনটি?', questionEn: 'What is the passive past of فَتَحَ?', options: ['يُفْتَحُ', 'فُتِحَ', 'فَاتِحٌ', 'مَفْتُوحٌ'], correctIndex: 1, explanationBn: 'মাদি মাজহূল "ফু‘ইলা" ওজনে فُتِحَ (খোলা হয়েছে)।', explanationEn: 'Futiha follows fu’ila.' },
    ],
  },
  {
    id: 'haft-aqsam',
    titleAr: 'أَقْسَامُ الفِعْلِ (الصَّحِيحُ وَالمُعْتَلُّ)',
    titleBn: 'হাফতে আকসাম (সহীহ ও মু‘তাল ক্রিয়ার ৭ প্রকার)',
    titleEn: 'Sound & Weak Verb Classes',
    branch: 'Sarf',
    summaryBn: 'হামযা, তাশদীদ ও দুর্বল হরফ (و، ا، ي) অনুযায়ী ক্রিয়ার ৭টি শ্রেণিবিভাগ।',
    explanationBn:
      'সহীহ ৩ প্রকার: (১) সালিম (كتب), (২) মাহমূয (হামযাযুক্ত: أَخَذَ, سَأَلَ, قَرَأَ), (৩) মুদা‘আফ (একই হরফ দুবার: مَدَّ, حَبَّ)। মু‘তাল ৪ প্রকার: (৪) মিসাল (শুরুতে দুর্বল: وَعَدَ), (৫) আজওয়াফ (মাঝে দুর্বল: قَالَ, بَاعَ), (৬) নাকিস (শেষে দুর্বল: دَعَا, هَدَى), (৭) লাফীফ (দুটি দুর্বল অক্ষর: وَقَى)।',
    explanationEn: 'The 7 verb classes: Salim, Mahmuz, Muda’af, Mithal, Ajwaf, Naqis, Lafif.',
    rulesBn: [
      'আজওয়াফ ক্রিয়ায় (যেমন قَالَ) আমর করলে মাঝের আলিফ পড়ে যায়: قُلْ।',
      'মিসাল ক্রিয়ায় (যেমন وَعَدَ) মুদারিতে ওয়াও পড়ে যায়: يَعِدُ।',
    ],
    examples: [
      { arabic: 'قَالَ يَقُولُ قُلْ | وَعَدَ يَعِدُ عِدْ', pronunciationBn: 'কালা ইয়াকূলু কুল | ওয়া‘আদা ইয়া‘ইদু ইদ', meaningBn: 'বলেছে-বলে-বলো | ওয়াদা করেছে-করে-করো', analysisBn: 'যথাক্রমে আজওয়াফ ও মিসাল ক্রিয়ার রূপান্তর।' },
    ],
    quiz: [
      { id: 'gq-ha-1', questionBn: 'قَالَ (বলেছে) কোন প্রকারের ক্রিয়া?', questionEn: 'Which class does قَالَ belong to?', options: ['সালিম', 'মিসাল', 'আজওয়াফ', 'নাকিস'], correctIndex: 2, explanationBn: 'মূলধাতু ق و ل-এর মাঝের অক্ষর দুর্বল (و) হওয়ায় এটি আজওয়াফ।', explanationEn: 'Weak middle radical = Ajwaf.' },
    ],
  },
  {
    id: 'irab',
    titleAr: 'الإِعْرَابُ وَالبِنَاءُ',
    titleBn: 'ইরাব ও বিনা (রফা, নসব, জর, জযম)',
    titleEn: 'I’rab & Mabni',
    branch: 'Nahw',
    summaryBn: 'বাক্যে অবস্থানের কারণে শব্দের শেষ অক্ষরের অবস্থা: মূল ও ফার‘ঈ (অক্ষরগত) ইরাব।',
    explanationBn:
      'মূল হরকতগত ইরাব: রফা (ُ), নসব (َ), জর (ِ), জযম (ْ)। অক্ষরগত (ফার‘ঈ) ইরাব: দ্বিবচনে আলিফ/ইয়া (انِ / يْنِ), জমে মুজাক্কার সালিমে ওয়াও/ইয়া (ونَ / ينَ), আসমায়ে খামসাতে (أَبُوكَ / أَبَاكَ / أَبِيكَ)।',
    explanationEn: 'Primary I’rab uses vowels; secondary I’rab uses letters (dual, sound masculine plural, 5 nouns).',
    rulesBn: ['জর শুধু ইসমের, জযম শুধু ফেলের।'],
    examples: [
      { arabic: 'جَاءَ المُسْلِمُونَ — رَأَيْتُ المُسْلِمِينَ', pronunciationBn: 'জা-আল মুসলিমূনা — রাআইতুল মুসলিমীনা', meaningBn: 'মুসলিমরা এসেছে — আমি মুসলিমদের দেখেছি', analysisBn: 'বহুবচনে রফা ওয়াও দিয়ে এবং নসব/জর ইয়া দিয়ে হয়েছে।' },
    ],
    quiz: [
      { id: 'gq-irab-1', questionBn: 'কোন ইরাব শুধুমাত্র ইসমের জন্য নির্ধারিত?', questionEn: 'Which applies only to nouns?', options: ['রফা', 'নসব', 'জর (কাসরা)', 'জযম'], correctIndex: 2, explanationBn: 'জর বা কাসরা শুধুমাত্র ইসমের বৈশিষ্ট্য।', explanationEn: 'Jarr belongs exclusively to nouns.' },
    ],
  },
  {
    id: 'mamnu-min-sarf',
    titleAr: 'المَمْنُوعُ مِنَ الصَّرْفِ وَالأَسْمَاءُ الخَمْسَةُ',
    titleBn: 'গাইরে মুনসারিফ ও আসমায়ে খামসাহ',
    titleEn: 'Diptotes & The Five Nouns',
    branch: 'Nahw',
    summaryBn: 'যেসব ইসম তানভীন ও কাসরা নেয় না (গাইরে মুনসারিফ) এবং أَبٌ، أَخٌ জাতীয় ৫টি বিশেষ ইসম।',
    explanationBn:
      'গাইরে মুনসারিফ (যেমন: مَسَاجِدُ, إِبْرَاهِيمُ, عَائِشَةُ, مَكَّةُ, أَحْمَدُ) কখনো তানভীন নেয় না এবং জরের অবস্থায় কাসরার বদলে ফাতহা (যবর) নেয়: إِلَى مَكَّةَ। আর আসমায়ে খামসাহ (أَبُوكَ، أَخُوكَ، حَمُوكَ، فُوكَ، ذُو مَالٍ) ইযাফাত হলে ওয়াও/আলিফ/ইয়া দ্বারা ইরাব পায়।',
    explanationEn: 'Diptotes take Fatha instead of Kasra in genitive unless prefixed by Al- or Mudaf; Five Nouns decline by Waw, Alif, Ya.',
    rulesBn: [
      'فِي مَسَاجِدَ كَثِيرَةٍ (মাসাজিদা-তে যবর হয়েছে জর অবস্থায়)।',
      'أَبُوكَ (রফা), أَبَاكَ (নসব), أَبِيكَ (জর)।',
    ],
    examples: [
      { arabic: 'سَافَرْتُ إِلَى مَكَّةَ المُكَرَّمَةِ.', pronunciationBn: 'সাফারতু ইলা মাক্কাতাল মুকাররামাতি।', meaningBn: 'আমি মক্কা মুকাররামায় সফর করেছি।', analysisBn: 'مَكَّةَ গাইরে মুনসারিফ হওয়ায় إِلَى-এর পরও যবর হয়েছে।' },
    ],
    quiz: [
      { id: 'gq-mms-1', questionBn: 'فِي _____ (মসজিদসমূহে)—শূন্যস্থানে কোনটি শুদ্ধ?', questionEn: 'Which is correct after فِي for "mosques"?', options: ['مَسَاجِدٍ', 'مَسَاجِدُ', 'مَسَاجِدَ', 'مَسَاجِدِ'], correctIndex: 2, explanationBn: 'مَسَاجِدُ গাইরে মুনসারিফ হওয়ায় জর অবস্থায় ফাতহা (مَسَاجِدَ) নেয়।', explanationEn: 'Diptote takes Fatha in genitive.' },
    ],
  },
  {
    id: 'damair',
    titleAr: 'الضَّمَائِرُ (المُنْفَصِلَةُ وَالمُتَّصِلَةُ)',
    titleBn: 'বিচ্ছিন্ন ও সংযুক্ত সর্বনামসমূহ',
    titleEn: 'Detached & Attached Pronouns',
    branch: 'Nahw',
    summaryBn: '১৪টি দমীরে মুনফাসিল (هُوَ، أَنَا) এবং সংযুক্ত দমীর (ـهُ، ـكَ، ـي، ـنَا)।',
    explanationBn: 'সংযুক্ত সর্বনাম ইসমের সাথে যুক্ত হলে মালিকানা বোঝায় (كِتَابِي), ক্রিয়ার সাথে যুক্ত হলে কর্ম বোঝায় (سَمِعْتُهُ), আর হরফে জারের সাথে যুক্ত হলে মাজরূর হয় (لَكَ)।',
    explanationEn: 'Attached pronouns indicate possession on nouns and object on verbs/prepositions.',
    rulesBn: ['১৪টি সর্বনাম: গায়েব ৬টি, হাজির ৬টি, মুতাকাল্লিম ২টি।'],
    examples: [
      { arabic: 'قَلَمِي — قَلَمُكَ — قَلَمُهُ — قَلَمُهَا', pronunciationBn: 'কালামী — কালামুকা — কালামুহু — কালামুহা', meaningBn: 'আমার কলম — তোমার কলম — তার কলম — তার (স্ত্রী) কলম', analysisBn: 'ইসমের সাথে সংযুক্ত সর্বনাম।' },
    ],
    quiz: [
      { id: 'gq-dam-1', questionBn: '"আমাদের ঘর"-এর সঠিক আরবি কোনটি?', questionEn: 'How do you say "our house"?', options: ['بَيْتِي', 'بَيْتُكَ', 'بَيْتُنَا', 'بَيْتُهُمْ'], correctIndex: 2, explanationBn: 'ـنَا প্রত্যয়টি "আমাদের" বোঝায়।', explanationEn: '-na means our.' },
    ],
  },
  {
    id: 'harf',
    titleAr: 'حُرُوفُ الجَرِّ وَالعَطْفِ وَالاسْتِفْهَامِ',
    titleBn: 'হরফে জার, আতফ ও ইস্তিফহাম',
    titleEn: 'Prepositions, Conjunctions & Interrogatives',
    branch: 'Nahw',
    summaryBn: 'বাক্য সংযোগ ও প্রশ্ন তৈরির মূল অব্যয়সমূহ।',
    explanationBn:
      'হরফে জার: مِنْ (থেকে), إِلَى (দিকে), عَنْ (সম্পর্কে), عَلَى (উপর), فِي (ভেতরে), بِ (দ্বারা), كَ (মতো), لِ (জন্য)। হরফে আতফ: وَ, فَ, ثُمَّ, أَوْ, لٰكِنْ। প্রশ্নবোধক: هَلْ, أَ, مَا, مَنْ, أَيْنَ, مَتَى, كَيْفَ, كَمْ, لِمَاذَا।',
    explanationEn: 'Prepositions govern genitive; conjunctions link clauses; interrogatives form questions.',
    rulesBn: ['সব হরফ মাবনী এবং অর্থের সূক্ষ্ম সম্পর্ক তৈরি করে।'],
    examples: [
      { arabic: 'الطَّالِبُ فِي الفَصْلِ.', pronunciationBn: 'আত্তালিবু ফিল ফাসলি।', meaningBn: 'ছাত্রটি শ্রেণিকক্ষের মধ্যে আছে।', analysisBn: 'فِي হরফে জার।' },
    ],
    quiz: [
      { id: 'gq-harf-1', questionBn: '"কেন" অর্থে কোন প্রশ্নবোধক শব্দ ব্যবহৃত হয়?', questionEn: 'Which word means "why"?', options: ['أَيْنَ', 'مَتَى', 'لِمَاذَا', 'كَمْ'], correctIndex: 2, explanationBn: 'لِمَاذَا অর্থ কেন; أَيْنَ কোথায়; مَتَى কখন; كَمْ কত।', explanationEn: 'Limadha means why.' },
    ],
  },
  {
    id: 'adad-madud',
    titleAr: 'العَدَدُ وَالمَعْدُودُ',
    titleBn: 'আদাদ ও মা‘দূদ (সংখ্যা ও গণনীয় বস্তুর নিয়ম)',
    titleEn: 'Arabic Numbers & Counted Nouns',
    branch: 'Nahw',
    summaryBn: '১–২, ৩–১০, ১১–১২, ১৩–১৯ এবং ২০–১০০ গণনার বিশেষ লিঙ্গ-বচন ও ইরাব নিয়ম।',
    explanationBn:
      '১–২: মা’দূদ আগে বসে ও সংখ্যা বিশেষণ হয়ে মেলে (كِتَابٌ وَاحِدٌ)। ৩–১০: সংখ্যা বিপরীত লিঙ্গের হয় এবং মা’দূদ বহুবচন মাজরূর হয় (ثَلَاثَةُ كُتُبٍ — কিতাব পুংলিঙ্গ তাই ৩ স্ত্রীলিঙ্গ ثَلَاثَةُ)। ১১–৯৯: মা’দূদ একবচন মানসুব (তাময়ীয) হয় (أَحَدَ عَشَرَ كَوْكَبًا)।',
    explanationEn: '3–10 take opposite gender + plural genitive; 11–99 take singular accusative.',
    rulesBn: [
      '৩ থেকে ১০ পর্যন্ত সংখ্যা ও গণিতব্য বস্তুর একবচনের লিঙ্গ উল্টো হয়!',
      '১১–৯৯ পর্যন্ত গণিতব্য বস্তু সর্বদা একবচন যবর (মানসুব) হয়।',
    ],
    examples: [
      { arabic: 'خَمْسَةُ أَقْلَامٍ | خَمْسُ سَاعَاتٍ | عِشْرُونَ كِتَابًا', pronunciationBn: 'খামসাতু আকলামিন | খামসু সাআতিন | ইশরূনা কিতাবান', meaningBn: '৫টি কলম | ৫টি ঘড়ি | ২০টি বই', analysisBn: 'قَلَمٌ পুংলিঙ্গ তাই خَمْسَةُ; سَاعَةٌ স্ত্রীলিঙ্গ তাই خَمْسُ; ২০-এর পর কিতাবান মানসুব।' },
    ],
    quiz: [
      { id: 'gq-adad-1', questionBn: '"চারটি বই" (كِتَابٌ পুংলিঙ্গ)—সঠিক আরবি কোনটি?', questionEn: 'How do you say "four books"?', options: ['أَرْبَعُ كُتُبٍ', 'أَرْبَعَةُ كُتُبٍ', 'أَرْبَعَةُ كِتَابًا', 'أَرْبَعٌ كِتَابٍ'], correctIndex: 1, explanationBn: 'كِتَابٌ পুংলিঙ্গ হওয়ায় সংখ্যা ৩–১০ এর নিয়মে উল্টো লিঙ্গ أَرْبَعَةُ ও বহুবচন মাজরূর كُتُبٍ হবে।', explanationEn: '3–10 reverse gender with plural genitive.' },
    ],
  },
  {
    id: 'afal',
    titleAr: 'أَبْوَابُ الأَفْعَالِ المَزِيدَةِ (الثُّلَاثِيُّ المَزِيدُ)',
    titleBn: 'মাযীদ ফীহ বাবসমূহ (বাব ২ থেকে ১০)',
    titleEn: 'Augmented Verb Forms (II–X)',
    branch: 'Sarf',
    summaryBn: 'ত্রিবর্ণ মূলধাতুতে অক্ষর বাড়িয়ে নতুন অর্থ ও বাব গঠন (তাফঈল, মুফাআলাহ, ইফআল, ইস্তিফআল)।',
    explanationBn:
      'বাব ২ (فَعَّلَ): عَلَّمَ (শেখাল)। বাব ৩ (فَاعَلَ): جَاهَدَ (সাধনা করল)। বাব ৪ (أَفْعَلَ): أَسْلَمَ (আত্মসমর্পণ করল)। বাব ৫ (تَفَعَّلَ): تَعَلَّمَ (শিখল)। বাব ৮ (اِفْتَعَلَ): اِجْتَهَدَ (চেষ্টা করল)। বাব ১০ (اِسْتَفْعَلَ): اِسْتَغْفَرَ (ক্ষমা চাইল)।',
    explanationEn: 'Forms II–X systematically add prefixes/infixes to express causative, reciprocal, reflexive, or seeking meanings.',
    rulesBn: [
      'عَلِمَ (জেনেছে) → عَلَّمَ (শিখিয়েছে) → تَعَلَّمَ (নিজে শিখেছে)।',
    ],
    examples: [
      { arabic: 'غَفَرَ ← اِسْتَغْفَرَ | نَزَلَ ← أَنْزَلَ / نَزَّلَ', pronunciationBn: 'গাফারা ← ইস্তাগফারা | নাযালা ← আনযালা / নাযযালা', meaningBn: 'ক্ষমা করেছে ← ক্ষমা চেয়েছে | নেমেছে ← অবতীর্ণ করেছেন', analysisBn: 'বাব পরিবর্তনে অর্থের সূক্ষ্ম পরিবর্তন।' },
    ],
    quiz: [
      { id: 'gq-afal-1', questionBn: 'اِسْتَغْفَرَ কোন অর্থ প্রকাশ করে?', questionEn: 'What does Form X (اِسْتَغْفَرَ) express?', options: ['ক্ষমা চেয়েছে', 'ক্ষমা করিয়েছে', 'ক্ষমা ভুলেছে', 'কোনোটিই নয়'], correctIndex: 0, explanationBn: 'اسْتَفْعَلَ ওজন সাধারণত চাওয়া বা প্রার্থনা বোঝায়।', explanationEn: 'Form X conveys seeking.' },
    ],
  },
  {
    id: 'hal-tamyiz-mafail',
    titleAr: 'الحَالُ وَالتَّمْيِيزُ وَالمَفَاعِيلُ',
    titleBn: 'হাল, তাময়ীয ও পাঁচ প্রকার মাফউল (মানসুবাত)',
    titleEn: 'Hal, Tamyiz & Five Accusatives',
    branch: 'Nahw',
    summaryBn: 'বাক্যে অবস্থা (হাল), অস্পষ্টতা দূর করা (তাময়ীয), এবং কারণ/সময়/স্থান/গুরুত্ব বোঝাতে মানসুব পদের ব্যবহার।',
    explanationBn:
      'পাঁচ মাফউল সর্বদা মানসুব (যবর): (১) মাফউল বিহি (কর্ম), (২) মাফউল মুতলাক (ফাহিমতু ফাহমান = ভালোভাবে বুঝেছি), (৩) মাফউল লি-আজলিহি (কারণ: জিতু তালাবান লিল-ইলমি = জ্ঞান অন্বেষণে এসেছি), (৪) মাফউল ফীহি/যারফ (সময়/স্থান: সাবাহান, আমামা), (৫) মাফউল মাআহু। এছাড়া হাল কাজের সময় অবস্থা বোঝায় (দাখালা মুবতাসিমান = হাসিমুখে প্রবেশ করল)।',
    explanationEn: 'Mansubat include the five Maf’uls, Hal (circumstance), and Tamyiz (specification).',
    rulesBn: ['হাল সর্বদা নাকিরাহ মানসুব হয় এবং ছাহেবে হাল মা‘রিফাহ হয়।'],
    examples: [
      { arabic: 'رَجَعَ الطَّالِبُ مَسْرُورًا.', pronunciationBn: 'রাজা‘আত তালিবু মাসরূরান।', meaningBn: 'ছাত্রটি আনন্দিত অবস্থায় ফিরেছে।', analysisBn: 'مَسْرُورًا হলো হাল (যবর), যা ফেরার সময় ছাত্রটির অবস্থা বোঝাচ্ছে।' },
    ],
    quiz: [
      { id: 'gq-htm-1', questionBn: 'جَاءَ زَيْدٌ رَاكِبًا বাক্যে رَاكِبًا কী পদ?', questionEn: 'What is رَاكِبًا in جَاءَ زَيْدٌ رَاكِبًا?', options: ['ফায়েল', 'মুবতাদা', 'হাল (অবস্থাবাচক)', 'জার-মাজরূর'], correctIndex: 2, explanationBn: 'যায়েদ আরোহী অবস্থায় এসেছে—رَاكِبًا অবস্থা বোঝানোয় এটি হাল।', explanationEn: 'Rakiban describes Zayd’s state upon arrival (Hal).' },
    ],
  },
  {
    id: 'jumoo',
    titleAr: 'الجُمُوعُ (السَّالِمُ وَالتَّكْسِيرُ)',
    titleBn: 'বহুবচনসমূহ (সালিম ও জময়ে তাকসীর)',
    titleEn: 'Arabic Plurals',
    branch: 'Sarf',
    summaryBn: 'একবচন, দ্বিবচন ও তিন প্রকার বহুবচন: মুজাক্কার সালিম, মুয়ান্নাস সালিম ও তাকসীর।',
    explanationBn:
      'দ্বিবচন: ـَانِ / ـَيْنِ। জমে মুজাক্কার সালিম: ـُونَ / ـِينَ। জমে মুয়ান্নাস সালিম: ـَاتٌ। জমে তাকসীর (ভগ্ন বহুবচন): كِتَابٌ → كُتُبٌ, قَلَمٌ → أَقْلَامٌ, مَسْجِدٌ → مَسَاجِدُ।',
    explanationEn: 'Dual (-ani/-ayni), sound plurals (-una/-at), and broken plurals.',
    rulesBn: ['অচেতন বস্তুর বহুবচন (যেমন كُتُبٌ) ব্যাকরণে একবচন স্ত্রীলিঙ্গ হিসেবে গণ্য হয়।'],
    examples: [
      { arabic: 'هٰذِهِ كُتُبٌ جَدِيدَةٌ.', pronunciationBn: 'হাযিহি কুতুবুন জাদীদাতুন।', meaningBn: 'এগুলো নতুন বই।', analysisBn: 'অচেতন বহুবচন হওয়ায় هٰذِهِ ও جَدِيدَةٌ একবচন স্ত্রীলিঙ্গ এসেছে।' },
    ],
    quiz: [
      { id: 'gq-jum-1', questionBn: '"নতুন বইসমূহ"-এর সঠিক আরবি বাক্যাংশ কোনটি?', questionEn: 'Which means "new books"?', options: ['كُتُبٌ جَدِيدُونَ', 'كُتُبٌ جَدِيدٌ', 'كُتُبٌ جَدِيدَةٌ', 'كُتُبٌ جَدِيدَاتٌ'], correctIndex: 2, explanationBn: 'অচেতন বহুবচনের বিশেষণ একবচন স্ত্রীলিঙ্গ (جَدِيدَةٌ) হয়।', explanationEn: 'Non-human plurals take feminine singular adjectives.' },
    ],
  },
  {
    id: 'balaghah',
    titleAr: 'عِلْمُ البَلَاغَةِ (المَعَانِي وَالبَيَانُ وَالبَدِيعُ)',
    titleBn: 'ইলমুল বালাগাহ (অলংকারশাস্ত্র পরিচিতি)',
    titleEn: 'Introduction to Arabic Rhetoric (Balaghah)',
    branch: 'Nahw',
    summaryBn: 'কুরআন ও ধ্রুপদী সাহিত্যের সৌন্দর্য অনুধাবনের ৩টি স্তম্ভ: মা‘আনী, বয়ান ও বাদী।',
    explanationBn:
      'ইলমুল মা‘আনী: অবস্থা বুঝে কথা বলা (যেমন তাকদীম, কাসর/ইন্নামা)। ইলমুল বয়ান: উপমা (তাশবীহ) ও রূপক (ইস্তি‘আরা)। ইলমুল বাদী: শব্দের বিপরীতমুখী সৌন্দর্য (তিবাক—যেমন لَيْلٌ ও نَهَارٌ) ও ধ্বনিসাম্য (জিনাস)।',
    explanationEn: 'Balaghah has three branches: Ma’ani (situational meaning), Bayan (imagery/metaphor), and Badi’ (ornamentation).',
    rulesBn: [
      'তাশবীহে ৪টি অংশ থাকে: মুশাব্বাহ, মুশাব্বাহ বিহি, আদাতুত তাশবীহ ও ওয়াজহুশ শাবাহ।',
    ],
    examples: [
      { arabic: 'العِلْمُ كَالنُّورِ فِي الهِدَايَةِ.', pronunciationBn: 'আল-ইলমু কাননূরি ফিল হিদায়াতি।', meaningBn: 'পথ দেখানোর ক্ষেত্রে জ্ঞান আলোর মতো।', analysisBn: 'তাশবীহ বা উপমার পূর্ণ উদাহরণ।' },
    ],
    quiz: [
      { id: 'gq-bal-1', questionBn: 'العِلْمُ كَالنُّورِ (জ্ঞান আলোর মতো)—এখানে কিসের ব্যবহার হয়েছে?', questionEn: 'Which rhetorical device is used in العِلْمُ كَالنُّورِ?', options: ['তিবাক', 'তাশবীহ (উপমা)', 'নাহী', 'মাজহূল'], correctIndex: 1, explanationBn: 'كَ (মতো) দিয়ে জ্ঞানকে আলোর সাথে তুলনা করা হয়েছে—এটি তাশবীহ।', explanationEn: 'Ka- creates a simile (Tashbih).' },
    ],
  },
  {
    id: 'mabadi-qawaid',
    titleAr: 'خُلَاصَةُ مَبَادِئِ العَرَبِيَّةِ',
    titleBn: 'মাবাদিউল আরাবিয়াহ: ১ম–৪র্থ খণ্ডের মৌলিক নিয়মাবলি',
    titleEn: 'Mabadiul Arabiyyah Core Syntax Rules',
    branch: 'Nahw',
    sourceBook: 'মাবাদিউল আরাবিয়াহ',
    summaryBn: 'জুমলায়ে মুফীদা, মুবতাদা-খবর, হরুফে জার, ইদাফা, নাত, ইসম-ফেল-হরফের ধাপে ধাপে প্রয়োগ।',
    explanationBn:
      'মাবাদিউল আরাবিয়াহ অনুযায়ী পূর্ণ অর্থবোধক বাক্যকে জুমলায়ে মুফীদা বলে। ১ম খণ্ডে মুবতাদা-খবর ও সহজ প্রশ্নোত্তর (مَا هٰذَا؟ هَلْ...؟), ২য় খণ্ডে ফেল মাদি-মুদারি ও হরফে জার, ৩য় খণ্ডে ইদাফা, নাত-মানউত ও কানা-ইন্না এবং ৪র্থ খণ্ডে নাসিবা-জাযিমা, মাউসুল, হাল ও মাজহুল ক্রিয়ার ধাপে ধাপে প্রয়োগ শেখানো হয়।',
    explanationEn: 'Progressive syntax sequence across Mabadiul Arabiyyah Volumes 1–4 from simple nominal sentences to complex clauses.',
    rulesBn: [
      'জুমলায়ে মুফীদা ন্যূনতম দুটি শব্দের সমষ্টিতে পূর্ণ ভাব প্রকাশ করে (যেমন: العِلْمُ نَافِعٌ)।',
      'প্রশ্নবোধক هَلْ ও أَ বাক্যের শুরুতে বসে; হ্যাঁ-সূচক উত্তরে نَعَمْ এবং না-সূচক উত্তরে لَا ব্যবহৃত হয়।',
      'হরুফে জারের পরে ইসম সর্বদা মাজরূর (যেরযুক্ত) হয় এবং মুদাফে আলিফ-লাম ও তানবীন থাকে না।',
    ],
    examples: [
      { arabic: 'هَلِ الكِتَابُ عَلَى المَكْتَبِ؟ نَعَمْ، هُوَ عَلَى المَكْتَبِ.', pronunciationBn: 'হালিল কিতাবু আলাল মাকতাবি? না‘আম, হুয়া আলাল মাকতাবি।', meaningBn: 'বইটি কি টেবিলের ওপর? হ্যাঁ, তা টেবিলের ওপর।', analysisBn: 'هَلْ প্রশ্নবোধক হরফ, عَلَى হরফে জার এবং المَكْتَبِ মাজরূর।' },
      { arabic: 'بَابُ المَدْرَسَةِ مَفْتُوحٌ.', pronunciationBn: 'বাবুল মাদরাসাতি মাফতূহুন।', meaningBn: 'মাদরাসার দরজা খোলা।', analysisBn: 'بَابُ মুদাফ, المَدْرَسَةِ মুদাফ ইলাইহি (যের), আর مَفْتُوحٌ খবর (পেশ)।' },
    ],
    quiz: [
      { id: 'gq-mab-1', questionBn: 'মাবাদিউল আরাবিয়াহ-র নিয়ম অনুযায়ী ইদাফার প্রথম অংশ (মুদাফ)-এ কী বসে না?', questionEn: 'What never appears on the Mudaf?', options: ['হারাকাত', 'আলিফ-লাম ও তানবীন', 'শেষ অক্ষর', 'অর্থ'], correctIndex: 1, explanationBn: 'মুদাফ-এ কখনো আল (ال) বা তানবীন বসে না।', explanationEn: 'Mudaf takes neither Al- nor Tanwin.' },
    ],
  },
  {
    id: 'murab-mabni',
    titleAr: 'المُعْرَبُ وَالمَبْنِيُّ (الكَافِيَةُ وَالهِدَايَةُ)',
    titleBn: 'মু‘রাব ও মাবনি — কাফিয়া ও হেদায়েতুন নাহু-র পূর্ণ নিয়ম',
    titleEn: 'Murab (Declinable) & Mabni (Indeclinable)',
    branch: 'Nahw',
    sourceBook: 'কাফিয়া',
    summaryBn: 'আমেলের পরিবর্তনে যে শব্দের শেষ অক্ষর বদলায় তা মু‘রাব, আর যা কখনো বদলায় না তা মাবনি।',
    explanationBn:
      'হেদায়েতুন নাহু ও কাফিয়ার মূল নীতি অনুযায়ী কালিমা ৩টির মধ্যে সকল হরফ মাবনি; ফেলে মাদি ও আমরে হাজির মাবনি; ফেলে মুদারি নূনে তাওকীদ বা নূনে নিসওয়া মুক্ত হলে মু‘রাব। আর ইসম কেবল তখনি মাবনি হয় যখন তা মাবনিউল আসলের (হরফ, মাদি, আমর) সাদৃশ্য রাখে। মাবনি ইসম ৮ প্রকার: (১) দমীর (সর্বনাম), (২) ইসমে ইশারা, (৩) ইসমে মাউসুল, (৪) আসমাউল আফআল (هَيْهَاتَ، آمِينَ), (৫) আসমাউল আসওয়াত, (৬) বা‘যুয যুরুফ (অম্সি, হায়ছু), (৭) কিনায়াত (كَمْ، كَذَا), (৮) মুরাক্কাব বিনায়ী (أَحَدَ عَشَرَ থেকে تِسْعَةَ عَشَرَ, ১২ বাদে)।',
    explanationEn: 'In Kafiyah and Hidayatun Nahw, nouns are declinable (Murab) unless resembling indeclinable particles or past verbs, yielding 8 classes of Mabni nouns.',
    rulesBn: [
      'মু‘রাব শব্দের ই‘রাব হরকত (পেশ/যবর/যের) অথবা হরফ (ওয়াও/আলিফ/ইয়া) দিয়ে হয়।',
      'আসমায়ে খামসাহ ও জামায়ে মুযাক্কার সালিম ও তাসনিয়ার ই‘রাব হরফ দ্বারা হয়।',
      'আট প্রকার মাবনি ইসমের শেষ অক্ষর সর্বাবস্থায় স্থির থাকে; তবে বাক্যে এগুলো মহল্লী (স্থানগত) রাফ‘আ, নসব বা জার পায়।',
    ],
    examples: [
      { arabic: 'جَاءَ هٰؤُلَاءِ الطُّلَّابُ وَرَأَيْتُ هٰؤُلَاءِ.', pronunciationBn: 'জাআ হা-উলাইত তুল্লাবু ওয়া রাআইতু হা-উলাই।', meaningBn: 'এই ছাত্ররা এসেছে এবং আমি এদের দেখেছি।', analysisBn: 'هٰؤُلَاءِ মাবনি আলাল-কাসর; প্রথমটিতে ফায়েল হিসেবে মহল্লান মারফু, দ্বিতীয়টিতে মহল্লান মানসুব।' },
    ],
    quiz: [
      { id: 'gq-mm-1', questionBn: 'হেদায়েতুন নাহু মতে মাবনি ইসম মোট কত প্রকার?', questionEn: 'How many categories of Mabni nouns exist in Hidayatun Nahw?', options: ['৪ প্রকার', '৬ প্রকার', '৮ প্রকার', '১২ প্রকার'], correctIndex: 2, explanationBn: 'মাবনি ইসম মোট ৮ প্রকার (দমীর, ইশারা, মাউসুল, আসমায়ে আফআল, আসওয়াত, যুরুফ, কিনায়াত, মুরাক্কাব)।', explanationEn: 'Eight categories of indeclinable nouns.' },
    ],
  },
  {
    id: 'marfuat',
    titleAr: 'المَرْفُوعَاتُ الثَّمَانِيَةُ (هِدَايَةُ النَّحْوِ)',
    titleBn: 'আট প্রকার মারফুআত (রাফ‘আ বা পেশযুক্ত পদসমূহ)',
    titleEn: 'The Eight Nominatives (Al-Marfuat)',
    branch: 'Nahw',
    sourceBook: 'হেদায়েতুন নাহু',
    summaryBn: 'বাক্যে যে ৮টি স্থানে ইসম রাফ‘আ (পেশ) গ্রহণ করে—তার সম্পূর্ণ তালিকা ও ব্যাখ্যা।',
    explanationBn:
      'হেদায়েতুন নাহু ও কাফিয়া অনুযায়ী মারফুআত ৮ প্রকার: (১) ফায়েল (কর্তা: قَامَ زَيْدٌ), (২) মাফউল মা লাম ইয়ুসাম্মা ফায়েলুহু / নায়েবে ফায়েল (মাজহুলের কর্ম: نُصِرَ المَظْلُومُ), (৩) মুবতাদা (উদ্দেশ্য), (৪) খবর (বিধেয়), (৫) ইন্না ও তার ভগিনীগণের খবর (إِنَّ اللَّهَ غَفُورٌ), (৬) কানা ও তার ভগিনীগণের ইসম (كَانَ البَيْتُ كَبِيرًا), (৭) মা ও লা মুশাব্বাহা বি-লাইসা-র ইসম (مَا زَيْدٌ قَائِمًا), (৮) লা লি-নাফয়িল জিনস-এর খবর (لَا رَجُلَ قَائِمٌ)।',
    explanationEn: 'Hidayatun Nahw lists 8 grammatical positions where a noun receives Raf‘a (nominative case).',
    rulesBn: [
      'প্রতিটি মারফু‘ শব্দের আগে একটি ‘আমেল’ (রফেকারী) কাজ করে—সেটি লফযী (যেমন ফেল/কানা/ইন্না) অথবা মা‘নাবী (ইবতিদা)।',
      'তাওয়াবে (নাত, আতফ, তাওকীদ, বদল) মারফুর অনুগামী হলে তাও মারফু হয়।',
    ],
    examples: [
      { arabic: 'كُتِبَ الدَّرْسُ كِتَابَةً وَاضِحَةً.', pronunciationBn: 'কুতিবাদ দারসু কিতাবাতান ওয়াদিহাতান।', meaningBn: 'পাঠটি স্পষ্টভাবে লেখা হয়েছে।', analysisBn: 'الدَّرْسُ হলো নায়েবে ফায়েল, তাই মারফু (পেশ) হয়েছে।' },
    ],
    quiz: [
      { id: 'gq-mar-1', questionBn: 'হেদায়েতুন নাহু মতে মারফুআত কত প্রকার?', questionEn: 'How many Marfuat positions are there in Hidayatun Nahw?', options: ['৫ প্রকার', '৮ প্রকার', '১০ প্রকার', '১২ প্রকার'], correctIndex: 1, explanationBn: 'হেদায়েতুন নাহু মতে মারফুআত ৮ প্রকার।', explanationEn: 'Eight nominative positions.' },
    ],
  },
  {
    id: 'mansubat-complete',
    titleAr: 'المَنْصُوبَاتُ الاِثْنَا عَشَرَ وَالمُسْتَثْنَى',
    titleBn: '১২ প্রকার মানসুবাত ও ইস্তিসনা (ইন্না-কানা-মুসতাসনা)',
    titleEn: 'Twelve Accusatives & Exception (Istithna)',
    branch: 'Nahw',
    sourceBook: 'কাফিয়া',
    summaryBn: 'কাফিয়ার মানসুবাত অধ্যায়: ৫ মাফউল, হাল, তাময়ীয, মুসতাসনা, কানা-র খবর, ইন্না-র ইসম ইত্যাদি।',
    explanationBn:
      'কাফিয়া গ্রন্থে মানসুবাত (যবরযুক্ত পদ) ১২টি: (১–৫) পাঁচটি মাফউল—মুতলাক, বিহী, ফীহি, লাহু, মা‘আহু; (৬) হাল; (৭) তাময়ীয; (৮) মুসতাসনা (إِلَّا দ্বারা ব্যতিক্রম: জুমলা মুসবাত মুত্তাসিল হলে মুসতাসনা মানসুব হয়—قَامَ القَوْمُ إِلَّا زَيْدًا); (৯) কানা-র খবর; (১০) ইন্না-র ইসম; (১১) মা ও লা-র খবর; (১২) লা লি-নাফয়িল জিনসের মুরাক্কাব/মুদাফ ইসম।',
    explanationEn: 'Complete 12 Mansubat (accusatives) from Kafiyah including all 5 Maf’uls and Mustathna rules with Illa.',
    rulesBn: [
      'মুসতাসনা মুনকাতে‘ এবং ইতিবাচক পূর্ণ বাক্যে إِلَّا-র পরের ইসম ওয়াজিব মানসুব হয়।',
      'না-বোধক বাক্যে (مَا قَامَ أَحَدٌ إِلَّا زَيْدٌ / زَيْدًا) বদল বা নসব উভয়ই জায়েজ।',
      'যারফে মা‘কান ও যামান (সময়/স্থান) মাফউল ফীহি হিসেবে মানসুব হয়।',
    ],
    examples: [
      { arabic: 'حَضَرَ الطُّلَّابُ إِلَّا خَالِدًا.', pronunciationBn: 'হাদারাত তুল্লাবু ইল্লা খালিদান।', meaningBn: 'খালিদ ছাড়া সব ছাত্র উপস্থিত হয়েছে।', analysisBn: 'جملة مثبته হওয়ায় إِلَّا-র পরে خَالِدًا মানসুব হয়েছে।' },
    ],
    quiz: [
      { id: 'gq-man-1', questionBn: 'حَضَرَ القَوْمُ إِلَّا زَيْدًا—এখানে زَيْدًا কেন মানসুব হয়েছে?', questionEn: 'Why is زَيْدًا accusative after إِلَّا?', options: ['ফায়েল বলে', 'ইতিবাচক পূর্ণ বাক্যে মুসতাসনা বলে', 'মুবতাদা বলে', 'মাজরূর বলে'], correctIndex: 1, explanationBn: 'হ্যাঁ-বোধক পূর্ণ কালামে إِلَّا-র পরের মুসতাসনা সর্বদা মানসুব হয়।', explanationEn: 'In a positive complete clause, the Mustathna after Illa is obligatorily Mansub.' },
    ],
  },
  {
    id: 'tawabe-five',
    titleAr: 'التَّوَابِعُ الخَمْسَةُ',
    titleBn: 'পাঁচ প্রকার তাওয়াবে (নাত, আতফ, তাওকীদ, বদল, আতফে বায়ান)',
    titleEn: 'The Five Appositives (Al-Tawabi)',
    branch: 'Nahw',
    sourceBook: 'হেদায়েতুন নাহু',
    summaryBn: 'পূর্ববর্তী পদের (মাতবু‘) ই‘রাব অনুসরণকারী পাঁচটি গুরুত্বপূর্ণ ব্যাকরণিক কাঠামো।',
    explanationBn:
      'যে পদ নিজের পূর্ববর্তী শব্দের (মাতবু‘) ই‘রাব অনুসরণ করে তাকে তাবে‘ বলে। কাফিয়া ও হেদায়েতুন নাহু অনুযায়ী তাওয়াবে ৫ প্রকার: (১) নাত/সিফাত (গুণবাচক বিশেষণ: رَجُلٌ عَالِمٌ), (২) আতফে বায়ান (পরিচায়ক সংযোজন: أَقْسَمَ بِاللَّهِ أَبُو حَفْصٍ عُمَرُ), (৩) তাওকীদ (জোর দেওয়া: نَفْسُهُ / كُلُّهُمْ), (৪) বদল (বদলে কুল, বদলে বা‘দ, বদলে ইশতিমাল: جَاءَنِي أَخُوكَ زَيْدٌ), (৫) আতফে নাসাক (وَ، فَ، ثُمَّ ইত্যাদি অব্যয় দ্বারা যুক্ত)।',
    explanationEn: 'The five followers that inherit case from the preceding noun: Na’t, Atf al-Bayan, Tawkid, Badal, and Atf al-Nasaq.',
    rulesBn: [
      'তাওকীদ-এ মূল কথার সন্দেহ দূর করতে نَفْسٌ، عَيْنٌ، كُلٌّ، جَمِيعٌ ইত্যাদি দমীরযুক্ত হয়ে আসে।',
      'বদল চার প্রকার: বদলে কুল, বদলে বা‘দ, বদলে ইশতিমাল ও বদলে গালত।',
    ],
    examples: [
      { arabic: 'نَفَعَنِي العَالِمُ عِلْمُهُ.', pronunciationBn: 'নাফা‘আনিল আলিমু ইলমুহু।', meaningBn: 'আলেমের জ্ঞান আমাকে উপকৃত করেছে।', analysisBn: 'عِلْمُهُ হলো বদলে ইশতিমাল, যা পূর্ববর্তী العَالِمُ-এর রাফ‘আ অনুসরণ করেছে।' },
    ],
    quiz: [
      { id: 'gq-taw-1', questionBn: 'جَاءَ الطُّلَّابُ كُلُّهُمْ বাক্যে كُلُّهُمْ কী ধরনের তাবে‘?', questionEn: 'What type of follower is كُلُّهُمْ?', options: ['বদল', 'তাওকীদ মা‘নাবী', 'আতফে বায়ান', 'নাত'], correctIndex: 1, explanationBn: 'কুল্লুহুম বহুবচনের সবাইকে অন্তর্ভুক্ত করে জোর বোঝাচ্ছে—এটি তাওকীদ মা‘নাবী।', explanationEn: 'Kulluhum is semantic corroboration (Tawkid Ma’nawi).' },
    ],
  },
  {
    id: 'awamil-hundred',
    titleAr: 'العَوَامِلُ فِي النَّحْوِ (النَّوَاصِبُ وَالجَوَازِمُ)',
    titleBn: 'নাহুর আমেলসমূহ: নাসিবা, জাযিমা ও আসমায়ে শার্ত',
    titleEn: 'Governing Operators (Al-Awamil)',
    branch: 'Nahw',
    sourceBook: 'কাফিয়া',
    summaryBn: 'মুদারি ক্রিয়ায় যবর ও জযম দানকারী হরফ এবং দুটি ক্রিয়াকে জযম দানকারী শর্তবাচক ইসমসমূহ।',
    explanationBn:
      'হেদায়েতুন নাহু ও মিয়াতে আমিল অনুসারে ফেলে মুদারিতে নসব দেয় ৪টি হরফ: أَنْ، لَنْ، كَيْ، إِذَنْ। আর এক ক্রিয়ায় জযম দেয় ৫টি: لَمْ، لَمَّا، لَامُ الأَمْرِ، لَا النَّاهِيَةُ، إِنْ (শর্ত)। আর দুটি মুদারি ক্রিয়ায় (শর্ত ও জাযা) একত্রে জযম দেয় ১১টি আমেল: إِنْ، مَنْ، مَا، مَهْمَا، أَيٌّ، مَتَى، أَيْنَ، أَيَّانَ، أَنَّى، حَيْثُمَا، إِذْمَا।',
    explanationEn: 'Subjunctive particles (4), single-verb jussives (5), and two-verb conditional jussives (11).',
    rulesBn: [
      'শর্তবাচক জুমলায় প্রথম ক্রিয়াটিকে ‘শার্ত’ এবং দ্বিতীয় ফলাফল ক্রিয়াটিকে ‘জাযা’ বলে।',
      'যেমন: مَنْ يَجْتَهِدْ يَنْجَحْ — যে পরিশ্রম করবে, সে সফল হবে।',
    ],
    examples: [
      { arabic: 'إِنْ تَصْبِرُوا وَتَتَّقُوا يَنْصُرْكُمُ اللَّهُ.', pronunciationBn: 'ইন তাসবিরূ ওয়া তাত্তাকূ ইয়ানসুরকুমুল্লাহু।', meaningBn: 'যদি তোমরা ধৈর্য ধরো এবং তাকওয়া অবলম্বন করো, আল্লাহ তোমাদের সাহায্য করবেন।', analysisBn: 'إِنْ শর্তে প্রথম দুটি ক্রিয়ায় নূন বিলুপ্ত হয়ে জযম হয়েছে এবং يَنْصُرْ-এ সুকূন এসেছে।' },
    ],
    quiz: [
      { id: 'gq-awa-1', questionBn: 'মোট কয়টি হরফ ফেলে মুদারিতে সরাসরি নসব (যবর) দেয়?', questionEn: 'How many primary particles make the Mudari Mansub?', options: ['২টি', '৪টি (أَنْ، لَنْ، كَيْ، إِذَنْ)', '৭টি', '১১টি'], correctIndex: 1, explanationBn: 'أَنْ، لَنْ، كَيْ، إِذَنْ — এই চারটি সরাসরি নসব দেয়।', explanationEn: 'Four particles: An, Lan, Kay, Idhan.' },
    ],
  },
  {
    id: 'madh-dhamm-taajjub',
    titleAr: 'أَفْعَالُ المَدْحِ وَالذَّمِّ وَالتَّعَجُّبُ',
    titleBn: 'প্রশংসা-নিন্দা সূচক ক্রিয়া (نِعْمَ، بِئْسَ) ও বিস্ময়বোধক বাক্য',
    titleEn: 'Verbs of Praise, Blame & Wonder (Ta’ajjub)',
    branch: 'Nahw',
    sourceBook: 'হেদায়েতুন নাহু',
    summaryBn: 'নাহুর বিশেষ ক্রিয়া نِعْمَ (কত উত্তম), بِئْسَ (কত মন্দ) এবং مَا أَفْعَلَهُ / أَفْعِلْ بِهِ বিস্ময়ের গঠন।',
    explanationBn:
      'কাফিয়া ও হেদায়েতুন নাহু অনুযায়ী প্রশংসার জন্য نِعْمَ / حَبَّذَا এবং নিন্দার জন্য بِئْسَ ব্যবহৃত হয়। এগুলোর ফায়েলকে ‘আল’-যুক্ত বা তার দিকে মুদাফ হতে হয় এবং এর পরের বিশেষিত পদকে মাখসূস বিল-মাদহ/যাম্ম বলে (যা মারফু হয়)। আর বিস্ময় (তা‘আজ্জুব) প্রকাশের ২টি প্রধান সীগাহ: (১) مَا أَفْعَلَهُ! যেমন مَا أَجْمَلَ السَّمَاءَ! (আকাশ কত সুন্দর!), (২) أَفْعِلْ بِهِ! যেমন أَحْسِنْ بِزَيْدٍ!',
    explanationEn: 'Special non-conjugating verbs Ni’ma & Bi’sa for praise/blame, plus the two wonder formulas Ma Af’alahu and Af’il Bihi.',
    rulesBn: [
      'নِعمَ ও بِئسَ-এর ফায়েল যদি গোপন থাকে তবে তার পরে তাময়ীয হিসেবে একটি নাকিরাহ মানসুব আসে (যেমন: نِعْمَ رَجُلًا زَيْدٌ)।',
    ],
    examples: [
      { arabic: 'نِعْمَ الطَّالِبُ المُجْتَهِدُ وَمَا أَحْسَنَ خُلُقَهُ!', pronunciationBn: 'নি‘মাত তালিবুল মুজতাহিদু ওয়া মা আহসানা খুলুকাহু!', meaningBn: 'পরিশ্রমী ছাত্র কতই না উত্তম এবং তার চরিত্র কত সুন্দর!', analysisBn: 'نِعْمَ মাদহের ফেল, الطَّالِبُ তার ফায়েল, المُجْتَهِدُ মাখসূস; আর مَا أَحْسَنَ হলো তা‘আজ্জুব।' },
    ],
    quiz: [
      { id: 'gq-mdt-1', questionBn: 'مَا أَجْمَلَ العِلْمَ! — এই বাক্যটি নাহুর কোন গঠনের অন্তর্ভুক্ত?', questionEn: 'What structure is مَا أَجْمَلَ العِلْمَ?', options: ['মাজহুল', 'ফেলে তা‘আজ্জুব (বিস্ময়)', 'ইস্তিসনা', 'নাহী'], correctIndex: 1, explanationBn: 'مَا أَفْعَلَهُ ওজনে হওয়ায় এটি বিস্ময়বোধক (তা‘আজ্জুব) গঠন।', explanationEn: 'Ma Af’alahu is the primary Ta’ajjub (wonder) pattern.' },
    ],
  },
];

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  ...BASE_GRAMMAR_TOPICS,
  ...CLASSICAL_KITAB_TOPICS,
];
