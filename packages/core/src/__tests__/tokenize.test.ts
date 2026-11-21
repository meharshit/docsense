import { describe, expect, it } from 'vitest';
import {
  classifyTokenMatch,
  damerauLevenshtein,
  maxFuzzyDistance,
  tokenize,
  tokensFuzzyMatch,
  uniqueTokens,
} from '../tokenize';

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    expect(tokenize('Upload Pre-Recorded Audio!')).toEqual([
      'upload',
      'pre',
      'recorded',
      'audio',
    ]);
  });

  it('keeps api-ish tokens with slashes and hashes lightly cleaned', () => {
    const tokens = tokenize('POST /v1/sessions#create');
    expect(tokens.some((t) => t.includes('v1/sessions'))).toBe(true);
    expect(tokens).toContain('post');
  });

  it('drops stop words and single-char noise', () => {
    expect(tokenize('how to use the API')).toEqual(['use', 'api']);
  });

  it('returns unique tokens in order', () => {
    expect(uniqueTokens('audio audio upload audio')).toEqual(['audio', 'upload']);
  });
});

describe('typo tolerance depth', () => {
  it('allows distance 1 for medium tokens and distance 2 for longer ones', () => {
    expect(maxFuzzyDistance(3)).toBe(0);
    expect(maxFuzzyDistance(5)).toBe(1);
    expect(maxFuzzyDistance(8)).toBe(2);
  });

  it('classifies exact, prefix, and fuzzy matches', () => {
    expect(classifyTokenMatch('upload', 'upload')).toBe('exact');
    expect(classifyTokenMatch('upload', 'uploadurl')).toBe('prefix');
    expect(classifyTokenMatch('uplaod', 'upload')).toBe('fuzzy1');
    expect(classifyTokenMatch('recieved', 'received')).toBe('fuzzy1');
    // transposition counts as one edit
    expect(classifyTokenMatch('documnetation', 'documentation')).toBe('fuzzy1');
    // two substitutions on a longer token
    expect(classifyTokenMatch('dokumantation', 'documentation')).toBe('fuzzy2');
  });

  it('matches common typos via tokensFuzzyMatch', () => {
    expect(tokensFuzzyMatch('sesion', 'session')).toBe(true);
    expect(tokensFuzzyMatch('upload', 'uplaod')).toBe(true);
    expect(tokensFuzzyMatch('recording', 'streaming')).toBe(false);
  });

  it('computes damerau-levenshtein with early exit', () => {
    expect(damerauLevenshtein('ca', 'abc', 1)).toBeNull();
    expect(damerauLevenshtein('ab', 'ba', 1)).toBe(1);
    expect(damerauLevenshtein('kitten', 'sitting', 2)).toBeNull();
    expect(damerauLevenshtein('kitten', 'sitten', 1)).toBe(1);
  });
});
