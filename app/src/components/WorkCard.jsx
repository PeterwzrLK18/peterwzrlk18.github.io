import { Link } from 'react-router-dom';

function WorkCard({ work }) {
  if (!work.slug) return null;

  const webpSrc = work.img.replace(/\.png$/i, '.webp');

  return (
    <Link
      to={`/work/${work.slug}`}
      className="block no-underline text-inherit focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-4 focus-visible:rounded-sm"
    >
      <article className="group flex flex-col aspect-[var(--card-ratio)] items-start relative transition-transform duration-300 ease-out hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none">
        <h2 className="relative mb-[5px] font-heading font-semibold text-[var(--color-text-brand-default)] text-[clamp(14px,0.6rem+0.9vw,24px)] tracking-normal leading-[120%] whitespace-nowrap transition-colors duration-300 ease-out group-hover:underline">
          {work.title}
        </h2>
        <div className="flex justify-center items-center h-full relative">
          <picture>
            <source srcSet={webpSrc} type="image/webp" />
            <img
              className="w-full h-full object-cover"
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