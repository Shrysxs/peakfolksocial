"use client"

import * as React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCreateStory } from "@/hooks/use-stories" // Import the new hook
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"

interface CreateStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
  const { dbUser } = useAuth()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { mutate: createStory, isPending: isCreatingStory } = useCreateStory() // Use the new hook

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!dbUser) {
      toast.error("You must be logged in to create a story.")
      return
    }

    if (!imageFile) {
      toast.error("Please select an image for your story.")
      return
    }

    createStory(
      { userId: dbUser.id, imageFile },
      {
        onSuccess: () => {
          setImageFile(null)
          setImagePreview(null)
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Create New Story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="storyImage" className="text-white">
              Story Image
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="storyImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 bg-gray-800 border-gray-700 text-white file:text-orange-500 file:bg-gray-700 file:border-none file:rounded-md file:px-3 file:py-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById("storyImage")?.click()}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="sr-only">Upload Image</span>
              </Button>
            </div>
            {imagePreview && (
              <div className="mt-2 relative w-full h-64 rounded-md overflow-hidden">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Story Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isCreatingStory}
          >
            {isCreatingStory ? <LoadingSpinner className="text-white" /> : "Create Story"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
