import { defineCollection, z } from 'astro:content';

// Multi-language text schema
// en is required, others are optional (fallback handled in code)
const multiLangText = z.object({
  en: z.string(),
  'zh-hans': z.string().optional(),
  'zh-hant': z.string().optional(),
  es: z.string().optional(),
  ja: z.string().optional(),
  ko: z.string().optional(),
  hi: z.string().optional(),
  ar: z.string().optional(),
}).passthrough(); // Allow additional language keys

// Questionnaire option schema
const optionSchema = z.object({
  value: z.number(),
  label: multiLangText,
});

// Question schema
const questionSchema = z.object({
  id: z.string(),
  text: multiLangText,
});

// Interpretation schema
const interpretationSchema = z.object({
  range: z.tuple([z.number(), z.number()]),
  level: z.string(),
  color: z.string(),
  label: multiLangText,
  suggestion: multiLangText,
});

// Questionnaire collection
const questionnairesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    version: z.string(),
    category: z.string(),
    meta: z.object({
      title: multiLangText,
      description: multiLangText,
      instruction: multiLangText,
      estimatedMinutes: z.number(),
      questionCount: z.number(),
    }),
    options: z.array(optionSchema),
    questions: z.array(questionSchema),
    scoring: z.object({
      type: z.string(),
      maxScore: z.number(),
      interpretations: z.array(interpretationSchema),
    }),
    disclaimer: multiLangText,
  }),
});

export const collections = {
  questionnaires: questionnairesCollection,
};

