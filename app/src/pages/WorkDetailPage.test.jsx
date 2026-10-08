import { Profiler, StrictMode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { worksIndex } from '../data/works-index';

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderWork(slug) {
  let commits = 0;
  return render(
    <StrictMode>
      <Profiler id="work-detail" onRender={() => {
        // Fail promptly if image registration triggers an endless update loop.
        if (++commits > 30) throw new Error('Work detail did not settle');
      }}>
        <MemoryRouter initialEntries={[`/work/${slug}`]}>
          <App />
        </MemoryRouter>
      </Profiler>
    </StrictMode>,
  );
}

describe('work detail and image gallery', () => {
  it.each(worksIndex)('renders $slug without an update loop in StrictMode', ({ slug }) => {
    renderWork(slug);
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Enlarge image:/ }).length).toBeGreaterThan(0);
  });

  it('opens the selected image, navigates in order, and restores focus on close', () => {
    renderWork('plagiarism');
    const trigger = screen.getByRole('button', { name: 'Enlarge image: Back Cover Design' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });

    let dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/img/Plagiarism/01_Back.webp');
    expect(within(dialog).getAllByRole('tab')).toHaveLength(4);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/img/Plagiarism/01_All.webp');
    fireEvent.click(within(dialog).getByRole('tab', { name: 'Image 4 of 4' }));
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/img/Plagiarism/01_Cover.webp');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');

    fireEvent.click(trigger);
    dialog = screen.getByRole('dialog');
    expect(within(dialog).getAllByRole('tab')).toHaveLength(4);
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/img/Plagiarism/01_Back.webp');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close image preview' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('replaces the gallery when navigating to another work', () => {
    renderWork('plagiarism');
    fireEvent.click(screen.getByRole('link', { name: 'WORK' }));
    fireEvent.click(screen.getByRole('link', { name: /SONDER/ }));
    const images = screen.getAllByRole('button', { name: /^Enlarge image:/ });
    fireEvent.click(images[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/img/SONDER/Cover A.webp');
    expect(within(dialog).getAllByRole('tab')).toHaveLength(images.length);
  });

  it('shows 404 for an unknown work slug', () => {
    renderWork('missing-work');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Enlarge image:/ })).not.toBeInTheDocument();
  });
});
