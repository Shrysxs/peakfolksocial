"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkIcon, MapPin, Edit, Settings, Calendar as CalendarIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useUser, useUserPosts, useFollowRequests } from "@/hooks/use-users" // Import useFollowRequests
import { useJoinedPlans, useCreatedPlans } from "@/hooks/use-plans"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PostCard } from "@/components/post-card"
import { PlanCard } from "@/components/plan-card"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { FollowRequestsDialog } from "@/components/follow-requests-dialog"
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { toDate } from "@/lib/firebase-services"

export default function ProfilePage() {
  const { dbUser, isLoading: isLoadingAuth } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated and auth state is loaded
  useEffect(() => {
    if (!isLoadingAuth && !dbUser) {
      router.push("/login")
    }
  }, [dbUser, isLoadingAuth, router])

  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isFollowRequestsDialogOpen, setIsFollowRequestsDialogOpen] = useState(false)
  const [isProfileSettingsDialogOpen, setIsProfileSettingsDialogOpen] = useState(false)

  const { data: profileUser, isLoading: isLoadingProfileUser, isError: isErrorProfileUser } = useUser(dbUser?.id || "")
  const { data: followRequests, isLoading: isLoadingFollowRequests } = useFollowRequests(dbUser?.id || "")

  const {
    data: userPostsData,
    fetchNextPage: fetchNextUserPostsPage,
    hasNextPage: hasNextUserPostsPage,
    isFetchingNextPage: isFetchingNextUserPostsPage,
    isLoading: isLoadingUserPosts,
    isError: isErrorUserPosts,
  } = useUserPosts(dbUser?.id || "")

  const {
    data: joinedPlansData,
    fetchNextPage: fetchNextJoinedPlansPage,
    hasNextPage: hasNextJoinedPlansPage,
    isFetchingNextPage: isFetchingNextJoinedPlansPage,
    isLoading: isLoadingJoinedPlans,
    isError: isErrorJoinedPlans,
  } = useJoinedPlans(dbUser?.id || "")

  const {
    data: createdPlansData,
    fetchNextPage: fetchNextCreatedPlansPage,
    hasNextPage: hasNextCreatedPlansPage,
    isFetchingNextPage: isFetchingNextCreatedPlansPage,
    isLoading: isLoadingCreatedPlans,
    isError: isErrorCreatedPlans,
  } = useCreatedPlans(dbUser?.id || "")
  const createdPlans = createdPlansData?.pages.flatMap((page) => page.plans) || []

  const userPosts = userPostsData?.pages.flatMap((page) => page.posts) || []
  const joinedPlans = joinedPlansData?.pages.flatMap((page) => page.plans) || []

  if (isLoadingAuth || isLoadingProfileUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (isErrorProfileUser || !profileUser) {
    return (
      <div className="glass-card p-6 rounded-lg shadow-md text-red-500 text-center">
        Failed to load your profile or user not found. Please log in.
      </div>
    )
  }

  const memberSince = toDate(profileUser.createdAt)

  return (
    <div className="glass-card p-4 sm:p-6 rounded-lg shadow-md max-w-3xl mx-auto w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col items-center md:flex-row md:space-x-6 w-full max-w-full overflow-x-hidden">
          <Avatar className="h-28 w-28 border-4 border-orange-500 mb-4 md:mb-0 flex-shrink-0">
            <AvatarImage src={profileUser.photoURL || "/placeholder.svg"} alt={profileUser.username} />
            <AvatarFallback className="text-4xl">{profileUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left w-full max-w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate w-full max-w-full">{profileUser.displayName}</h1>
            <p className="text-gray-400 text-base sm:text-lg mb-2 sm:mb-4 break-words w-full max-w-full overflow-hidden">@{profileUser.username}</p>
            {profileUser.bio && <p className="text-gray-300 mt-2 max-w-md break-words w-full max-w-full overflow-hidden">{profileUser.bio}</p>}
            <div className="flex flex-wrap items-center justify-center md:justify-start space-x-2 sm:space-x-4 mt-3 text-gray-400 w-full max-w-full">
              {profileUser.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {profileUser.location}
                </span>
              )}
              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-orange-500"
                >
                  <LinkIcon className="h-4 w-4 mr-1" /> Website
                </a>
              )}
              {profileUser.createdAt && (
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-orange-500" />
                  <span>Joined {toDate(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-3 mt-6 md:mt-0 w-full max-w-full">
          <div className="flex flex-wrap space-x-4 sm:space-x-6 text-white w-full max-w-full justify-center md:justify-end">
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl">{profileUser.posts}</span>
              <span className="text-sm text-gray-400">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl">{profileUser.followers}</span>
              <span className="text-sm text-gray-400">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl">{profileUser.following}</span>
              <span className="text-sm text-gray-400">Following</span>
            </div>
          </div>
          <div className="flex flex-wrap space-x-2 mt-4 w-full max-w-full justify-center md:justify-end">
            <>
              <Button
                onClick={() => setIsEditProfileDialogOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
              <Button
                onClick={() => setIsProfileSettingsDialogOpen(true)}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
              {followRequests && followRequests.length > 0 && (
                <Button
                  onClick={() => setIsFollowRequestsDialogOpen(true)}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/20 relative"
                >
                  Follow Requests
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {followRequests.length}
                  </span>
                </Button>
              )}
            </>
          </div>
        </div>
      </div>
      <Tabs defaultValue="posts" className="flex-1 flex flex-col w-full max-w-full">
        <TabsList className="grid w-full max-w-full grid-cols-2 bg-gray-800 text-white">
          <TabsTrigger value="posts" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Posts</TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="flex-1 mt-4 w-full max-w-full">
          <ScrollArea className="h-[calc(100vh-450px)] pr-2 sm:pr-4 w-full max-w-full">
            {isLoadingUserPosts ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : isErrorUserPosts ? (
              <p className="text-red-500 text-center">Error loading posts.</p>
            ) : userPosts.length === 0 ? (
              <p className="text-gray-400 text-center">No posts yet.</p>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {hasNextUserPostsPage && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => fetchNextUserPostsPage()} disabled={isFetchingNextUserPostsPage}>
                      {isFetchingNextUserPostsPage ? <LoadingSpinner /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="plans" className="flex-1 mt-4 w-full max-w-full">
          <ScrollArea className="h-[calc(100vh-450px)] pr-2 sm:pr-4 w-full max-w-full">
            {/* Created Plans Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-orange-400 mb-2">Created Plans</h2>
              {isLoadingCreatedPlans ? (
                <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>
              ) : isErrorCreatedPlans ? (
                <p className="text-red-500 text-center">Error loading created plans.</p>
              ) : createdPlans.length === 0 ? (
                <p className="text-gray-400 text-center">No created plans yet.</p>
              ) : (
                <div className="space-y-4">
                  {createdPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                    />
                  ))}
                  {hasNextCreatedPlansPage && (
                    <div className="flex justify-center mt-4">
                      <Button onClick={() => fetchNextCreatedPlansPage()} disabled={isFetchingNextCreatedPlansPage}>
                        {isFetchingNextCreatedPlansPage ? <LoadingSpinner /> : "Load More"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Joined Plans Section */}
            <div>
              <h2 className="text-xl font-bold text-orange-400 mb-2">Joined Plans</h2>
              {isLoadingJoinedPlans ? (
                <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>
              ) : isErrorJoinedPlans ? (
                <p className="text-red-500 text-center">Error loading joined plans.</p>
              ) : joinedPlans.length === 0 ? (
                <p className="text-gray-400 text-center">No joined plans yet.</p>
              ) : (
                <div className="space-y-4">
                  {joinedPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                    />
                  ))}
                  {hasNextJoinedPlansPage && (
                    <div className="flex justify-center mt-4">
                      <Button onClick={() => fetchNextJoinedPlansPage()} disabled={isFetchingNextJoinedPlansPage}>
                        {isFetchingNextJoinedPlansPage ? <LoadingSpinner /> : "Load More"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <>
        <EditProfileDialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen} />
        <FollowRequestsDialog open={isFollowRequestsDialogOpen} onOpenChange={setIsFollowRequestsDialogOpen} />
        <ProfileSettingsDialog open={isProfileSettingsDialogOpen} onOpenChange={setIsProfileSettingsDialogOpen} />
      </>
    </div>
  )
}
