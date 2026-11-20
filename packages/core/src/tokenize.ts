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

/** Simple fuzzy: edit distance ≤ 1 for tokens longer than 3 chars. */
export function tokensFuzzyMatch(queryToken: string, candidateToken: string): boolean {
  if (queryToken === candidateToken) {
    return true;
  }
  if (queryToken.length < 4 || candidateToken.length < 4) {
    return false;
  }
  if (Math.abs(queryToken.length - candidateToken.length) > 1) {
    return false;
  }
  return levenshteinAtMostOne(queryToken, candidateToken);
}

/** True when Damerau-Levenshtein distance is at most 1 (insert/delete/substitute/transpose). */
function levenshteinAtMostOne(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) {
    return false;
  }

  // Same length: one substitute or one adjacent transpose.
  if (la === lb) {
    let diff = 0;
    let first = -1;
    for (let i = 0; i < la; i += 1) {
      if (a[i] !== b[i]) {
        diff += 1;
        if (diff === 1) {
          first = i;
        } else if (diff === 2) {
          return (
            first >= 0 &&
            i === first + 1 &&
            a[first] === b[i] &&
            a[i] === b[first]
          );
        } else {
          return false;
        }
      }
    }
    return diff === 1;
  }

  // Length differs by 1: one insert/delete.
  const shorter = la < lb ? a : b;
  const longer = la < lb ? b : a;
  let si = 0;
  let li = 0;
  let skipped = false;
  while (si < shorter.length && li < longer.length) {
    if (shorter[si] === longer[li]) {
      si += 1;
      li += 1;
      continue;
    }
    if (skipped) {
      return false;
    }
    skipped = true;
    li += 1;
  }
  return true;
}
