"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createStory as createStoryService, getActiveStories as getActiveStoriesService } from "@/lib/firebase-services"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function useCreateStory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, imageFile }: { userId: string; imageFile: File }) => createStoryService(userId, imageFile),
    onSuccess: () => {
      toast.success("Story created successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to create story: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] })
    },
  })
}

export function useActiveStories() {
  const [stories, setStories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setIsError(false)
    const unsubscribe = getActiveStoriesService((fetchedStories) => {
      setStories(fetchedStories)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { stories, isLoading, isError }
}
