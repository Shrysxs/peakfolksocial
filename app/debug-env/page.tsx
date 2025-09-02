'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEnv = async () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') return;
        
        // Get all environment variables that start with NEXT_PUBLIC_
        const publicVars = Object.entries(process.env)
          .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value
          }), {});

        setEnvVars(publicVars);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkEnv();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading environment variables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).filter(([key]) => key.startsWith('NEXT_PUBLIC_FIREBASE_')).map(([key, value]) => (
                <div key={key} className="flex items-baseline">
                  <code className="text-sm bg-gray-100 p-1 rounded mr-2">{key}:</code>
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {value || '❌ Not set'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
