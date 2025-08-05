"use client"

import * as React from "react"
import { useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"

// Dynamically import form components with lazy loading
const CreatePostForm = dynamic(() => import("@/components/create-post-form").then(mod => ({ default: mod.CreatePostForm })), {
  loading: () => <div className="flex justify-center p-8"><LoadingSpinner className="text-orange-500" /></div>,
  ssr: false
})

const CreatePlanForm = dynamic(() => import("@/components/create-plan-form").then(mod => ({ default: mod.CreatePlanForm })), {
  loading: () => <div className="flex justify-center p-8"><LoadingSpinner className="text-orange-500" /></div>,
  ssr: false
})

const CreateStoryDialog = dynamic(() => import("@/components/create-story-dialog").then(mod => ({ default: mod.CreateStoryDialog })), {
  loading: () => <div className="flex justify-center p-8"><LoadingSpinner className="text-orange-500" /></div>,
  ssr: false
})

export default function CreatePage() {
  const { dbUser } = useAuth()
  const [isCreateStoryDialogOpen, setIsCreateStoryDialogOpen] = useState(false)
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set(["post"])) // Pre-load the default tab

  // Function to handle tab changes and load components on demand
  const handleTabChange = (value: string) => {
    if (!loadedComponents.has(value)) {
      setLoadedComponents(prev => new Set([...prev, value]))
    }
  }

  // Function to handle story tab click
  const handleStoryTabClick = () => {
    setIsCreateStoryDialogOpen(true)
    if (!loadedComponents.has("story")) {
      setLoadedComponents(prev => new Set([...prev, "story"]))
    }
  }

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white max-w-4xl mx-auto p-4 md:p-6">
        <p>Please log in to create content.</p>
        <Link href="/login">
          <Button className="mt-4 bg-orange-600 hover:bg-orange-700">Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="glass-card p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create New</h1>
        <Tabs defaultValue="post" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 text-white">
            <TabsTrigger value="post" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Post
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              onClick={() => handleTabChange("plan")}
            >
              Plan
            </TabsTrigger>
            <TabsTrigger
              value="story"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              onClick={handleStoryTabClick}
            >
              Story
            </TabsTrigger>
          </TabsList>
          <TabsContent value="post" className="mt-4">
            {loadedComponents.has("post") && (
              <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner className="text-orange-500" /></div>}>
                <CreatePostForm onPostCreated={() => toast.success("Post created!")} />
              </Suspense>
            )}
          </TabsContent>
          <TabsContent value="plan" className="mt-4">
            {loadedComponents.has("plan") ? (
              <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner className="text-orange-500" /></div>}>
                <CreatePlanForm onPlanCreated={() => toast.success("Plan created!")} />
              </Suspense>
            ) : (
              <div className="flex justify-center p-8"><LoadingSpinner className="text-orange-500" /></div>
            )}
          </TabsContent>
          {/* Story tab will open a dialog, so no content here */}
          <TabsContent value="story" className="mt-4">
            <div className="text-center text-gray-400">Click &quot;Story&quot; tab to open the story creation dialog.</div>
          </TabsContent>
        </Tabs>
        {loadedComponents.has("story") && (
          <Suspense fallback={null}>
            <CreateStoryDialog open={isCreateStoryDialogOpen} onOpenChange={setIsCreateStoryDialogOpen} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
