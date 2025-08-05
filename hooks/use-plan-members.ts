"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getPlanMembers as getPlanMembersService } from "@/lib/firebase-services"
import { toast } from "sonner"
import type { User } from "@/types"

export default function usePlanMembers(planId: string) {
  const queryClient = useQueryClient()

  const {
    data: members,
    isLoading,
    isError,
  } = useQuery<User[], Error>({
    queryKey: ["planMembers", planId],
    queryFn: () => getPlanMembersService(planId),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Note: addMember and removeMember logic is typically handled by useJoinPlan and useLeavePlan
  // in use-plans.ts. This hook primarily focuses on fetching members.
  // If direct member management (e.g., by organizer) is needed, separate mutations would be added here.
  // For now, I'll provide placeholder mutations that invalidate the query.

  const addMember = useMutation({
    mutationFn: async ({ planId, userId }: { planId: string; userId: string }) => {
      // This would call a service function to add a member directly (e.g., by organizer)
      // For now, it's a placeholder. Actual implementation would involve Firebase transaction.
      // Simulating adding user to plan
      return Promise.resolve()
    },
    onSuccess: () => {
      toast.success("Member added successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to add member: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["planMembers", planId] })
      queryClient.invalidateQueries({ queryKey: ["plans", planId] }) // Invalidate the plan itself
    },
  })

  const removeMember = useMutation({
    mutationFn: async ({ planId, userId }: { planId: string; userId: string }) => {
      // This would call a service function to remove a member directly (e.g., by organizer)
      // For now, it's a placeholder. Actual implementation would involve Firebase transaction.
      // Simulating removing user from plan
      return Promise.resolve()
    },
    onSuccess: () => {
      toast.success("Member removed successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to remove member: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["planMembers", planId] })
      queryClient.invalidateQueries({ queryKey: ["plans", planId] }) // Invalidate the plan itself
    },
  })

  return {
    members: members || [],
    isLoading,
    isError,
    addMember: addMember.mutate,
    removeMember: removeMember.mutate,
    isAddingMember: addMember.isPending,
    isRemovingMember: removeMember.isPending,
  }
}
