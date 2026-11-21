/**
 * Compact Porter stemmer (English) for documentation search.
 * Applied after tokenization so "installing" and "install" share a stem.
 * Tokens that look like API paths / identifiers are left unchanged.
 */

const VOWEL = /[aeiouy]/;
const CONSONANT = /[^aeiou]/;
const MGR0 = /^([^aeiou][^aeiouy]*)?[aeiouy].*$/;
const MEQ1 = /^([^aeiou][^aeiouy]*)?[aeiouy][^aeiouy]*$/;
const MGR1 = /^([^aeiou][^aeiouy]*)?[aeiouy][^aeiouy]*([aeiouy][^aeiou]*)+$/;
const VOWEL_IN_STEM = /[aeiouy]/;

function hasVowel(s: string): boolean {
  return VOWEL_IN_STEM.test(s);
}

function endsWithDoubleConsonant(s: string): boolean {
  if (s.length < 2) {
    return false;
  }
  const a = s[s.length - 1]!;
  const b = s[s.length - 2]!;
  return a === b && CONSONANT.test(a) && a !== 'l' && a !== 's' && a !== 'z';
}

function cvc(s: string): boolean {
  if (s.length < 3) {
    return false;
  }
  const a = s[s.length - 1]!;
  const b = s[s.length - 2]!;
  const c = s[s.length - 3]!;
  if (VOWEL.test(a) || a === 'w' || a === 'x' || a === 'y') {
    return false;
  }
  if (!VOWEL.test(b)) {
    return false;
  }
  return CONSONANT.test(c) || c === 'y';
}

function step1a(w: string): string {
  if (w.endsWith('sses')) {
    return `${w.slice(0, -2)}`;
  }
  if (w.endsWith('ies')) {
    return `${w.slice(0, -2)}`;
  }
  if (w.endsWith('ss')) {
    return w;
  }
  if (w.endsWith('s') && w.length > 3) {
    return w.slice(0, -1);
  }
  return w;
}

function step1b(w: string): string {
  if (w.endsWith('eed')) {
    const stem = w.slice(0, -3);
    return MGR0.test(stem) ? `${stem}ee` : w;
  }

  let stem: string | null = null;
  if (w.endsWith('ed') && hasVowel(w.slice(0, -2))) {
    stem = w.slice(0, -2);
  } else if (w.endsWith('ing') && hasVowel(w.slice(0, -3))) {
    stem = w.slice(0, -3);
  }
  if (stem === null) {
    return w;
  }

  if (stem.endsWith('at') || stem.endsWith('bl') || stem.endsWith('iz')) {
    return `${stem}e`;
  }
  if (endsWithDoubleConsonant(stem)) {
    return stem.slice(0, -1);
  }
  if (MEQ1.test(stem) && cvc(stem)) {
    return `${stem}e`;
  }
  return stem;
}

function step1c(w: string): string {
  if (w.endsWith('y') && hasVowel(w.slice(0, -1))) {
    return `${w.slice(0, -1)}i`;
  }
  return w;
}

function replaceSuffix(
  w: string,
  rules: ReadonlyArray<readonly [string, string]>,
  measure: RegExp,
): string {
  for (const [suffix, repl] of rules) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure.test(stem)) {
        return `${stem}${repl}`;
      }
      return w;
    }
  }
  return w;
}

function step2(w: string): string {
  return replaceSuffix(
    w,
    [
      ['ational', 'ate'],
      ['tional', 'tion'],
      ['enci', 'ence'],
      ['anci', 'ance'],
      ['izer', 'ize'],
      ['abli', 'able'],
      ['alli', 'al'],
      ['entli', 'ent'],
      ['eli', 'e'],
      ['ousli', 'ous'],
      ['ization', 'ize'],
      ['ation', 'ate'],
      ['ator', 'ate'],
      ['alism', 'al'],
      ['iveness', 'ive'],
      ['fulness', 'ful'],
      ['ousness', 'ous'],
      ['aliti', 'al'],
      ['iviti', 'ive'],
      ['biliti', 'ble'],
    ],
    MGR0,
  );
}

function step3(w: string): string {
  return replaceSuffix(
    w,
    [
      ['icate', 'ic'],
      ['ative', ''],
      ['alize', 'al'],
      ['iciti', 'ic'],
      ['ical', 'ic'],
      ['ful', ''],
      ['ness', ''],
    ],
    MGR0,
  );
}

function step4(w: string): string {
  if (w.endsWith('ion')) {
    const stem = w.slice(0, -3);
    if (MGR1.test(stem) && (stem.endsWith('s') || stem.endsWith('t'))) {
      return stem;
    }
  }
  const suffixes = [
    'ance',
    'ence',
    'able',
    'ible',
    'ment',
    'ent',
    'ant',
    'ism',
    'ate',
    'iti',
    'ous',
    'ive',
    'ize',
    'al',
    'er',
    'ic',
    'ou',
  ] as const;
  for (const suffix of suffixes) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      return MGR1.test(stem) ? stem : w;
    }
  }
  return w;
}

function step5(w: string): string {
  if (w.endsWith('e')) {
    const stem = w.slice(0, -1);
    if (MGR1.test(stem) || (MEQ1.test(stem) && !cvc(stem))) {
      return stem;
    }
  }
  if (w.endsWith('ll') && MGR1.test(w)) {
    return w.slice(0, -1);
  }
  return w;
}

/** True when stemming would likely break an API-ish token. */
export function shouldStemToken(token: string): boolean {
  if (!token || token.length < 3) {
    return false;
  }
  if (/[0-9_/.#+]/.test(token)) {
    return false;
  }
  if (token.length > 32) {
    return false;
  }
  return true;
}

/**
 * Porter stem for a single lowercase English token.
 * Returns the original token when stemming is skipped.
 */
export function stemEnglish(token: string): string {
  if (!shouldStemToken(token)) {
    return token;
  }
  let w = token.toLowerCase();
  if (w.length <= 2) {
    return w;
  }
  w = step1a(w);
  w = step1b(w);
  w = step1c(w);
  w = step2(w);
  w = step3(w);
  w = step4(w);
  w = step5(w);
  return w;
}
