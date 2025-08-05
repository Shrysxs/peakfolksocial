"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getUserProfile,
  checkUsernameExists as checkUsernameExistsService,
  updateUserProfile as updateUserProfileService,
  getUsers as getUsersService,
  getFollowRequests as getFollowRequestsService,
  handleFollowRequest as handleFollowRequestService,
} from "@/lib/firebase-services"
import { toast } from "sonner"
import type { User } from "@/types"
import { useUserPosts as _useUserPosts } from "./use-posts"

// Hook to fetch a single user profile
export function useUser(userId: string) {
  return useQuery<User | null, Error>({
    queryKey: ["user", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to check if a username exists
export function useCheckUsernameExists() {
  return useMutation({
    mutationFn: (username: string) => checkUsernameExistsService(username),
  })
}

// Hook to update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
      profileImageFile,
    }: {
      userId: string
      data: Partial<User>
      profileImageFile?: File
    }) => updateUserProfileService(userId, data, profileImageFile),
    onSuccess: () => {
      toast.success("Profile updated successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`)
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["posts"] }) // To update author info on posts
      queryClient.invalidateQueries({ queryKey: ["plans"] }) // To update organizer info on plans
      queryClient.invalidateQueries({ queryKey: ["comments"] }) // To update author info on comments
    },
  })
}

// Hook to fetch users with infinite scrolling and search
export function useUsers(searchQuery?: string) {
  return useInfiniteQuery({
    queryKey: ["users", searchQuery],
    queryFn: async ({ pageParam }) => getUsersService(searchQuery, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get follow requests for a user
export function useFollowRequests(userId: string) {
  return useQuery<User[], Error>({
    queryKey: ["followRequests", userId],
    queryFn: () => getFollowRequestsService(userId),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to handle follow requests (accept/reject)
export function useHandleFollowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requesterId,
      targetUserId,
      accept,
    }: { requesterId: string; targetUserId: string; accept: boolean }) =>
      handleFollowRequestService(requesterId, targetUserId, accept),
    onSuccess: (_, { accept }) => {
      toast.success(`Follow request ${accept ? "accepted" : "rejected"}!`)
    },
    onError: (error) => {
      toast.error(`Failed to handle request: ${error.message}`)
    },
    onSettled: (_, __, { requesterId, targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ["followRequests", targetUserId] })
      queryClient.invalidateQueries({ queryKey: ["user", requesterId] })
      queryClient.invalidateQueries({ queryKey: ["user", targetUserId] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] }) // For follow request accepted notification
    },
  })
}

export { _useUserPosts as useUserPosts }

// Alias for backward compatibility
export const useUpdateUser = useUpdateUserProfile
