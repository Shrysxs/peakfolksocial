// Lazy-loaded cards with light fallbacks to minimize initial bundle
const UserCard = dynamic(() => import("@/components/user-card").then(m => ({ default: m.UserCard })), {
  loading: () => <div className="h-16 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />,
})

const PostCard = dynamic(() => import("@/components/post-card").then(m => ({ default: m.PostCard })), {
  loading: () => <div className="h-40 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />,
})

const PlanCard = dynamic(() => import("@/components/plan-card").then(m => ({ default: m.PlanCard })), {
  loading: () => <div className="h-56 rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />,
})

"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Tag } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDebounce } from "@/hooks/use-debounce"
import useExplore from "@/hooks/use-explore" // Import the new useExplore hook
import { LoadingSpinner } from "@/components/loading-spinner"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("people")

  // Use the new useExplore hook
  const { people, plans, content } = useExplore({
    searchQuery: debouncedSearchQuery,
    location: locationFilter,
    category: categoryFilter,
  })

  const locations = ["Pune", "Mumbai", "Ahilyanagar", "Delhi", "Bengaluru"] // Example locations
  const categories = ["Adventure", "Social", "Food", "Tech", "Art"] // Example categories

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="glass-card p-4 rounded-lg shadow-md mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search users, posts, or plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
          />
        </div>
        <div className="flex space-x-2">
          <Select onValueChange={(value) => setLocationFilter(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <MapPin className="mr-2 h-4 w-4 text-orange-500" />
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setCategoryFilter(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <Tag className="mr-2 h-4 w-4 text-orange-500" />
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-gray-800 text-white">
          <TabsTrigger value="people" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            People
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Plans
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Content
          </TabsTrigger>
        </TabsList>
        <TabsContent value="people" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            {people.isLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : people.isError ? (
              <p className="text-red-500 text-center">Error loading users.</p>
            ) : people.data.length === 0 ? (
              <p className="text-gray-400 text-center">No users found.</p>
            ) : (
              <div className="space-y-4">
                {people.data.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
                {people.hasNextPage && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => people.fetchNextPage()} disabled={people.isFetchingNextPage}>
                      {people.isFetchingNextPage ? <LoadingSpinner /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="plans" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            {plans.isLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : plans.isError ? (
              <p className="text-red-500 text-center">Error loading plans.</p>
            ) : plans.data.length === 0 ? (
              <p className="text-gray-400 text-center">No plans found with current filters.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.data.map((plan) => (
                  <PlanCard key={plan.id} plan={{
                    ...plan,
                    imageUrl: plan.imageUrl || ""
                  }} />
                ))}
                {plans.hasNextPage && (
                  <div className="col-span-full flex justify-center mt-4">
                    <Button onClick={() => plans.fetchNextPage()} disabled={plans.isFetchingNextPage}>
                      {plans.isFetchingNextPage ? <LoadingSpinner /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="content" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            {content.isLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : content.isError ? (
              <p className="text-red-500 text-center">Error loading posts.</p>
            ) : content.data.length === 0 ? (
              <p className="text-gray-400 text-center">No posts found.</p>
            ) : (
              <div className="space-y-4">
                {content.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {content.hasNextPage && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => content.fetchNextPage()} disabled={content.isFetchingNextPage}>
                      {content.isFetchingNextPage ? <LoadingSpinner /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
