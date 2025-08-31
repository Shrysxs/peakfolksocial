// Centralized environment variable access and validation
// - Public variables must be prefixed with NEXT_PUBLIC_ (available to client)
// - Server-only secrets must NOT be prefixed (available only on server)
// NOTE: Avoid throwing during server/import time for public vars to prevent
//       Vercel prerender builds from failing when client-only envs are not injected.

type RequiredPublicVar =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"

function getEnv(name: string): string | undefined {
  return process.env[name]
}

function requireEnv(name: RequiredPublicVar): string {
  const v = getEnv(name)
  if (!v) {
    // If we're in the browser, never hard-throw. This avoids breaking the entire app
    // when client bundles were built without inlined NEXT_PUBLIC_* variables.
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error(
        `Missing required environment variable: ${name}. Ensure it is set in Vercel Project Settings for this environment.`,
      )
      return ""
    }

    // On the server (build-time or runtime), throwing is acceptable to fail fast.
    throw new Error(
      `Missing required environment variable: ${name}.\n` +
        "Set it in your .env.local for local dev, and in Vercel Project Settings → Environment Variables for deployments.",
    )
  }
  return v
}

// Firebase Public Config accessor (safe to expose to browsers; still keep out of git)
// By default (strict=false) it will NOT throw, so that server/import time doesn't fail.
// Call with strict=true in browser when actually initializing Firebase.
export function getFirebasePublic(strict = false) {
  const read = (name: RequiredPublicVar) =>
    strict ? requireEnv(name) : (getEnv(name) || "")

  return {
    apiKey: read("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: read("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: read("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: read("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: read("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: read("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId: getEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"), // optional
  }
}

// NextAuth (server-only)
export const NEXTAUTH_URL = getEnv("NEXTAUTH_URL")
export const NEXTAUTH_SECRET = getEnv("NEXTAUTH_SECRET")

// Feature flags (public)
function toBool(v: string | undefined, def = false) {
  if (v === undefined) return def
  return /^(1|true|yes|on)$/i.test(v)
}

export const FLAGS = {
  ENABLE_PWA: toBool(getEnv("NEXT_PUBLIC_ENABLE_PWA"), true),
  ENABLE_ANALYTICS: toBool(getEnv("NEXT_PUBLIC_ENABLE_ANALYTICS"), true),
  ENABLE_PUSH_NOTIFICATIONS: toBool(getEnv("NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS"), true),
  ENABLE_ADVANCED_SEARCH: toBool(getEnv("NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH"), true),
  ENABLE_ANALYTICS_DASHBOARD: toBool(getEnv("NEXT_PUBLIC_ENABLE_ANALYTICS_DASHBOARD"), true),
}

// Build analysis
export const ANALYZE = toBool(getEnv("ANALYZE"), false)

// Dev network origins list
export const ALLOWED_DEV_ORIGINS = (getEnv("ALLOWED_DEV_ORIGINS") || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
