import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, GraduationCap, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { localizeGrammarLabel } from '../utils/grammarTerminology';
import { AudioButton } from './AudioButton';

type GrammarSectionKey = 'all' | 'kalimah' | 'irab' | 'jumlah' | 'awamil' | 'sarf' | 'pronouns';

interface GrammarRuleCard {
  id: string;
  section: Exclude<GrammarSectionKey, 'all'>;
  titleAr: string;
  titleBn: string;
  accentCls: string;
  summaryBn: string;
  irabRuleBn: string;
  pointsBn: string[];
  exampleAr: string;
  exampleBn: string;
}

const GRAMMAR_CHEATSHEET: GrammarRuleCard[] = [
  {
    id: 'ism-fiel-harf',
    section: 'kalimah',
    titleAr: 'أَقْسَامُ الكَلِمَةِ: اِسْمٌ، فِعْلٌ، حَرْفٌ',
    titleBn: 'কালিমা বা পদের ৩ প্রকার: ইসম, ফেল, হরফ',
    accentCls: 'bg-emerald-500/10 border-emerald-500/30',
    summaryBn: 'অর্থবোধক একক আরবি শব্দকে কালিমা বলে। এটি তিন প্রকার: ইসম (বিশেষ্য/বিশেষণ), ফেল (ক্রিয়া), হরফ (অব্যয়)।',
    irabRuleBn: 'ইসমের শুরুতে ال বা শেষে তানভীন (ً ٍ ٌ) ও যের আসে; ফেলে কাল থাকে; হরফের নিজস্ব পূর্ণ অর্থ নেই।',
    pointsBn: [
      'اِسْم (ইসম): ব্যক্তি, বস্তু, স্থান বা গুণের নাম — যেমন: كِتَابٌ, مُعَلِّمٌ।',
      'فِعْل (ফেল): অতীত (مَاضٍ), বর্তমান/ভবিষ্যৎ (مُضَارِع) ও আদেশ (أَمْر) — যেমন: كَتَبَ, يَكْتُبُ, اُكْتُبْ।',
      'حَرْف (হরফ): দুটি পদ যুক্ত করে — যেমন: فِي, مِنْ, إِلَى, وَ।',
    ],
    exampleAr: 'ذَهَبَ الطَّالِبُ إِلَى المَسْجِدِ.',
    exampleBn: 'ছাত্রটি মসজিদের দিকে গেল। (فِعْل + اِسْم + حَرْف + اِسْم)',
  },
  {
    id: 'marfu-mansub-majrur',
    section: 'irab',
    titleAr: 'الإِعْرَابُ: رَفْعٌ، نَصْبٌ، جَرٌّ',
    titleBn: 'ই‘রাবের মূল ৩ অবস্থা: রাফ‘আ (পেশ), নসব (যবর), জর (যের)',
    accentCls: 'bg-sky-500/10 border-sky-500/30',
    summaryBn: 'বাক্যে অবস্থান ভেদে ইসমের শেষ অক্ষরের হরকত বা চিহ্ন পরিবর্তনকে ই‘রাব বলে।',
    irabRuleBn: 'মরফু (পেশ) হয় মুবতাদা-খবর ও ফায়েল; মনসুব (যবর) হয় মাফঊল; মাজরূর (যের) হয় হরফে জরের পর ও মুদাফ ইলাইহি।',
    pointsBn: [
      'مَرْفُوعَات (রাফ‘আ/পেশ): المُبْتَدَأ، الخَبَر، الفَاعِل، نَائِبُ الفَاعِل، اِسْمُ كَانَ، خَبَرُ إِنَّ।',
      'مَنْصُوبَات (নসব/যবর): المَفْعُول بِهِ، الحَال، التَّمْيِيز، اِسْمُ إِنَّ، خَبَرُ كَانَ।',
      'مَجْرُورَات (জর/যের): المَجْرُور بِحَرْفِ الجَرّ এবং المُضَاف إِلَيْهِ।',
    ],
    exampleAr: 'قَرَأَ مُحَمَّدٌ القُرْآنَ فِي البَيْتِ.',
    exampleBn: 'মুহাম্মাদ (ফায়েল-পেশ) ঘরে (জর-যের) কুরআন (মাফউল-যবর) পড়েছে।',
  },
  {
    id: 'jumlah-ismiyyah',
    section: 'jumlah',
    titleAr: 'الجُمْلَةُ الاسْمِيَّةُ: مُبْتَدَأٌ وَخَبَرٌ',
    titleBn: 'জুমলা ইসমিয়াহ: মুবতাদা (উদ্দেশ্য) ও খবর (বিধেয়)',
    accentCls: 'bg-indigo-500/10 border-indigo-500/30',
    summaryBn: 'যে বাক্য ইসম দিয়ে শুরু হয় তা জুমলা ইসমিয়াহ। প্রথম অংশ মুবতাদা (সাধারণত মারিফা) ও দ্বিতীয় অংশ খবর (সাধারণত নাকিরা)।',
    irabRuleBn: 'মুবতাদা ও খবর উভয়ই সর্বদা মারফু (শেষ অক্ষরে পেশ/দম্মা) হয় এবং বচন ও লিঙ্গে সামঞ্জস্য রাখে।',
    pointsBn: [
      'المُبْتَدَأ (মুবতাদা): যার সম্পর্কে বলা হয় — সাধারণত ال যুক্ত নির্দিষ্ট পদ।',
      'الخَبَر (খবর): মুবতাদা সম্পর্কে যে সংবাদ দেওয়া হয় — সাধারণত তানভীনযুক্ত পদ।',
    ],
    exampleAr: 'العِلْمُ نُورٌ وَالجَهْلُ ظُلْمَةٌ.',
    exampleBn: 'জ্ঞান আলো এবং অজ্ঞতা অন্ধকার।',
  },
  {
    id: 'jumlah-filiyyah',
    section: 'jumlah',
    titleAr: 'الجُمْلَةُ الفِعْلِيَّةُ: فِعْلٌ + فَاعِلٌ + مَفْعُولٌ بِهِ',
    titleBn: 'জুমলা ফি‘লিয়াহ: ক্রিয়া + কর্তা + কর্ম',
    accentCls: 'bg-violet-500/10 border-violet-500/30',
    summaryBn: 'যে বাক্য ক্রিয়া (ফেল) দিয়ে শুরু হয়। প্রথমে ফেল, তারপর ফায়েল (কর্তা) এবং সকর্মক হলে মাফঊল বিহি (কর্ম) আসে।',
    irabRuleBn: 'فَاعِل (কর্তা) সর্বদা মারফু (পেশ) এবং مَفْعُول بِهِ (কর্ম) সর্বদা মনসুব (যবর) হয়।',
    pointsBn: [
      'فِعْل (ক্রিয়া): কাল ও পুরুষ অনুযায়ী রূপ পরিবর্তন হয়।',
      'فَاعِل (কর্তা): যে কাজটি সম্পন্ন করে (প্রশ্ন: কে?) — পেশ পায়।',
      'مَفْعُول بِهِ (কর্ম): যার উপর কাজটি পতিত হয় (প্রশ্ন: কাকে/কী?) — যবর পায়।',
    ],
    exampleAr: 'خَلَقَ اللَّهُ السَّمَاوَاتِ وَالأَرْضَ.',
    exampleBn: 'আল্লাহ আসমানসমূহ ও পৃথিবী সৃষ্টি করেছেন।',
  },
  {
    id: 'idafah-tawsif',
    section: 'jumlah',
    titleAr: 'المُرَكَّبُ الإِضَافِيُّ وَالتَّوْصِيفِيُّ',
    titleBn: 'ইযাফত (সম্বন্ধ পদ) ও তাওসীফ (বিশেষণ-বিশেষ্য)',
    accentCls: 'bg-teal-500/10 border-teal-500/30',
    summaryBn: 'ইযাফত দিয়ে মালিকানা/সম্বন্ধ ("-এর") বোঝায়; আর তাওসীফ দিয়ে গুণবাচক সংযোগ বোঝায়।',
    irabRuleBn: 'মুদাফে ال ও তানভীন বসে না, আর মুদাফ ইলাইহি সর্বদা মাজরূর (যের)। মাওসূফ-সিফাত ৪টি বিষয়ে (ইরাব, বচন, লিঙ্গ, নির্দিষ্টতা) সমান হয়।',
    pointsBn: [
      'ইযাফত: مُضَاف (হালকা — তানভীন ও ال মুক্ত) + مُضَاف إِلَيْهِ (সর্বদা যেরযুক্ত)। যেমন: بَيْتُ اللَّهِ।',
      'তাওসীফ: مَوْصُوف + صِفَة (উভয়ে হরকত ও ال-এ এক)। যেমন: البَيْتُ الكَبِيرُ।',
    ],
    exampleAr: 'قَرَأْتُ كِتَابَ المُعَلِّمِ الجَدِيدَ.',
    exampleBn: 'আমি শিক্ষকের (মুদাফ ইলাইহি) নতুন বইটি (সিফাত) পড়লাম।',
  },
  {
    id: 'huruf-jar-inna-kana',
    section: 'awamil',
    titleAr: 'حُرُوفُ الجَرِّ وَإِنَّ وَكَانَ',
    titleBn: 'হরফে জার, ইন্না ও কানা-এর আমল (ই‘রাব পরিবর্তন)',
    accentCls: 'bg-amber-500/10 border-amber-500/30',
    summaryBn: 'আমেলে লাফযী বাক্যের শব্দের শেষ অক্ষরে যের, যবর বা পেশ আরোপ করে।',
    irabRuleBn: 'হরফে জর পরের পদকে যের দেয়। إِنَّ প্রথম পদকে যবর ও পরের পদকে পেশ দেয়; كَانَ ঠিক বিপরীত কাজ করে।',
    pointsBn: [
      'حُرُوف الجَرّ: مِنْ، إِلَى، عَنْ، عَلَى، فِي، بِـ، كَـ، لِـ — পরের ইসমকে মাজরূর (যের) করে।',
      'إِنَّ وَأَخَوَاتُهَا (إِنَّ، أَنَّ، كَأَنَّ، لٰكِنَّ، لَيْتَ، لَعَلَّ): ইসমকে নসব (যবর), খবরকে রাফ‘আ (পেশ)।',
      'كَانَ وَأَخَوَاتُهَا (كَانَ، أَصْبَحَ، لَيْسَ، ظَلَّ): ইসমকে রাফ‘আ (পেশ), খবরকে নসব (যবর)।',
    ],
    exampleAr: 'إِنَّ مَعَ العُسْرِ يُسْرًا · كَانَ اللَّهُ عَلِيمًا.',
    exampleBn: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে · আল্লাহ সর্বজ্ঞ।',
  },
  {
    id: 'sarf-aqsam',
    section: 'sarf',
    titleAr: 'المِيزَانُ الصَّرْفِيُّ وَالأَقْسَامُ السَّبْعَةُ',
    titleBn: 'ছরফ, ১৪ সিগাহ ও হফত আকসাম (সপ্তক)',
    accentCls: 'bg-rose-500/10 border-rose-500/30',
    summaryBn: 'মীযানুস ছরফে ফা-আইন-লাম (ف ع ل) মূলধাতু হিসেবে ধরে ২৩ বাবে ক্রিয়া রূপান্তর হয়।',
    irabRuleBn: '১৪ সিগাহ: গায়েব (৩ পুং + ৩ স্ত্রী), হাদির (৩ পুং + ৩ স্ত্রী), মুতাকাল্লিম (২টি: واحد ও جمع)।',
    pointsBn: [
      'সপ্তক (হফত আকসাম): صَحِيح (সহীহ), مَهْمُوز (হামযাযুকত), مُضَاعَف (দ্বিত্ব), مِثَال (ফা দুর্বল), أَجْوَف (আইন দুর্বল), نَاقِص (লাম দুর্বল), لَفِيف (দুটি দুর্বল)।',
      'সুলাসি মুজাররাদের ৬ বাব: نَصَرَ (আ-উ), ضَرَبَ (আ-ই), فَتَحَ (আ-আ), سَمِعَ (ই-আ), كَرُمَ (উ-উ), حَسِبَ (ই-ই)।',
    ],
    exampleAr: 'نَصَرَ — يَنْصُرُ — اُنْصُرْ — نَاصِرٌ — مَنْصُورٌ',
    exampleBn: 'সে সাহায্য করেছে — সে সাহায্য করে/করবে — তুমি সাহায্য কর — সাহায্যকারী — সাহায্যপ্রাপ্ত।',
  },
  {
    id: 'damair-isharah',
    section: 'pronouns',
    titleAr: 'الضَّمَائِرُ وَأَسْمَاءُ الإِشَارَةِ وَالمَوْصُولَةُ',
    titleBn: 'সর্বনাম (দমীর), ইসমে ইশারা ও মাওসূল',
    accentCls: 'bg-cyan-500/10 border-cyan-500/30',
    summaryBn: 'এসব পদ মাবনি (অপরিবর্তনশীল) থাকে, তবে বাক্যে রাফ‘আ, নসব ও জরের স্থানে বসে।',
    irabRuleBn: 'বিচ্ছিন্ন সর্বনাম (هُوَ، هِيَ، أَنْتَ، أَنَا، نَحْنُ) সাধারণত মুবতাদা হয়; যুক্ত সর্বনাম (ـهُ، ـهَا، ـكَ، ـي، ـنَا) ইসমের সাথে মুদাফ ইলাইহি হয়।',
    pointsBn: [
      'إِشَارَة (নির্দেশক): هٰذَا (এটি পুং), هٰذِهِ (এটি স্ত্রী), ذٰلِكَ (ঐটি পুং), تِلْكَ (ঐটি স্ত্রী), هٰؤُلَاءِ (এরা)।',
      'مَوْصُول (সম্বন্ধ): الَّذِي (যিনি পুং), الَّتِي (যিনি স্ত্রী), الَّذِينَ (যাঁরা)।',
    ],
    exampleAr: 'هٰذَا الكِتَابُ الَّذِي يَنْفَعُكَ فِي دُرُوسِكَ.',
    exampleBn: 'এটি সেই বই যা তোমার পাঠে তোমার উপকার করবে।',
  },
];

const SECTION_TABS: { key: GrammarSectionKey; labelBn: string; labelAr: string }[] = [
  { key: 'all', labelBn: 'সকল নিয়ম', labelAr: 'الكل' },
  { key: 'kalimah', labelBn: 'কালিমা (৩ পদ)', labelAr: 'الكلمة' },
  { key: 'irab', labelBn: 'ই‘রাব', labelAr: 'الإعراب' },
  { key: 'jumlah', labelBn: 'বাক্য ও তারকিব', labelAr: 'الجملة' },
  { key: 'awamil', labelBn: 'আমেল ও হরফ', labelAr: 'العوامل' },
  { key: 'sarf', labelBn: 'ছরফ ও আকসাম', labelAr: 'الصرف' },
  { key: 'pronouns', labelBn: 'সর্বনাম ও ইশারা', labelAr: 'الضمائر' },
];

export const QuickGrammarReferenceModal: React.FC = () => {
  const {
    quickGrammarOpen,
    setQuickGrammarOpen,
    grammarTerminologyMode,
    setGrammarTerminologyMode,
  } = useApp();
  const [section, setSection] = useState<GrammarSectionKey>('all');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (!quickGrammarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickGrammarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quickGrammarOpen, setQuickGrammarOpen]);

  const visibleCards = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return GRAMMAR_CHEATSHEET.filter((c) => {
      if (section !== 'all' && c.section !== section) return false;
      if (!q) return true;
      return (
        c.titleBn.toLowerCase().includes(q) ||
        c.titleAr.includes(filterText.trim()) ||
        c.summaryBn.toLowerCase().includes(q) ||
        c.irabRuleBn.toLowerCase().includes(q) ||
        c.pointsBn.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [filterText, section]);

  if (!quickGrammarOpen) return null;
  const isArabicMode = grammarTerminologyMode === 'arabic';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={() => setQuickGrammarOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="দ্রুত ব্যাকরণ রেফারেন্স (Quick Grammar Reference)"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[88vh] rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                  দ্রুত আরবি ব্যাকরণ রেফারেন্স (Quick Grammar Reference)
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  নাহুমীর, হেদায়েতুন নাহু ও মীযানুস ছরফ — পাঠ চলাকালীন তাৎক্ষণিক দেখার সারসংক্ষেপ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div
                className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] p-0.5 text-[11px] font-bold"
                role="group"
                aria-label="Terminology"
              >
                <button
                  type="button"
                  onClick={() => setGrammarTerminologyMode('arabic')}
                  className={`px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                    isArabicMode ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setGrammarTerminologyMode('bengali')}
                  className={`px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                    !isArabicMode ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  বাংলা
                </button>
              </div>

              <button
                type="button"
                onClick={() => setQuickGrammarOpen(false)}
                className="p-1.5 rounded-xl btn-secondary"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="যেমন: মুবতাদা, হরফে জার, ইযাফত, ফায়েল, ছরফ..."
                className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SECTION_TABS.map((tab) => {
                const active = section === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSection(tab.key)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors whitespace-nowrap ${
                      active ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {isArabicMode ? tab.labelAr : tab.labelBn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Rule Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {visibleCards.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">
              এই অনুসন্ধানে কোনো কায়দা পাওয়া যায়নি। অন্য পরিভাষা লিখে খুঁজুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleCards.map((card) => (
                <article
                  key={card.id}
                  className={`rounded-2xl border p-4 space-y-2.5 flex flex-col justify-between ${card.accentCls}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-arabic text-lg sm:text-xl font-bold text-[var(--accent)]" dir="rtl">
                          {card.titleAr}
                        </p>
                        <h3 className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
                          {localizeGrammarLabel(card.titleBn, grammarTerminologyMode)}
                        </h3>
                      </div>
                      <AudioButton text={card.exampleAr} compact showSlow={false} />
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {localizeGrammarLabel(card.summaryBn, grammarTerminologyMode)}
                    </p>

                    <div className="rounded-xl bg-[var(--bg-surface)]/85 border border-[var(--border-subtle)] p-2.5 text-xs">
                      <strong className="text-[var(--accent)]">ই‘রাব সূত্র: </strong>
                      <span className="text-[var(--text-primary)]">
                        {localizeGrammarLabel(card.irabRuleBn, grammarTerminologyMode)}
                      </span>
                    </div>

                    <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc ps-4">
                      {card.pointsBn.map((pt, i) => (
                        <li key={i} className="leading-relaxed">
                          {localizeGrammarLabel(pt, grammarTerminologyMode)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-0.5">
                    <p className="font-arabic text-lg text-[var(--text-primary)] text-right" dir="rtl">
                      {card.exampleAr}
                    </p>
                    <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      {localizeGrammarLabel(card.exampleBn, grammarTerminologyMode)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer Shortcuts */}
        <div className="px-4 sm:px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[var(--text-muted)]">বিস্তারিত অনুশীলন ও কুইজের জন্য পূর্ণ মডিউল খুলুন:</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/grammar"
              onClick={() => setQuickGrammarOpen(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold btn-secondary"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>নাহু ও ছরফ মডিউল</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/safwatul-masadir"
              onClick={() => setQuickGrammarOpen(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold btn-primary"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>সফওয়াতুল মাসাদির (২৩ বাব)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
