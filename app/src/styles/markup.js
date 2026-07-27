// Shared Tailwind utility class strings used by MDX work pages and WorkDetailPage.
// Extracted from works.css / NYBS.css after Phase 4b cleanup.

/* Layout primitives for work detail image sections */

export const sectionImgCls =
  'block max-w-[1720px] w-full';

export const sectionImgItemCls =
  'block w-full h-auto';

export const section2imgCls =
  'flex flex-nowrap items-start justify-start gap-5 max-w-[1720px] w-full max-desktop:flex-col max-desktop:gap-2.5';

export const section2imgItemCls =
  'block w-[calc(50%-10px)] h-auto max-desktop:w-full';

/* Section grouping: feature-unit + feature-header + feature / title-element */

export const featureUnitCls =
  'flex flex-col gap-4 max-w-[1720px] w-full';

export const featureHeaderCls =
  'flex flex-wrap justify-between gap-2 w-full max-wide:flex-col max-wide:items-start';

export const featureCls =
  'flex w-1/2 max-wide:w-full';

export const featureGalleryCls = '';
// .feature-gallery had no styles in original CSS; kept purely as a semantic wrapper.

/* Typography for text inside feature headers */

export const featuretitleCls =
  'font-heading font-normal text-[var(--color-brand-800)] text-[clamp(14px,0.6rem+0.9vw,24px)] tracking-normal leading-[1.3] max-tablet:text-[var(--fs-h2)] max-tablet:leading-[1.2]';

export const descriptionCls =
  'font-heading font-semibold text-[var(--color-brand-500)] text-[clamp(14px,0.6rem+0.9vw,24px)] tracking-normal leading-[120%] max-w-[560px] text-left [text-wrap:pretty] flex-shrink-0 ml-auto max-wide:ml-0 max-wide:max-w-[560px] max-wide:w-full max-tablet:text-[var(--fs-h2)] max-tablet:leading-[var(--lh-normal)] max-tablet:break-words';

// Variant used by .description-text element in plagiarism.mdx — same desktop
// behaviour as .description (inherits from wrapper) plus mobile font-size reset.
export const descriptionTextCls =
  'max-tablet:text-[var(--fs-h2)] max-tablet:leading-[var(--lh-normal)] max-tablet:break-words';

/* NYBS-specific 3-image layout */

export const section3imgCls =
  'flex items-start justify-between gap-5 max-desktop:flex-col max-desktop:gap-2.5 max-desktop:w-full';

export const leftSectorItemCls =
  'w-[calc(50%-10px)] max-desktop:w-full max-desktop:gap-2.5';

export const rightSectorItemCls =
  'flex flex-col w-[calc(50%-10px)] gap-5 max-w-[800px] max-desktop:w-full max-desktop:gap-2.5';

/* Container styles for the work detail page itself */

export const workDetailContainerCls =
  'flex flex-col gap-[var(--work-section-gap)] px-[var(--side-padding)] mx-auto mb-[30px] w-full max-w-[1720px]';

export const selfIdentityCls =
  'flex flex-wrap justify-between w-full max-w-[1720px] max-wide:flex-col max-wide:items-start max-wide:gap-4';

export const titleBlockCls =
  'font-heading font-bold text-[var(--color-brand-900)] text-[clamp(28px,1.5rem+2vw,48px)] tracking-normal leading-[120%] max-w-[800px] max-tablet:text-[var(--fs-h1)] max-tablet:leading-[var(--lh-tight)] max-tablet:tracking-[-0.02em] max-tablet:font-extrabold';

export const worksubtitleCls =
  'font-mono font-normal text-[var(--color-brand-500)] text-[clamp(16px,0.8rem+0.6vw,20px)] tracking-normal leading-[120%] max-tablet:text-[12px] max-tablet:font-normal max-tablet:tracking-[0.02em] max-tablet:mt-1.5 max-tablet:mb-2.5';

export const workDescriptionWrapCls =
  'font-heading font-semibold text-[var(--color-text-brand-default)] text-[clamp(14px,0.6rem+0.9vw,24px)] tracking-normal leading-[120%] max-w-[640px] text-left [text-wrap:pretty] flex-shrink-0 ml-auto max-wide:ml-0 max-wide:max-w-[560px] max-wide:w-full max-tablet:text-[var(--fs-h2)] max-tablet:leading-[var(--lh-normal)] max-tablet:break-words';

/* Inline workaround for the iframe at the bottom of comfypad/form-of-vertebra */

export const iframeContainerCls =
  'block relative w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2';

export const iframePosterCls =
  'block w-full h-auto aspect-video border-none';