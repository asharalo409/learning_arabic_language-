import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  ScanText,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { GeminiRichText } from './GeminiRichText';
import { QuickNahwText } from './QuickNahwText';
import { useApp } from '../context/AppContext';
import { VoiceGender } from '../types/academy';
import { formatHttpFallbackError, safeParseResponseJson } from '../utils/safeFetchJson';
import { VoiceEmotion } from '../utils/speech';

export interface DocumentOcrWordBreakdown {
  arabic: string;
  pronunciationBn: string;
  posBn: string;
  rootOrFormBn: string;
  irabBn: string;
  meaningBn: string;
  noteBn: string;
}

export interface DocumentOcrSentenceItem {
  arabic: string;
  pronunciationBn: string;
  translationBn: string;
}

export interface DocumentOcrAnalysisResult {
  extractedArabic: string;
  fullTranslationBn: string;
  summaryBn: string;
  sentences: DocumentOcrSentenceItem[];
  words: DocumentOcrWordBreakdown[];
}

interface DocumentAnalyzerPanelProps {
  studentLevel: string;
  interfaceLang: 'bn' | 'en' | 'ar';
  voiceGender: VoiceGender;
  voiceEmotion: VoiceEmotion;
  onAwardXp: (xp: number, info: { titleBn: string; titleEn: string; type: 'ai' }) => void;
  onDiscussInChat: (promptText: string) => void;
}

interface UploadedDoc {
  name: string;
  mimeType: string;
  sizeBytes: number;
  base64Data: string;
  previewUrl?: string;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const idx = res.indexOf(',');
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(new Error('ফাইলটি পড়া যায়নি।'));
    reader.readAsDataURL(file);
  });
}

export const DocumentAnalyzerPanel: React.FC<DocumentAnalyzerPanelProps> = ({
  studentLevel,
  interfaceLang,
  voiceGender,
  voiceEmotion,
  onAwardXp,
  onDiscussInChat,
}) => {
  const { syncMissingVocabFromSegments } = useApp();
  const [doc, setDoc] = useState<UploadedDoc | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [focusMode, setFocusMode] = useState<'full' | 'irab' | 'tashkeel'>('full');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentOcrAnalysisResult | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [copiedArabic, setCopiedArabic] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    setErrorMsg(null);
    const mime = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');
    if (!mime.startsWith('image/') && mime !== 'application/pdf') {
      setErrorMsg('শুধুমাত্র আরবি বই/নোটের ছবি (PNG, JPG, WebP) অথবা PDF ফাইল আপলোড করুন।');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setErrorMsg('ফাইলটি ৬ মেগাবাইটের বেশি বড়। অনুগ্রহ করে ছোট ছবি বা PDF দিন।');
      return;
    }
    try {
      const base64Data = await readFileAsBase64(file);
      const previewUrl = mime.startsWith('image/') ? `data:${mime};base64,${base64Data}` : undefined;
      setDoc({
        name: file.name,
        mimeType: mime,
        sizeBytes: file.size,
        base64Data,
        previewUrl,
      });
      setResult(null);
      setFallbackText(null);
    } catch {
      setErrorMsg('ফাইল লোড করতে সমস্যা হয়েছে।');
    }
  };

  const handleRunAnalysis = async () => {
    if (!doc || loading) return;
    if (!navigator.onLine) {
      setErrorMsg('অফলাইন মোডে আছেন। ছবি বা PDF OCR বিশ্লেষণ করতে ইন্টারনেট সংযোগ চালু করুন।');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setFallbackText(null);

    const focusInstruction =
      focusMode === 'irab'
        ? 'Focus heavily on deep Nahw syntactic analysis (مبتدأ، خبر، فاعل، مفعول، مضاف، مجرور) and exact I’rab endings for every word.'
        : focusMode === 'tashkeel'
        ? 'Focus on reconstructing complete, crystal-clear Harakat (التشكيل الكامل) on unvowelized Arabic text, accurate Bengali pronunciation, and basic grammar.'
        : 'Perform complete OCR with Harakat, full Bengali translation, and balanced Nahw & Sarf word-by-word grammatical breakdown.';

    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'document-ocr-grammar',
          level: studentLevel,
          interfaceLang,
          voiceGender,
          voiceEmotion,
          context: focusInstruction,
          message:
            customNote.trim() ||
            'সংযুক্ত ছবি বা PDF থেকে আরবি লেখা OCR করে পূর্ণ হারাকাতসহ উদ্ধৃত করুন এবং শব্দে শব্দে নাহু-ছরফ বিশ্লেষণ করুন।',
          attachments: [
            {
              name: doc.name,
              mimeType: doc.mimeType,
              base64Data: doc.base64Data,
            },
          ],
        }),
      });

      const parsed = await safeParseResponseJson<{
        reply?: string;
        analysis?: DocumentOcrAnalysisResult;
        error?: string;
      }>(res);
      const data = parsed.data;
      if (!res.ok || !data) {
        throw new Error(
          data?.error ||
            formatHttpFallbackError(res.status, parsed.rawText, 'ডকুমেন্ট বিশ্লেষণ করা যায়নি।')
        );
      }
      if (data.analysis && data.analysis.extractedArabic) {
        setResult(data.analysis);
        syncMissingVocabFromSegments([
          {
            arabic: data.analysis.extractedArabic,
            translationBn: data.analysis.fullTranslationBn,
            sourceLabelBn: `OCR ডকুমেন্ট (${doc.name})`,
          },
          ...(data.analysis.sentences || []).map((s) => ({
            arabic: s.arabic,
            translationBn: s.translationBn,
            sourceLabelBn: `OCR ডকুমেন্ট (${doc.name})`,
          })),
        ]);
      } else if (data.reply) {
        setFallbackText(data.reply);
      } else {
        throw new Error('কোনো OCR ফলাফল পাওয়া যায়নি।');
      }

      onAwardXp(20, {
        titleBn: `ডকুমেন্ট OCR ও গ্রামার বিশ্লেষণ: ${doc.name}`,
        titleEn: `Document OCR & Grammar Analysis: ${doc.name}`,
        type: 'ai',
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'বিশ্লেষণ করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyArabic = async () => {
    if (!result?.extractedArabic) return;
    try {
      await navigator.clipboard.writeText(result.extractedArabic);
      setCopiedArabic(true);
      window.setTimeout(() => setCopiedArabic(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Dropzone */}
      <div className="surface-card rounded-3xl p-5 sm:p-6 border border-[var(--border-strong)] space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
              <ScanText className="w-4 h-4" />
              <span>আরবি ডকুমেন্ট OCR ও নাহু-ছরফ ল্যাব</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
              কিতাবের ছবি বা PDF থেকে OCR ও শব্দে শব্দে ব্যাকরণ বিশ্লেষণ
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              যেকোনো আরবি পৃষ্ঠা, হাতের লেখা বা PDF ড্রপ করুন — AI পূর্ণ হারাকাতসহ টেক্সট বের করে বাংলা অনুবাদ ও প্রতিটি শব্দের নাহু-ছরফ ভেঙে দেখাবে।
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />

        {!doc ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all space-y-3 ${
              dragOver
                ? 'border-[var(--accent)] bg-[var(--emerald-highlight)]'
                : 'border-[var(--border-strong)] surface-alt hover:border-[var(--accent)]'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                এখানে ছবি বা PDF ড্রপ করুন অথবা ক্লিক করে ফাইল বাছাই করুন
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                সমর্থিত ফরম্যাট: JPG, PNG, WebP, PDF (সর্বোচ্চ ৬ MB)
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl surface-alt border border-[var(--border-strong)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {doc.previewUrl ? (
                <img
                  src={doc.previewUrl}
                  alt={doc.name}
                  className="w-20 h-20 rounded-xl object-cover border border-[var(--border-strong)] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                  <FileText className="w-8 h-8" />
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)] truncate">
                  {doc.mimeType === 'application/pdf' ? (
                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />
                  )}
                  <span className="truncate">{doc.name}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono-num">
                  {(doc.sizeBytes / 1024).toFixed(0)} KB · {doc.mimeType === 'application/pdf' ? 'PDF Document' : 'Image'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary"
              >
                অন্য ফাইল দিন
              </button>
              <button
                type="button"
                onClick={() => {
                  setDoc(null);
                  setResult(null);
                  setFallbackText(null);
                }}
                className="p-2 rounded-xl btn-secondary text-[var(--danger)]"
                title="সরান"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Analysis Focus Options & Submit */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'full', label: 'পূর্ণ OCR + অনুবাদ ও নাহু-ছরফ' },
                { id: 'irab', label: 'গভীর ই‘রাব ও তারকীব' },
                { id: 'tashkeel', label: 'হারাকাত পুনর্গঠন ও সহজ অর্থ' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFocusMode(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  focusMode === opt.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="ঐচ্ছিক নির্দেশনা (যেমন: শুধু ২য় অনুচ্ছেদ বা ক্রিয়ার বাবগুলো বের করুন)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              disabled={!doc || loading}
              onClick={() => void handleRunAnalysis()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold btn-primary shadow-md disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'OCR ও গ্রামার বিশ্লেষণ চলছে...' : 'OCR ও গ্রামার বিশ্লেষণ শুরু করুন'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-sm text-[var(--danger)] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Structured OCR + Grammatical Analysis Result */}
      {result && (
        <div className="space-y-6">
          {/* 1. Extracted Arabic Text with Interactive Clickable Grammar */}
          <section className="surface-card rounded-3xl p-5 sm:p-6 border border-[var(--border-strong)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
                <ScanText className="w-4 h-4" />
                <span>OCR উদ্ধৃত আরবি পাঠ (শব্দে চাপলে সাথে সাথে ব্যাকরণ খুলবে)</span>
              </div>
              <div className="flex items-center gap-2">
                <AudioButton text={result.extractedArabic} showSlow compact />
                <button
                  type="button"
                  onClick={() => void handleCopyArabic()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary"
                >
                  {copiedArabic ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedArabic ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            <QuickNahwText
              text={result.extractedArabic}
              className="font-arabic text-2xl sm:text-3xl text-[var(--text-primary)] leading-[2.15]"
            />

            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-bold text-[var(--accent)]">সম্পূর্ণ বাংলা অনুবাদ:</div>
              <p className="text-[15.5px] sm:text-base text-[var(--text-primary)] leading-[1.85]">
                {result.fullTranslationBn}
              </p>
              {result.summaryBn && (
                <div className="p-3.5 rounded-2xl surface-alt text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--accent)]">পাঠের ব্যাকরণগত সারসংক্ষেপ: </strong>
                  {result.summaryBn}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onDiscussInChat(
                    `এই OCR পাঠটির ব্যাকরণ নিয়ে আরও বিস্তারিত আলোচনা করুন:\n${result.extractedArabic}\n(${result.fullTranslationBn})`
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold btn-primary"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>এই পাঠ নিয়ে AI চ্যাটে প্রশ্ন করুন</span>
              </button>
            </div>
          </section>

          {/* 2. Sentence-by-Sentence Breakdown */}
          {result.sentences && result.sentences.length > 0 && (
            <section className="surface-card rounded-3xl p-5 sm:p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--accent)]">
                <BookOpen className="w-4 h-4" />
                <span>বাক্যভিত্তিক উচ্চারণ ও অনুবাদ ({result.sentences.length}টি বাক্য)</span>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {result.sentences.map((s, idx) => (
                  <div key={idx} className="py-3.5 first:pt-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <QuickNahwText
                          text={s.arabic}
                          className="font-arabic text-xl sm:text-2xl text-[var(--accent)] leading-loose"
                        />
                      </div>
                      <AudioButton text={s.arabic} compact showSlow={false} />
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">উচ্চারণ: {s.pronunciationBn}</div>
                    <div className="text-sm sm:text-[15px] font-semibold text-[var(--text-primary)]">
                      {s.translationBn}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Word-by-Word Grammatical Breakdown */}
          {result.words && result.words.length > 0 && (
            <section className="surface-card rounded-3xl p-5 sm:p-6 border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[var(--accent)]">
                  শব্দে শব্দে নাহু ও ছরফ বিশ্লেষণ ({result.words.length}টি শব্দ)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.words.map((w, idx) => (
                  <div
                    key={`${w.arabic}-${idx}`}
                    className="p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
                          {w.arabic}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">{w.pronunciationBn}</div>
                      </div>
                      <AudioButton text={w.arabic} compact showSlow={false} />
                    </div>

                    <div className="text-sm font-extrabold text-[var(--text-primary)]">
                      অর্থ: {w.meaningBn}
                    </div>

                    <div className="space-y-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <div>
                        <strong className="text-[var(--accent)]">পদ প্রকার: </strong>
                        {w.posBn}
                      </div>
                      <div>
                        <strong className="text-[var(--accent)]">মূলধাতু / ওযন: </strong>
                        <span className="font-arabic-ui">{w.rootOrFormBn}</span>
                      </div>
                      <div>
                        <strong className="text-[var(--accent)]">ই‘রাব ও অবস্থান: </strong>
                        {w.irabBn}
                      </div>
                      {w.noteBn && (
                        <div>
                          <strong className="text-[var(--accent)]">নাহু/ছরফ নোট: </strong>
                          {w.noteBn}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {fallbackText && (
        <div className="surface-card rounded-3xl p-5 sm:p-6 border border-[var(--border-strong)] space-y-3">
          <div className="text-xs font-bold text-[var(--accent)]">AI ডকুমেন্ট বিশ্লেষণ</div>
          <GeminiRichText
            text={fallbackText}
            className="text-[16px] sm:text-[17px] leading-[1.88] whitespace-pre-wrap font-arabic-ui"
          />
        </div>
      )}
    </div>
  );
};
