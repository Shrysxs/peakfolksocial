import * as React from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { PostCardLoadingState, PlanCardLoadingState, UserCardLoadingState } from "@/components/loading-states"

export default function ExploreLoadingPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search posts, plans, or users..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
          disabled
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-gray-700 mb-6">
          <TabsTrigger value="posts" disabled>
            Posts
          </TabsTrigger>
          <TabsTrigger value="plans" disabled>
            Plans
          </TabsTrigger>
          <TabsTrigger value="users" disabled>
            Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <div className="space-y-6">
            <PostCardLoadingState />
            <PostCardLoadingState />
          </div>
        </TabsContent>
        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlanCardLoadingState />
            <PlanCardLoadingState />
            <PlanCardLoadingState />
          </div>
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <div className="space-y-4">
            <UserCardLoadingState />
            <UserCardLoadingState />
            <UserCardLoadingState />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
