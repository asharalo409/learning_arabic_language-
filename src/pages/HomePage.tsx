import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Headphones,
  Layers,
  LayoutDashboard,
  LogIn,
  Mic,
  Palette,
  ScrollText,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MuslimCompanionStrip } from '../components/MuslimCompanionStrip';
import { ResilientImage } from '../components/ResilientImage';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import quranArtImg from '../assets/images/quranic_manuscript_art_1794510740673.jpg';

interface CoreHubCard {
  hubBadge: string;
  titleBn: string;
  subtitleBn: string;
  descBn: string;
  gradientClass: string;
  primaryTo: string;
  primaryLabel: string;
  items: {
    label: string;
    to: string;
    icon: typeof BookOpen;
  }[];
}

export const HomePage: React.FC = () => {
  const { t, lang, openWelcome } = useApp();
  const { user } = useAuth();

  const coreHubs: CoreHubCard[] = [
    {
      hubBadge: 'হাব ১ · মূল পাঠ্যক্রম',
      titleBn: 'ধাপে ধাপে ১০০ অধ্যায় আরবি কোর্স',
      subtitleBn: 'একদম শুরু (হরফ) থেকে ৬ষ্ঠ স্তর পর্যন্ত',
      descBn: 'বর্ণমালা, হারাকাত ও ১০০টি অধ্যায়ের ডুয়োলিঙ্গো-স্টাইল পথ — প্রতিটি স্তরের হিসাব সংরক্ষিত থাকবে।',
      gradientClass: 'from-emerald-600 via-teal-600 to-cyan-700',
      primaryTo: '/courses',
      primaryLabel: '১–১০০ ধাপ ম্যাপ খুলুন',
      items: [
        { label: '১–১০০ ধাপ কোর্স', to: '/courses', icon: BookOpen },
        { label: 'শ্রবণ চর্চা', to: '/listening', icon: Headphones },
        { label: 'দৈনিক অনুশীলন', to: '/practice', icon: Sparkles },
      ],
    },
    {
      hubBadge: 'হাব ২ · কোরআনের মাধ্যমে পড়ুন',
      titleBn: 'কোরআনের মাধ্যমে পড়ুন (২৬ সূরা)',
      subtitleBn: 'সূরা আল-ফাতিহা + শেষ ২৫ সূরা (৯০–১১৪) ও গ্রামার',
      descBn: 'সম্পূর্ণ হারাকাতসহ সূরা আল-ফাতিহা ও শেষ ২৫ সূরার আয়াত, বাংলা অর্থ, অডিও এবং শব্দের ছরফ-নাহু বিশ্লেষণ।',
      gradientClass: 'from-rose-600 via-red-600 to-orange-600',
      primaryTo: '/quranic-arabic',
      primaryLabel: 'কোরআনের মাধ্যমে পড়ুন',
      items: [
        { label: 'কোরআনের মাধ্যমে পড়ুন', to: '/quranic-arabic', icon: ScrollText },
        { label: 'শব্দভাণ্ডার (SRS)', to: '/vocabulary', icon: Layers },
      ],
    },
    {
      hubBadge: 'হাব ৩ · নাহু ও ছরফ',
      titleBn: 'সফওয়াতুল মাসাদির, নাহু ও ছরফ',
      subtitleBn: 'কিতাবি ব্যাকরণ, গর্দান, ইসম ও সিফাত ভান্ডার',
      descBn: '৮৭৭+ মাসদারের ১৪ সিগাহ গর্দান, বিষয়ভিত্তিক ইসম-সিফাত ভান্ডার ও কাফিয়া-হেদায়েতুন নাহুর নিয়মাবলি।',
      gradientClass: 'from-amber-500 via-orange-600 to-amber-700',
      primaryTo: '/safwatul-masadir',
      primaryLabel: 'গর্দান দেখুন',
      items: [
        { label: 'সফওয়াতুল মাসাদির', to: '/safwatul-masadir', icon: BookOpenCheck },
        { label: 'নাহু ও ছরফ', to: '/grammar', icon: GraduationCap },
      ],
    },
    {
      hubBadge: 'হাব ৪ · AI লাইভ কল ও পরীক্ষা',
      titleBn: 'AI লাইভ ভয়েস রোবট, বলা ও কুইজ',
      subtitleBn: 'Gemini-Live এর মতো আরবি + বাংলা ভয়েস কল',
      descBn: 'মুখে আরবি বললে AI ভুল শুধরে দেবে এবং আরবি ও বাংলা দুটোই মুখে পড়ে শোনাবে — সাথে পরীক্ষা ও সনদ।',
      gradientClass: 'from-indigo-600 via-violet-600 to-purple-700',
      primaryTo: '/ai-teacher',
      primaryLabel: 'কথা বলুন',
      items: [
        { label: 'AI ভয়েস রোবট', to: '/ai-teacher', icon: Bot },
        { label: 'কথোপকথন ও বলা', to: '/speaking', icon: Mic },
        { label: 'কুইজ ও পরীক্ষা', to: '/quiz', icon: ClipboardCheck },
        { label: 'দৈনিক চ্যালেঞ্জ', to: '/daily-challenge', icon: Trophy },
        { label: 'সার্টিফিকেট', to: '/certificates', icon: Award },
        { label: 'লিডারবোর্ড', to: '/leaderboard', icon: Trophy },
      ],
    },
    {
      hubBadge: 'হাব ৫ · নামাজ, ঘড়ি ও সেটিংস',
      titleBn: 'নামাজ, ক্যালিগ্রাফি ঘড়ি, থিম ও প্রোফাইল',
      subtitleBn: 'আকাশ-নীল ঘড়ি, আরবি ক্যালিগ্রাফি ঘড়ি ও আবহাওয়া',
      descBn: '৫ ওয়াক্ত নামাজ-আজান, বাংলা-হিজরি তারিখ, ছেলে/মেয়ে কণ্ঠ সেটিংস ও উজ্জ্বল ইসলামিক থিম স্টুডিও।',
      gradientClass: 'from-sky-500 via-blue-600 to-indigo-700',
      primaryTo: '/prayer-weather',
      primaryLabel: 'সময়সূচি দেখুন',
      items: [
        { label: 'নামাজ ও ঘড়ি', to: '/prayer-weather', icon: Clock },
        { label: 'থিম স্টুডিও', to: '/themes', icon: Palette },
        { label: 'প্রোফাইল ও কণ্ঠ', to: '/profile', icon: User },
        { label: user ? 'অ্যাকাউন্ট' : 'লগইন', to: '/auth', icon: LogIn },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] pb-10">
      <Navbar />

      {/* Compact Hero Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-3.5 pb-3.5 lg:pt-5 lg:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 space-y-2.5">
            <button
              type="button"
              onClick={openWelcome}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-sky-500/15 border border-emerald-500/35 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-300 hover:scale-[1.01] transition-transform"
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="text-left">প্রতিষ্ঠাতা: তাসীন বিল্লাহ · আল কুরআন এণ্ড ইসলামিক স্টাডিজ, ইবি</span>
            </button>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug tracking-tight">
              {t.hero.title}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* Compact Primary Entry Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:brightness-105 transition-all whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{user ? 'ধাপ ১ থেকে শুরু' : 'গেস্ট হিসেবে শুরু করুন'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/ai-teacher"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:brightness-105 transition-all whitespace-nowrap"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI ভয়েস কল</span>
              </Link>

              <Link
                to={user ? '/dashboard' : '/auth'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold btn-secondary whitespace-nowrap"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>ড্যাশবোর্ড</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>লগইন</span>
                  </>
                )}
              </Link>
            </div>
          </div>

          {/* Right Radiant Quranic Manuscript Card (Compact) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border-strong)] shadow-md aspect-[16/9] max-h-[195px] w-full">
              <ResilientImage
                src={quranArtImg}
                alt="Illuminated Quranic Arabic Manuscript"
                className="w-full h-full object-cover"
                fallbackTitle="AI Arabic Academy"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white space-y-0.5">
                <p className="font-arabic text-lg sm:text-xl text-[#E5C158]" dir="rtl">
                  رَبِّ زِدْنِي عِلْمًا
                </p>
                <p className="text-[10.5px] text-white/90">
                  {lang === 'bn'
                    ? '৫টি সহজ হাবের মাধ্যমে হরফ থেকে কুরআন ও কথোপকথন'
                    : '5 streamlined hubs from Arabic letters to Quranic speech'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Muslim Companion Strip: Compact Clock + Weather + Bangla/Hijri/Prayer */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <MuslimCompanionStrip compact />
      </section>

      {/* 5 Distinct Compact Core Learning Hubs */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-5 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              5 STREAMLINED LEARNING HUBS
            </span>
            <h2 className="text-lg sm:text-xl font-bold leading-tight">
              সহজ ৫টি শিক্ষা কেন্দ্র
            </h2>
          </div>
          <Link to="/courses" className="text-xs font-bold text-[var(--accent)] hover:underline whitespace-nowrap">
            ১০০ অধ্যায় গেম পথ →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coreHubs.map((hub, idx) => (
            <div
              key={hub.hubBadge}
              className={`rounded-xl p-3 sm:p-3.5 text-white shadow-sm bg-gradient-to-br ${hub.gradientClass} flex flex-col justify-between gap-2 relative overflow-hidden ${
                idx === 3 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div className="space-y-1 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-white/85">
                    {hub.hubBadge}
                  </span>
                  <Link
                    to={hub.primaryTo}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10.5px] font-extrabold shadow-xs hover:scale-105 transition-transform shrink-0"
                  >
                    <span>{hub.primaryLabel}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold leading-snug">{hub.titleBn}</h3>
                <div className="text-[10.5px] font-medium text-white/85 truncate">{hub.subtitleBn}</div>
                <p className="text-[10.5px] text-white/85 leading-snug line-clamp-2">{hub.descBn}</p>
              </div>

              {/* Compact Links inside each Hub */}
              <div className="flex flex-wrap gap-1 pt-2 border-t border-white/20 relative z-10">
                {hub.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 hover:bg-black/35 backdrop-blur-sm border border-white/15 text-[10.5px] font-bold text-white transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compact Founder Message Card */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="rounded-xl p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white border border-emerald-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5 max-w-2xl">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">প্রতিষ্ঠাতার বার্তা</span>
            <h2 className="text-sm sm:text-base font-bold">
              তাসীন বিল্লাহ — আল কুরআন এণ্ড ইসলামিক স্টাডিজ বিভাগ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়
            </h2>
            <p className="text-[11px] text-emerald-50/90 leading-snug">
              সকল শিক্ষার্থীর জন্য কুরআনিক ও আধুনিক আরবি শেখাকে সহজ করতে এই একাডেমি নির্মিত হয়েছে। একবার লগইন করলে অগ্রগতি সেভ থাকবে, অথবা গেস্ট হিসেবেও পড়তে পারবেন।
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={openWelcome}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/25 whitespace-nowrap"
            >
              আহলান ওয়া সাহলান
            </button>
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 whitespace-nowrap shadow"
            >
              {user ? 'আমার ড্যাশবোর্ড' : 'লগইন করুন'}
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-[var(--border-subtle)] glass-panel py-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>
            © {new Date().getFullYear()} <strong className="text-[var(--text-primary)]">AI Arabic Academy</strong> · প্রতিষ্ঠাতা: তাসীন বিল্লাহ (আল কুরআন এণ্ড ইসলামিক স্টাডিজ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়)
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/courses" className="hover:text-[var(--accent)]">কোর্স</Link>
            <Link to="/quranic-arabic" className="hover:text-[var(--accent)]">শেষ ২৫ সূরা</Link>
            <Link to="/ai-teacher" className="hover:text-[var(--accent)]">AI ভয়েস রোবট</Link>
            <Link to="/prayer-weather" className="hover:text-[var(--accent)]">নামাজ ও ঘড়ি</Link>
            <Link to="/auth" className="hover:text-[var(--accent)]">লগইন</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
