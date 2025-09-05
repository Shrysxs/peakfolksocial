"use client"

import { useEffect, useState } from "react"
import { getPostsRealtime } from "@/lib/firebase-services"
import type { Post } from "@/types"

export function usePostsRealtime(limitCount = 20) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setIsError(false)

    const unsubscribe = getPostsRealtime((fetchedPosts) => {
      setPosts(fetchedPosts)
      setIsLoading(false)
    }, limitCount)

    return () => unsubscribe()
  }, [limitCount])

  return {
    posts,
    isLoading,
    isError,
    refetch: () => {
      setIsLoading(true)
      setIsError(false)
    }
  }
}
