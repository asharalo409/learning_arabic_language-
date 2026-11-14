import { VocabItem } from '../types/academy';

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanTsvField(html: string): string {
  return html.replace(/[\t\r\n]+/g, ' ').trim();
}

function triggerBlobDownload(content: string, mimeType: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Generates an Anki-compatible UTF-8 TSV (.txt) file ready for one-click import
 * in Anki Desktop & AnkiDroid (#separator:tab, #html:true, #tags column:3).
 */
export function exportVocabToAnkiTsv(items: VocabItem[], scopeSlug = 'learned'): number {
  if (!items || items.length === 0) return 0;

  const lines: string[] = [
    '#separator:tab',
    '#html:true',
    '#tags column:3',
  ];

  for (const w of items) {
    const front = cleanTsvField(
      `<div dir="rtl" style="font-size:28px;font-weight:bold;color:#059669;line-height:1.8">${escapeHtml(w.arabic)}</div>` +
        `<div style="font-size:13px;color:#64748b;margin-top:6px">${escapeHtml(w.pronunciationBn)}${
          w.root ? ` · ${escapeHtml(w.root)}` : ''
        }</div>`
    );

    const back = cleanTsvField(
      `<div style="font-size:20px;font-weight:bold;color:#0f172a">${escapeHtml(w.meaningBn)}</div>` +
        `<div style="font-size:13px;color:#475569;margin-top:2px">${escapeHtml(w.meaningEn)}</div>` +
        `<hr style="margin:10px 0;border:none;border-top:1px solid #e2e8f0"/>` +
        `<div dir="rtl" style="font-size:18px;color:#0f172a;line-height:1.8">${escapeHtml(w.exampleAr)}</div>` +
        `<div style="font-size:13px;color:#334155;margin-top:4px">${escapeHtml(w.exampleBn)}</div>`
    );

    const catTag = (w.category || 'arabic')
      .replace(/[^\p{L}\p{N}_-]+/gu, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 28);
    const tags = [
      'ai_arabic_academy',
      `level_${w.level || 1}`,
      w.chapterNumber ? `chapter_${w.chapterNumber}` : null,
      catTag || null,
    ]
      .filter(Boolean)
      .join(' ');

    lines.push(`${front}\t${back}\t${tags}`);
  }

  const dateTag = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(
    lines.join('\n'),
    'text/tab-separated-values;charset=utf-8',
    `ai-arabic-academy-anki-${scopeSlug}-${dateTag}.txt`
  );
  return items.length;
}

function buildPrintableVocabularyHtml(items: VocabItem[], titleBn: string): string {
  const dateLabel = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rowsHtml = items
    .slice(0, 800)
    .map(
      (w, idx) => `
      <article class="card">
        <div class="card-top">
          <span class="idx">#${String(idx + 1).padStart(2, '0')} · ${
            w.chapterNumber ? `অধ্যায় ${w.chapterNumber}` : `স্তর ${w.level || 1}`
          }</span>
          <span class="cat">${escapeHtml(w.category)}</span>
        </div>
        <div class="arabic" dir="rtl">${escapeHtml(w.arabic)}</div>
        <div class="pron">উচ্চারণ: <strong>${escapeHtml(w.pronunciationBn)}</strong></div>
        <div class="meaning">${escapeHtml(w.meaningBn)} <span class="en">(${escapeHtml(w.meaningEn)})</span></div>
        ${w.root ? `<div class="root">মূল/সূত্র: ${escapeHtml(w.root)}</div>` : ''}
        <div class="ex">
          <div class="ex-ar" dir="rtl">${escapeHtml(w.exampleAr)}</div>
          <div class="ex-bn">${escapeHtml(w.exampleBn)}</div>
        </div>
      </article>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(titleBn)} — AI Arabic Academy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Hind Siliguri', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
    }
    .doc-header {
      border-bottom: 2px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
    }
    .doc-title { font-size: 20px; font-weight: 700; color: #065f46; margin: 0; }
    .doc-sub { font-size: 12px; color: #475569; margin-top: 3px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      break-inside: avoid;
      page-break-inside: avoid;
      background: #f8fafc;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .idx { font-weight: 700; color: #059669; }
    .arabic {
      font-family: 'Amiri', 'Noto Naskh Arabic', serif;
      font-size: 24px;
      font-weight: 700;
      color: #065f46;
      line-height: 1.75;
    }
    .pron { font-size: 11.5px; color: #475569; margin-top: 2px; }
    .meaning { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .en { font-weight: 400; font-size: 11.5px; color: #475569; }
    .root { font-size: 11px; color: #334155; margin-top: 3px; }
    .ex {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
    }
    .ex-ar {
      font-family: 'Amiri', 'Noto Naskh Arabic', serif;
      font-size: 16px;
      color: #1e293b;
      line-height: 1.7;
    }
    .ex-bn { font-size: 11.5px; color: #334155; margin-top: 2px; }
    @media print {
      body { padding: 0; }
      .card { background: #ffffff; }
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <div>
      <h1 class="doc-title">${escapeHtml(titleBn)}</h1>
      <div class="doc-sub">AI Arabic Academy · মোট শব্দ: ${items.length}টি · তারিখ: ${escapeHtml(dateLabel)}</div>
    </div>
    <div class="doc-sub">অফলাইন ও প্রিন্ট স্টাডি শীট</div>
  </header>
  <main class="grid">
    ${rowsHtml}
  </main>
</body>
</html>`;
}

/**
 * Triggers native browser Print-to-PDF via a hidden iframe (no window.open / window.alert),
 * ensuring crisp RTL Arabic Harakat + Bengali ligatures across A4 PDF pages.
 */
export function exportVocabToPrintablePdf(items: VocabItem[], titleBn: string): boolean {
  if (!items || items.length === 0 || typeof document === 'undefined') return false;

  const html = buildPrintableVocabularyHtml(items, titleBn);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');

  iframe.onload = () => {
    window.setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // fallback handled if needed
      }
      window.setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 60000);
    }, 350);
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  return true;
}

/**
 * Downloads a standalone offline HTML flashcard/printable sheet (ideal for mobile browsers).
 */
export function exportVocabToPrintableHtml(items: VocabItem[], titleBn: string, scopeSlug = 'learned'): number {
  if (!items || items.length === 0) return 0;
  const html = buildPrintableVocabularyHtml(items, titleBn);
  const dateTag = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(
    html,
    'text/html;charset=utf-8',
    `ai-arabic-academy-vocab-${scopeSlug}-${dateTag}.html`
  );
  return items.length;
}
