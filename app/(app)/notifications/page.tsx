"use client"

import { useAuth } from "@/contexts/auth-context"
import useNotifications from "@/hooks/use-notifications"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, MessageCircle, Heart, Users, Edit, X, Megaphone, BellOff, Sparkles } from "lucide-react"
import { toDate } from "@/lib/firebase-services"
import Link from "next/link"
import { toast } from "sonner"

export default function NotificationsPage() {
  const { dbUser } = useAuth()
  const { notifications, isLoading, isError, markAsRead } = useNotifications(dbUser?.id || "")

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId, {
      onError: (error) => toast.error(`Failed to mark as read: ${error.message}`),
    })
  }

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center max-w-md">
          <Bell className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Stay Updated</h2>
          <p className="text-gray-400 mb-6">Log in to see your notifications and stay connected with your adventure community.</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">Login to Continue</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-400">Loading your notifications...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-red-500 mb-6">Failed to load notifications. Please try refreshing the page.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-orange-600 hover:bg-orange-700"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
          <div className="relative mb-6">
            <BellOff className="h-20 w-20 text-gray-500 mx-auto" />
            <Sparkles className="h-6 w-6 text-orange-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">All Caught Up!</h2>
          <p className="text-gray-400 mb-6">
            You&apos;re all up to date! When you get new notifications about likes, comments, follows, or messages, they&apos;ll appear here in real-time.
          </p>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Likes and comments on your posts</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>New followers and follow requests</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>Messages and plan updates</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <Link href="/explore">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                Explore More Content
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "follow":
        return <Users className="h-5 w-5 text-green-500" />
      case "plan_join":
        return <Users className="h-5 w-5 text-purple-500" />
      case "plan_message":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "plan_update":
        return <Edit className="h-5 w-5 text-green-500" />
      case "plan_cancelled":
        return <X className="h-5 w-5 text-red-500" />
      case "plan_announcement":
        return <Megaphone className="h-5 w-5 text-orange-500" />
      case "message":
        return <MessageCircle className="h-5 w-5 text-orange-500" />
      case "follow_request_accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "follow_request":
        return <Users className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-400" />
    }
  }

  const getNotificationLink = (notification: (typeof notifications)[0]) => {
    switch (notification.type) {
      case "like":
      case "comment":
        return `/post/${notification.postId}`
      case "follow":
      case "follow_request_accepted":
      case "follow_request":
        return `/profile/${notification.fromUser.id}`
      case "plan_join":
      case "plan_message":
      case "plan_update":
      case "plan_cancelled":
      case "plan_announcement":
        return `/plan/${notification.planId}`
      case "message":
        return `/messages?chatWith=${notification.fromUser.id}`
      default:
        return "#"
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="glass-card p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{unreadCount} unread</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center p-4 rounded-lg transition-all duration-200 hover:bg-gray-800/50 ${
                notification.isRead ? "bg-gray-800/30" : "bg-gray-700/50 border border-orange-500/30 shadow-lg"
              }`}
            >
              <div className="mr-4 relative">
                {getNotificationIcon(notification.type)}
                {!notification.isRead && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex-1">
                <Link href={getNotificationLink(notification)} className="flex items-center space-x-2 group">
                  <Avatar className="h-8 w-8 border-2 border-orange-500 group-hover:scale-110 transition-transform">
                    <AvatarImage
                      src={notification.fromUser.avatar || "/placeholder.svg"}
                      alt={notification.fromUser.username}
                    />
                    <AvatarFallback>{notification.fromUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <p className="text-white text-sm">
                    <span className="font-semibold">{notification.fromUser.name || notification.fromUser.username}</span>{" "}
                    {notification.content ||
                      (notification.type === "like"
                        ? "liked your post."
                        : notification.type === "comment"
                          ? "commented on your post."
                          : notification.type === "follow"
                            ? "started following you."
                            : notification.type === "plan_join"
                              ? `joined your plan "${notification.planTitle}".`
                              : notification.type === "plan_message"
                                ? `sent a message in "${notification.planTitle}".`
                              : notification.type === "plan_update"
                                ? `updated the plan "${notification.planTitle}".`
                              : notification.type === "plan_cancelled"
                                ? `cancelled the plan "${notification.planTitle}".`
                              : notification.type === "plan_announcement"
                                ? `made an announcement in "${notification.planTitle}".`
                              : notification.type === "message"
                                ? "sent you a message."
                                : notification.type === "follow_request_accepted"
                                  ? "accepted your follow request."
                                  : notification.type === "follow_request"
                                    ? "sent you a follow request."
                                    : "has an update.")}
                  </p>
                </Link>
                <span className="text-xs text-gray-400 mt-1 block">
                  {toDate(notification.createdAt)?.toLocaleString()}
                </span>
              </div>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-orange-500 hover:bg-orange-500/20 transition-colors"
                >
                  Mark as Read
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
