'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnvVars {
  nodeEnv?: string;
  public: {
    firebase: {
      [key: string]: string;
    };
    siteUrl: string;
    ogImage: string;
  };
}

export default function EnvTestPage() {
  const [envVars, setEnvVars] = useState<EnvVars | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const response = await fetch('/api/env-test');
        if (!response.ok) {
          throw new Error('Failed to fetch environment variables');
        }
        const data = await response.json();
        setEnvVars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvVars();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading environment variables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
              {error}
            </pre>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Make sure you're running this in a browser environment and the API route is accessible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Test</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This page shows the environment variables available in your application.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Node Environment:</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <code>{envVars?.nodeEnv || 'N/A'}</code>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Firebase Configuration:</h3>
                <div className="space-y-2">
                  {Object.entries(envVars?.public.firebase || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="w-48 font-mono text-sm">{key}:</span>
                      <span className={`font-mono text-sm ${
                        value.includes('❌') ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Site Configuration:</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-48 font-mono text-sm">NEXT_PUBLIC_SITE_URL:</span>
                    <span className={`font-mono text-sm ${
                      envVars?.public.siteUrl.includes('❌') ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {envVars?.public.siteUrl}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-48 font-mono text-sm">NEXT_PUBLIC_OG_IMAGE:</span>
                    <span className={`font-mono text-sm ${
                      envVars?.public.ogImage.includes('❌') ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {envVars?.public.ogImage}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Troubleshooting Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-600 dark:text-blue-400">
                <li>✅ Green checkmarks indicate the variable is set correctly</li>
                <li>❌ Red Xs indicate missing required variables</li>
                <li>If variables are missing, check your Vercel project settings</li>
                <li>After updating environment variables, redeploy your application</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
