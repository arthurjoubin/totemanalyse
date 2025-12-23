import { defineCollection, z } from 'astro:content';

const analysesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    ticker: z.string(),
    exchange: z.string(),
    description: z.string(),
    publishDate: z.string(),
    readTime: z.string(),
    emoji: z.string(),
    tags: z.array(z.string()),
    // Stock metrics
    marketCap: z.string().optional(),
    ev: z.string().optional(),
    revenue: z.string().optional(),
    yoyGrowth: z.string().optional(),
    evRevenue: z.string().optional(),
    cash: z.string().optional(),
    debt: z.string().optional(),
    opCashFlow: z.string().optional(),
    qoqGrowth: z.string().optional(),
    dilution: z.string().optional(),
  }),
});

export const collections = {
  'analyses': analysesCollection,
};
