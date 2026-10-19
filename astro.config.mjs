// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { buildMetadata } from './scripts/build-metadata.mjs';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { localizedRoutes } from './scripts/localized-routes.mjs';
import sitemap from '@astrojs/sitemap';

const defaultLocale = "en";
const locales = {
  en: 'en-US',
  'zh-hans': 'zh-Hans',
  'zh-hant': 'zh-Hant',
  es: 'es-ES',
  ja: 'ja-JP',
  ko: 'ko-KR',
  hi: 'hi-IN',
  ar: 'ar-SA'
};

// https://astro.build/config
export default defineConfig({
  site: 'https://sunrain.me',
  trailingSlash: "always",
  server: {
    port: 4362,
  },
  build: {
    format: "directory",
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    buildMetadata(fileURLToPath(new URL('.', import.meta.url))),
    react(),
    localizedRoutes(Object.keys(locales), defaultLocale),
    sitemap({
      filter: page => !new URL(page).pathname.startsWith('/en/'),
      i18n: {
        locales,
        defaultLocale,
      },
    }),
  ]
});
