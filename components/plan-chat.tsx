"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Megaphone, 
  CheckCheck
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePlanChat } from "@/hooks/use-plan-chat"
import { LoadingSpinner } from "./loading-spinner"
import { toDate } from "@/lib/firebase-services"
import type { PlanMessage } from "@/types"
 

interface PlanChatProps {
  planId: string
  isOrganizer: boolean
}

export function PlanChat({ planId, isOrganizer }: PlanChatProps) {
  const { dbUser } = useAuth()
  const [message, setMessage] = useState("")
  const [isAnnouncement, setIsAnnouncement] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
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
  } = usePlanChat(planId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !dbUser) return

    if (isAnnouncement && isOrganizer) {
      sendAnnouncement(message.trim())
    } else {
      sendMessage({ content: message.trim(), type: "text" })
    }
    
    setMessage("")
    setIsAnnouncement(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date | unknown) => {
    const messageDate = toDate(date)
    if (!messageDate) return ""
    
    const now = new Date()
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  const isOwnMessage = (message: PlanMessage) => message.senderId === dbUser?.id

  if (isLoading) {
    return (
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle className="text-white">Plan Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle className="text-white">Plan Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-red-500">Failed to load chat messages.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Plan Chat</CardTitle>
          {isOrganizer && (
            <Button
              variant={isAnnouncement ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAnnouncement(!isAnnouncement)}
              className={`${
                isAnnouncement 
                  ? "bg-orange-600 text-white hover:bg-orange-700" 
                  : "border-gray-600 text-white hover:bg-gray-800"
              }`}
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Announcement
            </Button>
          )}
        </div>
        {isAnnouncement && (
          <Badge variant="secondary" className="bg-orange-600 text-white text-xs">
            Announcement mode - Only you can send messages
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  {isFetchingNextPage ? <LoadingSpinner size="sm" /> : "Load More Messages"}
                </Button>
              </div>
            )}

            {/* Messages */}
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No messages yet.</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage(msg) ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] ${isOwnMessage(msg) ? "flex-row-reverse" : "flex-row"}`}>
                    {!isOwnMessage(msg) && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={msg.sender.avatar} alt={msg.sender.username} />
                        <AvatarFallback>{msg.sender.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${isOwnMessage(msg) ? "items-end" : "items-start"}`}>
                      {!isOwnMessage(msg) && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {msg.sender.name || msg.sender.username}
                          </span>
                          {msg.type === "announcement" && (
                            <Badge variant="secondary" className="bg-orange-600 text-white text-xs">
                              Announcement
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`rounded-lg px-3 py-2 max-w-full break-words ${
                          msg.type === "announcement"
                            ? "bg-orange-600 text-white"
                            : isOwnMessage(msg)
                            ? "bg-orange-600 text-white"
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage(msg) ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isOwnMessage(msg) && (
                          <CheckCheck className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator className="bg-gray-700" />

        {/* Message Input */}
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isAnnouncement 
                  ? "Type your announcement..." 
                  : "Type a message..."
              }
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
              disabled={!dbUser || (isAnnouncement && !isOrganizer)}
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-orange-500"
              disabled={!dbUser}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-orange-500"
              disabled={!dbUser}
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending || isSendingAnnouncement || !dbUser}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isSending || isSendingAnnouncement ? (
                <LoadingSpinner className="text-white" size="sm" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {isAnnouncement && (
            <p className="text-xs text-orange-400 mt-2">
              Announcement mode: Only you can send messages to all participants
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 