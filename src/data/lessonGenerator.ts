import { ChapterInfo, DetailedLesson } from '../types/academy';
import { DOMAIN_BANK_PART1 } from './mabadiDailyBank';
import { DOMAIN_BANK_PART2 } from './mabadiDailyBankPart2';
import { GRAMMAR_TOPICS } from './grammarData';
import { SAFWATUL_MASADIR_LIST } from './safwatulMasadirData';

const ALL_DOMAINS = [...DOMAIN_BANK_PART1, ...DOMAIN_BANK_PART2];

/**
 * Deterministically produces a full Mabadiul Arabiyyah / Hidayatun Nahw / Kafiyah / Safwatul Masadir
 * lesson with 16-line conversation, new vocab, Safwatul Masadir links, classical grammar explanation,
 * translation exercises, writing prompt, and quiz for ANY of the 1,000 curriculum slots.
 */
export function buildDetailedLessonForSlot(
  chapter: ChapterInfo,
  lessonNumber: number
): DetailedLesson {
  const stub = chapter.lessons[lessonNumber - 1];
  const domainIndex = (chapter.chapterNumber + lessonNumber - 2) % ALL_DOMAINS.length;
  const domain = ALL_DOMAINS[domainIndex];
  const grammarIndex = (chapter.chapterNumber * 3 + lessonNumber) % GRAMMAR_TOPICS.length;
  const grammarTopic = GRAMMAR_TOPICS[grammarIndex];

  const m1 = SAFWATUL_MASADIR_LIST[(chapter.chapterNumber + lessonNumber) % SAFWATUL_MASADIR_LIST.length];
  const m2 = SAFWATUL_MASADIR_LIST[(chapter.chapterNumber + lessonNumber + 11) % SAFWATUL_MASADIR_LIST.length];
  const m3 = SAFWATUL_MASADIR_LIST[(chapter.chapterNumber + lessonNumber + 23) % SAFWATUL_MASADIR_LIST.length];

  // Rotate conversation slightly by lessonNumber so each of the 10 lessons in a chapter feels fresh
  const rawDialogue = domain.dialogue;
  const shift = (lessonNumber - 1) % 6;
  const dialogueSlice =
    shift === 0
      ? rawDialogue
      : [rawDialogue[0], rawDialogue[1], ...rawDialogue.slice(2 + shift), ...rawDialogue.slice(2, 2 + shift)];

  const conversation = dialogueSlice.slice(0, 15).map((d) => ({
    speaker: d.speakerAr,
    speakerRoleBn: d.speakerBn,
    arabic: d.arabic,
    pronunciationBn: d.pronunciationBn,
    translationBn: d.meaningBn,
    translationEn: d.meaningEn,
  }));

  // Append a 16th Safwatul Masadir integration line so every lesson has 16 lines (between 15 and 20 lines)
  conversation.push({
    speaker: 'الأُسْتَاذُ',
    speakerRoleBn: 'উস্তায (ছরফ চর্চা)',
    arabic: m1.exampleAr,
    pronunciationBn: `${m1.masdarPronunciationBn} — (${m1.babNameBn})`,
    translationBn: `${m1.exampleBn} [মাসদার: ${m1.masdarAr} = ${m1.meaningBn}]`,
    translationEn: `${m1.meaningEn} (${m1.masdarAr})`,
  });

  const newVocabulary = [
    ...domain.vocabulary.map((v, idx) => ({
      id: `gen-v-${chapter.chapterNumber}-${lessonNumber}-${idx}`,
      arabic: v.arabic,
      pronunciationBn: v.pronunciationBn,
      meaningBn: v.meaningBn,
      meaningEn: v.meaningEn,
      category: chapter.titleEn,
      root: v.masdarNote,
      exampleAr: rawDialogue[idx % rawDialogue.length]?.arabic || m1.exampleAr,
      exampleBn: rawDialogue[idx % rawDialogue.length]?.meaningBn || m1.exampleBn,
      exampleEn: rawDialogue[idx % rawDialogue.length]?.meaningEn || m1.meaningEn,
    })),
    ...[m1, m2].map((m, idx) => ({
      id: `gen-sm-${chapter.chapterNumber}-${lessonNumber}-${idx}`,
      arabic: `${m.masdarAr} (${m.madiAr} / ${m.mudariAr})`,
      pronunciationBn: m.masdarPronunciationBn,
      meaningBn: `${m.meaningBn} [${m.babNameBn}]`,
      meaningEn: m.meaningEn,
      category: 'সফওয়াতুল মাসাদির',
      root: m.rootLetters,
      exampleAr: m.exampleAr,
      exampleBn: m.exampleBn,
      exampleEn: m.meaningEn,
    })),
  ];

  const revisionVocabulary = [
    {
      id: `gen-rev-${chapter.chapterNumber}-${lessonNumber}`,
      arabic: m3.masdarAr,
      pronunciationBn: m3.masdarPronunciationBn,
      meaningBn: `${m3.meaningBn} (${m3.madiAr} / ${m3.mudariAr})`,
      meaningEn: m3.meaningEn,
      category: 'সফওয়াতুল মাসাদির রিভিশন',
      root: m3.rootLetters,
      exampleAr: m3.exampleAr,
      exampleBn: m3.exampleBn,
      exampleEn: m3.meaningEn,
    },
  ];

  const grammarExamples = grammarTopic.examples.map((ex) => ({
    arabic: ex.arabic,
    pronunciationBn: ex.pronunciationBn,
    meaningBn: `${ex.meaningBn} — বিশ্লেষণ: ${ex.analysisBn}`,
    meaningEn: ex.meaningBn,
  }));

  const firstQuiz = grammarTopic.quiz[0];
  const quiz = [
    firstQuiz,
    {
      id: `gen-q-${chapter.chapterNumber}-${lessonNumber}`,
      questionBn: `সফওয়াতুল মাসাদির অনুযায়ী "${m1.masdarAr}" শব্দের বাংলা অর্থ এবং বাব কোনটি?`,
      questionEn: `What is the meaning of "${m1.masdarAr}"?`,
      arabicPrompt: m1.masdarAr,
      options: [
        `${m1.meaningBn} (${m1.babNameBn})`,
        `${m2.meaningBn} (${m2.babNameBn})`,
        `${m3.meaningBn} (${m3.babNameBn})`,
        'কোনোটিই নয়',
      ],
      correctIndex: 0,
      explanationBn: `${m1.masdarAr} হলো ${m1.babNameBn}-এর মাসদার, এর অর্থ "${m1.meaningBn}" (মাদি: ${m1.madiAr}, মুদারি: ${m1.mudariAr})।`,
      explanationEn: `${m1.masdarAr} means "${m1.meaningEn}".`,
    },
  ];

  return {
    id: `ch${chapter.chapterNumber}-l${lessonNumber}`,
    chapterNumber: chapter.chapterNumber,
    lessonNumber,
    titleAr: stub?.titleAr || chapter.titleAr,
    titleBn: stub?.titleBn || `${chapter.titleBn} — পাঠ ${lessonNumber}`,
    titleEn: stub?.titleEn || `${chapter.titleEn} — Lesson ${lessonNumber}`,
    track: chapter.track,
    objectivesBn: [
      `মাবাদিউল আরাবিয়াহ-র স্তর ${chapter.level} ধারাবাহিকতায় "${chapter.titleBn}" বিষয়ে ১৬ লাইনের কথোপকথন আয়ত্ত করা।`,
      `ব্যাকরণ নিয়ম (${grammarTopic.sourceBook || 'হেদায়েতুন নাহু'}): ${grammarTopic.titleBn} উদাহরণসহ শেখা।`,
      `সফওয়াতুল মাসাদির থেকে "${m1.masdarAr}" ও "${m2.masdarAr}" মাসদারের ব্যবহার ও গর্দান অনুশীলন করা।`,
    ],
    objectivesEn: [
      `Master a 16-line Level ${chapter.level} Arabic dialogue on ${chapter.titleEn}.`,
      `Understand classical grammar rule: ${grammarTopic.titleEn}.`,
      `Practice verbal nouns from Safwatul Masadir: ${m1.masdarAr}, ${m2.masdarAr}.`,
    ],
    newVocabulary,
    revisionVocabulary,
    grammarTopicAr: grammarTopic.titleAr,
    grammarTopicBn: `${grammarTopic.titleBn} [${grammarTopic.sourceBook || 'হেদায়েতুন নাহু / কাফিয়া'}]`,
    grammarExplanationBn: `${grammarTopic.explanationBn}\n\nমূল নীতি:\n• ${grammarTopic.rulesBn.join('\n• ')}`,
    grammarExplanationEn: grammarTopic.explanationEn,
    grammarExamples,
    conversation,
    writingPromptBn: `এই পাঠের ব্যাকরণ (${grammarTopic.titleBn}) এবং নতুন শব্দ ("${m1.madiAr} / ${m1.mudariAr}") ব্যবহার করে একটি শুদ্ধ আরবি বাক্য লিখুন:`,
    writingPromptEn: `Write a correct Arabic sentence applying "${grammarTopic.titleEn}" and "${m1.madiAr}".`,
    writingTargetHintAr: m1.exampleAr,
    translationExercises: [
      {
        direction: 'ar-to-bn',
        prompt: conversation[1]?.arabic || m1.exampleAr,
        answer: conversation[1]?.translationBn || m1.exampleBn,
        hint: conversation[1]?.pronunciationBn || m1.masdarPronunciationBn,
      },
      {
        direction: 'bn-to-ar',
        prompt: m2.exampleBn,
        answer: m2.exampleAr,
        hint: `${m2.madiAr} / ${m2.mudariAr}`,
      },
    ],
    quiz,
  };
}
