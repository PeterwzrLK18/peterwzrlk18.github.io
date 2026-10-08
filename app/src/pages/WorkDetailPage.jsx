import { useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import LightboxGallery from '../components/LightboxGallery';
import NotFoundPage from './NotFoundPage';
import { getPageMetadata } from '../data/page-metadata';
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

  return (
    <>
      <Seo {...getPageMetadata(`/work/${slug}`)} />
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
