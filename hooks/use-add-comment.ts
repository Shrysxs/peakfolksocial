"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addComment } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

interface AddCommentPayload {
  postId: string
  userId: string
  text: string
}

export function useAddComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => addComment(payload.postId, payload.userId, payload.text),
    onSuccess: (_, { postId }) => {
      // make sure post & comment queries update
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
      toast({ title: "Comment added" })
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message ?? "Could not add comment",
        variant: "destructive",
      })
    },
  })
}
