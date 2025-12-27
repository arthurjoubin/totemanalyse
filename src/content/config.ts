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
    // Display options
    showChart: z.boolean().optional().default(true), // Afficher le graphique TradingView
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

// Schema pour une position (portfolio ou watchlist)
const positionSchema = z.object({
  name: z.string(),
  ticker: z.string(),
  exchange: z.string(),
  flag: z.string(),
  thesis: z.string(),
  weight: z.number().optional(),
  analysisSlug: z.string().optional(),
});

const portefeuilleCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lastUpdated: z.string(),
    portfolio: z.array(positionSchema),
    watchlist: z.array(positionSchema),
  }),
});

export const collections = {
  'analyses': analysesCollection,
  'portefeuille': portefeuilleCollection,
};
