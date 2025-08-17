<img src="public/placeholder-logo.png" alt="Peakfolk" width="96"/>

# Peakfolk Social

A modern social platform built with Next.js 15 (App Router), TypeScript, and Firebase. Plan trips with friends, share posts, chat, and use it offline with PWA.

## Tech Stack

- **Next.js 15 App Router** with `app/`
- **TypeScript** with strict config and `@/*` path alias
- **Firebase**: Auth, Firestore, Storage, Admin (API routes)
- **UI**: Tailwind CSS, Radix UI
- **State/Data**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **PWA**: Web App Manifest + runtime checks

## Structure (high-level)

```
app/
  (app)/           # main routes and layout
  (auth)/          # auth routes
  api/             # Next.js Route Handlers (server)
components/        # UI + feature components
config/            # site/seo/feature-flags/routes
contexts/          # React contexts (e.g., auth)
hooks/             # data + mutations
lib/               # firebase, env, admin, utils
providers/         # providers (React Query, theme)
types/             # shared types
```

## Local Setup

1) Prereqs
- Node 18+ and npm 8+
- A Firebase project (Auth+Firestore+Storage; Analytics optional)

2) Install
```bash
npm install
```

3) Configure env
```bash
cp .env.example .env.local
```
Fill in `.env.local` values (see `.env.example`). Required public Firebase vars are validated in `@/lib/env`.

4) Firebase console
- Enable Email/Password and Google sign-in
- Create Firestore DB (production or test mode)
- Enable Storage

5) Dev server
```bash
npm run dev
```

## Testing

Jest + React Testing Library are configured.
```bash
npm test           # run once
npm run test:watch # watch mode
```

## Useful scripts

- `npm run dev` – start dev server
- `npm run build` – Next.js production build
- `npm start` – run production server
- `npm run lint` – ESLint
- `npm run type-check` – TypeScript

## Deploy to Vercel

1) Import the repo into Vercel.
2) Set Environment Variables in Vercel Project Settings → Environment Variables.
   - Public (browser-exposed) values must keep the `NEXT_PUBLIC_` prefix.
   - Server-only (no prefix) for Firebase Admin credentials.
3) Deploy from the dashboard or on every push to `main`.

Required (examples) – see `.env.example`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (and optional `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`)
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` (server-only)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (if using NextAuth)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Notes

- Path aliases: import shared modules with `@/` (e.g., `@/lib/firebase-services`).
- Config is centralized in `config/` (`site.ts`, `seo.ts`, `feature-flags.ts`, `routes.ts`).
- Env validation and feature flags live in `@/lib/env`.

---

Built with ❤️ using Next.js + Firebase.
