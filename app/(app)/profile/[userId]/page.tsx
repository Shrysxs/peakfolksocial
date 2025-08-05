"use client"

import { Calendar as CalendarIcon, Mountain, MapPin, LinkIcon, Camera, Compass, Heart, Sparkles, BookOpen, Users, Clock, Star } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useUser, useUserPosts, useHandleFollowRequest } from "@/hooks/use-users"
import useFollowUser from "@/hooks/use-follow-user"
import { useJoinedPlans, useCreatedPlans } from "@/hooks/use-plans"
import { PostCard } from "@/components/post-card"
import { PlanCard } from "@/components/plan-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toDate } from "@/lib/firebase-services"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { dbUser } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("memories")

  const { data: profileUser, isLoading: isLoadingProfileUser, isError: isErrorProfileUser } = useUser(userId)
  const { isFollowing, toggleFollow, isLoading: isTogglingFollow } = useFollowUser(dbUser?.id, userId)
  const { mutate: handleFollowRequest, isPending: isHandlingRequest } = useHandleFollowRequest()

  const {
    data: userPostsData,
    fetchNextPage: fetchNextUserPosts,
    hasNextPage: hasNextUserPosts,
    isFetchingNextPage: isFetchingNextUserPosts,
    isLoading: isLoadingUserPosts,
    isError: isErrorUserPosts,
  } = useUserPosts(userId)
  const userPosts = userPostsData?.pages.flatMap((page) => page.posts) || []

  const {
    data: joinedPlansData,
    fetchNextPage: fetchNextJoinedPlans,
    hasNextPage: hasNextJoinedPlans,
    isFetchingNextPage: isFetchingNextJoinedPlans,
    isLoading: isLoadingJoinedPlans,
    isError: isErrorJoinedPlans,
  } = useJoinedPlans(userId)
  const joinedPlans = joinedPlansData?.pages.flatMap((page) => page.plans) || []

  const {
    data: createdPlansData,
    fetchNextPage: fetchNextCreatedPlansPage,
    hasNextPage: hasNextCreatedPlansPage,
    isFetchingNextPage: isFetchingNextCreatedPlansPage,
    isLoading: isLoadingCreatedPlans,
    isError: isErrorCreatedPlans,
  } = useCreatedPlans(userId)
  const createdPlans = createdPlansData?.pages.flatMap((page) => page.plans) || []

  const isCurrentUserProfile = dbUser?.id === userId
  const hasPendingRequestFromCurrentUser = dbUser?.sentFollowRequests?.includes(userId) || false
  const hasPendingRequestToCurrentUser = profileUser?.pendingFollowRequests?.includes(dbUser?.id || "") || false

  const handleFollowToggle = () => {
    if (!dbUser) {
      toast.error("You must be logged in to follow users.")
      return
    }
    if (isCurrentUserProfile) {
      toast.info("You cannot follow yourself.")
      return
    }
    toggleFollow({ followerId: dbUser.id, followingId: userId })
  }

  const handleRequestAction = (accept: boolean) => {
    if (!dbUser) {
      toast.error("You must be logged in to handle follow requests.")
      return
    }
    handleFollowRequest({ requesterId: userId, targetUserId: dbUser.id, accept })
  }

  if (isLoadingProfileUser) {
    return (
      <div className="flex justify-center items-center h-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-400">Loading adventure profile...</p>
        </div>
      </div>
    )
  }

  if (isErrorProfileUser || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center">
          <Mountain className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Adventure Not Found</h2>
          <p className="text-red-500 mb-6">This explorer's profile couldn't be loaded. They might have moved on to new peaks.</p>
          <Button 
            onClick={() => router.back()} 
            className="bg-orange-600 hover:bg-orange-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const memberSince = toDate(profileUser.createdAt)

  // Determine if content should be hidden for private profiles
  const showContent = !profileUser.isPrivate || isFollowing || isCurrentUserProfile

  // Create a nostalgic memory grid layout
  const renderMemoryGrid = () => {
    if (isLoadingUserPosts && !isFetchingNextUserPosts) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading memories...</p>
          </div>
        </div>
      )
    }

    if (isErrorUserPosts) {
      return (
        <div className="text-center">
          <Mountain className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 mb-3">Failed to load memories.</p>
          <Button 
            onClick={() => window.location.reload()} 
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (userPosts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <Camera className="h-20 w-20 text-gray-500 mx-auto" />
            <Sparkles className="h-6 w-6 text-orange-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Memories Captured Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Every adventure starts with a single step. When you share your first moment, it will appear here as part of your journey.
          </p>
          <div className="space-y-3 text-sm text-gray-500 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Mountain className="h-4 w-4 text-orange-500" />
              <span>Capture your mountain moments</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Share your adventure stories</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Connect with fellow explorers</span>
            </div>
          </div>
          {isCurrentUserProfile && (
            <Link href="/create">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Camera className="h-4 w-4 mr-2" />
                Capture Your First Memory
              </Button>
            </Link>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Nostalgic Memory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {userPosts.map((post, index) => (
            <div
              key={post.id}
              className={`memory-grid-item group relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105 memory-card ${
                index % 3 === 0 ? 'md:col-span-2 md:row-span-2' : 
                index % 5 === 0 ? 'md:col-span-2' : 
                index % 7 === 0 ? 'md:row-span-2' : ''
              }`}
              style={{
                transform: `rotate(${Math.random() * 2 - 1}deg)`
              }}
            >
              <div className="relative aspect-square md:aspect-auto h-full">
                <Image
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.caption || `Memory by ${post.author?.name || post.author?.username || "Unknown"}`}
                  fill
                  className="object-cover rounded-xl group-hover:brightness-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 memory-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm line-clamp-2">{post.caption}</p>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-300">
                    <Heart className="h-3 w-3" />
                    <span>{post.likes.length}</span>
                    <Clock className="h-3 w-3" />
                    <span>{toDate(post.createdAt)?.toLocaleDateString()}</span>
                  </div>
                </div>
                {/* Floating particles for nostalgic effect */}
                <div className="floating-particles"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load More */}
        <div className="flex justify-center items-center py-4">
          {isFetchingNextUserPosts && <LoadingSpinner />}
          {!hasNextUserPosts && userPosts.length > 0 && (
            <div className="text-center">
              <Star className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">You've reached the end of this adventure</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Create a flowy plans layout
  const renderPlansSection = () => {
    const allPlans = [...createdPlans, ...joinedPlans]
    
    if (isLoadingCreatedPlans && isLoadingJoinedPlans) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading adventures...</p>
          </div>
        </div>
      )
    }

    if ((isErrorCreatedPlans || isErrorJoinedPlans) && allPlans.length === 0) {
      return (
        <div className="text-center">
          <Compass className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 mb-3">Failed to load adventures.</p>
          <Button 
            onClick={() => window.location.reload()} 
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (allPlans.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="relative mb-6 empty-state-illustration">
            <Compass className="h-20 w-20 text-gray-500 mx-auto relative z-10" />
            <Sparkles className="h-6 w-6 text-orange-500 absolute -top-2 -right-2 animate-pulse z-20" />
            <div className="floating-particles"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Adventures Planned Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            The greatest adventures are those that haven't been planned yet. When you create or join your first expedition, it will appear here.
          </p>
          <div className="space-y-3 text-sm text-gray-500 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Mountain className="h-4 w-4 text-orange-500" />
              <span>Create your own expeditions</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Join fellow adventurers</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>Explore new destinations</span>
            </div>
          </div>
          {isCurrentUserProfile && (
            <Link href="/create">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Compass className="h-4 w-4 mr-2" />
                Plan Your First Adventure
              </Button>
            </Link>
          )}
        </div>
      )
    }

    return (
      <ScrollArea className="h-[calc(100vh-450px)] pr-2 sm:pr-4">
        <div className="space-y-8">
          {/* Created Plans */}
          {createdPlans.length > 0 && (
            <div className="adventure-section">
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-bold text-orange-400">Expeditions Created</h2>
                <span className="text-sm text-gray-500">({createdPlans.length})</span>
              </div>
              <div className="space-y-4">
                {createdPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
                {hasNextCreatedPlansPage && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => fetchNextCreatedPlansPage()} disabled={isFetchingNextCreatedPlansPage}>
                      {isFetchingNextCreatedPlansPage ? <LoadingSpinner /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Joined Plans */}
          {joinedPlans.length > 0 && (
            <div className="adventure-section">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold text-blue-400">Adventures Joined</h2>
                <span className="text-sm text-gray-500">({joinedPlans.length})</span>
              </div>
              <div className="space-y-4">
                {joinedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
                {hasNextJoinedPlans && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => fetchNextJoinedPlans()} disabled={isFetchingNextJoinedPlans}>
                      {isFetchingNextJoinedPlans ? <LoadingSpinner /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Profile Header */}
      <div className="glass-card p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
          <div className="relative mb-4 md:mb-0">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-orange-500">
              <AvatarImage src={profileUser.photoURL || "/placeholder.svg"} alt={profileUser.username || profileUser.displayName || "User"} />
              <AvatarFallback className="text-4xl">{profileUser.username?.[0]?.toUpperCase() || profileUser.displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{profileUser.displayName || "Adventurer"}</h1>
                {profileUser.username && (
                  <p className="text-gray-400 text-base sm:text-lg">@{profileUser.username}</p>
                )}
              </div>
              
              <div className="flex flex-wrap space-x-2 mt-4 md:mt-0">
                {!isCurrentUserProfile && dbUser && (
                  <>
                    <Button
                      onClick={() => router.push(`/messages?chatWith=${userId}`)}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Message
                    </Button>
                    {profileUser.isPrivate && !isFollowing && !hasPendingRequestFromCurrentUser ? (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={isTogglingFollow}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {isTogglingFollow ? <LoadingSpinner className="text-white" size="sm" /> : "Request Follow"}
                      </Button>
                    ) : profileUser.isPrivate && hasPendingRequestFromCurrentUser ? (
                      <Button disabled className="bg-gray-700 text-gray-400 cursor-not-allowed">
                        Request Sent
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={isTogglingFollow}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isFollowing
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-orange-600 text-white hover:bg-orange-700"
                        }`}
                      >
                        {isTogglingFollow ? (
                          <LoadingSpinner className="text-white" size="sm" />
                        ) : isFollowing ? (
                          "Following"
                        ) : (
                          "Follow"
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {profileUser.bio && (
              <p className="text-gray-300 mb-4 italic">"{profileUser.bio}"</p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-gray-400 text-xs sm:text-sm mb-4">
              {profileUser.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-orange-400 transition-colors"
                >
                  <LinkIcon className="h-4 w-4 mr-1 text-orange-500" />
                  <span>{profileUser.website.replace(/^(https?:\/\/)?(www\.)?/, "")}</span>
                </a>
              )}
              {memberSince && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-orange-500" />
                  <span>Explorer since {memberSince.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-white text-base sm:text-lg font-semibold">
              <div className="profile-stats flex flex-col items-center">
                <span className="font-bold text-xl">{typeof profileUser.posts === 'number' ? profileUser.posts : 0}</span>
                <span className="text-sm text-gray-400">Memories</span>
              </div>
              <div className="profile-stats flex flex-col items-center">
                <span className="font-bold text-xl">{typeof profileUser.followers === 'number' ? profileUser.followers : 0}</span>
                <span className="text-sm text-gray-400">Fellow Explorers</span>
              </div>
              <div className="profile-stats flex flex-col items-center">
                <span className="font-bold text-xl">{typeof profileUser.following === 'number' ? profileUser.following : 0}</span>
                <span className="text-sm text-gray-400">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Private Profile Notice */}
      {profileUser.isPrivate && !isFollowing && !isCurrentUserProfile && (
        <div className="glass-card p-6 rounded-lg shadow-md text-center text-gray-400 mb-6">
          <Mountain className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">This Explorer's Journey is Private</h3>
          <p>Follow to see their memories and adventures.</p>
        </div>
      )}

      {/* Content Tabs */}
      {showContent && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
            <TabsTrigger value="memories" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Camera className="h-4 w-4 mr-2" />
              Memories
            </TabsTrigger>
            <TabsTrigger value="adventures" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Compass className="h-4 w-4 mr-2" />
              Adventures
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="memories" className="mt-6">
            {renderMemoryGrid()}
          </TabsContent>
          
          <TabsContent value="adventures" className="mt-6">
            {renderPlansSection()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
