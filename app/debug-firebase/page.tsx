'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { auth, db, storage, isFirebaseReady } from '@/lib/firebase'
import { getFirebasePublic } from '@/lib/env'

export default function DebugFirebasePage() {
  const [config, setConfig] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<string>('checking')
  const [dbStatus, setDbStatus] = useState<string>('checking')
  const [storageStatus, setStorageStatus] = useState<string>('checking')

  const checkFirebaseStatus = () => {
    // Get config
    const firebaseConfig = getFirebasePublic(true)
    setConfig(firebaseConfig)

    // Check auth
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        setAuthStatus('ready')
      } else {
        setAuthStatus('failed')
      }
    } catch (e) {
      setAuthStatus('error')
    }

    // Check database
    try {
      if (db && typeof db.collection === 'function') {
        setDbStatus('ready')
      } else {
        setDbStatus('failed')
      }
    } catch (e) {
      setDbStatus('error')
    }

    // Check storage
    try {
      if (storage) {
        setStorageStatus('ready')
      } else {
        setStorageStatus('failed')
      }
    } catch (e) {
      setStorageStatus('error')
    }
  }

  useEffect(() => {
    checkFirebaseStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-600">Ready</Badge>
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      case 'checking':
        return <Badge variant="secondary">Checking</Badge>
      default:
        return <Badge variant="destructive">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Firebase Debug Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time Firebase service status and configuration
          </p>
        </div>
        <Button onClick={checkFirebaseStatus} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(isFirebaseReady ? 'ready' : 'failed')}
              Firebase Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(isFirebaseReady ? 'ready' : 'failed')}
              <span className="text-sm text-muted-foreground">
                {isFirebaseReady ? 'Firebase is properly initialized' : 'Firebase initialization failed'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config && Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <code className="text-sm font-mono">{key}</code>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <>
                        <Badge variant="default">Set</Badge>
                        <code className="text-xs text-muted-foreground">
                          {typeof value === 'string' && value.length > 20 
                            ? `${value.substring(0, 20)}...` 
                            : String(value)}
                        </code>
                      </>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(authStatus)}
                  <span className="font-medium">Authentication</span>
                </div>
                {getStatusBadge(authStatus)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(dbStatus)}
                  <span className="font-medium">Firestore Database</span>
                </div>
                {getStatusBadge(dbStatus)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(storageStatus)}
                  <span className="font-medium">Cloud Storage</span>
                </div>
                {getStatusBadge(storageStatus)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Environment:</strong> {process.env.NODE_ENV || 'unknown'}</div>
              <div><strong>Is Browser:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</div>
              <div><strong>Firebase Ready:</strong> {isFirebaseReady ? 'Yes' : 'No'}</div>
              <div><strong>Auth Object:</strong> {auth ? 'Available' : 'Undefined'}</div>
              <div><strong>DB Object:</strong> {db ? 'Available' : 'Undefined'}</div>
              <div><strong>Storage Object:</strong> {storage ? 'Available' : 'Undefined'}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
