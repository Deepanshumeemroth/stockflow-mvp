# StockFlow MVP

A production-grade, multi-tenant inventory management SaaS built with Next.js 14 (App Router), Prisma ORM, PostgreSQL (Supabase), and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, Server Components), React, TypeScript, Tailwind CSS |
| Backend | Next.js Server Actions |
| Database | PostgreSQL via Supabase (transaction pooler, port 6543) |
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

## Getting Started

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

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
# PostgreSQL via Supabase transaction pooler (port 6543 is required for serverless)
DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:6543/postgres?connection_limit=1"

# Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key"
```

> **Why port 6543?** Supabase's transaction pooler (PgBouncer) on port 6543 is designed for serverless environments. It prevents connection exhaustion that would occur with direct connections (port 5432) from Vercel's ephemeral functions.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables (`Organization`, `User`, `Product`) in your Supabase database.

To push schema changes without migration history (e.g., on a fresh Supabase project):

```bash
npx prisma db push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the following environment variables in Vercel project settings:
   - `DATABASE_URL` — your Supabase connection string (port 6543)
   - `JWT_SECRET` — a strong random secret
4. Deploy. The `postinstall` script (`prisma generate`) runs automatically during Vercel's build step.

> **Note:** Run `npx prisma migrate deploy` (or `npx prisma db push`) against your production database before or after the first deploy to apply the schema.

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

Row-level isolation is enforced at the application layer. Every database query that reads or mutates tenant data includes a `WHERE organizationId = session.organizationId` clause. The Prisma schema enforces this with a `@@unique([sku, organizationId])` constraint on products.

---

## Future Extension Points (AI / LLM)

The architecture is clean and ready for AI feature additions:

- **Demand forecasting**: Add a `/api/ai/forecast` route that reads product history and calls an LLM or ML endpoint.
- **Reorder suggestions**: A server action that queries low-stock items and generates purchase order drafts via an AI API.
- **Natural language search**: Replace or augment the text filter with an embedding-based semantic search using pgvector (available on Supabase).

To add an AI provider, install the SDK (e.g., `@aws-sdk/client-bedrock-runtime` for Amazon Bedrock) and add the API key to `.env.local` and Vercel environment variables.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string (port 6543) |
| `JWT_SECRET` | ✅ | Secret key for signing JWT session tokens |
