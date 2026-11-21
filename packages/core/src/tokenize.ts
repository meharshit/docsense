import { stemEnglish } from './stem';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'was',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you',
  'your',
]);

export type FuzzyMatchKind = 'exact' | 'prefix' | 'stem' | 'fuzzy1' | 'fuzzy2' | 'none';

/** Split text into searchable tokens (lowercase, punctuation stripped). */
export function tokenize(input: string): string[] {
  if (!input) {
    return [];
  }

  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Hyphens are separators so "pre-recorded" → pre, recorded.
    .split(/[^a-z0-9_+./#]+/g)
    .map((token) => token.replace(/^[./#]+|[./#]+$/g, ''))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Tokens used for matching/ranking: original surface form plus English stem
 * so "installing" can match "install" without a separate index field.
 */
export function tokenizeForMatch(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of tokenize(input)) {
    for (const form of [token, stemEnglish(token)]) {
      if (!seen.has(form)) {
        seen.add(form);
        out.push(form);
      }
    }
  }
  return out;
}

/** Unique tokens preserving first-seen order. */
export function uniqueTokens(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of tokenize(input)) {
    if (!seen.has(token)) {
      seen.add(token);
      out.push(token);
    }
  }
  return out;
}

/**
 * Allowed edit distance grows with token length:
 * - exact / prefix handled separately
 * - length ≥ 4 → distance 1
 * - length ≥ 7 → distance 2
 */
export function maxFuzzyDistance(tokenLength: number): number {
  if (tokenLength >= 7) {
    return 2;
  }
  if (tokenLength >= 4) {
    return 1;
  }
  return 0;
}

/** Score multiplier for how close the token match is. */
export function fuzzyMatchWeight(kind: FuzzyMatchKind): number {
  switch (kind) {
    case 'exact':
      return 1;
    case 'stem':
      return 0.88;
    case 'prefix':
      return 0.7;
    case 'fuzzy1':
      return 0.45;
    case 'fuzzy2':
      return 0.25;
    default:
      return 0;
  }
}

/**
 * Classify how a query token matches a candidate token.
 * Case is already normalized by tokenize().
 */
export function classifyTokenMatch(
  queryToken: string,
  candidateToken: string,
): FuzzyMatchKind {
  if (queryToken === candidateToken) {
    return 'exact';
  }

  const qStem = stemEnglish(queryToken);
  const cStem = stemEnglish(candidateToken);
  if (qStem === cStem || qStem === candidateToken || queryToken === cStem) {
    return 'stem';
  }

  if (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken)) {
    // Avoid weak short prefixes like "a" → already filtered by tokenize length.
    if (Math.min(queryToken.length, candidateToken.length) >= 3) {
      return 'prefix';
    }
  }

  const allowed = Math.min(
    maxFuzzyDistance(queryToken.length),
    maxFuzzyDistance(candidateToken.length),
  );
  if (allowed <= 0) {
    return 'none';
  }

  const distance = damerauLevenshtein(queryToken, candidateToken, allowed);
  if (distance === null) {
    return 'none';
  }
  if (distance === 1) {
    return 'fuzzy1';
  }
  if (distance === 2) {
    return 'fuzzy2';
  }
  return 'none';
}

/** True when tokens match within the adaptive fuzzy edit-distance budget. */
export function tokensFuzzyMatch(queryToken: string, candidateToken: string): boolean {
  const kind = classifyTokenMatch(queryToken, candidateToken);
  return kind === 'fuzzy1' || kind === 'fuzzy2';
}

/**
 * Damerau-Levenshtein with early exit when distance would exceed `maxDistance`.
 * Returns null when over budget.
 */
export function damerauLevenshtein(
  a: string,
  b: string,
  maxDistance: number,
): number | null {
  if (a === b) {
    return 0;
  }
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDistance) {
    return null;
  }

  // Two-row DP with transposition support.
  const INF = maxDistance + 1;
  let prev = new Array<number>(lb + 1);
  let curr = new Array<number>(lb + 1);
  let prevPrev: number[] | null = null;

  for (let j = 0; j <= lb; j += 1) {
    prev[j] = j;
  }

  for (let i = 1; i <= la; i += 1) {
    curr[0] = i;
    let rowMin = curr[0]!;
    for (let j = 1; j <= lb; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(
        (prev[j] ?? INF) + 1,
        (curr[j - 1] ?? INF) + 1,
        (prev[j - 1] ?? INF) + cost,
      );

      // Transposition of adjacent characters.
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1] &&
        prevPrev
      ) {
        val = Math.min(val, (prevPrev[j - 2] ?? INF) + 1);
      }
      curr[j] = val;
      rowMin = Math.min(rowMin, val);
    }
    if (rowMin > maxDistance) {
      return null;
    }
    prevPrev = prev;
    prev = curr;
    curr = new Array<number>(lb + 1);
  }

  const distance = prev[lb] ?? INF;
  return distance <= maxDistance ? distance : null;
}
