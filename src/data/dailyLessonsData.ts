import { DOMAIN_BANK_PART1, MabadiDialogueLine, MabadiGrammarRule, MabadiVocabItem } from './mabadiDailyBank';
import { DOMAIN_BANK_PART2 } from './mabadiDailyBankPart2';
import { SAFWATUL_MASADIR_LIST } from './safwatulMasadirData';
import { GRAMMAR_TOPICS } from './grammarData';

export interface DailySentence {
  speakerAr?: string;
  speakerBn?: string;
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
}

export interface DailyLessonItem {
  lessonNumber: number;
  titleBn: string;
  titleEn: string;
  mabadiLevelBn: string;
  difficultyLabel: string;
  sentences: DailySentence[]; // 15-20 authentic progressive Arabic conversation lines
  newVocabulary: MabadiVocabItem[];
  grammarRule: MabadiGrammarRule;
  aiPracticePromptAr: string;
  aiPracticePromptBn: string;
}

export interface DailyLessonGroup {
  id: string;
  rangeLabel: string; // e.g. "পাঠ ১–৫"
  startLesson: number;
  endLesson: number;
  mabadiLevelBn: string;
  difficultyLabel: string;
  summaryBn: string;
  summaryEn: string;
  lessons: DailyLessonItem[];
}

const ALL_THEMATIC_DOMAINS = [...DOMAIN_BANK_PART1, ...DOMAIN_BANK_PART2];

const GROUP_SUMMARIES: { start: number; end: number; summaryBn: string; summaryEn: string; titlesBn: string[] }[] = [
  { start: 1, end: 5, summaryBn: 'সালাম, পরিচয়, পরিবার, ঘর ও দৈনন্দিন কথা', summaryEn: 'Greetings, introductions, family & home', titlesBn: ['সালাম ও পরিচিতি', 'নিজের ও দেশের পরিচয়', 'পরিবার ও আত্মীয়', 'ঘর ও আসবাব', 'দৈনন্দিন ভদ্রতা'] },
  { start: 6, end: 10, summaryBn: 'সকাল, খাবার, পানীয়, রান্না ও রেস্টুরেন্ট', summaryEn: 'Morning, food, drink & restaurant', titlesBn: ['সকালের নাস্তা', 'পানি ও পানীয়', 'দুপুর ও রাতের খাবার', 'রান্নাঘরের কথা', 'অতিথি আপ্যায়ন ও খাবার'] },
  { start: 11, end: 15, summaryBn: 'বাজার, দোকান, দাম ও কেনাকাটা', summaryEn: 'Market, shopping & prices', titlesBn: ['দোকানে প্রবেশ', 'দাম জিজ্ঞাসা', 'দরকষাকষি ও ছাড়', 'ফল ও সবজি', 'পোশাক কেনা'] },
  { start: 16, end: 20, summaryBn: 'রাস্তা, যানবাহন, ভ্রমণ ও দিকনির্দেশনা', summaryEn: 'Roads, transport, travel & directions', titlesBn: ['দিকনির্দেশনা চাওয়া', 'বাস ও ট্রেন সফর', 'বিমানবন্দর ও টিকিট', 'হোটেল ও অবস্থান', 'নিরাপদ ভ্রমণের দোয়া'] },
  { start: 21, end: 25, summaryBn: 'স্কুল, পড়াশোনা, কাজ, সময় ও অফিস', summaryEn: 'School, study, work & office', titlesBn: ['স্কুলে কথাবার্তা', 'পড়াশোনা ও বই', 'সাপ্তাহিক রুটিন ও কাজ', 'সময়, ঘণ্টা ও বার', 'ফোনে ও খাতায় নোট'] },
  { start: 26, end: 30, summaryBn: 'মসজিদ, ওযু, ইবাদত ও ইসলামি কথাবার্তা', summaryEn: 'Mosque, worship & Islamic phrases', titlesBn: ['ওযু ও পবিত্রতা', 'মসজিদে প্রবেশ ও সালাত', 'জুমআ ও খুতবা', 'কুরআন তিলাওয়াত ও দোয়া', 'রোযা ও যাকাত'] },
  { start: 31, end: 35, summaryBn: 'বন্ধু, দেখা করা, আমন্ত্রণ ও হাদিয়া', summaryEn: 'Friends, meetings & invitations', titlesBn: ['বন্ধুর সাথে সাক্ষাৎ', 'বাসায় আমন্ত্রণ', 'সাক্ষাতের সময় ঠিক করা', 'উপহার ও শুভেচ্ছা', 'বিদায় ও দোয়া'] },
  { start: 36, end: 40, summaryBn: 'স্বাস্থ্য, হাসপাতাল, চিকিৎসক ও ওষুধ', summaryEn: 'Health, hospital, doctor & medicine', titlesBn: ['শরীরের অবস্থা ও কুশল', 'ডাক্তারের চেম্বারে কথোপকথন', 'অসুস্থতা বর্ণনা', 'ফার্মেসি ও ওষুধ', 'সুস্থতার দোয়া ও পরামর্শ'] },
  { start: 41, end: 45, summaryBn: 'আবহাওয়া, ঋতু, প্রকৃতি ও পরিবেশ', summaryEn: 'Weather, seasons & nature', titlesBn: ['আজকের আবহাওয়া', 'বৃষ্টি ও মেঘ', 'শীত ও বসন্তকাল', 'বাগান ও পরিবেশ রক্ষা', 'আকাশ, সূর্য ও চাঁদ'] },
  { start: 46, end: 50, summaryBn: 'প্রযুক্তি, ইন্টারনেট ও অধ্যয়ন অভ্যাস', summaryEn: 'Technology, internet & study habits', titlesBn: ['কম্পিউটার ও পড়াশোনা', 'অনলাইন ক্লাস ও AI', 'ইমেইল ও গবেষণা', 'ডিজিটাল ও কাগজের বই', 'দৈনিক শব্দ মুখস্থ অভ্যাস'] },
  { start: 51, end: 55, summaryBn: 'পেশা, দক্ষতা, আমানত ও ভবিষ্যৎ লক্ষ্য', summaryEn: 'Professions, skills & goals', titlesBn: ['পছন্দের পেশা পরিচিতি', 'অভিজ্ঞতা ও দক্ষতা', 'চাকরির সাক্ষাৎকার', 'দায়িত্বশীলতা ও সততা', 'ভবিষ্যৎ লক্ষ্য ও পরিকল্পনা'] },
  { start: 56, end: 60, summaryBn: 'অনুভূতি, ধৈর্য, কৃতজ্ঞতা ও তাওয়াক্কুল', summaryEn: 'Emotions, patience & reliance on Allah', titlesBn: ['দুঃখ ও সহমর্মিতা', 'ধৈর্য ও আল্লাহর রহমত', 'আনন্দ ও কৃতজ্ঞতা প্রকাশ', 'ভদ্রভাবে ক্ষমা চাওয়া', 'আশা ও তাওয়াক্কুল'] },
  { start: 61, end: 65, summaryBn: 'গ্রন্থাগার, পাণ্ডুলিপি, গবেষণা ও সাহিত্য', summaryEn: 'Library, research & Arabic literature', titlesBn: ['লাইব্রেরিতে বই খোঁজা', 'প্রাচীন পাণ্ডুলিপি সংরক্ষণ', 'অভিধান ও মূলধাতু গবেষণা', 'প্রবন্ধ লেখা ও সেমিনার', 'জ্ঞানচর্চার আদব'] },
  { start: 66, end: 70, summaryBn: 'হজ্জ, উমরাহ ও মক্কা-মদীনা সফর', summaryEn: 'Hajj, Umrah & Haramain travel', titlesBn: ['মীকাত ও ইহরাম', 'তালবিয়া ও কাবা দর্শন', 'তাওয়াফ ও রুকনে ইয়ামানী', 'যমযম ও সাফা-মারওয়া সা‘ঈ', 'মসজিদে নববী যিয়ারত'] },
  { start: 71, end: 75, summaryBn: 'সংবাদ, সমাজসেবা ও প্রতিবেশীর হক', summaryEn: 'News, community service & neighbors', titlesBn: ['সংবাদ ও স্বেচ্ছাসেবা', 'সমাজকল্যাণ ও দান', 'প্রতিবেশীর হক ও সদাচরণ', 'গুজব বর্জন ও সত্যতা যাচাই', 'শিক্ষা বিস্তার ও ঐক্য'] },
  { start: 76, end: 80, summaryBn: 'ইসলামি ব্যাংকিং, হালাল ব্যবসা ও বাজেট', summaryEn: 'Banking, lawful trade & budgeting', titlesBn: ['ইসলামি ব্যাংক একাউন্ট', 'হালাল ব্যবসার নীতি', 'মুদারাবা ও মুনাফা বণ্টন', 'সঞ্চয়, যাকাত ও সদকা', 'ঋণ ও চুক্তি লিপিবদ্ধ করা'] },
  { start: 81, end: 85, summaryBn: 'ক্রীড়া, শরীরচর্চা ও সুস্বাস্থ্য', summaryEn: 'Sports, fitness & healthy living', titlesBn: ['সকালের শরীরচর্চা', 'দলগত খেলাধুলা ও নিয়ম', 'সুষম ও স্বাস্থ্যকর খাদ্য', 'পরিমিত খাবার ও ঘুম', 'শৃঙ্খলা ও দৃঢ় সংকল্প'] },
  { start: 86, end: 90, summaryBn: 'বিতর্ক, যুক্তি উপস্থাপন ও সিদ্ধান্ত', summaryEn: 'Debate, logic & sound decisions', titlesBn: ['সরাসরি বনাম অনলাইন শিক্ষা', 'মতামত ও দৃষ্টিভঙ্গি', 'দলীল ও তুলনামূলক আলোচনা', 'মতভেদের আদব', 'সিদ্ধান্ত গ্রহণ ও সারসংক্ষেপ'] },
  { start: 91, end: 95, summaryBn: 'কুরআনিক প্রজ্ঞা, হাদীস ও বাগ্মিতা', summaryEn: 'Quranic wisdom & prophetic eloquence', titlesBn: ['কুরআনের ভাষা ও প্রজ্ঞা', 'হাদীসের জাওয়ামিউল কালিম', 'বাগ্মিতা ও অন্তরের প্রশান্তি', 'সময়ের কদর ও সালাফ', 'উত্তম চরিত্র ও জ্ঞান'] },
  { start: 96, end: 100, summaryBn: 'বক্তৃতা, উপস্থাপনা ও উচ্চতর সাবলীলতা', summaryEn: 'Public speaking & full fluency', titlesBn: ['বক্তৃতার প্রারম্ভিকা ও আদব', 'আরবি শেখার সফল কৌশল', 'ক্লাসিক্যাল কিতাব সমন্বয়', 'পূর্বসূরি আলেমদের সাধনা', 'সমাপনী ও সাবলীল কথোপকথন'] },
];

function buildLessonDialogue(
  domainDialogue: MabadiDialogueLine[],
  lessonNumber: number,
  offset: number,
  groupIndex: number
): DailySentence[] {
  // Rotate starting focus cleanly or emphasize progressive lines without mixing non-Arabic text
  // Always keep 16 full authentic Arabic sentences per lesson, and inject 1 Safwatul Masadir contextual line for variety across the 5 lessons in a group
  const masdarIndex = (lessonNumber * 3 + offset) % SAFWATUL_MASADIR_LIST.length;
  const masdar = SAFWATUL_MASADIR_LIST[masdarIndex];

  const baseLines: DailySentence[] = domainDialogue.map((d) => ({
    speakerAr: d.speakerAr,
    speakerBn: d.speakerBn,
    arabic: d.arabic,
    pronunciationBn: d.pronunciationBn,
    meaningBn: d.meaningBn,
    meaningEn: d.meaningEn,
  }));

  // For lessons 2..5 in a group (offset 1..4), rotate the dialogue order slightly after greeting or insert the Masdar focus line so each lesson has distinct Masdar emphasis
  if (offset > 0 && baseLines.length >= 16) {
    const rotatedTail = [
      ...baseLines.slice(2 + offset),
      ...baseLines.slice(2, 2 + offset),
    ];
    const masdarSentence: DailySentence = {
      speakerAr: 'الأُسْتَاذُ',
      speakerBn: 'উস্তায (মাসদার অনুশীলন)',
      arabic: masdar.exampleAr,
      pronunciationBn: `${masdar.masdarPronunciationBn} — ${masdar.madiAr} / ${masdar.mudariAr}`,
      meaningBn: `${masdar.exampleBn} (মাসদার: ${masdar.masdarAr} = ${masdar.meaningBn})`,
      meaningEn: `${masdar.meaningEn} (${masdar.masdarAr})`,
    };
    return [baseLines[0], baseLines[1], ...rotatedTail.slice(0, 13), masdarSentence];
  }

  // Group 0 Lesson 1 already starts naturally; append Masdar check if groupIndex > 0
  if (groupIndex > 0) {
    return [
      ...baseLines.slice(0, 15),
      {
        speakerAr: 'المُرَاجَعَةُ',
        speakerBn: 'সফওয়াতুল মাসাদির চর্চা',
        arabic: masdar.exampleAr,
        pronunciationBn: `${masdar.masdarPronunciationBn} (${masdar.babNameBn})`,
        meaningBn: `${masdar.exampleBn} [মূল মাসদার: ${masdar.masdarAr} — ${masdar.meaningBn}]`,
        meaningEn: `${masdar.meaningEn} (${masdar.babNameAr})`,
      },
    ];
  }

  return baseLines;
}

function buildLessonGrammar(domainGrammar: MabadiGrammarRule, lessonNumber: number, offset: number): MabadiGrammarRule {
  // Lesson 1 of each group uses the domain's primary Mabadi/Hidayah/Kafiyah rule;
  // Lessons 2-5 pull progressive complementary rules from GRAMMAR_TOPICS so every lesson has a distinct explained rule!
  if (offset === 0) return domainGrammar;

  const topicIndex = (lessonNumber + offset * 2) % GRAMMAR_TOPICS.length;
  const g = GRAMMAR_TOPICS[topicIndex];
  const ex = g.examples[0];
  return {
    sourceBook: g.sourceBook || 'হেদায়েতুন নাহু',
    titleAr: g.titleAr,
    titleBn: g.titleBn,
    explanationBn: g.explanationBn,
    exampleAr: ex?.arabic || domainGrammar.exampleAr,
    exampleBn: ex ? `${ex.meaningBn} (${ex.analysisBn})` : domainGrammar.exampleBn,
  };
}

function buildLessonVocabulary(domainVocab: MabadiVocabItem[], lessonNumber: number): MabadiVocabItem[] {
  const m1 = SAFWATUL_MASADIR_LIST[(lessonNumber * 2) % SAFWATUL_MASADIR_LIST.length];
  const m2 = SAFWATUL_MASADIR_LIST[(lessonNumber * 2 + 5) % SAFWATUL_MASADIR_LIST.length];
  return [
    ...domainVocab,
    {
      arabic: `${m1.masdarAr} (${m1.madiAr} / ${m1.mudariAr})`,
      pronunciationBn: m1.masdarPronunciationBn,
      meaningBn: `${m1.meaningBn} [${m1.babNameBn}]`,
      meaningEn: m1.meaningEn,
      masdarNote: `সফওয়াতুল মাসাদির · মূলধাতু: ${m1.rootLetters}`,
    },
    {
      arabic: `${m2.masdarAr} (${m2.madiAr} / ${m2.mudariAr})`,
      pronunciationBn: m2.masdarPronunciationBn,
      meaningBn: `${m2.meaningBn} [${m2.babNameBn}]`,
      meaningEn: m2.meaningEn,
      masdarNote: `সফওয়াতুল মাসাদির · মূলধাতু: ${m2.rootLetters}`,
    },
  ];
}

export const DAILY_LESSON_GROUPS: DailyLessonGroup[] = GROUP_SUMMARIES.map((g, groupIdx) => {
  const domain = ALL_THEMATIC_DOMAINS[groupIdx] || ALL_THEMATIC_DOMAINS[0];
  return {
    id: `group-${g.start}-${g.end}`,
    rangeLabel: `পাঠ ${g.start}–${g.end}`,
    startLesson: g.start,
    endLesson: g.end,
    mabadiLevelBn: domain.mabadiLevelBn,
    difficultyLabel: domain.difficultyLabel,
    summaryBn: g.summaryBn,
    summaryEn: g.summaryEn,
    lessons: g.titlesBn.map((titleBn, offset) => {
      const lessonNumber = g.start + offset;
      const sentences = buildLessonDialogue(domain.dialogue, lessonNumber, offset, groupIdx);
      const firstQ = sentences[0]?.arabic || 'السَّلَامُ عَلَيْكُمْ، كَيْفَ حَالُكَ؟';
      const grammarRule = buildLessonGrammar(domain.grammar, lessonNumber, offset);

      return {
        lessonNumber,
        titleBn: `পাঠ ${lessonNumber}: ${titleBn}`,
        titleEn: `Lesson ${lessonNumber}: ${g.summaryEn}`,
        mabadiLevelBn: domain.mabadiLevelBn,
        difficultyLabel: domain.difficultyLabel,
        sentences,
        newVocabulary: buildLessonVocabulary(domain.vocabulary, lessonNumber),
        grammarRule,
        aiPracticePromptAr: firstQ,
        aiPracticePromptBn: `এই পাঠের বিষয় (${titleBn}) ও ব্যাকরণ নিয়ম (${grammarRule.titleBn}) প্রয়োগ করে AI শিক্ষকের সাথে আরবিতে উত্তর দিন।`,
      };
    }),
  };
});

export const TODAY_ARABIC_SENTENCES: DailySentence[] = [
  {
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ.',
    pronunciationBn: 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।',
    meaningBn: 'আপনার ওপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।',
    meaningEn: 'Peace and mercy of Allah be upon you.',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا نَافِعًا.',
    pronunciationBn: 'রব্বি যিদনী ইলমান নাফি‘আন।',
    meaningBn: 'হে আমার রব, আমার উপকারী জ্ঞান বৃদ্ধি করে দিন।',
    meaningEn: 'My Lord, increase me in beneficial knowledge.',
  },
  {
    arabic: 'اِفْتَحْ كِتَابَ مَبَادِئِ العَرَبِيَّةِ وَاقْرَأِ الدَّرْسَ.',
    pronunciationBn: 'ইফতাহ কিতাবা মাবাদিইল আরাবিয়্যাতি ওয়াকরা-ইদ দারসা।',
    meaningBn: 'মাবাদিউল আরাবিয়াহ বইটি খোলো এবং পাঠটি পড়ো।',
    meaningEn: 'Open the Mabadiul Arabiyyah book and read the lesson.',
  },
  {
    arabic: 'مَنْ جَدَّ وَجَدَ، وَمَنْ سَارَ عَلَى الدَّرْبِ وَصَلَ.',
    pronunciationBn: 'মান জাদ্দা ওয়াজাদা, ওয়া মান সারা আলাদ-দারবি ওয়াসালা।',
    meaningBn: 'যে পরিশ্রম করে সে সফলতা পায়, এবং যে পথে চলে সে গন্তব্যে পৌঁছে।',
    meaningEn: 'Whoever strives finds, and whoever walks the path arrives.',
  },
];
