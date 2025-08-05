import { Skeleton } from "@/components/ui/skeleton"

// ⬇️ Post-card placeholder (feed & profile timelines)
export function PostCardLoadingState() {
  return (
    <div className="glass-card border-gray-800 bg-gray-900/50 p-4 animate-pulse space-y-4">
      {/* header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full bg-gray-700/60" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3 bg-gray-700/60" />
          <Skeleton className="h-3 w-1/4 bg-gray-700/50" />
        </div>
      </div>

      {/* media */}
      <Skeleton className="w-full h-56 rounded-md bg-gray-700/40" />

      {/* caption */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-gray-700/60" />
        <Skeleton className="h-4 w-5/6 bg-gray-700/50" />
      </div>

      {/* actions */}
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-6 w-16 bg-gray-700/50" />
        <Skeleton className="h-6 w-16 bg-gray-700/50" />
      </div>
    </div>
  )
}

export function UserCardLoadingState() {
  return (
    <div className="glass-card border-gray-800 bg-gray-900/50 p-4 flex items-center gap-4 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-gray-700/60" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-gray-700/60 rounded" />
        <div className="h-3 w-1/3 bg-gray-700/50 rounded" />
      </div>
      <div className="h-8 w-20 rounded bg-gray-700/60" />
    </div>
  )
}

// ⬇️ ADD this new loading skeleton and export

export function StoryBarLoadingState() {
  return (
    <div className="flex space-x-4 p-4 overflow-x-auto animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-gray-700/60" />
          <div className="h-3 w-12 rounded bg-gray-700/50" />
        </div>
      ))}
    </div>
  )
}

export function PlanCardLoadingState() {
  return (
    <div className="glass-card border-gray-800 bg-gray-900/50 p-4 animate-pulse space-y-3">
      {/* title / destination */}
      <Skeleton className="h-5 w-2/3 bg-gray-700/60" />

      {/* description lines */}
      <Skeleton className="h-4 w-full bg-gray-700/50" />
      <Skeleton className="h-4 w-5/6 bg-gray-700/40" />

      {/* footer: price & CTA */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-20 bg-gray-700/50" />
        <Skeleton className="h-8 w-24 rounded bg-gray-700/50" />
      </div>
    </div>
  )
}

// ⬇️ Notification list placeholder (notifications page)
export function NotificationLoadingState() {
  return (
    <div className="flex items-center space-x-4 p-3 border-b border-gray-800 last:border-b-0 animate-pulse">
      {/* avatar */}
      <Skeleton className="h-10 w-10 rounded-full bg-gray-700/60" />

      {/* text lines */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
        <Skeleton className="h-3 w-1/3 bg-gray-700/40" />
      </div>
    </div>
  )
}

// ⬇️ Chat message placeholder (messages page)
export function MessageLoadingState() {
  return (
    <div className="flex items-end gap-3 p-3 animate-pulse">
      {/* sender avatar */}
      <Skeleton className="h-8 w-8 rounded-full bg-gray-700/60" />

      {/* bubble lines */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5 bg-gray-700/50 rounded" />
        <Skeleton className="h-3 w-2/5 bg-gray-700/40 rounded" />
      </div>
    </div>
  )
}

// ⬇️ Profile header placeholder (profile page)
export function ProfileHeaderLoadingState() {
  return (
    <div className="glass-card border-gray-800 bg-gray-900/50 p-6 flex flex-col items-center gap-4 animate-pulse">
      {/* avatar */}
      <Skeleton className="h-24 w-24 rounded-full bg-gray-700/60" />

      {/* name + handle */}
      <div className="space-y-2 w-full">
        <Skeleton className="h-5 w-1/2 mx-auto bg-gray-700/60" />
        <Skeleton className="h-4 w-1/3 mx-auto bg-gray-700/50" />
      </div>

      {/* follower / following counts */}
      <div className="flex gap-6 pt-2">
        <Skeleton className="h-4 w-16 bg-gray-700/50" />
        <Skeleton className="h-4 w-16 bg-gray-700/50" />
      </div>

      {/* follow / edit button */}
      <Skeleton className="h-10 w-32 rounded bg-gray-700/60" />
    </div>
  )
}
