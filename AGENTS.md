# AGENTS.md — E-Commerce Store Monorepo

> **Purpose**: This file provides context and rules for AI coding agents working on this project. Read it before making any changes.

---

## Project Overview

This is a **full-stack e-commerce store** built as a **Turborepo monorepo**. It consists of three applications and several shared packages, all managed from a single repository.

| Component | Path | Stack | Port | Description |
|-----------|------|-------|------|-------------|
| **API** | `apps/api` | Express 4 + TypeScript (ESM) | `5000` | REST API server — auth, products, orders, payments, CMS |
| **Storefront** | `apps/storefront` | Next.js 16 + React 19 + TailwindCSS 4 | `3000` | Customer-facing store (App Router, SSR/SSG) |
| **Admin** | `apps/admin` | Vite + React 19 + Bootstrap/Reactstrap | `5173` (dev) / `3002` (prod) | Back-office dashboard (SPA, React Router 7) |
| **Shared** | `packages/shared` | TypeScript + Zod | — | Shared types, validation schemas, constants |
| **ESLint Config** | `packages/eslint-config` | — | — | Shared ESLint rules |
| **TS Config** | `packages/typescript-config` | — | — | Shared `tsconfig` presets |

---

## Architecture

```
ecommerce-store-monorepo/
├── apps/
│   ├── api/              # Express REST API (TypeScript, ESM)
│   │   ├── prisma/       # Schema & seed (PostgreSQL)
│   │   └── src/
│   │       ├── controllers/   # Request handlers
│   │       ├── routes/        # Express route definitions
│   │       ├── services/      # Business logic (Stripe, PayPal, email, Meta CAPI)
│   │       ├── middleware/    # Auth, error handler, security
│   │       ├── validators/    # Zod request validation schemas
│   │       ├── lib/           # Prisma client, JWT, password utils
│   │       ├── jobs/          # Cron jobs (node-cron)
│   │       └── templates/     # Email templates
│   ├── storefront/       # Next.js 16 customer store
│   │   ├── app/          # App Router pages & layouts
│   │   ├── components/   # React components (cart, checkout, layout, product, tracking)
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # API client, structured data helpers
│   └── admin/            # Vite React admin dashboard
│       └── src/
│           ├── pages/        # Admin pages (route-based)
│           ├── components/   # Reusable UI components
│           ├── store/        # Redux + Redux-Saga state management
│           ├── helpers/      # Utility functions
│           ├── routes/       # React Router config
│           └── locales/      # i18n translations
├── packages/
│   ├── shared/           # @repo/shared — shared types & Zod schemas
│   ├── eslint-config/    # @repo/eslint-config
│   └── typescript-config/ # @repo/typescript-config
├── docker-compose.yml    # PostgreSQL 15 + Redis 7 + all apps
├── turbo.json            # Turborepo pipeline config
└── package.json          # Workspace root (npm workspaces)
```

---

## Technology Stack

### Backend (`apps/api`)
- **Runtime**: Node.js ≥ 18, TypeScript (ESM — `"type": "module"`)
- **Framework**: Express 4
- **Database**: **PostgreSQL 15** via **Prisma ORM** (`@prisma/client`)
- **Cache**: **Redis 7** via the `redis` npm package (v4)
- **Auth**: JWT (access + refresh tokens) with `bcryptjs` password hashing
- **Payments**: Stripe SDK + PayPal Checkout Server SDK
- **Email**: Resend SDK (with SMTP fallback)
- **Validation**: Zod schemas in `src/validators/`
- **Security**: Helmet, CORS, cookie-parser
- **Monitoring**: Sentry (`@sentry/node`)
- **Jobs**: `node-cron` for scheduled tasks
- **Dev**: `tsx watch` for hot-reload

### Frontend — Storefront (`apps/storefront`)
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4
- **State**: Zustand
- **Payments**: `@stripe/react-stripe-js`, `@paypal/react-paypal-js`
- **Icons**: `lucide-react`

### Frontend — Admin (`apps/admin`)
- **Bundler**: Vite 7
- **UI**: React 19, Bootstrap 5, Reactstrap, Sass
- **State**: Redux + Redux-Saga + Reselect
- **Routing**: React Router 7 (DOM)
- **Charts**: ApexCharts, Recharts, Chart.js, ECharts
- **Tables**: TanStack React Table
- **i18n**: i18next + react-i18next
- **Form**: Formik + Yup
- **Rich Editor**: CKEditor 5, TinyMCE

---

## Database

### PostgreSQL (Primary)

- **ORM**: Prisma — schema at `apps/api/prisma/schema.prisma`
- **Connection**: `DATABASE_URL` env var (PostgreSQL connection string)
- **Docker**: `postgres:15-alpine` on port `5432`

#### Key Models

| Domain | Models |
|--------|--------|
| **Auth & Users** | `User`, `Address`, `ApiKey` |
| **Product Catalog** | `Product`, `Category`, `ProductImage`, `ProductVariant`, `ProductTag` |
| **Cart & Checkout** | `Cart`, `CartItem` |
| **Orders** | `Order`, `OrderItem`, `OrderStatusHistory` |
| **Promotions** | `Coupon`, `Discount`, `FlashSale`, `FlashSaleProduct` |
| **Reviews** | `Review` |
| **CMS** | `Blog`, `BlogCategory`, `Page`, `NavigationMenu`, `MenuItem` |
| **Settings** | `StoreSettings`, `ThemeSettings`, `EmailTemplate` |
| **Security** | `AuditLog`, `Webhook`, `WebhookEvent` |

#### Enums
- `Role`: `SUPER_ADMIN`, `STORE_MANAGER`, `MARKETING`, `SUPPORT`, `CUSTOMER`
- `OrderStatus`: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `PaymentStatus`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- `PaymentMethod`: `STRIPE`, `PAYPAL`, `COD`, `BANK_TRANSFER`

#### Prisma Commands
```bash
cd apps/api
npx prisma generate        # Generate client after schema changes
npx prisma migrate dev     # Create & apply migrations
npx prisma studio          # Visual database browser
npx prisma db seed         # Seed with sample data (uses prisma/seed.ts)
```

### Redis (Cache)

- **Client**: `redis` npm package (v4)
- **Connection**: `REDIS_URL` env var (default `redis://localhost:6379`)
- **Docker**: `redis:7-alpine` on port `6379`
- **Usage**: Session caching, cart expiry, rate limiting, frequently queried data

---

## API Structure

### Route Pattern
All routes are versioned under `/api/v1/`:

| Endpoint | File | Description |
|----------|------|-------------|
| `/api/v1/auth` | `auth.routes.ts` | Register, login, refresh, logout, profile |
| `/api/v1/products` | `product.routes.ts` | CRUD, search, filters |
| `/api/v1/categories` | `category.routes.ts` | CRUD, tree structure |
| `/api/v1/carts` | `cart.routes.ts` | Add/update/remove items |
| `/api/v1/orders` | `order.routes.ts` | Place order, status, history |
| `/api/v1/customers` | `customer.routes.ts` | Admin customer management |
| `/api/v1/promotions` | `promotion.routes.ts` | Coupons, discounts, flash sales |
| `/api/v1/reviews` | `review.routes.ts` | Product reviews & ratings |
| `/api/v1/cms` | `cms.routes.ts` | Blog, pages, navigation menus |
| `/api/v1/settings` | `settings.routes.ts` | Store & theme config |
| `/api/v1/uploads` | `upload.routes.ts` | File/image upload |
| `/api/v1/webhooks` | `webhook.routes.ts` | Webhook management |
| `/api/v1/payments` | `payment.routes.ts` | Payment intents, confirmation |
| `/health` | `index.ts` | Health check endpoint |

### Code Pattern
Every domain follows: **Route → Controller → Service/Prisma → Response**
- **Routes**: Define Express router, attach validators & auth middleware
- **Controllers**: Handle request/response, call Prisma or services
- **Services**: External integration logic (Stripe, PayPal, email, Meta CAPI)
- **Validators**: Zod schemas that validate request bodies

### Response Format
```json
{
  "success": true,
  "data": { ... }
}
```
Error responses include `success: false` with `message` and optional `errors` array.

---

## Environment Variables

Copy `.env.example` to `.env` at the repo root. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Token signing keys |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe integration |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal integration |
| `SMTP_*` | Email configuration |
| `AWS_*` / `S3_ENDPOINT` | Media storage (S3 or Cloudflare R2) |
| `META_PIXEL_ID` / `META_CAPI_TOKEN` | Meta Conversions API |

> **CRITICAL**: Never commit `.env` files. They are in `.gitignore`.

---

## Development

### Prerequisites
- Node.js ≥ 18
- npm 10+
- Docker & Docker Compose (for PostgreSQL and Redis)

### Getting Started
```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (Postgres + Redis)
docker-compose up -d postgres redis

# 3. Set up database
cd apps/api
cp .env.example .env        # Edit with your values
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ../..

# 4. Start all apps
npm run dev                  # Runs turbo dev (all apps in parallel)
```

### Individual App Dev
```bash
npx turbo dev --filter=api          # API only
npx turbo dev --filter=storefront   # Storefront only
npx turbo dev --filter=admin        # Admin only
```

### Build
```bash
npm run build          # Build all apps
npx turbo build --filter=api   # Build specific app
```

### Docker (Full Stack)
```bash
docker-compose up --build      # Starts Postgres, Redis, API, Storefront, Admin
```

---

## Rules for AI Agents

### General
1. **Read before writing** — Always understand existing patterns before making changes.
2. **Follow existing conventions** — Match the coding style, naming, and file structure already in place.
3. **TypeScript everywhere** — All new code in `apps/api` and `packages/shared` must be TypeScript. The API uses ESM (`"type": "module"`), so imports require `.js` extensions in relative paths.
4. **Use `@repo/shared`** — Put shared types, constants, and validation schemas in `packages/shared`, not duplicated across apps.
5. **Don't break workspaces** — Never modify the root `package.json` workspaces array without understanding the full impact.

### API Rules
1. **Route → Controller → Service pattern** — Every new endpoint must follow this structure.
2. **Validate with Zod** — All request bodies must have a corresponding Zod schema in `src/validators/`.
3. **Use Prisma** — All database operations go through the Prisma client (`src/lib/prisma.ts`). Never write raw SQL unless absolutely necessary.
4. **Protect routes** — Use the auth middleware from `src/middleware/auth.ts`. Admin endpoints must check roles.
5. **Error handling** — Throw errors that the global error handler (`src/middleware/errorHandler.ts`) can catch. Don't `res.send()` errors directly.
6. **Redis cache** — Use Redis for caching expensive queries. Always set TTL. Invalidate cache when underlying data changes.
7. **Stripe webhook** — The Stripe webhook route at `/api/v1/payments/webhook` uses `express.raw()` and is mounted *before* `express.json()`. Do not rearrange this.
8. **Environment** — Never hardcode secrets. Use `process.env`.

### Storefront Rules
1. **App Router only** — Use Next.js App Router conventions (layout.tsx, page.tsx, loading.tsx, error.tsx).
2. **TailwindCSS 4** — Use Tailwind for styling. Do not add Bootstrap or other CSS frameworks.
3. **Zustand** — Use Zustand for client-side state (cart, auth). Do not add Redux.
4. **Server Components by default** — Only add `"use client"` when truly needed (event handlers, hooks, browser APIs).
5. **API calls** — Use the centralized API client in `lib/api.ts`.
6. **SEO** — Always include proper metadata exports in pages. Use `lib/structured-data.ts` for JSON-LD.
7. **Read `node_modules/next/dist/docs/`** before using any Next.js API — this is Next.js 16 which may differ from your training data.

### Admin Rules
1. **Vite + React** — This is a Vite SPA, not a Next.js app. No SSR.
2. **Bootstrap/Reactstrap** — Use Bootstrap 5 classes and Reactstrap components for UI.
3. **Redux + Redux-Saga** — State management uses Redux with Sagas for async flows. Follow the existing store pattern.
4. **Formik + Yup** — Use Formik for forms and Yup for validation on the admin side.
5. **Axios** — API calls go through Axios (check `src/helpers/` for the configured instance).

### Database Rules
1. **Schema changes** — Modify `apps/api/prisma/schema.prisma`, then run `npx prisma migrate dev --name <description>`.
2. **Always generate** — After any schema change, run `npx prisma generate` before testing.
3. **Relations** — Follow the existing pattern of explicit relation fields with `@relation`. Always add `@@index` for foreign keys.
4. **Cascades** — Use `onDelete: Cascade` for child records, `onDelete: SetNull` for optional references.
5. **Decimal for money** — Always use `Decimal @db.Decimal(10, 2)` for monetary values, never `Float`.
6. **Seed data** — Update `prisma/seed.ts` when adding new models to ensure dev databases stay populated.

### Testing & Verification
1. **Type check** — Run `npm run check-types` to verify TypeScript across the monorepo.
2. **Lint** — Run `npm run lint` before committing.
3. **Build** — Run `npm run build` to catch compilation errors.
4. **Prisma** — After schema changes, verify with `npx prisma validate`.

---

## External Integrations

| Integration | Package | Config |
|-------------|---------|--------|
| **Stripe** | `stripe`, `@stripe/react-stripe-js` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **PayPal** | `@paypal/checkout-server-sdk`, `@paypal/react-paypal-js` | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| **Email** | `resend` + SMTP | `SMTP_*` env vars |
| **Media Storage** | AWS S3 SDK | `AWS_*` env vars (supports Cloudflare R2) |
| **Meta CAPI** | Custom service | `META_PIXEL_ID`, `META_CAPI_TOKEN` |
| **Sentry** | `@sentry/node` | DSN configured in env |
| **Analytics** | Client-side | `GA4_MEASUREMENT_ID`, `GTM_ID` |

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| Prisma schema | `apps/api/prisma/schema.prisma` |
| Prisma seed | `apps/api/prisma/seed.ts` |
| API entry point | `apps/api/src/index.ts` |
| Prisma client init | `apps/api/src/lib/prisma.ts` |
| JWT utilities | `apps/api/src/lib/jwt.ts` |
| Auth middleware | `apps/api/src/middleware/auth.ts` |
| Error handler | `apps/api/src/middleware/errorHandler.ts` |
| Security middleware | `apps/api/src/middleware/security.ts` |
| Storefront layout | `apps/storefront/app/layout.tsx` |
| Storefront homepage | `apps/storefront/app/page.tsx` |
| Storefront API client | `apps/storefront/lib/api.ts` |
| Admin entry | `apps/admin/src/main.jsx` |
| Admin routes | `apps/admin/src/routes/` |
| Admin Redux store | `apps/admin/src/store/` |
| Shared package entry | `packages/shared/src/index.ts` |
| Docker Compose | `docker-compose.yml` |
| Turbo config | `turbo.json` |
| Env template | `.env.example` |
