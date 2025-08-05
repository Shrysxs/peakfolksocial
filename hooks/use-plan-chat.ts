"use client"

import { useState, useEffect } from "react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { onSnapshot, query, where, orderBy, limit, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendPlanMessage, getPlanMessages, sendPlanAnnouncement } from "@/lib/firebase-services"
import { toast } from "sonner"
import type { PlanMessage } from "@/types"
import { useAuth } from "@/contexts/auth-context"

export function usePlanChat(planId: string) {
  const queryClient = useQueryClient()
  const { dbUser } = useAuth()
  const [isTyping, setIsTyping] = useState(false)

  // Fetch plan messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["planMessages", planId],
    queryFn: async ({ pageParam }) => getPlanMessages(planId, 50, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  })

  const messages = messagesData?.pages.flatMap((page) => page.messages) || []

  // Real-time subscription to new messages
  useEffect(() => {
    if (!planId) return

    const messagesQuery = query(
      collection(db, "planMessages"),
      where("planId", "==", planId),
      orderBy("createdAt", "desc"),
      limit(1)
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newMessage = { id: change.doc.id, ...change.doc.data() } as PlanMessage
          queryClient.setQueryData(["planMessages", planId], (oldData: any) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0) {
                  return {
                    ...page,
                    messages: [newMessage, ...page.messages.filter((m: PlanMessage) => m.id !== newMessage.id)],
                  }
                }
                return page
              }),
            }
          })
        }
      })
    })

    return () => unsubscribe()
  }, [planId, queryClient])

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async ({ content, type = "text" }: { content: string; type?: "text" | "image" | "announcement" }) => {
      if (!dbUser) throw new Error("You must be logged in to send messages.")
      return sendPlanMessage(planId, dbUser.id, content, type)
    },
    onSuccess: () => {
      toast.success("Message sent!")
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["planMessages", planId] })
    },
  })

  // Send announcement mutation (organizer only)
  const { mutate: sendAnnouncement, isPending: isSendingAnnouncement } = useMutation({
    mutationFn: async (content: string) => {
      if (!dbUser) throw new Error("You must be logged in to send announcements.")
      return sendPlanAnnouncement(planId, dbUser.id, content)
    },
    onSuccess: () => {
      toast.success("Announcement sent!")
    },
    onError: (error) => {
      toast.error(`Failed to send announcement: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["planMessages", planId] })
    },
  })

  return {
    messages,
    sendMessage,
    sendAnnouncement,
    isSending,
    isSendingAnnouncement,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isTyping,
    setIsTyping,
  }
} 