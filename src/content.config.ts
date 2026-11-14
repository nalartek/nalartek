import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs } from './lib/categories';

const coverImageSchema = z.object({
  src: z.string().startsWith('/'),
  alt: z.string().min(10),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z
    .object({
      title: z.string().min(10).max(120),
      description: z.string().min(40).max(220),
      slug: z
        .string()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',
        ),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().min(2).default('NalarTek Editorial'),
      category: z.enum(categorySlugs),
      tags: z.array(z.string().min(1)).default([]),
      coverImage: coverImageSchema.optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      starter: z.boolean().default(false),
    })
    .refine(
      (article) => !article.updatedDate || article.updatedDate >= article.pubDate,
      {
        message: 'updatedDate tidak boleh lebih awal dari pubDate.',
        path: ['updatedDate'],
      },
    ),
});

export const collections = { articles };
