import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import HomePage from './HomePage';

const originalWidth = window.innerWidth;

afterEach(() => {
  cleanup();
  window.innerWidth = originalWidth;
});

function renderHome(width) {
  window.innerWidth = width;
  render(<StrictMode><MemoryRouter><HomePage /></MemoryRouter></StrictMode>);
}

function expectLoading(eagerCount) {
  const images = screen.getAllByRole('img');
  expect(images.filter(image => image.getAttribute('loading') === 'eager')).toHaveLength(eagerCount);
  expect(images.slice(eagerCount).every(image => image.getAttribute('loading') === 'lazy')).toBe(true);
  expect(images[0]).toHaveAttribute('fetchpriority', 'high');
  expect(images.slice(1).every(image => image.getAttribute('fetchpriority') === 'auto')).toBe(true);
}

describe('home image loading', () => {
  it.each([[490, 1], [491, 2], [900, 2], [901, 3], [1310, 3], [1311, 4]])(
    'loads the first row immediately at %ipx (%i images)', (width, count) => {
      renderHome(width);
      expectLoading(count);
    },
  );

  it('updates loading hints when the viewport changes without replacing image URLs', () => {
    renderHome(1680);
    const sources = screen.getAllByRole('img').map(image => image.getAttribute('src'));
    expectLoading(4);
    window.innerWidth = 390;
    fireEvent(window, new Event('resize'));
    expectLoading(1);
    window.innerWidth = 950;
    fireEvent(window, new Event('resize'));
    expectLoading(3);
    expect(screen.getAllByRole('img').map(image => image.getAttribute('src'))).toEqual(sources);
  });
});
