import { useCallback, useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const FIT_SCALE = 1.01;
const MAX_SCALE = 4;

export function useImageGestures({ imgRef, containerRef, loaded, isLong, index, total, onNavigate, onClose }) {
  const [pan, setPan] = useState({ x: 0, y: 0, zoom: 1, dragging: false });
  const panRef = useRef(pan);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const lastTapRef = useRef(null);
  const pointerTypeRef = useRef('mouse');
  const suppressClickRef = useRef(false);

  const applyPan = useCallback((next) => {
    const image = imgRef.current;
    const viewport = containerRef.current;
    const zoom = clamp(next.zoom, 1, MAX_SCALE);
    const maxX = Math.max(0, ((image?.offsetWidth || 0) * zoom - (viewport?.offsetWidth || 0)) / 2);
    const maxY = Math.max(0, ((image?.offsetHeight || 0) * zoom - (viewport?.offsetHeight || 0)) / 2);
    const value = { ...next, zoom, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
    const prev = panRef.current;
    if (value.x === prev.x && value.y === prev.y && value.zoom === prev.zoom && value.dragging === prev.dragging) return;
    panRef.current = value;
    setPan(value);
  }, [imgRef, containerRef]);

  const cancelGesture = useCallback(() => {
    const ids = [...pointersRef.current.keys()];
    pointersRef.current.clear();
    gestureRef.current = null;
    lastTapRef.current = null;
    suppressClickRef.current = true;
    for (const id of ids) {
      if (containerRef.current?.hasPointerCapture(id)) containerRef.current.releasePointerCapture(id);
    }
    applyPan({ ...panRef.current, dragging: false });
  }, [applyPan, containerRef]);

  useEffect(() => {
    const resize = () => {
      cancelGesture();
      applyPan(panRef.current);
    };
    window.addEventListener('resize', resize);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    if (containerRef.current) observer?.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, [applyPan, cancelGesture, containerRef]);

  const relativePoint = (point) => {
    const rect = containerRef.current.getBoundingClientRect();
    return { x: point.x - rect.left - rect.width / 2, y: point.y - rect.top - rect.height / 2 };
  };

  const toggleZoom = (point, factor = 2.5) => {
    cancelGesture();
    const current = panRef.current;
    if (current.zoom > FIT_SCALE) {
      applyPan({ x: 0, y: 0, zoom: 1, dragging: false });
    } else {
      const anchor = point ? relativePoint(point) : { x: 0, y: 0 };
      applyPan({ x: anchor.x * (1 - factor), y: anchor.y * (1 - factor), zoom: factor, dragging: false });
    }
  };

  const startSingle = (point, hadMulti = false) => {
    gestureRef.current = {
      mode: panRef.current.zoom > FIT_SCALE ? 'pan' : 'swipe',
      start: point, startPan: { ...panRef.current }, startTime: performance.now(),
      hadMulti, moved: hadMulti, axis: null,
    };
  };

  const onPointerDown = (event) => {
    if (!loaded || event.button !== 0 || pointersRef.current.size >= 2) return;
    pointerTypeRef.current = event.pointerType;
    suppressClickRef.current = false;
    const point = { x: event.clientX, y: event.clientY, type: event.pointerType };
    pointersRef.current.set(event.pointerId, point);
    if (event.pointerType !== 'mouse' || panRef.current.zoom > FIT_SCALE) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (event.pointerType !== 'mouse' || panRef.current.zoom > FIT_SCALE) event.preventDefault();
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      const center = relativePoint(midpoint(a, b));
      const current = panRef.current;
      gestureRef.current = {
        mode: 'pinch', hadMulti: true, moved: true,
        startDistance: Math.max(1, distance(a, b)), startZoom: current.zoom,
        anchor: { x: (center.x - current.x) / current.zoom, y: (center.y - current.y) / current.zoom },
      };
      lastTapRef.current = null;
      applyPan({ ...current, dragging: true });
    } else {
      startSingle(point);
      if (panRef.current.zoom > FIT_SCALE) applyPan({ ...panRef.current, dragging: true });
    }
  };

  const onPointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }
    const point = { x: event.clientX, y: event.clientY, type: event.pointerType };
    pointersRef.current.set(event.pointerId, point);
    const gesture = gestureRef.current;
    if (!gesture) return;
    if (gesture.mode === 'pinch') {
      const [a, b] = [...pointersRef.current.values()];
      if (!b) return;
      const zoom = clamp(gesture.startZoom * distance(a, b) / gesture.startDistance, 1, MAX_SCALE);
      const center = relativePoint(midpoint(a, b));
      applyPan({ x: center.x - gesture.anchor.x * zoom, y: center.y - gesture.anchor.y * zoom, zoom, dragging: true });
      return;
    }
    const dx = point.x - gesture.start.x;
    const dy = point.y - gesture.start.y;
    if (Math.hypot(dx, dy) > 8) {
      gesture.moved = true;
      lastTapRef.current = null;
    }
    if (gesture.mode === 'pan') {
      applyPan({ ...panRef.current, x: gesture.startPan.x + dx, y: gesture.startPan.y + dy, dragging: true });
    } else if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 12) {
      gesture.axis = Math.abs(dx) > Math.abs(dy) * 1.25 ? 'horizontal' : 'vertical';
    }
  };

  const onPointerEnd = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const gesture = gestureRef.current;
    const point = { x: event.clientX, y: event.clientY, type: pointerTypeRef.current };
    pointersRef.current.delete(event.pointerId);
    if (event.type !== 'pointerup') {
      // A cancelled or interrupted sequence must never become a tap or swipe.
      cancelGesture();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointersRef.current.size) {
      startSingle([...pointersRef.current.values()][0], true);
      return;
    }
    gestureRef.current = null;
    suppressClickRef.current = !!gesture?.moved;
    const current = panRef.current;
    applyPan(current.zoom <= FIT_SCALE ? { x: 0, y: 0, zoom: 1, dragging: false } : { ...current, dragging: false });
    if (!gesture || gesture.hadMulti || point.type === 'mouse') return;
    const dx = point.x - gesture.start.x;
    const dy = point.y - gesture.start.y;
    const elapsed = performance.now() - gesture.startTime;
    const threshold = Math.max(40, Math.min(80, (containerRef.current?.offsetWidth || 320) * 0.18));
    if (gesture.mode === 'swipe' && gesture.axis === 'horizontal' && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.5 && total > 1) {
      lastTapRef.current = null;
      onNavigate((index + (dx < 0 ? 1 : -1) + total) % total);
    } else if (!gesture.moved && distance(point, gesture.start) < 8 && elapsed < 250) {
      const now = performance.now();
      const previous = lastTapRef.current;
      if (previous && now - previous.time < 320 && distance(point, previous) < 24) {
        toggleZoom(point);
      } else {
        lastTapRef.current = { ...point, time: now };
      }
    }
  };

  const onImageClick = (event) => {
    event.stopPropagation();
    if (pointerTypeRef.current !== 'mouse' || !isLong || !loaded || suppressClickRef.current) return;
    toggleZoom(undefined, 1.8);
  };

  const onDoubleClick = (event) => {
    event.stopPropagation();
    if (pointerTypeRef.current === 'mouse' && !isLong && loaded && !suppressClickRef.current) {
      toggleZoom({ x: event.clientX, y: event.clientY });
    }
  };

  const onViewportClick = (event) => {
    event.stopPropagation();
    if (event.target !== event.currentTarget || pointerTypeRef.current !== 'mouse' || suppressClickRef.current) return;
    if (panRef.current.zoom > FIT_SCALE) onImageClick(event);
    else onClose();
  };

  const moveBy = (dx, dy) => applyPan({ ...panRef.current, x: panRef.current.x + dx, y: panRef.current.y + dy });

  return { pan, zoomed: pan.zoom > FIT_SCALE, toggleZoom, moveBy, onPointerDown, onPointerMove, onPointerEnd, onImageClick, onDoubleClick, onViewportClick };
}
