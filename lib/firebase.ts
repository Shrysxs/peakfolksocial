import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, serverTimestamp } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

/**
 * Firebase configuration pulled from NEXT_PUBLIC_*
 * env vars (must be set in the Vercel dashboard).
 */
const firebaseConfig = {
  apiKey: "AIzaSyCqSDILALDaKmB7vnDQd-HyRXD-BWnxmjE",
  authDomain: "peakfolk-social.firebaseapp.com",
  projectId: "peakfolk-social",
  storageBucket: "peakfolk-social.appspot.com",
  messagingSenderId: "821308620894",
  appId: "1:821308620894:web:be8dc2a7cfbf522bfdb4cf",
  measurementId: "G-MRYNV55LMV"
};

/* -------------------------------------------------------------------------- */
/*   Validate config early so deployments fail fast if something is missing   */
/* -------------------------------------------------------------------------- */
for (const [key, value] of Object.entries({
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
})) {
  if (!value) {
    throw new Error(
      `Firebase config error: Environment variable "${key}" is missing.\n` +
        "Set it in the Vercel dashboard → Environment Variables and redeploy.",
    )
  }
}

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
