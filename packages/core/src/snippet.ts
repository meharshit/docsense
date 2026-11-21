import { tokenize } from './tokenize';

/** Build a short snippet around the first matched query token. */
export function buildSnippet(text: string, query: string, radius = 48): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }

  const tokens = tokenize(query);
  const lower = cleaned.toLowerCase();
  let bestIndex = -1;

  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
      bestIndex = idx;
    }
  }

  if (bestIndex === -1) {
    return cleaned.length > radius * 2 ? `${cleaned.slice(0, radius * 2)}…` : cleaned;
  }

  const start = Math.max(0, bestIndex - radius);
  const end = Math.min(cleaned.length, bestIndex + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < cleaned.length ? '…' : '';
  return `${prefix}${cleaned.slice(start, end)}${suffix}`;
}
