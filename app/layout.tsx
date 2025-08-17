import * as React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"
import QueryProvider from "@/providers/query-provider"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ErrorBoundary } from "@/components/error-boundary"
import { defaultSEO } from "@/config/seo"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  ...defaultSEO,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peakfolk",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Error handling script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle chunk load errors
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('Loading chunk')) {
                  console.error('Chunk load error detected:', e);
                  // Reload the page to retry loading chunks
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              });

              // Handle unhandled promise rejections
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
                e.preventDefault();
              });

              // Handle network errors
              window.addEventListener('online', function() {
                // Network connection restored - could trigger UI update if needed
              });

              window.addEventListener('offline', function() {
                // Network connection lost - could trigger UI update if needed
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <AuthProvider>
                <div className="min-h-screen relative overflow-hidden">
                  {/* Enhanced background with subtle glow effects */}
                  <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
                  <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent"></div>
                  <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float"></div>
                  <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                  
                  {/* Main content */}
                  <div className="relative z-10">
                    {children}
                  </div>
                  
                  <OfflineIndicator />
                  <PWAInstallPrompt />
                </div>
                <Toaster />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
