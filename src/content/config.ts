import { defineCollection, z } from 'astro:content';

const guideCollection = defineCollection({
  type: 'content',
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

export const collections = {
  guide: guideCollection,
};
