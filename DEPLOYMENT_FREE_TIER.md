# 🚀 100% Free Tier ($0/Month) Deployment & CI/CD Guide

This guide walks you through deploying the full-stack e-commerce monorepo at **$0.00 / month** using free cloud tiers. Once connected, pushing code to GitHub (`git push origin main`) will automatically deploy updates to production.

---

## 🏗️ Architecture Overview

```
                          ┌────────────────────────┐
                          │   GitHub Repository    │
                          │   (Push to 'main')     │
                          └───────────┬────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
  │  Cloudflare Pages │     │    Vercel Hobby   │     │    Render.com     │
  │     Admin SPA     │     │  Storefront Next  │     │    API Server     │
  │  (100% Free CDN)  │     │   (100% Free)     │     │   (Free Web Svc)  │
  └───────────────────┘     └───────────────────┘     └─────────┬─────────┘
                                                                │
                                            ┌───────────────────┴───────────────────┐
                                            ▼                                       ▼
                                  ┌───────────────────┐                   ┌───────────────────┐
                                  │     Neon.tech     │                   │   Upstash Redis   │
                                  │ (Serverless DB)   │                   │  (Serverless TLS) │
                                  └───────────────────┘                   └───────────────────┘
```

---

## Step 1: Set Up Free PostgreSQL Database (Neon.tech)

1. Go to [https://neon.tech](https://neon.tech) and sign up (Free tier: 0.5 GB storage, serverless Postgres).
2. Create a new project (e.g. `ecommerce-db`).
3. Select PostgreSQL 15 or 16 and pick a region close to your users (e.g., `US East (Ohio)`).
4. Copy the **Connection String**. It looks like:
   ```env
   DATABASE_URL="postgresql://username:password@ep-cool-mountain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
5. Save this `DATABASE_URL` for Step 3.

---

## Step 2: Set Up Free Redis Cache (Upstash)

1. Go to [https://upstash.com](https://upstash.com) and sign up (Free tier: 10,000 requests/day).
2. Click **Create Database**:
   - Name: `ecommerce-redis`
   - Type: **Regional**
   - Region: Select the same region as Neon (e.g. `us-east-1` or `us-east-2`).
   - Eviction: Enable **noeviction** or **volatile-lru**.
3. Under the **Connect** tab, copy the **Node.js (ioredis / redis-cli)** connection string (`rediss://...`).
   ```env
   REDIS_URL="rediss://default:your-token@your-endpoint.upstash.io:6379"
   ```
4. Save this `REDIS_URL` for Step 3.

---

## Step 3: Deploy the API Server (Render.com)

1. Push this repository to your GitHub account if you haven't already.
2. Go to [https://render.com](https://render.com) and sign up/log in with GitHub.
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Select your `ecommerce-store` GitHub repository.
5. Render will automatically detect [`render.yaml`](./render.yaml) in the root!
6. Render will prompt you for the required environment variables:
   - `DATABASE_URL`: Paste the Neon connection string from Step 1.
   - `REDIS_URL`: Paste the Upstash Redis URL from Step 2.
   - `FRONTEND_URL`: Leave blank or set placeholder (e.g., `https://my-storefront.vercel.app` — you will update this after Step 4).
   - `ADMIN_URL`: Leave blank or set placeholder (e.g., `https://my-admin.pages.dev` — you will update this after Step 5).
7. Click **Apply**.
8. Render will automatically:
   - Install dependencies.
   - Run `npx prisma migrate deploy` to create your database tables in Neon.
   - Build the API package.
   - Start your API server and assign you a free URL (e.g., `https://ecommerce-api-xyz.onrender.com`).
   - Monitor the `/health` endpoint.

> **Note on Free Tier Sleeping**: Render free web services spin down after 15 minutes of inactivity. When a request arrives, it takes ~30-40 seconds to spin back up. To keep it awake, you can use a free monitoring service like [UptimeRobot](https://uptimerobot.com) to ping `https://ecommerce-api-xyz.onrender.com/health` every 10 minutes.

---

## Step 4: Deploy Storefront (Vercel)

1. Go to [https://vercel.com](https://vercel.com) and sign up/log in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your `ecommerce-store` repository.
4. In the configuration screen:
   - **Framework Preset**: Next.js (detected automatically).
   - **Root Directory**: Click "Edit" and choose `apps/storefront`.
   - **Build and Output Settings**: Leave defaults.
5. Add **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://ecommerce-api-xyz.onrender.com/api/v1
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
6. Click **Deploy**.
7. Once deployed, note down your production Vercel URL (e.g. `https://my-storefront.vercel.app`).

---

## Step 5: Deploy Admin Dashboard (Cloudflare Pages)

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and sign up/log in.
2. In the left sidebar, navigate to **Compute (Workers & Pages)** $\rightarrow$ **Pages** $\rightarrow$ **Create a project**.
3. Select **Connect to Git** and choose your `ecommerce-store` repository.
4. Configure the build settings:
   - **Project Name**: `ecommerce-admin`
   - **Production Branch**: `main`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/admin`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Add **Environment Variables**:
   ```env
   VITE_APP_API_URL=https://ecommerce-api-xyz.onrender.com
   VITE_APP_DEFAULTAUTH=real
   ```
6. Click **Save and Deploy**.
7. Once finished, you will receive a URL like `https://ecommerce-admin.pages.dev`.
   *(The included [`apps/admin/public/_redirects`](./apps/admin/public/_redirects) file ensures SPA routing works smoothly without 404s on refresh!)*

---

## Step 6: Link URLs & Seed Database (Optional)

1. Go back to your Render Dashboard $\rightarrow$ `ecommerce-api` $\rightarrow$ **Environment**.
2. Update:
   - `FRONTEND_URL` $\rightarrow$ `https://my-storefront.vercel.app`
   - `ADMIN_URL` $\rightarrow$ `https://ecommerce-admin.pages.dev`
3. Click **Save Changes** (Render will auto-redeploy with updated CORS origins).
4. **Seed Sample Products & Admin User**:
   In Render $\rightarrow$ `ecommerce-api` $\rightarrow$ **Shell** tab, run:
   ```bash
   npx ts-node --esm apps/api/prisma/seed.ts
   ```
   Or run it locally against your Neon `DATABASE_URL`:
   ```bash
   DATABASE_URL="your-neon-url" npx prisma db seed
   ```

---

## 🔄 Automated CI/CD Behavior

Once these 3 services are linked:
- Every time you run `git push origin main`:
  - **GitHub Actions** runs linting and typechecks to ensure code quality.
  - **Render** automatically deploys the updated API.
  - **Vercel** automatically deploys the updated Storefront.
  - **Cloudflare Pages** automatically deploys the updated Admin SPA.
- No manual builds, SSH keys, or server maintenance required!
