import type { DocHeadingLevel, DocSection } from '@docsense/core';

export interface ParsedMarkdown {
  readonly title: string;
  readonly bodyText: string;
  readonly sections: DocSection[];
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;
const HTML_HEADING_RE = /^<\s*h([1-6])\b[^>]*>([\s\S]*?)<\s*\/\s*h\1\s*>\s*$/i;
const JSX_HEADING_RE = /^<\s*Heading\b([^>]*)>([\s\S]*?)<\s*\/\s*Heading\s*>\s*$/i;
const SETEXT_H1_RE = /^=+\s*$/;
const SETEXT_H2_RE = /^-{2,}\s*$/;
const CODE_FENCE_RE = /^```[\w-]*\s*$/;

/** Pull visible text out of a heading line (strip inner tags / emphasis). */
function headingPlainText(raw: string): string {
  return raw
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/<\/?[A-Za-z][\w.]*[^>]*>/g, ' ')
    .replace(/\{(['"`])([\s\S]*?)\1\}/g, ' $2 ')
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/[*_~`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Read `as="h2"` / `as={'h3'}` from a Docusaurus `<Heading>` tag. */
function headingLevelFromJsxAttrs(attrs: string): DocHeadingLevel | null {
  const match = attrs.match(
    /\bas\s*=\s*(?:\{\s*['"]h([1-6])['"]\s*\}|['"]h([1-6])['"])/i,
  );
  const digit = match?.[1] ?? match?.[2];
  if (!digit) {
    return null;
  }
  return Number(digit) as DocHeadingLevel;
}

function matchStructuredHeading(
  line: string,
): { level: DocHeadingLevel; title: string } | null {
  const atx = line.match(HEADING_RE);
  if (atx) {
    return {
      level: atx[1]!.length as DocHeadingLevel,
      title: headingPlainText(atx[2]!.replace(/#+$/, '')),
    };
  }

  const html = line.match(HTML_HEADING_RE);
  if (html) {
    const title = headingPlainText(html[2] ?? '');
    if (!title) {
      return null;
    }
    return { level: Number(html[1]) as DocHeadingLevel, title };
  }

  const jsx = line.match(JSX_HEADING_RE);
  if (jsx) {
    const level = headingLevelFromJsxAttrs(jsx[1] ?? '');
    const title = headingPlainText(jsx[2] ?? '');
    if (!level || !title) {
      return null;
    }
    return { level, title };
  }

  return null;
}

/** Attributes that usually carry human-readable text in MDX/JSX. */
const TEXTISH_ATTRS = new Set([
  'title',
  'label',
  'description',
  'alt',
  'aria-label',
  'arialabel',
  'placeholder',
  'caption',
  'name',
  'summary',
  'children',
  'heading',
  'subtitle',
  'text',
  'cta',
  'buttontext',
  'emptytext',
]);

/** Convert a heading to a URL-safe anchor (GitHub-ish). */
export function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Pull string literals out of JSX/MDX attribute lists and tag children
 * so component-heavy pages still contribute searchable words.
 */
export function extractMdxReadableText(source: string): string {
  if (!source) {
    return '';
  }

  let text = source;
  // Drop import/export lines (not useful for search).
  text = text.replace(/^\s*import\s.+?;?\s*$/gm, ' ');
  text = text.replace(/^\s*export\s.+?;?\s*$/gm, ' ');
  // Drop MDX/JSX comments.
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
  // Drop fenced code temporarily handled elsewhere; leave inline for now.

  const collected: string[] = [];

  // title="...", description={'...'}, alt='...'
  const attrRe =
    /\b([A-Za-z][\w-]*)\s*=\s*(?:\{\s*(['"`])([\s\S]*?)\2\s*\}|(['"`])([\s\S]*?)\4)/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(text)) !== null) {
    const name = match[1]!.toLowerCase();
    const value = (match[3] ?? match[5] ?? '').trim();
    if (!value) {
      continue;
    }
    if (TEXTISH_ATTRS.has(name) || name.endsWith('label') || name.endsWith('title')) {
      collected.push(value);
    }
  }

  // Self-closing and paired JSX tags → keep children text, drop braces expressions
  // that are clearly identifiers (not quoted strings).
  text = text.replace(/<\/?[A-Za-z][\w.]*[^>]*>/g, ' ');
  text = text.replace(/\{(['"`])([\s\S]*?)\1\}/g, ' $2 ');
  text = text.replace(/\{[^}]+\}/g, ' ');

  collected.push(text);
  return collected.join(' ');
}

/** Strip common MDX/Markdown markup into plain text for search. */
export function toPlainText(markdown: string): string {
  const withMdx = extractMdxReadableText(markdown);
  return withMdx
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~|>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split markdown into title + hierarchical sections with code blocks preserved.
 */
export function parseMarkdownDocument(
  markdown: string,
  fallbackTitle = 'Untitled',
): ParsedMarkdown {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let title = fallbackTitle;
  let titleFound = false;

  type MutableSection = {
    id: string;
    title: string;
    level: DocHeadingLevel;
    anchor: string;
    contentLines: string[];
    code: string[];
  };

  const sections: MutableSection[] = [];
  let current: MutableSection | null = null;
  const preamble: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];

  const flushCode = () => {
    if (codeBuffer.length === 0) {
      return;
    }
    const block = codeBuffer.join('\n').trim();
    if (block) {
      if (current) {
        current.code.push(block);
      } else {
        // Keep preamble code searchable via body later.
        preamble.push(block);
      }
    }
    codeBuffer = [];
  };

  const startSection = (level: DocHeadingLevel, headingTitle: string) => {
    if (!headingTitle) {
      return;
    }
    if (!titleFound && level === 1) {
      title = headingTitle;
      titleFound = true;
      return;
    }
    current = {
      id: `h-${sections.length + 1}`,
      title: headingTitle,
      level,
      anchor: slugify(headingTitle),
      contentLines: [],
      code: [],
    };
    sections.push(current);
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;

    if (CODE_FENCE_RE.test(line.trim())) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        inCode = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Setext headings: title on this line, === (h1) or --- (h2) on the next.
    const next = lines[i + 1];
    if (next !== undefined && line.trim() && !line.trimStart().startsWith('<')) {
      if (SETEXT_H1_RE.test(next.trim()) || SETEXT_H2_RE.test(next.trim())) {
        const level: DocHeadingLevel = SETEXT_H1_RE.test(next.trim()) ? 1 : 2;
        const headingTitle = headingPlainText(line);
        startSection(level, headingTitle);
        i += 1; // consume underline
        continue;
      }
    }

    const heading = matchStructuredHeading(line.trim());
    if (heading) {
      startSection(heading.level, heading.title);
      continue;
    }

    if (current) {
      current.contentLines.push(line);
    } else {
      preamble.push(line);
    }
  }

  if (inCode) {
    flushCode();
  }

  const parsedSections: DocSection[] = sections.map((s) => ({
    id: s.id,
    title: s.title,
    level: s.level,
    anchor: s.anchor,
    content: toPlainText(s.contentLines.join('\n')),
    code: s.code.length > 0 ? s.code : undefined,
  }));

  const bodyText = toPlainText(
    [preamble.join('\n'), ...sections.map((s) => `${s.title}\n${s.contentLines.join('\n')}`)].join(
      '\n',
    ),
  );

  return {
    title,
    bodyText,
    sections: parsedSections,
  };
}
