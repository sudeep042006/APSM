import youtube from './youtube.js';
import meta from './meta.js';
import linkedin from './linkedin.js';

export const platforms = {
  youtube,
  meta,
  linkedin,
  facebook: meta.facebook,
  instagram: meta.instagram
};
