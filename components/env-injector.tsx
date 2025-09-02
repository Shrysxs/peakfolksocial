// Server component that injects environment variables at build time
export function EnvInjector() {
  const envScript = `
    window.__FIREBASE_CONFIG__ = {
      apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
      authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
      projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
      storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
      messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
      appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
      measurementId: "${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''}"
    };
    console.log('🔧 Firebase config injected at build time:', window.__FIREBASE_CONFIG__);
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: envScript }}
    />
  );
}
