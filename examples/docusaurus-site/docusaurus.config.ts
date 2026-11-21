import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import docsensePlugin from 'docusaurus-plugin-docsense';

const config: Config = {
  title: 'Docsense',
  tagline: 'Documentation search for Docusaurus. Local, build-time, no account.',
  favicon: 'img/favicon.png',

  url: 'https://docsense.local',
  baseUrl: '/',

  organizationName: 'meharshit',
  projectName: 'docsense',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // Homepage section ids live on the React page (verified in build/index.html).
  // The link checker does not always collect those anchors for navbar hash links.
  onBrokenAnchors: 'ignore',

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      docsensePlugin,
      {
        docsDirs: ['docs'],
        docsRouteBasePath: '/docs',
        resultLimit: 8,
        searchBar: {
          placeholder: 'Search the docs…',
          triggerLabel: 'Search',
          shortcut: 'mod+k',
          showShortcutHint: true,
          emptyResultsLabel: 'Nothing matched. Try another phrase',
          debounceMs: 100,
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    // Extra SearchBar customization (overrides plugin defaults).
    docsense: {
      resultLimit: 8,
      searchBar: {
        placeholder: 'Find guides, APIs, how-tos…',
        triggerLabel: 'Search docs',
      },
    },
    navbar: {
      // Wordmark PNGs already include "Docsense" — no separate title.
      title: '',
      logo: {
        alt: 'Docsense',
        src: 'img/brand/docsense-logo-light.svg',
        srcDark: 'img/brand/docsense-logo-dark.svg',
        href: '/',
        width: 156,
        height: 32,
      },
      items: [
        {
          to: '/#how-it-works',
          label: 'How it works',
          position: 'left',
        },
        {
          to: '/#features',
          label: 'Features',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/meharshit/docsense',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Get started', to: '/docs/how-to/install'},
            {label: 'Style the search UI', to: '/docs/how-to/style-search'},
            {label: 'Features', to: '/docs/features/overview'},
            {label: 'FAQ', to: '/docs/faq'},
            {label: 'Support', to: '/docs/support'},
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/meharshit/docsense',
            },
          ],
        },
      ],
      copyright: `<div class="docsense-footer-bar"><span>Docsense · MIT</span><span class="docsense-footer-powered">Powered by <img src="/img/brand/docsense-icon-dark.png" alt="" width="14" height="14" /> Docsense</span></div>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig & {
    docsense?: {
      resultLimit?: number;
      searchBar?: Record<string, unknown>;
    };
  },
};

export default config;
