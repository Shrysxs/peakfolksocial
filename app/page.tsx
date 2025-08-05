"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MountainIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function LandingPage() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && currentUser) {
      router.push("/feed")
    }
  }, [currentUser, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner className="text-orange-500" size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center space-y-6">
        <MountainIcon className="mx-auto h-24 w-24 text-orange-500 animate-pulse-slow" />
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-lg">
          Peakfolk
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Connect with fellow adventurers, share your journeys, and plan your next outdoor experience.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login">
            <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-orange-500 text-orange-500 hover:bg-orange-900 hover:text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-transparent"
            >
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
