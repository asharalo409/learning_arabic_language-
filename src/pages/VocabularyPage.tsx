import React, { useMemo, useState } from 'react';
import { Heart, RotateCcw, Search, Layers } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';

export const VocabularyPage: React.FC = () => {
  const { t, lang, allVocabulary, progress, reviewVocabWord, toggleFavoriteVocab } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'flashcards'>('list');
  const [category, setCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [search, setSearch] = useState('');

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>(allVocabulary.map((w) => w.category));
    return ['all', ...Array.from(set)];
  }, [allVocabulary]);

  const filteredWords = useMemo(() => {
    return allVocabulary.filter((w) => {
      if (category !== 'all' && w.category !== category) return false;
      if (onlyFavorites && !progress.vocabProgress[w.id]?.favorite) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          w.arabic.includes(search) ||
          w.meaningBn.toLowerCase().includes(q) ||
          w.meaningEn.toLowerCase().includes(q) ||
          w.pronunciationBn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allVocabulary, category, onlyFavorites, search, progress.vocabProgress]);

  const dueCount = useMemo(() => {
    const now = Date.now();
    return allVocabulary.filter((w) => {
      const rec = progress.vocabProgress[w.id];
      if (!rec) return true;
      return new Date(rec.nextReviewIso).getTime() <= now;
    }).length;
  }, [allVocabulary, progress.vocabProgress]);

  const activeCard = filteredWords[cardIndex % Math.max(1, filteredWords.length)];

  const handleReview = (quality: 'again' | 'good' | 'easy') => {
    if (!activeCard) return;
    reviewVocabWord(activeCard.id, quality);
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
  };

  return (
    <AppShell
      title={t.sidebar.vocabulary}
      subtitle={
        lang === 'bn'
          ? `দৈনিক শব্দভান্ডার, ফ্ল্যাশকার্ড ও স্পেসড রিপিটেশন (রিভিউ বাকি: ${dueCount}টি শব্দ)`
          : `Arabic Vocabulary Builder with Spaced Repetition (${dueCount} due for review)`
      }
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="surface-card rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-xs font-medium ${
                  viewMode === 'list' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {lang === 'bn' ? 'শব্দ তালিকা' : 'Word List'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('flashcards');
                  setFlipped(false);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium ${
                  viewMode === 'flashcards' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ফ্ল্যাশকার্ড ও SRS' : 'Flashcards (SRS)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyFavorites((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  onlyFavorites ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'প্রিয় শব্দ' : 'Favorites'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'bn' ? 'আরবি, বাংলা বা ইংরেজি শব্দ খুঁজুন...' : 'Search Arabic, Bengali, or English...'}
                className="w-full ps-9 pe-4 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setCardIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    category === cat ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {cat === 'all' ? (lang === 'bn' ? 'সকল' : 'All') : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flashcard SRS Mode */}
        {viewMode === 'flashcards' && (
          <div className="max-w-xl mx-auto">
            {activeCard ? (
              <div className="surface-card rounded-2xl p-6 sm:p-8 text-center space-y-6">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{activeCard.category}</span>
                  <span className="font-mono-num">
                    {(cardIndex % filteredWords.length) + 1} / {filteredWords.length}
                  </span>
                </div>

                <div className="py-6 space-y-3">
                  <p className="font-arabic text-4xl sm:text-5xl text-[var(--accent)]" dir="rtl">
                    {activeCard.arabic}
                  </p>
                  <div className="flex justify-center pt-2">
                    <AudioButton text={activeCard.arabic} />
                  </div>
                </div>

                {!flipped ? (
                  <button
                    type="button"
                    onClick={() => setFlipped(true)}
                    className="w-full py-3 rounded-xl text-sm btn-primary"
                  >
                    {lang === 'bn' ? 'অর্থ ও উদাহরণ দেখুন' : 'Reveal Meaning & Example'}
                  </button>
                ) : (
                  <div className="space-y-5 pt-4 border-t border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--text-muted)]">{activeCard.pronunciationBn}</p>
                      <p className="text-xl font-bold">{activeCard.meaningBn}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{activeCard.meaningEn}</p>
                    </div>

                    <div className="surface-alt rounded-xl p-4 space-y-1 text-left">
                      <p className="font-arabic text-lg text-[var(--accent)] text-right" dir="rtl">
                        {activeCard.exampleAr}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{activeCard.exampleBn}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-[var(--text-muted)]">
                        স্পেসড রিপিটেশন রেটিং (পরবর্তী রিভিউ নির্ধারণ):
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview('again')}
                          className="py-2.5 rounded-lg text-xs font-semibold border border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline me-1" />
                          আবার (Hard)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview('good')}
                          className="py-2.5 rounded-lg text-xs font-semibold btn-secondary"
                        >
                          মনে আছে (Good)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview('easy')}
                          className="py-2.5 rounded-lg text-xs font-semibold btn-primary"
                        >
                          খুব সহজ (Easy)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
                কোনো শব্দ পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।
              </div>
            )}
          </div>
        )}

        {/* Word Grid List */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.length === 0 && (
              <div className="md:col-span-2 surface-card rounded-2xl p-8 text-center text-sm text-[var(--text-muted)]">
                আপনার অনুসন্ধানের সাথে মিলে এমন কোনো শব্দ পাওয়া যায়নি।
              </div>
            )}

            {filteredWords.map((word) => {
              const rec = progress.vocabProgress[word.id];
              const isFav = Boolean(rec?.favorite);
              return (
                <div key={word.id} className="surface-card rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {word.category}
                        {word.root ? ` · মূলধাতু: ${word.root}` : ''}
                      </span>
                      <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] mt-1" dir="rtl">
                        {word.arabic}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{word.pronunciationBn}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteVocab(word.id)}
                        aria-label="Toggle Favorite"
                        className="p-2 rounded-lg btn-secondary"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]'
                          }`}
                        />
                      </button>
                      <AudioButton text={word.arabic} compact showSlow={false} />
                    </div>
                  </div>

                  <div className="text-sm font-semibold">
                    {word.meaningBn}{' '}
                    <span className="font-normal text-[var(--text-secondary)]">· {word.meaningEn}</span>
                  </div>

                  <div className="surface-alt rounded-lg p-3 space-y-1">
                    <p className="font-arabic text-base" dir="rtl">{word.exampleAr}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{word.exampleBn}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                    <span>
                      {rec
                        ? `অনুশীলন: ${rec.repetitions} বার · পরবর্তী রিভিউ: ${rec.intervalDays} দিন পর`
                        : 'এখনো রিভিউ করা হয়নি'}
                    </span>
                    <button
                      type="button"
                      onClick={() => reviewVocabWord(word.id, 'good')}
                      className="text-[var(--accent)] font-semibold hover:underline"
                    >
                      + অনুশীলিত চিহ্ন দিন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};
