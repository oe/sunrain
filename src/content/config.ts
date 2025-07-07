import { defineCollection, z } from 'astro:content';

const guideCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().optional(),
    publishDate: z.coerce.date(),
    updateDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
  }),
});

const resourcesCollection = defineCollection({
  type: 'data',
  schema: z.record(
    z.object({
      title: z.string(),
      description: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
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
        })
      ),
    })
  ),
});

export const collections = {
  guide: guideCollection,
  resources: resourcesCollection,
};
