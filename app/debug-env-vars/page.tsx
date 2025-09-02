'use client'

import { getFirebasePublic } from '@/lib/env'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function DebugEnvVarsPage() {
  const config = getFirebasePublic(false)
  
  const envVars = [
    { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: config.apiKey, required: true },
    { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', value: config.authDomain, required: true },
    { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: config.projectId, required: true },
    { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', value: config.storageBucket, required: true },
    { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', value: config.messagingSenderId, required: true },
    { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: config.appId, required: true },
    { key: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', value: config.measurementId, required: false },
  ]

  const getStatus = (value: string, required: boolean) => {
    if (!value || value.trim() === '') {
      return required ? 'missing' : 'optional-missing'
    }
    return 'present'
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'optional-missing':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'default'
      case 'missing':
        return 'destructive'
      case 'optional-missing':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const missingRequired = envVars.filter(env => env.required && getStatus(env.value, env.required) === 'missing')

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Environment Variables Debug</h1>
        <p className="text-muted-foreground">
          Check if Firebase environment variables are properly configured on Vercel
        </p>
      </div>

      {missingRequired.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Configuration Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-2">
              {missingRequired.length} required environment variable(s) are missing:
            </p>
            <ul className="list-disc list-inside text-red-600">
              {missingRequired.map(env => (
                <li key={env.key}>{env.key}</li>
              ))}
            </ul>
            <p className="text-red-600 mt-3 text-sm">
              Add these in Vercel Project Settings → Environment Variables and redeploy.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Firebase Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {envVars.map((env) => {
              const status = getStatus(env.value, env.required)
              return (
                <div key={env.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getIcon(status)}
                    <div>
                      <code className="text-sm font-mono">{env.key}</code>
                      {!env.required && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(status)}>
                      {status === 'present' ? 'Set' : status === 'missing' ? 'Missing' : 'Not Set'}
                    </Badge>
                    {env.value && (
                      <code className="text-xs text-muted-foreground max-w-32 truncate">
                        {env.value.substring(0, 20)}...
                      </code>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Build Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV || 'unknown'}
            </div>
            <div>
              <strong>Build Time:</strong> {new Date().toISOString()}
            </div>
            <div>
              <strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
