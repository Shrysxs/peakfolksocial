"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleLike } from "@/lib/firebase-services"
import { toast } from "sonner"
import type { Post } from "@/types"

export default function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) => toggleLike(postId, userId),
    onMutate: async ({ postId, userId }) => {
      // Optimistically update the cache for all posts and specific post
      await queryClient.cancelQueries({ queryKey: ["posts"] })
      await queryClient.cancelQueries({ queryKey: ["posts", postId] })
      await queryClient.cancelQueries({ queryKey: ["userPosts"] })

      const previousPosts = queryClient.getQueryData(["posts"])
      const previousUserPosts = queryClient.getQueryData(["userPosts"])
      const previousPost = queryClient.getQueryData(["posts", postId])

      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              const isLiked = post.likes.includes(userId)
              return post.id === postId
                ? { ...post, likes: isLiked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId] }
                : post
            }),
          })),
        }
      })

      queryClient.setQueryData(["userPosts"], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              const isLiked = post.likes.includes(userId)
              return post.id === postId
                ? { ...post, likes: isLiked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId] }
                : post
            }),
          })),
        }
      })

      queryClient.setQueryData(["posts", postId], (oldPost: Post | undefined) => {
        if (!oldPost) return oldPost
        const isLiked = oldPost.likes.includes(userId)
        return { ...oldPost, likes: isLiked ? oldPost.likes.filter((id) => id !== userId) : [...oldPost.likes, userId] }
      })

      return { previousPosts, previousUserPosts, previousPost }
    },
    onError: (err, { postId }, context) => {
      toast.error(`Failed to toggle like: ${err.message}`)
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts)
      }
      if (context?.previousUserPosts) {
        queryClient.setQueryData(["userPosts"], context.previousUserPosts)
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["posts", postId], context.previousPost)
      }
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["posts", postId] })
      queryClient.invalidateQueries({ queryKey: ["userPosts"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] }) // Invalidate notifications to show new like notification
    },
  })
}
