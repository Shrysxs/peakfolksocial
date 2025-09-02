// Runtime environment variable loader for Vercel deployments
// This handles cases where NEXT_PUBLIC_ vars aren't properly injected during build

interface RuntimeEnvConfig {
  NEXT_PUBLIC_FIREBASE_API_KEY: string
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  NEXT_PUBLIC_FIREBASE_APP_ID: string
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string
}

// Fallback runtime config loader
export async function getRuntimeEnvConfig(): Promise<RuntimeEnvConfig> {
  // First try to get from process.env (normal Next.js behavior)
  let config = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  }

  // If we're in the browser and any required vars are missing, fetch from API
  if (typeof window !== 'undefined') {
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ] as const

    const missingVars = requiredVars.filter(key => !config[key])
    
    if (missingVars.length > 0) {
      console.warn('🔥 Missing Firebase env vars:', missingVars)
      console.warn('🔧 Attempting to fetch from server...')
      
      try {
        const response = await fetch('/api/env-config')
        const data = await response.json()
        
        if (data.isComplete) {
          console.log('✅ Successfully fetched Firebase config from server')
          config = {
            NEXT_PUBLIC_FIREBASE_API_KEY: data.config.apiKey,
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: data.config.authDomain,
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: data.config.projectId,
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: data.config.storageBucket,
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: data.config.messagingSenderId,
            NEXT_PUBLIC_FIREBASE_APP_ID: data.config.appId,
            NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: data.config.measurementId,
          }
        } else {
          console.error('❌ Server-side config is also incomplete:', data.debug)
        }
      } catch (error) {
        console.error('❌ Failed to fetch config from server:', error)
      }
    }
  }

  return config
}

// Synchronous version for immediate use
export function getRuntimeEnvConfigSync(): RuntimeEnvConfig {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  }
}

// Check if Firebase config is complete
export function isFirebaseConfigComplete(config: RuntimeEnvConfig): boolean {
  return !!(
    config.NEXT_PUBLIC_FIREBASE_API_KEY &&
    config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    config.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    config.NEXT_PUBLIC_FIREBASE_APP_ID
  )
}

// Debug function to log current env state
export function debugEnvState(): void {
  if (typeof window === 'undefined') return
  
  const config = getRuntimeEnvConfigSync()
  const isComplete = isFirebaseConfigComplete(config)
  
  console.group('🔍 Firebase Environment Debug')
  console.log('Config complete:', isComplete)
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Variables:', {
    apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY ? `SET (${config.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...)` : '❌ MISSING',
    authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ MISSING',
    projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ MISSING',
    appId: config.NEXT_PUBLIC_FIREBASE_APP_ID ? `SET (${config.NEXT_PUBLIC_FIREBASE_APP_ID.substring(0, 15)}...)` : '❌ MISSING'
  })
  console.groupEnd()
}
