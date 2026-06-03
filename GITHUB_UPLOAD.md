# Upload this project to GitHub

This project is ready to push directly to GitHub and then connect to Vercel.

## Option 1: GitHub Desktop, easiest

1. Unzip the project folder.
2. Open GitHub Desktop.
3. Click **File → Add local repository**.
4. Select the `hidden-gems-new` folder.
5. If it asks to initialize Git, click **Create a repository**.
6. Name it something like `hidden-gems-new`.
7. Click **Publish repository**.
8. Keep it private unless you are ready for it to be public.
9. After publishing, go to Vercel and import the GitHub repo.

## Option 2: Terminal commands

Open a terminal inside the `hidden-gems-new` folder and run:

```bash
git init
git add .
git commit -m "Initial Hidden Gems rebuild"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace:

- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with the repo name you created

## Important before pushing

Do not upload your real `.env` file to GitHub.

This project includes `.env.example`, which is safe to upload. Put real keys only inside:

- your local `.env` file
- your Vercel Environment Variables

Never commit these secret keys:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Connect GitHub to Vercel

1. Go to Vercel.
2. Click **Add New Project**.
3. Import your GitHub repo.
4. Add the environment variables from `.env.example`.
5. Deploy.

## Recommended GitHub repo settings

- Keep the repository private while building.
- Only make it public after removing all real secrets.
- Do not upload video files to GitHub.
- Do not upload large thumbnail folders manually unless needed.
- Use Supabase Storage for thumbnails and external links for videos.
