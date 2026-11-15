import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export type PdfMarginTuple = [number, number, number, number];

export interface DomPdfExportOptions {
  filename: string;
  /** Explicit html2canvas pixel scale factor (default: 2) */
  scale?: number;
  /** Explicit A4 margin in mm: single value or [top, right, bottom, left] (default: [8, 8, 8, 8]) */
  margin?: number | PdfMarginTuple;
  /** Desktop A4 capture width in CSS px so mobile viewports never squeeze layout (default: 794) */
  captureWidthPx?: number;
  onProgress?: (current: number, total: number) => void;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const DEFAULT_A4_WIDTH_PX = 794;
const MAX_CANVAS_DIM = 14000;
const MAX_CANVAS_AREA = 85_000_000;

function normalizeMargin(margin?: number | PdfMarginTuple): PdfMarginTuple {
  if (typeof margin === 'number' && Number.isFinite(margin)) {
    const m = Math.max(0, Math.min(30, margin));
    return [m, m, m, m];
  }
  if (Array.isArray(margin) && margin.length === 4) {
    return [
      Math.max(0, Math.min(30, Number(margin[0]) || 0)),
      Math.max(0, Math.min(30, Number(margin[1]) || 0)),
      Math.max(0, Math.min(30, Number(margin[2]) || 0)),
      Math.max(0, Math.min(30, Number(margin[3]) || 0)),
    ];
  }
  return [8, 8, 8, 8];
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function yieldThread(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForElementFullyRendered(element: HTMLElement): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await Promise.race([document.fonts.ready, yieldThread(3000)]);
    } catch {
      // ignore font readiness failures
    }
  }

  const images = Array.from(element.querySelectorAll('img'));
  if (images.length > 0) {
    await Promise.race([
      Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              const done = () => {
                img.removeEventListener('load', done);
                img.removeEventListener('error', done);
                resolve();
              };
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            })
        )
      ),
      yieldThread(4000),
    ]);
  }

  await nextFrame();
  await nextFrame();
  await yieldThread(60);
}

function computeSafeScale(widthPx: number, heightPx: number, requestedScale: number): number {
  let scale = Math.max(1, Math.min(3, requestedScale));
  if (widthPx * scale > MAX_CANVAS_DIM) {
    scale = Math.max(1, MAX_CANVAS_DIM / Math.max(1, widthPx));
  }
  if (heightPx * scale > MAX_CANVAS_DIM) {
    scale = Math.max(1, MAX_CANVAS_DIM / Math.max(1, heightPx));
  }
  const area = widthPx * heightPx * scale * scale;
  if (area > MAX_CANVAS_AREA) {
    const ratio = Math.sqrt(MAX_CANVAS_AREA / Math.max(1, widthPx * heightPx));
    scale = Math.max(1, Math.min(scale, ratio));
  }
  return scale;
}

async function captureElementCanvas(
  element: HTMLElement,
  requestedScale: number,
  captureWidthPx: number
): Promise<HTMLCanvasElement> {
  await waitForElementFullyRendered(element);

  const rect = element.getBoundingClientRect();
  const measuredWidth = Math.max(element.scrollWidth, element.offsetWidth, Math.ceil(rect.width), captureWidthPx);
  const measuredHeight = Math.max(element.scrollHeight, element.offsetHeight, Math.ceil(rect.height));

  if (measuredWidth <= 0 || measuredHeight <= 0) {
    throw new Error('PDF এক্সপোর্ট করার জন্য নির্বাচিত অংশটি এখনো রেন্ডার হয়নি।');
  }

  const targetWidth = Math.max(captureWidthPx, measuredWidth);
  const safeScale = computeSafeScale(targetWidth, measuredHeight, requestedScale);

  const canvas = await html2canvas(element, {
    scale: safeScale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: targetWidth,
    windowWidth: targetWidth,
    scrollX: 0,
    scrollY: 0,
    onclone: (_doc, clonedEl) => {
      if (clonedEl.parentElement) {
        clonedEl.parentElement.style.position = 'static';
        clonedEl.parentElement.style.left = '0px';
        clonedEl.parentElement.style.top = '0px';
        clonedEl.parentElement.style.opacity = '1';
        clonedEl.parentElement.style.visibility = 'visible';
        clonedEl.parentElement.style.overflow = 'visible';
      }
      clonedEl.style.position = 'relative';
      clonedEl.style.left = '0px';
      clonedEl.style.top = '0px';
      clonedEl.style.width = `${targetWidth}px`;
      clonedEl.style.maxWidth = `${targetWidth}px`;
      clonedEl.style.minWidth = `${targetWidth}px`;
      clonedEl.style.opacity = '1';
      clonedEl.style.visibility = 'visible';
      clonedEl.style.overflow = 'visible';
      clonedEl.style.boxShadow = 'none';
      clonedEl.style.margin = '0';
    },
  });

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('ক্যানভাস রেন্ডার খালি এসেছে (Empty canvas)।');
  }

  return canvas;
}

function addCanvasPaginatedToPdf(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  marginTuple: PdfMarginTuple,
  isFirstPageInDoc: boolean
): boolean {
  const [topMm, rightMm, bottomMm, leftMm] = marginTuple;
  const printableWidthMm = Math.max(40, A4_WIDTH_MM - leftMm - rightMm);
  const printableHeightMm = Math.max(60, A4_HEIGHT_MM - topMm - bottomMm);

  const totalScaledHeightMm = (canvas.height * printableWidthMm) / canvas.width;

  // Fits cleanly inside a single A4 page
  if (totalScaledHeightMm <= printableHeightMm + 1.5) {
    if (!isFirstPageInDoc) {
      pdf.addPage('a4', 'portrait');
    }
    const clampedHeightMm = Math.min(totalScaledHeightMm, printableHeightMm);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    pdf.addImage(dataUrl, 'JPEG', leftMm, topMm, printableWidthMm, clampedHeightMm, undefined, 'FAST');
    return true;
  }

  // Slice tall canvas cleanly into A4 page chunks with zero clipping or blank trailing pages
  const sliceHeightPx = Math.max(100, Math.floor((printableHeightMm * canvas.width) / printableWidthMm));
  let offsetPx = 0;
  let addedAny = false;

  while (offsetPx < canvas.height) {
    const remainingPx = canvas.height - offsetPx;
    if (remainingPx < 8 && addedAny) {
      break;
    }

    const currentSlicePx = Math.min(sliceHeightPx, remainingPx);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = currentSlicePx;

    const ctx = sliceCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('PDF পৃষ্ঠা স্লাইস করার জন্য 2D ক্যানভাস তৈরি করা যায়নি।');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      offsetPx,
      canvas.width,
      currentSlicePx,
      0,
      0,
      canvas.width,
      currentSlicePx
    );

    if (!isFirstPageInDoc || addedAny) {
      pdf.addPage('a4', 'portrait');
    }

    const sliceHeightMm = (currentSlicePx * printableWidthMm) / canvas.width;
    const sliceDataUrl = sliceCanvas.toDataURL('image/jpeg', 0.94);
    pdf.addImage(sliceDataUrl, 'JPEG', leftMm, topMm, printableWidthMm, sliceHeightMm, undefined, 'FAST');

    addedAny = true;
    offsetPx += currentSlicePx;
  }

  return addedAny;
}

export async function exportPaginatedElementsToPdf(
  pageElements: HTMLElement[],
  options: DomPdfExportOptions
): Promise<void> {
  const validPages = pageElements.filter((el) => el && el.isConnected);
  if (validPages.length === 0) {
    throw new Error('রপ্তানি করার মতো কোনো রেন্ডার করা A4 পৃষ্ঠা পাওয়া যায়নি।');
  }

  const marginTuple = normalizeMargin(options.margin);
  const scale = options.scale ?? 2;
  const captureWidthPx = options.captureWidthPx ?? DEFAULT_A4_WIDTH_PX;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  let hasAddedFirstPage = false;

  for (let i = 0; i < validPages.length; i++) {
    options.onProgress?.(i + 1, validPages.length);
    const canvas = await captureElementCanvas(validPages[i], scale, captureWidthPx);
    const added = addCanvasPaginatedToPdf(pdf, canvas, marginTuple, !hasAddedFirstPage);
    if (added) {
      hasAddedFirstPage = true;
    }
    await yieldThread(0);
  }

  if (!hasAddedFirstPage) {
    throw new Error('কোনো পৃষ্ঠা PDF-এ যুক্ত করা যায়নি।');
  }

  pdf.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}

export async function exportElementToPdf(
  targetElement: HTMLElement,
  options: DomPdfExportOptions
): Promise<void> {
  if (!targetElement || !targetElement.isConnected) {
    throw new Error('PDF তৈরির জন্য ডকুমেন্ট এলিমেন্টটি এখনো DOM-এ প্রস্তুত নয়।');
  }

  const marginTuple = normalizeMargin(options.margin ?? [10, 10, 10, 10]);
  const scale = options.scale ?? 2;
  const captureWidthPx = options.captureWidthPx ?? DEFAULT_A4_WIDTH_PX;

  options.onProgress?.(1, 1);
  const canvas = await captureElementCanvas(targetElement, scale, captureWidthPx);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const added = addCanvasPaginatedToPdf(pdf, canvas, marginTuple, true);
  if (!added) {
    throw new Error('PDF পৃষ্ঠা তৈরি খালি এসেছে।');
  }

  pdf.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}
