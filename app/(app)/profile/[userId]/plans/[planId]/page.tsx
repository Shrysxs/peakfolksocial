"use client"

import React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { usePlan, usePlanPosts } from "@/hooks/use-plans"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Utility function to safely convert Firestore timestamps to Date objects
const toSafeDate = (timestamp: any): Date => {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate()
  return new Date(timestamp)
}

export default function AdventureDiaryPage() {
  const { userId, planId } = useParams<{ userId: string; planId: string }>()
  const router = useRouter()

  const { data: plan, isLoading: isLoadingPlan, isError: isErrorPlan } = usePlan(planId)
  const {
    data: planPostsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = usePlanPosts(planId)
  const planPosts = planPostsData?.pages.flatMap((page) => page.posts) || []

  return (
    <div className="min-h-screen bg-black/90 flex flex-col items-center py-8 px-2 md:px-0">
      <div className="w-full max-w-2xl glass-card rounded-xl shadow-lg p-6 mb-6 relative">
        <Button
          variant="outline"
          className="absolute left-4 top-4 border-orange-500 text-orange-400 hover:bg-orange-900/20"
          onClick={() => router.push(`/profile/${userId}?tab=plans`)}
        >
          ← Back to Plans
        </Button>
        {isLoadingPlan ? (
          <div className="flex justify-center items-center h-32"><LoadingSpinner /></div>
        ) : isErrorPlan || !plan ? (
          <div className="text-red-500 text-center">Failed to load plan details.</div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Image
              src={plan.imageUrl || "/placeholder.jpg"}
              alt={plan.title}
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg border-4 border-orange-500 shadow-md bg-black/40"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-orange-400 mb-1 drop-shadow-glow-orange">{plan.title}</h1>
              <div className="text-gray-300 mb-2">
                <span className="mr-4">{plan.dateTime ? toSafeDate(plan.dateTime).toLocaleString() : "No date"}</span>
                <span className="ml-2">Participants: {plan.currentParticipants || plan.participantIds?.length || 1}</span>
              </div>
              <div className="text-gray-400 text-sm">Organized by {plan.organizer?.name}</div>
            </div>
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl glass-card rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-orange-400 mb-4 drop-shadow-glow-orange">Adventure Diary</h2>
        <ScrollArea className="h-[60vh] pr-2">
          {isLoadingPosts ? (
            <div className="flex justify-center items-center h-32"><LoadingSpinner /></div>
          ) : isErrorPosts ? (
            <div className="text-red-500 text-center">Failed to load posts for this plan.</div>
          ) : planPosts.length === 0 ? (
            <div className="text-gray-400 text-center">No posts in this adventure yet.</div>
          ) : (
            <div className="flex flex-col gap-8">
              {planPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative bg-black/60 border border-orange-900 rounded-lg p-4 shadow-glow-orange hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10 border-2 border-orange-500">
                      <Image src={post.author?.avatar || "/placeholder-user.jpg"} alt={post.author?.name || "User"} width={40} height={40} />
                    </Avatar>
                    <div>
                      <div className="font-semibold text-orange-300">{post.author?.name}</div>
                      <div className="text-xs text-gray-400">{post.createdAt ? toSafeDate(post.createdAt).toLocaleString() : ""}</div>
                    </div>
                  </div>
                  <div className="mb-2 text-lg text-white font-medium whitespace-pre-line">{post.caption}</div>
                  {post.imageUrl && (
                    <Image
                      src={post.imageUrl}
                      alt="Post media"
                      width={500}
                      height={300}
                      className="mt-2 rounded-md border border-orange-800 max-h-64 object-cover shadow"
                    />
                  )}
                </div>
              ))}
              {hasNextPage && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? <LoadingSpinner /> : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
} 