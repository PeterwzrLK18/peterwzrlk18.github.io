import { useCallback, useEffect, useState } from 'react';
import { ModalContext } from './modal-context';
import '../modal.css';

function ModalContent({ image, onClose, onNavigate, total, index }) {
  const [isLong, setIsLong] = useState(false);
  // 标记当前 img 是否已加载完(切图后到 onLoad 之间的空白)
  const [loaded, setLoaded] = useState(false);

  // ESC 关闭,← → 翻页
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && total > 1) {
        onNavigate((index + 1) % total);
      } else if (e.key === 'ArrowLeft' && total > 1) {
        onNavigate((index - 1 + total) % total);
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNavigate, index, total]);

  if (!image) return null;

  const onLoad = (e) => {
    const img = e.currentTarget;
    const ratio = img.naturalHeight / img.naturalWidth;
    setIsLong(ratio > 2);
    setLoaded(true);
  };

  // 当 image.src 变更,新图尚未 onLoad,loaded 重置由 key 实施(见下方 img)

  return (
    <div
      className={`modal${isLong ? ' modal-long' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Image preview'}
      onClick={onClose}
    >
      <button
        type="button"
        className="modal-close"
        aria-label="Close image preview"
        onClick={onClose}
        autoFocus
      >
        &times;
      </button>

      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        <img
          key={image.src}
          className={`modal-content${isLong ? ' modal-content-long' : ''}${loaded ? ' modal-content-loaded' : ''}`}
          src={image.src}
          alt={image.alt || ''}
          onLoad={onLoad}
        />
        {isLong && (
          <div className="modal-long-hint" aria-hidden="true">
            Long image &middot; hover to inspect
          </div>
        )}
      </div>

      {total > 1 && (
        <div
          className="modal-dots"
          role="tablist"
          aria-label="Image navigation"
          onClick={(e) => e.stopPropagation()}
        >
          {Array.from({ length: total }, (_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === index}
              aria-label={`Image ${idx + 1} of ${total}`}
              className={`modal-dot ${idx === index ? 'modal-dot-active' : ''}`}
              onClick={() => onNavigate(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ images, currentIndex, onClose, onNavigate }) {
  const image = images[currentIndex];
  // 不用 key 重挂载 — 切图时只换 src,组件保持挂载,避免 modalFadeIn 重放与 img 重渲闪烁
  return (
    <ModalContent
      image={image}
      onClose={onClose}
      onNavigate={onNavigate}
      total={images.length}
      index={currentIndex}
    />
  );
}

export function ModalProvider({ children }) {
  const [state, setState] = useState({ images: [], index: 0 });

  const open = useCallback((images, startIndex) => {
    setState({ images, index: startIndex });
  }, []);

  const close = useCallback(() => setState({ images: [], index: 0 }), []);

  const navigate = useCallback((idx) => {
    setState((s) => ({ ...s, index: idx }));
  }, []);

  const render = state.images && state.images.length > 0;

  return (
    <ModalContext.Provider value={{ open }}>
      {children}
      {render && (
        <Modal
          images={state.images}
          currentIndex={state.index}
          onClose={close}
          onNavigate={navigate}
        />
      )}
    </ModalContext.Provider>
  );
}