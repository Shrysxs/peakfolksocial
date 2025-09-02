#!/usr/bin/env node

/**
 * Environment validation script for Vercel deployments
 * This runs during build to ensure all required env vars are present
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
]

const missing = []
const present = []

console.log('🔍 Validating environment variables...')

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar] || process.env[envVar].trim() === '') {
    missing.push(envVar)
  } else {
    present.push(envVar)
  }
})

console.log(`✅ Found ${present.length} required variables:`)
present.forEach(env => console.log(`   - ${env}`))

if (missing.length > 0) {
  console.error(`❌ Missing ${missing.length} required environment variables:`)
  missing.forEach(env => console.error(`   - ${env}`))
  console.error('\n🚨 Build will fail without these variables!')
  console.error('📝 Add them in Vercel Project Settings → Environment Variables')
  process.exit(1)
}

console.log('✅ All required environment variables are present!')
