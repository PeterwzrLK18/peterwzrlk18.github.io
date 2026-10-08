import { useEffect, useRef } from 'react';
import { useLightboxGallery } from './lightbox-gallery-context';

const containerBase =
  'block relative w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2';
const mediaBase = 'block w-full h-auto';

// Detects animated sources (.webm / .mp4) that should render via
// <video autoPlay muted loop playsInline> instead of static WebP images.
// Videos are excluded from lightbox
// registration because <video> inside the modal would need its own
// playback handling.
function isVideoSrc(src) {
  return /\.(webm|mp4)(\?|$)/i.test(src);
}

function WorkImgContainer({ src, alt, className = '', priority = false }) {
  const gallery = useLightboxGallery();
  const { register, unregister } = gallery;
  const indexRef = useRef(-1);

  const isVideo = isVideoSrc(src);

  useEffect(() => {
    if (isVideo) return; // videos don't register with the lightbox
    const entry = { src, alt };
    const index = register(entry);
    indexRef.current = index;
    return () => {
      if (index >= 0) {
        unregister(index, entry);
      }
    };
  }, [src, alt, register, unregister, isVideo]);

  const cls = className ? `${containerBase} ${className}` : containerBase;

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
      <picture>
        <img
          className={mediaBase}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
      </picture>
    </div>
  );
}

export default WorkImgContainer;
