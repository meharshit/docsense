import type { DocHeadingLevel, DocSection } from '@docsense/core';

export interface ParsedMarkdown {
  readonly title: string;
  readonly bodyText: string;
  readonly sections: DocSection[];
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;
const CODE_FENCE_RE = /^```[\w-]*\s*$/;

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

/** Strip common MDX/Markdown markup into plain text for search. */
export function toPlainText(markdown: string): string {
  return markdown
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

  for (const line of lines) {
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

    const heading = line.match(HEADING_RE);
    if (heading) {
      const level = heading[1]!.length as DocHeadingLevel;
      const headingTitle = heading[2]!.replace(/#+$/, '').trim();

      if (!titleFound && level === 1) {
        title = headingTitle;
        titleFound = true;
        continue;
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
