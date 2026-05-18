# 🚀 Make VitaPass Live for FREE (2026 Guide)

## Step 1: Push to GitHub (Free)

```bash
cd /home/workdir/artifacts/vitapass

# Initialize git (if not already)
git init
git add .
git commit -m "VitaPass - Biometric platform with face embeddings"

# Create repo on GitHub.com (free), then:
git remote add origin https://github.com/YOUR_USERNAME/vitapass.git
git branch -M main
git push -u origin main
```

## Step 2: Create Free Postgres Database (Neon)

1. Go to [neon.tech](https://neon.tech) → Sign up (free)
2. Create new project → Name it `vitapass`
3. Copy the **Connection String** (it looks like `postgresql://...`)

## Step 3: Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"** → Import your GitHub repo `vitapass`
3. In **Environment Variables**, add these:

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/vitapass?sslmode=require
NEXT_PUBLIC_RP_ID=your-project.vercel.app          # ← Change this!
NEXT_PUBLIC_RP_NAME=VitaPass
JWT_SECRET=your-super-long-random-string-here      # Generate one
FACE_ENCRYPTION_SECRET=another-long-random-string  # For face embeddings
```

**Important**: 
- Set `NEXT_PUBLIC_RP_ID` to your actual Vercel domain (e.g. `vitapass-abc123.vercel.app`)
- After first deploy, update it if needed.

4. Click **Deploy**

Vercel will automatically:
- Install dependencies
- Run `prisma generate`
- Build the app

## Step 4: Run Database Migration

After first deploy:

1. Go to your project on Vercel → **Settings** → **Environment Variables**
2. Add a new variable temporarily:
   - `PRISMA_MIGRATE=true`
3. Redeploy once (this runs migrations)
4. Remove the variable after successful migration

Or run locally first:
```bash
npx prisma migrate deploy
```

## Step 5: Add Face Models (Important)

Create folder `public/models` and add the 3 face-api.js model files (see README for download links).

Vercel will serve them automatically.

## Step 6: Update WebAuthn RP_ID

After deployment, go to:
**Vercel → Settings → Environment Variables**

Update:
- `NEXT_PUBLIC_RP_ID` = your actual domain (without https://)

Then redeploy.

## Your Free Live URL

`https://your-project-name.vercel.app`

## Free Limits (Very Generous)

- **Vercel**: Unlimited hobby projects, 100GB bandwidth/month
- **Neon Postgres**: 0.5 GB storage, 1M queries/month (enough for thousands of users)
- **face-api.js models**: ~12MB total — served free from Vercel CDN

## Pro Tips for Production

1. Add a custom domain (free with Vercel + Cloudflare)
2. Enable **Vercel Analytics** (free)
3. Set up **GitHub Actions** for auto-deploy on push
4. Monitor with **Vercel Speed Insights** (free)

---

**You're live in under 10 minutes.**

Your platform now has:
- ✅ Passkey login (WebAuthn)
- ✅ AI Liveness detection
- ✅ Server-side encrypted face embeddings
- ✅ Full production database
- ✅ HTTPS + automatic SSL

**Zero cost. Production grade.**

Need help with any step? Paste the error and I’ll fix it instantly.
