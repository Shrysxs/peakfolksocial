"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getNotifications as getNotificationsService,
  markNotificationAsRead as markNotificationAsReadService,
} from "@/lib/firebase-services"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Notification } from "@/types"

export default function useNotifications(userId: string) {
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    const unsubscribe = getNotificationsService(userId, (fetchedNotifications) => {
      setNotifications(fetchedNotifications)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const { mutate: markAsRead, isPending: isMarkingAsRead } = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsReadService(notificationId),
    onMutate: async (notificationId) => {
      // Optimistically update the notification status
      await queryClient.cancelQueries({ queryKey: ["notifications", userId] })

      const previousNotifications = queryClient.getQueryData(["notifications", userId])

      queryClient.setQueryData(["notifications", userId], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        )
      })

      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      toast.error(`Failed to mark notification as read: ${err.message}`)
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", userId], context.previousNotifications)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] })
    },
  })

  return {
    notifications,
    markAsRead,
    isLoading,
    isError,
    isMarkingAsRead,
  }
}
