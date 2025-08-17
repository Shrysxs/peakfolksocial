"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toggleFollowUser, getFollowStatus, getFollowerCount } from "@/lib/firebase-services"
import { toast } from "sonner"
import type { User } from "@/types"

export default function useFollowUser(currentUserId: string | undefined, targetUserId: string) {
  const queryClient = useQueryClient()

  // Query for initial follow status
  const { data: isFollowing, isLoading: isLoadingFollowStatus } = useQuery<boolean, Error>({
    queryKey: ["followStatus", currentUserId, targetUserId],
    queryFn: () => getFollowStatus(currentUserId!, targetUserId),
    enabled: !!currentUserId && !!targetUserId,
    staleTime: 1000 * 60, // 1 minute
  })

  // Query for follower count of the target user
  const { data: followerCount, isLoading: isLoadingFollowerCount } = useQuery<number, Error>({
    queryKey: ["followerCount", targetUserId],
    queryFn: () => getFollowerCount(targetUserId),
    enabled: !!targetUserId,
    staleTime: 1000 * 60, // 1 minute
  })

  const { mutate: toggleFollow, isPending: isTogglingFollow } = useMutation({
    mutationFn: ({ followerId, followingId }: { followerId: string; followingId: string }) =>
      toggleFollowUser(followerId, followingId),
    onMutate: async ({ followerId, followingId }) => {
      // Cancel any outgoing refetches for follow status and counts
      await queryClient.cancelQueries({ queryKey: ["followStatus", followerId, followingId] })
      await queryClient.cancelQueries({ queryKey: ["followerCount", followingId] })
      await queryClient.cancelQueries({ queryKey: ["user", followerId] })
      await queryClient.cancelQueries({ queryKey: ["user", followingId] })
      await queryClient.cancelQueries({ queryKey: ["users"] })

      // Snapshot the previous values
      const previousIsFollowing = queryClient.getQueryData(["followStatus", followerId, followingId])
      const previousFollowerCount = queryClient.getQueryData(["followerCount", followingId])
      const previousFollowerUser = queryClient.getQueryData(["user", followerId])
      const previousFollowingUser = queryClient.getQueryData(["user", followingId])

      // Optimistically update follow status
      const newIsFollowing = !previousIsFollowing
      queryClient.setQueryData(["followStatus", followerId, followingId], newIsFollowing)

      // Optimistically update follower count
      queryClient.setQueryData(["followerCount", followingId], (old: number | undefined) =>
        newIsFollowing ? (old || 0) + 1 : Math.max(0, (old || 0) - 1),
      )

      // Optimistically update user profiles (followers/following counts) with no duplicates
      queryClient.setQueryData(["user", followerId], (oldUser: User | undefined) => {
        if (!oldUser) return oldUser
        const nextFollowingIds = newIsFollowing
          ? Array.from(new Set([...(oldUser.followingIds || []), followingId]))
          : (oldUser.followingIds || []).filter((id) => id !== followingId)
        return {
          ...oldUser,
          following: newIsFollowing ? (oldUser.following || 0) + 1 : Math.max(0, (oldUser.following || 0) - 1),
          followingIds: nextFollowingIds,
        }
      })

      queryClient.setQueryData(["user", followingId], (oldUser: User | undefined) => {
        if (!oldUser) return oldUser
        const nextFollowerIds = newIsFollowing
          ? Array.from(new Set([...(oldUser.followerIds || []), followerId]))
          : (oldUser.followerIds || []).filter((id) => id !== followerId)
        return {
          ...oldUser,
          followers: newIsFollowing ? (oldUser.followers || 0) + 1 : Math.max(0, (oldUser.followers || 0) - 1),
          followerIds: nextFollowerIds,
        }
      })

      return {
        previousIsFollowing,
        previousFollowerCount,
        previousFollowerUser,
        previousFollowingUser,
      }
    },
    onError: (err, { followerId, followingId }, context) => {
      toast.error(`Failed to toggle follow: ${err.message}`)
      // Rollback to previous values on error
      if (context?.previousIsFollowing !== undefined) {
        queryClient.setQueryData(["followStatus", followerId, followingId], context.previousIsFollowing)
      }
      if (context?.previousFollowerCount !== undefined) {
        queryClient.setQueryData(["followerCount", followingId], context.previousFollowerCount)
      }
      if (context?.previousFollowerUser) {
        queryClient.setQueryData(["user", followerId], context.previousFollowerUser)
      }
      if (context?.previousFollowingUser) {
        queryClient.setQueryData(["user", followingId], context.previousFollowingUser)
      }
    },
    onSuccess: (data, { followerId, followingId }) => {
      // Reconcile optimistic cache with server truth
      const finalIsFollowing = !!data?.following
      queryClient.setQueryData(["followStatus", followerId, followingId], finalIsFollowing)
    },
    onSettled: (_, __, { followerId, followingId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["followStatus", followerId, followingId] })
      queryClient.invalidateQueries({ queryKey: ["followerCount", followingId] })
      queryClient.invalidateQueries({ queryKey: ["user", followerId] })
      queryClient.invalidateQueries({ queryKey: ["user", followingId] })
      queryClient.invalidateQueries({ queryKey: ["users"] }) // For suggested users list etc.
      queryClient.invalidateQueries({ queryKey: ["notifications"] }) // For new follow notifications
    },
  })

  return {
    isFollowing: isFollowing || false,
    followerCount: followerCount || 0,
    toggleFollow,
    isLoading: isLoadingFollowStatus || isLoadingFollowerCount || isTogglingFollow,
  }
}
