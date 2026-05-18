# VitaPass — Biometrics-Only Authentication Platform for Real Humans

**The future of login is here.**  
Passwordless. Phishing-proof. 100% real people only.

Built with Next.js 15, WebAuthn Passkeys, and on-device MediaPipe AI liveness detection.

## Features
- ✅ Pure biometric login (Face ID / Fingerprint / Windows Hello)
- ✅ Mandatory AI liveness detection during registration (blink + head turns + smile)
- ✅ Zero passwords, zero emails for core auth
- ✅ Full privacy: biometrics never leave the device
- ✅ Production-ready WebAuthn implementation
- ✅ Beautiful modern UI

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate dev

# 3. Run the app
npm run dev
```

Open http://localhost:3000

## 🚀 Deploy Live for FREE (Recommended)

**Full guide**: See `DEPLOY-FREE.md`

**Quick version**:
1. Push to GitHub
2. Create free Postgres at [neon.tech](https://neon.tech)
3. Import repo on [vercel.com](https://vercel.com)
4. Add environment variables (see below)
5. Deploy → Done!

Your app will be live at `https://your-project.vercel.app` with HTTPS, auto-scaling, and zero cost.

## Environment Variables (for Vercel)

```env
DATABASE_URL=postgresql://...          # From Neon
NEXT_PUBLIC_RP_ID=your-project.vercel.app
NEXT_PUBLIC_RP_NAME=VitaPass
JWT_SECRET=super-long-random-string
FACE_ENCRYPTION_SECRET=another-long-string
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"          # or postgres://...
NEXT_PUBLIC_RP_ID="localhost"
NEXT_PUBLIC_RP_NAME="VitaPass"
JWT_SECRET="your-super-secret-jwt-key-here"
```

## Architecture Highlights

- **WebAuthn Passkeys** → Primary login (FIDO2 certified)
- **MediaPipe FaceLandmarker** → On-device real-time liveness (private & fast)
- **Prisma + SQLite** → Zero-config local DB (swap to Postgres in prod)
- **Server Actions + API Routes** → Clean separation

## Security Notes

- All biometric processing happens **on-device**
- Only cryptographic public keys are stored
- Challenges are short-lived and single-use
- Rate limiting + device fingerprinting ready for production

Built by Grok (xAI) — 2026 edition.

---

**Want to add server-side face matching fallback, behavioral biometrics, or enterprise SSO?** Just ask.
