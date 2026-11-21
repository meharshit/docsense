import type {ReactNode} from 'react';
import styles from './styles.module.css';

/**
 * Static, in-doc preview of a customized Docsense SearchBar.
 * Used on the Style the search UI guide so readers see the example
 * without guessing from live navbar CSS alone.
 */
export default function SearchBarThemePreview(): ReactNode {
  return (
    <div className={styles.wrap} aria-label="Example styled Docsense search UI">
      <div className={styles.caption}>
        <span>
          <strong>Worked example</strong>: deep green + gold theme applied with
          CSS variables
        </span>
        <span className={styles.badge}>Example theme</span>
      </div>

      <div className={styles.stage}>
        <div className={styles.triggerRow}>
          <div className={styles.trigger}>
            <svg className={styles.triggerIcon} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
              <path d="M16.2 16.2 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Search docs
            <span className={styles.triggerKbd}>⌘K</span>
          </div>
        </div>

        <div className={styles.modal} role="img" aria-label="Styled search modal preview">
          <div className={styles.searchRow}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
              <path d="M16.2 16.2 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <div className={styles.query}>
              <span className={styles.queryMark}>instal</span>{' '}
              <span className={styles.queryMark}>plugn</span>
            </div>
            <span className={styles.hint}>⌘K</span>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <span className={styles.filtersLabel}>Filter by:</span>
              <span className={styles.chipActive}>All</span>
              <span className={styles.chip}>How-to</span>
              <span className={styles.chip}>Concept</span>
              <span className={styles.chip}>Reference</span>
            </div>
            <div className={styles.limit}>
              <span>Pages</span>
              <span className={styles.limitBtn}>−</span>
              <span className={styles.limitValue}>8</span>
              <span className={styles.limitBtn}>+</span>
            </div>
          </div>

          <ul className={styles.list}>
            <li className={styles.hitActive}>
              <div className={styles.hitTitle}>Install Docsense</div>
              <div className={styles.hitSection}>Install the plugin</div>
              <div className={styles.hitMeta}>How-to</div>
              <div className={styles.hitSnippet}>
                Add docusaurus-plugin-docsense to your config…
              </div>
            </li>
            <li className={styles.hit}>
              <div className={styles.hitTitle}>Plugin options</div>
              <div className={styles.hitMeta}>Reference</div>
              <div className={styles.hitSnippet}>
                resultLimit, searchBar.placeholder, triggerLabel…
              </div>
            </li>
            <li className={styles.hit}>
              <div className={styles.hitTitle}>Style the search UI</div>
              <div className={styles.hitMeta}>How-to</div>
              <div className={styles.hitSnippet}>
                Theme the modal with --docsense-accent and friends…
              </div>
            </li>
          </ul>

          <div className={styles.footer}>
            <span className={styles.powered}>
              Showing 3/8 pages · Powered by
              <img
                className={styles.poweredMark}
                src="/img/brand/docsense-icon-dark.png"
                alt=""
                width={16}
                height={16}
              />
              Docsense
            </span>
            <span>↑↓ enter · esc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
