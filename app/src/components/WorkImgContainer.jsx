import { useEffect, useRef } from 'react';
import { useLightboxGallery } from './lightbox-gallery-context';

/**
 * 包装作品详情页里的图片:
 * - 自动生成 webp source + PNG/GIF fallback(<picture>)
 * - 注册到当前页的 LightboxGallery;点击触发 Modal 显示该页图片数组
 *
 * src 接受 png / gif / webp 路径;webp 自动从 PNG 路径推断
 */
function WorkImgContainer({ src, alt, className = '' }) {
  const gallery = useLightboxGallery();
  const indexRef = useRef(-1);
  const entryRef = useRef(null);

  useEffect(() => {
    // 注册到画廊,记录自己的 index 与 entry 引用
    entryRef.current = { src, alt };
    indexRef.current = gallery.register(entryRef.current);
    return () => {
      if (indexRef.current >= 0) {
        gallery.unregister(indexRef.current, entryRef.current);
      }
    };
  }, [src, alt, gallery]); // src/alt 不变时只注册一次

  const cls = className ? `work-img-container ${className}` : 'work-img-container';
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
            className="poster-img"
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          className="poster-img"
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