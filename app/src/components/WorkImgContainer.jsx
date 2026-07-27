import { useEffect, useRef } from 'react';
import { useLightboxGallery } from './lightbox-gallery-context';

const containerBase =
  'block relative w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2';
const imgBase = 'block w-full h-auto';

function WorkImgContainer({ src, alt, className = '' }) {
  const gallery = useLightboxGallery();
  const indexRef = useRef(-1);
  const entryRef = useRef(null);

  useEffect(() => {
    entryRef.current = { src, alt };
    indexRef.current = gallery.register(entryRef.current);
    return () => {
      if (indexRef.current >= 0) {
        gallery.unregister(indexRef.current, entryRef.current);
      }
    };
  }, [src, alt, gallery]);

  const cls = className ? `${containerBase} ${className}` : containerBase;
  const isPng = /\.png$/i.test(src);
  const webpSrc = isPng ? src.replace(/\.png$/i, '.webp') : null;

  return (
    <div
      className={cls}
      onClick={() => gallery.openAt(indexRef.current)}
      role="button"
      tabIndex={0}
      aria-label={`Enlarge image: ${alt}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          gallery.openAt(indexRef.current);
        }
      }}
    >
      {webpSrc ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            className={imgBase}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          className={imgBase}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}

export default WorkImgContainer;