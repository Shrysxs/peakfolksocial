"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUserProfile as updateUserProfileService } from "@/lib/firebase-services"
import { toast } from "sonner"
import type { User } from "@/types"

export default function useUpdateProfile() {
  const queryClient = useQueryClient()

  const {
    mutate: updateProfile,
    isPending: isUpdating,
    error,
  } = useMutation({
    mutationFn: async ({
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
    onError: (err) => {
      toast.error(`Failed to update profile: ${err.message}`)
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] }) // Invalidate specific user profile
      queryClient.invalidateQueries({ queryKey: ["users"] }) // Invalidate general user list
      queryClient.invalidateQueries({ queryKey: ["posts"] }) // Invalidate posts to update author info
      queryClient.invalidateQueries({ queryKey: ["plans"] }) // Invalidate plans to update organizer info
      queryClient.invalidateQueries({ queryKey: ["comments"] }) // Invalidate comments to update author info
    },
  })

  return {
    updateProfile,
    loading: isUpdating,
    error,
  }
}
