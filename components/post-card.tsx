"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, Share2, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import useLikePost from "@/hooks/use-like-post" // Corrected import
import { useAddComment, useComments } from "@/hooks/use-comments" // Corrected imports
import { useDeletePost } from "@/hooks/use-posts" // Corrected import
import { toast } from "sonner"
import { SharePostDialog } from "./share-post-dialog"
import { Textarea } from "./ui/textarea"
import { toDate } from "@/lib/firebase-services"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LoadingSpinner } from "./loading-spinner"

interface PostCardProps {
  post: {
    id: string
    userId: string
    author?: {
      id: string
      username: string
      avatar?: string
      name?: string
    }
    caption: string
    imageUrl: string
    likes: string[] // Array of user IDs
    createdAt: unknown // Firestore Timestamp
  }
}

export function PostCard({ post }: PostCardProps) {
  const { dbUser } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [newCommentText, setNewCommentText] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const { comments, isLoading: isLoadingComments } = useComments(post.id)
  const { mutate: toggleLike, isPending: isTogglingLike } = useLikePost()
  const { mutate: addComment, isPending: isCommenting } = useAddComment()
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost()

  const likedByCurrentUser = dbUser ? post.likes.includes(dbUser.id) : false
  const isAuthor = dbUser?.id === post.userId

  const handleLike = () => {
    if (!dbUser) {
      toast.error("You must be logged in to like posts.")
      return
    }
    toggleLike(
      { postId: post.id, userId: dbUser.id },
      {
        onError: (error) => toast.error(`Failed to toggle like: ${error.message}`),
      },
    )
  }

  const handleAddComment = () => {
    if (!dbUser) {
      toast.error("You must be logged in to comment.")
      return
    }
    if (!newCommentText.trim()) {
      toast.error("Comment cannot be empty.")
      return
    }
    addComment(
      { postId: post.id, userId: dbUser.id, content: newCommentText },
      {
        onSuccess: () => {
          setNewCommentText("")
        },
        onError: (error) => toast.error(`Failed to add comment: ${error.message}`),
      },
    )
  }

  const handleDeletePost = () => {
    if (!dbUser || dbUser.id !== post.userId) {
      toast.error("You are not authorized to delete this post.")
      return
    }
    deletePost(
      { postId: post.id, imageUrl: post.imageUrl },
      {
        onSuccess: () => {
          toast.success("Post deleted successfully!")
        },
        onError: (error) => {
          toast.error(`Failed to delete post: ${error.message}`)
        },
      },
    )
  }

  const postDate = toDate(post.createdAt)

  return (
    <Card className="modern-card flex flex-col w-full max-w-2xl mx-auto overflow-hidden animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3 w-full px-4">
        <Link href={`/profile/${post.author?.id}`} className="flex items-center space-x-3 group min-w-0 hover-lift">
          <Avatar className="h-10 w-10 avatar-glow flex-shrink-0">
            <AvatarImage src={post.author?.avatar || "/placeholder.svg"} alt={post.author?.username || "User"} />
            <AvatarFallback className="bg-orange-500 text-black font-semibold">{post.author?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate text-base sm:text-lg glow-orange-text">
              {post.author?.name || post.author?.username || "Unknown User"}
            </span>
            <span className="text-xs text-gray-400 truncate">{postDate ? postDate.toLocaleString() : "N/A"}</span>
          </div>
        </Link>
        {isAuthor && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover-lift focus-glow">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="gradient-text">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  This action cannot be undone. This will permanently delete your post and remove its data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-white border-gray-700 hover:bg-gray-700/50 hover-lift">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700 text-white hover-lift">
                  {isDeletingPost ? <LoadingSpinner className="text-white" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="p-0 w-full">
        <div className="relative w-full aspect-square sm:aspect-[4/3] overflow-hidden">
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.caption || `Post by ${post.author?.name || post.author?.username || "Unknown User"}`}
            fill
            className="object-cover rounded-md w-full max-h-[60vw] sm:max-h-[400px]"
            sizes="100vw"
          />
        </div>
        <p className="text-white text-sm mt-4 px-4 break-words w-full">{post.caption}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-4 w-full px-4">
        <div className="flex items-center space-x-4 w-full pb-3 border-b border-gray-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isTogglingLike || !dbUser}
            className="text-gray-400 hover:text-red-500 hover-lift focus-glow"
          >
            <Heart className={likedByCurrentUser ? "fill-red-500 text-red-500 glow-orange-text" : "text-gray-400"} />
            <span className="ml-1 text-white">{post.likes.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-gray-400 hover:text-orange-500 hover-lift focus-glow"
          >
            <MessageCircle />
            <span className="ml-1 text-white">{comments?.length || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
            className="text-gray-400 hover:text-orange-500 hover-lift focus-glow"
          >
            <Share2 />
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 avatar-glow">
                <AvatarImage src={dbUser?.avatar || "/placeholder.svg"} alt={dbUser?.username || "User"} />
                <AvatarFallback className="bg-orange-500 text-black font-semibold text-xs">{dbUser?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="glass-input resize-none border-0 focus:ring-2 focus:ring-orange-500/50"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleAddComment}
                disabled={isCommenting || !newCommentText.trim()}
                className="btn-peakfolk-primary ml-2"
              >
                {isCommenting ? <LoadingSpinner className="text-black" /> : "Post"}
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2 animate-slide-up">
                    <Avatar className="h-6 w-6 avatar-glow">
                      <AvatarImage src={comment.author?.avatar || "/placeholder.svg"} alt={comment.author?.username || "User"} />
                      <AvatarFallback className="bg-orange-500 text-black font-semibold text-xs">{comment.author?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-800/50 rounded-lg p-3 glass-input">
                        <p className="text-sm font-medium text-white glow-orange-text">
                          {comment.author?.name || comment.author?.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {toDate(comment.createdAt)?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </CardFooter>
      <SharePostDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} postId={post.id} />
    </Card>
  )
}
