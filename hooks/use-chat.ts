"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendMessage as sendMessageService, getMessages as getMessagesService } from "@/lib/firebase-services"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Message } from "@/types"

export default function useChat(currentUserId: string, otherUserId: string) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isErrorMessages, setIsErrorMessages] = useState(false)

  useEffect(() => {
    if (!currentUserId || !otherUserId) {
      setIsLoadingMessages(false)
      return
    }

    setIsLoadingMessages(true)
    setIsErrorMessages(false)
    const unsubscribe = getMessagesService(currentUserId, otherUserId, (fetchedMessages) => {
      setMessages(fetchedMessages)
      setIsLoadingMessages(false)
    })

    return () => unsubscribe()
  }, [currentUserId, otherUserId])

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: ({ senderId, receiverId, content }: { senderId: string; receiverId: string; content: string }) =>
      sendMessageService(senderId, receiverId, content),
    onMutate: async ({ senderId, receiverId, content }) => {
      // Optimistically add the new message to the chat
      const conversationId = [senderId, receiverId].sort().join("_")
      await queryClient.cancelQueries({ queryKey: ["chatMessages", senderId, receiverId] })

      const previousMessages = queryClient.getQueryData(["chatMessages", senderId, receiverId])

      queryClient.setQueryData(["chatMessages", senderId, receiverId], (oldMessages: Message[] | undefined) => {
        const newMessage: Message = {
          id: `optimistic-${Date.now()}`, // Temporary ID
          conversationId,
          senderId,
          receiverId,
          content,
          type: "text",
          createdAt: new Date(), // Optimistic timestamp
          isRead: false,
          read: false, // Add this line
        }
        return oldMessages ? [...oldMessages, newMessage] : [newMessage]
      })

      return { previousMessages }
    },
    onError: (err, { senderId, receiverId }, context) => {
      toast.error(`Failed to send message: ${err.message}`)
      if (context?.previousMessages) {
        queryClient.setQueryData(["chatMessages", senderId, receiverId], context.previousMessages)
      }
    },
    onSettled: (_, __, { senderId, receiverId }) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", senderId, receiverId] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] }) // For new message notification
      queryClient.invalidateQueries({ queryKey: ["conversations", senderId] }) // For inbox view
    },
  })

  return {
    messages,
    sendMessage,
    isLoadingMessages,
    isSendingMessage,
    isErrorMessages,
  }
}
