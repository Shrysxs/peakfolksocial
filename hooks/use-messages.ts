"use client"

import { useQueryClient } from "@tanstack/react-query"
import { getConversationList as getConversationListService } from "@/lib/firebase-services"
import { useEffect, useState } from "react"
import type { Message } from "@/types"

export default function useMessages(userId: string) {
  const queryClient = useQueryClient()
  const [conversations, setConversations] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    const unsubscribe = getConversationListService(userId, (fetchedConversations) => {
      setConversations(fetchedConversations)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  // This hook is for the inbox view, so `openConversation` would typically be handled by navigation.
  // However, to match the requested export, I'll provide a placeholder.
  const openConversation = (otherUserId: string) => {
    // This would typically navigate to the chat page with the selected user
    // Opening conversation with user
    // Example: router.push(`/messages?chatWith=${otherUserId}`);
  }

  return {
    conversations,
    openConversation,
    isLoading,
    isError,
  }
}
