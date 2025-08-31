"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        // If user is not logged in, send to login. Preserve intended path for post-login redirect.
        const redirectTo = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : ""
        router.replace(`/login${redirectTo}`)
      }
    }
  }, [currentUser, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="text-orange-500" size="lg" />
      </div>
    )
  }

  if (!currentUser) return null

  return <>{children}</>
}
