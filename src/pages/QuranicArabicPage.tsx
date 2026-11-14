import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitBranch,
  GraduationCap,
  Search,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { SentenceTarkibCard } from '../components/SentenceTarkibCard';
import { useApp } from '../context/AppContext';
import { matchNahwTipForToken } from '../data/nahwQuickTips';
import { QURAN_GRAMMAR_BY_SURAH } from '../data/quranGrammarData';
import { QURAN_ALL_SHORT_SURAHS, QURANIC_AYAT } from '../data/quranicData';
import { analyzeQuranWord, WordGrammarDetail } from '../data/quranWordMorphology';
import { speakArabic } from '../utils/speech';

export const QuranicArabicPage: React.FC = () => {
  const { t, lang, awardXp, progress, syncMissingVocabFromSegments } = useApp();
  const syncedSurahsRef = useRef<Set<number>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const surahParam = Number(searchParams.get('surah'));
  const initialSurahNum = QURAN_ALL_SHORT_SURAHS.some((s) => s.surahNumber === surahParam)
    ? surahParam
    : 114;

  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(initialSurahNum);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (QURAN_ALL_SHORT_SURAHS.some((s) => s.surahNumber === surahParam)) {
      setSelectedSurahNum(surahParam);
      setSelectedWordIdx(0);
      setActiveTooltip(null);
      setShowDetailedLab(false);
    }
  }, [surahParam]);
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);
  const [showDetailedLab, setShowDetailedLab] = useState(false);
  const [showQuranicGrammar, setShowQuranicGrammar] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<{
    ayahNumber: number;
    tokenIndex: number;
    detail: WordGrammarDetail;
    tarkibRoleBn?: string;
    tarkibReasonBn?: string;
  } | null>(null);
  const [openTarkibAyat, setOpenTarkibAyat] = useState<Record<number, boolean>>({});
  const [showAllGrammar, setShowAllGrammar] = useState(true);
  const [collapsedAyatGrammar, setCollapsedAyatGrammar] = useState<Record<number, boolean>>({});
  const [selectedLabAyahIdx, setSelectedLabAyahIdx] = useState(0);
  const [labWordIdx, setLabWordIdx] = useState(0);

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return QURAN_ALL_SHORT_SURAHS;
    return QURAN_ALL_SHORT_SURAHS.filter(
      (s) =>
        s.nameBn.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.nameAr.includes(searchQuery) ||
        String(s.surahNumber).includes(q)
    );
  }, [searchQuery]);

  const activeSurah =
    QURAN_ALL_SHORT_SURAHS.find((s) => s.surahNumber === selectedSurahNum) || QURAN_ALL_SHORT_SURAHS[0];
  const activeGrammar = QURAN_GRAMMAR_BY_SURAH[activeSurah.surahNumber];

  useEffect(() => {
    if (syncedSurahsRef.current.has(activeSurah.surahNumber)) return;
    syncedSurahsRef.current.add(activeSurah.surahNumber);
    syncMissingVocabFromSegments(
      activeSurah.verses.map((v) => ({
        arabic: v.arabic,
        translationBn: v.translationBn,
        sourceLabelBn: `কুরআন · ${activeSurah.nameBn}`,
        isQuranic: true,
      }))
    );
  }, [activeSurah, syncMissingVocabFromSegments]);

  const activeKeyWord = activeSurah.keyWords[selectedWordIdx] || activeSurah.keyWords[0];
  const fullSurahArabicText = useMemo(
    () => activeSurah.verses.map((v) => v.arabic).join(' ۞ '),
    [activeSurah]
  );

  const toggleAyahGrammar = (ayahNum: number) => {
    setCollapsedAyatGrammar((prev) => ({
      ...prev,
      [ayahNum]: !(prev[ayahNum] ?? !showAllGrammar),
    }));
  };

  const labAyah = QURANIC_AYAT[selectedLabAyahIdx] || QURANIC_AYAT[0];
  const labWord = labAyah.words[labWordIdx] || labAyah.words[0];

  const totalAyatCount = useMemo(
    () => QURAN_ALL_SHORT_SURAHS.reduce((acc, s) => acc + s.verses.length, 0),
    []
  );

  return (
    <AppShell
      title={t.sidebar.quranic}
      subtitle={
        lang === 'bn'
          ? `সূরা আল-ফাতিহা ও শেষের ২৫টি পূর্ণাঙ্গ সূরা (সূরা ৯০–১১৪ · মোট ${totalAyatCount}টি আয়াত)`
          : 'Complete Al-Fatihah + Last 25 Surahs (90–114) with translation & root analysis'
      }
    >
      <div className="space-y-6">
        {/* Vibrant Quranic Header Banner */}
        <div
          className="rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #065f46 0%, #0d9488 55%, #0284c7 100%)' }}
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
              <BookOpenCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>কোরআনের মাধ্যমে পড়ুন · সূরা আল-ফাতিহা (১) + শেষের ২৫ সূরা (৯০–১১৪)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              কোরআনের মাধ্যমে পড়ুন — {QURAN_ALL_SHORT_SURAHS.length}টি সম্পূর্ণ সূরা ({totalAyatCount} আয়াত)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50/90">
              প্রতিটি সূরার সব আয়াত, বাংলা উচ্চারণ, বাংলা-ইংরেজি অনুবাদ, পূর্ণ সূরা অডিও এবং শব্দ-মূলধাতু (জযর) বিশ্লেষণ।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDetailedLab((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-emerald-950 font-bold text-xs shadow hover:bg-emerald-50 transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{showDetailedLab ? 'শেষের ২৫ সূরায় ফিরুন' : 'শব্দে-শব্দে মূলধাতু ল্যাব'}</span>
          </button>
        </div>

        {showDetailedLab ? (
          /* Deep Word-by-Word Grammar Lab from QURANIC_AYAT */
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {QURANIC_AYAT.map((item, idx) => (
                <button
                  key={`${item.surahNumber}-${item.ayahNumber}`}
                  type="button"
                  onClick={() => {
                    setSelectedLabAyahIdx(idx);
                    setLabWordIdx(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                    selectedLabAyahIdx === idx ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {item.surahNameBn} ({item.surahNumber}:{item.ayahNumber})
                </button>
              ))}
            </div>

            <div className="surface-card rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-xs font-bold text-[var(--accent)]">
                    {labAyah.surahNameBn} ({labAyah.surahNumber}:{labAyah.ayahNumber})
                  </span>
                  <h3 className="text-lg font-bold font-arabic-ui">{labAyah.surahNameAr}</h3>
                </div>
                <AudioButton text={labAyah.arabic} showSlow />
              </div>

              <div className="surface-alt rounded-2xl p-5 text-center space-y-2.5">
                <p className="font-arabic text-3xl text-[var(--accent)] leading-loose" dir="rtl">
                  {labAyah.arabic}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{labAyah.pronunciationBn}</p>
                <p className="text-base font-bold">{labAyah.translationBn}</p>
              </div>

              <div className="flex flex-wrap flex-row-reverse justify-center gap-2.5" dir="rtl">
                {labAyah.words.map((w, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    onClick={() => setLabWordIdx(wIdx)}
                    className={`px-4 py-3 rounded-xl border text-center transition-colors ${
                      labWordIdx === wIdx
                        ? 'border-[var(--border-strong)] bg-[var(--accent)] text-[var(--accent-fg)]'
                        : 'surface-alt hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="font-arabic text-2xl">{w.arabic}</div>
                    <div className="text-xs opacity-85 mt-1 font-bengali" dir="ltr">
                      {w.meaningBn}
                    </div>
                  </button>
                ))}
              </div>

              {labWord && (
                <div className="surface-alt rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                      {labWord.arabic}
                    </span>
                    <div className="text-xs text-[var(--text-muted)]">উচ্চারণ: {labWord.pronunciationBn}</div>
                    <div className="text-base font-bold">{labWord.meaningBn}</div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">ত্রিবর্ণ মূলধাতু: </span>
                      <span className="font-arabic text-lg text-[var(--accent)] font-bold" dir="rtl">
                        {labWord.root}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">পদ পরিচিতি: </span>
                      <span className="font-medium">{labWord.posBn}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{labWord.grammarNoteBn}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Complete 26-Surah Selector + Full Mushaf Verse Reader */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Surah Selector Panel */}
            <div className="lg:col-span-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সূরা খুঁজুন (যেমন: ইখলাস, ১১২, দুহা)..."
                  className="w-full ps-10 pe-4 py-2.5 rounded-2xl surface-card text-xs sm:text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 max-h-[420px] lg:max-h-[680px] overflow-y-auto pe-1">
                {filteredSurahs.map((surah) => {
                  const active = surah.surahNumber === activeSurah.surahNumber;
                  return (
                    <button
                      key={surah.surahNumber}
                      type="button"
                      onClick={() => {
                        setSelectedSurahNum(surah.surahNumber);
                        setSearchParams({ surah: String(surah.surahNumber) }, { replace: true });
                        setSelectedWordIdx(0);
                        setActiveTooltip(null);
                      }}
                      className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-2 ${
                        active ? 'text-white shadow-lg scale-[1.01]' : 'surface-card hover:border-[var(--border-strong)]'
                      }`}
                      style={active ? { background: surah.accentGradient } : undefined}
                    >
                      <div className="min-w-0">
                        <div
                          className={`text-[10px] font-mono-num font-bold ${
                            active ? 'text-white/85' : 'text-[var(--accent)]'
                          }`}
                        >
                          সূরা {surah.surahNumber} · {surah.verses.length} আয়াত
                        </div>
                        <div className="text-xs sm:text-sm font-bold truncate">{surah.nameBn}</div>
                      </div>
                      <span
                        className={`font-arabic text-base shrink-0 ${
                          active ? 'text-amber-200' : 'text-[var(--accent)]'
                        }`}
                        dir="rtl"
                      >
                        {surah.nameAr.replace('سُورَةُ ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Complete Surah Reader */}
            <div className="lg:col-span-8 space-y-5">
              {/* Surah Banner Card */}
              <div
                className="rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-3"
                style={{ background: activeSurah.accentGradient }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white/85">
                      সূরা নম্বর {activeSurah.surahNumber} · {activeSurah.revelationTypeBn} · সম্পূর্ণ {activeSurah.verses.length} আয়াত
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-0.5">{activeSurah.nameBn}</h2>
                    <p className="text-xs text-white/90 mt-1">{activeSurah.summaryBn}</p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="font-arabic text-3xl text-amber-200" dir="rtl">
                      {activeSurah.nameAr}
                    </p>
                    <AudioButton text={fullSurahArabicText} showSlow />
                  </div>
                </div>

                {activeSurah.surahNumber !== 1 && (
                  <div className="pt-3 border-t border-white/20 text-center">
                    <p className="font-arabic text-2xl sm:text-3xl text-amber-100" dir="rtl">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive 'Show Quranic Grammar' Toggle Bar + Surah Grammar Overview */}
              <div className="surface-card rounded-3xl p-4 sm:p-5 border border-amber-500/35 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                        {lang === 'bn' ? 'কুরআনিক গ্রামার দেখান (Show Quranic Grammar)' : 'Show Quranic Grammar'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {showQuranicGrammar
                          ? 'আয়াতের হাইলাইট করা যেকোনো শব্দে ক্লিক বা হোভার করে ছরফ (Sarf) ও নাহু (Nahw) টুলটিপ দেখুন'
                          : 'শব্দ-ভিত্তিক হাইলাইট ও গ্রামার টুলটিপ দেখতে টগলটি চালু করুন'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {activeGrammar && showQuranicGrammar && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = !showAllGrammar;
                          setShowAllGrammar(next);
                          setCollapsedAyatGrammar({});
                        }}
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold btn-secondary"
                      >
                        {showAllGrammar ? 'আয়াত নোট লুকান' : 'সব আয়াত নোট দেখুন'}
                      </button>
                    )}

                    <button
                      type="button"
                      role="switch"
                      aria-checked={showQuranicGrammar}
                      aria-label="Show Quranic Grammar"
                      onClick={() => {
                        const next = !showQuranicGrammar;
                        setShowQuranicGrammar(next);
                        if (!next) setActiveTooltip(null);
                      }}
                      className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors p-0.5 cursor-pointer ${
                        showQuranicGrammar ? 'bg-emerald-500' : 'bg-[var(--bg-surface-alt)] border border-[var(--border-strong)]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow transition-transform ${
                          showQuranicGrammar ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {activeGrammar && showQuranicGrammar && (
                  <div className="pt-2.5 border-t border-amber-500/20 space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {activeGrammar.overviewTitleBn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {activeGrammar.overviewBn}
                    </p>
                  </div>
                )}
              </div>

              {/* All Verses of the Selected Surah (Clean Open Divider Stream) */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeSurah.verses.map((v) => {
                  const ayahGrammar = activeGrammar?.ayat[v.ayahNumber];
                  const isGrammarOpen =
                    collapsedAyatGrammar[v.ayahNumber] !== undefined
                      ? !collapsedAyatGrammar[v.ayahNumber]
                      : showAllGrammar;
                  const tokens = v.arabic.split(/\s+/).filter(Boolean);
                  const ayahTooltip =
                    activeTooltip && activeTooltip.ayahNumber === v.ayahNumber ? activeTooltip : null;

                  return (
                    <div
                      key={`${activeSurah.surahNumber}-${v.ayahNumber}`}
                      className="py-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-[var(--emerald-highlight)] text-[var(--accent)] font-mono-num text-xs font-bold">
                          আয়াত {activeSurah.surahNumber}:{v.ayahNumber}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenTarkibAyat((prev) => ({
                                ...prev,
                                [v.ayahNumber]: !prev[v.ayahNumber],
                              }))
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                              openTarkibAyat[v.ayahNumber]
                                ? 'btn-primary'
                                : 'btn-secondary text-[var(--text-secondary)]'
                            }`}
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>সম্পূর্ণ আয়াতের তারকিব</span>
                          </button>
                          {ayahGrammar && showQuranicGrammar && (
                            <button
                              type="button"
                              onClick={() => toggleAyahGrammar(v.ayahNumber)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                            >
                              <GraduationCap className="w-3 h-3" />
                              <span>গ্রামার কায়দা</span>
                              {isGrammarOpen ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                          <AudioButton text={v.arabic} showSlow compact />
                        </div>
                      </div>

                      {showQuranicGrammar ? (
                        <div
                          data-nahw-managed="true"
                          className="font-arabic text-3xl sm:text-4xl text-[var(--text-primary)] leading-[2.45] text-right flex flex-wrap gap-x-2 gap-y-1.5 items-center"
                          dir="rtl"
                        >
                          {tokens.map((tok, tIdx) => {
                            const detail = analyzeQuranWord(tok, ayahGrammar);
                            const isSelected = ayahTooltip?.tokenIndex === tIdx;
                            const openWordTooltip = () => {
                              const nahwCtx = matchNahwTipForToken(
                                tok,
                                tokens[tIdx - 1],
                                tokens[tIdx + 1],
                                v.arabic,
                                tIdx
                              );
                              setActiveTooltip({
                                ayahNumber: v.ayahNumber,
                                tokenIndex: tIdx,
                                detail,
                                tarkibRoleBn: nahwCtx?.tarkibRoleBn,
                                tarkibReasonBn: nahwCtx?.tarkibReasonBn,
                              });
                            };
                            return (
                              <button
                                key={`${v.ayahNumber}-tok-${tIdx}`}
                                type="button"
                                onClick={() =>
                                  isSelected ? setActiveTooltip(null) : openWordTooltip()
                                }
                                onMouseEnter={openWordTooltip}
                                className={`relative px-1.5 py-0.5 rounded-xl transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500 text-white shadow-md scale-[1.03]'
                                    : detail.isCurated
                                    ? 'bg-amber-500/14 border-b-2 border-amber-500/65 hover:bg-amber-500/25'
                                    : 'hover:bg-sky-500/14 border-b border-dashed border-[var(--border-strong)]'
                                }`}
                                title={`${detail.posBn} · ${detail.meaningBn}`}
                              >
                                {tok}
                              </button>
                            );
                          })}
                          <span className="text-lg text-[var(--accent)] px-1">﴿{v.ayahNumber}﴾</span>
                        </div>
                      ) : (
                        <p
                          className="font-arabic text-3xl sm:text-4xl text-[var(--text-primary)] leading-[2.25] text-right"
                          dir="rtl"
                        >
                          {v.arabic} <span className="text-lg text-[var(--accent)]">﴿{v.ayahNumber}﴾</span>
                        </p>
                      )}

                      {/* Interactive Word-Level Sarf & Nahw Tooltip Popover */}
                      {showQuranicGrammar && ayahTooltip && (
                        <div className="rounded-2xl p-4 border border-emerald-500/45 bg-gradient-to-br from-emerald-500/10 via-[var(--bg-surface-alt)] to-indigo-500/10 shadow-md space-y-2.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                                {ayahTooltip.detail.arabic}
                              </span>
                              <div>
                                <div className="text-sm font-extrabold text-[var(--text-primary)]">
                                  {ayahTooltip.detail.meaningBn}
                                </div>
                                <div className="text-xs text-[var(--text-muted)]">
                                  {ayahTooltip.detail.pronunciationBn
                                    ? `উচ্চারণ: ${ayahTooltip.detail.pronunciationBn} · `
                                    : ''}
                                  পদ: <span className="font-semibold text-[var(--accent)]">{ayahTooltip.detail.posBn}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  speakArabic(ayahTooltip.detail.arabic, {
                                    voiceGender: progress.voiceGender || 'male',
                                    rate: 0.85,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold btn-secondary"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                                <span>শুনুন</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTooltip(null)}
                                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                aria-label="Close grammar tooltip"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {ayahTooltip.tarkibRoleBn && (
                            <div className="rounded-2xl bg-[var(--emerald-highlight)] border border-[var(--accent)]/30 p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--accent)]">
                                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                                <span>আয়াতে তারকিব (পদ ভূমিকা): {ayahTooltip.tarkibRoleBn}</span>
                              </div>
                              {ayahTooltip.tarkibReasonBn && (
                                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                                  {ayahTooltip.tarkibReasonBn}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl surface-card border border-[var(--border-subtle)] p-3.5 space-y-1">
                              <div className="font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2">
                                <span>ছরফ (Sarf · রূপতত্ত্ব)</span>
                                <span className="font-arabic text-base" dir="rtl">
                                  {ayahTooltip.detail.root}
                                </span>
                              </div>
                              <p className="text-[var(--text-secondary)] leading-relaxed">
                                {ayahTooltip.detail.sarfBn}
                              </p>
                            </div>
                            <div className="rounded-2xl surface-card border border-[var(--border-subtle)] p-3.5 space-y-1">
                              <div className="font-extrabold text-indigo-700 dark:text-indigo-300">
                                নাহু (Nahw · বাক্যতত্ত্ব ও ই‘রাব)
                              </div>
                              <p className="text-[var(--text-secondary)] leading-relaxed">
                                {ayahTooltip.detail.nahwBn}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {openTarkibAyat[v.ayahNumber] && (
                        <SentenceTarkibCard
                          sentenceAr={v.arabic}
                          titleLabel={`আয়াত ${activeSurah.surahNumber}:${v.ayahNumber} — সম্পূর্ণ তারকিব`}
                          onClose={() =>
                            setOpenTarkibAyat((prev) => ({
                              ...prev,
                              [v.ayahNumber]: false,
                            }))
                          }
                        />
                      )}

                      <div className="space-y-1 text-[15.5px] sm:text-base leading-relaxed">
                        <div className="text-sm text-[var(--text-muted)]">
                          উচ্চারণ:{' '}
                          <span className="font-medium text-[var(--text-secondary)]">
                            {v.pronunciationBn}
                          </span>
                        </div>
                        <div className="font-bold text-[var(--text-primary)]">{v.translationBn}</div>
                        <div className="text-xs sm:text-sm text-[var(--text-muted)]">{v.translationEn}</div>
                      </div>

                      {/* Open Nahw & Sarf Grammatical Breakdown */}
                      {showQuranicGrammar && ayahGrammar && isGrammarOpen && (
                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm leading-relaxed">
                          <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 space-y-1">
                            <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-300">
                              নাহু (তারকীব ও ইরাব কায়দা):
                            </div>
                            <p className="text-[var(--text-secondary)] font-arabic-ui">
                              {ayahGrammar.nahwBn}
                            </p>
                          </div>
                          <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 space-y-1">
                            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
                              ছরফ (মাদ্দাহ, বাব ও রূপান্তর):
                            </div>
                            <p className="text-[var(--text-secondary)] font-arabic-ui">
                              {ayahGrammar.sarfBn}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Key Words & Root Breakdown for This Surah */}
              {activeSurah.keyWords.length > 0 && (
                <div className="surface-card rounded-3xl p-5 space-y-4 border border-[var(--border-strong)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[var(--accent)]">
                      এই সূরার নির্বাচিত শব্দের মূলধাতু (জযর) ও ব্যাকরণ:
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        awardXp(25, {
                          titleBn: `${activeSurah.nameBn} সম্পূর্ণ পাঠ সম্পন্ন`,
                          titleEn: `Completed reading ${activeSurah.nameEn}`,
                          type: 'lesson',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-primary"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>সূরা পাঠ সম্পন্ন (+25 XP)</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeSurah.keyWords.map((kw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedWordIdx(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                          selectedWordIdx === idx ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        <span className="font-arabic text-base me-1.5">{kw.arabic}</span>
                        <span>({kw.meaningBn})</span>
                      </button>
                    ))}
                  </div>

                  {activeKeyWord && (
                    <div className="surface-alt rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                          {activeKeyWord.arabic}
                        </p>
                        <div className="text-xs text-[var(--text-muted)]">
                          উচ্চারণ: {activeKeyWord.pronunciationBn}
                        </div>
                        <div className="font-bold">
                          {activeKeyWord.meaningBn}{' '}
                          <span className="text-xs font-normal text-[var(--text-muted)]">
                            ({activeKeyWord.meaningEn})
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs text-[var(--text-muted)]">মূলধাতু: </span>
                          <span className="font-arabic text-lg text-[var(--accent)] font-bold" dir="rtl">
                            {activeKeyWord.root}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-[var(--text-muted)]">পদ পরিচয়: </span>
                          <span className="font-semibold">{activeKeyWord.posBn}</span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {activeKeyWord.grammarNoteBn}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
