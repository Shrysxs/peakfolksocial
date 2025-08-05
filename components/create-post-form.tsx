"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useCreatePost } from "@/hooks/use-posts" // Import the new hook
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"

interface CreatePostFormProps {
  onPostCreated?: () => void
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { dbUser } = useAuth()
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost() // Use the new hook

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
      toast.error("You must be logged in to create a post.")
      return
    }

    if (!caption.trim() && !imageFile) {
      toast.error("Post cannot be empty. Please add a caption or an image.")
      return
    }

    if (imageFile) {
      createPost(
        { userId: dbUser.id, caption, imageFile },
        {
          onSuccess: () => {
            setCaption("")
            setImageFile(null)
            setImagePreview(null)
            onPostCreated?.()
          },
        },
      )
    } else {
      toast.error("Please select an image for your post.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="caption" className="text-white">
          Caption
        </Label>
        <Textarea
          id="caption"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image" className="text-white">
          Image
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1 bg-gray-800 border-gray-700 text-white file:text-orange-500 file:bg-gray-700 file:border-none file:rounded-md file:px-3 file:py-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("image")?.click()}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="sr-only">Upload Image</span>
          </Button>
        </div>
        {imagePreview && (
          <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden">
            <Image src={imagePreview || "/placeholder.svg"} alt="Image Preview" className="object-cover" fill sizes="100vw" />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isCreatingPost}>
        {isCreatingPost ? <LoadingSpinner className="text-white" /> : "Create Post"}
      </Button>
    </form>
  )
}
