## Yoco payments setup (Apply Once)

This app uses **Yoco Gateway (card payments)** with the **Yoco Web SDK popup**.

### 1) Get your keys (existing Yoco account is fine)

1. Log into your Yoco Business Portal (same account you already have).
2. Go to **Online payments → Payment gateway**.
3. Copy both:
   - **Public key** (starts with `pk_...`) — goes in the frontend env var
   - **Secret key** (starts with `sk_...`) — goes in the server env var

You do **not** need a new Yoco account for this project. Keys are what connect the website to your existing account.

### 2) Add env vars (Vercel)

In **Vercel → Project → Settings → Environment Variables** add:

- `VITE_YOCO_PUBLIC_KEY` = your `pk_live_...`
- `YOCO_SECRET_KEY` = your `sk_live_...`

Redeploy after saving env vars.

### 3) Supabase table (one time)

Run `scripts/supabase-payments-table.sql` in Supabase SQL Editor.

### 4) How it works in the website

- Student completes application (100%) → payment banner appears:
  - **Pay R95 once-off**, OR
  - **Pay R50 now** then **Pay remaining R50** later
- Admin student list shows payment status:
  - **PAID**: \(\ge R95\)
  - **PART**: \(\ge R50\) but < R95
  - **UNPAID**: < R50

