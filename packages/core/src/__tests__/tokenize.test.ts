import { describe, expect, it } from 'vitest';
import { tokenize, tokensFuzzyMatch, uniqueTokens } from '../tokenize.js';

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

describe('tokensFuzzyMatch', () => {
  it('matches exact tokens', () => {
    expect(tokensFuzzyMatch('session', 'session')).toBe(true);
  });

  it('allows one edit for longer tokens', () => {
    expect(tokensFuzzyMatch('sesion', 'session')).toBe(true);
    expect(tokensFuzzyMatch('upload', 'uplaod')).toBe(true);
  });

  it('rejects short or distant tokens', () => {
    expect(tokensFuzzyMatch('api', 'app')).toBe(false);
    expect(tokensFuzzyMatch('recording', 'streaming')).toBe(false);
  });
});
