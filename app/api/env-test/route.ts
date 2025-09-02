import { NextResponse } from 'next/server';

export async function GET() {
  // Only expose non-sensitive, public environment variables
  const envVars = {
    nodeEnv: process.env.NODE_ENV,
    public: {
      firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '✅ Set' : '❌ Missing (Optional)',
      },
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '❌ Not set (using default)',
      ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '❌ Not set (using default)',
    },
    // Note: Server-side only variables are not exposed for security
  };

  return NextResponse.json(envVars);
}

// Prevent caching of this endpoint
export const dynamic = 'force-dynamic';
