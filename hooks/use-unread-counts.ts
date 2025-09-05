"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getNotifications, getConversationList } from "@/lib/firebase-services"
import type { Notification, Message } from "@/types"

export function useUnreadCounts() {
  const { dbUser } = useAuth()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!dbUser?.id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Subscribe to notifications
    const unsubscribeNotifications = getNotifications(dbUser.id, (notifications: Notification[]) => {
      const unreadCount = notifications.filter(notification => !notification.isRead).length
      setUnreadNotifications(unreadCount)
    })

    // Subscribe to conversations to get unread message count
    const unsubscribeMessages = getConversationList(dbUser.id, (conversations: Message[]) => {
      // Sum up unread counts from all conversations
      const totalUnread = conversations.reduce((sum, conversation) => {
        return sum + (conversation.unreadCount || 0)
      }, 0)
      setUnreadMessages(totalUnread)
      setIsLoading(false)
    })

    return () => {
      unsubscribeNotifications()
      unsubscribeMessages()
    }
  }, [dbUser?.id])

  return {
    unreadNotifications,
    unreadMessages,
    isLoading,
    hasUnreadNotifications: unreadNotifications > 0,
    hasUnreadMessages: unreadMessages > 0,
  }
}
