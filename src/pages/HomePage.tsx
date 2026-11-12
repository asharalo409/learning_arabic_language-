import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bot,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogIn,
  Palette,
  ScrollText,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ResilientImage } from '../components/ResilientImage';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import heroLibraryImg from '../assets/images/hero_islamic_library_1794510739976.jpg';

export const HomePage: React.FC = () => {
  const { t, lang, openWelcome } = useApp();
  const { user } = useAuth();

  const sections = [
    {
      title: 'দৈনন্দিন পাঠ (১–১০০)',
      tag: 'মাবাদিউল আরাবিয়াহ আদলে',
      desc: 'সহজ থেকে কঠিন ৬ স্তরে ১৬–২০ লাইন সংলাপ, শব্দার্থ, ব্যাকরণ ও AI চর্চা।',
      to: '/daily-lessons',
      icon: ListChecks,
      accent: 'border-l-4 border-l-sky-500',
    },
    {
      title: 'সফওয়াতুল মাসাদির',
      tag: '১৪০+ মাসদার ও গর্দান',
      desc: 'সুলাসি মুজাররাদ ৬ বাব, মাজীদ ফীহ ও হাফত আকসামসহ পূর্ণ ১৪ সিগাহ টেবিল।',
      to: '/safwatul-masadir',
      icon: BookOpenCheck,
      accent: 'border-l-4 border-l-emerald-500',
    },
    {
      title: 'বাইনা ইয়াদাইক (সংলাপ)',
      tag: '৪-স্তম্ভ ইউনিট',
      desc: 'ইউনিটভিত্তিক ৩টি সংলাপ, শব্দকোষ, বাক্য অনুশীলন ও মাখরাজ ধ্বনি চর্চা।',
      to: '/bayna-yadayk',
      icon: BookMarked,
      accent: 'border-l-4 border-l-amber-500',
    },
    {
      title: 'নাহু ও ছরফ ব্যাকরণ',
      tag: 'কাফিয়া ও হেদায়েতুন নাহু',
      desc: '৪৫টি সুবিন্যস্ত কিতাবি ব্যাকরণ অধ্যায়—মারফুআত, মানসুবাত, আমেল ও ছরফ।',
      to: '/grammar',
      icon: GraduationCap,
      accent: 'border-l-4 border-l-teal-500',
    },
    {
      title: 'কুরআনিক আরবি ল্যাব',
      tag: 'শব্দে শব্দে জذر ও তাদাব্বুর',
      desc: 'সূরা ফাতিহা ও কুরআনের আয়াতের প্রতিটি শব্দের মূলধাতু, ইরাব ও অর্থ।',
      to: '/quranic-arabic',
      icon: ScrollText,
      accent: 'border-l-4 border-l-yellow-500',
    },
    {
      title: 'AI আরবি শিক্ষক ও ভয়েস',
      tag: '২৪/৭ বাংলা-আরবি টিউটর',
      desc: 'বাংলা বা আরবিতে কথা বলে প্রশ্ন করুন এবং হারাকাতসহ উত্তর ও অডিও শুনুন।',
      to: '/ai-teacher',
      icon: Bot,
      accent: 'border-l-4 border-l-indigo-500',
    },
    {
      title: 'লাইভ থিম স্টুডিও',
      tag: 'ডিএনএ ঢেউ, মেঘ ও বুদবুদ',
      desc: 'উজ্জ্বল আকাশ, মেঘ ও হাত ছোঁয়ালে নেচে ওঠা ডিএনএ ঢেউয়ের ৮টি জীবন্ত থিম।',
      to: '/themes',
      icon: Palette,
      accent: 'border-l-4 border-l-cyan-500',
    },
    {
      title: 'ড্যাশবোর্ড ও লিডারবোর্ড',
      tag: 'পয়েন্ট ও র‍্যাঙ্কিং',
      desc: 'সকল শিক্ষার্থীর XP পয়েন্ট, দৈনিক স্ট্রিক ও ব্যক্তিগত শেখার উন্নতি দেখুন।',
      to: '/leaderboard',
      icon: Trophy,
      accent: 'border-l-4 border-l-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <Navbar />

      {/* Clean, Spacious Hero Section */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
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

            {/* Primary Actions — Clean & Focused */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/courses/beginners"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold btn-primary shadow-md whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={user ? '/dashboard' : '/auth'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold btn-secondary whitespace-nowrap"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="w-4 h-4 text-[var(--accent)]" />
                    <span>আমার ড্যাশবোর্ড</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[var(--accent)]" />
                    <span>Gmail দিয়ে লগইন / অ্যাকাউন্ট</span>
                  </>
                )}
              </Link>

              <Link
                to="/themes"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl text-sm btn-secondary whitespace-nowrap"
              >
                <Palette className="w-4 h-4 text-[var(--accent)]" />
                <span>থিম ও বুদবুদ</span>
              </Link>
            </div>
          </div>

          {/* Right Radiant Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border-strong)] shadow-xl aspect-[4/3]">
              <ResilientImage
                src={heroLibraryImg}
                alt="AI Arabic Academy study sanctuary"
                className="w-full h-full object-cover"
                fallbackTitle="AI Arabic Academy"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white space-y-1">
                <p className="font-arabic text-2xl sm:text-3xl text-[#E5C158]" dir="rtl">
                  رَبِّ زِدْنِي عِلْمًا
                </p>
                <p className="text-xs text-white/90">
                  {lang === 'bn'
                    ? 'প্রত্যেকটি মডিউল নিজস্ব আলাদা ডিজাইনের পৃষ্ঠায় সুসজ্জিত'
                    : 'Every learning lab lives on its own dedicated, distraction-free page'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Dedicated Pages Directory (No Clutter!) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {lang === 'bn' ? 'সুবিন্যস্ত শিক্ষণ পৃষ্ঠাসমূহ' : 'Dedicated Learning Pages'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              যেকোনো কার্ডে ক্লিক করে সরাসরি সেই বিষয়ের নিজস্ব আলাদা পৃষ্ঠা ও সাউন্ড অভিজ্ঞতায় প্রবেশ করুন।
            </p>
          </div>
          <Link to="/courses" className="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline whitespace-nowrap">
            ১০০ অধ্যায় সিলেবাস →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all ${item.accent}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--emerald-highlight)] flex items-center justify-center text-[var(--accent)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">{item.tag}</span>
                  </div>
                  <h3 className="text-base font-bold">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
                <div className="text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1 pt-2 border-t border-[var(--border-subtle)]">
                  <span>পৃষ্ঠা খুলুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
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
              মাদরাসা, স্কুল, কলেজ ও বিশ্ববিদ্যালয়ের সকল শিক্ষার্থীর জন্য কুরআনিক ও আধুনিক আরবি শেখাকে আনন্দময় করতে এই প্ল্যাটফর্ম গড়ে তোলা হয়েছে। আপনার নিজস্ব অ্যাকাউন্টে লগইন করে নিয়মিত পয়েন্ট অর্জন করুন ও লিডারবোর্ডে এগিয়ে থাকুন।
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={openWelcome}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold btn-secondary whitespace-nowrap"
            >
              স্বাগতম ও সালাম শুনুন
            </button>
            <Link
              to="/auth"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold btn-primary whitespace-nowrap"
            >
              {user ? 'প্রোফাইল দেখুন' : 'লগইন করুন'}
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
            <Link to="/themes" className="hover:text-[var(--accent)]">থিম স্টুডিও</Link>
            <Link to="/leaderboard" className="hover:text-[var(--accent)]">লিডারবোর্ড</Link>
            <Link to="/auth" className="hover:text-[var(--accent)]">লগইন</Link>
            <Link to="/admin" className="hover:text-[var(--accent)]">অ্যাডমিন</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
