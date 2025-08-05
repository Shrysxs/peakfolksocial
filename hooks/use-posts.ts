"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPosts as getPostsService,
  getUserPosts as getUserPostsService,
  createPost as createPostService,
  deletePost as deletePostService,
} from "@/lib/firebase-services"
import { toast } from "sonner"

// Hook to fetch all posts (for feed/explore)
export function usePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => getPostsService(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to fetch posts by a specific user
export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: async ({ pageParam }) => getUserPostsService(userId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to create a new post
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, caption, imageFile }: { userId: string; caption: string; imageFile: File }) =>
      createPostService(userId, caption, imageFile),
    onSuccess: () => {
      toast.success("Post created successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }) // Invalidate all posts
      queryClient.invalidateQueries({ queryKey: ["userPosts"] }) // Invalidate user's posts
      queryClient.invalidateQueries({ queryKey: ["user"] }) // Invalidate user profile to update post count
    },
  })
}

// Hook to delete a post
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, imageUrl }: { postId: string; imageUrl: string }) => deletePostService(postId, imageUrl),
    onSuccess: () => {
      toast.success("Post deleted successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["userPosts"] })
      queryClient.invalidateQueries({ queryKey: ["user"] }) // Invalidate user profile to update post count
    },
  })
}
