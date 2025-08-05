"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPlan as createPlanService } from "@/lib/firebase-services"
import { toast } from "sonner"

export default function useCreatePlan() {
  const queryClient = useQueryClient()

  const { mutate: createPlan, isPending: isCreatingPlan } = useMutation({
    mutationFn: async ({
      userId,
      planData,
      imageFile,
    }: {
      userId: string
      planData: {
        title: string
        description: string
        imageUrl?: string
        location: string
        dateTime: Date
        maxParticipants?: number
        costPerHead: number
        currency: string
      }
      imageFile?: File
    }) => createPlanService(userId, planData, imageFile),
    onSuccess: () => {
      toast.success("Plan created successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] }) // Invalidate all plans
      queryClient.invalidateQueries({ queryKey: ["joinedPlans"] }) // Invalidate user's joined plans
    },
  })

  return {
    createPlan,
    isCreatingPlan,
  }
}
