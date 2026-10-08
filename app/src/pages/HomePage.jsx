import { useSyncExternalStore } from 'react';
import WorkCard from '../components/WorkCard';
import Seo from '../components/Seo';
import { worksIndex } from '../data/works-index';
import { getPageMetadata } from '../data/page-metadata';

// Match the grid's max-mini / max-desktop / max-wide breakpoints.
function getFirstRowCount() {
  const width = window.innerWidth;
  return width < 491 ? 1 : width < 901 ? 2 : width < 1311 ? 3 : 4;
}

function subscribeToResize(onChange) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function HomePage() {
  const firstRowCount = useSyncExternalStore(subscribeToResize, getFirstRowCount, () => 1);

  return (
    <>
      <Seo {...getPageMetadata('/')} />
      <section
        id="works-list"
        className="grid grid-cols-4 gap-y-5 gap-x-5 mx-auto w-full max-w-[1720px] px-[var(--side-padding)] max-wide:grid-cols-3 max-desktop:grid-cols-2 max-mini:grid-cols-1"
      >
        {worksIndex.map((work, index) => (
          <WorkCard key={work.slug} work={work} eager={index < firstRowCount} priority={index === 0} />
        ))}
      </section>
    </>
  );
}

export default HomePage;
