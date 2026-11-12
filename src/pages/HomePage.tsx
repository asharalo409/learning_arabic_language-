import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bot,
  GraduationCap,
  Headphones,
  Layers,
  ListChecks,
  Mic,
  RefreshCw,
  ScrollText,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { AudioButton } from '../components/AudioButton';
import { Navbar } from '../components/Navbar';
import { ResilientImage } from '../components/ResilientImage';
import { useApp } from '../context/AppContext';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { TODAY_ARABIC_SENTENCES } from '../data/dailyLessonsData';
import { DETAILED_LESSONS } from '../data/detailedLessons';
import { GRAMMAR_TOPICS } from '../data/grammarData';
import { InterfaceLang, ThemeMode } from '../types/academy';
import heroLibraryImg from '../assets/images/hero_islamic_library_1794510739976.jpg';
import quranArtImg from '../assets/images/quranic_manuscript_art_1794510740673.jpg';
import scholarPortraitImg from '../assets/images/scholar_avatar_ustadh_1794510740611.jpg';

export const HomePage: React.FC = () => {
  const { t, lang, setLang, theme, setTheme, progress } = useApp();
  const navigate = useNavigate();
  const [quickQuestion, setQuickQuestion] = useState('');
  const [todayIdx, setTodayIdx] = useState(0);
  const todaySentence = TODAY_ARABIC_SENTENCES[todayIdx % TODAY_ARABIC_SENTENCES.length];

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim()) {
      navigate('/ai-teacher');
      return;
    }
    navigate(`/ai-teacher?q=${encodeURIComponent(quickQuestion.trim())}`);
  };

  const popularLessons = [
    DETAILED_LESSONS['ch1-l1'],
    DETAILED_LESSONS['ch2-l1'],
    DETAILED_LESSONS['ch10-l1'],
    DETAILED_LESSONS['ch17-l1'],
  ].filter(Boolean);

  const features = [
    {
      title: lang === 'bn' ? 'শ্রবণ ও ধীর গতির অডিও' : lang === 'ar' ? 'الاستماع والنطق البطيء' : 'Listening & Slow Playback',
      desc:
        lang === 'bn'
          ? 'প্রতিটি আরবি শব্দ, বাক্য ও ১৫-লাইনের সংলাপে স্বাভাবিক ও ধীর গতির (0.62x) অডিও অনুশীলন।'
          : 'Listen to words, sentences, and 15-line dialogues at normal or slow study speeds.',
      to: '/listening',
      icon: Headphones,
    },
    {
      title: lang === 'bn' ? 'ভয়েস স্পিকিং ল্যাব' : lang === 'ar' ? 'مختبر التحدث الصوتي' : 'Voice Speaking Lab',
      desc:
        lang === 'bn'
          ? 'মাইক্রোফোনে আরবি বলে সরাসরি প্রতিলিপি দেখা এবং AI শিক্ষকের মাধ্যমে ভুল সংশোধন।'
          : 'Practice Arabic pronunciation via microphone and receive instant AI corrective feedback.',
      to: '/speaking',
      icon: Mic,
    },
    {
      title: lang === 'bn' ? 'নাহু ও ছরফ ব্যাকরণ' : lang === 'ar' ? 'النحو والصرف المتكامل' : 'Nahw & Sarf Mastery',
      desc:
        lang === 'bn'
          ? 'ইসম, ফেল, হরফ, মুবতাদা-খবর, ইরাব ও ক্রিয়ার বাবসমূহ বাংলায় ধাপে ধাপে সহজ ব্যাখ্যায়।'
          : 'Fourteen structured Nahw & Sarf modules with Bengali step-by-step explanations and quizzes.',
      to: '/grammar',
      icon: GraduationCap,
    },
    {
      title: lang === 'bn' ? 'স্পেসড রিপিটেশন (SRS)' : lang === 'ar' ? 'التكرار المتباعد للمفردات' : 'Spaced Repetition Vocab',
      desc:
        lang === 'bn'
          ? 'ফ্ল্যাশকার্ড, প্রিয় শব্দ এবং বৈজ্ঞানিক পুনরাবৃত্তি সময়সূচিতে আরবি শব্দভান্ডার স্থায়ী করুন।'
          : 'Retain Arabic roots and daily vocabulary long-term using SM-2 spaced repetition flashcards.',
      to: '/vocabulary',
      icon: Layers,
    },
    {
      title: lang === 'bn' ? 'কুরআনিক শব্দ বিশ্লেষণ' : lang === 'ar' ? 'تحليل مفردات القرآن' : 'Quranic Word Analysis',
      desc:
        lang === 'bn'
          ? 'প্রামাণিক সূরা ও আয়াতের শব্দ-ভিত্তিক মূলধাতু (জذر), ছরফ ও বাংলা অর্থ বিশ্লেষণ।'
          : 'Word-by-word root extraction and grammatical parsing for verified Quranic Ayat.',
      to: '/quranic-arabic',
      icon: ScrollText,
    },
    {
      title: lang === 'bn' ? 'দৈনিক চ্যালেঞ্জ ও সার্টিফিকেট' : lang === 'ar' ? 'التحديات والشهادات' : 'Challenges & Certificates',
      desc:
        lang === 'bn'
          ? 'XP অর্জন, দৈনিক স্ট্রিক রক্ষা, পরীক্ষা এবং কোর্স শেষে প্রিন্টযোগ্য একাডেমি সনদ।'
          : 'Track daily streaks, complete timed exams, unlock badges, and generate Academy certificates.',
      to: '/certificates',
      icon: Trophy,
    },
  ];

  const testimonials = [
    {
      name: 'তানভীর হাসান',
      role: 'ঢাকা বিশ্ববিদ্যালয় (আরবি ও ইসলামিক স্টাডিজ শিক্ষার্থী)',
      quote:
        'আগে নাহু আর ইরাবের নিয়মগুলো এলোমেলো লাগত। এখানে বাংলায় প্রতিটি হরকত ও সংলাপ একসাথে পাওয়ায় ক্লাসের পড়া বুঝতে আমার সময় অর্ধেক কমে এসেছে।',
    },
    {
      name: 'নুসরাত জাহান মিম',
      role: 'আলিম পরীক্ষার্থী, চট্টগ্রাম',
      quote:
        'AI শিক্ষককে বাংলায় প্রশ্ন করলে যেভাবে পূর্ণ হারাকাতসহ ছরফ ভেঙে বুঝিয়ে দেয়, তা রাতের বেলা সেলফ-স্টাডির জন্য অসাধারণ সহায়ক।',
    },
    {
      name: 'আব্দুল্লাহ আল-মামুন',
      role: 'সফটওয়্যার প্রকৌশলী ও জেনারেল লার্নার',
      quote:
        'দৈনিক ২০ মিনিটের স্পেসড রিপিটেশন ও সূরা ফাতিহার শব্দ-বিশ্লেষণ আমাকে নামাজের আয়াতগুলো সরাসরি অর্থসহ অনুধাবন করতে সাহায্য করেছে।',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8 py-2">
            <div className="space-y-5">
              <p className="text-xs sm:text-sm font-medium text-[var(--accent)]">
                {t.hero.eyebrow}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {t.hero.title}
              </h1>
              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                {t.hero.subtitle}
              </p>

              {/* Single Dominant Primary CTA + Secondary Action */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={progress.completedLessonIds.length > 0 ? '/dashboard' : '/courses/beginners'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold btn-primary whitespace-nowrap"
                >
                  <span>{progress.completedLessonIds.length > 0 ? t.nav.dashboard : t.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/ai-teacher"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium btn-secondary whitespace-nowrap"
                >
                  <Bot className="w-4 h-4 text-[var(--accent)]" />
                  <span>{t.hero.secondaryCta}</span>
                </Link>
              </div>
            </div>

            {/* Clean Inline Workspace Preferences Bar (Theme & Language Switchers) */}
            <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[var(--text-muted)]">{t.sidebar.language}:</span>
                {(['bn', 'en', 'ar'] as InterfaceLang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      lang === l ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {l === 'bn' ? 'বাংলা' : l === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[var(--text-muted)]">{t.sidebar.theme}:</span>
                {(['emerald', 'midnight', 'light'] as ThemeMode[]).map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setTheme(th)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      theme === th ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {t.themes[th]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
              <ResilientImage
                src={heroLibraryImg}
                alt="AI Arabic Academy study hall with Arabic manuscripts and warm architectural lighting"
                className="w-full h-full object-cover lg:h-full"
                fallbackTitle="AI Arabic Academy"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <p className="font-arabic text-xl sm:text-2xl text-[#E5C158]" dir="rtl">
                  رَبِّ زِدْنِي عِلْمًا
                </p>
                <p className="text-xs sm:text-sm text-white/90 mt-1">
                  {lang === 'bn'
                    ? 'মডার্ন স্ট্যান্ডার্ড আরবি (MSA) ও কুরআনিক আরবি — একই প্ল্যাটফর্মে ১০০ অধ্যায়'
                    : 'Modern Standard Arabic & Quranic Arabic — 100 structured chapters'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Key Platform Metrics Row below Hero Split */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card rounded-xl p-5">
            <div className="text-2xl font-bold font-mono-num text-[var(--accent)]">100</div>
            <div className="text-sm font-medium mt-1">
              {lang === 'bn' ? 'সুশৃঙ্খল অধ্যায় (৬ স্তর)' : 'Structured Chapters'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {lang === 'bn' ? '১,০০০টি ধাপে ধাপে পাঠ কাঠামো' : '1,000 progressive lesson slots'}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5">
            <div className="text-2xl font-bold font-mono-num text-[var(--accent)]">{GRAMMAR_TOPICS.length}</div>
            <div className="text-sm font-medium mt-1">
              {lang === 'bn' ? 'নাহু ও ছরফ মডিউল' : 'Nahw & Sarf Topics'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {lang === 'bn' ? 'সম্পূর্ণ বাংলা ব্যাখ্যা ও কুইজসহ' : 'With Bengali analysis & quizzes'}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5">
            <div className="text-2xl font-bold font-mono-num text-[var(--accent)]">24/7</div>
            <div className="text-sm font-medium mt-1">
              {lang === 'bn' ? 'Gemini AI আরবি শিক্ষক' : 'Gemini AI Arabic Tutor'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {lang === 'bn' ? 'বাংলা, ইংরেজি ও আরবিতে উত্তর' : 'Bilingual explanations & corrections'}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5">
            <div className="text-2xl font-bold font-mono-num text-[var(--accent)]">2 Tracks</div>
            <div className="text-sm font-medium mt-1">
              {lang === 'bn' ? 'আধুনিক ও কুরআনিক আরবি' : 'MSA & Quranic Arabic'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {lang === 'bn' ? 'স্কুল, মাদরাসা ও সাধারণ শিক্ষার্থীদের জন্য' : 'For school, madrasa & general learners'}
            </div>
          </div>
        </div>

        {/* Today's Arabic Sentence & Quick Hub (Inspired by Bengali mobile Arabic learning flow) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-5 surface-card rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[var(--border-strong)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--accent)]">
                  {lang === 'bn' ? 'আজকের আরবি বাক্য' : lang === 'ar' ? 'جملة اليوم' : "Today's Arabic Sentence"}
                </span>
                <button
                  type="button"
                  onClick={() => setTodayIdx((prev) => (prev + 1) % TODAY_ARABIC_SENTENCES.length)}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'অন্য বাক্য' : 'Next Sentence'}</span>
                </button>
              </div>
              <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] leading-relaxed" dir="rtl">
                {todaySentence.arabic}
              </p>
              <div className="space-y-1 text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {t.common.pronunciation}: <span className="text-[var(--text-secondary)] font-normal">{todaySentence.pronunciationBn}</span>
                </div>
                <div className="text-[var(--text-secondary)]">
                  {lang === 'bn' ? todaySentence.meaningBn : todaySentence.meaningEn}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 flex-wrap">
              <AudioButton text={todaySentence.arabic} />
              <Link
                to="/daily-lessons"
                className="text-xs font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
              >
                {lang === 'bn' ? '১০০টি দৈনন্দিন পাঠ দেখুন →' : 'Open 100 Daily Lessons →'}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/daily-lessons"
              className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <ListChecks className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-xs font-mono-num text-[var(--text-muted)]">পাঠ ১–১০০</span>
                </div>
                <h3 className="text-base font-bold">
                  {lang === 'bn' ? 'মাবাদিউল আরাবিয়াহ আদলে ১০০ পাঠ' : 'Mabadiul Arabiyyah Lessons (1–100)'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'bn'
                    ? 'সহজ থেকে কঠিন ৬টি স্তরে ১০০টি পাঠ—প্রতিটি পাঠে ১৬–২০ লাইনের কথোপকথন, নতুন শব্দ, ব্যাকরণ ও AI চর্চা।'
                    : '100 progressive lessons (Levels 1–6) with 16–20 line dialogues, new vocab, grammar & AI practice.'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)]">
                {lang === 'bn' ? 'পাঠ তালিকা খুলুন →' : 'Open Groups →'}
              </span>
            </Link>

            <Link
              to="/safwatul-masadir"
              className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <BookOpenCheck className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-arabic-ui text-xs text-[var(--accent)]">صفوة المصادر</span>
                </div>
                <h3 className="text-base font-bold">
                  {lang === 'bn' ? 'সফওয়াতুল মাসাদির (সকল বাব ও গর্দান)' : 'Safwatul Masadir (All Verb Roots)'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'bn'
                    ? 'সুলাসি মুজাররাদের ৬ বাব ও মাজীদ ফীহ-এর সকল মাসদার, মাদি, মুদারি, আমর ও AI ১৪-সিগা গর্দান।'
                    : 'All Thulathi Mujarrad & Mazid masadir, Madi, Mudari, Amr, and 14-form AI conjugations.'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)]">
                {lang === 'bn' ? 'মাসদার ভাণ্ডার খুলুন →' : 'Open Masadir →'}
              </span>
            </Link>

            <Link
              to="/bayna-yadayk"
              className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <BookMarked className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-arabic-ui text-xs text-[var(--accent)]">العربية بين يديك</span>
                </div>
                <h3 className="text-base font-bold">
                  {lang === 'bn' ? 'আল-আরাবিয়্যাতু বাইনা ইয়াদাইক' : 'Al-Arabiyyah Bayna Yadayk'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'bn'
                    ? 'মূল কিতাবের আদলে প্রতিটি ইউনিটে ৩টি সংলাপ (حوار), শব্দার্থ, তাদরীব ও মাখরাজ ধ্বনি অনুশীলন।'
                    : 'Authentic unit structure with Dialogues 1–3, Vocabulary, Pattern Drills & Phonetics.'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)]">
                {lang === 'bn' ? 'ইউনিট শুরু করুন →' : 'Start Units →'}
              </span>
            </Link>

            <Link
              to="/grammar"
              className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-xs font-mono-num text-[var(--text-muted)]">{GRAMMAR_TOPICS.length} অধ্যায়</span>
                </div>
                <h3 className="text-base font-bold">
                  {lang === 'bn' ? 'কাফিয়া, হেদায়েতুন নাহু ও মাবাদি নিয়ম' : 'Kafiyah, Hidayah & Mabadi Grammar'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'bn'
                    ? 'মু‘রাব-মাবনি, ৮ মারফুআত, ১২ মানসুবাত, ৫ তাওয়াবে, আমেল, ১৪ সিগার গর্দান ও বালাগাহ।'
                    : 'Complete Kafiyah, Hidayatun Nahw & Mabadi rules: Marfuat, Mansubat, Tawabe & Sarf.'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)]">
                {lang === 'bn' ? 'ব্যাকরণ শিখুন →' : 'Study Grammar →'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Teacher Introduction + Interactive Prompt Launcher */}
      <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[var(--border-strong)] shrink-0">
              <ResilientImage
                src={scholarPortraitImg}
                alt="AI Arabic Teacher Ustadh Portrait"
                className="w-full h-full object-cover"
                fallbackTitle="Ustadh AI"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--accent)]">
                {lang === 'bn' ? 'তাৎক্ষণিক AI টিউটর' : 'Personal AI Tutor'}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold">
                {lang === 'bn' ? 'উস্তায AI-এর সাথে সরাসরি আরবি শিখুন' : 'Learn Directly with Ustadh AI'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {lang === 'bn'
                  ? 'যেকোনো আরবি বাক্য অনুবাদ, নাহু-ছরফ বিশ্লেষণ, লেখা সংশোধন বা কথোপকথন অনুশীলন করুন।'
                  : 'Ask questions in Bengali, English, or Arabic. Get full Harakat, pronunciation, and Nahw/Sarf breakdowns.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleQuickAsk} className="surface-alt rounded-xl p-4 sm:p-5 space-y-3">
              <label htmlFor="quick-ai-ask" className="block text-sm font-medium">
                {lang === 'bn'
                  ? 'AI আরবি শিক্ষককে একটি প্রশ্ন করুন:'
                  : 'Ask the AI Arabic Teacher a question:'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="quick-ai-ask"
                  type="text"
                  value={quickQuestion}
                  onChange={(e) => setQuickQuestion(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: "العِلْمُ نُورٌ" বাক্যটির মুবতাদা-খবর ও বাংলা অর্থ বুঝিয়ে দিন'
                      : 'e.g., Explain Mubtada and Khabar in العِلْمُ نُورٌ with Bengali pronunciation'
                  }
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm btn-primary whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.common.askAi}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                <span>{lang === 'bn' ? 'দ্রুত উদাহরণ:' : 'Try:'}</span>
                <button
                  type="button"
                  onClick={() => setQuickQuestion('মাদি ও মুদারি ক্রিয়ার পার্থক্য উদাহরণসহ বাংলায় বুঝিয়ে দিন')}
                  className="underline hover:text-[var(--accent)] text-left"
                >
                  মাদি ও মুদারির পার্থক্য
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setQuickQuestion('"আমি মসজিদে যাচ্ছি" বাক্যটির শুদ্ধ আরবি কী হবে?')}
                  className="underline hover:text-[var(--accent)] text-left"
                >
                  বাংলা থেকে আরবি অনুবাদ
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Course Categories (6 Levels) */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {lang === 'bn' ? '৬টি ধারাবাহিক শিক্ষা স্তর (১০০ অধ্যায়)' : 'Six Progressive Curriculum Levels'}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {lang === 'bn'
                ? 'শুরু থেকে উচ্চতর বালাগাহ পর্যন্ত প্রতিটি অধ্যায়ে ১০টি করে পাঠ।'
                : 'From Arabic alphabet foundations to classical rhetoric across 100 structured chapters.'}
            </p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-[var(--accent)] hover:underline whitespace-nowrap">
            {lang === 'bn' ? 'সম্পূর্ণ ১০০ অধ্যায় দেখুন →' : 'Explore All 100 Chapters →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CURRICULUM_LEVELS.map((lvl) => (
            <Link
              key={lvl.level}
              to={lvl.level === 1 ? '/courses/beginners' : `/courses?level=${lvl.level}`}
              className="surface-card rounded-xl p-6 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>
                    {lang === 'bn' ? `অধ্যায় ${lvl.chapterStart}–${lvl.chapterEnd}` : `Chapters ${lvl.chapterStart}–${lvl.chapterEnd}`}
                  </span>
                  <span className="font-arabic-ui text-[var(--accent)]">{lvl.nameAr}</span>
                </div>
                <h3 className="text-lg font-bold">
                  {lang === 'bn' ? lvl.nameBn : lvl.nameEn}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'bn' ? lvl.descriptionBn : lvl.descriptionEn}
                </p>
              </div>
              <div className="text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'পাঠ্যক্রম দেখুন' : 'Open Level'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning Features Grid */}
      <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {lang === 'bn' ? 'সক্রিয় অনুশীলন মডিউলসমূহ' : 'Interactive Learning Modules'}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {lang === 'bn'
                ? 'শোনা, বলা, ব্যাকরণ, কুরআনিক শব্দকোষ ও পরীক্ষা—সবকিছু এক জায়গায় বাস্তব অনুশীলনের জন্য তৈরি।'
                : 'Every core Arabic skill—listening, speaking, grammar, Quranic analysis, and testing—wired to real practice.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.to}
                  to={feat.to}
                  className="surface-alt rounded-xl p-6 space-y-3 hover:border-[var(--border-strong)] transition-colors"
                >
                  <Icon className="w-6 h-6 text-[var(--accent)]" />
                  <h3 className="text-lg font-semibold">{feat.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Lessons */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {lang === 'bn' ? 'জনপ্রিয় পূর্ণাঙ্গ পাঠসমূহ' : 'Popular Interactive Lessons'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {lang === 'bn'
                ? 'প্রতিটি পাঠে শব্দভাণ্ডার, বাংলা উচ্চারণ, ব্যাকরণ, ১৫ লাইনের সংলাপ ও কুইজ রয়েছে।'
                : 'Each lesson includes vocabulary, Harakat, Bengali pronunciation, grammar, 15-line dialogue, and quiz.'}
            </p>
          </div>
          <Link to="/courses/beginners" className="text-sm font-semibold text-[var(--accent)] hover:underline">
            {lang === 'bn' ? 'সব পাঠ দেখুন →' : 'Browse Lessons →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {popularLessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/courses?chapter=${lesson.chapterNumber}&lesson=${lesson.lessonNumber}`}
              className="surface-card rounded-xl p-6 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>
                    {lang === 'bn'
                      ? `অধ্যায় ${lesson.chapterNumber} · পাঠ ${lesson.lessonNumber}`
                      : `Chapter ${lesson.chapterNumber} · Lesson ${lesson.lessonNumber}`}
                  </span>
                  <span>{lesson.track}</span>
                </div>
                <p className="font-arabic text-xl text-[var(--accent)]" dir="rtl">
                  {lesson.titleAr}
                </p>
                <h3 className="text-base sm:text-lg font-bold">
                  {lang === 'bn' ? lesson.titleBn : lesson.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {lang === 'bn' ? lesson.grammarTopicBn : lesson.grammarTopicAr}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-[var(--accent)] pt-2 border-t border-[var(--border-subtle)]">
                <span>{lang === 'bn' ? '১৫-লাইন সংলাপ ও কুইজসহ শুরু করুন' : 'Open 22-Point Lesson'}</span>
                <BookOpen className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quranic Arabic Spotlight */}
      <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[var(--border-subtle)] min-h-[260px]">
            <ResilientImage
              src={quranArtImg}
              alt="Illuminated Arabic calligraphy book on dark emerald cloth"
              className="w-full h-full object-cover"
              fallbackTitle="Quranic Arabic"
            />
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <p className="text-xs font-medium text-[var(--accent)]">
              {lang === 'bn' ? 'কুরআনিক আরবি মডিউল' : 'Quranic Arabic Module'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {lang === 'bn'
                ? 'শব্দে শব্দে পবিত্র কুরআনের অর্থ ও মূলধাতু অনুধাবন করুন'
                : 'Understand Authentic Quranic Vocabulary Word by Word'}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {lang === 'bn'
                ? 'সূরা ফাতিহা, সূরা ইখলাস, সূরা আসর এবং সূরা কাওসারের প্রতিটি শব্দের ত্রিবর্ণ মূলধাতু (جذر), নাহু-ছরফ ভূমিকা ও শুদ্ধ বাংলা অনুবাদ।'
                : 'Inspect verified Surah and Ayah references with clickable word-by-word root extraction, Sarf morphology, and Nahw parsing.'}
            </p>

            <div className="surface-alt rounded-xl p-5 space-y-2">
              <div className="text-xs text-[var(--text-muted)]">সূরা আল-ফাতিহা (১:২) — প্রামাণিক আয়াত</div>
              <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                সমস্ত প্রশংসা জগতসমূহের প্রতিপালক আল্লাহর জন্য।
              </p>
            </div>

            <div>
              <Link
                to="/quranic-arabic"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm btn-primary"
              >
                <span>{lang === 'bn' ? 'কুরআনিক আরবি ল্যাব খুলুন' : 'Explore Quranic Arabic'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {lang === 'bn' ? 'শিক্ষার্থীদের অভিজ্ঞতা' : 'Learner Experiences'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {lang === 'bn'
              ? 'স্কুল, বিশ্ববিদ্যালয়, মাদরাসা ও পেশাজীবী শিক্ষার্থীদের বাস্তব শেখার ধারা।'
              : 'How Bengali-speaking students across schools, universities, and professions study Arabic here.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((item) => (
            <div key={item.name} className="surface-card rounded-xl p-6 flex flex-col justify-between gap-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">“{item.quote}”</p>
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clean Footer with All Working Route Links */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <div className="font-bold text-base">{t.brandName}</div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {lang === 'bn'
                ? 'আধুনিক ও কুরআনিক আরবি শিক্ষার পূর্ণাঙ্গ AI একাডেমি।'
                : 'AI-powered Modern Standard & Quranic Arabic Academy.'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xs text-[var(--text-muted)]">{t.nav.courses}</div>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/courses" className="hover:text-[var(--accent)]">{t.sidebar.courses}</Link>
              <Link to="/courses/beginners" className="hover:text-[var(--accent)]">{t.sidebar.beginners}</Link>
              <Link to="/daily-lessons" className="hover:text-[var(--accent)]">{t.sidebar.dailyLessons}</Link>
              <Link to="/bayna-yadayk" className="hover:text-[var(--accent)]">{t.sidebar.baynaYadayk}</Link>
              <Link to="/safwatul-masadir" className="hover:text-[var(--accent)]">{t.sidebar.safwatulMasadir}</Link>
              <Link to="/grammar" className="hover:text-[var(--accent)]">{t.sidebar.grammar}</Link>
              <Link to="/quranic-arabic" className="hover:text-[var(--accent)]">{t.sidebar.quranic}</Link>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xs text-[var(--text-muted)]">{t.nav.practice}</div>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/ai-teacher" className="hover:text-[var(--accent)]">{t.sidebar.aiTeacher}</Link>
              <Link to="/listening" className="hover:text-[var(--accent)]">{t.sidebar.listening}</Link>
              <Link to="/speaking" className="hover:text-[var(--accent)]">{t.sidebar.speaking}</Link>
              <Link to="/vocabulary" className="hover:text-[var(--accent)]">{t.sidebar.vocabulary}</Link>
              <Link to="/quiz" className="hover:text-[var(--accent)]">{t.sidebar.quiz}</Link>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xs text-[var(--text-muted)]">Academy</div>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/dashboard" className="hover:text-[var(--accent)]">{t.sidebar.dashboard}</Link>
              <Link to="/daily-challenge" className="hover:text-[var(--accent)]">{t.sidebar.dailyChallenge}</Link>
              <Link to="/leaderboard" className="hover:text-[var(--accent)]">{t.sidebar.leaderboard}</Link>
              <Link to="/certificates" className="hover:text-[var(--accent)]">{t.sidebar.certificates}</Link>
              <Link to="/profile" className="hover:text-[var(--accent)]">{t.sidebar.profile}</Link>
              <Link to="/admin" className="hover:text-[var(--accent)]">{t.sidebar.admin}</Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} AI Arabic Academy.</span>
          <span>Modern Standard Arabic · Quranic Arabic · Bengali Pedagogy</span>
        </div>
      </footer>
    </div>
  );
};
