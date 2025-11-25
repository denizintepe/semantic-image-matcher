# Semantic Image Mapper

A Next.js 14 + Tailwind + shadcn UI starter that uploads images to Vercel Blob, describes them with OpenAI GPT-4o-mini, stores embeddings in Supabase (pgvector), and performs semantic matching for user-provided titles.

## Getting started

1. Install dependencies

```bash
npm install
```

2. Set environment variables in `.env.local`

```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BLOB_READ_WRITE_TOKEN=vercel-blob-token
```

3. Run the dev server

```bash
npm run dev
```

## API routes

- `POST /api/upload`: Accepts form-data `files` uploads, saves each to Vercel Blob, calls GPT-4o-mini for descriptions, embeds with `text-embedding-3-small`, and stores rows in the `images` table.
- `POST /api/match`: Accepts `{ titles: string[] }`, embeds each title, and uses the `match_images` RPC (pgvector cosine similarity) to return the closest image.

Ensure your Supabase project has a table `images` with columns `id uuid`, `image_url text`, `description text`, `embedding vector`, plus an RPC `match_images` that takes `query_embedding vector`, `match_limit int` and returns rows with a `score` column.
