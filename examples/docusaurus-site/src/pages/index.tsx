import type {ReactNode} from 'react';
import {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type SampleHit = {
  id: string;
  title: string;
  titleHtml: ReactNode;
  crumbs: string;
  type: 'howto' | 'concept' | 'reference';
  snippet: string;
};

const SAMPLE_HITS: SampleHit[] = [
  {
    id: '1',
    title: 'Install the plugin',
    titleHtml: (
      <>
        Install the <mark>plugin</mark>
      </>
    ),
    crumbs: 'Docs > Getting started > Install',
    type: 'howto',
    snippet: 'Add docusaurus-plugin-docsense and rebuild once.',
  },
  {
    id: '2',
    title: 'How indexing works',
    titleHtml: (
      <>
        How <mark>index</mark>ing works
      </>
    ),
    crumbs: 'Docs > Concepts > Indexing',
    type: 'concept',
    snippet: 'Markdown and MDX become a static JSON file at build time.',
  },
  {
    id: '3',
    title: 'Plugin options',
    titleHtml: (
      <>
        <mark>Plugin</mark> options
      </>
    ),
    crumbs: 'Docs > Reference > Configuration',
    type: 'reference',
    snippet: 'placeholder, triggerLabel, shortcut, resultLimit…',
  },
  {
    id: '4',
    title: 'Style the search UI',
    titleHtml: <>Style the search UI</>,
    crumbs: 'Docs > How-to > Style search',
    type: 'howto',
    snippet: 'Theme the modal with --docsense-accent and friends.',
  },
  {
    id: '5',
    title: 'Ranking and typos',
    titleHtml: <>Ranking and typos</>,
    crumbs: 'Docs > Concepts > Ranking',
    type: 'concept',
    snippet: 'Fuzzy matching catches instal plugn without a cloud API.',
  },
];

const TYPE_LABEL: Record<SampleHit['type'], string> = {
  howto: 'HOW-TO',
  concept: 'CONCEPT',
  reference: 'REFERENCE',
};

function DocIcon() {
  return (
    <svg className={styles.docIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2 4 4h-4z"
      />
    </svg>
  );
}

function HeroModal() {
  const [filter, setFilter] = useState<'all' | SampleHit['type']>('all');
  const [limit, setLimit] = useState(8);

  const visible = useMemo(() => {
    const filtered =
      filter === 'all' ? SAMPLE_HITS : SAMPLE_HITS.filter((h) => h.type === filter);
    return filtered.slice(0, limit);
  }, [filter, limit]);

  return (
    <div className={styles.heroModal} aria-label="Interactive Docsense search preview">
      <div className={styles.heroModalSearch}>
        <svg className={styles.heroModalIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"
          />
        </svg>
        <div className={styles.heroModalQuery}>
          <span className={styles.typo}>instal</span> <span className={styles.typo}>plugn</span>
        </div>
        <span className={styles.typoBadge}>Typo tolerant</span>
        <span className={styles.escHint}>esc</span>
      </div>

      <div className={styles.heroModalToolbar}>
        <div className={styles.heroFilters}>
          {(
            [
              ['all', 'All'],
              ['howto', 'How-to'],
              ['concept', 'Concept'],
              ['reference', 'Reference'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? styles.modalChipActive : styles.modalChip}
              onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.heroHits}>
        {visible.map((hit, index) => (
          <li key={hit.id} className={index === 0 ? styles.heroHitActive : styles.heroHit}>
            <DocIcon />
            <div className={styles.heroHitBody}>
              <div className={styles.heroHitTop}>
                <div className={styles.heroHitTitle}>{hit.titleHtml}</div>
                <span className={styles.heroHitTag}>{TYPE_LABEL[hit.type]}</span>
              </div>
              <div className={styles.heroHitCrumbs}>{hit.crumbs}</div>
              <div className={styles.heroHitSnippet}>{hit.snippet}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.heroModalFooter}>
        <span className={styles.heroNavHints}>
          <kbd>↑↓</kbd> navigate <kbd>↵</kbd> open
        </span>
        <div className={styles.heroLimit}>
          <button
            type="button"
            className={styles.limitBtn}
            aria-label="Fewer pages"
            disabled={limit <= 3}
            onClick={() => setLimit((n) => Math.max(3, n - 1))}>
            −
          </button>
          <strong>{limit} pages</strong>
          <button
            type="button"
            className={styles.limitBtn}
            aria-label="More pages"
            disabled={limit >= 20}
            onClick={() => setLimit((n) => Math.min(20, n + 1))}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Open source · Docusaurus · MIT
          </p>
          <Heading as="h1" className={styles.heroTitle}>
            Documentation search that <span className={styles.heroMark}>builds</span> with your
            site.
          </Heading>
          <p className={styles.heroLead}>
            Index Markdown and MDX at build time, ship a static JSON file, and search in the
            browser. No Algolia account, no crawler, no separate search server.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.btnGold} to="/docs/how-to/install">
              Get started →
            </Link>
            <Link className={styles.btnOutline} to="/docs/intro">
              Read the docs
            </Link>
            <a
              className={styles.btnGhost}
              href="https://github.com/meharshit/docsense"
              target="_blank"
              rel="noreferrer">
              GitHub ↗
            </a>
          </div>
          <p className={styles.heroHint}>
            On this site, press <kbd>⌘</kbd> <kbd>K</kbd> or <kbd>Ctrl</kbd> <kbd>K</kbd> to open
            Docsense search.
          </p>
        </div>
        <div className={styles.heroVisual}>
          <HeroModal />
        </div>
      </div>
    </section>
  );
}

function ProofStrip() {
  const items = [
    {
      title: 'Build-time index',
      body: 'Fresh on every deploy',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"
          />
        </svg>
      ),
    },
    {
      title: 'Local queries',
      body: 'Runs in the browser',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-5v2h2v2H8v-2h2v-2H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v8h14V7z"
          />
        </svg>
      ),
    },
    {
      title: 'Default 8 pages',
      body: 'Filters and a − / + limit',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 18h4v-2h-4zm-7-8v2h18v-2zm3 6h4v-2H6zm0-8h12V6H6z"
          />
        </svg>
      ),
    },
    {
      title: 'Typo tolerant',
      body: 'Fuzzy matching built in',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2 9.5 8.5 3 9l5 4.2L6.2 20 12 16.5 17.8 20 16 13.2 21 9l-6.5-.5z"
          />
        </svg>
      ),
    },
  ];
  return (
    <section className={styles.proof} aria-label="Product highlights">
      <div className={styles.proofInner}>
        {items.map((item) => (
          <div key={item.title} className={styles.proofItem}>
            <span className={styles.proofIcon}>{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.sectionInner}>
        <p className={styles.sectionEyebrow}>How it works</p>
        <Heading as="h2" className={styles.sectionTitle}>
          Three steps, and nothing to babysit.
        </Heading>
        <p className={styles.sectionLead}>
          No crawler approval queue and no sync job. Search is built and shipped with the rest of
          your site.
        </p>
        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNum}>1</span>
            <h3>Install the plugin</h3>
            <p>
              Add <code>docusaurus-plugin-docsense</code> to your Docusaurus config. The SearchBar
              lands in the navbar automatically.
            </p>
            <pre className={styles.code}>{`// docusaurus.config.js
plugins: ['docusaurus-plugin-docsense'],`}</pre>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <h3>Build your docs</h3>
            <p>
              Run your normal build. Docsense indexes your Markdown and MDX and ships the result as
              a static JSON file.
            </p>
            <pre className={styles.code}>{`# your usual build
npm run build`}</pre>
          </li>
          <li>
            <span className={styles.stepNum}>3</span>
            <h3>Search in the browser</h3>
            <p>
              Readers open search with a shortcut and query the index locally. No account and no
              server to run.
            </p>
            <div className={styles.kbdRow}>
              <kbd>⌘</kbd>
              <kbd>K</kbd>
              <span className={styles.kbdOr}>or</span>
              <kbd>Ctrl</kbd>
              <kbd>K</kbd>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className={styles.sectionAlt} id="features">
      <div className={styles.sectionInner}>
        <p className={styles.sectionEyebrow}>Features</p>
        <Heading as="h2" className={styles.sectionTitle}>
          Built for documentation sites.
        </Heading>
        <p className={styles.sectionLead}>
          Search your own, with a UI that feels like a modern docs site.
        </p>
        <div className={styles.featureGrid}>
          <article className={`${styles.featureCard} ${styles.featureWide}`}>
            <h3>Section-aware results</h3>
            <p>
              Hits can deep-link to a heading, with breadcrumbs and a short snippet, not just the
              page title.
            </p>
            <div className={styles.miniPanel}>
              <div className={styles.miniHit}>
                <DocIcon />
                <div>
                  <strong>Verify signatures</strong>
                  <span className={styles.miniCrumbs}>
                    Docs &gt; Guides &gt; Webhooks &gt; #verify-signatures
                  </span>
                  <em>Confirm HMAC headers before you trust the payload.</em>
                </div>
              </div>
            </div>
          </article>
          <article className={styles.featureCard}>
            <h3>Page-type filters</h3>
            <p>
              Chip filters for How-to, Concept, Reference and more, inferred from paths or
              frontmatter.
            </p>
            <div className={styles.miniPanel}>
              <div className={styles.miniChips}>
                <span className={styles.modalChipActive}>How-to</span>
                <span className={styles.modalChip}>Concept</span>
                <span className={styles.modalChip}>Reference</span>
                <span className={styles.modalChip}>+ more</span>
              </div>
            </div>
          </article>
          <article className={styles.featureCard}>
            <h3>Adjustable page limit</h3>
            <p>Default eight pages in the modal. Readers change the count with − / + (3 to 20).</p>
            <div className={styles.miniPanel}>
              <div className={styles.miniLimit}>
                <span>−</span>
                <strong>8</strong>
                <span>+</span>
              </div>
              <div className={styles.miniLimitCaption}>pages, 3 to 20</div>
            </div>
          </article>
          <article className={styles.featureCard}>
            <h3>Your branding</h3>
            <p>
              Swap labels, shortcut and CSS variables so the SearchBar matches your docs theme.
            </p>
            <div className={styles.miniPanel}>
              <div className={styles.swatches} aria-label="Accent palette">
                <span style={{background: '#E3C77A'}} title="Gold" />
                <span style={{background: '#A9C4A4'}} title="Sage" />
                <span style={{background: '#9DB8C9'}} title="Blue" />
                <span style={{background: '#EE8C6E'}} title="Coral" />
                <span className={styles.swatchOutline} title="Ink" />
              </div>
            </div>
          </article>
          <article className={styles.featureCard}>
            <h3>Private-docs friendly</h3>
            <p>Indexing stays in your build. Content does not go to a Docsense cloud crawler.</p>
            <div className={styles.miniPanel}>
              <div className={styles.privacyFlow}>
                <span className={styles.privacyOk}>Your build ✓</span>
                <span className={styles.privacyDash} aria-hidden="true" />
                <span className={styles.privacyNo}>Cloud crawler ✕</span>
              </div>
            </div>
          </article>
          <article className={`${styles.featureCard} ${styles.featureWide}`}>
            <h3>Inspectable index</h3>
            <p>
              Open the JSON file, audit what is searchable, and pin the open-source packages you
              ship. Nothing about your search is a black box.
            </p>
            <pre className={styles.code}>{`{
  "title": "Install Docsense",
  "headings": ["Install the plugin", "Verify"],
  "text": "Add docusaurus-plugin-docsense…"
}`}</pre>
          </article>
        </div>
      </div>
    </section>
  );
}

function Compare() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <p className={styles.sectionEyebrow}>Choosing a search tool</p>
        <Heading as="h2" className={styles.sectionTitle}>
          When to use Docsense.
        </Heading>
        <div className={styles.compare}>
          <div className={`${styles.compareCard} ${styles.comparePreferred}`}>
            <div className={styles.compareHead}>
              <h3>Choose Docsense</h3>
              <span className={styles.compareBadge}>Fits when</span>
            </div>
            <ul className={styles.compareYes}>
              <li>You want search inside your Docusaurus build</li>
              <li>Index freshness must match every deploy</li>
              <li>You prefer a static JSON file you own</li>
              <li>Private or internal docs should not leave your boundary for indexing</li>
            </ul>
          </div>
          <div className={styles.compareCard}>
            <div className={styles.compareHead}>
              <h3>Choose hosted search</h3>
            </div>
            <ul className={styles.compareNo}>
              <li>You need a managed cloud search platform</li>
              <li>You already run Algolia or similar at scale</li>
              <li>You want Ask AI or chat answers from the same vendor</li>
              <li>You need multi-product search beyond docs Markdown</li>
            </ul>
          </div>
        </div>
        <p className={styles.compareFoot}>
          Full comparison with easyops, Orama and Pagefind:{' '}
          <Link to="/docs/concepts/compare-open-source-search">
            Compare open-source Docusaurus search
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function BottomCta() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <div>
          <Heading as="h2">Start with a working SearchBar.</Heading>
          <p>Install the plugin, rebuild once, and try ⌘K on your own site.</p>
          <div className={styles.heroActions}>
            <Link className={styles.btnDark} to="/docs/how-to/install">
              Install Docsense
            </Link>
            <Link className={styles.btnOutlineDark} to="/#features">
              See features
            </Link>
          </div>
        </div>
        <div className={styles.ctaKeys} aria-hidden="true">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation search for Docusaurus"
      description="Docsense indexes Markdown and MDX at build time and searches locally in the browser. No Algolia account required.">
      <main className={styles.page}>
        <Hero />
        <ProofStrip />
        <HowItWorks />
        <FeatureGrid />
        <Compare />
        <BottomCta />
      </main>
    </Layout>
  );
}
