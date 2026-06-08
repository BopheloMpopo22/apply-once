# Email setup (signup welcome + admin emails)

## 1. Welcome email on signup (Supabase)

Supabase sends auth emails from **Authentication → Email Templates**.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Email Templates**.
3. Choose **Confirm signup** (sent when a student registers, if email confirmation is enabled).
4. Set **Subject** to something like: `Welcome to Apply Once — confirm your email`
5. Paste the HTML below into the template body (Supabase uses `{{ .ConfirmationURL }}` for the link).

If **email confirmation is turned off** (Authentication → Providers → Email → “Confirm email” disabled), Supabase will not send this template automatically. Options:

- Turn confirmation on so every signup gets the welcome + confirm link, or
- Send a manual welcome from the admin dashboard (see section 2) after you see a new student.

### Suggested Confirm signup template (HTML)

```html
<h2>Welcome to Apply Once</h2>
<p>Hi there,</p>
<p>Thanks for signing up. Apply Once helps South African students apply to many bursaries and scholarships with <strong>one profile</strong>.</p>
<ul>
  <li>Complete your application once — we use it for multiple opportunities</li>
  <li>See bursaries matched to your study choices and career goals</li>
<li>Message our team anytime from your profile</li>
</ul>
<p>Please confirm your email to get started:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm my email</a></p>
<p>If you did not sign up, you can ignore this message.</p>
<p>— The Apply Once team</p>
```

Also check **Authentication → URL configuration** so **Site URL** and **Redirect URLs** include your production domain and `http://localhost:5173/auth/callback` for local dev.

---

## 2. Admin emails to students (Resend)

The admin dashboard can email a student directly when **Resend** is configured on the server.

### Steps

1. Create a free account at [resend.com](https://resend.com).
2. Add and verify your domain (e.g. `applyonce.co.za`) under **Domains**, or use Resend’s test domain while developing.
3. Create an API key under **API Keys**.
4. Add to Vercel (or `.env` locally):

```env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM="Apply Once <hello@yourdomain.co.za>"
```

`EMAIL_FROM` must use an address on a domain you verified in Resend.

5. Redeploy the API. In **Admin → student detail**, use the **Email student** box.

### Should you make a website email?

Yes — a dedicated address like `hello@applyonce.co.za` or `support@applyonce.co.za` looks professional and keeps personal mail separate. Verify that domain in Resend (or another provider) and set `EMAIL_FROM` to match.
