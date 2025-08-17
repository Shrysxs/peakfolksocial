import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, serverTimestamp } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"
import { FIREBASE_PUBLIC } from "@/lib/env"

/**
 * Firebase configuration pulled from NEXT_PUBLIC_*
 * env vars (must be set in the Vercel dashboard).
 */
const firebaseConfig = {
  apiKey: FIREBASE_PUBLIC.apiKey,
  authDomain: FIREBASE_PUBLIC.authDomain,
  projectId: FIREBASE_PUBLIC.projectId,
  storageBucket: FIREBASE_PUBLIC.storageBucket,
  messagingSenderId: FIREBASE_PUBLIC.messagingSenderId,
  appId: FIREBASE_PUBLIC.appId,
  measurementId: FIREBASE_PUBLIC.measurementId,
}

/* -------------------------------------------------------------------------- */
/*   Validate config early so deployments fail fast if something is missing   */
/* -------------------------------------------------------------------------- */
// Validation is handled centrally in lib/env.ts

/* ---------------------------- Initialize SDKs ---------------------------- */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

/**
 * Initialize Analytics **only** in the browser.
 * The Analytics SDK throws when invoked on the server.
 */
const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined

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
