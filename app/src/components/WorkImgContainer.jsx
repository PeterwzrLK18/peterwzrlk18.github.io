import { useEffect, useRef } from 'react';
import { useLightboxGallery } from './lightbox-gallery-context';

const containerBase =
  'block relative w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2';
const mediaBase = 'block w-full h-auto';

// Detects animated sources (.webm / .mp4) that should render via
// <video autoPlay muted loop playsInline> instead of the picture/img
// pair used for static images. Videos are excluded from lightbox
// registration because <video> inside the modal would need its own
// playback handling.
function isVideoSrc(src) {
  return /\.(webm|mp4)(\?|$)/i.test(src);
}

function WorkImgContainer({ src, alt, className = '' }) {
  const gallery = useLightboxGallery();
  const indexRef = useRef(-1);
  const entryRef = useRef(null);

  const isVideo = isVideoSrc(src);

  useEffect(() => {
    if (isVideo) return; // videos don't register with the lightbox
    entryRef.current = { src, alt };
    indexRef.current = gallery.register(entryRef.current);
    return () => {
      if (indexRef.current >= 0) {
        gallery.unregister(indexRef.current, entryRef.current);
      }
    };
  }, [src, alt, gallery, isVideo]);

  const cls = className ? `${containerBase} ${className}` : containerBase;
  const isPng = /\.png$/i.test(src);
  const webpSrc = isPng ? src.replace(/\.png$/i, '.webp') : null;

  if (isVideo) {
    const webmSrc = src.replace(/\.(webm|mp4)$/i, '.webm');
    const mp4Src = src.replace(/\.(webm|mp4)$/i, '.mp4');
    return (
      <div className={`${cls} cursor-default`} role="img" aria-label={alt}>
        <video
          className={mediaBase}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      </div>
    );
  }

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
            className={mediaBase}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          className={mediaBase}
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