"use client"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toDate } from "@/lib/firebase-services"

type StoryForViewer = {
  userId?: string
  imageUrl?: string
  createdAt?: unknown
  author?: { username?: string; name?: string; avatar?: string }
}

interface StoryViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stories: StoryForViewer[] // Array of stories for a single user
  initialStoryIndex?: number
}

export function StoryViewerDialog({ open, onOpenChange, stories, initialStoryIndex = 0 }: StoryViewerDialogProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex)

  useEffect(() => {
    if (open) {
      setCurrentStoryIndex(initialStoryIndex)
    }
  }, [open, initialStoryIndex])

  const handleNextStory = useCallback(() => {
    setCurrentStoryIndex((prevIndex) => (prevIndex + 1) % stories.length)
  }, [stories.length])

  const handlePrevStory = useCallback(() => {
    setCurrentStoryIndex((prevIndex) => (prevIndex - 1 + stories.length) % stories.length)
  }, [stories.length])

  useEffect(() => {
    if (!open || stories.length === 0) return

    const timer = setTimeout(handleNextStory, 5000) // Auto-advance every 5 seconds

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNextStory()
      } else if (event.key === "ArrowLeft") {
        handlePrevStory()
      } else if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, currentStoryIndex, stories.length, handleNextStory, handlePrevStory, onOpenChange])

  if (!open || stories.length === 0) return null

  const currentStory = stories[currentStoryIndex]
  const storyDate = toDate(currentStory.createdAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center justify-center p-0 max-w-md w-full h-[90vh] bg-black relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center space-x-3 z-10 bg-gradient-to-b from-black/70 to-transparent">
          <Avatar className="h-10 w-10 border-2 border-orange-500">
            <AvatarImage src={currentStory.author?.avatar || "/placeholder.svg"} alt={currentStory.author?.username} />
            <AvatarFallback>{currentStory.author?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-white">
              {currentStory.author?.name || currentStory.author?.username}
            </span>
            <span className="text-xs text-gray-300">{storyDate ? storyDate.toLocaleString() : "N/A"}</span>
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentStory.imageUrl || "/placeholder.svg"}
            alt="Story"
            fill
            className="object-contain"
            priority
          />
        </div>

        {stories.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={handlePrevStory}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={handleNextStory}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
