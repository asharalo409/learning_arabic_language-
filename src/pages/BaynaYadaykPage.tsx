import React, { useState } from 'react';
import { BookMarked, CheckCircle2, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';
import { BAYNA_YADAYK_UNITS } from '../data/baynaYadaykData';
import { speakArabic } from '../utils/speech';

export const BaynaYadaykPage: React.FC = () => {
  const { lang, awardXp } = useApp();
  const [selectedUnitNum, setSelectedUnitNum] = useState(1);
  const [activeTab, setActiveTab] = useState<'dialogues' | 'vocab' | 'drills' | 'sounds'>('dialogues');
  const [activeSubIdx, setActiveSubIdx] = useState<Record<number, number>>({});

  const unit = BAYNA_YADAYK_UNITS.find((u) => u.unitNumber === selectedUnitNum) || BAYNA_YADAYK_UNITS[0];

  return (
    <AppShell
      title={lang === 'bn' ? 'আল-আরাবিয়্যাতু বাইনা ইয়াদাইক (العربية بين يديك)' : 'Al-Arabiyyah Bayna Yadayk'}
      subtitle={
        lang === 'bn'
          ? 'বিশ্বখ্যাত ধারাবাহিক পদ্ধতির আদলে সংলাপ, শব্দভাণ্ডার, প্যাটার্ন তাদরীব ও ধ্বনিবিজ্ঞান'
          : 'Structured thematic units with multi-dialogues, substitution drills & phonetics'
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
                onClick={() => {
                  setSelectedUnitNum(u.unitNumber);
                  setActiveTab('dialogues');
                }}
                className={`p-4 rounded-xl border text-left transition-colors space-y-1 ${
                  active
                    ? 'surface-alt border-[var(--border-strong)]'
                    : 'surface-card hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[var(--accent)]">
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
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <div className="text-xs font-medium text-[var(--accent)] flex items-center gap-1.5">
                <BookMarked className="w-4 h-4" />
                <span>{unit.bookNameBn} · {unit.bookNameAr}</span>
              </div>
              <p className="font-arabic text-2xl text-[var(--accent)] mt-1" dir="rtl">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>অধ্যায় সম্পন্ন (+30 XP)</span>
            </button>
          </div>

          {/* Bayna Yadayk Standard 4 Tabs */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'dialogues', label: 'الحِوَارَاتُ (সংলাপসমূহ)' },
                { id: 'vocab', label: 'المُفْرَدَاتُ (শব্দভাণ্ডার)' },
                { id: 'drills', label: 'التَّرَاكِيبُ (প্যাটার্ন তাদরীব)' },
                { id: 'sounds', label: 'الأَصْوَاتُ (ধ্বনি ও উচ্চারণ)' },
              ] as const
            ).map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setActiveTab(tabItem.id)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  activeTab === tabItem.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Dialogues (الحوار الأول، الثاني، الثالث) */}
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
                    <AudioButton
                      text={dlg.lines.map((l) => l.arabic).join(' ')}
                      showSlow
                    />
                  </div>

                  <div className="space-y-3">
                    {dlg.lines.map((line, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--accent)]">
                            <span className="font-arabic-ui text-sm me-2">{line.speakerAr}</span>
                            ({line.speakerBn})
                          </span>
                          <AudioButton text={line.arabic} compact showSlow={false} />
                        </div>
                        <p className="font-arabic text-xl sm:text-2xl text-[var(--text-primary)]" dir="rtl">
                          {line.arabic}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">{line.pronunciationBn}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{line.meaningBn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Vocabulary */}
          {activeTab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit.vocabulary.map((v, idx) => (
                <div key={idx} className="surface-alt rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">{v.arabic}</p>
                    <p className="text-xs text-[var(--text-muted)]">{v.pronunciationBn}</p>
                    <p className="text-sm font-semibold">
                      {v.meaningBn} <span className="font-normal text-xs text-[var(--text-muted)]">· {v.meaningEn}</span>
                    </p>
                  </div>
                  <AudioButton text={v.arabic} compact />
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Pattern Substitution Drills (التدريبات النحوية) */}
          {activeTab === 'drills' && (
            <div className="space-y-5">
              {unit.patternDrills.map((drill, dIdx) => {
                const subIdx = activeSubIdx[dIdx] ?? 0;
                const currentSub = drill.substitutions[subIdx];
                return (
                  <div key={dIdx} className="surface-alt rounded-xl p-5 space-y-4">
                    <div>
                      <div className="text-xs font-medium text-[var(--accent)]">{drill.patternBn}</div>
                      <p className="font-arabic text-2xl text-[var(--accent)] mt-1" dir="rtl">
                        {drill.patternAr}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-2">
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
                        <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-strong)] space-y-1.5 mt-2">
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
                          <p className="text-sm">{currentSub.resultBn}</p>
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
                <span className="text-xs text-[var(--accent)] font-medium">মাখরাজ ও ধ্বনি অনুশীলন</span>
                <p className="font-arabic text-3xl text-[var(--accent)] mt-1" dir="rtl">
                  {unit.soundsFocus.letters}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{unit.soundsFocus.noteBn}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {unit.soundsFocus.examples.map((ex, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="font-arabic text-2xl" dir="rtl">{ex}</span>
                    <AudioButton text={ex} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
