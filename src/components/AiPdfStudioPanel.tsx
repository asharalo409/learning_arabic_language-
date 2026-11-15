import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Palette,
  Printer,
  SlidersHorizontal,
  Sparkles,
  Square,
  Upload,
  X,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import {
  FormattedPdfDocument,
  FormattedPdfSection,
  PdfOutputCategory,
  PdfSectionAccentTheme,
  PdfVisualStyle,
} from '../types/academy';
import { paginatePdfDocument } from '../utils/pdfPagination';
import { exportPaginatedElementsToPdf } from '../utils/domPdfExport';
import { formatHttpFallbackError, safeParseResponseJson } from '../utils/safeFetchJson';

interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  base64Data: string;
  previewUrl?: string;
  pageCount?: number;
  pdfBytes?: Uint8Array;
}

interface AiPdfStudioPanelProps {
  onAwardXp?: (xp: number, info: { titleBn: string; titleEn: string; type: 'ai' }) => void;
}

const PDF_CATEGORIES: {
  id: PdfOutputCategory;
  titleBn: string;
  descBn: string;
}[] = [
  {
    id: 'ar-bn-harakat',
    titleBn: 'হরকতসহ আরবি + বাংলা অর্থ',
    descBn: 'পূর্ণ তাশকীলসহ আরবি এবং নিচে স্পষ্ট বাংলা অর্থ ও ব্যাখ্যা',
  },
  {
    id: 'ar-only-harakat',
    titleBn: 'শুধু হরকতসহ আরবি',
    descBn: 'সম্পূর্ণ হারাকাতসহ বিশুদ্ধ আরবি কিতাবি নোট ও শিরোনাম',
  },
  {
    id: 'bn-only',
    titleBn: 'শুধুমাত্র বাংলা',
    descBn: 'সব তথ্য প্রাঞ্জল বাংলা অনুচ্ছেদ ও পয়েন্ট আকারে সাজানো',
  },
  {
    id: 'kitabi-bilingual',
    titleBn: 'কিতাবি কার্ড ও তুলনা টেবিল',
    descBn: 'আধুনিক কিতাবি কার্ড, ৩-কলাম গ্রিড, ফ্লো, আয়াত বক্স ও টেবিল',
  },
];

const SAMPLE_PROMPT = `مَوْضُوعُ: عُلُومُ الْقُرْآنِ الْكَرِيمِ: تَعْرِيفُهَا وَنَشْأَتُهَا
প্রশ্নসমূহ (২০২৫, ২০২৪, ২০২৩):
১. উলূমুল কুরআন কাকে বলে? এর উৎপত্তি ও ক্রমবিকাশ সংক্ষেপে আলোচনা করো।
২. শব্দের আভিধানিক ও পারিভাষিক অর্থ তুলনা (الْعِلْمُ وَالْقُرْآنُ لُغَةً وَاصْطِلَاحًا)।
৩. কুরআনের সাথে ইলমের সম্পর্ক ও প্রমাণ হিসেবে সূরা নাহল আয়াত ৮৯।`;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCardPalette(color: string | undefined, isColor: boolean): string {
  if (!isColor) {
    return 'border-neutral-400 bg-white text-neutral-900';
  }
  switch (color) {
    case 'sky':
      return 'border-sky-300 bg-sky-50/75 text-slate-900';
    case 'amber':
      return 'border-amber-300 bg-amber-50/75 text-slate-900';
    case 'violet':
      return 'border-violet-300 bg-violet-50/75 text-slate-900';
    case 'rose':
      return 'border-rose-300 bg-rose-50/75 text-slate-900';
    case 'slate':
      return 'border-slate-300 bg-slate-50/90 text-slate-900';
    case 'emerald':
    default:
      return 'border-emerald-300 bg-emerald-50/75 text-slate-900';
  }
}

function getSectionBannerGradient(accent: PdfSectionAccentTheme | undefined): string {
  switch (accent) {
    case 'blue':
      return 'linear-gradient(90deg, #1d4ed8 0%, #0284c7 100%)';
    case 'violet':
      return 'linear-gradient(90deg, #6d28d9 0%, #7c3aed 100%)';
    case 'rose':
      return 'linear-gradient(90deg, #be123c 0%, #e11d48 100%)';
    case 'amber':
      return 'linear-gradient(90deg, #b45309 0%, #d97706 100%)';
    case 'slate':
      return 'linear-gradient(90deg, #334155 0%, #475569 100%)';
    case 'emerald':
    default:
      return 'linear-gradient(90deg, #065f46 0%, #0d9488 100%)';
  }
}

function getTableHeaderClass(accent: PdfSectionAccentTheme | undefined, isColor: boolean): string {
  if (!isColor) return 'bg-neutral-200 text-black';
  switch (accent) {
    case 'blue':
      return 'bg-sky-800 text-white';
    case 'violet':
      return 'bg-violet-800 text-white';
    case 'rose':
      return 'bg-rose-800 text-white';
    case 'amber':
      return 'bg-amber-800 text-white';
    case 'slate':
      return 'bg-slate-800 text-white';
    case 'emerald':
    default:
      return 'bg-emerald-800 text-white';
  }
}

function getIntroNoteClass(accent: PdfSectionAccentTheme | undefined, isColor: boolean): string {
  if (!isColor) return 'bg-neutral-100 border border-neutral-300 text-neutral-800';
  switch (accent) {
    case 'blue':
      return 'bg-sky-50 border border-sky-200 text-sky-950';
    case 'violet':
      return 'bg-violet-50 border border-violet-200 text-violet-950';
    case 'rose':
      return 'bg-rose-50 border border-rose-200 text-rose-950';
    case 'amber':
      return 'bg-amber-50 border border-amber-200 text-amber-950';
    case 'slate':
      return 'bg-slate-100 border border-slate-300 text-slate-900';
    case 'emerald':
    default:
      return 'bg-emerald-50 border border-emerald-200 text-emerald-950';
  }
}

function splitLongTextIntoChunks(rawText: string, maxChunkChars = 2200): string[] {
  const trimmed = rawText.trim();
  if (!trimmed || trimmed.length <= maxChunkChars) return trimmed ? [trimmed] : [];
  const paragraphs = trimmed.split(/\n{2,}/);
  const chunks: string[] = [];
  let buf = '';

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    if (buf.length + para.length + 2 <= maxChunkChars) {
      buf = buf ? `${buf}\n\n${para}` : para;
    } else {
      if (buf) chunks.push(buf);
      if (para.length <= maxChunkChars) {
        buf = para;
      } else {
        const lines = para.split(/\n/);
        let lineBuf = '';
        for (const line of lines) {
          if (lineBuf.length + line.length + 1 <= maxChunkChars) {
            lineBuf = lineBuf ? `${lineBuf}\n${line}` : line;
          } else {
            if (lineBuf) chunks.push(lineBuf);
            lineBuf = line;
          }
        }
        buf = lineBuf;
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

const PDF_BATCH_PAGES = 2;
const MAX_SAFE_PDF_BASE64_CHARS = 2_400_000;

async function fetchPdfBatchViaJsonEndpoint(
  payload: Record<string, unknown>,
  signal: AbortSignal
): Promise<{ document: FormattedPdfDocument; model?: string }> {
  const resFallback = await fetch('/api/format-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(payload),
  });

  const parsed = await safeParseResponseJson<{
    document?: FormattedPdfDocument;
    error?: string;
    model?: string;
  }>(resFallback);

  if (!resFallback.ok || !parsed.data?.document) {
    const fallbackErr = parsed.data?.error
      ? parsed.data.error
      : formatHttpFallbackError(
          resFallback.status,
          parsed.rawText,
          'ডকুমেন্ট প্রসেস করা যায়নি।'
        );
    throw new Error(fallbackErr);
  }

  return { document: parsed.data.document, model: parsed.data.model };
}

async function fetchPdfBatchWithStream(
  payload: Record<string, unknown>,
  signal: AbortSignal,
  onStreamChars: (chars: number) => void
): Promise<{ document: FormattedPdfDocument; model?: string }> {
  let res: Response | null = null;
  try {
    res = await fetch('/api/format-pdf-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify(payload),
    });
  } catch (networkErr: unknown) {
    if ((networkErr as { name?: string })?.name === 'AbortError') throw networkErr;
    // Network drop on stream endpoint — try standard JSON endpoint once
    return fetchPdfBatchViaJsonEndpoint(payload, signal);
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase();

  // Handle non-SSE response safely without ever calling bare res.json()
  if (!contentType.includes('text/event-stream')) {
    const parsed = await safeParseResponseJson<{
      document?: FormattedPdfDocument;
      error?: string;
      model?: string;
    }>(res);

    if (res.ok && parsed.data?.document) {
      return { document: parsed.data.document, model: parsed.data.model };
    }

    // Immediate non-retryable client/auth/quota errors
    if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 413 || res.status === 429) {
      throw new Error(
        parsed.data?.error ||
          formatHttpFallbackError(res.status, parsed.rawText, 'ডকুমেন্ট প্রসেস করা যায়নি।')
      );
    }

    // For 404/405/502/504 or empty proxy response, try non-streaming /api/format-pdf fallback
    return fetchPdfBatchViaJsonEndpoint(payload, signal);
  }

  if (!res.body) {
    return fetchPdfBatchViaJsonEndpoint(payload, signal);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let resolvedDoc: FormattedPdfDocument | null = null;
  let resolvedModel: string | undefined;
  let streamErrorMsg: string | null = null;
  let streamErrorStatus: number | undefined;

  const processFrame = (rawFrame: string) => {
    const lines = rawFrame.split(/\r?\n/);
    let eventName = 'message';
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }
    if (dataLines.length === 0) return;
    const rawJson = dataLines.join('\n');
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      return;
    }
    if (eventName === 'progress') {
      if (typeof parsed.charsReceived === 'number') {
        onStreamChars(parsed.charsReceived);
      }
    } else if (eventName === 'result') {
      if (parsed.document && typeof parsed.document === 'object') {
        resolvedDoc = parsed.document as FormattedPdfDocument;
        resolvedModel = typeof parsed.model === 'string' ? parsed.model : undefined;
      }
    } else if (eventName === 'error') {
      streamErrorStatus = typeof parsed.status === 'number' ? parsed.status : undefined;
      streamErrorMsg = typeof parsed.error === 'string' ? parsed.error : 'ডকুমেন্ট স্ট্রিমিং ত্রুটি।';
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: !done });
      let sepIndex = buffer.indexOf('\n\n');
      while (sepIndex !== -1) {
        const frame = buffer.slice(0, sepIndex).trim();
        buffer = buffer.slice(sepIndex + 2);
        if (frame) processFrame(frame);
        sepIndex = buffer.indexOf('\n\n');
      }
    }
    if (done) {
      const remaining = buffer.trim();
      if (remaining) processFrame(remaining);
      break;
    }
  }

  if (resolvedDoc) {
    return { document: resolvedDoc, model: resolvedModel };
  }

  if (streamErrorMsg) {
    if (streamErrorStatus === 400 || streamErrorStatus === 403 || streamErrorStatus === 429) {
      throw new Error(streamErrorMsg);
    }
  }

  // Fallback safely to non-streaming /api/format-pdf if SSE closed early or returned transient stream error
  return fetchPdfBatchViaJsonEndpoint(payload, signal);
}

export const AiPdfStudioPanel: React.FC<AiPdfStudioPanelProps> = ({ onAwardXp }) => {
  const [sourceText, setSourceText] = useState('');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [category, setCategory] = useState<PdfOutputCategory>('kitabi-bilingual');
  const [visualStyle, setVisualStyle] = useState<PdfVisualStyle>('color');
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [watermarkMode, setWatermarkMode] = useState<'footer' | 'diagonal-and-footer'>('footer');
  const [watermarkText, setWatermarkText] = useState('Prepared with AI Arabic Academy');

  // Pagination controls: custom chars/page + up to 100 A4 output pages
  const [charsPerPage, setCharsPerPage] = useState<number>(1800);
  const [maxPages, setMaxPages] = useState<number>(100);

  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formattedDoc, setFormattedDoc] = useState<FormattedPdfDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pagesContainerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isColor = visualStyle === 'color';

  const paginatedResult = useMemo(() => {
    if (!formattedDoc) return null;
    return paginatePdfDocument(formattedDoc, charsPerPage, maxPages);
  }, [charsPerPage, formattedDoc, maxPages]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const remaining = Math.max(0, 5 - attachments.length);
    if (remaining === 0) {
      setErrorMsg('একবারে সর্বোচ্চ ৫টি ছবি বা PDF যুক্ত করা যাবে।');
      return;
    }

    const picked = Array.from(files).slice(0, remaining);
    const loaded: UploadedFile[] = [];

    for (const f of picked) {
      const mime = f.type.toLowerCase();
      const isImg = mime.startsWith('image/');
      const isPdf = mime === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isImg && !isPdf) {
        setErrorMsg(`"${f.name}" সমর্থিত নয়। ছবি (JPG/PNG/WEBP) অথবা PDF দিন।`);
        continue;
      }

      if (isPdf) {
        if (f.size > 50 * 1024 * 1024) {
          setErrorMsg(`"${f.name}" PDF ফাইলটি ৫০ মেগাবাইটের বড়।`);
          continue;
        }
        try {
          const buf = await f.arrayBuffer();
          const uint8 = new Uint8Array(buf);
          const pdfDoc = await PDFDocument.load(uint8, { ignoreEncryption: true });
          const count = pdfDoc.getPageCount();
          if (count > 100) {
            setErrorMsg(`"${f.name}"-এ ${count} পৃষ্ঠা রয়েছে। সর্বোচ্চ ১০০ পৃষ্ঠার PDF আপলোড করা যাবে।`);
            continue;
          }
          loaded.push({
            id: `pdf-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: f.name,
            mimeType: 'application/pdf',
            sizeBytes: f.size,
            base64Data: '',
            pageCount: count,
            pdfBytes: uint8,
          });
        } catch {
          setErrorMsg(`"${f.name}" PDF ফাইলটি পড়া যায়নি (পাসওয়ার্ড-লক বা ত্রুটিপূর্ণ হতে পারে)।`);
        }
      } else {
        if (f.size > 12 * 1024 * 1024) {
          setErrorMsg(`"${f.name}" ছবিটি ১২ মেগাবাইটের বড়।`);
          continue;
        }
        const dataUrl = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
          r.onerror = () => resolve('');
          r.readAsDataURL(f);
        });
        if (!dataUrl) continue;
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        loaded.push({
          id: `pdf-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          mimeType: mime || 'image/jpeg',
          sizeBytes: f.size,
          base64Data,
          previewUrl: dataUrl,
        });
      }
    }

    if (loaded.length > 0) {
      setAttachments((prev) => [...prev, ...loaded].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
    setProgressMsg(null);
  };

  const handleGeneratePdf = async () => {
    if ((!sourceText.trim() && attachments.length === 0) || loading) return;
    if (!navigator.onLine) {
      setErrorMsg('AI PDF ফরম্যাট করতে ইন্টারনেট সংযোগ প্রয়োজন।');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setErrorMsg(null);
    setProgressMsg('কাজের ব্যাচ প্রস্তুত হচ্ছে...');

    try {
      interface BatchJob {
        labelBn: string;
        text: string;
        attachments: { name: string; mimeType: string; base64Data: string }[];
      }

      const jobs: BatchJob[] = [];
      const pdfFiles = attachments.filter((a) => a.mimeType === 'application/pdf' && a.pdfBytes);
      const imageFiles = attachments
        .filter((a) => a.mimeType !== 'application/pdf')
        .map((a) => ({ name: a.name, mimeType: a.mimeType, base64Data: a.base64Data }));

      const textChunks = splitLongTextIntoChunks(sourceText, 1800);

      // 1. Adaptive 1–2 page zero-omission PDF slicing so payload stays safely below Vercel 4.5MB limit
      for (const pdfAtt of pdfFiles) {
        const srcDoc = await PDFDocument.load(pdfAtt.pdfBytes!, { ignoreEncryption: true });
        const total = srcDoc.getPageCount();
        let cursor = 0;

        while (cursor < total) {
          let batchCount = Math.min(PDF_BATCH_PAGES, total - cursor);
          let subBase64 = '';

          while (batchCount >= 1) {
            const subDoc = await PDFDocument.create();
            const indices = Array.from({ length: batchCount }, (_, k) => cursor + k);
            const copied = await subDoc.copyPages(srcDoc, indices);
            copied.forEach((p) => subDoc.addPage(p));
            subBase64 = await subDoc.saveAsBase64();
            if (subBase64.length <= MAX_SAFE_PDF_BASE64_CHARS || batchCount === 1) {
              break;
            }
            batchCount = 1;
          }

          if (subBase64.length > 3_800_000) {
            throw new Error(
              `"${pdfAtt.name}" এর পৃষ্ঠা ${cursor + 1} এর ছবি খুব ভারী (${Math.round(
                subBase64.length / 1024 / 1024
              )}MB)। অনুগ্রহ করে পৃষ্ঠাটির স্ক্রিনশট/কমপ্রেসড PDF দিন।`
            );
          }

          const end = cursor + batchCount;
          jobs.push({
            labelBn: `${pdfAtt.name}: পৃষ্ঠা ${cursor + 1}${end > cursor + 1 ? `–${end}` : ''} / ${total}`,
            text: jobs.length === 0 && textChunks.length > 0 ? textChunks.shift()! : '',
            attachments: [
              ...(jobs.length === 0 ? imageFiles : []),
              {
                name: `${pdfAtt.name}-p${cursor + 1}-${end}.pdf`,
                mimeType: 'application/pdf',
                base64Data: subBase64,
              },
            ],
          });
          cursor = end;
        }
      }

      // 2. Remaining text chunks or images
      if (textChunks.length > 0) {
        textChunks.forEach((chunkText, idx) => {
          jobs.push({
            labelBn: `লেখা অংশ ${idx + 1} / ${textChunks.length}`,
            text: chunkText,
            attachments: jobs.length === 0 && idx === 0 ? imageFiles : [],
          });
        });
      } else if (jobs.length === 0 && imageFiles.length > 0) {
        jobs.push({
          labelBn: `ছবি (${imageFiles.length}টি)`,
          text: sourceText,
          attachments: imageFiles,
        });
      }

      const mergedSections: FormattedPdfSection[] = [];
      let masterMeta: Partial<FormattedPdfDocument> = {};

      for (let i = 0; i < jobs.length; i++) {
        if (controller.signal.aborted) break;
        const job = jobs[i];
        setProgressMsg(`ব্যাচ ${i + 1}/${jobs.length} স্ট্রিমিং শুরু (${job.labelBn})...`);

        const batchRes = await fetchPdfBatchWithStream(
          {
            text: job.text,
            category,
            userInstructions: extraPrompt,
            attachments: job.attachments,
            chunkIndex: i + 1,
            totalChunks: jobs.length,
          },
          controller.signal,
          (chars) => {
            setProgressMsg(
              `ব্যাচ ${i + 1}/${jobs.length} স্ট্রিমিং হচ্ছে (${job.labelBn}) — ${chars} অক্ষর প্রাপ্ত`
            );
          }
        );

        if (i === 0) {
          masterMeta = {
            titleAr: batchRes.document.titleAr,
            titleBn: batchRes.document.titleBn,
            subtitleBn: batchRes.document.subtitleBn,
            footerNote: batchRes.document.footerNote,
          };
        }

        if (Array.isArray(batchRes.document.sections)) {
          mergedSections.push(...batchRes.document.sections);
        }

        // Progressive live A4 preview after each batch completes
        setFormattedDoc({
          titleAr: masterMeta.titleAr || batchRes.document.titleAr,
          titleBn: masterMeta.titleBn || batchRes.document.titleBn,
          subtitleBn: masterMeta.subtitleBn || batchRes.document.subtitleBn,
          category,
          sections: [...mergedSections],
          footerNote: masterMeta.footerNote || batchRes.document.footerNote,
        });
      }

      onAwardXp?.(Math.min(60, 20 + (jobs.length - 1) * 5), {
        titleBn: `AI পূর্ণ PDF ডকুমেন্ট তৈরি (${jobs.length} ব্যাচ)`,
        titleEn: `Generated Complete AI PDF Document (${jobs.length} batches)`,
        type: 'ai',
      });
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setErrorMsg(err instanceof Error ? err.message : 'PDF তৈরিতে ত্রুটি হয়েছে।');
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
      setProgressMsg(null);
    }
  };

  const handlePrintPdf = () => {
    if (!formattedDoc) return;
    window.print();
  };

  const handleDownloadDirectPdf = async () => {
    if (!formattedDoc || !pagesContainerRef.current || exportingPdf) return;
    setExportingPdf(true);
    setErrorMsg(null);
    try {
      const pageNodes = Array.from(
        pagesContainerRef.current.querySelectorAll<HTMLElement>('.pdf-a4-page')
      );
      if (pageNodes.length === 0) {
        throw new Error('রপ্তানি করার জন্য কোনো A4 পৃষ্ঠা পাওয়া যায়নি।');
      }
      await exportPaginatedElementsToPdf(pageNodes, {
        filename: `arabic-academy-${category}-${Date.now()}.pdf`,
        scale: 2,
        margin: [8, 8, 8, 8],
        captureWidthPx: 794,
        onProgress: (cur, total) => {
          setProgressMsg(`PDF ফাইল তৈরি হচ্ছে: পৃষ্ঠা ${cur} / ${total}...`);
        },
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'PDF ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setExportingPdf(false);
      setProgressMsg(null);
    }
  };

  const handleDownloadStandaloneHtml = () => {
    if (!formattedDoc || !pagesContainerRef.current) return;
    const title = formattedDoc.titleBn || formattedDoc.titleAr || 'AI Arabic Academy Document';
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #e5e7eb; margin: 0; padding: 14px; font-family: 'Hind Siliguri', sans-serif; }
    .font-arabic { font-family: 'Amiri', serif; line-height: 1.95; }
    .font-mono-num { font-variant-numeric: tabular-nums; }
    .pdf-a4-page { background: #ffffff; width: 100%; max-width: 210mm; min-height: 297mm; margin: 0 auto 20px auto; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 7mm; }
    @media print {
      body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .pdf-a4-page { margin: 0 !important; box-shadow: none !important; border: none !important; min-height: 278mm !important; page-break-after: always !important; break-after: page !important; }
      .pdf-a4-page:last-child { page-break-after: auto !important; break-after: auto !important; }
    }
  </style>
</head>
<body>
  ${pagesContainerRef.current.outerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arabic-academy-${category}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Studio Controls Card */}
      <section className="surface-card rounded-3xl border border-[var(--border-strong)] p-4 sm:p-6 space-y-4 shadow-sm print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
              <Sparkles className="w-4 h-4" />
              <span>AI কিতাবি ডকুমেন্ট-টু-PDF স্টুডিও (১০০ পৃষ্ঠা ইনপুট → ১০০ পৃষ্ঠা A4 আউটপুট)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
              যেকোনো লেখা বা PDF প্রুফরিডিং ও হারাকাতসহ পূর্ণ A4 কিতাবি শিট হিসেবে সাজান
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              একটি পয়েন্টও বাদ না দিয়ে রিয়েল-টাইম স্ট্রিমিং ও অটো-প্রুফরিডিং হয়। ১০০ পৃষ্ঠা পর্যন্ত PDF দিন এবং প্রতি A4 পৃষ্ঠার ঘনত্ব নির্ধারণ করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSourceText(SAMPLE_PROMPT)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary shrink-0 whitespace-nowrap"
          >
            নমুনা লেখা বসান
          </button>
        </div>

        {/* Input Textarea + File Upload */}
        <div className="space-y-2.5">
          <textarea
            rows={5}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="এখানে যত বড় বাংলা বা আরবি লেখা ইচ্ছা পেস্ট করুন (ভুল বানান বা হারাকাত না থাকলেও AI ঠিক করে নেবে, অথবা নিচে ১০০ পৃষ্ঠা পর্যন্ত PDF / বইয়ের ছবি আপলোড করুন)..."
            className="w-full p-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] text-sm sm:text-base font-arabic-ui focus:outline-none focus:border-[var(--accent)]"
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => void handleFileUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-secondary whitespace-nowrap shrink-0"
            >
              <Upload className="w-4 h-4 text-[var(--accent)]" />
              <span>ছবি বা PDF আপলোড (সর্বোচ্চ ১০০ পৃষ্ঠা PDF)</span>
            </button>

            <input
              type="text"
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder="অতিরিক্ত নির্দেশনা (ঐচ্ছিক, যেমন: সনগুলো ব্যাজে দেখাও, ৩-কলাম কার্ড বা প্রবাহ বক্স ব্যবহার করো)"
              className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl surface-alt border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl surface-alt border border-[var(--border-subtle)] text-xs"
                >
                  {att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="w-7 h-7 rounded-lg object-cover" />
                  ) : att.mimeType === 'application/pdf' ? (
                    <FileText className="w-4 h-4 text-rose-500" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-sky-500" />
                  )}
                  <span className="max-w-[150px] truncate font-semibold">{att.name}</span>
                  {att.pageCount && (
                    <span className="font-mono-num text-[10px] font-bold text-[var(--accent)]">
                      ({att.pageCount} পৃষ্ঠা)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== att.id))}
                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--danger)]"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4 Output Categories */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[var(--text-primary)]">PDF তৈরির ক্যাটাগরি নির্বাচন করুন:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PDF_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    active
                      ? 'btn-primary border-transparent shadow-sm'
                      : 'surface-alt border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-xs font-extrabold">{cat.titleBn}</div>
                  <div className={`text-[11px] mt-1 leading-snug ${active ? 'opacity-90' : 'text-[var(--text-muted)]'}`}>
                    {cat.descBn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pagination Density Controls (Chars per page & Max pages up to 100) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
              <span className="inline-flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>প্রতি A4 পৃষ্ঠায় অক্ষর সংখ্যা (Density)</span>
              </span>
              <span className="font-mono-num text-[var(--accent)]">{charsPerPage} অক্ষর</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { val: 1200, label: '১২০০ (ফাঁকা/বড়)' },
                { val: 1800, label: '১৮০০ (স্ট্যান্ডার্ড A4)' },
                { val: 2500, label: '২৫০০ (ঘন কিতাবি A4)' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setCharsPerPage(preset.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    charsPerPage === preset.val ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <input
                type="number"
                min={500}
                max={5500}
                step={100}
                value={charsPerPage}
                onChange={(e) => setCharsPerPage(Math.max(500, Math.min(5500, Number(e.target.value) || 1800)))}
                className="w-24 px-2.5 py-1 rounded-lg surface-alt border border-[var(--border-subtle)] text-xs font-mono-num focus:outline-none focus:border-[var(--accent)]"
                aria-label="Characters per page"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
              <span>সর্বোচ্চ আউটপুট পৃষ্ঠা সীমা (১–১০০ পৃষ্ঠা)</span>
              <span className="font-mono-num text-[var(--accent)]">সর্বোচ্চ {maxPages} পৃষ্ঠা</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <input
                type="number"
                min={1}
                max={100}
                value={maxPages}
                onChange={(e) => setMaxPages(Math.max(1, Math.min(100, Number(e.target.value) || 100)))}
                className="w-16 px-2.5 py-1 rounded-lg surface-alt border border-[var(--border-subtle)] text-xs font-mono-num text-center"
                aria-label="Maximum output pages"
              />
            </div>
          </div>
        </div>

        {/* Style & Optional Watermark Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
              <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>ডকুমেন্টের রঙ ও ডিজাইন:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisualStyle('color')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isColor ? 'btn-primary border-transparent' : 'btn-secondary'
                }`}
              >
                <div className="text-xs font-bold">রঙিন কিতাবি ডিজাইন</div>
                <div className="text-[10px] opacity-85 mt-0.5">পান্না-সোনালি হেডার, রঙিন কার্ড ও টেবিল</div>
              </button>
              <button
                type="button"
                onClick={() => setVisualStyle('bw')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  !isColor ? 'btn-primary border-transparent' : 'btn-secondary'
                }`}
              >
                <div className="text-xs font-bold">সাদা-কালো প্রিন্ট</div>
                <div className="text-[10px] opacity-85 mt-0.5">পরিচ্ছন্ন সাদা কাগজ ও গাঢ় কালো অক্ষর</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWatermark}
                  onChange={(e) => setEnableWatermark(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <span>ঐচ্ছিক ওয়াটারমার্ক (Watermark)</span>
              </label>

              {enableWatermark && (
                <div className="inline-flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setWatermarkMode('footer')}
                    className={`px-2.5 py-0.5 rounded-lg font-semibold whitespace-nowrap ${
                      watermarkMode === 'footer' ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    ফুটার
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkMode('diagonal-and-footer')}
                    className={`px-2.5 py-0.5 rounded-lg font-semibold whitespace-nowrap ${
                      watermarkMode === 'diagonal-and-footer' ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    জলছাপ + ফুটার
                  </button>
                </div>
              )}
            </div>

            {enableWatermark && (
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="ওয়াটারমার্ক লেখা (যেমন: Created by ...)"
                className="w-full px-3 py-2 rounded-xl surface-alt border border-[var(--border-subtle)] text-xs focus:outline-none focus:border-[var(--accent)]"
              />
            )}
          </div>
        </div>

        {/* Generate CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading || (!sourceText.trim() && attachments.length === 0)}
              onClick={() => void handleGeneratePdf()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold btn-primary shadow-md disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'AI স্ট্রিমিং ও ফরম্যাট করছে...' : 'সম্পূর্ণ PDF তৈরি করুন'}</span>
            </button>

            {loading && (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-rose-600 text-white whitespace-nowrap"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>থামান</span>
              </button>
            )}
          </div>

          {formattedDoc && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={exportingPdf}
                onClick={() => void handleDownloadDirectPdf()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-primary whitespace-nowrap disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>
                  {exportingPdf
                    ? 'PDF তৈরি হচ্ছে...'
                    : `PDF ডাউনলোড (.pdf · ${paginatedResult?.pages.length || 1} পৃষ্ঠা)`}
                </span>
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary whitespace-nowrap"
              >
                <Printer className="w-4 h-4 text-[var(--accent)]" />
                <span>প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadStandaloneHtml}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold btn-secondary whitespace-nowrap"
              >
                <FileCode2 className="w-4 h-4 text-[var(--accent)]" />
                <span>HTML ডাউনলোড</span>
              </button>
            </div>
          )}
        </div>

        {progressMsg && (
          <div className="p-3 rounded-xl bg-[var(--emerald-highlight)] border border-[var(--accent)]/30 text-xs font-bold text-[var(--accent)]">
            {progressMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 text-xs sm:text-sm text-[var(--danger)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </section>

      {/* Discrete Paginated Multi-Page A4 Sheets Preview */}
      {formattedDoc && paginatedResult && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] px-1 print:hidden">
            <span>
              মোট <strong className="text-[var(--accent)] font-mono-num">{paginatedResult.pages.length}টি</strong> A4 পৃষ্ঠা তৈরি হয়েছে
              (প্রতি পৃষ্ঠায় প্রায় {paginatedResult.effectiveCharsPerPage} অক্ষর ওজন)
            </span>
            <button
              type="button"
              disabled={exportingPdf}
              onClick={() => void handleDownloadDirectPdf()}
              className="inline-flex items-center gap-1 font-bold text-[var(--accent)] hover:underline whitespace-nowrap disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>সব পৃষ্ঠা PDF ডাউনলোড করুন</span>
            </button>
          </div>

          <div ref={pagesContainerRef} className="space-y-6 print:space-y-0">
            {paginatedResult.pages.map((page) => (
              <div
                key={`a4-page-${page.pageNumber}`}
                className={`pdf-a4-page relative mx-auto rounded-xl overflow-hidden shadow-xl border flex flex-col justify-between ${
                  isColor
                    ? 'bg-white text-slate-900 border-emerald-200'
                    : 'bg-white text-neutral-950 border-neutral-300'
                }`}
              >
                {/* Optional Subtle Diagonal Watermark per page */}
                {enableWatermark && watermarkMode === 'diagonal-and-footer' && watermarkText.trim() && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-10"
                  >
                    <span className="font-bold text-3xl sm:text-4xl tracking-widest uppercase -rotate-30 text-slate-900/[0.045] whitespace-nowrap">
                      {watermarkText}
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-3.5 relative z-20 flex-1">
                  {/* Cover Banner on Page 1 Only — Kitabi Gradient Header */}
                  {page.showHeaderBanner &&
                    (isColor ? (
                      <header
                        className="rounded-xl px-5 py-4 text-white text-center space-y-1 border-b-[3px] border-amber-400 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 55%, #0284c7 100%)' }}
                      >
                        {formattedDoc.titleAr && (
                          <h1 className="font-arabic text-xl sm:text-2xl font-bold leading-snug" dir="rtl">
                            {formattedDoc.titleAr}
                          </h1>
                        )}
                        {formattedDoc.titleBn && (
                          <div className="text-sm sm:text-base font-bold text-amber-100">
                            {formattedDoc.titleBn}
                          </div>
                        )}
                        {formattedDoc.subtitleBn && (
                          <p className="text-[11px] sm:text-xs text-emerald-50/90">{formattedDoc.subtitleBn}</p>
                        )}
                      </header>
                    ) : (
                      <header className="px-4 pt-2 pb-3 text-center space-y-1 border-b-2 border-neutral-900">
                        {formattedDoc.titleAr && (
                          <h1
                            className="font-arabic text-xl sm:text-2xl font-bold underline decoration-2 underline-offset-8 text-black"
                            dir="rtl"
                          >
                            {formattedDoc.titleAr}
                          </h1>
                        )}
                        {formattedDoc.titleBn && (
                          <div className="text-sm sm:text-base font-extrabold text-black pt-1">
                            {formattedDoc.titleBn}
                          </div>
                        )}
                        {formattedDoc.subtitleBn && (
                          <p className="text-[11px] text-neutral-600">{formattedDoc.subtitleBn}</p>
                        )}
                      </header>
                    ))}

                  {/* Page Body Sections */}
                  <div className="space-y-3.5">
                    {page.sections.map((section, sIdx) => (
                      <section key={section.id || sIdx} className="space-y-2">
                        {(section.headingAr || section.headingBn) && (
                          <div
                            className={
                              isColor
                                ? 'rounded-lg px-3.5 py-1.5 text-white flex flex-wrap items-center justify-between gap-2 shadow-xs'
                                : 'pb-1 border-b border-neutral-400 flex flex-wrap items-center justify-between gap-2'
                            }
                            style={
                              isColor
                                ? { background: getSectionBannerGradient(section.accentTheme) }
                                : undefined
                            }
                          >
                            {section.headingBn && (
                              <h2 className={`text-xs sm:text-sm font-extrabold ${isColor ? 'text-white' : 'text-black'}`}>
                                {section.headingBn}
                              </h2>
                            )}
                            {section.headingAr && (
                              <h3
                                className={`font-arabic text-base sm:text-lg font-bold ${
                                  isColor ? 'text-amber-100' : 'text-black'
                                }`}
                                dir="rtl"
                              >
                                {section.headingAr}
                              </h3>
                            )}
                          </div>
                        )}

                        {/* Layout 1: 2-Column Cards */}
                        {section.layout === 'cards' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {section.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className={`rounded-lg border p-2.5 space-y-1 ${getCardPalette(item.highlightColor, isColor)}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  {(item.badgeNumber || item.badge) && (
                                    <span
                                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-extrabold shrink-0 font-mono-num ${
                                        isColor ? 'bg-amber-500 text-white' : 'bg-neutral-900 text-white'
                                      }`}
                                    >
                                      {item.badgeNumber || item.badge}
                                    </span>
                                  )}
                                  {item.labelAr && (
                                    <span
                                      className={`font-arabic text-[15px] font-bold text-right flex-1 ${
                                        isColor ? 'text-emerald-950' : 'text-black'
                                      }`}
                                      dir="rtl"
                                    >
                                      {item.labelAr}
                                    </span>
                                  )}
                                </div>

                                {item.labelBn && (
                                  <div className="text-[11px] font-bold text-slate-700">{item.labelBn}</div>
                                )}

                                {item.arabic && (
                                  <div
                                    className={`font-arabic text-[15.5px] leading-[1.85] text-right ${
                                      isColor ? 'text-slate-950' : 'text-black'
                                    }`}
                                    dir="rtl"
                                  >
                                    {item.arabic}
                                  </div>
                                )}

                                {item.bengali && (
                                  <p className="text-[12px] sm:text-[12.5px] text-slate-800 leading-relaxed">
                                    {item.bengali}
                                  </p>
                                )}

                                {item.reference && (
                                  <div className="text-[10.5px] font-semibold text-slate-500">
                                    [{item.reference}]
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Layout 2: 3-Column Compact Kitabi Grid */}
                        {section.layout === 'grid-3' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className={`rounded-lg border p-2.5 space-y-1 flex flex-col justify-between ${getCardPalette(
                                  item.highlightColor,
                                  isColor
                                )}`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-1.5">
                                    {(item.badgeNumber || item.badge) && (
                                      <span
                                        className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-extrabold shrink-0 font-mono-num ${
                                          isColor ? 'bg-emerald-700 text-white' : 'bg-neutral-900 text-white'
                                        }`}
                                      >
                                        {item.badgeNumber || item.badge}
                                      </span>
                                    )}
                                    {item.labelAr && (
                                      <span
                                        className={`font-arabic text-sm font-bold text-right flex-1 ${
                                          isColor ? 'text-emerald-950' : 'text-black'
                                        }`}
                                        dir="rtl"
                                      >
                                        {item.labelAr}
                                      </span>
                                    )}
                                  </div>
                                  {item.labelBn && (
                                    <div className="text-[11px] font-bold text-slate-700">{item.labelBn}</div>
                                  )}
                                  {item.arabic && (
                                    <div
                                      className="font-arabic text-sm leading-relaxed text-right text-slate-950"
                                      dir="rtl"
                                    >
                                      {item.arabic}
                                    </div>
                                  )}
                                  {item.bengali && (
                                    <p className="text-[11.5px] text-slate-800 leading-snug">{item.bengali}</p>
                                  )}
                                </div>
                                {item.reference && (
                                  <div className="text-[10px] font-semibold text-slate-500 pt-0.5">
                                    [{item.reference}]
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Layout 3: Classical Comparison Table */}
                        {section.layout === 'table' && (
                          <div className="overflow-x-auto rounded-lg border border-slate-300">
                            <table className="w-full text-[12px] sm:text-[12.5px] border-collapse">
                              <thead>
                                <tr className={getTableHeaderClass(section.accentTheme, isColor)}>
                                  <th className="px-2.5 py-1.5 text-left font-bold border-b border-slate-300">
                                    বাংলা অর্থ / ব্যাখ্যা
                                  </th>
                                  <th
                                    className="px-2.5 py-1.5 text-right font-arabic text-sm font-bold border-b border-slate-300"
                                    dir="rtl"
                                  >
                                    الْعَرَبِيَّةُ
                                  </th>
                                  <th
                                    className="px-2.5 py-1.5 text-right font-arabic text-xs sm:text-sm font-bold border-b border-slate-300 w-[105px]"
                                    dir="rtl"
                                  >
                                    الْبَيَانُ
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.items.map((item, iIdx) => (
                                  <tr
                                    key={iIdx}
                                    className={iIdx % 2 === 1 ? (isColor ? 'bg-slate-50' : 'bg-neutral-50') : 'bg-white'}
                                  >
                                    <td className="p-2 border-t border-slate-200 align-top text-slate-900 leading-snug">
                                      {item.bengali || item.labelBn}
                                      {item.reference && (
                                        <span className="block text-[10px] text-slate-500 mt-0.5">
                                          [{item.reference}]
                                        </span>
                                      )}
                                    </td>
                                    <td
                                      className="p-2 border-t border-slate-200 align-top font-arabic text-[15px] leading-[1.85] text-right text-slate-950"
                                      dir="rtl"
                                    >
                                      {item.arabic}
                                    </td>
                                    <td
                                      className={`p-2 border-t border-slate-200 align-top text-right font-bold ${
                                        isColor ? 'bg-amber-50/75 text-emerald-950' : 'bg-neutral-100 text-black'
                                      }`}
                                      dir="rtl"
                                    >
                                      <span className="font-arabic text-sm">
                                        {item.labelAr || item.badgeNumber || '—'}
                                      </span>
                                      {item.labelBn && (
                                        <span className="block text-[10px] font-sans text-slate-600 mt-0.5" dir="ltr">
                                          {item.labelBn}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Layout 4: Sequential Flow Steps */}
                        {section.layout === 'flow' && (
                          <div className="flex flex-wrap items-stretch gap-2" dir="rtl">
                            {section.items.map((item, iIdx) => (
                              <React.Fragment key={iIdx}>
                                <div
                                  className={`flex-1 min-w-[140px] rounded-lg border p-2.5 space-y-1 ${getCardPalette(
                                    item.highlightColor,
                                    isColor
                                  )}`}
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    {item.labelAr && (
                                      <span className="font-arabic text-sm font-bold text-slate-950">
                                        {item.labelAr}
                                      </span>
                                    )}
                                    {(item.badgeNumber || item.badge) && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono-num ${
                                          isColor ? 'bg-emerald-700 text-white' : 'bg-neutral-900 text-white'
                                        }`}
                                      >
                                        {item.badgeNumber || item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.arabic && (
                                    <p className="font-arabic text-sm leading-relaxed text-slate-900">
                                      {item.arabic}
                                    </p>
                                  )}
                                  {(item.labelBn || item.bengali) && (
                                    <p className="text-[11px] text-slate-700 leading-snug text-left" dir="ltr">
                                      {item.labelBn ? <strong>{item.labelBn}: </strong> : null}
                                      {item.bengali}
                                    </p>
                                  )}
                                </div>
                                {iIdx < section.items.length - 1 && (
                                  <div className="hidden sm:flex items-center justify-center text-emerald-700 shrink-0">
                                    <ArrowLeft className="w-4 h-4" />
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* Layout 5: Quran / Hadith Highlighted Callouts */}
                        {section.layout === 'quotes' && (
                          <div className="space-y-2">
                            {section.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className={`rounded-lg border px-3.5 py-2.5 text-center space-y-1 ${
                                  isColor
                                    ? 'border-emerald-200 bg-emerald-50/45 text-slate-950'
                                    : 'border-neutral-300 bg-neutral-50 text-black'
                                }`}
                              >
                                {item.arabic && (
                                  <p
                                    className="font-arabic text-base sm:text-lg font-bold leading-relaxed text-emerald-950"
                                    dir="rtl"
                                  >
                                    {item.arabic.includes('﴿') ? item.arabic : `﴿${item.arabic}﴾`}
                                  </p>
                                )}
                                {item.bengali && (
                                  <p className="text-[12px] sm:text-[12.5px] text-slate-800 leading-snug">
                                    {item.bengali}
                                  </p>
                                )}
                                {item.reference && (
                                  <div className="text-[10.5px] font-bold text-amber-800">
                                    [{item.reference}]
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Layout 6: Clean Kitabi Bilingual Prose */}
                        {section.layout === 'prose' && (
                          <div className="space-y-2">
                            {section.items.map((item, iIdx) => (
                              <div key={iIdx} className="space-y-0.5 pb-1.5 border-b border-slate-200/80 last:border-b-0">
                                {(item.badgeNumber || item.labelAr || item.labelBn) && (
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    {item.labelBn && (
                                      <h4 className="text-[12.5px] font-extrabold text-slate-900">
                                        {item.badgeNumber ? `${item.badgeNumber}. ` : ''}
                                        {item.labelBn}
                                      </h4>
                                    )}
                                    {item.labelAr && (
                                      <h4 className="font-arabic text-[15px] font-bold text-slate-950" dir="rtl">
                                        {item.badgeNumber && !item.labelBn ? `${item.badgeNumber}- ` : ''}
                                        {item.labelAr}
                                      </h4>
                                    )}
                                  </div>
                                )}
                                {item.arabic && (
                                  <p className="font-arabic text-[15.5px] leading-[1.85] text-slate-950" dir="rtl">
                                    {item.arabic}
                                  </p>
                                )}
                                {item.bengali && (
                                  <p className="text-[12px] sm:text-[12.5px] text-slate-800 leading-relaxed">
                                    {item.bengali}
                                  </p>
                                )}
                                {item.reference && (
                                  <div className="text-[10.5px] text-slate-500">[{item.reference}]</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Section Synthesis / Bottom Question Summary Bar matching Kitabi layout */}
                        {section.introBn && (
                          <p className={`text-[11.5px] sm:text-xs px-3 py-1.5 rounded-lg leading-snug ${getIntroNoteClass(section.accentTheme, isColor)}`}>
                            {section.introBn}
                          </p>
                        )}
                      </section>
                    ))}
                  </div>
                </div>

                {/* Page Footer: Watermark left + N / Total right */}
                <footer
                  className={`px-5 py-2 flex items-center justify-between gap-2 text-[11px] border-t-2 ${
                    isColor
                      ? 'border-amber-400 bg-slate-50 text-slate-600'
                      : 'border-neutral-800 bg-white text-neutral-700'
                  }`}
                >
                  <span className="truncate">
                    {enableWatermark
                      ? watermarkText
                      : formattedDoc.footerNote || formattedDoc.titleBn || 'AI Arabic Academy'}
                  </span>
                  <span className="font-mono-num font-bold shrink-0">
                    {page.pageNumber} / {page.totalPages}
                  </span>
                </footer>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
