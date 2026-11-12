import { InterfaceLang } from '../types/academy';

export interface Translations {
  brandName: string;
  nav: {
    courses: string;
    aiTeacher: string;
    practice: string;
    quranic: string;
    dashboard: string;
    startLearning: string;
  };
  sidebar: {
    overview: string;
    dashboard: string;
    aiTeacher: string;
    courses: string;
    beginners: string;
    dailyLessons: string;
    baynaYadayk: string;
    safwatulMasadir: string;
    listening: string;
    speaking: string;
    grammar: string;
    quranic: string;
    vocabulary: string;
    quiz: string;
    practice: string;
    dailyChallenge: string;
    leaderboard: string;
    certificates: string;
    profile: string;
    admin: string;
    themes: string;
    prayerWeather: string;
    auth: string;
    theme: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  themes: {
    'sky-cloud': string;
    emerald: string;
    midnight: string;
    light: string;
    madinah: string;
    kaaba: string;
    parchment: string;
    andalus: string;
  };
  common: {
    playAudio: string;
    slowAudio: string;
    stopAudio: string;
    pronunciation: string;
    meaningBn: string;
    meaningEn: string;
    completed: string;
    markComplete: string;
    askAi: string;
    xp: string;
    streak: string;
    level: string;
    days: string;
    minutes: string;
    lessons: string;
    chapters: string;
  };
}

export const I18N: Record<InterfaceLang, Translations> = {
  bn: {
    brandName: 'AI Arabic Academy',
    nav: {
      courses: 'কোর্সসমূহ',
      aiTeacher: 'AI শিক্ষক',
      practice: 'অনুশীলন',
      quranic: 'কুরআনিক আরবি',
      dashboard: 'ড্যাশবোর্ড',
      startLearning: 'শেখা শুরু করুন',
    },
    sidebar: {
      overview: 'মূল মেনু',
      dashboard: 'ড্যাশবোর্ড',
      aiTeacher: 'AI আরবি শিক্ষক',
      courses: '১০০ অধ্যায় কোর্স',
      beginners: 'শুরুর ধাপ (Beginner)',
      dailyLessons: 'দৈনন্দিন পাঠ (১–১০০)',
      baynaYadayk: 'বাইনা ইয়াদাইক (সংলাপ)',
      safwatulMasadir: 'সফওয়াতুল মাসাদির',
      listening: 'শ্রবণ অনুশীলন',
      speaking: 'কথোপকথন ও উচ্চারণ',
      grammar: 'নাহু ও ছরফ (ব্যাকরণ)',
      quranic: 'কুরআনিক আরবি',
      vocabulary: 'শব্দভাণ্ডার (SRS)',
      quiz: 'কুইজ ও পরীক্ষা',
      practice: 'সমন্বিত অনুশীলন',
      dailyChallenge: 'দৈনিক চ্যালেঞ্জ',
      leaderboard: 'লিডারবোর্ড ও ব্যাজ',
      certificates: 'সার্টিফিকেট',
      profile: 'প্রোফাইল ও সেটিংস',
      admin: 'অ্যাডমিন প্যানেল',
      themes: 'লাইভ থিম স্টুডিও',
      prayerWeather: 'নামাজ, ঘড়ি ও আবহাওয়া',
      auth: 'লগইন / অ্যাকাউন্ট',
      theme: 'থিম',
      language: 'ভাষা',
    },
    hero: {
      eyebrow: 'আধুনিক ও কুরআনিক আরবি শিক্ষার পূর্ণাঙ্গ প্ল্যাটফর্ম',
      title: 'শুদ্ধ হারাকাত, ব্যাকরণ ও AI শিক্ষকের সাথে আরবি শিখুন',
      subtitle:
        'স্কুল, কলেজ, বিশ্ববিদ্যালয় ও মাদরাসা শিক্ষার্থীদের জন্য ১০০ অধ্যায়ের সুশৃঙ্খল সিলেবাস, নাহু-ছরফ, কুরআনিক শব্দ বিশ্লেষণ এবং বাংলায় সার্বক্ষণিক AI টিউটর।',
      primaryCta: 'শেখা শুরু করুন',
      secondaryCta: 'AI শিক্ষককে প্রশ্ন করুন',
    },
    themes: {
      'sky-cloud': 'উজ্জ্বল আকাশ ও মেঘ',
      emerald: 'ইসলামিক এমারেল্ড',
      midnight: 'মিডনাইট ডার্ক',
      light: 'লাইট একাডেমিক',
      madinah: 'মদীনা রোজ-টিল',
      kaaba: 'কিসওয়া গোল্ড',
      parchment: 'পাণ্ডুলিপি ক্রিম',
      andalus: 'আন্দালুসীয় নীল',
    },
    common: {
      playAudio: 'শুনুন',
      slowAudio: 'ধীরে শুনুন',
      stopAudio: 'থামুন',
      pronunciation: 'বাংলা উচ্চারণ',
      meaningBn: 'বাংলা অর্থ',
      meaningEn: 'English Meaning',
      completed: 'সম্পন্ন',
      markComplete: 'পাঠ সম্পন্ন করুন',
      askAi: 'AI শিক্ষককে জিজ্ঞাসা করুন',
      xp: 'XP',
      streak: 'স্ট্রিক',
      level: 'স্তর',
      days: 'দিন',
      minutes: 'মিনিট',
      lessons: 'পাঠ',
      chapters: 'অধ্যায়',
    },
  },
  en: {
    brandName: 'AI Arabic Academy',
    nav: {
      courses: 'Courses',
      aiTeacher: 'AI Teacher',
      practice: 'Practice',
      quranic: 'Quranic',
      dashboard: 'Dashboard',
      startLearning: 'Start Learning',
    },
    sidebar: {
      overview: 'Main',
      dashboard: 'Dashboard',
      aiTeacher: 'AI Arabic Teacher',
      courses: '100-Chapter Courses',
      beginners: 'Beginners Track',
      dailyLessons: 'Daily Lessons (1–100)',
      baynaYadayk: 'Bayna Yadayk Units',
      safwatulMasadir: 'Safwatul Masadir',
      listening: 'Listening Lab',
      speaking: 'Speaking Lab',
      grammar: 'Nahw & Sarf',
      quranic: 'Quranic Arabic',
      vocabulary: 'Vocabulary (SRS)',
      quiz: 'Quiz & Exams',
      practice: 'Practice Hub',
      dailyChallenge: 'Daily Challenge',
      leaderboard: 'Leaderboard',
      certificates: 'Certificates',
      profile: 'Profile & Settings',
      admin: 'Admin Control',
      themes: 'Live Theme Studio',
      prayerWeather: 'Prayer, Clock & Weather',
      auth: 'Login / Account',
      theme: 'Theme',
      language: 'Language',
    },
    hero: {
      eyebrow: 'Modern Standard & Quranic Arabic Platform',
      title: 'Master Arabic with Full Harakat, Grammar & an AI Scholar',
      subtitle:
        'Built for school, college, university, and madrasa learners with a structured 100-chapter curriculum, Nahw & Sarf, Quranic word analysis, and Bengali-guided AI tutoring.',
      primaryCta: 'Start Learning',
      secondaryCta: 'Ask AI Teacher',
    },
    themes: {
      'sky-cloud': 'Radiant Sky & Clouds',
      emerald: 'Islamic Emerald',
      midnight: 'Midnight Dark',
      light: 'Light Academic',
      madinah: 'Madinah Rose-Teal',
      kaaba: 'Kiswah Gold',
      parchment: 'Manuscript Cream',
      andalus: 'Andalusian Sky',
    },
    common: {
      playAudio: 'Listen',
      slowAudio: 'Slow Audio',
      stopAudio: 'Stop',
      pronunciation: 'Bengali Pronunciation',
      meaningBn: 'Bengali Meaning',
      meaningEn: 'English Meaning',
      completed: 'Completed',
      markComplete: 'Complete Lesson',
      askAi: 'Ask AI Teacher',
      xp: 'XP',
      streak: 'Streak',
      level: 'Level',
      days: 'Days',
      minutes: 'Mins',
      lessons: 'Lessons',
      chapters: 'Chapters',
    },
  },
  ar: {
    brandName: 'أكاديمية العربية بالذكاء',
    nav: {
      courses: 'المناهج',
      aiTeacher: 'المعلم الذكي',
      practice: 'التدريب',
      quranic: 'العربية القرآنية',
      dashboard: 'لوحة الطالب',
      startLearning: 'ابدأ التعلم',
    },
    sidebar: {
      overview: 'القائمة الرئيسية',
      dashboard: 'لوحة الطالب',
      aiTeacher: 'المعلم الذكي',
      courses: 'منهج ١٠٠ فصل',
      beginners: 'مسار المبتدئين',
      dailyLessons: 'الدروس اليومية (١–١٠٠)',
      baynaYadayk: 'العربية بين يديك',
      safwatulMasadir: 'صفوة المصادر',
      listening: 'مختبر الاستماع',
      speaking: 'مختبر التحدث',
      grammar: 'النحو والصرف',
      quranic: 'العربية القرآنية',
      vocabulary: 'بنك المفردات',
      quiz: 'الاختبارات',
      practice: 'مركز التدريب',
      dailyChallenge: 'التحدي اليومي',
      leaderboard: 'لوحة المتصدرين',
      certificates: 'الشهادات',
      profile: 'الملف الشخصي',
      admin: 'لوحة المشرف',
      themes: 'استوديو المظاهر',
      prayerWeather: 'الصلاة والساعة والطقس',
      auth: 'تسجيل الدخول',
      theme: 'المظهر',
      language: 'اللغة',
    },
    hero: {
      eyebrow: 'منصة شاملة لتعليم الفصحى ولغة القرآن الكريم',
      title: 'أتقن اللغة العربية بالتشكيل الكامل والنحو والمعلم الذكي',
      subtitle:
        'منهج متدرج من ١٠٠ فصل لطلاب المدارس والجامعات مع شرح بنغالي دقيق، تدريبات الاستماع والتحدث، وتحليل مفردات القرآن الكريم.',
      primaryCta: 'ابدأ التعلم الآن',
      secondaryCta: 'اسأل المعلم الذكي',
    },
    themes: {
      'sky-cloud': 'السماء المشرقة والسحب',
      emerald: 'الزمرد الإسلامي',
      midnight: 'الليلي الداكن',
      light: 'الأكاديمي الفاتح',
      madinah: 'روضة المدينة',
      kaaba: 'الذهب الكسوة',
      parchment: 'ورق المخطوطات',
      andalus: 'الأزرق الأندلسي',
    },
    common: {
      playAudio: 'استمع',
      slowAudio: 'استماع بطيء',
      stopAudio: 'إيقاف',
      pronunciation: 'النطق بالبنغالية',
      meaningBn: 'المعنى بالبنغالية',
      meaningEn: 'المعنى بالإنجليزية',
      completed: 'مكتمل',
      markComplete: 'إتمام الدرس',
      askAi: 'اسأل المعلم الذكي',
      xp: 'نقطة',
      streak: 'سلسلة',
      level: 'المستوى',
      days: 'أيام',
      minutes: 'دقيقة',
      lessons: 'دروس',
      chapters: 'فصول',
    },
  },
};
