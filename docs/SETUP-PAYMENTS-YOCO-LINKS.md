# Yoco payment links (temporary)

Use this while Yoco activates online payments on your account and before the site migrates to the Checkout API.

## How it works

### Student (easy — 3 steps)

1. Complete their application on Apply Once.
2. On **Profile** or the **Application** page, tap **Pay R95 securely** (or R50).
3. Yoco opens in a **new tab** → they pay with card / Apple Pay → close the tab and return to Apply Once.

The site does **not** auto-detect payment yet. You confirm in admin after you see it in Yoco.

### You (admin — ~30 seconds per student)

1. Open the **Yoco app** or portal when a student says they paid (or check notifications).
2. Match the payment to their **email** or name.
3. In **Admin** → select the student → **Application fee (Yoco link)** → click **Mark R95 paid** (or R50).

Their row shows **PAID** and the payment banner disappears on their profile.

## 1) Create payment links in Yoco

1. Yoco Business Portal or app → **Payment links** (or **Get paid**).
2. Create a link for **R95** — copy the URL.
3. Optional: create a second link for **R50** (split payments).

## 2) Add env vars

**Vercel → Settings → Environment Variables** (Production + Preview if you test there):

| Variable | Example |
|----------|---------|
| `VITE_YOCO_PAYMENT_LINK_R95` | `https://…` (your R95 link) |
| `VITE_YOCO_PAYMENT_LINK_R50` | `https://…` (optional; falls back to R95 link if empty) |

Redeploy after saving.

**Local `.env`:**

```
VITE_YOCO_PAYMENT_LINK_R95=https://your-r95-link
VITE_YOCO_PAYMENT_LINK_R50=https://your-r50-link
```

When `VITE_YOCO_PAYMENT_LINK_R95` is set, the site shows **payment link buttons** instead of the broken in-page Yoco popup.

## 3) Test end-to-end

1. Register a test student on applyonce.org.
2. Tap **Pay R95 securely** — Yoco page should open.
3. Pay with a real or test card (per Yoco’s link settings).
4. In **Admin**, mark that student **Mark R95 paid**.
5. Refresh their profile — payment banner should be gone.

## Later

When Yoco enables Checkout API on your account, we will switch back to automatic on-site payments. Payment links can stay as a backup.
