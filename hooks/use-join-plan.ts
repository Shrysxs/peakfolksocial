import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { joinPlan } from "@/lib/firebase-services"
import type { Plan } from "@/types"

export function useJoinPlan() {
  const queryClient = useQueryClient()

  const { mutate: join, isPending: isJoining } = useMutation({
    mutationFn: async (planId: string) => joinPlan(planId),
    onMutate: async (planId: string) => {
      // Optimistically mark as joined pending in relevant caches
      await queryClient.cancelQueries()
      const planKey = ["plan", planId]
      const previousPlan = queryClient.getQueryData<Plan>(planKey)
      if (previousPlan) {
        queryClient.setQueryData(planKey, {
          ...previousPlan,
          currentParticipants: (previousPlan.currentParticipants || 0) + 1,
        })
      }
      return { previousPlan, planKey }
    },
    onError: (err: any, planId: string, ctx) => {
      // Revert optimistic change
      if (ctx?.previousPlan) queryClient.setQueryData(ctx.planKey, ctx.previousPlan)
      toast.error(err?.message || "Failed to join plan")
    },
    onSuccess: (data, planId) => {
      const planKey = ["plan", planId]
      queryClient.setQueryData<Plan | undefined>(planKey, (old: Plan | undefined) => {
        if (!old) return old
        const next = { ...old }
        if (data.joined) {
          next.isJoined = true
        }
        return next
      })
      if (data.pending) {
        toast.success("Join request sent to organizer")
      } else if (data.joined) {
        toast.success("Joined the plan")
      } else {
        toast.message("No changes made")
      }
    },
    onSettled: (_res, _err, planId) => {
      // Invalidate plan and relevant lists
      queryClient.invalidateQueries({ queryKey: ["plan", planId] })
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["joinedPlans"] })
    },
  })

  return { join, isJoining }
}
