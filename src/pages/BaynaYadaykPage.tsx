import React, { useMemo, useRef, useState } from 'react';
import { BookMarked, Bot, CheckCircle2, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { LessonAiPracticePanel } from '../components/LessonAiPracticePanel';
import { useApp } from '../context/AppContext';
import { BAYNA_YADAYK_UNITS } from '../data/baynaYadaykData';
import { speakArabic } from '../utils/speech';

export const BaynaYadaykPage: React.FC = () => {
  const { lang, awardXp } = useApp();
  const [selectedUnitNum, setSelectedUnitNum] = useState(1);
  const [activeTab, setActiveTab] = useState<'dialogues' | 'vocab' | 'drills' | 'sounds' | 'ai-practice'>('dialogues');
  const [activeSubIdx, setActiveSubIdx] = useState<Record<number, number>>({});
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const unit = BAYNA_YADAYK_UNITS.find((u) => u.unitNumber === selectedUnitNum) || BAYNA_YADAYK_UNITS[0];

  const handleSelectUnit = (unitNum: number) => {
    setSelectedUnitNum(unitNum);
    setActiveTab('dialogues');
    window.setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const unitScopeContext = useMemo(() => {
    const dlgLines = unit.dialogues
      .slice(0, 2)
      .flatMap((d) => d.lines.slice(0, 4).map((l) => `${l.speakerAr}: ${l.arabic} (${l.meaningBn})`))
      .join('\n');
    const vocabLines = unit.vocabulary
      .map((v) => `- ${v.arabic} (${v.pronunciationBn}): ${v.meaningBn}`)
      .join('\n');
    const drillLines = unit.patternDrills
      .map((p) => `${p.patternBn}: ${p.exampleAr} (${p.exampleBn})`)
      .join('\n');

    return [
      `বাইনা ইয়াদাইক ইউনিট ${unit.unitNumber}: ${unit.titleBn} (${unit.titleAr})`,
      `মূল সংলাপসমূহ:\n${dlgLines}`,
      `এই ইউনিটের শব্দভাণ্ডার:\n${vocabLines}`,
      `প্যাটার্ন তাদরীব:\n${drillLines}`,
    ].join('\n\n');
  }, [unit]);

  return (
    <AppShell
      title={lang === 'bn' ? 'আল-আরাবিয়্যাতু বাইনা ইয়াদাইক (العربية بين يديك)' : 'Al-Arabiyyah Bayna Yadayk'}
      subtitle={
        lang === 'bn'
          ? 'বিশ্বখ্যাত ধারাবাহিক পদ্ধতির আদলে সংলাপ, শব্দভাণ্ডার, প্যাটার্ন তাদরীব, ধ্বনিবিজ্ঞান ও ইউনিটভিত্তিক AI চর্চা'
          : 'Structured thematic units with multi-dialogues, substitution drills & scoped AI practice'
      }
    >
      <div className="space-y-6">
        {/* Unit Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BAYNA_YADAYK_UNITS.map((u) => {
            const active = u.unitNumber === unit.unitNumber;
            return (
              <button
                key={u.unitNumber}
                type="button"
                onClick={() => handleSelectUnit(u.unitNumber)}
                className={`p-4 rounded-2xl border text-left transition-colors space-y-1.5 ${
                  active
                    ? 'surface-alt border-[var(--border-strong)] shadow-sm'
                    : 'surface-card hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
                  <span>{u.bookNameBn}</span>
                  <span className="font-arabic-ui">{u.bookNameAr}</span>
                </div>
                <div className="text-sm font-bold">{u.titleBn}</div>
                <div className="font-arabic text-base text-[var(--text-secondary)] truncate" dir="rtl">
                  {u.titleAr}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Unit Workspace */}
        <div ref={workspaceRef} className="surface-card rounded-2xl p-5 sm:p-6 space-y-6 scroll-mt-20">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5">
                <BookMarked className="w-4 h-4" />
                <span>{unit.bookNameBn}</span>
                <span aria-hidden="true">|</span>
                <span className="font-arabic-ui">{unit.bookNameAr}</span>
              </div>
              <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] mt-1" dir="rtl">
                {unit.titleAr}
              </p>
              <h2 className="text-xl font-bold mt-0.5">{unit.titleBn}</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                awardXp(30, {
                  titleBn: `বাইনা ইয়াদাইক ${unit.titleBn} অনুশীলন`,
                  titleEn: `Practiced Bayna Yadayk ${unit.titleEn}`,
                  type: 'lesson',
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs btn-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>অধ্যায় সম্পন্ন (+30 XP)</span>
            </button>
          </div>

          {/* Clean Single-Row Horizontal Underline Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)] pb-px">
            {(
              [
                { id: 'dialogues', label: 'সংলাপসমূহ' },
                { id: 'vocab', label: 'শব্দভাণ্ডার' },
                { id: 'drills', label: 'তাদরীব' },
                { id: 'sounds', label: 'ধ্বনিবিজ্ঞান' },
                { id: 'ai-practice', label: 'AI চর্চা' },
              ] as const
            ).map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setActiveTab(tabItem.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  activeTab === tabItem.id
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tabItem.id === 'ai-practice' && <Bot className="w-3.5 h-3.5" />}
                <span>{tabItem.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Dialogues */}
          {activeTab === 'dialogues' && (
            <div className="space-y-6">
              {unit.dialogues.map((dlg) => (
                <div key={dlg.id} className="surface-alt rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="font-arabic text-xl text-[var(--accent)]" dir="rtl">
                        {dlg.titleAr}
                      </span>
                      <h3 className="text-base font-bold">{dlg.titleBn}</h3>
                    </div>
                    <AudioButton text={dlg.lines.map((l) => l.arabic).join(' ')} showSlow />
                  </div>

                  <div className="space-y-3">
                    {dlg.lines.map((line, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--accent)]">
                            <span className="font-arabic-ui text-sm me-2">{line.speakerAr}</span>
                            <span className="text-[var(--text-muted)] font-normal">({line.speakerBn})</span>
                          </span>
                          <AudioButton text={line.arabic} compact showSlow={false} />
                        </div>
                        <p className="font-arabic text-xl sm:text-2xl text-[var(--text-primary)]" dir="rtl">
                          {line.arabic}
                        </p>
                        <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
                          <div className="text-xs text-[var(--text-muted)]">
                            উচ্চারণ: <span className="font-medium text-[var(--text-secondary)]">{line.pronunciationBn}</span>
                          </div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            অর্থ: {line.meaningBn}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Vocabulary (Cleanly Formatted Separated Rows) */}
          {activeTab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit.vocabulary.map((v, idx) => (
                <div
                  key={idx}
                  className="surface-alt rounded-xl p-4 sm:p-5 flex items-start justify-between gap-3 border border-[var(--border-subtle)]"
                >
                  <div className="space-y-1.5">
                    <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)]" dir="rtl">
                      {v.arabic}
                    </p>
                    <div className="text-xs text-[var(--text-muted)]">
                      উচ্চারণ: <span className="font-semibold text-[var(--text-primary)]">{v.pronunciationBn}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-xs text-[var(--text-muted)]">বাংলা অর্থ: </span>
                      <span className="font-bold text-[var(--text-primary)]">{v.meaningBn}</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">ইংরেজি: {v.meaningEn}</div>
                  </div>
                  <AudioButton text={v.arabic} compact />
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Pattern Substitution Drills */}
          {activeTab === 'drills' && (
            <div className="space-y-5">
              {unit.patternDrills.map((drill, dIdx) => {
                const subIdx = activeSubIdx[dIdx] ?? 0;
                const currentSub = drill.substitutions[subIdx];
                return (
                  <div key={dIdx} className="surface-alt rounded-xl p-5 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-[var(--accent)]">{drill.patternBn}</div>
                      <p className="font-arabic text-2xl text-[var(--accent)] mt-1" dir="rtl">
                        {drill.patternAr}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
                      <div className="text-xs text-[var(--text-muted)]">মূল উদাহরণ:</div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-arabic text-xl" dir="rtl">{drill.exampleAr}</p>
                        <AudioButton text={drill.exampleAr} compact />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">{drill.exampleBn}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[var(--text-muted)]">
                        শব্দ বদলে নতুন বাক্য চর্চা করুন (ক্লিক করুন):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {drill.substitutions.map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              setActiveSubIdx((prev) => ({ ...prev, [dIdx]: sIdx }));
                              speakArabic(sub.resultAr);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                              subIdx === sIdx ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            {sub.promptBn}
                          </button>
                        ))}
                      </div>
                      {currentSub && (
                        <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-strong)] space-y-1.5 mt-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                              {currentSub.resultAr}
                            </p>
                            <button
                              type="button"
                              onClick={() => speakArabic(currentSub.resultAr)}
                              className="p-2 rounded-lg btn-secondary"
                              aria-label="Play Drill"
                            >
                              <Volume2 className="w-4 h-4 text-[var(--accent)]" />
                            </button>
                          </div>
                          <p className="text-sm font-medium">{currentSub.resultBn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 4: Sounds & Phonetics */}
          {activeTab === 'sounds' && (
            <div className="surface-alt rounded-xl p-5 space-y-4">
              <div>
                <span className="text-xs text-[var(--accent)] font-semibold">মাখরাজ ও ধ্বনি অনুশীলন</span>
                <p className="font-arabic text-3xl text-[var(--accent)] mt-1" dir="rtl">
                  {unit.soundsFocus.letters}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{unit.soundsFocus.noteBn}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {unit.soundsFocus.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between"
                  >
                    <span className="font-arabic text-2xl" dir="rtl">{ex}</span>
                    <AudioButton text={ex} compact />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Scoped AI Practice for this Unit */}
          {activeTab === 'ai-practice' && (
            <LessonAiPracticePanel
              key={unit.unitNumber}
              lessonTitle={`${unit.bookNameBn}: ${unit.titleBn}`}
              lessonScopeContext={unitScopeContext}
              starterQuestions={[
                `এই ইউনিটের সংলাপ (${unit.titleBn}) নিয়ে আমার সাথে প্রশ্ন-উত্তর চর্চা করুন।`,
                `এই ইউনিটের নতুন শব্দগুলো দিয়ে আমার পরীক্ষা নিন।`,
                `প্যাটার্ন তাদরীব অনুযায়ী আমাকে একটি শূন্যস্থান পূরণ দিন।`,
              ]}
              levelLabel={unit.bookNameBn}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
};
