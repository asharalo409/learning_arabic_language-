import React, { useMemo, useState } from 'react';
import { GitBranch, LayoutGrid, Link2, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  analyzeSentenceTarkib,
  SentenceTarkibResult,
  SentenceTarkibWord,
} from '../data/nahwQuickTips';
import { formatGrammarTerm, localizeGrammarLabel } from '../utils/grammarTerminology';
import { AudioButton } from './AudioButton';

interface TarkibVisualizerProps {
  sentenceAr: string;
  translationBn?: string;
  translationEn?: string;
  precomputed?: SentenceTarkibResult;
  onClose?: () => void;
  titleLabel?: string;
  initialSelectedIndex?: number;
  compact?: boolean;
}

interface TreeBranchGroup {
  id: string;
  titlePrimary: string;
  titleSecondary: string;
  tooltipBn: string;
  explanationBn: string;
  wordIndices: number[];
  relationshipKey?: string;
}

function getTarkibBranchStyle(titlePrimary: string, titleSecondary: string, idx: number): {
  card: string;
  badge: string;
  stroke: string;
} {
  const combined = `${titlePrimary} ${titleSecondary}`;
  if (combined.includes('مبتدأ') || combined.includes('মুবতাদা')) {
    return {
      card: 'border-emerald-500/45 bg-emerald-500/10',
      badge: 'text-emerald-700 dark:text-emerald-300',
      stroke: '#10b981',
    };
  }
  if (combined.includes('خبر') || combined.includes('খবর')) {
    return {
      card: 'border-sky-500/45 bg-sky-500/10',
      badge: 'text-sky-700 dark:text-sky-300',
      stroke: '#0ea5e9',
    };
  }
  if (combined.includes('فعل') || combined.includes('ফেল') || combined.includes('ক্রিয়া')) {
    return {
      card: 'border-indigo-500/45 bg-indigo-500/10',
      badge: 'text-indigo-700 dark:text-indigo-300',
      stroke: '#6366f1',
    };
  }
  if (combined.includes('فاعل') || combined.includes('ফায়েল') || combined.includes('কর্তা')) {
    return {
      card: 'border-violet-500/45 bg-violet-500/10',
      badge: 'text-violet-700 dark:text-violet-300',
      stroke: '#8b5cf6',
    };
  }
  if (combined.includes('مفعول') || combined.includes('মাফউল') || combined.includes('কর্ম')) {
    return {
      card: 'border-rose-500/45 bg-rose-500/10',
      badge: 'text-rose-700 dark:text-rose-300',
      stroke: '#f43f5e',
    };
  }
  if (combined.includes('جر') || combined.includes('মাজরূর') || combined.includes('জর')) {
    return {
      card: 'border-amber-500/45 bg-amber-500/10',
      badge: 'text-amber-700 dark:text-amber-300',
      stroke: '#f59e0b',
    };
  }
  if (combined.includes('مضاف') || combined.includes('মুদাফ') || combined.includes('ইযাফত')) {
    return {
      card: 'border-teal-500/45 bg-teal-500/10',
      badge: 'text-teal-700 dark:text-teal-300',
      stroke: '#14b8a6',
    };
  }
  const palette = [
    { card: 'border-emerald-500/40 bg-emerald-500/8', badge: 'text-emerald-700 dark:text-emerald-300', stroke: '#10b981' },
    { card: 'border-sky-500/40 bg-sky-500/8', badge: 'text-sky-700 dark:text-sky-300', stroke: '#0ea5e9' },
    { card: 'border-violet-500/40 bg-violet-500/8', badge: 'text-violet-700 dark:text-violet-300', stroke: '#8b5cf6' },
    { card: 'border-amber-500/40 bg-amber-500/8', badge: 'text-amber-700 dark:text-amber-300', stroke: '#f59e0b' },
  ];
  return palette[idx % palette.length];
}

export const TarkibVisualizer: React.FC<TarkibVisualizerProps> = ({
  sentenceAr,
  translationBn,
  translationEn,
  precomputed,
  onClose,
  titleLabel,
  initialSelectedIndex = 0,
  compact = false,
}) => {
  const { grammarTerminologyMode, setGrammarTerminologyMode, lang } = useApp();
  const result = useMemo(
    () => precomputed || analyzeSentenceTarkib(sentenceAr),
    [precomputed, sentenceAr]
  );

  const [selectedIdx, setSelectedIdx] = useState<number>(initialSelectedIndex);
  const [viewStyle, setViewStyle] = useState<'classic-lines' | 'cards'>('classic-lines');

  const safeSelectedIdx =
    result.words.length > 0
      ? Math.min(Math.max(0, selectedIdx), result.words.length - 1)
      : 0;
  const activeWord: SentenceTarkibWord | undefined = result.words[safeSelectedIdx];
  const linkedSet = useMemo(
    () => new Set(activeWord?.linkedIndices || []),
    [activeWord]
  );

  // Build non-overlapping constituent branches covering every word in sentence order
  const treeBranches = useMemo<TreeBranchGroup[]>(() => {
    const groups: TreeBranchGroup[] = [];
    const covered = new Set<number>();

    result.phrases.forEach((ph, idx) => {
      const validIndices = (ph.wordIndices || []).filter(
        (wi) => wi >= 0 && wi < result.words.length && !covered.has(wi)
      );
      if (validIndices.length === 0) return;
      validIndices.forEach((wi) => covered.add(wi));
      const termMeta = ph.relationshipKey ? formatGrammarTerm(ph.relationshipKey, grammarTerminologyMode) : null;
      const roleArClean = ph.roleAr || termMeta?.ar || ph.roleBn;
      const roleBnClean = ph.roleBn || termMeta?.bn || roleArClean;
      groups.push({
        id: `ph-${idx}-${validIndices.join('-')}`,
        titlePrimary: grammarTerminologyMode === 'arabic' ? roleArClean : roleBnClean,
        titleSecondary: grammarTerminologyMode === 'arabic' ? roleBnClean : roleArClean,
        tooltipBn: ph.explanationBn,
        explanationBn: ph.explanationBn,
        wordIndices: validIndices,
        relationshipKey: ph.relationshipKey,
      });
    });

    // Add uncovered standalone words as single-node branches
    result.words.forEach((w) => {
      if (covered.has(w.index)) return;
      const meta = formatGrammarTerm(w.roleKey, grammarTerminologyMode);
      groups.push({
        id: `solo-${w.index}`,
        titlePrimary: grammarTerminologyMode === 'arabic' ? w.tarkibRoleAr || meta.ar : w.tarkibRoleBn,
        titleSecondary: grammarTerminologyMode === 'arabic' ? w.tarkibRoleBn : w.tarkibRoleAr || meta.ar,
        tooltipBn: meta.tooltipBn || w.tarkibDetailBn,
        explanationBn: w.tarkibDetailBn,
        wordIndices: [w.index],
      });
    });

    return groups.sort((a, b) => (a.wordIndices[0] ?? 0) - (b.wordIndices[0] ?? 0));
  }, [result, grammarTerminologyMode]);

  if (!result.words.length) return null;

  const isArabicMode = grammarTerminologyMode === 'arabic';
  const rootTitlePrimary = isArabicMode ? result.sentenceTypeAr : result.sentenceTypeBn;
  const rootTitleSecondary = isArabicMode ? result.sentenceTypeBn : result.sentenceTypeAr;
  const activeRoleMeta = activeWord ? formatGrammarTerm(activeWord.roleKey, grammarTerminologyMode) : null;

  // Classic Line-Drawn Diagram Geometry (1 horizontal RTL sentence row + exact SVG lines underneath)
  const wordCount = result.words.length;
  const colW = wordCount <= 3 ? 116 : wordCount <= 5 ? 104 : 96;
  const totalW = wordCount * colW;
  const getCenterX = (wordIdx: number) => (wordCount - 1 - wordIdx + 0.5) * colW;

  const multiWordBranches = treeBranches.filter((b) => b.wordIndices.length >= 2);
  const hasPhraseTier = multiWordBranches.length > 0;

  // Top-level anchor Xs feeding into the bottom Sentence Verdict box
  const topAnchors = treeBranches.map((branch, bIdx) => {
    const xs = branch.wordIndices.map(getCenterX);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const midX = (minX + maxX) / 2;
    const isSel = branch.wordIndices.includes(safeSelectedIdx);
    const isLink = branch.wordIndices.some((wi) => linkedSet.has(wi));
    const bStyle = getTarkibBranchStyle(branch.titlePrimary, branch.titleSecondary, bIdx);
    return { branch, minX, maxX, midX, isSel, isLink, bStyle };
  });

  const allAnchorXs = topAnchors.map((a) => a.midX);
  const mergeMinX = allAnchorXs.length > 0 ? Math.min(...allAnchorXs) : totalW / 2;
  const mergeMaxX = allAnchorXs.length > 0 ? Math.max(...allAnchorXs) : totalW / 2;
  const finalVerdictX = (mergeMinX + mergeMaxX) / 2;

  return (
    <div
      dir="ltr"
      data-nahw-managed="true"
      className={`rounded-3xl surface-card border border-[var(--border-strong)] ${
        compact ? 'p-4 space-y-4' : 'p-5 sm:p-6 space-y-5'
      } text-left shadow-md`}
    >
      {/* Header + Diagram Style Toggle + Terminology Switcher */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
            <GitBranch className="w-4 h-4 shrink-0" />
            <span>
              {titleLabel ||
                (isArabicMode ? 'شَجَرَةُ التَّرْكِيبِ النَّحْوِيِّ' : 'বাক্যের তারকিব রেখাচিত্র (Tarkib Diagram)')}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span
              className="font-arabic text-xl sm:text-2xl text-[var(--accent)]"
              dir="rtl"
              title={rootTitleSecondary}
            >
              {rootTitlePrimary}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
              ({rootTitleSecondary})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Diagram Style Switcher: Classic Line-Drawn vs Card Tree */}
          <div
            className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-0.5 text-[11px] font-bold"
            role="group"
            aria-label="Tarkib diagram style"
          >
            <button
              type="button"
              onClick={() => setViewStyle('classic-lines')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
                viewStyle === 'classic-lines'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="এক লাইনে বাক্য এবং নিচে দাগ টেনে তারকিব"
            >
              <GitBranch className="w-3 h-3" />
              <span>দাগ-টানা রেখাচিত্র</span>
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('cards')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
                viewStyle === 'cards'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="কার্ড আকারে তারকিব ট্রি"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>কার্ড ট্রি</span>
            </button>
          </div>

          <div
            className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-0.5 text-[11px] font-bold"
            role="group"
            aria-label="Grammar terminology language"
          >
            <button
              type="button"
              onClick={() => setGrammarTerminologyMode('arabic')}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                isArabicMode
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="আরবি পরিভাষা (اسم، فعل، مبتدأ، خبر)"
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setGrammarTerminologyMode('bengali')}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                !isArabicMode
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="বাংলা পরিভাষা (ইসম, ফেল, মুবতাদা, খবর)"
            >
              বাংলা
            </button>
          </div>
          <AudioButton text={result.sentenceAr} compact showSlow={false} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full btn-secondary text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          MODE 1 (DEFAULT): CLASSICAL LINE-DRAWN TARKIB DIAGRAM
          One horizontal Arabic sentence line on top + vertical & bracket lines underneath
          ===================================================================== */}
      {viewStyle === 'classic-lines' && (
        <div className="rounded-2xl bg-[var(--bg-surface-subtle)]/80 border border-[var(--border-subtle)] p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]">
              <Sparkles className="w-3.5 h-3.5" />
              এক লাইনে বাক্য · নিচে দাগ টেনে টেনে তারকিব (যেকোনো শব্দে চাপুন)
            </span>
            {activeWord?.relationshipLabelAr && linkedSet.size > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-300">
                <Link2 className="w-3 h-3" />
                <span className="font-arabic text-xs" dir="rtl">
                  {isArabicMode ? activeWord.relationshipLabelAr : activeWord.relationshipLabelBn}
                </span>
              </span>
            )}
          </div>

          {/* Horizontal Scrollable Exact-Alignment Classical Diagram Canvas */}
          <div className="overflow-x-auto pb-2" dir="ltr">
            <div className="mx-auto" style={{ width: `${totalW}px` }}>
              {/* ROW 1: Single Horizontal RTL Sentence Line */}
              <div className="flex flex-row-reverse items-stretch" style={{ width: `${totalW}px` }}>
                {result.words.map((w, idx) => {
                  const isSel = w.index === safeSelectedIdx;
                  const isLink = !isSel && linkedSet.has(w.index);
                  const roleStyle = getTarkibBranchStyle(w.tarkibRoleAr, w.tarkibRoleBn, idx);
                  return (
                    <div
                      key={`line-word-${w.index}`}
                      className="flex flex-col items-center justify-end px-1"
                      style={{ width: `${colW}px` }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedIdx(w.index)}
                        className={`w-full rounded-2xl px-2 py-2 border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[var(--accent)]/20 border-[var(--accent)] ring-2 ring-[var(--accent)]/40 shadow-sm'
                            : isLink
                            ? 'bg-amber-500/18 border-amber-500/80 ring-2 ring-amber-400/35'
                            : `${roleStyle.card} hover:border-[var(--accent)]`
                        }`}
                      >
                        <div className="font-arabic text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug" dir="rtl">
                          {w.clean}
                        </div>
                        <div className={`text-[10px] font-semibold text-[var(--text-muted)] ${isArabicMode ? 'font-arabic text-[11px]' : ''}`}>
                          {isArabicMode ? w.posShortAr : w.posShortBn}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ROW 2: Vertical Drop Stems Straight Down From Every Word */}
              <svg
                width={totalW}
                height={24}
                viewBox={`0 0 ${totalW} 24`}
                className="block"
                aria-hidden="true"
              >
                {result.words.map((w, idx) => {
                  const cx = getCenterX(w.index);
                  const isSel = w.index === safeSelectedIdx;
                  const isLink = !isSel && linkedSet.has(w.index);
                  const roleStyle = getTarkibBranchStyle(w.tarkibRoleAr, w.tarkibRoleBn, idx);
                  const strokeColor = isSel
                    ? 'var(--accent)'
                    : isLink
                    ? '#f59e0b'
                    : roleStyle.stroke;
                  return (
                    <g key={`stem-${w.index}`}>
                      <line
                        x1={cx}
                        y1={0}
                        x2={cx}
                        y2={24}
                        stroke={strokeColor}
                        strokeWidth={isSel || isLink ? 3 : 2}
                        strokeLinecap="round"
                      />
                      <circle cx={cx} cy={22} r={2.5} fill={strokeColor} />
                    </g>
                  );
                })}
              </svg>

              {/* ROW 3: Word-Level Tarkib Role Nodes Directly Under Each Word */}
              <div className="flex flex-row-reverse items-stretch" style={{ width: `${totalW}px` }}>
                {result.words.map((w, idx) => {
                  const isSel = w.index === safeSelectedIdx;
                  const isLink = !isSel && linkedSet.has(w.index);
                  const roleStyle = getTarkibBranchStyle(w.tarkibRoleAr, w.tarkibRoleBn, idx);
                  const primaryRole = isArabicMode ? w.tarkibRoleAr : w.tarkibRoleBn;
                  const secondaryRole = isArabicMode ? w.tarkibRoleBn : w.tarkibRoleAr;

                  return (
                    <div
                      key={`role-box-${w.index}`}
                      className="flex flex-col items-center px-1"
                      style={{ width: `${colW}px` }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedIdx(w.index)}
                        title={`${secondaryRole}: ${w.tarkibDetailBn}`}
                        className={`w-full h-full rounded-xl border px-1.5 py-2 text-center transition-all cursor-pointer flex flex-col justify-center ${
                          isSel
                            ? 'border-[var(--accent)] bg-[var(--bg-surface)] ring-2 ring-[var(--accent)]/40 shadow-sm'
                            : isLink
                            ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-400/35'
                            : `${roleStyle.card} hover:border-[var(--accent)]/70`
                        }`}
                      >
                        <div
                          className={`text-xs font-extrabold leading-tight ${
                            isSel
                              ? 'text-[var(--accent)]'
                              : isLink
                              ? 'text-amber-700 dark:text-amber-300'
                              : roleStyle.badge
                          } ${isArabicMode ? 'font-arabic text-sm' : ''}`}
                        >
                          {primaryRole}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                          {secondaryRole}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ROW 4 & 5: Phrase-Level Bracket Connectors + Combined Constituent Badges */}
              {hasPhraseTier && (
                <>
                  <svg
                    width={totalW}
                    height={48}
                    viewBox={`0 0 ${totalW} 48`}
                    className="block"
                    aria-hidden="true"
                  >
                    {treeBranches.map((branch, bIdx) => {
                      const bStyle = getTarkibBranchStyle(branch.titlePrimary, branch.titleSecondary, bIdx);
                      const isSel = branch.wordIndices.includes(safeSelectedIdx);
                      const isLink = branch.wordIndices.some((wi) => linkedSet.has(wi));
                      const strokeColor = isSel ? 'var(--accent)' : isLink ? '#f59e0b' : bStyle.stroke;
                      const sw = isSel || isLink ? 3 : 2;

                      if (branch.wordIndices.length === 1) {
                        const cx = getCenterX(branch.wordIndices[0]);
                        return (
                          <line
                            key={`pass-${branch.id}`}
                            x1={cx}
                            y1={0}
                            x2={cx}
                            y2={48}
                            stroke={strokeColor}
                            strokeWidth={sw}
                            strokeDasharray="4 3"
                          />
                        );
                      }

                      const xs = branch.wordIndices.map(getCenterX);
                      const minX = Math.min(...xs);
                      const maxX = Math.max(...xs);
                      const midX = (minX + maxX) / 2;

                      return (
                        <g key={`br-${branch.id}`}>
                          {xs.map((x, xi) => (
                            <line
                              key={xi}
                              x1={x}
                              y1={0}
                              x2={x}
                              y2={22}
                              stroke={strokeColor}
                              strokeWidth={sw}
                              strokeLinecap="round"
                            />
                          ))}
                          <line
                            x1={minX}
                            y1={22}
                            x2={maxX}
                            y2={22}
                            stroke={strokeColor}
                            strokeWidth={sw}
                            strokeLinecap="round"
                          />
                          <line
                            x1={midX}
                            y1={22}
                            x2={midX}
                            y2={48}
                            stroke={strokeColor}
                            strokeWidth={sw}
                            strokeLinecap="round"
                          />
                          <circle cx={midX} cy={46} r={2.5} fill={strokeColor} />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Multi-word Phrase Badges Positioned Directly Under Their Bracket Midpoints */}
                  <div className="relative h-14" style={{ width: `${totalW}px` }}>
                    {topAnchors.map((anc) => {
                      if (anc.branch.wordIndices.length === 1) {
                        return (
                          <div
                            key={`solo-line-${anc.branch.id}`}
                            style={{ left: `${anc.midX}px`, transform: 'translateX(-50%)' }}
                            className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none"
                          >
                            <div
                              className="w-[2px] h-full opacity-70"
                              style={{ backgroundColor: anc.isSel ? 'var(--accent)' : anc.bStyle.stroke }}
                            />
                          </div>
                        );
                      }

                      const boxW = Math.min(240, Math.max(128, anc.maxX - anc.minX + colW * 0.72));
                      return (
                        <button
                          key={`ph-badge-${anc.branch.id}`}
                          type="button"
                          onClick={() => setSelectedIdx(anc.branch.wordIndices[0])}
                          title={anc.branch.tooltipBn}
                          style={{
                            left: `${anc.midX}px`,
                            width: `${boxW}px`,
                            transform: 'translateX(-50%)',
                          }}
                          className={`absolute top-0 h-14 rounded-xl border px-2 py-1 text-center flex flex-col justify-center transition-all cursor-pointer ${
                            anc.isSel
                              ? 'border-[var(--accent)] bg-[var(--emerald-highlight)] shadow-sm'
                              : anc.isLink
                              ? 'border-amber-500 bg-amber-500/15'
                              : anc.bStyle.card
                          }`}
                        >
                          <div
                            className={`text-xs font-extrabold leading-tight truncate ${anc.bStyle.badge} ${
                              isArabicMode ? 'font-arabic text-sm' : ''
                            }`}
                          >
                            {anc.branch.titlePrimary}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] truncate">
                            {anc.branch.titleSecondary}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ROW 6: Final Sentence Merge Bracket Connecting Everything Into Final Sentence Box */}
              <svg
                width={totalW}
                height={42}
                viewBox={`0 0 ${totalW} 42`}
                className="block"
                aria-hidden="true"
              >
                {topAnchors.map((anc) => (
                  <line
                    key={`merge-arm-${anc.branch.id}`}
                    x1={anc.midX}
                    y1={0}
                    x2={anc.midX}
                    y2={20}
                    stroke={anc.isSel ? 'var(--accent)' : anc.bStyle.stroke}
                    strokeWidth={anc.isSel ? 3 : 2}
                    strokeLinecap="round"
                  />
                ))}
                <line
                  x1={mergeMinX}
                  y1={20}
                  x2={mergeMaxX}
                  y2={20}
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <line
                  x1={finalVerdictX}
                  y1={20}
                  x2={finalVerdictX}
                  y2={42}
                  stroke="var(--accent)"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <polygon
                  points={`${finalVerdictX - 5},36 ${finalVerdictX + 5},36 ${finalVerdictX},42`}
                  fill="var(--accent)"
                />
              </svg>

              {/* Final Sentence Verdict Box at Bottom Center */}
              <div className="relative h-16" style={{ width: `${totalW}px` }}>
                <div
                  style={{ left: `${finalVerdictX}px`, transform: 'translateX(-50%)' }}
                  className="absolute top-0 min-w-[210px] max-w-full rounded-2xl border-2 border-[var(--accent)] bg-gradient-to-r from-emerald-500/12 to-sky-500/12 px-4 py-2 text-center shadow-sm"
                  title={localizeGrammarLabel(result.structureSummaryBn, grammarTerminologyMode)}
                >
                  <div
                    className={`text-sm sm:text-base font-extrabold text-[var(--accent)] whitespace-nowrap ${
                      isArabicMode ? 'font-arabic text-lg' : ''
                    }`}
                  >
                    {rootTitlePrimary}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                    {rootTitleSecondary}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(translationBn || translationEn) && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
              {lang === 'en' && translationEn ? translationEn : translationBn || translationEn}
            </p>
          )}
        </div>
      )}

      {/* =====================================================================
          MODE 2: INTERACTIVE TOKEN STRIP + CARD TREE (Alternative Card View)
          ===================================================================== */}
      {viewStyle === 'cards' && (
        <>
          <div className="rounded-2xl surface-alt border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]">
                <Sparkles className="w-3.5 h-3.5" />
                শব্দে চাপুন — সংশ্লিষ্ট তারকিব জুটি একসাথে হাইলাইট হবে
              </span>
              {activeWord?.relationshipLabelAr && linkedSet.size > 0 && (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-300">
                  <Link2 className="w-3 h-3" />
                  <span className="font-arabic text-xs" dir="rtl">
                    {isArabicMode ? activeWord.relationshipLabelAr : activeWord.relationshipLabelBn}
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 justify-start py-1" dir="rtl">
              {result.words.map((w, idx) => {
                const isSelected = w.index === safeSelectedIdx;
                const isLinked = !isSelected && linkedSet.has(w.index);
                const primaryRole = isArabicMode ? w.tarkibRoleAr : w.tarkibRoleBn;
                const roleStyle = getTarkibBranchStyle(w.tarkibRoleAr, w.tarkibRoleBn, idx);
                const secondaryTooltip = isArabicMode
                  ? `${w.tarkibRoleBn}: ${w.tarkibDetailBn}`
                  : `${w.tarkibRoleAr}: ${w.tarkibDetailBn}`;

                return (
                  <button
                    key={`strip-${w.index}`}
                    type="button"
                    onClick={() => setSelectedIdx(w.index)}
                    title={secondaryTooltip}
                    className={`group flex flex-col items-center rounded-2xl px-3 py-2 border transition-all text-center ${
                      isSelected
                        ? 'bg-[var(--accent)]/20 border-[var(--accent)] ring-2 ring-[var(--accent)]/40 shadow-sm scale-[1.03]'
                        : isLinked
                        ? 'bg-amber-500/18 border-amber-500/75 ring-2 ring-amber-400/35 shadow-xs'
                        : `${roleStyle.card} hover:border-[var(--accent)]/70`
                    }`}
                  >
                    <span className="font-arabic text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug">
                      {w.clean}
                    </span>
                    <span
                      className={`text-[11px] font-bold mt-0.5 ${
                        isSelected
                          ? 'text-[var(--accent)]'
                          : isLinked
                          ? 'text-amber-700 dark:text-amber-300'
                          : roleStyle.badge
                      } ${isArabicMode ? 'font-arabic' : ''}`}
                    >
                      {primaryRole}
                    </span>
                  </button>
                );
              })}
            </div>

            {(translationBn || translationEn) && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
                {lang === 'en' && translationEn ? translationEn : translationBn || translationEn}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface-subtle)]/80 border border-[var(--border-subtle)] p-4 space-y-3">
            <div
              className="rounded-2xl border-2 border-[var(--accent)] bg-gradient-to-r from-emerald-500/10 to-sky-500/10 px-4 py-2.5 text-center shadow-xs"
              title={localizeGrammarLabel(result.structureSummaryBn, grammarTerminologyMode)}
            >
              <div className={`text-sm font-extrabold text-[var(--accent)] ${isArabicMode ? 'font-arabic text-lg' : ''}`}>
                {rootTitlePrimary}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">{rootTitleSecondary}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {treeBranches.map((branch, bIdx) => {
                const branchHasSelected = branch.wordIndices.includes(safeSelectedIdx);
                const branchHasLinked = branch.wordIndices.some((wi) => linkedSet.has(wi));
                const bStyle = getTarkibBranchStyle(branch.titlePrimary, branch.titleSecondary, bIdx);

                return (
                  <div
                    key={`card-br-${branch.id}`}
                    className={`rounded-2xl border p-3 space-y-2 transition-all ${
                      branchHasSelected
                        ? 'border-[var(--accent)] bg-[var(--emerald-highlight)] shadow-sm'
                        : branchHasLinked
                        ? 'border-amber-500/70 bg-amber-500/12'
                        : bStyle.card
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className={`text-xs font-extrabold ${bStyle.badge} ${isArabicMode ? 'font-arabic text-base' : ''}`}>
                        {branch.titlePrimary}
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        {branch.titleSecondary}
                      </span>
                    </div>

                    <div className="flex flex-wrap flex-row-reverse gap-2 justify-start">
                      {branch.wordIndices.map((wi) => {
                        const w = result.words[wi];
                        if (!w) return null;
                        const isSel = w.index === safeSelectedIdx;
                        const isLink = !isSel && linkedSet.has(w.index);
                        const posLabel = isArabicMode ? w.posShortAr : w.posShortBn;
                        const roleLabel = isArabicMode ? w.tarkibRoleAr : w.tarkibRoleBn;

                        return (
                          <button
                            key={`card-leaf-${w.index}`}
                            type="button"
                            onClick={() => setSelectedIdx(w.index)}
                            className={`flex-1 min-w-[92px] rounded-xl border p-2 text-center transition-all ${
                              isSel
                                ? 'border-[var(--accent)] bg-[var(--bg-surface)] ring-2 ring-[var(--accent)]/40 shadow-sm'
                                : isLink
                                ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-400/35'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 hover:border-[var(--accent)]/60'
                            }`}
                          >
                            <div className="font-arabic text-lg font-bold text-[var(--text-primary)]" dir="rtl">
                              {w.clean}
                            </div>
                            <div
                              className={`text-[11px] font-bold mt-0.5 ${
                                isSel ? 'text-[var(--accent)]' : isLink ? 'text-amber-700 dark:text-amber-300' : bStyle.badge
                              } ${isArabicMode ? 'font-arabic text-xs' : ''}`}
                            >
                              {roleLabel}
                            </div>
                            <div className={`text-[10px] text-[var(--text-muted)] ${isArabicMode ? 'font-arabic' : ''}`}>
                              {posLabel}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Synchronized 1/100 Lesson-Flow Active Word Explanation Panel */}
      {activeWord && (
        <div className="rounded-2xl border border-[var(--accent)]/35 bg-[var(--emerald-highlight)]/60 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-arabic text-2xl sm:text-3xl font-bold text-[var(--accent)]" dir="rtl">
                {activeWord.clean}
              </span>
              <span
                className={`text-sm sm:text-base font-extrabold text-[var(--text-primary)] ${
                  isArabicMode ? 'font-arabic text-lg' : ''
                }`}
                title={activeRoleMeta?.tooltipBn}
              >
                {isArabicMode ? activeWord.tarkibRoleAr : activeWord.tarkibRoleBn}
              </span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                · {isArabicMode ? activeWord.posShortAr : activeWord.posShortBn} ({isArabicMode ? activeWord.tarkibRoleBn : activeWord.tarkibRoleAr})
              </span>
            </div>
            <AudioButton text={activeWord.clean} compact showSlow={false} />
          </div>

          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {localizeGrammarLabel(activeWord.tarkibDetailBn, grammarTerminologyMode)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            {activeWord.meaningBn && (
              <span className="font-semibold text-[var(--text-secondary)]">
                অর্থ: <strong className="text-[var(--text-primary)]">{activeWord.meaningBn}</strong>
              </span>
            )}
            {activeWord.linkedIndices.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
                  <Link2 className="w-3.5 h-3.5" />
                  সম্পর্কিত পদ:
                </span>
                {activeWord.linkedIndices.map((li) => {
                  const partner = result.words[li];
                  if (!partner) return null;
                  return (
                    <button
                      key={`partner-jump-${li}`}
                      type="button"
                      onClick={() => setSelectedIdx(li)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-[var(--text-primary)] hover:bg-amber-500/25 transition-colors"
                    >
                      <span className="font-arabic text-sm font-bold" dir="rtl">
                        {partner.clean}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        ({isArabicMode ? partner.tarkibRoleAr : partner.tarkibRoleBn})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
