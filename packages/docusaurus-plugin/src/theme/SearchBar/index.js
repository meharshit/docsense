import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DocsenseClient } from '@docsense/runtime';
import styles from './styles.module.css';

function useDocsenseClient(indexPath) {
  return useMemo(
    () =>
      new DocsenseClient({
        indexUrl: indexPath || '/docsense/search-index.json',
      }),
    [indexPath],
  );
}

function useHotkey(open) {
  useEffect(() => {
    const onKeyDown = (event) => {
      const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isModK) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);
}

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState([]);
  const [active, setActive] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const client = useDocsenseClient('/docsense/search-index.json');

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHits([]);
    setActive(0);
    setError(null);
  }, []);

  useHotkey(openModal);

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
      setHits([]);
      return undefined;
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      client
        .search({ query: q, limit: 8 })
        .then((result) => {
          if (!cancelled) {
            setHits(result.hits);
            setActive(0);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setHits([]);
          }
        });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [client, open, query]);

  const go = (hit) => {
    closeModal();
    window.location.assign(hit.url);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === 'Enter' && hits[active]) {
      event.preventDefault();
      go(hits[active]);
    }
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={openModal} aria-label="Search">
        <span className={styles.triggerLabel}>Search</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      {open ? (
        <div className={styles.overlay} role="presentation" onClick={closeModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Search docs"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search docs…"
              aria-label="Search query"
            />
            {error ? <div className={styles.error}>{error}</div> : null}
            <ul className={styles.list}>
              {hits.map((hit, index) => (
                <li key={`${hit.url}-${index}`}>
                  <button
                    type="button"
                    className={index === active ? styles.hitActive : styles.hit}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(hit)}
                  >
                    <div className={styles.hitTitle}>{hit.title}</div>
                    {hit.sectionTitle ? (
                      <div className={styles.hitSection}>{hit.sectionTitle}</div>
                    ) : null}
                    <div className={styles.hitMeta}>
                      {(hit.breadcrumbs || []).map((b) => b.label).join(' › ') || hit.url}
                    </div>
                    {hit.highlights?.[0]?.snippet ? (
                      <div className={styles.hitSnippet}>{hit.highlights[0].snippet}</div>
                    ) : null}
                  </button>
                </li>
              ))}
              {!error && query.trim() && hits.length === 0 ? (
                <li className={styles.empty}>No results</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
