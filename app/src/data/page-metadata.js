import { worksIndex } from './works-index.js';
import { workMetadata } from './work-metadata.js';

const coverSize = { imageWidth: 780, imageHeight: 500 };

// Used by React and the static entry generator; image sizes are checked at build time.
export const pageMetadata = {
  '/': {
    title: 'Portfolio - Likai Wang',
    description: "Likai Wang's portfolio showcasing his work and experience in design and development.",
    image: '/img/home/comfypad-img.webp',
    imageAlt: 'Likai Wang — Portfolio',
    ...coverSize,
  },
  '/about': {
    title: 'About - Likai Wang',
    description: 'Shenzhen-based designer focused on the intersection of Intelligent Systems and Hardware Interaction, transitioning from visual and motion design to functional, hardware-led products.',
    image: '/img/about/Kowsky Plaza_Glass img.webp',
    imageAlt: 'Kowsky Plaza Glass Image',
    imageWidth: 1358,
    imageHeight: 1920,
  },
  ...Object.fromEntries(worksIndex.map(work => {
    const meta = workMetadata[work.slug];
    return [`/work/${work.slug}`, {
      title: `${meta.title} - Likai Wang`,
      description: meta.description,
      image: work.img,
      imageAlt: work.alt,
      type: 'article',
      ...coverSize,
    }];
  })),
};

export function getPageMetadata(path) {
  return { ...pageMetadata[path], path };
}
