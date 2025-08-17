"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24 bg-gray-800" />
      <Skeleton className="h-10 w-full bg-gray-800" />
      <Skeleton className="h-6 w-24 bg-gray-800" />
      <Skeleton className="h-10 w-full bg-gray-800" />
      <Skeleton className="h-10 w-full bg-gray-800" />
    </div>
  )
}

export function UserCardSkeleton() {
  return (
    <div className="glass-card flex items-center justify-between p-4 rounded-lg shadow-md">
      <div className="flex items-center space-x-4 w-full">
        <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 bg-gray-800" />
          <Skeleton className="h-3 w-24 bg-gray-800" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full bg-gray-800" />
      </div>
    </div>
  )
}

export function PlanCardSkeleton() {
  return (
    <div className="glass-card flex flex-col w-full overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 bg-gray-800" />
            <Skeleton className="h-3 w-24 bg-gray-800" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded bg-gray-800" />
      </div>
      <Skeleton className="aspect-[16/9] w-full bg-gray-800" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3 bg-gray-800" />
        <Skeleton className="h-4 w-full bg-gray-800" />
        <Skeleton className="h-4 w-5/6 bg-gray-800" />
      </div>
      <div className="p-4 border-t border-gray-700 flex justify-between items-center">
        <Skeleton className="h-8 w-20 bg-gray-800" />
        <Skeleton className="h-9 w-28 rounded-full bg-gray-800" />
      </div>
    </div>
  )
}
