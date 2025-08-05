"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getComments as getCommentsService, addComment as addCommentService } from "@/lib/firebase-services"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Comment } from "@/types"

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!postId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    const unsubscribe = getCommentsService(postId, (fetchedComments) => {
      setComments(fetchedComments)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [postId])

  return { comments, isLoading, isError }
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, userId, content }: { postId: string; userId: string; content: string }) =>
      addCommentService(postId, userId, content),
    onSuccess: () => {
      toast.success("Comment added!")
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`)
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] }) // Invalidate notifications for new comment
    },
  })
}
