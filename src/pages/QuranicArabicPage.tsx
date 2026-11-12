import React, { useState } from 'react';
import { BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { QURANIC_AYAT } from '../data/quranicData';

export const QuranicArabicPage: React.FC = () => {
  const { t, lang, awardXp } = useApp();
  const [selectedAyahIdx, setSelectedAyahIdx] = useState(0);
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);
  const [exerciseAnswer, setExerciseAnswer] = useState<number | null>(null);

  const ayah = QURANIC_AYAT[selectedAyahIdx];
  const activeWord = ayah.words[selectedWordIdx] || ayah.words[0];

  const ayahExerciseOptions = ayah.words.map((w) => w.meaningBn);
  const targetWord = ayah.words[0];

  const handleCheckAyahQuiz = (idx: number) => {
    setExerciseAnswer(idx);
    if (idx === 0) {
      awardXp(15, {
        titleBn: `কুরআনিক শব্দ অনুশীলন: ${ayah.surahNameBn} (${ayah.surahNumber}:${ayah.ayahNumber})`,
        titleEn: `Quranic word exercise: ${ayah.surahNameEn} (${ayah.surahNumber}:${ayah.ayahNumber})`,
        type: 'lesson',
      });
    }
  };

  return (
    <AppShell
      title={t.sidebar.quranic}
      subtitle={
        lang === 'bn'
          ? 'প্রামাণিক সূরা ও আয়াত ভিত্তিক শব্দার্থ, মূলধাতু (جذر) এবং কুরআনিক ব্যাকরণ'
          : 'Authentic Surah & Ayah word-by-word meanings, triliteral roots, and Quranic grammar'
      }
    >
      <div className="space-y-6">
        {/* Integrity Notice */}
        <div className="surface-alt rounded-xl p-4 text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
          <BookOpenCheck className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <span>
            <strong>প্রামাণিক উৎস নির্দেশিকা:</strong> এখানে প্রদর্শিত প্রতিটি কুরআনিক আয়াত সরাসরি সূরা ও আয়াত নম্বরসহ যাচাইকৃত মুসহাফ পাঠ্য থেকে নেওয়া হয়েছে। কুরআনিক আয়াত ও সাধারণ শিক্ষামূলক বাক্য সর্বদা স্পষ্টভাবে আলাদা রাখা হয়েছে।
          </span>
        </div>

        {/* Ayah Selector */}
        <div className="flex flex-wrap gap-2">
          {QURANIC_AYAT.map((item, idx) => (
            <button
              key={`${item.surahNumber}-${item.ayahNumber}`}
              type="button"
              onClick={() => {
                setSelectedAyahIdx(idx);
                setSelectedWordIdx(0);
                setExerciseAnswer(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                selectedAyahIdx === idx ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {item.surahNameBn} ({item.surahNumber}:{item.ayahNumber})
            </button>
          ))}
        </div>

        {/* Main Ayah Display */}
        <div className="surface-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <span className="text-xs text-[var(--accent)] font-medium">
                প্রামাণিক কুরআনিক আয়াত · {ayah.surahNameBn} ({ayah.surahNumber}:{ayah.ayahNumber})
              </span>
              <h2 className="text-lg font-bold mt-0.5 font-arabic-ui">
                {ayah.surahNameAr} — {ayah.surahNameEn}
              </h2>
            </div>
            <AudioButton text={ayah.arabic} showSlow />
          </div>

          <div className="surface-alt rounded-xl p-6 text-center space-y-3">
            <p className="font-arabic text-3xl sm:text-4xl text-[var(--accent)] leading-loose" dir="rtl">
              {ayah.arabic}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{ayah.pronunciationBn}</p>
            <p className="text-base font-semibold">{ayah.translationBn}</p>
            <p className="text-xs text-[var(--text-secondary)]">{ayah.translationEn}</p>
          </div>

          {/* Interactive Word-by-Word Clickable Chips */}
          <div className="space-y-2.5">
            <div className="text-xs font-medium text-[var(--text-muted)]">
              শব্দ-ভিত্তিক মূলধাতু ও ব্যাকরণ বিশ্লেষণ দেখতে নিচের যেকোনো শব্দে ক্লিক করুন:
            </div>
            <div className="flex flex-wrap flex-row-reverse justify-center gap-2.5" dir="rtl">
              {ayah.words.map((w, wIdx) => (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => setSelectedWordIdx(wIdx)}
                  className={`px-4 py-3 rounded-xl border text-center transition-colors ${
                    selectedWordIdx === wIdx
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
          </div>

          {/* Word Analysis Inspector */}
          {activeWord && (
            <div className="surface-alt rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-arabic text-3xl text-[var(--accent)]" dir="rtl">
                    {activeWord.arabic}
                  </span>
                  <AudioButton text={activeWord.arabic} compact />
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  উচ্চারণ: {activeWord.pronunciationBn}
                </div>
                <div className="text-base font-semibold">
                  {activeWord.meaningBn} <span className="text-xs text-[var(--text-muted)]">({activeWord.meaningEn})</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-[var(--text-muted)]">ত্রিবর্ণ মূলধাতু (Root): </span>
                  <span className="font-arabic text-lg text-[var(--accent)] font-bold" dir="rtl">
                    {activeWord.root}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)]">পদ পরিচিতি: </span>
                  <span className="font-medium">{activeWord.posBn}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  ব্যাকরণ নোট: {activeWord.grammarNoteBn}
                </p>
              </div>
            </div>
          )}

          {/* Linguistic Reflection */}
          <div className="text-xs text-[var(--text-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <strong>ভাষাতাত্ত্বিক ও বালাগী নোট:</strong> {ayah.reflectionBn}
          </div>

          {/* Quick Ayah Exercise */}
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
            <div className="text-sm font-semibold">
              আয়াত ভিত্তিক অনুশীলন: <span className="font-arabic text-xl text-[var(--accent)] mx-1" dir="rtl">{targetWord.arabic}</span> শব্দটির সঠিক অর্থ কোনটি?
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ayahExerciseOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCheckAyahQuiz(i)}
                  className={`px-3 py-2 rounded-lg text-xs border text-left flex items-center justify-between ${
                    exerciseAnswer === i
                      ? i === 0
                        ? 'border-[var(--success)] bg-[var(--emerald-highlight)] font-semibold'
                        : 'border-[var(--danger)] bg-[var(--danger)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)]'
                  }`}
                >
                  <span>{opt}</span>
                  {exerciseAnswer === i && i === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
