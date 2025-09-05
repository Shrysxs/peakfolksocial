"use client"

import { useEffect, useState } from "react"
import { getPlansRealtime } from "@/lib/firebase-services"
import type { Plan } from "@/types"

interface PlansFilter {
  location?: string
  category?: string
}

export function usePlansRealtime(filters?: PlansFilter, limitCount = 20) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setIsError(false)

    const unsubscribe = getPlansRealtime((fetchedPlans) => {
      setPlans(fetchedPlans)
      setIsLoading(false)
    }, limitCount, filters)

    return () => unsubscribe()
  }, [limitCount, filters?.location, filters?.category])

  return {
    plans,
    isLoading,
    isError,
    refetch: () => {
      setIsLoading(true)
      setIsError(false)
    }
  }
}
