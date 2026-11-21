import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Build-time index',
    description: (
      <>
        Docsense scans your Markdown and MDX when Docusaurus builds. The search
        index ships with your site as a static JSON file.
      </>
    ),
  },
  {
    title: 'Local search',
    description: (
      <>
        Queries run in the browser. There is no Docsense cloud API and no
        crawler account to approve.
      </>
    ),
  },
  {
    title: 'Filters and page limits',
    description: (
      <>
        Narrow results by page type and show a default of 8 pages, adjustable
        with − / + in the modal.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
