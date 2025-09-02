import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, serverTimestamp } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"
import { getFirebasePublic } from "@/lib/env"
import { getRuntimeEnvConfigSync, isFirebaseConfigComplete, debugEnvState } from "@/lib/runtime-env"

// Try multiple config sources
let firebaseConfig = getFirebasePublic(typeof window !== "undefined")

// If we're in the browser and config is incomplete, try fallback sources
if (typeof window !== "undefined") {
  // Check if the original config is incomplete
  const isOriginalComplete = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  )

  if (!isOriginalComplete) {
    console.warn('🔥 Original Firebase config incomplete, trying fallback sources...')
    
    // Try injected config from window
    const injectedConfig = (window as any).__FIREBASE_CONFIG__
    if (injectedConfig && injectedConfig.apiKey) {
      console.log('✅ Using injected Firebase config from window.__FIREBASE_CONFIG__')
      firebaseConfig = injectedConfig
    } else {
      // Try runtime config as last resort
      const runtimeConfig = getRuntimeEnvConfigSync()
      if (isFirebaseConfigComplete(runtimeConfig)) {
        console.log('✅ Using runtime Firebase config')
        firebaseConfig = {
          apiKey: runtimeConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: runtimeConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: runtimeConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: runtimeConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: runtimeConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: runtimeConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: runtimeConfig.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        }
      }
    }
  }
  
  // Debug the environment state
  debugEnvState()
}

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
    "🔥 Firebase client config is incomplete. Authentication and database features will not work."
  )
  // eslint-disable-next-line no-console
  console.error("📋 Current config status:", {
    apiKey: firebaseConfig.apiKey ? `SET (${firebaseConfig.apiKey.substring(0, 10)}...)` : "❌ MISSING",
    authDomain: firebaseConfig.authDomain ? `SET (${firebaseConfig.authDomain})` : "❌ MISSING", 
    projectId: firebaseConfig.projectId ? `SET (${firebaseConfig.projectId})` : "❌ MISSING",
    appId: firebaseConfig.appId ? `SET (${firebaseConfig.appId.substring(0, 15)}...)` : "❌ MISSING"
  })
  // eslint-disable-next-line no-console
  console.error("🔧 Fix: Add missing variables in Vercel Project Settings → Environment Variables")
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
