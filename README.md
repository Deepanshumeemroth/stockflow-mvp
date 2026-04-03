# StockFlow MVP

A production-grade, multi-tenant inventory management SaaS built with Next.js 14 (App Router), Prisma ORM, PostgreSQL (Supabase), and Tailwind CSS.

🚀 **Live Demo:** [https://stockflow-mvp-three.vercel.app](https://stockflow-mvp-three.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, Server Components), React, TypeScript, Tailwind CSS |
| Backend | Next.js Server Actions |
| Database | PostgreSQL via Supabase (Supavisor pooler, port 6543) |
| ORM | Prisma |
| Auth | JWT (via `jose`), HTTP-only cookies |
| Deployment | Vercel (Hobby tier) |

---

## Features

- **Multi-tenant auth** — Signup creates an Organization. All data is strictly scoped by `organizationId`.
- **Product CRUD** — Create, read, update, delete products with SKU uniqueness enforced per organization.
- **Dashboard** — Total product count, total quantity on hand, and a live low-stock items table.
- **Low-stock detection** — Per-product threshold with org-level default fallback (default: 5).
- **Settings** — Update the organization's global default low-stock threshold.

---

## Try the Live App

1. Visit [https://stockflow-mvp-three.vercel.app](https://stockflow-mvp-three.vercel.app)
2. Click **Sign up** — enter your organization name, email, and password
3. You'll land on the **Dashboard** — add products, set thresholds, and watch low-stock alerts appear

---

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Deepanshumeemroth/stockflow-mvp.git
cd stockflow-mvp
```

### 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Supavisor pooler (port 6543) — required for serverless
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Supabase direct connection — used only for prisma db push / migrate
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"

# Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key"
```

> **Important:** Use the **Supavisor pooler hostname** (`aws-x-region.pooler.supabase.com`) for `DATABASE_URL`, not the direct DB hostname. The direct hostname resolves to IPv6 which is not supported by Vercel's serverless functions.

### 4. Push database schema

```bash
DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require" npx prisma db push
```

> Use the direct connection (port 5432) for `prisma db push` — the pooler doesn't support schema migrations.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on Vercel

1. Push the repository to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add these environment variables in Vercel project settings:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.<ref>:<password>@aws-x-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require` |
| `DIRECT_URL` | `postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require` |
| `JWT_SECRET` | output of `openssl rand -base64 32` |

> **Critical:** Type `&` characters manually in Vercel's env var UI — do not paste from a browser page as it may encode `&` as `&amp;`.

4. Deploy — the `postinstall` script (`prisma generate`) runs automatically during Vercel's build step.
5. Run schema migration against your production DB before first use:

```bash
DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require" npx prisma db push
```

---

## Project Structure

```
src/
├── actions/          # Server Actions (auth, products, settings)
├── app/
│   ├── (app)/        # Authenticated route group
│   │   ├── dashboard/
│   │   ├── products/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   └── settings/
│   ├── api/health/   # DB connectivity diagnostic endpoint
│   ├── login/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx      # Redirects to /dashboard
├── components/       # Shared UI components
├── lib/
│   ├── auth.ts       # JWT sign/verify, session helpers
│   └── prisma.ts     # Prisma singleton client
└── middleware.ts     # Route protection
prisma/
└── schema.prisma     # Database schema
```

---

## Multi-Tenancy Model

Row-level isolation is enforced at the application layer. Every database query includes a `WHERE organizationId = session.organizationId` clause. The Prisma schema enforces uniqueness with `@@unique([sku, organizationId])` on products.

---

## Future Extension Points (AI / LLM)

- **Demand forecasting** — Add a `/api/ai/forecast` route that reads product history and calls an LLM or ML endpoint.
- **Reorder suggestions** — A server action that queries low-stock items and generates purchase order drafts via an AI API.
- **Natural language search** — Replace or augment the text filter with embedding-based semantic search using pgvector (available on Supabase).

To add an AI provider, install the SDK (e.g., `@aws-sdk/client-bedrock-runtime` for Amazon Bedrock) and add the API key to `.env.local` and Vercel environment variables.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase Supavisor pooler connection string (port 6543) |
| `DIRECT_URL` | ✅ | Supabase direct connection string (port 5432) for migrations |
| `JWT_SECRET` | ✅ | Secret key for signing JWT session tokens |
