import type { DocRecord, SearchContext } from './types';

/** Returns true when a document should be visible for the active browsing context. */
export function matchesContext(doc: DocRecord, context?: SearchContext): boolean {
  if (!context) {
    return true;
  }

  if (context.version !== undefined && doc.version !== undefined && doc.version !== context.version) {
    return false;
  }

  if (
    context.language !== undefined &&
    doc.language !== undefined &&
    doc.language !== context.language
  ) {
    return false;
  }

  if (context.product !== undefined && doc.product !== undefined && doc.product !== context.product) {
    return false;
  }

  if (context.pageTypes && context.pageTypes.length > 0) {
    if (!context.pageTypes.includes(doc.pageType)) {
      return false;
    }
  }

  return true;
}
