"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useActiveStories } from "@/hooks/use-stories" // Import the new hook
import { LoadingSpinner } from "./loading-spinner"
import { useState } from "react"
import { StoryViewerDialog } from "./story-viewer-dialog"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CreateStoryDialog } from "./create-story-dialog"

type StoryForViewer = {
  userId?: string
  imageUrl?: string
  createdAt?: unknown
  author?: { username?: string; name?: string; avatar?: string }
}

export function StoryBar() {
  const { dbUser } = useAuth()
  const { stories, isLoading, isError } = useActiveStories() // Use the new hook
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false)
  const [currentStories, setCurrentStories] = useState<StoryForViewer[]>([])
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isCreateStoryDialogOpen, setIsCreateStoryDialogOpen] = useState(false)

  const handleStoryClick = (userStories: StoryForViewer[], initialIndex = 0) => {
    setCurrentStories(userStories)
    setCurrentStoryIndex(initialIndex)
    setIsStoryViewerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24 glass-card rounded-lg shadow-md">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return <div className="text-red-500 text-center glass-card p-4 rounded-lg shadow-md">Error loading stories.</div>
  }

  return (
    <div className="glass-card p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Stories</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 p-2">
          {dbUser && (
            <div
              className="flex flex-col items-center space-y-1 cursor-pointer"
              onClick={() => setIsCreateStoryDialogOpen(true)}
            >
              <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                <PlusCircle className="h-8 w-8 text-gray-400" />
              </div>
              <span className="text-xs text-gray-400">Add Story</span>
            </div>
          )}
          {stories.length === 0 && !dbUser && <p className="text-gray-400 text-center w-full">No stories available.</p>}
          {stories.map((userStories) => (
            <div
              key={userStories[0].userId}
              className="flex flex-col items-center space-y-1 cursor-pointer"
              onClick={() => handleStoryClick(userStories)}
            >
              <Avatar className="h-16 w-16 border-2 border-orange-500">
                <AvatarImage
                  src={userStories[0].author?.avatar || "/placeholder.svg"}
                  alt={userStories[0].author?.username}
                />
                <AvatarFallback>{userStories[0].author?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-white">{userStories[0].author?.username}</span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <StoryViewerDialog
        open={isStoryViewerOpen}
        onOpenChange={setIsStoryViewerOpen}
        stories={currentStories}
        initialStoryIndex={currentStoryIndex}
      />
      <CreateStoryDialog open={isCreateStoryDialogOpen} onOpenChange={setIsCreateStoryDialogOpen} />
    </div>
  )
}
