"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import dynamic from "next/dynamic"
import { LoadingSpinner } from "@/components/loading-spinner"
import { usePosts } from "@/hooks/use-posts" // Import usePosts
import { useDebounce } from "@/hooks/use-debounce" // Import useDebounce
import { ScrollArea } from "@/components/ui/scroll-area"

// Lazy-load heavy components
const StoryBar = dynamic(() => import("@/components/story-bar").then(m => ({ default: m.StoryBar })), {
  loading: () => (
    <div className="h-20 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  ),
  ssr: false,
})

const PostCard = dynamic(() => import("@/components/post-card").then(m => ({ default: m.PostCard })), {
  loading: () => (
    <div className="rounded-lg border border-gray-800 bg-gray-900 h-40 animate-pulse" />
  ),
})

export default function FeedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { data: postsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = usePosts() // Use the usePosts hook

  const posts = postsData?.pages.flatMap((page) => page.posts) || []

  // Client-side filtering for posts based on search query
  const query = debouncedSearchQuery.toLowerCase()

  const filteredPosts = posts.filter((post) => {
    const caption = post.caption ?? "" // fallback to empty string
    const username = post.author?.username ?? ""
    const name = post.author?.name ?? ""

    return (
      caption.toLowerCase().includes(query) ||
      username.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query)
    )
  })

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="glass-card p-4 rounded-lg shadow-md mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
          />
        </div>
        <StoryBar /> {/* Lazy-loaded StoryBar */}
      </div>

      <h1 className="text-3xl font-bold text-white mb-6 text-center">Feed</h1>

      <ScrollArea className="h-[calc(100vh-280px)] pr-4">
        {isLoading && !isFetchingNextPage ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <p className="text-red-500 text-center">Failed to load posts.</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-gray-400 text-center">No posts found matching your search.</p>
        ) : (
          <div className="grid gap-6 max-w-2xl mx-auto">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
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
  )
}
