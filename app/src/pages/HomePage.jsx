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
      <section className="works" id="works-list">
        {worksIndex.map(work => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </section>
    </>
  );
}

export default HomePage;