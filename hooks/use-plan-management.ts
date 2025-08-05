"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePlan, cancelPlan, deletePlan } from "@/lib/firebase-services"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function usePlanManagement() {
  const queryClient = useQueryClient()
  const { dbUser } = useAuth()
  const router = useRouter()

  // Update plan mutation
  const { mutate: updatePlanMutation, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      planId,
      updates,
    }: {
      planId: string
      updates: {
        title?: string
        description?: string
        location?: string
        dateTime?: Date
        maxParticipants?: number
        costPerHead?: number
        currency?: string
        tags?: string[]
        requirements?: string[]
        whatToBring?: string[]
        imageUrl?: string
      }
    }) => {
      if (!dbUser) throw new Error("You must be logged in to update plans.")
      return updatePlan(planId, dbUser.id, updates)
    },
    onSuccess: () => {
      toast.success("Plan updated successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["joinedPlans"] })
    },
  })

  // Cancel plan mutation
  const { mutate: cancelPlanMutation, isPending: isCancelling } = useMutation({
    mutationFn: async ({ planId, reason }: { planId: string; reason?: string }) => {
      if (!dbUser) throw new Error("You must be logged in to cancel plans.")
      return cancelPlan(planId, dbUser.id, reason)
    },
    onSuccess: () => {
      toast.success("Plan cancelled successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to cancel plan: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["joinedPlans"] })
    },
  })

  // Delete plan mutation
  const { mutate: deletePlanMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (planId: string) => {
      if (!dbUser) throw new Error("You must be logged in to delete plans.")
      return deletePlan(planId, dbUser.id)
    },
    onSuccess: () => {
      toast.success("Plan deleted successfully!")
      router.push("/feed") // Redirect to feed after deletion
    },
    onError: (error) => {
      toast.error(`Failed to delete plan: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["joinedPlans"] })
    },
  })

  return {
    updatePlan: updatePlanMutation,
    cancelPlan: cancelPlanMutation,
    deletePlan: deletePlanMutation,
    isUpdating,
    isCancelling,
    isDeleting,
  }
} 