import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, serverTimestamp } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"
import { getFirebasePublic } from "@/lib/env"

// Build a non-strict config at module load to avoid throwing on the server.
// Strict validation happens only when actually initializing in the browser.
const firebaseConfig = getFirebasePublic(false)

/* -------------------------------------------------------------------------- */
/*   Validate config early so deployments fail fast if something is missing   */
/* -------------------------------------------------------------------------- */
// Validation is handled centrally in lib/env.ts

/* ---------------------------- Initialize SDKs ---------------------------- */
const isBrowser = typeof window !== "undefined"
// Only initialize in the browser with strict env validation.
const app = isBrowser ? (getApps().length ? getApp() : initializeApp(getFirebasePublic(true))) : (undefined as unknown as ReturnType<typeof initializeApp>)
const auth = isBrowser ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>)
const db = isBrowser ? getFirestore(app) : (undefined as unknown as ReturnType<typeof getFirestore>)
const storage = isBrowser ? getStorage(app) : (undefined as unknown as ReturnType<typeof getStorage>)

/**
 * Initialize Analytics **only** in the browser.
 * The Analytics SDK throws when invoked on the server.
 */
// Only enable analytics if a measurementId exists and the environment supports it.
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined
if (isBrowser) {
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
}
