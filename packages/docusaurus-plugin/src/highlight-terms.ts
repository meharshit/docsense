/**
 * Pure helpers for destination-page term highlighting.
 * DOM wrapping lives in the client module; this file is unit-tested.
 */

import { stemEnglish, tokenize } from '@docsense/core';

export const HIGHLIGHT_STORAGE_KEY = 'docsense:pendingHighlight';

export interface PendingHighlight {
  readonly query: string;
  readonly href: string;
  readonly createdAt: number;
}

/** Keep pending highlight fresh for a short navigation window. */
export const HIGHLIGHT_TTL_MS = 2 * 60 * 1000;

export function buildPendingHighlight(query: string, href: string): PendingHighlight {
  return {
    query: query.trim(),
    href,
    createdAt: Date.now(),
  };
}

export function parsePendingHighlight(raw: string | null): PendingHighlight | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PendingHighlight;
    if (!parsed?.query || !parsed?.href || typeof parsed.createdAt !== 'number') {
      return null;
    }
    if (Date.now() - parsed.createdAt > HIGHLIGHT_TTL_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Surface query tokens used as the highlight vocabulary.
 * Stems are compared in shouldHighlightWord — never injected as mark text.
 */
export function highlightTermsFromQuery(query: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of tokenize(query)) {
    if (token.length < 2 || seen.has(token)) {
      continue;
    }
    seen.add(token);
    out.push(token);
  }
  return out.sort((a, b) => b.length - a.length);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True when an on-page word should be marked for the query terms.
 * Exact match or shared English stem — always marks the full word, never a stem fragment.
 */
export function shouldHighlightWord(
  word: string,
  queryTerms: readonly string[],
): boolean {
  const cleaned = word.toLowerCase().replace(/[^a-z0-9_+./#]+/g, '');
  if (cleaned.length < 2 || queryTerms.length === 0) {
    return false;
  }
  const wordStem = stemEnglish(cleaned);
  for (const term of queryTerms) {
    if (cleaned === term) {
      return true;
    }
    if (stemEnglish(term) === wordStem) {
      return true;
    }
  }
  return false;
}

/**
 * Split a text node value into markable runs: either a whole word or plain text.
 */
export function splitTextForHighlight(
  text: string,
  queryTerms: readonly string[],
): Array<{ readonly text: string; readonly highlight: boolean }> {
  if (!text || queryTerms.length === 0) {
    return [{ text, highlight: false }];
  }
  const parts: Array<{ text: string; highlight: boolean }> = [];
  const re = /[A-Za-z0-9_+./#-]+|[^A-Za-z0-9_+./#-]+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const chunk = match[0]!;
    const isWord = /[A-Za-z0-9]/.test(chunk);
    parts.push({
      text: chunk,
      highlight: isWord && shouldHighlightWord(chunk, queryTerms),
    });
  }
  return parts.length > 0 ? parts : [{ text, highlight: false }];
}

/** @deprecated Prefer splitTextForHighlight — kept for older tests/callers. */
export function buildHighlightRegex(terms: readonly string[]): RegExp | null {
  const usable = terms.filter((t) => t.length >= 2);
  if (usable.length === 0) {
    return null;
  }
  const body = usable.map((t) => `\\b${escapeRegExp(t)}\\b`).join('|');
  return new RegExp(`(${body})`, 'gi');
}

/** True when this location should consume the pending highlight payload. */
export function locationMatchesPending(
  pending: PendingHighlight,
  currentHref: string,
): boolean {
  try {
    const pendingUrl = new URL(pending.href, 'https://docsense.local');
    const currentUrl = new URL(currentHref, 'https://docsense.local');
    return (
      pendingUrl.pathname.replace(/\/$/, '') === currentUrl.pathname.replace(/\/$/, '')
    );
  } catch {
    return currentHref.includes(pending.href) || pending.href.includes(currentHref);
  }
}
