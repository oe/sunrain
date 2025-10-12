// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { i18n, filterSitemapByDefaultLocale } from "astro-i18n-aut/integration";
import sitemap from '@astrojs/sitemap';

const defaultLocale = "en";
const locales = {
  en: 'en-US',
  zh: 'zh-CN',
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
  integrations: [
    react(),
    tailwind(),
    i18n({
      locales,
      defaultLocale,
    }),
    sitemap({
      i18n: {
        locales,
        defaultLocale,
      },
      filter: filterSitemapByDefaultLocale({ defaultLocale }),
    }),
  ]
});
