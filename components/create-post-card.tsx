"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCreatePost } from "@/hooks/use-posts"
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"

export function CreatePostCard() {
  const { dbUser } = useAuth()
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { mutate: createPost, isPending } = useCreatePost()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async () => {
    if (!dbUser) {
      toast.error("You must be logged in to create a post.")
      return
    }
    if (!caption.trim() && !imageFile) {
      toast.error("Please enter a caption or select an image.")
      return
    }
    if (!imageFile) {
      toast.error("Please select an image for your post.")
      return
    }

    createPost(
      { userId: dbUser.id, caption, imageFile },
      {
        onSuccess: () => {
          setCaption("")
          setImageFile(null)
          setImagePreview(null)
          toast.success("Post created successfully!")
        },
        onError: (error) => {
          toast.error(`Failed to create post: ${error.message}`)
        },
      },
    )
  }

  return (
    <Card className="glass-card p-4">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-orange-500">
            <AvatarImage src={dbUser?.avatar || "/placeholder.svg"} alt={dbUser?.username || "User"} />
            <AvatarFallback>{dbUser?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="What's on your mind, Peakfolk?"
            className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-400"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>
        {imagePreview && (
          <div className="relative w-full h-48 rounded-md overflow-hidden">
            <Image src={imagePreview || "/placeholder.svg"} alt="Post preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <label htmlFor="image-upload" className="cursor-pointer">
            <Button variant="ghost" className="text-orange-500 hover:text-orange-400">
              <ImageIcon className="mr-2 h-5 w-5" />
              Add Photo
            </Button>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isPending ? <LoadingSpinner className="text-white" /> : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
