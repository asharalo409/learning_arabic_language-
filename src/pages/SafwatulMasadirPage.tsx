import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
  Table2,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { QuickNahwText } from '../components/QuickNahwText';
import { useApp } from '../context/AppContext';
import { ALL_ISM_CATEGORIES } from '../data/ismCategoriesPart2';
import {
  MasadirBabDescriptor,
  SAFWATUL_MASADIR_BABS,
  SAFWATUL_MASADIR_LIST,
  matchesMasdarBab,
} from '../data/safwatulMasadirData';
import { SIFAT_CATEGORIES } from '../data/sifatBankData';
import { HaftAqsamType, IsmSifatCategory, MasdarEntry } from '../types/academy';
import { buildFullSarfPackage } from '../utils/sarfConjugator';

type AqsamViewKey = 'Sahih' | 'mutall-all' | 'Mahmuz' | 'Mudaaf' | 'Mithal' | 'Ajwaf' | 'Naqis' | 'Lafif';

const AQSAM_LAUNCHERS: {
  id: AqsamViewKey;
  labelBn: string;
  labelAr: string;
  hintBn: string;
  cardTone: string;
  activeTone: string;
  arabicTone: string;
}[] = [
  {
    id: 'Sahih',
    labelBn: 'সহীহ (সালিম)',
    labelAr: 'الصَّحِيح',
    hintBn: 'দুর্বল অক্ষর বা হামযা-তাশদীদমুক্ত',
    cardTone: 'bg-emerald-500/8 border-emerald-500/30 hover:border-emerald-500/60',
    activeTone: 'bg-emerald-600 text-white border-emerald-500 shadow-sm',
    arabicTone: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'mutall-all',
    labelBn: 'সব মু‘তাল ও গাইরে সহীহ',
    labelAr: 'المُعْتَلّ وَغَيْرُ السَّالِم',
    hintBn: 'দুর্বল অক্ষর, হামযা ও তাশদীদযুক্ত সব ক্রিয়া',
    cardTone: 'bg-indigo-500/8 border-indigo-500/30 hover:border-indigo-500/60',
    activeTone: 'bg-indigo-600 text-white border-indigo-500 shadow-sm',
    arabicTone: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'Mahmuz',
    labelBn: 'মাহমুয',
    labelAr: 'المَهْمُوز',
    hintBn: 'মূলে হামযা (أ) আছে',
    cardTone: 'bg-amber-500/8 border-amber-500/30 hover:border-amber-500/60',
    activeTone: 'bg-amber-600 text-white border-amber-500 shadow-sm',
    arabicTone: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'Mudaaf',
    labelBn: 'মুদাআফ',
    labelAr: 'المُضَاعَف',
    hintBn: 'আইন ও লাম একই অক্ষর',
    cardTone: 'bg-rose-500/8 border-rose-500/30 hover:border-rose-500/60',
    activeTone: 'bg-rose-600 text-white border-rose-500 shadow-sm',
    arabicTone: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'Mithal',
    labelBn: 'মিসাল',
    labelAr: 'المِثَال',
    hintBn: 'ফা কালিমা দুর্বল (و / ي)',
    cardTone: 'bg-sky-500/8 border-sky-500/30 hover:border-sky-500/60',
    activeTone: 'bg-sky-600 text-white border-sky-500 shadow-sm',
    arabicTone: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'Ajwaf',
    labelBn: 'আজওয়াফ',
    labelAr: 'الأَجْوَف',
    hintBn: 'আইন কালিমা দুর্বল (ا / و / ي)',
    cardTone: 'bg-violet-500/8 border-violet-500/30 hover:border-violet-500/60',
    activeTone: 'bg-violet-600 text-white border-violet-500 shadow-sm',
    arabicTone: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'Naqis',
    labelBn: 'নাক্বিস',
    labelAr: 'النَّاقِص',
    hintBn: 'লাম কালিমা দুর্বল (و / ي)',
    cardTone: 'bg-teal-500/8 border-teal-500/30 hover:border-teal-500/60',
    activeTone: 'bg-teal-600 text-white border-teal-500 shadow-sm',
    arabicTone: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'Lafif',
    labelBn: 'লাফীফ',
    labelAr: 'اللَّفِيف',
    hintBn: 'দুটি দুর্বল অক্ষরযুক্ত',
    cardTone: 'bg-orange-500/8 border-orange-500/30 hover:border-orange-500/60',
    activeTone: 'bg-orange-600 text-white border-orange-500 shadow-sm',
    arabicTone: 'text-orange-600 dark:text-orange-400',
  },
];

const OVERVIEW_CELL_TONES = [
  'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300',
  'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
  'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
  'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300',
  'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300',
  'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
  'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300',
];

const BAB_GROUP_STYLES: Record<
  'Thulathi Mujarrad' | 'Thulathi Mazid' | 'Rubai',
  {
    headerAccent: string;
    cardTone: string;
    badgeTone: string;
    countTone: string;
    footerTone: string;
  }
> = {
  'Thulathi Mujarrad': {
    headerAccent: 'text-emerald-600 dark:text-emerald-400',
    cardTone: 'bg-emerald-500/5 border-emerald-500/25 hover:border-emerald-500/55 hover:bg-emerald-500/10',
    badgeTone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    countTone: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    footerTone: 'text-emerald-600 dark:text-emerald-400',
  },
  'Thulathi Mazid': {
    headerAccent: 'text-sky-600 dark:text-sky-400',
    cardTone: 'bg-sky-500/5 border-sky-500/25 hover:border-sky-500/55 hover:bg-sky-500/10',
    badgeTone: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    countTone: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/25',
    footerTone: 'text-sky-600 dark:text-sky-400',
  },
  Rubai: {
    headerAccent: 'text-violet-600 dark:text-violet-400',
    cardTone: 'bg-violet-500/5 border-violet-500/25 hover:border-violet-500/55 hover:bg-violet-500/10',
    badgeTone: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    countTone: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25',
    footerTone: 'text-violet-600 dark:text-violet-400',
  },
};

type DetailTab = 'overview' | 'gardhan14' | 'amr-nahi' | 'ai-practice';

const PAGE_SIZE = 48;

function matchesAqsamView(entry: MasdarEntry, aqsamKey: AqsamViewKey | 'all'): boolean {
  if (aqsamKey === 'all') return true;
  const t: HaftAqsamType = entry.sarfType || 'Sahih';
  if (aqsamKey === 'mutall-all') return t !== 'Sahih';
  return t === aqsamKey;
}

function safeDecode(val?: string): string | null {
  if (!val) return null;
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}

export const SafwatulMasadirPage: React.FC = () => {
  const { lang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{
    babId?: string;
    aqsamKey?: string;
    masdarId?: string;
    catId?: string;
  }>();

  const pathname = location.pathname;
  const routeBabId = safeDecode(params.babId);
  const routeAqsamKey = safeDecode(params.aqsamKey) as AqsamViewKey | null;
  const routeMasdarId = safeDecode(params.masdarId);
  const routeCatId = safeDecode(params.catId);

  const isIsmSection = pathname.startsWith('/safwatul-masadir/ism');
  const isSifatSection = pathname.startsWith('/safwatul-masadir/sifat');
  const isWordDetailPage = Boolean(routeMasdarId);
  const isRoomListPage = Boolean(routeBabId || routeAqsamKey);
  const isCategoryDetailPage = Boolean((isIsmSection || isSifatSection) && routeCatId);

  // Scoped local search & filter states
  const [hubSearch, setHubSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [subAqsamFilter, setSubAqsamFilter] = useState<'all' | AqsamViewKey>('all');
  const [subBabFilter, setSubBabFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [nounSearch, setNounSearch] = useState('');

  // Reset scroll to top & clean filters when entering a new separate page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setPage(1);
    setRoomSearch('');
    setSubAqsamFilter('all');
    setSubBabFilter('all');
    setNounSearch('');
    if (isWordDetailPage) {
      setDetailTab('overview');
    }
  }, [pathname, isWordDetailPage]);

  const totalIsmCount = useMemo(
    () => ALL_ISM_CATEGORIES.reduce((sum, c) => sum + c.entries.length, 0),
    []
  );
  const totalSifatCount = useMemo(
    () => SIFAT_CATEGORIES.reduce((sum, c) => sum + c.entries.length, 0),
    []
  );

  // Precompute word counts for all 23 Babs and all Aqsam buttons
  const babCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const bab of SAFWATUL_MASADIR_BABS) {
      map[bab.id] = SAFWATUL_MASADIR_LIST.filter((e) => matchesMasdarBab(e, bab.id)).length;
    }
    return map;
  }, []);

  const aqsamCounts = useMemo(() => {
    const map: Record<AqsamViewKey, number> = {
      Sahih: 0,
      'mutall-all': 0,
      Mahmuz: 0,
      Mudaaf: 0,
      Mithal: 0,
      Ajwaf: 0,
      Naqis: 0,
      Lafif: 0,
    };
    for (const item of SAFWATUL_MASADIR_LIST) {
      const t: HaftAqsamType = item.sarfType || 'Sahih';
      if (t !== 'Sahih') map['mutall-all'] += 1;
      map[t] += 1;
    }
    return map;
  }, []);

  const babGroups = useMemo(() => {
    return [
      {
        key: 'Thulathi Mujarrad' as const,
        titleBn: '১. সুলাসি মুজাররাদ (৬টি মৌলিক বাব)',
        titleAr: 'الثُّلَاثِيُّ المُجَرَّدُ',
        descBn: 'মূল ৩ অক্ষরের ৬টি প্রধান বাব — যেকোনো ঘরে প্রবেশ করে শব্দ দেখুন।',
        babs: SAFWATUL_MASADIR_BABS.filter((b) => b.category === 'Thulathi Mujarrad'),
      },
      {
        key: 'Thulathi Mazid' as const,
        titleBn: '২. সুলাসি মাজীদ ফীহ (১৩টি প্রসিদ্ধ বাব)',
        titleAr: 'الثُّلَاثِيُّ المَزِيدُ فِيهِ',
        descBn: '৩ অক্ষরের সাথে অতিরিক্ত হরফ যুক্ত হয়ে গঠিত মুনশাঈবের ১৩টি পূর্ণাঙ্গ বাব।',
        babs: SAFWATUL_MASADIR_BABS.filter((b) => b.category === 'Thulathi Mazid'),
      },
      {
        key: 'Rubai' as const,
        titleBn: '৩. রুবাই মুজাররাদ ও মাজীদ ফীহ (৪টি বাব)',
        titleAr: 'الرُّبَاعِيُّ المُجَرَّدُ وَالمَزِيدُ',
        descBn: '৪ মূল অক্ষরবিশিষ্ট মৌলিক ও বর্ধিত ৪টি বাব।',
        babs: SAFWATUL_MASADIR_BABS.filter((b) => b.category === 'Rubai'),
      },
    ];
  }, []);

  const activeBabDescriptor: MasadirBabDescriptor | undefined = useMemo(
    () => (routeBabId ? SAFWATUL_MASADIR_BABS.find((b) => b.id === routeBabId) : undefined),
    [routeBabId]
  );

  const activeAqsamMeta = useMemo(
    () => (routeAqsamKey ? AQSAM_LAUNCHERS.find((a) => a.id === routeAqsamKey) : undefined),
    [routeAqsamKey]
  );

  // Filtered Masadir list for Room Page OR Hub global search
  const activeMasadirQuery = isRoomListPage ? roomSearch : hubSearch;
  const filteredMasadirList = useMemo(() => {
    return SAFWATUL_MASADIR_LIST.filter((item) => {
      if (routeBabId && !matchesMasdarBab(item, routeBabId)) return false;
      if (routeAqsamKey && !matchesAqsamView(item, routeAqsamKey)) return false;

      if (routeBabId && subAqsamFilter !== 'all' && !matchesAqsamView(item, subAqsamFilter)) {
        return false;
      }
      if (routeAqsamKey && subBabFilter !== 'all' && !matchesMasdarBab(item, subBabFilter)) {
        return false;
      }

      if (activeMasadirQuery.trim()) {
        const trimmed = activeMasadirQuery.trim();
        const q = trimmed.toLowerCase();
        return (
          item.masdarAr.includes(trimmed) ||
          item.madiAr.includes(trimmed) ||
          item.mudariAr.includes(trimmed) ||
          item.rootLetters.includes(trimmed) ||
          item.meaningBn.toLowerCase().includes(q) ||
          item.meaningEn.toLowerCase().includes(q) ||
          item.masdarPronunciationBn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [routeBabId, routeAqsamKey, subAqsamFilter, subBabFilter, activeMasadirQuery]);

  useEffect(() => {
    setPage(1);
  }, [roomSearch, hubSearch, subAqsamFilter, subBabFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMasadirList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedMasadirList = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMasadirList.slice(start, start + PAGE_SIZE);
  }, [filteredMasadirList, safePage]);

  // Resolved selected Masdar for Word Detail Page (/safwatul-masadir/word/:masdarId)
  const selectedMasdar: MasdarEntry = useMemo(() => {
    if (!routeMasdarId) return SAFWATUL_MASADIR_LIST[0];
    return (
      SAFWATUL_MASADIR_LIST.find((m) => m.id === routeMasdarId) || SAFWATUL_MASADIR_LIST[0]
    );
  }, [routeMasdarId]);

  const sarfPackage = useMemo(() => buildFullSarfPackage(selectedMasdar), [selectedMasdar]);

  const masdarScopeContext = useMemo(() => {
    return [
      `মাসদার: ${selectedMasdar.masdarAr} (${selectedMasdar.masdarPronunciationBn}) = ${selectedMasdar.meaningBn}`,
      `বাব: ${selectedMasdar.babNameBn} (${selectedMasdar.babNameAr})`,
      `মূলধাতু: ${selectedMasdar.rootLetters}`,
      `মাদি: ${selectedMasdar.madiAr} | মুদারি: ${selectedMasdar.mudariAr} | আমর: ${selectedMasdar.amrAr}`,
      `ইসমে ফাইল: ${selectedMasdar.ismFailAr} | ইসমে মাফউল: ${selectedMasdar.ismMafulAr}`,
      `হফত আকসাম ও ছরফী নোট: ${sarfPackage.sarfNoteBn}`,
      `উদাহরণ: ${selectedMasdar.exampleAr} (${selectedMasdar.exampleBn})`,
    ].join('\n');
  }, [selectedMasdar, sarfPackage]);

  // Previous / Next sibling Masdar for clean stepping inside the dedicated Word Detail Page
  const navState = location.state as { backTo?: string; siblingIds?: string[] } | null;
  const siblingIds = useMemo(() => {
    if (navState?.siblingIds?.length) return navState.siblingIds;
    const matchedBab = SAFWATUL_MASADIR_BABS.find((b) => matchesMasdarBab(selectedMasdar, b.id));
    if (matchedBab) {
      return SAFWATUL_MASADIR_LIST.filter((e) => matchesMasdarBab(e, matchedBab.id)).map((e) => e.id);
    }
    return SAFWATUL_MASADIR_LIST.map((e) => e.id);
  }, [navState?.siblingIds, selectedMasdar]);

  const siblingIndex = siblingIds.indexOf(selectedMasdar.id);
  const prevWordId = siblingIndex > 0 ? siblingIds[siblingIndex - 1] : null;
  const nextWordId =
    siblingIndex >= 0 && siblingIndex < siblingIds.length - 1 ? siblingIds[siblingIndex + 1] : null;

  const backFromWordHref = useMemo(() => {
    if (navState?.backTo) return navState.backTo;
    const matchedBab = SAFWATUL_MASADIR_BABS.find((b) => matchesMasdarBab(selectedMasdar, b.id));
    return matchedBab ? `/safwatul-masadir/bab/${encodeURIComponent(matchedBab.id)}` : '/safwatul-masadir';
  }, [navState?.backTo, selectedMasdar]);

  // Ism & Sifat data for Hub & Category Detail Pages
  const activeNounCategories: IsmSifatCategory[] = isIsmSection ? ALL_ISM_CATEGORIES : SIFAT_CATEGORIES;
  const activeNounCategoryObj = useMemo(
    () => activeNounCategories.find((c) => c.id === routeCatId) || activeNounCategories[0],
    [activeNounCategories, routeCatId]
  );

  const displayedNounEntries = useMemo(() => {
    const q = nounSearch.trim().toLowerCase();
    const source = isCategoryDetailPage
      ? activeNounCategoryObj.entries
      : activeNounCategories.flatMap((c) => c.entries);

    if (!q) return isCategoryDetailPage ? activeNounCategoryObj.entries : [];
    return source.filter(
      (entry) =>
        entry.arabic.includes(nounSearch.trim()) ||
        (entry.pluralOrFemAr && entry.pluralOrFemAr.includes(nounSearch.trim())) ||
        entry.meaningBn.toLowerCase().includes(q) ||
        entry.meaningEn.toLowerCase().includes(q) ||
        entry.pronunciationBn.toLowerCase().includes(q)
    );
  }, [activeNounCategories, activeNounCategoryObj, isCategoryDetailPage, nounSearch]);

  const openWordDetailPage = (entry: MasdarEntry, backToPath: string, listForStep: MasdarEntry[]) => {
    navigate(`/safwatul-masadir/word/${encodeURIComponent(entry.id)}`, {
      state: {
        backTo: backToPath,
        siblingIds: listForStep.map((x) => x.id),
      },
    });
  };

  // Dynamic page header title & subtitle so each separate page feels genuinely dedicated
  const pageHeader = useMemo(() => {
    if (isWordDetailPage) {
      return {
        title: `${selectedMasdar.masdarAr} — ${selectedMasdar.meaningBn}`,
        subtitle: `${selectedMasdar.babNameBn} · মূলধাতু: ${selectedMasdar.rootLetters} · ১৪ সিগাহ পূর্ণ গর্দান ও বিশ্লেষণ`,
      };
    }
    if (activeBabDescriptor) {
      return {
        title: `ঘর ${activeBabDescriptor.numberBn}: ${activeBabDescriptor.labelBn}`,
        subtitle: `${activeBabDescriptor.labelAr} · ${filteredMasadirList.length}টি মাসদার`,
      };
    }
    if (activeAqsamMeta) {
      return {
        title: `হফত আকসাম: ${activeAqsamMeta.labelBn}`,
        subtitle: `${activeAqsamMeta.labelAr} · ${filteredMasadirList.length}টি মাসদার`,
      };
    }
    if (isCategoryDetailPage) {
      return {
        title: activeNounCategoryObj.titleBn,
        subtitle: `${activeNounCategoryObj.titleAr} · ${activeNounCategoryObj.entries.length}টি শব্দ`,
      };
    }
    return {
      title: lang === 'bn' ? 'সফওয়াতুল মাসাদির, ইসম ও সিফাত ভান্ডার' : 'Safwatul Masadir, Ism & Sifat Library',
      subtitle:
        lang === 'bn'
          ? `২৩টি বাবের ঘরে ${SAFWATUL_MASADIR_LIST.length}+ মাসদার, ${totalIsmCount}টি বিষয়ভিত্তিক ইসম এবং ${totalSifatCount}টি সিফাত`
          : `23 Classical Babs with ${SAFWATUL_MASADIR_LIST.length}+ Masadir, ${totalIsmCount} Nouns & ${totalSifatCount} Adjectives`,
    };
  }, [
    isWordDetailPage,
    selectedMasdar,
    activeBabDescriptor,
    filteredMasadirList.length,
    activeAqsamMeta,
    isCategoryDetailPage,
    activeNounCategoryObj,
    lang,
    totalIsmCount,
    totalSifatCount,
  ]);

  const showTopHubSwitcher = !isWordDetailPage && !isRoomListPage && !isCategoryDetailPage;

  return (
    <AppShell title={pageHeader.title} subtitle={pageHeader.subtitle}>
      <div className="space-y-6">
        {/* =====================================================================
            PAGE 0: TOP 3-LIBRARY MODE SWITCHER (Shown ONLY on the main Hub pages)
            ===================================================================== */}
        {showTopHubSwitcher && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl surface-card border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => navigate('/safwatul-masadir')}
              className={`px-4 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                !isIsmSection && !isSifatSection
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-emerald-500/6 border-emerald-500/20 hover:bg-emerald-500/12 text-[var(--text-primary)]'
              }`}
            >
              <div>
                <div className="text-sm font-extrabold">মাসদার ভান্ডার (২৩ বাব)</div>
                <div className={`text-xs ${!isIsmSection && !isSifatSection ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                  {SAFWATUL_MASADIR_LIST.length}টি সহীহ ও মু‘তাল · ১৪ সিগাহ
                </div>
              </div>
              <Table2 className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/safwatul-masadir/ism')}
              className={`px-4 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                isIsmSection
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-sky-500/6 border-sky-500/20 hover:bg-sky-500/12 text-[var(--text-primary)]'
              }`}
            >
              <div>
                <div className="text-sm font-extrabold">ইসম ভান্ডার (বিষয়ভিত্তিক)</div>
                <div className={`text-xs ${isIsmSection ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                  {ALL_ISM_CATEGORIES.length}টি বিষয় · {totalIsmCount}টি বিশেষ্য
                </div>
              </div>
              <Layers className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/safwatul-masadir/sifat')}
              className={`px-4 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                isSifatSection
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                  : 'bg-violet-500/6 border-violet-500/20 hover:bg-violet-500/12 text-[var(--text-primary)]'
              }`}
            >
              <div>
                <div className="text-sm font-extrabold">সিফাত ভান্ডার (বিশেষণ)</div>
                <div className={`text-xs ${isSifatSection ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                  {SIFAT_CATEGORIES.length}টি বিভাগ · {totalSifatCount}টি সিফাত
                </div>
              </div>
              <Sparkles className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}

        {/* =====================================================================
            PAGE 1: DEDICATED MASDAR WORD DETAIL PAGE (/safwatul-masadir/word/:id)
            ===================================================================== */}
        {isWordDetailPage && (
          <div className="space-y-5">
            {/* Top Back + Prev/Next Bar */}
            <div className="surface-card rounded-2xl p-3 sm:p-4 border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => navigate(backFromWordHref)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold btn-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>তালিকায় ফিরুন</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!prevWordId}
                  onClick={() =>
                    prevWordId &&
                    navigate(`/safwatul-masadir/word/${encodeURIComponent(prevWordId)}`, {
                      state: { backTo: backFromWordHref, siblingIds },
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>আগের শব্দ</span>
                </button>
                <button
                  type="button"
                  disabled={!nextWordId}
                  onClick={() =>
                    nextWordId &&
                    navigate(`/safwatul-masadir/word/${encodeURIComponent(nextWordId)}`, {
                      state: { backTo: backFromWordHref, siblingIds },
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary disabled:opacity-40"
                >
                  <span>পরের শব্দ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Word Hero Card */}
            <div className="surface-card rounded-2xl p-5 sm:p-6 border border-[var(--border-subtle)] space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {selectedMasdar.babNameBn} ({selectedMasdar.babNameAr})
                    </span>
                    {selectedMasdar.sarfType && (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {selectedMasdar.sarfType}
                      </span>
                    )}
                  </div>
                  <p className="font-arabic text-4xl sm:text-5xl text-[var(--accent)] pt-1" dir="rtl">
                    {selectedMasdar.masdarAr}
                  </p>
                  <div className="text-sm text-[var(--text-muted)] space-y-0.5">
                    <div>
                      উচ্চারণ:{' '}
                      <span className="font-semibold text-[var(--text-primary)]">
                        {selectedMasdar.masdarPronunciationBn}
                      </span>
                    </div>
                    <div>
                      মূলধাতু:{' '}
                      <span className="font-arabic text-base text-[var(--text-primary)]">
                        {selectedMasdar.rootLetters}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold pt-1">
                    {selectedMasdar.meaningBn}{' '}
                    <span className="text-sm font-normal text-[var(--text-muted)]">
                      ({selectedMasdar.meaningEn})
                    </span>
                  </h2>
                </div>
                <AudioButton
                  text={`${selectedMasdar.masdarAr}، ${selectedMasdar.madiAr}، ${selectedMasdar.mudariAr}، ${selectedMasdar.amrAr}`}
                  showSlow
                />
              </div>

              {/* 4 Tab Switcher */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setDetailTab('overview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    detailTab === 'overview' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>মূল সিগাহ ও উদাহরণ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('gardhan14')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    detailTab === 'gardhan14' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>১৪ সিগাহ পূর্ণ গর্দান</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('amr-nahi')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    detailTab === 'amr-nahi' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>আমর ও নাহী</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('ai-practice')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    detailTab === 'ai-practice' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI দিয়ে এই মাসদার চর্চা</span>
                </button>
              </div>

              {detailTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'الماضي (অতীত)', val: selectedMasdar.madiAr },
                      { label: 'المضارع (বর্তমান/ভবিষ্যৎ)', val: selectedMasdar.mudariAr },
                      { label: 'الأمر (আদেশ)', val: selectedMasdar.amrAr },
                      { label: 'المصدر (মাসদার)', val: selectedMasdar.masdarAr },
                      { label: 'اسم الفاعل (কর্তা)', val: selectedMasdar.ismFailAr },
                      { label: 'اسم المفعول (কর্ম)', val: selectedMasdar.ismMafulAr },
                      { label: 'اسم الظرف (স্থান/কাল)', val: sarfPackage.zarfAr },
                      { label: 'اسم الآلة (যন্ত্র)', val: sarfPackage.alahAr },
                    ].map((cell, idx) => (
                      <div
                        key={cell.label}
                        className={`rounded-2xl p-3.5 space-y-1 border ${OVERVIEW_CELL_TONES[idx % OVERVIEW_CELL_TONES.length]}`}
                      >
                        <div className="text-[11px] font-bold opacity-85">{cell.label}</div>
                        <div className="font-arabic text-2xl text-[var(--text-primary)]" dir="rtl">
                          {cell.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] space-y-1">
                    <div className="text-sm font-bold text-[var(--accent)]">
                      হফত আকসাম ও ছরফী নিয়ম (মীযানুস ছরফ):
                    </div>
                    <p className="text-[15.5px] sm:text-base text-[var(--text-secondary)] leading-[1.8]">
                      {sarfPackage.sarfNoteBn}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--accent)]">বাক্যে প্রয়োগ:</span>
                      <AudioButton text={selectedMasdar.exampleAr} compact />
                    </div>
                    <QuickNahwText
                      text={selectedMasdar.exampleAr}
                      className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]"
                    />
                    <p className="text-[15.5px] sm:text-base text-[var(--text-primary)] leading-relaxed">
                      {selectedMasdar.exampleBn}
                    </p>
                  </div>
                </div>
              )}

              {detailTab === 'gardhan14' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      মীযানুস ছরফের ১৪ সিগার ধারাবাহিক গর্দান (অতীত ও বর্তমান/ভবিষ্যৎ — মা‘রূফ ও মাজহুল):
                    </p>
                    <AudioButton
                      text={sarfPackage.rows14.slice(0, 6).map((r) => r.madiMaruf).join('، ')}
                      compact
                    />
                  </div>

                  {/* Mobile 14-Sigah Cards */}
                  <div className="md:hidden space-y-2.5">
                    {sarfPackage.rows14.map((row) => (
                      <div
                        key={row.index}
                        className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-mono-num font-bold flex items-center justify-center shrink-0">
                              {row.index}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                                {row.sigahBn}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] truncate">
                                {row.pronounHint}
                              </div>
                            </div>
                          </div>
                          <AudioButton text={`${row.madiMaruf}، ${row.mudariMaruf}`} compact />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-right" dir="rtl">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              الماضي المعروف
                            </div>
                            <div className="font-arabic text-lg text-[var(--text-primary)] mt-0.5">
                              {row.madiMaruf}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25">
                            <div className="text-[10px] font-bold text-sky-700 dark:text-sky-300">
                              المضارع المعروف
                            </div>
                            <div className="font-arabic text-lg text-[var(--text-primary)] mt-0.5">
                              {row.mudariMaruf}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              الماضي المجهول
                            </div>
                            <div className="font-arabic text-lg text-[var(--text-primary)] mt-0.5">
                              {row.madiMajhul}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25">
                            <div className="text-[10px] font-bold text-violet-700 dark:text-violet-300">
                              المضارع المجهول
                            </div>
                            <div className="font-arabic text-lg text-[var(--text-primary)] mt-0.5">
                              {row.mudariMajhul}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop 14-Sigah Table */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="surface-alt border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">সিগাহ ও সর্বনাম</th>
                          <th className="p-2.5 text-right font-arabic text-emerald-600 dark:text-emerald-400">
                            الماضي المعروف
                          </th>
                          <th className="p-2.5 text-right font-arabic text-sky-600 dark:text-sky-400">
                            المضارع المعروف
                          </th>
                          <th className="p-2.5 text-right font-arabic text-amber-600 dark:text-amber-400">
                            الماضي المجهول
                          </th>
                          <th className="p-2.5 text-right font-arabic text-violet-600 dark:text-violet-400">
                            المضارع المجهول
                          </th>
                          <th className="p-2.5 text-center">শুনুন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {sarfPackage.rows14.map((row) => (
                          <tr key={row.index} className="hover:bg-[var(--bg-canvas)]/40">
                            <td className="p-2.5 text-xs font-mono-num text-[var(--text-muted)]">
                              {row.index}
                            </td>
                            <td className="p-2.5">
                              <div className="text-xs font-semibold text-[var(--text-primary)]">
                                {row.sigahBn}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)]">{row.pronounHint}</div>
                            </td>
                            <td className="p-2.5 text-right font-arabic text-lg text-emerald-700 dark:text-emerald-300" dir="rtl">
                              {row.madiMaruf}
                            </td>
                            <td className="p-2.5 text-right font-arabic text-lg text-sky-700 dark:text-sky-300" dir="rtl">
                              {row.mudariMaruf}
                            </td>
                            <td className="p-2.5 text-right font-arabic text-base text-amber-700 dark:text-amber-300" dir="rtl">
                              {row.madiMajhul}
                            </td>
                            <td className="p-2.5 text-right font-arabic text-base text-violet-700 dark:text-violet-300" dir="rtl">
                              {row.mudariMajhul}
                            </td>
                            <td className="p-2.5 text-center">
                              <AudioButton text={`${row.madiMaruf}، ${row.mudariMaruf}`} compact />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === 'amr-nahi' && (
                <div className="space-y-3">
                  <div className="md:hidden space-y-2.5">
                    {sarfPackage.amrRows6.map((row) => (
                      <div
                        key={row.sigahBn}
                        className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-[var(--text-primary)]">{row.sigahBn}</div>
                            <div className="font-arabic text-xs text-[var(--text-muted)]">{row.sigahAr}</div>
                          </div>
                          <AudioButton text={`${row.amrAr}، ${row.nahiAr}`} compact />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-right" dir="rtl">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              الأَمْر الحَاضِر (আদেশ)
                            </div>
                            <div className="font-arabic text-xl text-[var(--text-primary)] mt-0.5">
                              {row.amrAr}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                            <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                              النَّهْي الحَاضِر (নিষেধ)
                            </div>
                            <div className="font-arabic text-xl text-[var(--text-primary)] mt-0.5">
                              {row.nahiAr}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="surface-alt border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                          <th className="p-3">হাদির সিগাহ (মধ্যম পুরুষ)</th>
                          <th className="p-3 text-right font-arabic text-emerald-600 dark:text-emerald-400">
                            الأَمْر الحَاضِر (আদেশ)
                          </th>
                          <th className="p-3 text-right font-arabic text-rose-600 dark:text-rose-400">
                            النَّهْي الحَاضِر (নিষেধ)
                          </th>
                          <th className="p-3 text-center">শুনুন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                        {sarfPackage.amrRows6.map((row) => (
                          <tr key={row.sigahBn}>
                            <td className="p-3">
                              <div className="text-xs font-semibold">{row.sigahBn}</div>
                              <div className="font-arabic text-xs text-[var(--text-muted)]">{row.sigahAr}</div>
                            </td>
                            <td className="p-3 text-right font-arabic text-xl text-emerald-700 dark:text-emerald-300" dir="rtl">
                              {row.amrAr}
                            </td>
                            <td className="p-3 text-right font-arabic text-xl text-rose-700 dark:text-rose-300" dir="rtl">
                              {row.nahiAr}
                            </td>
                            <td className="p-3 text-center">
                              <AudioButton text={`${row.amrAr}، ${row.nahiAr}`} compact />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === 'ai-practice' && (
                <LessonAiPracticePanel
                  key={selectedMasdar.id}
                  lessonTitle={`সফওয়াতুল মাসাদির: ${selectedMasdar.masdarAr} (${selectedMasdar.meaningBn})`}
                  lessonScopeContext={masdarScopeContext}
                  starterQuestions={[
                    `"${selectedMasdar.masdarAr}" (${selectedMasdar.madiAr} / ${selectedMasdar.mudariAr}) দিয়ে ৩টি সহজ আরবি বাক্য বানান ও অর্থ লিখুন।`,
                    `এই মাসদারের তা‘লীল বা দুর্বল অক্ষরের কোনো নিয়ম থাকলে বুঝিয়ে দিন।`,
                    `এই মাসদারের মাদি ও মুদারি সিগাহ থেকে আমাকে ১টি পরীক্ষা নিন।`,
                  ]}
                  levelLabel={selectedMasdar.babNameBn}
                />
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 2: DEDICATED BAB / AQSAM WORD LIST PAGE (/safwatul-masadir/bab/:id | /aqsam/:key)
            ===================================================================== */}
        {isRoomListPage && !isWordDetailPage && (
          <div className="space-y-5">
            <div className="surface-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-[var(--border-strong)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/safwatul-masadir')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold btn-secondary"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>২৩টি বাবের ঘরে ফিরুন</span>
                </button>

                <span className="px-3 py-1 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-xs font-mono-num font-bold text-emerald-700 dark:text-emerald-300">
                  মোট শব্দ: {filteredMasadirList.length}টি
                </span>
              </div>

              {activeBabDescriptor && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                      ঘর {activeBabDescriptor.numberBn}: {activeBabDescriptor.labelBn}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {activeBabDescriptor.alamahBn} — {activeBabDescriptor.descriptionBn}
                    </p>
                  </div>
                  <span className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                    {activeBabDescriptor.labelAr}
                  </span>
                </div>
              )}

              {activeAqsamMeta && !activeBabDescriptor && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                      হফত আকসাম বিভাগ: {activeAqsamMeta.labelBn}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">{activeAqsamMeta.hintBn}</p>
                  </div>
                  <span className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                    {activeAqsamMeta.labelAr}
                  </span>
                </div>
              )}

              {/* Search inside this Bab / Aqsam */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  placeholder="এই তালিকার ভেতর আরবি, মূলধাতু বা বাংলা অর্থে খুঁজুন..."
                  className="w-full ps-8 pe-3 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Sub-Filters inside Bab */}
              {routeBabId && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] me-1">
                    এই বাবের ভেতর আকসাম:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubAqsamFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      subAqsamFilter === 'all' ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    সকল
                  </button>
                  {AQSAM_LAUNCHERS.map((aq) => (
                    <button
                      key={aq.id}
                      type="button"
                      onClick={() => setSubAqsamFilter(aq.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        subAqsamFilter === aq.id ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {aq.labelBn}
                    </button>
                  ))}
                </div>
              )}

              {/* Sub-Filters inside Aqsam */}
              {routeAqsamKey && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] me-1">
                    বাব অনুযায়ী ছাঁকুন:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubBabFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      subBabFilter === 'all' ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    সব বাব
                  </button>
                  {SAFWATUL_MASADIR_BABS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSubBabFilter(b.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        subBabFilter === b.id ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {b.numberBn}. {b.labelBn.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clean Full-Width List Grid — Clicking any card opens a dedicated separate Word Detail Page */}
            {pagedMasadirList.length === 0 ? (
              <div className="surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
                এই ফিল্টারে কোনো মাসদার পাওয়া যায়নি। অন্য আকসাম বা বাব নির্বাচন করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pagedMasadirList.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => openWordDetailPage(entry, pathname, filteredMasadirList)}
                    className="surface-card rounded-2xl p-4 border border-[var(--border-subtle)] hover:border-emerald-500/45 hover:bg-emerald-500/5 text-left transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          {entry.babNameBn}
                        </span>
                        {entry.sarfType && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/12 text-indigo-700 dark:text-indigo-300">
                            {entry.sarfType}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{entry.meaningBn}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        মূলধাতু: <span className="font-arabic text-sm text-[var(--text-primary)]">{entry.rootLetters}</span> ·{' '}
                        <span className="font-arabic text-sm">{entry.madiAr} / {entry.mudariAr}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                        {entry.masdarAr}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">{entry.masdarPronunciationBn}</div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span>বিস্তারিত</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination Bar */}
            {filteredMasadirList.length > PAGE_SIZE && (
              <div className="surface-card rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-secondary disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>আগের</span>
                </button>
                <span className="font-mono-num text-[var(--text-secondary)]">
                  পৃষ্ঠা {safePage} / {totalPages} · {filteredMasadirList.length}টি
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-secondary disabled:opacity-40"
                >
                  <span>পরের</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            PAGE 3: MAIN MASADIR HUB (/safwatul-masadir — 23 Babs + 8 Haft Aqsam)
            ===================================================================== */}
        {!isWordDetailPage && !isRoomListPage && !isIsmSection && !isSifatSection && (
          <div className="space-y-6">
            {/* Top Haft Aqsam Direct Launch Bar */}
            <section className="surface-card rounded-2xl p-4 sm:p-5 space-y-3 border border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[var(--accent)]">
                    হফত আকসাম (সহীহ ও মু‘তাল) — যেকোনো প্রকারে টাচ করে আলাদা তালিকা খুলুন
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    সহীহ, সকল মু‘তাল, মাহমুয, মুদাআফ, মিসাল, আজওয়াফ, নাক্বিস ও লাফীফ — সরাসরি আলাদা পেজে খোলে।
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={hubSearch}
                    onChange={(e) => setHubSearch(e.target.value)}
                    placeholder="সব ১৪১১+ মাসদার থেকে খুঁজুন..."
                    className="w-full ps-8 pe-3 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {AQSAM_LAUNCHERS.map((aq) => (
                  <button
                    key={aq.id}
                    type="button"
                    onClick={() => navigate(`/safwatul-masadir/aqsam/${aq.id}`)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${aq.cardTone}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold truncate">{aq.labelBn}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <span className={`font-arabic text-sm leading-none ${aq.arabicTone}`} dir="rtl">
                        {aq.labelAr}
                      </span>
                      <span className="text-[10px] font-mono-num font-bold text-[var(--text-muted)]">
                        {aqsamCounts[aq.id]}টি
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* If searching globally on hub -> show clickable search results leading to dedicated Word Detail Page */}
            {hubSearch.trim().length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--accent)]">
                    অনুসন্ধানের ফলাফল: {filteredMasadirList.length}টি মাসদার
                  </h3>
                  <button
                    type="button"
                    onClick={() => setHubSearch('')}
                    className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
                  >
                    অনুসন্ধান মুছুন
                  </button>
                </div>

                {pagedMasadirList.length === 0 ? (
                  <div className="surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
                    এই শব্দে কোনো মাসদার পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pagedMasadirList.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => openWordDetailPage(entry, '/safwatul-masadir', filteredMasadirList)}
                        className="surface-card rounded-2xl p-4 border border-[var(--border-subtle)] hover:border-emerald-500/45 hover:bg-emerald-500/5 text-left transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                            {entry.babNameBn}
                          </span>
                          <div className="text-sm font-bold text-[var(--text-primary)]">{entry.meaningBn}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            মূলধাতু: <span className="font-arabic text-sm">{entry.rootLetters}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                            {entry.masdarAr}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{entry.masdarPronunciationBn}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* 23 Color-Coded Bab Rooms Hub */
              <div className="space-y-6">
                {babGroups.map((group) => {
                  const groupStyle = BAB_GROUP_STYLES[group.key];
                  return (
                    <section key={group.key} className="space-y-3">
                      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                        <div>
                          <h3 className={`text-base sm:text-lg font-extrabold ${groupStyle.headerAccent}`}>
                            {group.titleBn}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)]">{group.descBn}</p>
                        </div>
                        <span className={`font-arabic text-xl sm:text-2xl ${groupStyle.headerAccent}`} dir="rtl">
                          {group.titleAr}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.babs.map((bab) => {
                          const count = babCounts[bab.id] || 0;
                          return (
                            <button
                              key={bab.id}
                              type="button"
                              onClick={() => navigate(`/safwatul-masadir/bab/${encodeURIComponent(bab.id)}`)}
                              className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between gap-2.5 group ${groupStyle.cardTone}`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${groupStyle.badgeTone}`}
                                  >
                                    ঘর {bab.numberBn} · {bab.labelBn}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono-num font-bold shrink-0 ${groupStyle.countTone}`}
                                  >
                                    {count}টি শব্দ
                                  </span>
                                </div>

                                <p className="font-arabic text-xl text-[var(--text-primary)] text-right pt-0.5" dir="rtl">
                                  {bab.labelAr}
                                </p>

                                <p className="text-xs text-[var(--text-secondary)] leading-snug">
                                  <span className="font-semibold text-[var(--text-primary)]">আলামত:</span>{' '}
                                  {bab.alamahBn}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                                  {bab.descriptionBn}
                                </p>
                              </div>

                              <div
                                className={`pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold ${groupStyle.footerTone}`}
                              >
                                <span>আলাদা পেজে শব্দসমূহ খুলুন</span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            PAGE 4: ISM & SIFAT HUB (Category Room Cards) + DEDICATED CATEGORY PAGE
            ===================================================================== */}
        {(isIsmSection || isSifatSection) && !isWordDetailPage && !isRoomListPage && (
          <div className="space-y-6">
            {/* Dedicated Category Page Header when inside /ism/:catId or /sifat/:catId */}
            {isCategoryDetailPage ? (
              <div className="surface-card rounded-2xl p-4 sm:p-5 space-y-3 border border-[var(--border-strong)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(isIsmSection ? '/safwatul-masadir/ism' : '/safwatul-masadir/sifat')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold btn-secondary"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{isIsmSection ? 'সব ইসম বিভাগে ফিরুন' : 'সব সিফাত বিভাগে ফিরুন'}</span>
                  </button>
                  <span className="text-xs font-mono-num font-bold text-[var(--accent)]">
                    প্রদর্শিত: {displayedNounEntries.length}টি শব্দ
                  </span>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                      {activeNounCategoryObj.titleBn}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                      {activeNounCategoryObj.descriptionBn}
                    </p>
                  </div>
                  <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                    {activeNounCategoryObj.titleAr}
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={nounSearch}
                    onChange={(e) => setNounSearch(e.target.value)}
                    placeholder="এই বিভাগের ভেতর আরবি বা বাংলা অর্থে খুঁজুন..."
                    className="w-full ps-8 pe-3 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            ) : (
              /* Ism / Sifat Hub Search + Category Room Cards */
              <div className="space-y-5">
                <div className="surface-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--border-subtle)]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={nounSearch}
                      onChange={(e) => setNounSearch(e.target.value)}
                      placeholder={
                        isIsmSection
                          ? 'সব ৩৫০টি ইসমের মধ্যে আরবি বা বাংলা অর্থে খুঁজুন...'
                          : 'সব ১৪০টি সিফাতের মধ্যে আরবি বা বাংলা অর্থে খুঁজুন...'
                      }
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <span className="text-xs font-mono-num text-[var(--text-muted)] shrink-0">
                    {nounSearch.trim()
                      ? `অনুসন্ধান: ${displayedNounEntries.length}টি`
                      : `${activeNounCategories.length}টি বিভাগ — একটি ঘরে ঢুকে শব্দ পড়ুন`}
                  </span>
                </div>

                {!nounSearch.trim() && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {activeNounCategories.map((cat, idx) => {
                      const cardTone = isIsmSection
                        ? 'bg-sky-500/6 border-sky-500/25 hover:border-sky-500/55 hover:bg-sky-500/12'
                        : 'bg-violet-500/6 border-violet-500/25 hover:border-violet-500/55 hover:bg-violet-500/12';
                      const badgeTone = isIsmSection
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                        : 'bg-violet-500/15 text-violet-700 dark:text-violet-300';
                      const linkTone = isIsmSection
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-violet-600 dark:text-violet-400';

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            navigate(
                              `/safwatul-masadir/${isIsmSection ? 'ism' : 'sifat'}/${encodeURIComponent(cat.id)}`
                            )
                          }
                          className={`rounded-2xl p-4 sm:p-5 text-left border transition-all flex flex-col justify-between gap-3 group ${cardTone}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${badgeTone}`}>
                                বিভাগ {idx + 1}
                              </span>
                              <span className="text-xs font-mono-num font-bold text-[var(--text-muted)]">
                                {cat.entries.length}টি শব্দ
                              </span>
                            </div>
                            <h3 className="text-base font-extrabold text-[var(--text-primary)]">{cat.titleBn}</h3>
                            <p className="font-arabic text-xl text-[var(--accent)] text-right" dir="rtl">
                              {cat.titleAr}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {cat.descriptionBn}
                            </p>
                          </div>

                          <div
                            className={`pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold ${linkTone}`}
                          >
                            <span>আলাদা পেজে শব্দসমূহ খুলুন</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Word Cards Grid (shown when inside a category page OR searching) */}
            {(isCategoryDetailPage || nounSearch.trim().length > 0) && (
              displayedNounEntries.length === 0 ? (
                <div className="surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
                  আপনার অনুসন্ধানে কোনো শব্দ পাওয়া যায়নি। অন্য শব্দ লিখে চেষ্টা করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedNounEntries.map((entry, idx) => {
                    const nounCardTone = isIsmSection
                      ? 'bg-sky-500/5 border-sky-500/25 hover:border-sky-500/45'
                      : 'bg-violet-500/5 border-violet-500/25 hover:border-violet-500/45';
                    const nounBadgeTone = isIsmSection
                      ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                      : 'bg-violet-500/15 text-violet-700 dark:text-violet-300';

                    return (
                      <article
                        key={entry.id}
                        className={`rounded-2xl p-5 space-y-3 border transition-colors flex flex-col justify-between ${nounCardTone}`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md font-mono-num font-bold ${nounBadgeTone}`}>
                                  #{String(idx + 1).padStart(2, '0')}
                                </span>
                                <span>{entry.categoryTitleBn}</span>
                                {entry.grammarNoteBn && (
                                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]">
                                    {entry.grammarNoteBn}
                                  </span>
                                )}
                              </div>
                              <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)] leading-relaxed" dir="rtl">
                                {entry.arabic}
                              </p>
                            </div>
                            <AudioButton text={entry.arabic} compact />
                          </div>

                          <div className="space-y-1 text-sm">
                            {entry.pluralOrFemAr && entry.pluralOrFemAr !== '—' && (
                              <div className="text-xs text-[var(--text-secondary)]">
                                {isIsmSection ? 'বহুবচন: ' : 'স্ত্রীলিঙ্গ (মুয়ান্নাস): '}
                                <span className="font-arabic text-base font-semibold text-[var(--text-primary)]">
                                  {entry.pluralOrFemAr}
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-[var(--text-muted)]">
                              উচ্চারণ:{' '}
                              <span className="font-semibold text-[var(--text-primary)]">{entry.pronunciationBn}</span>
                            </div>
                            <div>
                              <span className="text-base font-extrabold text-[var(--text-primary)]">
                                {entry.meaningBn}
                              </span>
                              <span className="text-xs text-[var(--text-muted)] ms-2">({entry.meaningEn})</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[var(--accent)]">বাক্যে প্রয়োগ:</span>
                            <AudioButton text={entry.exampleAr} compact />
                          </div>
                          <QuickNahwText
                            text={entry.exampleAr}
                            className="font-arabic text-xl text-[var(--text-primary)] text-right leading-relaxed"
                          />
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                            {entry.exampleBn}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};
