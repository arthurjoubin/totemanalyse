# Totem Analyse

A financial analysis website built with AstroJS.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Cloudflare Pages Configuration

When setting up Cloudflare Pages, use these settings:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 18 or higher

## Adding New Analyses

1. Create a new markdown file in `src/content/analyses/` (e.g., `company-name.md`)
2. Add the required frontmatter:

```markdown
---
title: "Apparté sur CompanyName"
ticker: "TICK"
exchange: "NASDAQ"
description: "A brief description of the analysis"
publishDate: "DD mois YYYY"
readTime: "XX min de lecture"
emoji: "📊"
tags: ["Tech", "Finance"]
marketCap: "$X.XXB"
ev: "$X.XXB"
revenue: "$XXXM"
yoyGrowth: "+XX%"
evRevenue: "~Xx"
cash: "$X.XB"
debt: "$XXM"
opCashFlow: "$XXM"
qoqGrowth: "+X%"
dilution: "~X%/an"
---

## Your Content Here

Write your analysis using markdown...
```

3. The page will be automatically generated at `/analyses/company-name`

## Custom Styling

The site uses custom CSS classes for interview-style content:

- `.question` - For questions (automatically prefixed with "Jérémy")
- `.answer` - For answers (automatically prefixed with "Arthur")
- `.highlight-box` - For highlighted conclusion boxes
- `.concession` - For concession/disclaimer boxes

Example:
```html
<div class="question">
What is the business model?
</div>

<div class="answer">
The business model is based on...
</div>
```
