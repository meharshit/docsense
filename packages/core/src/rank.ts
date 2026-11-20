import { tokenize, tokensFuzzyMatch, uniqueTokens } from './tokenize.js';

export interface FieldWeights {
  readonly title: number;
  readonly sectionTitle: number;
  readonly body: number;
  readonly code: number;
  readonly breadcrumb: number;
}

export const DEFAULT_WEIGHTS: FieldWeights = {
  title: 12,
  sectionTitle: 8,
  body: 2,
  code: 5,
  breadcrumb: 3,
};

export interface RankedMatch {
  readonly score: number;
  readonly matchedTokens: number;
  readonly exactTitle: boolean;
}

function fieldScore(
  fieldText: string,
  queryTokens: readonly string[],
  weight: number,
): { score: number; matched: number } {
  if (!fieldText || queryTokens.length === 0) {
    return { score: 0, matched: 0 };
  }

  const fieldTokens = tokenize(fieldText);
  if (fieldTokens.length === 0) {
    return { score: 0, matched: 0 };
  }

  const fieldSet = new Set(fieldTokens);
  let matched = 0;
  let score = 0;

  for (const qt of queryTokens) {
    if (fieldSet.has(qt)) {
      matched += 1;
      score += weight;
      // Phrase / density bonus: more occurrences help a bit.
      const occurrences = fieldTokens.filter((t) => t === qt).length;
      score += Math.min(occurrences - 1, 3) * (weight * 0.15);
      continue;
    }

    // Prefix match (API-ish): "upload" matches "uploadurl"
    const prefixHit = fieldTokens.some((ft) => ft.startsWith(qt) || qt.startsWith(ft));
    if (prefixHit) {
      matched += 1;
      score += weight * 0.6;
      continue;
    }

    const fuzzyHit = fieldTokens.some((ft) => tokensFuzzyMatch(qt, ft));
    if (fuzzyHit) {
      matched += 1;
      score += weight * 0.35;
    }
  }

  return { score, matched };
}

export function scoreDocumentFields(input: {
  readonly title: string;
  readonly sectionTitle?: string;
  readonly body: string;
  readonly code?: readonly string[];
  readonly breadcrumbs?: readonly string[];
  readonly query: string;
  readonly weights?: FieldWeights;
}): RankedMatch {
  const weights = input.weights ?? DEFAULT_WEIGHTS;
  const queryTokens = uniqueTokens(input.query);
  if (queryTokens.length === 0) {
    return { score: 0, matchedTokens: 0, exactTitle: false };
  }

  const title = fieldScore(input.title, queryTokens, weights.title);
  const section = fieldScore(input.sectionTitle ?? '', queryTokens, weights.sectionTitle);
  const body = fieldScore(input.body, queryTokens, weights.body);
  const code = fieldScore((input.code ?? []).join('\n'), queryTokens, weights.code);
  const crumbs = fieldScore((input.breadcrumbs ?? []).join(' '), queryTokens, weights.breadcrumb);

  const matchedTokens = Math.max(
    title.matched,
    section.matched,
    body.matched,
    code.matched,
    crumbs.matched,
  );

  let score = title.score + section.score + body.score + code.score + crumbs.score;

  // Coverage: prefer hits that match more of the query.
  const coverage = matchedTokens / queryTokens.length;
  score *= 0.65 + 0.35 * coverage;

  const titleTokens = new Set(tokenize(input.title));
  const exactTitle =
    queryTokens.length > 0 && queryTokens.every((t) => titleTokens.has(t));
  if (exactTitle) {
    score *= 1.25;
  }

  return { score, matchedTokens, exactTitle };
}
