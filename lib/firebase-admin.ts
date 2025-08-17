import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, FieldValue as AdminFieldValue } from "firebase-admin/firestore"

// Lazy initialization to prevent build-time crashes
let adminApp: App | null = null

function initAdmin(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n")
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[Firebase Admin] Missing service account credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in the environment.",
    )
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initAdmin()
  }
  return adminApp
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}

export const FieldValue = AdminFieldValue
