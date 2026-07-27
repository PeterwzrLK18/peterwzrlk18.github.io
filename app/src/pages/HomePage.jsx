import WorkCard from '../components/WorkCard';
import Seo from '../components/Seo';
import { worksIndex } from '../data/works-index';

function HomePage() {
  return (
    <>
      <Seo
        title="Portfolio - Likai Wang"
        description="Likai Wang's portfolio showcasing his work and experience in design and development."
        image="/img/home/comfypad-img.png"
      />
      <section
        id="works-list"
        className="grid grid-cols-4 gap-y-2.5 gap-x-5 mx-auto w-full max-w-[1720px] px-[var(--side-padding)] max-wide:grid-cols-3 max-desktop:grid-cols-2 max-mini:grid-cols-1"
      >
        {worksIndex.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </section>
    </>
  );
}

export default HomePage;