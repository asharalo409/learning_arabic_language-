import {
  FormattedPdfDocument,
  FormattedPdfItem,
  FormattedPdfSection,
  PaginatedPdfPage,
} from '../types/academy';

function getLayoutWeightMultiplier(layout: FormattedPdfSection['layout']): number {
  switch (layout) {
    case 'grid-3':
      return 0.44;
    case 'flow':
      return 0.38;
    case 'cards':
      return 0.58;
    case 'table':
      return 0.72;
    case 'quotes':
      return 0.85;
    case 'prose':
    default:
      return 1;
  }
}

function estimateRawItemChars(item: FormattedPdfItem): number {
  return (
    (item.badgeNumber?.length || 0) +
    (item.badge?.length || 0) +
    (item.labelAr?.length || 0) +
    (item.labelBn?.length || 0) +
    (item.arabic?.length || 0) +
    (item.bengali?.length || 0) +
    (item.reference?.length || 0)
  );
}

function estimateItemChars(
  item: FormattedPdfItem,
  layout: FormattedPdfSection['layout'] = 'prose'
): number {
  const raw = estimateRawItemChars(item) + 24;
  return Math.max(36, Math.round(raw * getLayoutWeightMultiplier(layout)));
}

function estimateSectionHeaderChars(section: FormattedPdfSection): number {
  if (!section.headingAr && !section.headingBn && !section.introBn) return 0;
  return (
    (section.headingAr?.length || 0) +
    (section.headingBn?.length || 0) +
    (section.introBn?.length || 0) +
    48
  );
}

function splitTextIntoParts(text: string, maxLen: number): string[] {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length <= maxLen) return trimmed ? [trimmed] : [];
  const sentences = trimmed.split(/(?<=[।.!؟\n])\s+/);
  const parts: string[] = [];
  let buf = '';

  for (const s of sentences) {
    if (!s) continue;
    if (buf.length + s.length + 1 <= maxLen) {
      buf = buf ? `${buf} ${s}` : s;
    } else {
      if (buf) parts.push(buf);
      if (s.length <= maxLen) {
        buf = s;
      } else {
        let cursor = 0;
        while (cursor < s.length) {
          parts.push(s.slice(cursor, cursor + maxLen));
          cursor += maxLen;
        }
        buf = '';
      }
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

function normalizeAtomicItems(
  sections: FormattedPdfSection[],
  effectiveCharsPerPage: number
): FormattedPdfSection[] {
  const maxSingleItemChars = Math.max(420, Math.floor(effectiveCharsPerPage * 0.82));
  return sections.map((sec) => {
    const expanded: FormattedPdfItem[] = [];
    for (const item of sec.items || []) {
      const size = estimateItemChars(item, sec.layout);
      if (size <= maxSingleItemChars) {
        expanded.push(item);
        continue;
      }
      const arParts = splitTextIntoParts(
        item.arabic || '',
        Math.floor(maxSingleItemChars * 0.5)
      );
      const bnParts = splitTextIntoParts(
        item.bengali || '',
        Math.floor(maxSingleItemChars * 0.5)
      );
      const totalParts = Math.max(1, arParts.length, bnParts.length);
      for (let i = 0; i < totalParts; i++) {
        expanded.push({
          ...item,
          badgeNumber: i === 0 ? item.badgeNumber : undefined,
          labelAr: i === 0 ? item.labelAr : undefined,
          labelBn: i === 0 ? item.labelBn : undefined,
          arabic: arParts[i] || '',
          bengali: bnParts[i] || '',
          reference: i === totalParts - 1 ? item.reference : undefined,
        });
      }
    }
    return { ...sec, items: expanded };
  });
}

export function paginatePdfDocument(
  doc: FormattedPdfDocument,
  requestedCharsPerPage = 1800,
  maxPagesLimit = 100
): { pages: PaginatedPdfPage[]; effectiveCharsPerPage: number; totalDocChars: number } {
  const safeMaxPages = Math.max(1, Math.min(100, Math.round(maxPagesLimit) || 100));
  const baseCharsPerPage = Math.max(
    500,
    Math.min(5500, Math.round(requestedCharsPerPage) || 1800)
  );

  const bannerReserve = Math.min(
    Math.floor(baseCharsPerPage * 0.18),
    (doc.titleAr?.length || 0) +
      (doc.titleBn?.length || 0) +
      (doc.subtitleBn?.length || 0) +
      95
  );

  // Measure total weighted doc size first so ZERO content is omitted if it needs >safeMaxPages
  let totalDocChars = bannerReserve;
  for (const sec of doc.sections || []) {
    totalDocChars += estimateSectionHeaderChars(sec);
    for (const item of sec.items || []) {
      totalDocChars += estimateItemChars(item, sec.layout);
    }
  }

  const minRequiredPerPage = Math.ceil((totalDocChars * 1.1) / safeMaxPages);
  const effectiveCharsPerPage = Math.max(baseCharsPerPage, minRequiredPerPage);
  const firstPageReserve = Math.min(Math.floor(effectiveCharsPerPage * 0.18), bannerReserve);

  const normalizedSections = normalizeAtomicItems(doc.sections || [], effectiveCharsPerPage);

  const pages: PaginatedPdfPage[] = [];
  let currentSections: FormattedPdfSection[] = [];
  let currentChars = firstPageReserve;

  const flushPage = () => {
    if (currentSections.length === 0 && pages.length > 0) return;
    pages.push({
      pageNumber: pages.length + 1,
      totalPages: 1,
      showHeaderBanner: pages.length === 0,
      sections: currentSections,
    });
    currentSections = [];
    currentChars = 0;
  };

  for (let sIdx = 0; sIdx < normalizedSections.length; sIdx++) {
    const sec = normalizedSections[sIdx];
    const headerCost = estimateSectionHeaderChars(sec);
    const items = sec.items || [];

    if (items.length === 0) {
      if (
        currentChars + headerCost > effectiveCharsPerPage &&
        currentSections.length > 0 &&
        pages.length + 1 < safeMaxPages
      ) {
        flushPage();
      }
      currentSections.push({ ...sec, items: [] });
      currentChars += headerCost;
      continue;
    }

    let secHeaderPending = true;
    let bucketItems: FormattedPdfItem[] = [];

    const pushBucketToPage = () => {
      if (bucketItems.length === 0) return;
      currentSections.push({
        id: sec.id ? `${sec.id}-p${pages.length + 1}` : `sec-${sIdx}-p${pages.length + 1}`,
        headingAr: secHeaderPending ? sec.headingAr : undefined,
        headingBn: secHeaderPending ? sec.headingBn : undefined,
        introBn: secHeaderPending ? sec.introBn : undefined,
        layout: sec.layout,
        accentTheme: sec.accentTheme,
        items: bucketItems,
      });
      secHeaderPending = false;
      bucketItems = [];
    };

    for (let iIdx = 0; iIdx < items.length; iIdx++) {
      const item = items[iIdx];
      const itemCost =
        estimateItemChars(item, sec.layout) +
        (secHeaderPending && bucketItems.length === 0 ? headerCost : 0);

      if (
        currentChars + itemCost > effectiveCharsPerPage &&
        (currentSections.length > 0 || bucketItems.length > 0) &&
        pages.length + 1 < safeMaxPages
      ) {
        pushBucketToPage();
        flushPage();
      }

      const actualCost =
        estimateItemChars(item, sec.layout) +
        (secHeaderPending && bucketItems.length === 0 ? headerCost : 0);
      bucketItems.push(item);
      currentChars += actualCost;
    }

    pushBucketToPage();
  }

  if (currentSections.length > 0 || pages.length === 0) {
    flushPage();
  }

  const totalPages = pages.length;
  const finalized = pages.map((p, idx) => ({
    ...p,
    pageNumber: idx + 1,
    totalPages,
  }));

  return {
    pages: finalized,
    effectiveCharsPerPage,
    totalDocChars,
  };
}
