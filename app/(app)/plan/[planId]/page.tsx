"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Share2, 
  MessageCircle, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
  Bookmark,
  MoreVertical
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePlan, useJoinPlan, useLeavePlan } from "@/hooks/use-plans"
import usePlanMembers from "@/hooks/use-plan-members"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PlanChat } from "@/components/plan-chat"
import { PlanManagementDialog } from "@/components/plan-management-dialog"
import { toast } from "sonner"
import { toDate } from "@/lib/firebase-services"
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>()
  const router = useRouter()
  const { dbUser } = useAuth()
  const [activeTab, setActiveTab] = useState("details")
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false)

  const { data: plan, isLoading: isLoadingPlan, isError: isErrorPlan } = usePlan(planId)
  const { members, isLoading: isLoadingMembers } = usePlanMembers(planId)
  const { mutate: joinPlan, isPending: isJoining } = useJoinPlan()
  const { mutate: leavePlan, isPending: isLeaving } = useLeavePlan()

  if (isLoadingPlan) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (isErrorPlan || !plan) {
    return (
      <div className="glass-card p-6 rounded-lg shadow-md text-red-500 text-center">
        Plan not found or failed to load.
      </div>
    )
  }

  const isOrganizer = dbUser?.id === plan.userId
  const isJoined = plan.participantIds?.includes(dbUser?.id || "")
  const isFull = plan.maxParticipants && plan.currentParticipants >= plan.maxParticipants
  const planDateTime = toDate(plan.dateTime)

  const handleJoinToggle = () => {
    if (!dbUser) {
      toast.error("You must be logged in to join or leave plans.")
      return
    }

    if (isJoined) {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: plan.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Plan link copied to clipboard!")
    }
  }



  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-white hover:bg-gray-800"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-800"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          {isOrganizer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem onClick={() => setIsManagementDialogOpen(true)} className="hover:bg-gray-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Plan Header */}
      <Card className="glass-card mb-6">
        <CardContent className="p-0">
          {plan.imageUrl && (
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={plan.imageUrl}
                alt={plan.title}
                fill
                className="object-cover rounded-t-lg"
                priority
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{plan.title}</h1>
                <div className="flex items-center space-x-4 text-gray-400 mb-4">
                  <Link href={`/profile/${plan.organizer?.id}`} className="flex items-center space-x-2 hover:text-orange-400">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={plan.organizer?.avatar} alt={plan.organizer?.username} />
                      <AvatarFallback>{plan.organizer?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{plan.organizer?.name || plan.organizer?.username}</span>
                  </Link>
                  <Badge variant="secondary" className="bg-orange-600 text-white">
                    Organizer
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge 
                  variant={isFull ? "destructive" : "default"}
                  className={isFull ? "bg-red-600" : "bg-green-600"}
                >
                  {isFull ? "Full" : `${plan.currentParticipants}/${plan.maxParticipants || "∞"}`}
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {plan.costPerHead} {plan.currency}
                  </div>
                  <div className="text-sm text-gray-400">per person</div>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-6">{plan.description}</p>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-white font-medium">
                    {planDateTime?.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {planDateTime?.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-white font-medium">Location</div>
                  <div className="text-sm text-gray-400">{plan.location}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-white font-medium">Participants</div>
                  <div className="text-sm text-gray-400">
                    {plan.currentParticipants} joined
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-white font-medium">Created</div>
                  <div className="text-sm text-gray-400">
                    {toDate(plan.createdAt)?.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isOrganizer ? (
                <Button disabled className="bg-gray-700 text-gray-400 cursor-not-allowed">
                  You&apos;re the Organizer
                </Button>
              ) : (
                <Button
                  onClick={handleJoinToggle}
                  disabled={isJoining || isLeaving || (isFull && !isJoined) || !dbUser}
                  className={`flex-1 ${
                    isJoined
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {isJoining || isLeaving ? (
                    <LoadingSpinner className="text-white" size="sm" />
                  ) : isJoined ? (
                    "Leave Plan"
                  ) : isFull ? (
                    "Plan Full"
                  ) : (
                    "Join Plan"
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
                disabled={!dbUser}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 text-white">
          <TabsTrigger value="details" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Details
          </TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Participants ({plan.currentParticipants})
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Additional Details */}
              {plan.tags && plan.tags.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {plan.requirements && plan.requirements.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {plan.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.whatToBring && plan.whatToBring.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">What to Bring</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {plan.whatToBring.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Location Details */}
              <div>
                <h3 className="text-white font-semibold mb-2">Location Details</h3>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <span className="text-white font-medium">{plan.location}</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>

              {/* Organizer Contact */}
              <div>
                <h3 className="text-white font-semibold mb-2">Contact Organizer</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex justify-center items-center h-40">
                  <LoadingSpinner />
                </div>
              ) : members && members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <Link href={`/profile/${member.id}`} className="flex items-center space-x-3 hover:text-orange-400">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photoURL} alt={member.username} />
                          <AvatarFallback>{member.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">
                            {member.displayName || member.username}
                          </div>
                          <div className="text-sm text-gray-400">@{member.username}</div>
                        </div>
                      </Link>
                      {member.id === plan.userId && (
                        <Badge variant="secondary" className="bg-orange-600 text-white">
                          Organizer
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">No participants yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6 h-[600px]">
          <PlanChat 
            planId={plan.id} 
            planTitle={plan.title} 
            isOrganizer={isOrganizer} 
          />
        </TabsContent>
      </Tabs>

      {/* Plan Management Dialog */}
      <PlanManagementDialog
        plan={plan}
        open={isManagementDialogOpen}
        onOpenChange={setIsManagementDialogOpen}
      />
    </div>
  )
} 