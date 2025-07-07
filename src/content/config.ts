import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guideCollection = defineCollection({
  // type: 'content',
  loader: glob({pattern: 'src/content/guide/**/*.md'}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
  }),
});

const resourcesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    en: z.object({
      title: z.string(),
      description: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          // books: author, year, genre, pages, themes, benefits, isbn, amazonUrl, goodreadsUrl, image
          author: z.string().optional(),
          year: z.number().optional(),
          genre: z.string().optional(),
          pages: z.number().optional(),
          themes: z.array(z.string()).optional(),
          benefits: z.array(z.string()).optional(),
          isbn: z.string().optional(),
          amazonUrl: z.string().optional(),
          goodreadsUrl: z.string().optional(),
          // movies: director, duration, rating, streamingUrl, trailerUrl, image
          director: z.string().optional(),
          duration: z.string().optional(),
          rating: z.string().optional(),
          streamingUrl: z.string().optional(),
          trailerUrl: z.string().optional(),
          // music: artist, type, spotifyUrl, youtubeUrl, image
          artist: z.string().optional(),
          type: z.string().optional(),
          spotifyUrl: z.string().optional(),
          youtubeUrl: z.string().optional(),
          image: z.string().optional(),
          description: z.string(),
        })
      ),
    }),
    // 可根据需要添加 zh、es 等多语言
  }),
});

export const collections = {
  guide: guideCollection,
  resources: resourcesCollection,
};
