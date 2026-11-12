export type ThemeMode =
  | 'sky-cloud'
  | 'emerald'
  | 'midnight'
  | 'light'
  | 'madinah'
  | 'kaaba'
  | 'parchment'
  | 'andalus';
export type BackdropIntensity = 'vivid' | 'gentle' | 'off';
export type InterfaceLang = 'bn' | 'en' | 'ar';
export type LearningTrack = 'MSA' | 'Quranic' | 'Combined';

export type CurriculumLevelNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface CurriculumLevelInfo {
  level: CurriculumLevelNumber;
  slug: string;
  nameBn: string;
  nameEn: string;
  nameAr: string;
  chapterStart: number;
  chapterEnd: number;
  descriptionBn: string;
  descriptionEn: string;
}

export interface VocabItem {
  id: string;
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  category: string;
  root?: string;
  exampleAr: string;
  exampleBn: string;
  exampleEn: string;
  isQuranic?: boolean;
}

export interface DialogueLine {
  speaker: string;
  speakerRoleBn: string;
  arabic: string;
  pronunciationBn: string;
  translationBn: string;
  translationEn: string;
}

export interface LessonQuizQuestion {
  id: string;
  questionBn: string;
  questionEn: string;
  arabicPrompt?: string;
  options: string[];
  correctIndex: number;
  explanationBn: string;
  explanationEn: string;
}

export interface DetailedLesson {
  id: string; // e.g., "ch1-l1"
  chapterNumber: number;
  lessonNumber: number;
  titleAr: string;
  titleBn: string;
  titleEn: string;
  track: LearningTrack;
  objectivesBn: string[];
  objectivesEn: string[];
  newVocabulary: VocabItem[];
  revisionVocabulary: VocabItem[];
  grammarTopicAr: string;
  grammarTopicBn: string;
  grammarExplanationBn: string;
  grammarExplanationEn: string;
  grammarExamples: {
    arabic: string;
    pronunciationBn: string;
    meaningBn: string;
    meaningEn: string;
  }[];
  conversation: DialogueLine[]; // 15 lines
  writingPromptBn: string;
  writingPromptEn: string;
  writingTargetHintAr: string;
  translationExercises: {
    direction: 'ar-to-bn' | 'bn-to-ar';
    prompt: string;
    answer: string;
    hint: string;
  }[];
  quiz: LessonQuizQuestion[];
}

export interface SyllabusLessonStub {
  lessonNumber: number;
  titleAr: string;
  titleBn: string;
  titleEn: string;
  grammarFocus: string;
  hasFullContent: boolean;
}

export interface ChapterInfo {
  chapterNumber: number;
  level: CurriculumLevelNumber;
  track: LearningTrack;
  titleAr: string;
  titleBn: string;
  titleEn: string;
  objectiveBn: string;
  objectiveEn: string;
  lessons: SyllabusLessonStub[];
}

export type ClassicalSourceBook =
  | 'মাবাদিউল আরাবিয়াহ'
  | 'নাহুমীর ও মিয়াতে আমিল'
  | 'হেদায়েতুন নাহু'
  | 'কাফিয়া'
  | 'মীযানুস ছরফ ও মুনশাঈব'
  | 'সফওয়াতুল মাসাদির';

export interface GrammarTopic {
  id: string;
  titleAr: string;
  titleBn: string;
  titleEn: string;
  branch: 'Nahw' | 'Sarf';
  sourceBook?: ClassicalSourceBook;
  summaryBn: string;
  explanationBn: string;
  explanationEn: string;
  rulesBn: string[];
  examples: {
    arabic: string;
    pronunciationBn: string;
    meaningBn: string;
    analysisBn: string;
  }[];
  quiz: LessonQuizQuestion[];
}

export type HaftAqsamType =
  | 'Sahih'
  | 'Mahmuz'
  | 'Mudaaf'
  | 'Mithal'
  | 'Ajwaf'
  | 'Naqis'
  | 'Lafif';

export interface MasdarEntry {
  id: string;
  babCategory: 'Thulathi Mujarrad' | 'Thulathi Mazid' | 'Rubai';
  sarfType?: HaftAqsamType;
  babNameAr: string;
  babNameBn: string;
  masdarAr: string;
  masdarPronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  madiAr: string;
  mudariAr: string;
  amrAr: string;
  ismFailAr: string;
  ismMafulAr: string;
  rootLetters: string;
  exampleAr: string;
  exampleBn: string;
}

export interface QuranWordAnalysis {
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  root: string;
  posBn: string;
  grammarNoteBn: string;
}

export interface QuranAyah {
  surahNumber: number;
  surahNameAr: string;
  surahNameBn: string;
  surahNameEn: string;
  ayahNumber: number;
  arabic: string;
  pronunciationBn: string;
  translationBn: string;
  translationEn: string;
  words: QuranWordAnalysis[];
  reflectionBn: string;
}

export interface ListeningExercise {
  id: string;
  type: 'word' | 'sentence' | 'conversation';
  titleBn: string;
  titleEn: string;
  level: string;
  arabic: string;
  pronunciationBn: string;
  translationBn: string;
  translationEn: string;
  comprehensionQuestionBn: string;
  options: string[];
  correctIndex: number;
}

export interface SpeakingExercise {
  id: string;
  category: 'daily' | 'pronunciation' | 'quranic';
  titleBn: string;
  titleEn: string;
  arabicTarget: string;
  pronunciationBn: string;
  meaningBn: string;
  meaningEn: string;
  tipBn: string;
}

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'fill-blank' | 'ar-to-bn' | 'bn-to-ar' | 'grammar' | 'vocabulary' | 'listening' | 'writing';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  promptBn: string;
  promptEn: string;
  arabicText?: string;
  options?: string[];
  correctAnswer: string;
  explanationBn: string;
}

export interface ExamHistoryEntry {
  id: string;
  dateIso: string;
  mode: string;
  difficulty: string;
  score: number;
  total: number;
  percentage: number;
  durationSeconds: number;
}

export interface VocabProgressRecord {
  wordId: string;
  ease: number;
  intervalDays: number;
  nextReviewIso: string;
  repetitions: number;
  favorite: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestampIso: string;
  titleBn: string;
  titleEn: string;
  xpEarned: number;
  type: 'lesson' | 'quiz' | 'vocab' | 'speaking' | 'listening' | 'ai' | 'daily';
}

export interface StudentProgress {
  studentName: string;
  preferredTrack: LearningTrack;
  dailyTargetMinutes: number;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  totalMinutesLearned: number;
  completedLessonIds: string[];
  completedGrammarIds: string[];
  dailyChallengeCompletedDates: string[];
  vocabProgress: Record<string, VocabProgressRecord>;
  examHistory: ExamHistoryEntry[];
  recentActivities: ActivityLogEntry[];
  unlockedBadgeIds: string[];
}

export interface AdminCustomContent {
  customChapters: ChapterInfo[];
  customLessons: Record<string, DetailedLesson>;
  customVocab: VocabItem[];
  customQuestions: ExamQuestion[];
}
