'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error caught:', error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-xl text-white">Critical Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-center">
                A critical error occurred. Please refresh the page or try again later.
              </p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={reset}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try again
                </Button>
                
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go home
                  </Button>
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700">
                  <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                    Error details (development only)
                  </summary>
                  <pre className="text-xs text-red-400 overflow-auto">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
} 