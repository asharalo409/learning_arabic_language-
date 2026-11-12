import React, { useMemo, useState } from 'react';
import { Bot, Search, Sparkles, BookOpenCheck, Table2, ShieldAlert } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { SAFWATUL_MASADIR_BABS, SAFWATUL_MASADIR_LIST } from '../data/safwatulMasadirData';
import { HaftAqsamType, MasdarEntry } from '../types/academy';
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

type DetailTab = 'overview' | 'gardhan14' | 'amr-nahi';

export const SafwatulMasadirPage: React.FC = () => {
  const { lang, awardXp } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Thulathi Mujarrad' | 'Thulathi Mazid' | 'Rubai'>('all');
  const [aqsamFilter, setAqsamFilter] = useState<'all' | HaftAqsamType>('all');
  const [babFilter, setBabFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedMasdar, setSelectedMasdar] = useState<MasdarEntry>(SAFWATUL_MASADIR_LIST[0]);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [aiGardhan, setAiGardhan] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

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

  const sarfPackage = useMemo(() => buildFullSarfPackage(selectedMasdar), [selectedMasdar]);

  const handleAiConjugation = async (entry: MasdarEntry) => {
    setLoadingAi(true);
    setAiGardhan(null);
    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'grammar',
          level: 'Sarf / Safwatul Masadir & Mizanus Sarf',
          interfaceLang: lang,
          message: `Give the Sarf Ta'lil (তালীল) and contextual usage notes for the Safwatul Masadir verb "${entry.masdarAr}" (${entry.madiAr} - ${entry.mudariAr}, root: ${entry.rootLetters}, ${entry.babNameBn}, meaning: ${entry.meaningBn}) with 3 practical sentences (full Harakat + Bengali pronunciation + Bengali meaning) and its Quranic or classical usage.`,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setAiGardhan(data.reply || data.error || 'তথ্য পাওয়া যায়নি।');
      awardXp(15, {
        titleBn: `সফওয়াতুল মাসাদির চর্চা: ${entry.masdarAr}`,
        titleEn: `Safwatul Masadir study: ${entry.masdarAr}`,
        type: 'vocab',
      });
    } catch (err: unknown) {
      setAiGardhan(err instanceof Error ? err.message : 'AI সংযোগে সমস্যা হয়েছে।');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <AppShell
      title={lang === 'bn' ? 'সফওয়াতুল মাসাদির (صَفْوَةُ المَصَادِرِ)' : 'Safwatul Masadir (Classical Verb Roots)'}
      subtitle={
        lang === 'bn'
          ? `সুলাসি মুজাররাদ, মাজীদ ফীহ, রুবাই ও হফত আকসামসহ ${SAFWATUL_MASADIR_LIST.length}টি পূর্ণাঙ্গ মাসদার ও ১৪ সিগাহ গর্দান`
          : `${SAFWATUL_MASADIR_LIST.length} Complete Classical Masadir with 14-Sigah Sarf Conjugation Tables`
      }
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="surface-card rounded-2xl p-5 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="মাসদার, মাদি, মূলধাতু বা বাংলা অর্থ খুঁজুন (যেমন: নাসারা, ক্বাওলা, غ ف ر)..."
                className="w-full ps-9 pe-4 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: `সকল (${SAFWATUL_MASADIR_LIST.length})` },
                  { id: 'Thulathi Mujarrad', label: 'সুলাসি মুজাররাদ' },
                  { id: 'Thulathi Mazid', label: 'সুলাসি মাজীদ ফীহ' },
                  { id: 'Rubai', label: 'রুবাই (৪ অক্ষর)' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    setBabFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    categoryFilter === cat.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bab Selector */}
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

          {/* Haft Aqsam Filter (৭ প্রকার) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs font-semibold text-[var(--accent)] me-1">হফত আকসাম (৭ প্রকার):</span>
            {HAFT_AQSAM_LABELS.map((aq) => (
              <button
                key={aq.id}
                type="button"
                onClick={() => setAqsamFilter(aq.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  aqsamFilter === aq.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {aq.labelBn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Masadir */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[780px] overflow-y-auto pe-1">
            {filteredList.length === 0 ? (
              <div className="surface-card rounded-xl p-6 text-center text-sm text-[var(--text-muted)]">
                এই ফিল্টারে কোনো মাসদার পাওয়া যায়নি। অন্য বাব বা আকসাম নির্বাচন করুন।
              </div>
            ) : (
              filteredList.map((entry) => {
                const active = entry.id === selectedMasdar.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setSelectedMasdar(entry);
                      setAiGardhan(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      active
                        ? 'surface-alt border-[var(--border-strong)]'
                        : 'surface-card hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs text-[var(--text-muted)]">
                        {entry.babNameBn} · মূলধাতু: <span className="font-arabic">{entry.rootLetters}</span>
                      </div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{entry.meaningBn}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {entry.madiAr} / {entry.mudariAr}
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

          {/* Selected Masdar Full Conjugation & 14-Sigah Tables */}
          <div className="lg:col-span-7 space-y-5">
            <div className="surface-card rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[var(--accent)]">
                    {selectedMasdar.babNameBn} ({selectedMasdar.babNameAr})
                  </div>
                  <p className="font-arabic text-4xl text-[var(--accent)]" dir="rtl">
                    {selectedMasdar.masdarAr}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    উচ্চারণ: {selectedMasdar.masdarPronunciationBn} · মূলধাতু: {selectedMasdar.rootLetters}
                  </p>
                  <h2 className="text-xl font-bold pt-1">
                    {selectedMasdar.meaningBn}{' '}
                    <span className="text-sm font-normal text-[var(--text-muted)]">({selectedMasdar.meaningEn})</span>
                  </h2>
                </div>
                <AudioButton
                  text={`${selectedMasdar.masdarAr}، ${selectedMasdar.madiAr}، ${selectedMasdar.mudariAr}، ${selectedMasdar.amrAr}`}
                  showSlow
                />
              </div>

              {/* Tab Switcher */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDetailTab('overview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    detailTab === 'overview' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>মূল সিগাহ ও উদাহরণ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('gardhan14')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    detailTab === 'gardhan14' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>১৪ সিগাহ পূর্ণ গর্দান (মাদি ও মুদারি)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('amr-nahi')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    detailTab === 'amr-nahi' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>আমর-নাহী ও AI বিশ্লেষণ</span>
                </button>
              </div>

              {/* TAB 1: Overview & 8 Pillars */}
              {detailTab === 'overview' && (
                <div className="space-y-5">
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
                      <div key={cell.label} className="surface-alt rounded-xl p-3 space-y-1">
                        <div className="text-[11px] text-[var(--text-muted)]">{cell.label}</div>
                        <div className="font-arabic text-xl text-[var(--text-primary)]" dir="rtl">
                          {cell.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="surface-alt rounded-xl p-4 space-y-1">
                    <div className="text-xs font-semibold text-[var(--accent)]">হফত আকসাম ও ছরফী নিয়ম (মীযানুস ছরফ):</div>
                    <p className="text-sm text-[var(--text-secondary)]">{sarfPackage.sarfNoteBn}</p>
                  </div>

                  <div className="surface-alt rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--accent)]">বাক্যে প্রয়োগ:</span>
                      <AudioButton text={selectedMasdar.exampleAr} compact />
                    </div>
                    <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                      {selectedMasdar.exampleAr}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedMasdar.exampleBn}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: Built-in 14-Sigah Conjugation Table (Zero AI Wait) */}
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
                            <td className="p-2.5 text-xs text-[var(--text-muted)]">{row.index}</td>
                            <td className="p-2.5">
                              <div className="text-xs font-semibold text-[var(--text-primary)]">{row.sigahBn}</div>
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

              {/* TAB 3: Amr, Nahi (6 Sigah) + Optional AI Deep Explanation */}
              {detailTab === 'amr-nahi' && (
                <div className="space-y-5">
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

                  <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => handleAiConjugation(selectedMasdar)}
                      disabled={loadingAi}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs btn-primary disabled:opacity-50"
                    >
                      {loadingAi ? <Sparkles className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      <span>
                        {loadingAi
                          ? 'AI উস্তায তা‘লীল ও উদাহরণ লিখছেন...'
                          : 'AI দিয়ে তা‘লীল (দুর্বল অক্ষরের নিয়ম) ও ৩টি বাড়তি বাক্য দেখুন'}
                      </span>
                    </button>

                    {aiGardhan && (
                      <div className="surface-alt rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed font-arabic-ui">
                        {aiGardhan}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
