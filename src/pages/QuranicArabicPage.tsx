import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { QURAN_ALL_SHORT_SURAHS, QURANIC_AYAT } from '../data/quranicData';
import { localizeGrammarLabel } from '../utils/grammarTerminology';

export const QuranicArabicPage: React.FC = () => {
  const { t, lang, grammarTerminologyMode } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const surahParam = Number(searchParams.get('surah'));

  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailedLab, setShowDetailedLab] = useState(false);
  const [selectedLabAyahIdx, setSelectedLabAyahIdx] = useState(0);
  const [labWordIdx, setLabWordIdx] = useState(0);

  // Legacy ?surah=N links redirect cleanly to dedicated Surah reader route
  useEffect(() => {
    if (QURAN_ALL_SHORT_SURAHS.some((s) => s.surahNumber === surahParam)) {
      navigate(`/quranic-arabic/${surahParam}`, { replace: true });
    }
  }, [surahParam, navigate]);

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
          : 'Complete Al-Fatihah + Last 25 Surahs (90–114) with 1/100 lesson structure'
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
              যেকোনো সূরায় প্রবেশ করলে ১/১০০ পাঠের মতো আলাদা পৃষ্ঠায় আয়াত, শব্দ-মূলধাতু, ছরফ-নাহু, তারকিব ট্রি ও অনুশীলন খুলবে।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDetailedLab((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-emerald-950 font-bold text-xs shadow hover:bg-emerald-50 transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{showDetailedLab ? 'সূরা তালিকায় ফিরুন' : 'শব্দে-শব্দে মূলধাতু ল্যাব'}</span>
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
                      <span className="text-xs text-[var(--text-muted)]">মূলধাতু (مَادَّة): </span>
                      <span className="font-arabic text-lg text-[var(--accent)] font-bold" dir="rtl">
                        {labWord.root}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">পদ পরিচিতি: </span>
                      <span className="font-medium">
                        {localizeGrammarLabel(labWord.posBn, grammarTerminologyMode)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {localizeGrammarLabel(labWord.grammarNoteBn, grammarTerminologyMode)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Clean 26-Surah Index Only (Clicking a Surah opens dedicated /quranic-arabic/:surahNumber page) */
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সূরা খুঁজুন (যেমন: ফাতিহা, ইখলাস, ১১২, দুহা)..."
                className="w-full ps-10 pe-4 py-2.5 rounded-2xl surface-card text-xs sm:text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredSurahs.map((surah) => (
                <Link
                  key={surah.surahNumber}
                  to={`/quranic-arabic/${surah.surahNumber}`}
                  className="surface-card rounded-2xl p-4 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono-num font-extrabold text-[var(--accent)]">
                      সূরা {surah.surahNumber} · {surah.verses.length} আয়াত
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{surah.revelationTypeBn}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {surah.nameBn}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{surah.nameEn}</p>
                    </div>
                    <span className="font-arabic text-2xl text-[var(--accent)] shrink-0" dir="rtl">
                      {surah.nameAr.replace('سُورَةُ ', '')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent)]">
                    <span>পাঠ ও তারকিব খুলুন</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
