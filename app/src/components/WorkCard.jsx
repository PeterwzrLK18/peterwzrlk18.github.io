import { Link } from 'react-router-dom';

function WorkCard({ work }) {
  if (!work.slug) return null;

  const webpSrc = work.img.replace(/\.png$/i, '.webp');

  return (
    <Link to={`/work/${work.slug}`} className="sector-link">
      <article className="sector-item">
        <h2 className="work-title">{work.title}</h2>
        <div className="content">
          <picture>
            <source srcSet={webpSrc} type="image/webp" />
            <img
              className="img"
              src={work.img}
              alt={work.alt}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </article>
    </Link>
  );
}

export default WorkCard;