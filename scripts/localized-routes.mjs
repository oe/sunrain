import { cp, readdir, rm } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Static Astro routes need a distinct template entry for each locale at build
// time. The historical /en/ aliases are retained with canonical unprefixed URLs.
// Only repository-authored .astro files are read; no glob parser or input
// from visitors is involved. Generated copies are ignored by source identity.
export function localizedRoutes(locales, defaultLocale = 'en') {
  if (!locales.includes(defaultLocale)) throw new Error('Default locale must be present');
  let generated = [];
  const cleanup = async () => { await Promise.all(generated.map(path => rm(path,{recursive:true,force:true}))); };
  return {
    name: 'sunrain-localized-routes',
    hooks: {
      'astro:config:setup': async ({config, command, injectRoute}) => {
        const src = fileURLToPath(config.srcDir), pages = join(src,'pages');
        generated = locales.map(locale=>join(src,`astro_tmp_pages_${locale}`));
        await cleanup();
        const files = (await readdir(pages,{recursive:true,withFileTypes:true})).filter(file=>file.isFile()&&file.name.endsWith('.astro')).map(file=>relative(pages,join(file.parentPath,file.name)));
        for(const locale of locales) {
          const templates = command==='build'?join(src,`astro_tmp_pages_${locale}`):pages;
          if(command==='build') await cp(pages,templates,{recursive:true});
          for(const file of files) {
            const route = file.split(sep).join('/').replace(/\.astro$/,'').replace(/(^|\/)index$/,'');
            injectRoute({pattern:`/${locale}/${route}${route && !route.endsWith('/')?'/':''}`,entrypoint:join(templates,file)});
          }
        }
      },
      'astro:build:done': cleanup,
      'astro:server:done': cleanup,
    },
  };
}
