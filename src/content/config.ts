import { defineCollection, z } from 'astro:content';

const analysesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    ticker: z.string(),
    exchange: z.string(),
    yahooTicker: z.string().optional(), // Yahoo Finance ticker format (e.g., "1843.HK" for HK stocks)
    description: z.string(),
    publishDate: z.string(),
    readTime: z.string(),
    emoji: z.string(),
    tags: z.array(z.string()),
    // Stock metrics
    dataAsOf: z.string().optional(), // Date des données financières (e.g., "Mai 2022")
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
