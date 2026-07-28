// Build an absolute URL for social-card meta tags.
// GitHub Pages serves this repo at https://peterwzrlk18.github.io
const SITE_ORIGIN = 'https://peterwzrlk18.github.io';

export function absoluteUrl(path) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const rel = path.startsWith('/') ? path : `/${path}`;
  // encodeURIComponent would also encode the leading "/", so split-join.
  // encodeURI preserves reserved chars (/?#) but encodes spaces and non-ASCII.
  return `${SITE_ORIGIN}${encodeURI(rel)}`;
}