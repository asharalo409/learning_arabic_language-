import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  Layers,
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
import { SAFWATUL_MASADIR_BABS, SAFWATUL_MASADIR_LIST } from '../data/safwatulMasadirData';
import { SIFAT_CATEGORIES } from '../data/sifatBankData';
import { HaftAqsamType, IsmSifatCategory, MasdarEntry } from '../types/academy';
import { buildFullSarfPackage } from '../utils/sarfConjugator';

const HAFT_AQSAM_LABELS: { id: 'all' | HaftAqsamType; labelBn: string }[] = [
  { id: 'all', labelBn: 'সব আকসাম' },
  { id: 'Sahih', labelBn: 'সহীহ' },
  { id: 'Mahmuz', labelBn: 'মাহমুয' },
  { id: 'Mudaaf', labelBn: 'মুদাআফ' },
  { id: 'Mithal', labelBn: 'মিসাল' },
  { id: 'Ajwaf', labelBn: 'আজওয়াফ' },
  { id: 'Naqis', labelBn: 'নাক্বিস' },
  { id: 'Lafif', labelBn: 'লাফীফ' },
];

type LibrarySection = 'masadir' | 'ism' | 'sifat';
type DetailTab = 'overview' | 'gardhan14' | 'amr-nahi' | 'ai-practice';

const PAGE_SIZE = 50;

export const SafwatulMasadirPage: React.FC = () => {
  const { lang } = useApp();
  const [section, setSection] = useState<LibrarySection>('masadir');

  // Masadir filters & pagination
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Thulathi Mujarrad' | 'Thulathi Mazid' | 'Rubai'>('all');
  const [aqsamFilter, setAqsamFilter] = useState<'all' | HaftAqsamType>('all');
  const [babFilter, setBabFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMasdar, setSelectedMasdar] = useState<MasdarEntry>(SAFWATUL_MASADIR_LIST[0]);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  // Ism & Sifat category selection + search
  const [selectedIsmCatId, setSelectedIsmCatId] = useState<string>(ALL_ISM_CATEGORIES[0].id);
  const [selectedSifatCatId, setSelectedSifatCatId] = useState<string>(SIFAT_CATEGORIES[0].id);
  const [nounSearch, setNounSearch] = useState('');

  const totalIsmCount = useMemo(
    () => ALL_ISM_CATEGORIES.reduce((sum, c) => sum + c.entries.length, 0),
    []
  );
  const totalSifatCount = useMemo(
    () => SIFAT_CATEGORIES.reduce((sum, c) => sum + c.entries.length, 0),
    []
  );

  const filteredList = useMemo(() => {
    return SAFWATUL_MASADIR_LIST.filter((item) => {
      if (categoryFilter !== 'all' && item.babCategory !== categoryFilter) return false;
      const itemAqsam: HaftAqsamType = item.sarfType || 'Sahih';
      if (aqsamFilter !== 'all' && itemAqsam !== aqsamFilter) return false;

      if (babFilter !== 'all' && !item.babNameBn.includes(babFilter) && !item.babNameAr.includes(babFilter)) {
        if (babFilter === 'তাফাউল-তাশা') {
          if (!item.babNameAr.includes('التَّفَعُّل') && !item.babNameAr.includes('التَّفَاعُل')) return false;
        } else if (babFilter === 'ইনফিআল-ইফতি') {
          if (!item.babNameAr.includes('الاِنْفِعَال') && !item.babNameAr.includes('الاِفْتِعَال')) return false;
        } else if (babFilter === 'ইসতিফআল') {
          if (!item.babNameAr.includes('الاِسْتِفْعَال') && !item.babNameAr.includes('الاِفْعِلَال')) return false;
        } else {
          return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.masdarAr.includes(search) ||
          item.madiAr.includes(search) ||
          item.mudariAr.includes(search) ||
          item.rootLetters.includes(search) ||
          item.meaningBn.toLowerCase().includes(q) ||
          item.meaningEn.toLowerCase().includes(q) ||
          item.masdarPronunciationBn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, aqsamFilter, babFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, aqsamFilter, babFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedList = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, safePage]);

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

  const activeCategories: IsmSifatCategory[] =
    section === 'ism' ? ALL_ISM_CATEGORIES : SIFAT_CATEGORIES;
  const activeCatId = section === 'ism' ? selectedIsmCatId : selectedSifatCatId;
  const activeCategoryObj =
    activeCategories.find((c) => c.id === activeCatId) || activeCategories[0];

  const displayedIsmSifatEntries = useMemo(() => {
    const q = nounSearch.trim().toLowerCase();
    if (!q) return activeCategoryObj.entries;
    return activeCategories
      .flatMap((cat) => cat.entries)
      .filter(
        (entry) =>
          entry.arabic.includes(nounSearch.trim()) ||
          (entry.pluralOrFemAr && entry.pluralOrFemAr.includes(nounSearch.trim())) ||
          entry.meaningBn.toLowerCase().includes(q) ||
          entry.meaningEn.toLowerCase().includes(q) ||
          entry.pronunciationBn.toLowerCase().includes(q)
      );
  }, [activeCategories, activeCategoryObj, nounSearch]);

  const handleSelectMasdar = (entry: MasdarEntry) => {
    setSelectedMasdar(entry);
    setMobileShowDetail(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell
      title={lang === 'bn' ? 'সফওয়াতুল মাসাদির, ইসম ও সিফাত ভান্ডার' : 'Safwatul Masadir, Ism & Sifat Library'}
      subtitle={
        lang === 'bn'
          ? `${SAFWATUL_MASADIR_LIST.length}+ মাসদার (সকল বাব ও হফত আকসাম), ${totalIsmCount}টি বিষয়ভিত্তিক ইসম এবং ${totalSifatCount}টি সিফাত — প্রতিটি শব্দে বাক্যসহ`
          : `${SAFWATUL_MASADIR_LIST.length}+ Classical Masadir, ${totalIsmCount} Categorized Nouns & ${totalSifatCount} Adjectives with Sentences`
      }
    >
      <div className="space-y-6">
        {/* Top 3-Library Mode Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl surface-card border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              setSection('masadir');
              setMobileShowDetail(false);
            }}
            className={`px-4 py-3 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
              section === 'masadir' ? 'btn-primary shadow-sm' : 'hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)]'
            }`}
          >
            <div>
              <div className="text-sm font-extrabold">মাসদার ভান্ডার (সকল বাব)</div>
              <div className={`text-xs ${section === 'masadir' ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                {SAFWATUL_MASADIR_LIST.length}টি সহীহ ও মুতাল · ১৪ সিগাহ গর্দান
              </div>
            </div>
            <Table2 className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSection('ism');
              setNounSearch('');
            }}
            className={`px-4 py-3 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
              section === 'ism' ? 'btn-primary shadow-sm' : 'hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)]'
            }`}
          >
            <div>
              <div className="text-sm font-extrabold">ইসম ভান্ডার (বিষয়ভিত্তিক)</div>
              <div className={`text-xs ${section === 'ism' ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                {ALL_ISM_CATEGORIES.length}টি বিষয় · {totalIsmCount}টি বিশেষ্য ও বাক্য
              </div>
            </div>
            <Layers className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSection('sifat');
              setNounSearch('');
            }}
            className={`px-4 py-3 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
              section === 'sifat' ? 'btn-primary shadow-sm' : 'hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)]'
            }`}
          >
            <div>
              <div className="text-sm font-extrabold">সিফাত ভান্ডার (বিশেষণ)</div>
              <div className={`text-xs ${section === 'sifat' ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                {SIFAT_CATEGORIES.length}টি বিভাগ · {totalSifatCount}টি সিফাত ও বাক্য
              </div>
            </div>
            <Sparkles className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* SECTION 1: 870+ MASADIR */}
        {section === 'masadir' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className={`surface-card rounded-2xl p-5 space-y-3.5 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="মাসদার, মাদি, মূলধাতু বা বাংলা অর্থ খুঁজুন (যেমন: নাসারা, ক্বাওলা, غ ف ر)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />

                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {(
                    [
                      { id: 'all', label: `সকল (${SAFWATUL_MASADIR_LIST.length})` },
                      { id: 'Thulathi Mujarrad', label: 'সুলাসি মুজাররাদ' },
                      { id: 'Thulathi Mazid', label: 'সুলাসি মাজীদ ফীহ' },
                      { id: 'Rubai', label: 'রুবাই' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        setBabFilter('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                        categoryFilter === cat.id ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SAFWATUL_MASADIR_BABS.map((bab) => (
                  <button
                    key={bab.id}
                    type="button"
                    onClick={() => setBabFilter(bab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      babFilter === bab.id ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {bab.labelBn}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-[var(--accent)] me-1">হফত আকসাম (৭ প্রকার):</span>
                  {HAFT_AQSAM_LABELS.map((aq) => (
                    <button
                      key={aq.id}
                      type="button"
                      onClick={() => setAqsamFilter(aq.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        aqsamFilter === aq.id ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {aq.labelBn}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono-num text-[var(--text-muted)]">
                  মোট ফলাফল: {filteredList.length}টি
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* List of Masadir + Pagination */}
              <div className={`lg:col-span-5 space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
                <div className="space-y-2.5 lg:max-h-[740px] lg:overflow-y-auto pe-1">
                  {pagedList.length === 0 ? (
                    <div className="surface-card rounded-xl p-6 text-center text-sm text-[var(--text-muted)]">
                      এই ফিল্টারে কোনো মাসদার পাওয়া যায়নি। অন্য বাব বা আকসাম নির্বাচন করুন।
                    </div>
                  ) : (
                    pagedList.map((entry) => {
                      const active = entry.id === selectedMasdar.id;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => handleSelectMasdar(entry)}
                          className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                            active
                              ? 'surface-alt border-[var(--border-strong)]'
                              : 'surface-card hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="text-xs text-[var(--accent)] font-medium">
                              {entry.babNameBn} {entry.sarfType ? `· ${entry.sarfType}` : ''}
                            </div>
                            <div className="text-sm font-bold text-[var(--text-primary)]">{entry.meaningBn}</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              মূলধাতু: <span className="font-arabic">{entry.rootLetters}</span> · {entry.madiAr} / {entry.mudariAr}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                              {entry.masdarAr}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">{entry.masdarPronunciationBn}</div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Pagination Bar */}
                {filteredList.length > PAGE_SIZE && (
                  <div className="surface-card rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-secondary disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>আগের</span>
                    </button>
                    <span className="font-mono-num text-[var(--text-secondary)]">
                      পৃষ্ঠা {safePage} / {totalPages} · {filteredList.length}টি
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-secondary disabled:opacity-40"
                    >
                      <span>পরের</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Masdar Full Conjugation & Scoped AI Practice */}
              <div className={`lg:col-span-7 space-y-5 ${mobileShowDetail ? 'block' : 'hidden lg:block'}`}>
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>সব মাসদারের তালিকায় ফিরুন</span>
                </button>

                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-[var(--accent)]">
                        {selectedMasdar.babNameBn} ({selectedMasdar.babNameAr})
                      </div>
                      <p className="font-arabic text-4xl sm:text-5xl text-[var(--accent)]" dir="rtl">
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
                        ].map((cell) => (
                          <div key={cell.label} className="surface-alt rounded-2xl p-3.5 space-y-1">
                            <div className="text-xs text-[var(--text-muted)]">{cell.label}</div>
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

                      <div className="p-4 rounded-2xl surface-card border border-[var(--border-subtle)] space-y-2">
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

                      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="surface-alt border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                              <th className="p-2.5">#</th>
                              <th className="p-2.5">সিগাহ ও সর্বনাম</th>
                              <th className="p-2.5 text-right font-arabic">الماضي المعروف</th>
                              <th className="p-2.5 text-right font-arabic">المضارع المعروف</th>
                              <th className="p-2.5 text-right font-arabic">الماضي المجهول</th>
                              <th className="p-2.5 text-right font-arabic">المضارع المجهول</th>
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
                                <td className="p-2.5 text-right font-arabic text-lg text-[var(--accent)]" dir="rtl">
                                  {row.madiMaruf}
                                </td>
                                <td className="p-2.5 text-right font-arabic text-lg text-[var(--text-primary)]" dir="rtl">
                                  {row.mudariMaruf}
                                </td>
                                <td className="p-2.5 text-right font-arabic text-base text-[var(--text-secondary)]" dir="rtl">
                                  {row.madiMajhul}
                                </td>
                                <td className="p-2.5 text-right font-arabic text-base text-[var(--text-secondary)]" dir="rtl">
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
                    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="surface-alt border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                            <th className="p-3">হাদির সিগাহ (মধ্যম পুরুষ)</th>
                            <th className="p-3 text-right font-arabic">الأَمْر الحَاضِر (আদেশ)</th>
                            <th className="p-3 text-right font-arabic">النَّهْي الحَاضِر (নিষেধ)</th>
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
                              <td className="p-3 text-right font-arabic text-xl text-[var(--accent)]" dir="rtl">
                                {row.amrAr}
                              </td>
                              <td className="p-3 text-right font-arabic text-xl text-[var(--text-primary)]" dir="rtl">
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
            </div>
          </div>
        )}

        {/* SECTION 2 & 3: CATEGORIZED ISM (10 TOPICS x 35 = 350) & SIFAT (4 CATEGORIES x 35 = 140) */}
        {(section === 'ism' || section === 'sifat') && (
          <div className="space-y-6">
            {/* Search & Category Tabs */}
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <input
                  type="text"
                  value={nounSearch}
                  onChange={(e) => setNounSearch(e.target.value)}
                  placeholder={
                    section === 'ism'
                      ? 'সব ৩৫০টি ইসমের মধ্যে আরবি বা বাংলা অর্থে খুঁজুন...'
                      : 'সব ১৪০টি সিফাতের মধ্যে আরবি বা বাংলা অর্থে খুঁজুন...'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />
                <span className="text-xs font-mono-num text-[var(--text-muted)] shrink-0">
                  প্রদর্শিত: {displayedIsmSifatEntries.length}টি শব্দ
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeCategories.map((cat) => {
                  const active = cat.id === activeCategoryObj.id && !nounSearch.trim();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setNounSearch('');
                        if (section === 'ism') setSelectedIsmCatId(cat.id);
                        else setSelectedSifatCatId(cat.id);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                        active ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {cat.titleBn} ({cat.entries.length})
                    </button>
                  );
                })}
              </div>

              {!nounSearch.trim() && (
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                      {activeCategoryObj.titleBn}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                      {activeCategoryObj.descriptionBn}
                    </p>
                  </div>
                  <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                    {activeCategoryObj.titleAr}
                  </p>
                </div>
              )}
            </div>

            {/* Word Cards Grid — Each Word With Sentence & Audio */}
            {displayedIsmSifatEntries.length === 0 ? (
              <div className="surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
                আপনার অনুসন্ধানে কোনো শব্দ পাওয়া যায়নি। অন্য শব্দ লিখে চেষ্টা করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedIsmSifatEntries.map((entry, idx) => (
                  <article
                    key={entry.id}
                    className="surface-card rounded-2xl p-5 space-y-3 border border-[var(--border-subtle)] flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-1.5">
                            <span className="font-mono-num font-bold text-[var(--accent)]">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span>·</span>
                            <span>{entry.categoryTitleBn}</span>
                            {entry.grammarNoteBn && (
                              <>
                                <span>·</span>
                                <span className="text-[var(--text-secondary)]">{entry.grammarNoteBn}</span>
                              </>
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
                            {section === 'ism' ? 'বহুবচন: ' : 'স্ত্রীলিঙ্গ (মুয়ান্নাস): '}
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};
