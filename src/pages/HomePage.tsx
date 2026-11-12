import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bot,
  ClipboardCheck,
  Clock,
  Compass,
  GraduationCap,
  Headphones,
  Layers,
  LayoutDashboard,
  ListChecks,
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

interface RoadmapStep {
  stepNumber: string;
  titleBn: string;
  subtitleBn: string;
  descBn: string;
  items: {
    label: string;
    to: string;
    icon: typeof BookOpen;
  }[];
}

export const HomePage: React.FC = () => {
  const { t, lang, openWelcome } = useApp();
  const { user } = useAuth();

  const roadmapSteps: RoadmapStep[] = [
    {
      stepNumber: 'ধাপ ১',
      titleBn: 'ভিত্তি, বর্ণমালা ও শুরুর স্তর',
      subtitleBn: 'একদম শুরু থেকে সঠিক ভিত্তি গড়ুন',
      descBn: 'হরফ, হারাকাত, প্রাথমিক শব্দ ও ১০০ অধ্যায়ের পূর্ণাঙ্গ পাঠ্যক্রমের শুরু।',
      items: [
        { label: 'শুরুর ধাপ (Beginner)', to: '/courses/beginners', icon: Compass },
        { label: '১০০ অধ্যায় কোর্স সূচি', to: '/courses', icon: BookOpen },
      ],
    },
    {
      stepNumber: 'ধাপ ২',
      titleBn: 'দৈনন্দিন পাঠ ও সংলাপ চর্চা',
      subtitleBn: 'মাবাদিউল আরাবিয়াহ ও বাইনা ইয়াদাইক',
      descBn: 'ধাপে ধাপে ১৬–২০ লাইনের বাস্তব কথোপকথন ও চার-স্তম্ভের আরবি পাঠ।',
      items: [
        { label: 'দৈনন্দিন পাঠ (১–১০০)', to: '/daily-lessons', icon: ListChecks },
        { label: 'বাইনা ইয়াদাইক ইউনিট', to: '/bayna-yadayk', icon: BookMarked },
      ],
    },
    {
      stepNumber: 'ধাপ ৩',
      titleBn: 'নাহু ও ছরফ (আরবি ব্যাকরণ)',
      subtitleBn: 'সফওয়াতুল মাসাদির, কাফিয়া ও হেদায়েতুন নাহু',
      descBn: '১৪০+ মাসদারের ১৪ সিগাহ গর্দান এবং ৪৫টি সুবিন্যস্ত কিতাবি ব্যাকরণ।',
      items: [
        { label: 'সফওয়াতুল মাসাদির', to: '/safwatul-masadir', icon: BookOpenCheck },
        { label: 'নাহু ও ছরফ ব্যাকরণ', to: '/grammar', icon: GraduationCap },
      ],
    },
    {
      stepNumber: 'ধাপ ৪',
      titleBn: 'কুরআনিক আরবি ও শব্দভাণ্ডার',
      subtitleBn: 'শব্দের মূলধাতু (জযর) ও স্থায়ী স্মৃতি (SRS)',
      descBn: 'কুরআনের আয়াত শব্দে শব্দে বিশ্লেষণ ও প্রতিদিন নতুন শব্দ আয়ত্ত করুন।',
      items: [
        { label: 'কুরআনিক আরবি ল্যাব', to: '/quranic-arabic', icon: ScrollText },
        { label: 'শব্দভাণ্ডার (SRS)', to: '/vocabulary', icon: Layers },
      ],
    },
    {
      stepNumber: 'ধাপ ৫',
      titleBn: 'শ্রবণ, উচ্চারণ ও AI ভয়েস রোবট',
      subtitleBn: 'ছেলে/মেয়ে কণ্ঠে সরাসরি আরবি-বাংলা কথা বলুন',
      descBn: 'গোল AI ভয়েস রোবটের সাথে স্পিকারে কথা বলা, শোনা ও উচ্চারণ অনুশীলন।',
      items: [
        { label: 'AI ভয়েস রোবট শিক্ষক', to: '/ai-teacher', icon: Bot },
        { label: 'শ্রবণ অনুশীলন', to: '/listening', icon: Headphones },
        { label: 'কথোপকথন ও বলা', to: '/speaking', icon: Mic },
      ],
    },
    {
      stepNumber: 'ধাপ ৬',
      titleBn: 'পরীক্ষা, চ্যালেঞ্জ ও সার্টিফিকেট',
      subtitleBn: 'নিজের দক্ষতা যাচাই ও অর্জন',
      descBn: 'অধ্যায়ভিত্তিক কুইজ, দৈনিক চ্যালেঞ্জ ও একাডেমিক মূল্যায়ন।',
      items: [
        { label: 'কুইজ ও পরীক্ষা', to: '/quiz', icon: ClipboardCheck },
        { label: 'দৈনিক চ্যালেঞ্জ', to: '/daily-challenge', icon: Trophy },
        { label: 'সার্টিফিকেট', to: '/certificates', icon: Award },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <Navbar />

      {/* Clean Hero Section (Zero human photos) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 lg:pt-14 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <button
              type="button"
              onClick={openWelcome}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full surface-card border border-[var(--border-strong)] text-xs font-semibold text-[var(--accent)] hover:scale-[1.01] transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>প্রতিষ্ঠাতা: তাসীন বিল্লাহ · আল কুরআন এণ্ড ইসলামিক স্টাডিজ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়</span>
            </button>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {t.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>

            {/* Primary Entry Actions: Clear Guest vs Account Choice */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/courses/beginners"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold btn-primary shadow-md whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>{user ? 'ধাপ ১ থেকে শুরু করুন' : 'গেস্ট হিসেবে শেখা শুরু করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/ai-teacher"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold btn-secondary whitespace-nowrap"
              >
                <Bot className="w-4 h-4 text-[var(--accent)]" />
                <span>AI ভয়েস রোবট</span>
              </Link>

              <Link
                to={user ? '/dashboard' : '/auth'}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold btn-secondary whitespace-nowrap"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="w-4 h-4 text-[var(--accent)]" />
                    <span>আমার ড্যাশবোর্ড</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[var(--accent)]" />
                    <span>লগইন (ড্যাশবোর্ডের জন্য)</span>
                  </>
                )}
              </Link>
            </div>
          </div>

          {/* Right Radiant Quranic Manuscript Card (No people) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border-strong)] shadow-xl aspect-[4/3]">
              <ResilientImage
                src={quranArtImg}
                alt="Illuminated Quranic Arabic Manuscript"
                className="w-full h-full object-cover"
                fallbackTitle="AI Arabic Academy"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white space-y-1">
                <p className="font-arabic text-2xl sm:text-3xl text-[#E5C158]" dir="rtl">
                  رَبِّ زِدْنِي عِلْمًا
                </p>
                <p className="text-xs text-white/90">
                  {lang === 'bn'
                    ? 'শুরু থেকে উচ্চতর স্তর পর্যন্ত ৬ ধাপের সুশৃঙ্খল আরবি শিক্ষা'
                    : 'A clean 6-step curriculum from Arabic letters to fluency'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Muslim Companion Strip: Clock + Next Prayer/Adhan + Weather */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <MuslimCompanionStrip />
      </section>

      {/* Step-by-Step 6-Stage Organized Curriculum */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
              STEP-BY-STEP LEARNING PATH
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              ধাপে ধাপে সাজানো পূর্ণাঙ্গ আরবি শিক্ষা
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              অগোছালো নয় — ১ম ধাপ থেকে শুরু করে প্রতিটি বিষয় ক্রমানুসারে অনুশীলন করুন।
            </p>
          </div>
          <Link to="/courses" className="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline whitespace-nowrap">
            ১০০ অধ্যায় সম্পূর্ণ রোডম্যাপ →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmapSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="surface-card rounded-3xl p-6 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold">
                    {step.stepNumber}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">{step.subtitleBn}</span>
                </div>
                <h3 className="text-lg font-bold">{step.titleBn}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.descBn}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                {step.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl surface-alt border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-colors text-xs font-semibold"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[var(--accent)]" />
                        <span>{item.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clean Companion & Personalization Row */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/prayer-weather"
            className="surface-card rounded-2xl p-5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex items-center gap-4 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold">নামাজ, আজান, ঘড়ি ও আবহাওয়া</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">৫ ওয়াক্ত সময়সূচি, কিবলা ও লাইভ আবহাওয়া</div>
            </div>
          </Link>

          <Link
            to="/themes"
            className="surface-card rounded-2xl p-5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex items-center gap-4 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold">ইসলামিক থিম ও বুদবুদ স্টুডিও</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">মসজিদ, কাবা, মদীনা ও উজ্জ্বল আকাশের থিম</div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="surface-card rounded-2xl p-5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex items-center gap-4 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold">প্রোফাইল ও ছেলে/মেয়ে কণ্ঠ সেটিংস</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">AI শিক্ষক ছেলে না মেয়ে কণ্ঠে কথা বলবে তা ঠিক করুন</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Founder Message Card */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="surface-card rounded-3xl p-6 sm:p-8 border border-[var(--border-strong)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold text-[var(--accent)]">প্রতিষ্ঠাতার বার্তা</span>
            <h2 className="text-xl sm:text-2xl font-bold">
              তাসীন বিল্লাহ — আল কুরআন এণ্ড ইসলামিক স্টাডিজ বিভাগ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              মাদরাসা, স্কুল, কলেজ ও বিশ্ববিদ্যালয়ের সকল শিক্ষার্থীর জন্য কুরআনিক ও আধুনিক আরবি শেখাকে সহজ ও গোছালো করতে এই একাডেমি নির্মিত হয়েছে। চাইলে গেস্ট হিসেবে পড়তে পারেন, অথবা লগইন করে নিজের ড্যাশবোর্ডে উন্নতি সংরক্ষণ করতে পারেন।
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={openWelcome}
              className="px-4 py-2.5 rounded-full text-xs font-semibold btn-secondary whitespace-nowrap"
            >
              আহলান ওয়া সাহলান কার্ড
            </button>
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="px-5 py-2.5 rounded-full text-xs font-semibold btn-primary whitespace-nowrap"
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
            <Link to="/ai-teacher" className="hover:text-[var(--accent)]">AI ভয়েস রোবট</Link>
            <Link to="/prayer-weather" className="hover:text-[var(--accent)]">নামাজ ও আবহাওয়া</Link>
            <Link to="/themes" className="hover:text-[var(--accent)]">থিম স্টুডিও</Link>
            <Link to="/auth" className="hover:text-[var(--accent)]">লগইন</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
