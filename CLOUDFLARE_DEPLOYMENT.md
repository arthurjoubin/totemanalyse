# Deploying to Cloudflare Pages

## Automatic Deployment (Recommended)

1. **Connect your GitHub repository to Cloudflare Pages:**
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
   - Click "Create a project" → "Connect to Git"
   - Select your GitHub repository `arthurjoubin/totemanalyse`

2. **Configure build settings:**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Set Node.js version:**
   - Add environment variable: `NODE_VERSION` = `18` or `20`

4. **Deploy:**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy on every push to the main branch

## Manual Deployment

If you prefer to deploy manually:

```bash
# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the site
npm run build

# Deploy
wrangler pages deploy dist
```

## Custom Domain

After deployment, you can add a custom domain in the Cloudflare Pages settings.

## Build Notes

- The build process converts all markdown files in `src/content/analyses/` to static HTML pages
- Each analysis becomes available at `/analyses/{slug}`
- The stock price component loads dynamically on the client side
- All custom CSS for interview-style formatting is preserved

## Troubleshooting

If the build fails:
1. Ensure Node.js version is 18 or higher
2. Check that all dependencies are properly installed
3. Verify the build works locally with `npm run build`
4. Check Cloudflare Pages build logs for specific errors
