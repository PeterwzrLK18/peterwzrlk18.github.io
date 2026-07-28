import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ModalContext } from './modal-context';
import '../modal.css';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const PAN_PX_PER_STEP = 60;
const ZOOM_FACTOR = 1.8;
// Below this movement the gesture is treated as a click, not a drag.
// Prevents drag-release from firing a stray click that exits zoom mode.
const DRAG_THRESHOLD_PX = 5;

function ModalContent({ image, onClose, onNavigate, total, index }) {
  const [isLong, setIsLong] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useReducer(
    (s, a) => (typeof a === 'function' ? a(s) : { ...s, ...a }),
    { x: 0, y: 0, zoom: 1, dragging: false },
  );

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragOffsetRef = useRef({ startClientX: 0, startClientY: 0, startPanX: 0, startPanY: 0 });
  const panBoundsRef = useRef({ maxX: 0, maxY: 0 });

  // Latest zoom state for the global keydown listener (avoids stale closure).
  const stateRef = useRef({ zoomed, isLong, pan });
  useEffect(() => {
    stateRef.current = { zoomed, isLong, pan };
  }, [zoomed, isLong, pan]);

  // Global keyboard: close / nav / zoom-toggle / pan.
  useEffect(() => {
    const isArrowPanOnly = total <= 1;

    const onKey = (e) => {
      const s = stateRef.current;
      if (e.key === 'Escape') {
        if (s.zoomed) {
          setZoomed(false);
          setPan({ x: 0, y: 0, zoom: 1, dragging: false });
        } else {
          onClose();
        }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (s.isLong) {
          e.preventDefault();
          if (s.zoomed) {
            setZoomed(false);
            setPan({ x: 0, y: 0, zoom: 1, dragging: false });
          } else {
            setZoomed(true);
            setPan({ zoom: ZOOM_FACTOR });
          }
        }
        return;
      }
      if (e.key === 'ArrowRight' && total > 1) {
        onNavigate((index + 1) % total);
      } else if (e.key === 'ArrowLeft' && total > 1) {
        onNavigate((index - 1 + total) % total);
      } else if (s.zoomed) {
        const b = panBoundsRef.current;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowDown') dy = PAN_PX_PER_STEP;
        else if (e.key === 'ArrowUp') dy = -PAN_PX_PER_STEP;
        else if (isArrowPanOnly && e.key === 'ArrowRight') dx = PAN_PX_PER_STEP;
        else if (isArrowPanOnly && e.key === 'ArrowLeft') dx = -PAN_PX_PER_STEP;
        if (dx || dy) {
          e.preventDefault();
          setPan((prev) => ({
            x: clamp((prev.x ?? 0) + dx, -b.maxX, b.maxX),
            y: clamp((prev.y ?? 0) + dy, -b.maxY, b.maxY),
          }));
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNavigate, index, total]);

  // Recompute pan bounds whenever canvas size or zoom factor changes.
  const computeBounds = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) {
      panBoundsRef.current = { maxX: 0, maxY: 0 };
      return;
    }
    const imgW = img.offsetWidth * pan.zoom;
    const imgH = img.offsetHeight * pan.zoom;
    const maxX = Math.max(0, (imgW - container.offsetWidth) / 2);
    const maxY = Math.max(0, (imgH - container.offsetHeight) / 2);
    panBoundsRef.current = { maxX, maxY };
  }, [pan.zoom]);

  useEffect(() => {
    computeBounds();
    const onResize = () => computeBounds();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [computeBounds]);

  // Hover-follow: while long & not zoomed, map cursor's vertical position to a
  // vertical pan so the user can scroll through the long image by hovering.
  const onMouseMove = (e) => {
    if (!isLong || zoomed) return;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;
    const rect = container.getBoundingClientRect();
    const imgH = img.offsetHeight * pan.zoom;
    if (imgH <= rect.height) return;
    const ratioY = (e.clientY - rect.top) / rect.height;
    const maxY = (imgH - rect.height) / 2;
    const y = clamp(-ratioY * 2 * maxY + maxY, -maxY, maxY);
    setPan({ x: 0, y });
  };

  // Enter drag-mode while zoomed. Track the mousedown position so that on
  // mouseup we can decide whether the gesture was a click (tiny movement,
  // toggles zoom) or a drag (real movement, just ends pan without exiting).
  const onMouseDown = (e) => {
    if (!zoomed) return;
    e.preventDefault();
    setPan({ dragging: true });
    dragOffsetRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: pan.x ?? 0,
      startPanY: pan.y ?? 0,
      moved: false,
    };
  };

  useEffect(() => {
    if (!pan.dragging) return;
    const onMove = (e) => {
      const b = panBoundsRef.current;
      const dx = e.clientX - dragOffsetRef.current.startClientX;
      const dy = e.clientY - dragOffsetRef.current.startClientY;
      if (!dragOffsetRef.current.moved &&
          Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD_PX) {
        dragOffsetRef.current.moved = true;
      }
      setPan({
        x: clamp(dragOffsetRef.current.startPanX + dx, -b.maxX, b.maxX),
        y: clamp(dragOffsetRef.current.startPanY + dy, -b.maxY, b.maxY),
      });
    };
    const onUp = () => setPan({ dragging: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [pan.dragging]);

  if (!image) return null;

  // img onLoad: compute long-image flag, mark loaded, reset pan/zoom
  // (event-driven — replaces the previous image-src dependency effect so
  // we don't trigger a sync setState inside an effect.)
  const onLoad = (e) => {
    const img = e.currentTarget;
    const ratio = img.naturalHeight / img.naturalWidth;
    setIsLong(ratio > 2);
    setLoaded(true);
    setZoomed(false);
    setPan({ x: 0, y: 0, zoom: 1, dragging: false });
  };

  // Click on long image toggles zoom. A click that immediately followed a
// drag (moved=true) is suppressed so dragging doesn't exit zoom mode.
  const onImgClickToggle = (e) => {
    e.stopPropagation();
    if (!isLong) return;
    if (dragOffsetRef.current.moved) {
      // Just finished a drag; treat mouseup as the end of pan, not a click.
      dragOffsetRef.current.moved = false;
      return;
    }
    if (zoomed) {
      setZoomed(false);
      setPan({ x: 0, y: 0, zoom: 1, dragging: false });
    } else {
      setZoomed(true);
      setPan({ zoom: ZOOM_FACTOR });
    }
  };

  const cursor = zoomed
    ? (pan.dragging ? 'grabbing' : 'grab')
    : (isLong ? 'zoom-in' : 'default');

  const transform = `translate(${pan.x ?? 0}px, ${pan.y ?? 0}px) scale(${pan.zoom})`;

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

      <div
        ref={containerRef}
        className={`modal-content-container${isLong ? ' modal-content-container-long' : ''}`}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={image.src}
          ref={imgRef}
          className={`modal-content${isLong ? ' modal-content-long' : ''}${loaded ? ' modal-content-loaded' : ''}${zoomed ? ' modal-content-zoomed' : ''}`}
          style={{ transform, cursor }}
          src={image.src}
          alt={image.alt || ''}
          onLoad={onLoad}
          onClick={onImgClickToggle}
          draggable={false}
        />
        {isLong && !zoomed && (
          <div className="modal-long-hint" aria-hidden="true">
            Long image &middot; move cursor to scan &middot; click to zoom
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