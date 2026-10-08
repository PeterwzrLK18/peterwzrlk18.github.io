import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalProvider } from './Modal';
import LightboxGallery from './LightboxGallery';
import WorkImgContainer from './WorkImgContainer';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function openGallery() {
  render(<ModalProvider><LightboxGallery>
    <WorkImgContainer src="/one.webp" alt="First" />
    <WorkImgContainer src="/two.webp" alt="Second" />
  </LightboxGallery></ModalProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Enlarge image: First' }));
}

function loadImage({ long = false } = {}) {
  const image = within(screen.getByRole('dialog')).getByRole('img');
  const viewport = image.parentElement;
  Object.defineProperties(image, {
    naturalWidth: { configurable: true, value: long ? 100 : 300 },
    naturalHeight: { configurable: true, value: 300 },
    offsetWidth: { configurable: true, value: long ? 100 : 300 },
    offsetHeight: { configurable: true, value: 300 },
  });
  Object.defineProperties(viewport, {
    offsetWidth: { configurable: true, value: 300 },
    offsetHeight: { configurable: true, value: 300 },
  });
  viewport.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 });
  const captures = new Set();
  viewport.setPointerCapture = vi.fn((id) => captures.add(id));
  viewport.hasPointerCapture = vi.fn((id) => captures.has(id));
  viewport.releasePointerCapture = vi.fn((id) => captures.delete(id));
  fireEvent.load(image);
  return { image, viewport };
}

// jsdom lacks native PointerEvent and capture; provide the browser event
// properties while exercising the real modal and its gesture handlers.
function pointer(target, type, { id = 1, pointerType = 'touch', x = 150, y = 150 } = {}) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: id }, pointerType: { value: pointerType }, isPrimary: { value: id === 1 } });
  fireEvent(target, event);
}
function tap(viewport, options) {
  pointer(viewport, 'pointerdown', options);
  pointer(viewport, 'pointerup', options);
}
function doubleTap(viewport, options) { tap(viewport, options); tap(viewport, options); }
function swipe(viewport, start, end) {
  pointer(viewport, 'pointerdown', start);
  pointer(viewport, 'pointermove', end);
  pointer(viewport, 'pointerup', end);
}
const currentImage = () => within(screen.getByRole('dialog')).getByRole('img');

describe('lightbox gestures with the original controls', () => {
  it('keeps only the original close button and dots, with keyboard focus trapped', () => {
    openGallery(); loadImage();
    expect(within(screen.getByRole('dialog')).getAllByRole('button')).toHaveLength(1);
    const first = screen.getByRole('button', { name: 'Close image preview' });
    const last = screen.getByRole('tab', { name: 'Image 2 of 2' });
    last.focus(); fireEvent.keyDown(last, { key: 'Tab' }); expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(last).toHaveFocus();
  });

  it('double-taps to zoom around the tapped point and double-taps again to fit', () => {
    openGallery(); const { image, viewport } = loadImage();
    doubleTap(viewport, { x: 100, y: 100 });
    expect(image.style.transform).toBe('translate(75px, 75px) scale(2.5)');
    fireEvent.click(image);
    expect(image.style.transform).toBe('translate(75px, 75px) scale(2.5)');
    doubleTap(viewport, { x: 100, y: 100 });
    expect(image.style.transform).toBe('translate(0px, 0px) scale(1)');
  });

  it('does not interpret distant or delayed taps as a double-tap', () => {
    let now = 0; vi.spyOn(performance, 'now').mockImplementation(() => now);
    openGallery(); const { image, viewport } = loadImage();
    tap(viewport, { x: 100 }); now = 400; tap(viewport, { x: 100 });
    expect(image.style.transform).toContain('scale(1)');
    now = 500; tap(viewport, { x: 200 });
    expect(image.style.transform).toContain('scale(1)');
  });

  it('swipes between images at fit scale, wraps, and resets after navigation', () => {
    openGallery(); let { viewport } = loadImage();
    swipe(viewport, { x: 250 }, { x: 50 });
    expect(currentImage()).toHaveAttribute('src', '/two.webp');
    expect(currentImage().style.transform).toBe('translate(0px, 0px) scale(1)');
    ({ viewport } = loadImage());
    swipe(viewport, { x: 250 }, { x: 50 });
    expect(currentImage()).toHaveAttribute('src', '/one.webp');
    ({ viewport } = loadImage());
    swipe(viewport, { x: 50 }, { x: 250 });
    expect(currentImage()).toHaveAttribute('src', '/two.webp');
  });

  it('ignores short, vertical, and diagonal swipes', () => {
    openGallery(); const { viewport } = loadImage();
    swipe(viewport, { x: 100 }, { x: 120 });
    swipe(viewport, { x: 100, y: 50 }, { x: 120, y: 250 });
    swipe(viewport, { x: 100, y: 50 }, { x: 250, y: 250 });
    expect(currentImage()).toHaveAttribute('src', '/one.webp');
  });

  it('pans instead of switching images while zoomed and clamps both axes', () => {
    openGallery(); const { image, viewport } = loadImage();
    doubleTap(viewport);
    swipe(viewport, { x: 150, y: 150 }, { x: 1000, y: -1000 });
    expect(image.style.transform).toBe('translate(225px, -225px) scale(2.5)');
    expect(currentImage()).toHaveAttribute('src', '/one.webp');
    expect(image.style.cursor).toBe('grab');
  });

  it('pinches smoothly around the midpoint, then continues panning with the remaining finger', () => {
    openGallery(); const { image, viewport } = loadImage();
    pointer(viewport, 'pointerdown', { x: 100 });
    pointer(viewport, 'pointerdown', { id: 2, x: 200 });
    pointer(viewport, 'pointermove', { x: 50 });
    pointer(viewport, 'pointermove', { id: 2, x: 250 });
    expect(image.style.transform).toBe('translate(0px, 0px) scale(2)');
    pointer(viewport, 'pointerup', { id: 2, x: 250 });
    pointer(viewport, 'pointermove', { x: 80 });
    expect(image.style.transform).toBe('translate(30px, 0px) scale(2)');
    pointer(viewport, 'pointerup', { x: 80 });
    expect(currentImage()).toHaveAttribute('src', '/one.webp');
    expect(image.style.cursor).toBe('grab');
  });

  it('limits pinch scale, ignores a third finger, and never swipes after pinching back to fit', () => {
    openGallery(); const { image, viewport } = loadImage();
    pointer(viewport, 'pointerdown', { x: 100 });
    pointer(viewport, 'pointerdown', { id: 2, x: 200 });
    pointer(viewport, 'pointermove', { x: -1000 });
    expect(image.style.transform).toContain('scale(4)');
    const transform = image.style.transform;
    pointer(viewport, 'pointerdown', { id: 3, x: 1000 });
    pointer(viewport, 'pointermove', { id: 3, x: -1000 });
    expect(image.style.transform).toBe(transform);
    pointer(viewport, 'pointermove', { x: 140 });
    pointer(viewport, 'pointermove', { id: 2, x: 160 });
    expect(image.style.transform).toBe('translate(0px, 0px) scale(1)');
    pointer(viewport, 'pointerup', { id: 2, x: 160 });
    pointer(viewport, 'pointermove', { x: 20 });
    pointer(viewport, 'pointerup', { x: 20 });
    expect(currentImage()).toHaveAttribute('src', '/one.webp');
  });

  it.each(['pointercancel', 'lostpointercapture'])('cancels %s without navigating and accepts a fresh gesture', (event) => {
    openGallery(); const { viewport } = loadImage();
    pointer(viewport, 'pointerdown', { x: 250 });
    pointer(viewport, 'pointermove', { x: 50 });
    pointer(viewport, event, { x: 50 });
    pointer(viewport, 'pointerup', { x: 50 });
    expect(currentImage()).toHaveAttribute('src', '/one.webp');
    swipe(viewport, { x: 250 }, { x: 50 });
    expect(currentImage()).toHaveAttribute('src', '/two.webp');
  });

  it('resets zoom on dot navigation and recalculates pan bounds after resizing', () => {
    openGallery(); const { image, viewport } = loadImage();
    doubleTap(viewport);
    swipe(viewport, {}, { x: 1000, y: 1000 });
    Object.defineProperties(viewport, { offsetWidth: { configurable: true, value: 700 }, offsetHeight: { configurable: true, value: 700 } });
    fireEvent(window, new Event('resize'));
    expect(image.style.transform).toBe('translate(25px, 25px) scale(2.5)');
    fireEvent.click(screen.getByRole('tab', { name: 'Image 2 of 2' }));
    expect(currentImage().style.transform).toBe('translate(0px, 0px) scale(1)');
  });

  it('retains desktop long-image clicks and suppresses the click after dragging', () => {
    openGallery(); const { image, viewport } = loadImage({ long: true });
    tap(viewport, { pointerType: 'mouse' }); fireEvent.click(image);
    expect(image.style.transform).toContain('scale(1.8)');
    swipe(viewport, { pointerType: 'mouse' }, { pointerType: 'mouse', y: 250 });
    fireEvent.click(image);
    expect(image.style.transform).toContain('scale(1.8)');
    tap(viewport, { pointerType: 'mouse' }); fireEvent.click(image);
    expect(image.style.transform).toContain('scale(1)');
  });

  it('supports desktop double-click and keyboard reset without leaving a gesture active', () => {
    openGallery(); const { image, viewport } = loadImage();
    fireEvent.doubleClick(image, { clientX: 150, clientY: 150 });
    expect(image.style.transform).toContain('scale(2.5)');
    pointer(viewport, 'pointerdown');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(image.style.transform).toBe('translate(0px, 0px) scale(1)');
    expect(viewport.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
