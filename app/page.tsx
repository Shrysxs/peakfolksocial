"use client"

import React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function LandingPage() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (loading) return
    // Redirect authenticated users to feed, others to login
    router.replace(currentUser ? "/feed" : "/login")
  }, [currentUser, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner className="text-orange-500" size="lg" />
      </div>
    )
  }

  // Fallback UI while the router performs the redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <LoadingSpinner className="text-orange-500" size="lg" />
    </div>
  )
}
