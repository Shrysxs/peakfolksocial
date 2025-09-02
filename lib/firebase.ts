import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, serverTimestamp } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"
import { getFirebasePublic } from "@/lib/env"

// Build a strict config in browser, non-strict on server to avoid SSR issues
const firebaseConfig = getFirebasePublic(typeof window !== "undefined")

/* -------------------------------------------------------------------------- */
/*   Validate config early so deployments fail fast if something is missing   */
/* -------------------------------------------------------------------------- */
// Validation is handled centrally in lib/env.ts

/* ---------------------------- Initialize SDKs ---------------------------- */
const isBrowser = typeof window !== "undefined"

// Validate minimal client keys before attempting init
// Auth/Firestore only require: apiKey, authDomain, projectId, appId
const hasClientFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

const app = isBrowser && hasClientFirebaseConfig
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : (undefined as unknown as ReturnType<typeof initializeApp>)

const auth = isBrowser && app ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>)
const db = isBrowser && app ? getFirestore(app) : (undefined as unknown as ReturnType<typeof getFirestore>)
const storage = isBrowser && app ? getStorage(app) : (undefined as unknown as ReturnType<typeof getStorage>)

if (isBrowser && !hasClientFirebaseConfig) {
  // Surface a clear console error in production without crashing the UI
  // Missing NEXT_PUBLIC_FIREBASE_* envs at build time – verify Vercel envs and redeploy.
  // This log replaces a hard throw from requireEnv so the app remains usable enough to render login pages.
  // eslint-disable-next-line no-console
  console.error(
    "Firebase client config is incomplete. Set NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, and APP_ID in Vercel envs and redeploy."
  )
  // eslint-disable-next-line no-console
  console.error("Current config values:", {
    apiKey: firebaseConfig.apiKey ? "SET" : "MISSING",
    authDomain: firebaseConfig.authDomain ? "SET" : "MISSING", 
    projectId: firebaseConfig.projectId ? "SET" : "MISSING",
    appId: firebaseConfig.appId ? "SET" : "MISSING"
  })
}

/**
 * Initialize Analytics **only** in the browser.
 * The Analytics SDK throws when invoked on the server.
 */
// Only enable analytics if a measurementId exists and the environment supports it.
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined
if (isBrowser && app) {
  try {
    const cfg = getFirebasePublic(false)
    if (cfg.measurementId) {
      // getAnalytics can throw on some environments (e.g., unsupported browsers)
      analytics = getAnalytics(app)
    }
  } catch {
    // Silently disable analytics rather than crashing the app
    analytics = undefined
  }
}

/* ------------------------- Google Auth Provider -------------------------- */
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export {
  app,
  auth,
  db,
  storage,
  analytics,
  googleProvider,
  serverTimestamp, // convenient re-export
  hasClientFirebaseConfig as isFirebaseReady,
}
