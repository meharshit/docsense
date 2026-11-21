import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useThemeConfig } from '@docusaurus/theme-common';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { DocsenseClient } from '@docsense/runtime';
import {
  DEFAULT_RESULT_LIMIT,
  MAX_RESULT_LIMIT,
  MIN_RESULT_LIMIT,
  buildFilterOptions,
  clampResultLimit,
  decrementResultLimit,
  incrementResultLimit,
  prepareVisibleHits,
  rawFetchLimit,
  resolveActiveFilter,
  selectTopPages,
} from '../../search-ui';
import {
  HIGHLIGHT_STORAGE_KEY,
  buildPendingHighlight,
} from '../../highlight-terms';
import { matchesShortcut, shortcutHint } from './shortcut.js';
import docsenseMarkUrl from './brand/docsense-icon-dark.png';
import './docsense-search.css';

const FALLBACK_CONFIG = {
  indexPath: '/docsense/search-index.json',
  resultLimit: DEFAULT_RESULT_LIMIT,
  searchBar: {
    placeholder: 'Search the docs…',
    triggerLabel: 'Search',
    shortcut: 'mod+k',
    showShortcutHint: true,
    modalAriaLabel: 'Search docs',
    emptyResultsLabel: 'No matching pages',
    debounceMs: 120,
  },
};

function useDocsenseConfig() {
  const pluginData = usePluginData('docusaurus-plugin-docsense');
  const themeConfig = useThemeConfig();
  const fromTheme = themeConfig?.docsense || {};

  return useMemo(() => {
    const mergedSearchBar = {
      ...FALLBACK_CONFIG.searchBar,
      ...((pluginData && pluginData.searchBar) || {}),
      ...(fromTheme.searchBar || {}),
    };
    const resultLimit = clampResultLimit(
      fromTheme.resultLimit || (pluginData && pluginData.resultLimit) || FALLBACK_CONFIG.resultLimit,
    );
    return {
      indexPath: fromTheme.indexPath || (pluginData && pluginData.indexPath) || FALLBACK_CONFIG.indexPath,
      resultLimit,
      searchBar: mergedSearchBar,
    };
  }, [pluginData, fromTheme]);
}

function SearchIcon({className = 'docsense-searchrow__icon'}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="11"
        cy="11"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M16.2 16.2 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function breadcrumbText(hit) {
  if (hit.breadcrumbs && hit.breadcrumbs.length) {
    return hit.breadcrumbs.map((b) => b.label).join(' › ');
  }
  return hit.url;
}

function snippetText(hit) {
  if (!hit.highlights || !hit.highlights.length) {
    return '';
  }
  const body = hit.highlights.find((h) => h.field === 'body') || hit.highlights[0];
  return body ? body.snippet : '';
}

function sitePath(path) {
  return String(path || '').replace(/^\//, '');
}

export default function SearchBar(props) {
  const config = useDocsenseConfig();
  const searchBar = { ...config.searchBar, ...(props || {}) };
  const { withBaseUrl } = useBaseUrlUtils();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rawHits, setRawHits] = useState([]);
  const [active, setActive] = useState(0);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(config.resultLimit);
  const inputRef = useRef(null);

  // Respect Docusaurus baseUrl (required for GitHub Pages project sites).
  const indexUrl = withBaseUrl(sitePath(config.indexPath || 'docsense/search-index.json'));

  const client = useMemo(
    () => new DocsenseClient({ indexUrl }),
    [indexUrl],
  );

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => {
    setOpen(false);
    setQuery('');
    setRawHits([]);
    setActive(0);
    setError(null);
    setFilter('all');
  }, []);

  useEffect(() => {
    setLimit(config.resultLimit);
  }, [config.resultLimit]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const tag = target && target.tagName;
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || (target && target.isContentEditable);
      if (typing && searchBar.shortcut !== '/') {
        return;
      }
      if (matchesShortcut(event, searchBar.shortcut)) {
        event.preventDefault();
        openModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openModal, searchBar.shortcut]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const q = query.trim();
    if (!q) {
      setRawHits([]);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    const handle = window.setTimeout(() => {
      client
        .search({ query: q, limit: rawFetchLimit(limit) })
        .then((result) => {
          if (!cancelled) {
            setRawHits(result.hits);
            setActive(0);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setRawHits([]);
          }
        });
    }, searchBar.debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [client, limit, open, query, searchBar.debounceMs]);

  const filterChips = useMemo(() => {
    const pages = selectTopPages(rawHits, MAX_RESULT_LIMIT);
    return buildFilterOptions(pages);
  }, [rawHits]);

  const activeFilter = useMemo(() => {
    const ids = filterChips.map((c) => c.id);
    return resolveActiveFilter(filter, ids);
  }, [filter, filterChips]);

  useEffect(() => {
    if (activeFilter !== filter) {
      setFilter(activeFilter);
    }
  }, [activeFilter, filter]);

  const visibleHits = useMemo(
    () => prepareVisibleHits({ hits: rawHits, filter: activeFilter, limit }),
    [rawHits, activeFilter, limit],
  );

  const go = (hit) => {
    const targetUrl = withBaseUrl(sitePath(hit.url));
    const q = query.trim();
    if (q) {
      try {
        sessionStorage.setItem(
          HIGHLIGHT_STORAGE_KEY,
          JSON.stringify(buildPendingHighlight(q, targetUrl)),
        );
      } catch {
        // Private mode / blocked storage — navigation still works.
      }
    }
    closeModal();
    window.location.assign(targetUrl);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(visibleHits.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === 'Enter' && visibleHits[active]) {
      event.preventDefault();
      go(visibleHits[active]);
    }
  };

  const hint = shortcutHint(searchBar.shortcut);
  const showResults = query.trim().length > 0;

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="docsense-overlay" role="presentation" onClick={closeModal}>
            <div
              className="docsense-modal"
              role="dialog"
              aria-modal="true"
              aria-label={searchBar.modalAriaLabel}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="docsense-searchrow">
                <SearchIcon />
                <input
                  ref={inputRef}
                  className="docsense-searchrow__input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={searchBar.placeholder}
                  aria-label="Search query"
                />
                <span className="docsense-searchrow__hint">{hint}</span>
              </div>

              <div className="docsense-toolbar">
                <div className="docsense-filters" role="group" aria-label="Filter results">
                  <span className="docsense-filters__label">Filter by:</span>
                  {filterChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className={
                        filter === chip.id ? 'docsense-chip is-active' : 'docsense-chip'
                      }
                      onClick={() => {
                        setFilter(chip.id);
                        setActive(0);
                      }}
                    >
                      {chip.label}
                      {showResults ? ` (${chip.count})` : ''}
                    </button>
                  ))}
                </div>

                <div className="docsense-limit" aria-label="Result limit">
                  <span className="docsense-limit__label">Pages</span>
                  <button
                    type="button"
                    className="docsense-limit__btn"
                    aria-label="Show fewer pages"
                    disabled={limit <= MIN_RESULT_LIMIT}
                    onClick={() => {
                      setLimit((n) => decrementResultLimit(n));
                      setActive(0);
                    }}
                  >
                    −
                  </button>
                  <span className="docsense-limit__value">{limit}</span>
                  <button
                    type="button"
                    className="docsense-limit__btn"
                    aria-label="Show more pages"
                    disabled={limit >= MAX_RESULT_LIMIT}
                    onClick={() => {
                      setLimit((n) => incrementResultLimit(n));
                      setActive(0);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="docsense-body">
                {error ? <div className="docsense-error">{error}</div> : null}

                {!showResults && !error ? (
                  <div className="docsense-empty">
                    Type to search docs. Use filters and the page limit to refine results.
                  </div>
                ) : null}

                {showResults && !error && visibleHits.length === 0 ? (
                  <div className="docsense-empty">{searchBar.emptyResultsLabel}</div>
                ) : null}

                {showResults && visibleHits.length > 0 ? (
                  <ul className="docsense-list">
                    {visibleHits.map((hit, index) => (
                      <li key={`${hit.documentId}-${hit.url}`}>
                        <button
                          type="button"
                          className={
                            index === active ? 'docsense-hit is-active' : 'docsense-hit'
                          }
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(hit)}
                        >
                          <div className="docsense-hit__title">{hit.title}</div>
                          {hit.sectionTitle ? (
                            <div className="docsense-hit__section">{hit.sectionTitle}</div>
                          ) : null}
                          <div className="docsense-hit__meta">{breadcrumbText(hit)}</div>
                          {snippetText(hit) ? (
                            <div className="docsense-hit__snippet">{snippetText(hit)}</div>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="docsense-footer">
                <span className="docsense-footer__powered">
                  Showing {Math.min(visibleHits.length, limit)}/{limit} pages · Powered by
                  <img
                    className="docsense-footer__mark"
                    src={docsenseMarkUrl}
                    alt=""
                    width="16"
                    height="16"
                  />
                  Docsense
                </span>
                <span>↑↓ enter · esc</span>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="docsense-trigger"
        onClick={openModal}
        aria-label={searchBar.triggerLabel}
      >
        <SearchIcon className="docsense-trigger__icon" />
        <span className="docsense-trigger__label">{searchBar.triggerLabel}</span>
        {searchBar.showShortcutHint ? (
          <kbd className="docsense-trigger__kbd">{hint}</kbd>
        ) : null}
      </button>
      {modal}
    </>
  );
}
