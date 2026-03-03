# 🚀 Vide Music - Deployment Guide

This guide will walk you through deploying your shiny new Premium AI Music Player Platform.

## Requirements

1. A Next.js hosting platform (Vercel is highly recommended).
2. For persistence and database features, an initialized Supabase project.
3. For Spotify API, Spotify Developer Dashboard credentials.

---

## ☁️ 1. Deploying to Vercel (Recommended)

Next.js apps deploy seamlessly to Vercel with zero configuration.

### Steps:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your Git repository.
4. Expand the **Environment Variables** section and add the required keys (see Configuration below).
5. Click **Deploy**. Vercel will build and serve your site globally.

Alternatively, you can deploy via terminal:

```bash
npm i -g vercel
vercel
```

## ⚙️ 2. Environment Configuration

To enable the backend API routes and features for Spotify/YouTube, you will need the following environment variables. Add these to a `.env.local` file locally, and in your Vercel project settings:

```env
# SPOTIFY OAUTH (For future feature parity)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/auth/callback/spotify

# YOUTUBE DATA API
YOUTUBE_API_KEY=your_youtube_api_key

# SUPABASE (For saving playlists / users)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐋 3. Deploying via Docker (Alternative)

For manual hosting on VPS (DigitalOcean, AWS, Linode), you can use Docker.

1. **Create a `Dockerfile`** in the root directory:

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

2. **Update `next.config.mjs`** to build standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};
export default nextConfig;
```

3. **Build and Run**:

```bash
docker build -t vide-music-app .
docker run -p 3000:3000 --env-file .env.local vide-music-app
```

## 🎉 Post-Deployment

Once deployed, your app is live!

- The **Local Music Loader** utilizes client-side IndexedDB/Blob processing and will work fully without backend APIs.
- To test the audio features from external sources, please continue setting up your integrations via their respective Developer portals.
