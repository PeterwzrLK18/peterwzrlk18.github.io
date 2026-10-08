import { useCallback, useEffect, useRef, useState } from 'react';
import { useImageGestures } from './use-image-gestures';
import { ModalContext } from './modal-context';
import '../modal.css';

const PAN_PX_PER_STEP = 60;

function ModalContent({ image, onClose, onNavigate, total, index }) {
  const [isLong, setIsLong] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const rootRef = useRef(null);
  const { pan, zoomed, toggleZoom, moveBy, onPointerDown, onPointerMove, onPointerEnd, onImageClick, onDoubleClick, onViewportClick } =
    useImageGestures({ imgRef, containerRef, loaded, isLong, index, total, onNavigate, onClose });

  // Latest zoom state for the global keydown listener (avoids stale closure).
  const stateRef = useRef({ zoomed, loaded, toggleZoom, moveBy });
  useEffect(() => {
    stateRef.current = { zoomed, loaded, toggleZoom, moveBy };
  }, [zoomed, loaded, toggleZoom, moveBy]);

  // Global keyboard: close / nav / zoom-toggle / pan.
  useEffect(() => {
    const isArrowPanOnly = total <= 1;

    const onKey = (e) => {
      const s = stateRef.current;
      if (e.key === 'Tab') {
        // Focus trap: keep Tab / Shift+Tab cycling inside the modal instead of
        // letting focus leak to the page behind the overlay.
        const root = rootRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => {
          if (el.hasAttribute('disabled')) return false;
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        if (focusables.length === 0) {
          e.preventDefault();
          root.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !root.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !root.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key === 'Escape') {
        if (s.zoomed) {
          s.toggleZoom();
        } else {
          onClose();
        }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        // Don't hijack native activation of buttons/links (close button, dots).
        if (e.target instanceof HTMLElement && e.target.closest('button, a, input, select, textarea')) return;
        if (s.loaded) {
          e.preventDefault();
          s.toggleZoom();
        }
        return;
      }
      if (e.key === 'ArrowRight' && total > 1) {
        e.preventDefault();
        onNavigate((index + 1) % total);
      } else if (e.key === 'ArrowLeft' && total > 1) {
        e.preventDefault();
        onNavigate((index - 1 + total) % total);
      } else if (s.zoomed) {
        let dx = 0, dy = 0;
        if (e.key === 'ArrowDown') dy = PAN_PX_PER_STEP;
        else if (e.key === 'ArrowUp') dy = -PAN_PX_PER_STEP;
        else if (isArrowPanOnly && e.key === 'ArrowRight') dx = PAN_PX_PER_STEP;
        else if (isArrowPanOnly && e.key === 'ArrowLeft') dx = -PAN_PX_PER_STEP;
        if (dx || dy) {
          e.preventDefault();
          s.moveBy(dx, dy);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, onNavigate, index, total]);

  // The keyed ModalContent resets gestures as soon as the image changes.
  // Loading only identifies long images and enables gesture handling.
  const onLoad = (e) => {
    const img = e.currentTarget;
    const ratio = img.naturalHeight / img.naturalWidth;
    setIsLong(ratio > 2);
    setLoaded(true);
  };

  const cursor = zoomed
    ? (pan.dragging ? 'grabbing' : 'grab')
    : (isLong ? 'zoom-in' : 'default');

  const transform = `translate(${pan.x ?? 0}px, ${pan.y ?? 0}px) scale(${pan.zoom})`;

  return (
    <div
      ref={rootRef}
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Image preview'}
      tabIndex={-1}
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

      <div
        ref={containerRef}
        className="modal-content-container"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
        onClick={onViewportClick}
        onDoubleClick={onDoubleClick}
      >
        <img
          ref={imgRef}
          className={`modal-content${isLong ? ' modal-content-long' : ''}${loaded ? ' modal-content-loaded' : ''}${zoomed ? ' modal-content-zoomed' : ''}`}
          style={{ transform, cursor }}
          src={image.src}
          alt={image.alt || ''}
          onLoad={onLoad}
          onClick={onImageClick}
          onDoubleClick={onDoubleClick}
          draggable={false}
          tabIndex={0}
        />
        {isLong && !zoomed && (
          <div className="modal-long-hint" aria-hidden="true">
            Long image &middot; click to zoom
          </div>
        )}
        {isLong && zoomed && (
          <div className="modal-long-hint modal-long-hint-zoomed" aria-hidden="true">
            Drag to pan &middot; click to reset
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
  return (
    <ModalContent
      key={`${currentIndex}:${image.src}`}
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
  // Element that opened the modal — focus returns to it when the modal closes.
  const triggerRef = useRef(null);

  const open = useCallback((images, startIndex) => {
    triggerRef.current = document.activeElement;
    setState({ images, index: startIndex });
  }, []);

  const close = useCallback(() => {
    setState({ images: [], index: 0 });
    // Restore focus to the original trigger element.
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus();
    }
  }, []);

  const navigate = useCallback((idx) => {
    setState((s) => ({ ...s, index: idx }));
  }, []);

  const render = state.images.length > 0;

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
