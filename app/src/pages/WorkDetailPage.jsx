import { useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import LightboxGallery from '../components/LightboxGallery';
import NotFoundPage from './NotFoundPage';

// 一次性静态导入所有作品 MDX 模块(eager)。
// module 结构:{ default: ReactComponent, meta: {...} }
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
      <Seo
        title={`${meta.title || slug} - Likai Wang`}
        description={meta.description}
        type="article"
      />
      <div className="container">
        <div className="self-identity">
          <div className="title">
            <b>{meta.title}</b>
            {meta.subtitle && <div className="worksubtitle">{meta.subtitle}</div>}
          </div>
          {meta.description && (
            <div className="work-description">
              <p className="work-description">{meta.description}</p>
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