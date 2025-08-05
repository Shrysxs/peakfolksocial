"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import useFollowUser from "@/hooks/use-follow-user" // Corrected import
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"

interface UserCardProps {
  user: {
    id: string
    username: string
    displayName: string
    photoURL?: string
    bio?: string
    isPrivate?: boolean
  }
}

export function UserCard({ user }: UserCardProps) {
  const { dbUser } = useAuth()
  const { isFollowing, toggleFollow, isLoading: isTogglingFollow } = useFollowUser(dbUser?.id, user.id)

  const handleFollowToggle = () => {
    if (!dbUser) {
      toast.error("You must be logged in to follow users.")
      return
    }
    if (dbUser.id === user.id) {
      toast.info("You cannot follow yourself.")
      return
    }

    toggleFollow({ followerId: dbUser.id, followingId: user.id })
  }

  const showFollowButton = dbUser && dbUser.id !== user.id

  return (
    <div className="glass-card flex items-center justify-between p-4 rounded-lg shadow-md">
      <Link href={`/profile/${user.id}`} className="flex items-center space-x-4 group">
        <Avatar className="h-12 w-12 border-2 border-orange-500">
          <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.username} />
          <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-white group-hover:text-orange-400 transition-colors">
            {user.displayName}
          </span>
          <span className="text-sm text-gray-400">@{user.username}</span>
          {user.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{user.bio}</p>}
        </div>
      </Link>
      {showFollowButton && (
        <Button
          onClick={handleFollowToggle}
          disabled={isTogglingFollow}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isFollowing ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-orange-600 text-white hover:bg-orange-700"
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
    </div>
  )
}
