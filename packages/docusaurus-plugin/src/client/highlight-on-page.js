/**
 * Docusaurus client module: after a Docsense result click, mark matching
 * terms on the destination page (whole words, stem-aware) and scroll.
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {
  HIGHLIGHT_STORAGE_KEY,
  highlightTermsFromQuery,
  locationMatchesPending,
  parsePendingHighlight,
  splitTextForHighlight,
} from '../highlight-terms';

const MARK_CLASS = 'docsense-mark';
const SKIP = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'MARK',
  'CODE',
  'PRE',
  'KBD',
  'TEXTAREA',
  'INPUT',
]);

function contentRoot() {
  return (
    document.querySelector('article') ||
    document.querySelector('main .markdown') ||
    document.querySelector('main') ||
    document.body
  );
}

function clearMarks(root) {
  const marks = root.querySelectorAll(`mark.${MARK_CLASS}`);
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) {
      return;
    }
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    parent.normalize();
  });
}

function wrapTextNode(node, queryTerms) {
  const text = node.nodeValue;
  if (!text) {
    return 0;
  }
  const parts = splitTextForHighlight(text, queryTerms);
  if (!parts.some((p) => p.highlight)) {
    return 0;
  }
  const frag = document.createDocumentFragment();
  let count = 0;
  for (const part of parts) {
    if (part.highlight) {
      const mark = document.createElement('mark');
      mark.className = MARK_CLASS;
      mark.textContent = part.text;
      frag.appendChild(mark);
      count += 1;
    } else {
      frag.appendChild(document.createTextNode(part.text));
    }
  }
  node.parentNode.replaceChild(frag, node);
  return count;
}

function highlightRoot(root, query) {
  const queryTerms = highlightTermsFromQuery(query);
  if (queryTerms.length === 0) {
    return 0;
  }

  clearMarks(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) {
        return NodeFilter.FILTER_REJECT;
      }
      if (SKIP.has(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest('mark.docsense-mark')) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  let total = 0;
  for (const node of nodes) {
    total += wrapTextNode(node, queryTerms);
  }
  return total;
}

let attempts = 0;

function applyPendingHighlight() {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }
  const pending = parsePendingHighlight(sessionStorage.getItem(HIGHLIGHT_STORAGE_KEY));
  if (!pending) {
    return;
  }
  const href = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (
    !locationMatchesPending(pending, href) &&
    !locationMatchesPending(pending, window.location.href)
  ) {
    return;
  }

  const root = contentRoot();
  if (!root) {
    return;
  }

  const count = highlightRoot(root, pending.query);
  attempts += 1;

  // Only clear after a successful mark pass, or after a few empty retries
  // (article content may not be painted on the first tick).
  if (count > 0 || attempts >= 6) {
    sessionStorage.removeItem(HIGHLIGHT_STORAGE_KEY);
    attempts = 0;
  }

  if (count > 0) {
    const first = root.querySelector(`mark.${MARK_CLASS}`);
    if (first && !window.location.hash) {
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
}

function scheduleHighlightPasses() {
  attempts = 0;
  [40, 120, 250, 500, 900, 1500].forEach((ms) => {
    window.setTimeout(applyPendingHighlight, ms);
  });
}

export function onRouteDidUpdate() {
  scheduleHighlightPasses();
}

if (ExecutionEnvironment.canUseDOM) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleHighlightPasses);
  } else {
    scheduleHighlightPasses();
  }
}
