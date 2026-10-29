// Version changed browser/share exports so returning visitors fetch the current files.
const version = 'aligned-20261029';

export const brandAssets = {
  logoPng: `/logo.png?v=${version}`,
  logoAvif: `/logo.avif?v=${version}`,
  favicon: `/favicon.png?v=${version}`,
  shareImage: `/og-image.jpg?v=${version}`,
} as const;
