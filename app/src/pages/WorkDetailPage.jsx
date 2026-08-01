import { useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import LightboxGallery from '../components/LightboxGallery';
import NotFoundPage from './NotFoundPage';
import { worksIndex } from '../data/works-index';
import {
  workDetailContainerCls,
  selfIdentityCls,
  titleBlockCls,
  worksubtitleCls,
  workDescriptionWrapCls,
  workDescriptionTextCls,
} from '../styles/markup';

const modules = import.meta.glob('../works/*.mdx', { eager: true });

function WorkDetailPage() {
  const { slug } = useParams();
  const path = `../works/${slug}.mdx`;
  const mod = modules[path];

  if (!mod) return <NotFoundPage />;

  const Work = mod.default;
  const meta = mod.meta || {};
  // Match the current work from the index by slug. If it's missing (or has no
  // cover image) we pass undefined and Seo falls back to its OG_FALLBACK_IMG
  // (/img/home/comfypad-img.png), so share cards never break.
  const currentWork = worksIndex.find((w) => w.slug === slug);

  return (
    <>
      <Seo
        title={`${meta.title || slug} - Likai Wang`}
        description={meta.description}
        image={currentWork?.img}
        type="article"
      />
      <div className={workDetailContainerCls}>
        <div className={selfIdentityCls}>
          <div className={titleBlockCls}>
            <b>{meta.title}</b>
            {meta.subtitle && <div className={worksubtitleCls}>{meta.subtitle}</div>}
          </div>
          {meta.description && (
            <div className={workDescriptionWrapCls}>
              <p className={workDescriptionTextCls}>{meta.description}</p>
            </div>
          )}
        </div>
        <LightboxGallery>
          <Work />
        </LightboxGallery>
      </div>
    </>
  );
}

export default WorkDetailPage;