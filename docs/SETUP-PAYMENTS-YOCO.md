## Yoco payments setup (Apply Once)

> **Payments not working (API sunset)?** Use [payment links](./SETUP-PAYMENTS-YOCO-LINKS.md) until Yoco activates online payments and we migrate to the Checkout API.

This app uses **Yoco Gateway (card payments)** with the **Yoco Web SDK popup** when payment links are not configured.

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
  - **Pay R60 once-off**, OR
  - **Pay R40 now** then **Pay remaining R40** later
- Admin student list shows payment status:
  - **PAID**: \(\ge R60\)
  - **PART**: \(\ge R40\) but < R60
  - **UNPAID**: < R40

