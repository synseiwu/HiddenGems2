# Hidden Gems New Version

A fresh Hidden Gems-style video marketplace starter built with:

- React + Vite
- Supabase Auth, Database, and Thumbnail Storage
- Stripe Checkout and Webhooks
- Vercel deployment support

## What this build includes

- Home page with VIP promo
- Videos page with search, category filter, sorting, lazy thumbnails
- Video details page
- User login/sign-up
- Purchased library page
- VIP page
- Settings page
- Admin panel for adding, editing, and deleting listings
- Browser-side thumbnail compression to WebP before Supabase upload
- Stripe checkout API routes
- Stripe webhook API route
- Supabase SQL schema and RLS starter policies
- Mobile and desktop responsive design

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Fill in your Supabase and Stripe keys.

Required variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
SITE_URL=http://localhost:5173
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
```

4. In Supabase, run:

```sql
supabase/schema.sql
```

5. Create a Supabase Storage bucket named:

```txt
thumbnails
```

Make it public for thumbnail viewing.

6. Start locally:

```bash
npm run dev
```

## Admin setup

After creating your user account, manually set yourself as admin in Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';
```

## Stripe webhook endpoint

On Vercel, your webhook endpoint should be:

```txt
https://your-domain.com/api/stripe-webhook
```

Listen for:

```txt
checkout.session.completed
```

## Important security note

Protected external video links are stored separately in `video_access_links` and returned through `/api/get-video-link` only after server-side access checks. Keep this pattern for production so unpaid users cannot pull links from the public video listing response.

## Uploading to GitHub

This project is GitHub-ready. A `.gitignore` file is included so `node_modules`, build files, and local environment files are not uploaded.

For detailed instructions, open `GITHUB_UPLOAD.md`.

Quick terminal upload:

```bash
git init
git add .
git commit -m "Initial Hidden Gems rebuild"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

After the repo is on GitHub, import it into Vercel and add the environment variables from `.env.example`.
