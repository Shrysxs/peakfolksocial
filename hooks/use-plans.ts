"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getPlans as getPlansService,
  getJoinedPlans as getJoinedPlansService,
  joinPlan as joinPlanService,
  leavePlan as leavePlanService,
  getPlan as getPlanService,
  getCreatedPlans as getCreatedPlansService,
  getPlanPosts as getPlanPostsService,
} from "@/lib/firebase-services"
import { toast } from "sonner"
import type { Plan } from "@/types"

interface PlansFilter {
  location?: string
  category?: string
}

// Hook to fetch all plans (for explore)
export function usePlans(filters?: PlansFilter) {
  return useInfiniteQuery({
    queryKey: ["plans", filters?.location, filters?.category],
    queryFn: async ({ pageParam }) => getPlansService(10, filters, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to fetch plans a user has joined
export function useJoinedPlans(userId: string) {
  return useInfiniteQuery({
    queryKey: ["joinedPlans", userId],
    queryFn: async ({ pageParam }) => getJoinedPlansService(userId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to fetch a single plan by ID
export function usePlan(planId: string) {
  return useQuery<Plan | null, Error>({
    queryKey: ["plans", planId],
    queryFn: () => getPlanService(planId),
    enabled: !!planId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to join a plan
export function useJoinPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, userId }: { planId: string; userId: string }) => joinPlanService(planId),
    onMutate: async ({ planId, userId }) => {
      // Optimistically update the plan's participant list and count
      await queryClient.cancelQueries({ queryKey: ["plans", planId] })
      await queryClient.cancelQueries({ queryKey: ["joinedPlans", userId] })

      const previousPlan = queryClient.getQueryData(["plans", planId])
      const previousJoinedPlans = queryClient.getQueryData(["joinedPlans", userId])

      queryClient.setQueryData(["plans", planId], (oldPlan: Plan | undefined) => {
        if (!oldPlan) return oldPlan
        return {
          ...oldPlan,
          participantIds: [...oldPlan.participantIds, userId],
          currentParticipants: (oldPlan.currentParticipants || 0) + 1,
        }
      })

      // Optimistically add to joinedPlans infinite query
      queryClient.setQueryData(["joinedPlans", userId], (oldData: any) => {
        if (!oldData) return oldData
        const planToJoin = queryClient.getQueryData(["plans", planId]) as Plan | undefined
        if (!planToJoin) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => {
            // Add to the first page or a relevant page if structure allows
            if (index === 0) {
              return {
                ...page,
                plans: [planToJoin, ...page.plans.filter((p: Plan) => p.id !== planToJoin.id)],
              }
            }
            return page
          }),
        }
      })

      return { previousPlan, previousJoinedPlans }
    },
    onSuccess: () => {
      toast.success("Successfully joined the plan!")
    },
    onError: (error, { planId, userId }, context) => {
      toast.error(`Failed to join plan: ${error.message}`)
      // Rollback on error
      if (context?.previousPlan) {
        queryClient.setQueryData(["plans", planId], context.previousPlan)
      }
      if (context?.previousJoinedPlans) {
        queryClient.setQueryData(["joinedPlans", userId], context.previousJoinedPlans)
      }
    },
    onSettled: (_, __, { planId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["plans", planId] })
      queryClient.invalidateQueries({ queryKey: ["joinedPlans", userId] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] }) // For new plan join notification
    },
  })
}

// Hook to leave a plan
export function useLeavePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, userId }: { planId: string; userId: string }) => leavePlanService(planId, userId),
    onMutate: async ({ planId, userId }) => {
      // Optimistically update the plan's participant list and count
      await queryClient.cancelQueries({ queryKey: ["plans", planId] })
      await queryClient.cancelQueries({ queryKey: ["joinedPlans", userId] })

      const previousPlan = queryClient.getQueryData(["plans", planId])
      const previousJoinedPlans = queryClient.getQueryData(["joinedPlans", userId])

      queryClient.setQueryData(["plans", planId], (oldPlan: Plan | undefined) => {
        if (!oldPlan) return oldPlan
        return {
          ...oldPlan,
          participantIds: oldPlan.participantIds.filter((id) => id !== userId),
          currentParticipants: Math.max(0, (oldPlan.currentParticipants || 0) - 1),
        }
      })

      // Optimistically remove from joinedPlans infinite query
      queryClient.setQueryData(["joinedPlans", userId], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            plans: page.plans.filter((p: Plan) => p.id !== planId),
          })),
        }
      })

      return { previousPlan, previousJoinedPlans }
    },
    onSuccess: () => {
      toast.success("Successfully left the plan.")
    },
    onError: (error, { planId, userId }, context) => {
      toast.error(`Failed to leave plan: ${error.message}`)
      // Rollback on error
      if (context?.previousPlan) {
        queryClient.setQueryData(["plans", planId], context.previousPlan)
      }
      if (context?.previousJoinedPlans) {
        queryClient.setQueryData(["joinedPlans", userId], context.previousJoinedPlans)
      }
    },
    onSettled: (_, __, { planId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["plans", planId] })
      queryClient.invalidateQueries({ queryKey: ["joinedPlans", userId] })
    },
  })
}

// Hook to fetch plans a user has created
export function useCreatedPlans(userId: string) {
  return useInfiniteQuery({
    queryKey: ["createdPlans", userId],
    queryFn: async ({ pageParam }) => getCreatedPlansService(userId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to fetch posts for a plan (Adventure Diary)
export function usePlanPosts(planId: string) {
  return useInfiniteQuery({
    queryKey: ["planPosts", planId],
    queryFn: async ({ pageParam }) => getPlanPostsService(planId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    enabled: !!planId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}
