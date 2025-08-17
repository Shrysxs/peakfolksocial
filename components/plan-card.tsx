"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, DollarSign, Bookmark, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useJoinPlan, useLeavePlan, usePlan } from "@/hooks/use-plans" // Ensure usePlan is imported
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"
import { toDate } from "@/lib/firebase-services"

interface PlanCardProps {
  plan: {
    id: string
    userId: string
    organizer?: {
      id: string
      username: string
      avatar?: string
      name?: string
    }
    title: string
    description: string
    imageUrl: string
    location: string
    dateTime: unknown // Firestore Timestamp
    costPerHead: number
    currency: string
    participantIds: string[] // Array of user IDs
    currentParticipants: number
    maxParticipants?: number
  }
}

export function PlanCard({ plan }: PlanCardProps) {
  const { dbUser } = useAuth()
  // Fetch the latest plan data to ensure participant list is up-to-date
  const { data: latestPlanData } = usePlan(plan.id)
  const { mutate: joinPlan, isPending: isJoining } = useJoinPlan()
  const { mutate: leavePlan, isPending: isLeaving } = useLeavePlan()

  // Always fall back to an empty array so `.length` and `.includes` never error
  const currentParticipants = latestPlanData?.participantIds ?? plan.participantIds ?? []
  const isJoinedByCurrentUser = dbUser ? currentParticipants.includes(dbUser.id) : false
  const isOrganizer = dbUser?.id === plan.userId
  const isFull = latestPlanData?.maxParticipants && currentParticipants.length >= latestPlanData.maxParticipants

  const handleJoinToggle = () => {
    if (!dbUser) {
      toast.error("You must be logged in to join or leave plans.")
      return
    }
    if (isOrganizer) {
      toast.info("You are the organizer of this plan.")
      return
    }

    if (isJoinedByCurrentUser) {
      leavePlan(
        { planId: plan.id, userId: dbUser.id },
        {
          onError: (error) => toast.error(`Failed to leave plan: ${error.message}`),
        },
      )
    } else {
      if (isFull) {
        toast.error("This plan is full.")
        return
      }
      joinPlan(
        { planId: plan.id, userId: dbUser.id },
        {
          onError: (error) => toast.error(`Failed to join plan: ${error.message}`),
        },
      )
    }
  }

  const planDateTime = toDate(plan.dateTime)

  return (
    <Card className="glass-card flex flex-col w-full max-w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 w-full max-w-full px-2 sm:px-4">
        <Link href={`/profile/${plan.organizer?.id}`} className="flex items-center space-x-3 group min-w-0">
          <Avatar className="h-10 w-10 border-2 border-orange-500 flex-shrink-0">
            <AvatarImage src={plan.organizer?.avatar || "/placeholder.svg"} alt={plan.organizer?.username || "User"} />
            <AvatarFallback>{plan.organizer?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate text-base sm:text-lg">
              {plan.organizer?.name || plan.organizer?.username || "Unknown User"}
            </span>
            <span className="text-xs text-gray-400 truncate">Organizer</span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
          <Bookmark className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 w-full max-w-full">
        <Link href={`/plan/${plan.id}`}>
          {plan.imageUrl && (
            <div className="relative w-full max-w-full aspect-[16/9] overflow-hidden">
              <Image
                src={plan.imageUrl || "/placeholder.svg"}
                alt={plan.title}
                fill
                className="object-cover rounded-md w-full max-w-full max-h-[40vw] sm:max-h-[300px]"
                sizes="100vw"
              />
            </div>
          )}
          <div className="p-2 sm:p-4">
            <h3 className="text-base sm:text-xl font-bold text-white mb-2 hover:text-orange-400 transition-colors truncate">{plan.title}</h3>
            <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 break-words">{plan.description}</p>
            <div className="grid grid-cols-2 gap-2 text-gray-400 text-xs sm:text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                <span>{plan.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                <span>{planDateTime ? planDateTime.toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-orange-500" />
                <span>
                  {currentParticipants.length}
                  {plan.maxParticipants ? `/${plan.maxParticipants}` : ""} Participants
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                <span>
                  {plan.costPerHead} {plan.currency} / head
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-700 w-full max-w-full px-2 sm:px-4">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500" disabled={!dbUser}>
          <MessageCircle className="h-5 w-5" />
          <span className="ml-2">Chat</span>
        </Button>
        {isOrganizer ? (
          <Button disabled className="bg-gray-700 text-gray-400 cursor-not-allowed">
            Organizer
          </Button>
        ) : (
          <Button
            onClick={handleJoinToggle}
            disabled={isJoining || isLeaving || (isFull && !isJoinedByCurrentUser) || !dbUser}
            aria-busy={isJoining || isLeaving}
            aria-live="polite"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isJoinedByCurrentUser
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            {isJoining || isLeaving ? (
              <LoadingSpinner className="text-white" size="sm" />
            ) : isJoinedByCurrentUser ? (
              "Leave Plan"
            ) : isFull ? (
              "Plan Full"
            ) : (
              "Join Plan"
            )}
            <span className="sr-only">
              {isJoining ? "Joining plan" : isLeaving ? "Leaving plan" : isJoinedByCurrentUser ? "You have joined this plan" : "Click to join plan"}
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
