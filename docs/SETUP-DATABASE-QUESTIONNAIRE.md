# Questionnaire database setup (easy way — no terminal)

Your error happens because `.env` still has **YOUR_PROJECT_REF** instead of your real Supabase details.

You can fix the database **in the browser** (no `npx prisma db push` needed):

## Step 1 — Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and open project **pbeyeslaqaiigvpboeaj**.
2. Left menu → **SQL Editor**.
3. Click **New query**.

## Step 2 — Create the new tables

1. Open this file in your project: `scripts/supabase-questionnaire-tables.sql`
2. Copy **all** the SQL.
3. Paste into the Supabase query editor.
4. Click **Run** (or Ctrl+Enter).
5. You should see “Success”.

## Step 3 — Bursary list (automatic)

After you deploy the latest code, the server **fills the bursary catalogue automatically** the first time someone uses the questionnaire.

You do **not** need to run `npm run seed:bursaries` if the live site can reach the database.

## Optional — fix `.env` for local `npx` commands

1. Supabase → **Project Settings** → **Database**.
2. Copy your **database password** (or reset it if you forgot).
3. In `.env`, replace lines 2–3 with (use **your real password**):

```
DATABASE_URL="postgresql://postgres.pbeyeslaqaiigvpboeaj:YOUR_REAL_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:YOUR_REAL_PASSWORD@db.pbeyeslaqaiigvpboeaj.supabase.co:5432/postgres"
```

4. Then `npx prisma db push` will work on your PC too.

Your production app on Vercel already has the correct `DATABASE_URL` in Vercel environment variables — that is separate from the placeholder `.env` on your laptop.
