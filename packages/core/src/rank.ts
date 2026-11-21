import {
  classifyTokenMatch,
  fuzzyMatchWeight,
  tokenize,
  uniqueTokens,
  type FuzzyMatchKind,
} from './tokenize';

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

function bestKindAgainstField(
  queryToken: string,
  fieldTokens: readonly string[],
): FuzzyMatchKind {
  let best: FuzzyMatchKind = 'none';
  const rank: Record<FuzzyMatchKind, number> = {
    exact: 5,
    stem: 4,
    prefix: 3,
    fuzzy1: 2,
    fuzzy2: 1,
    none: 0,
  };

  for (const ft of fieldTokens) {
    const kind = classifyTokenMatch(queryToken, ft);
    if (rank[kind] > rank[best]) {
      best = kind;
      if (best === 'exact') {
        break;
      }
    }
  }
  return best;
}

function fieldTokenKinds(
  fieldText: string,
  queryTokens: readonly string[],
): FuzzyMatchKind[] {
  if (!fieldText || queryTokens.length === 0) {
    return queryTokens.map(() => 'none' as const);
  }
  const fieldTokens = tokenize(fieldText);
  if (fieldTokens.length === 0) {
    return queryTokens.map(() => 'none' as const);
  }
  return queryTokens.map((qt) => bestKindAgainstField(qt, fieldTokens));
}

function bestKind(a: FuzzyMatchKind, b: FuzzyMatchKind): FuzzyMatchKind {
  const rank: Record<FuzzyMatchKind, number> = {
    exact: 5,
    stem: 4,
    prefix: 3,
    fuzzy1: 2,
    fuzzy2: 1,
    none: 0,
  };
  return rank[a] >= rank[b] ? a : b;
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

  const titleKinds = fieldTokenKinds(input.title, queryTokens);
  const sectionKinds = fieldTokenKinds(input.sectionTitle ?? '', queryTokens);
  const bodyKinds = fieldTokenKinds(input.body, queryTokens);
  const codeKinds = fieldTokenKinds((input.code ?? []).join('\n'), queryTokens);
  const crumbKinds = fieldTokenKinds((input.breadcrumbs ?? []).join(' '), queryTokens);

  let score = 0;
  let matchedTokens = 0;

  for (let i = 0; i < queryTokens.length; i += 1) {
    const kind = [
      titleKinds[i]!,
      sectionKinds[i]!,
      bodyKinds[i]!,
      codeKinds[i]!,
      crumbKinds[i]!,
    ].reduce(bestKind);

    const factor = fuzzyMatchWeight(kind);
    if (factor <= 0) {
      continue;
    }
    matchedTokens += 1;

    // Weight by best field that produced this kind (prefer title > section > code > crumbs > body).
    const fieldWeightsForToken = [
      { kind: titleKinds[i]!, weight: weights.title },
      { kind: sectionKinds[i]!, weight: weights.sectionTitle },
      { kind: codeKinds[i]!, weight: weights.code },
      { kind: crumbKinds[i]!, weight: weights.breadcrumb },
      { kind: bodyKinds[i]!, weight: weights.body },
    ];
    const bestField = fieldWeightsForToken
      .filter((f) => f.kind === kind)
      .sort((a, b) => b.weight - a.weight)[0];
    score += (bestField?.weight ?? weights.body) * factor;
  }

  if (matchedTokens === 0) {
    return { score: 0, matchedTokens: 0, exactTitle: false };
  }

  const coverage = matchedTokens / queryTokens.length;
  score *= 0.65 + 0.35 * coverage;

  const titleTokens = new Set(tokenize(input.title));
  const exactTitle = queryTokens.every((t) => titleTokens.has(t));
  if (exactTitle) {
    score *= 1.25;
  }

  return { score, matchedTokens, exactTitle };
}
