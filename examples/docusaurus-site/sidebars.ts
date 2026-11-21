import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'features/overview',
        'features/highlight-on-page',
        'features/mdx-and-stemming',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'concepts/why-docsense',
        'concepts/how-docsense-works',
        'concepts/compare-open-source-search',
        'concepts/indexing',
        'concepts/ranking-and-typos',
      ],
    },
    {
      type: 'category',
      label: 'How-to guides',
      collapsed: false,
      items: [
        'how-to/install',
        'how-to/customize-search-bar',
        'how-to/style-search',
        'how-to/use-filters-and-limits',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'reference/plugin-options',
        'reference/css-variables',
        'reference/packages',
      ],
    },
    {
      type: 'category',
      label: 'FAQ and support',
      collapsed: false,
      items: ['faq', 'support'],
    },
  ],
};

export default sidebars;
