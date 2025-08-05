"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCard } from "./user-card"
import { useUsers } from "@/hooks/use-users"
import { LoadingSpinner } from "./loading-spinner"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function SuggestedUsers() {
  const { dbUser } = useAuth()
  const { data, isLoading, isError } = useUsers() // Fetch all users, then filter client-side for suggestions
  const users = data?.pages.flatMap((page) => page.users) || []

  // Filter out current user and already followed users for suggestions
  const suggestedUsers = users.filter(
    (user) => dbUser && user.id !== dbUser.id && !dbUser.followingIds?.includes(user.id),
  )

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Suggested Users</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-24">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Suggested Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-center">Error loading suggestions.</p>
        </CardContent>
      </Card>
    )
  }

  if (suggestedUsers.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Suggested Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center">No new suggestions at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Suggested Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.slice(0, 5).map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {suggestedUsers.length > 5 && (
          <div className="text-center mt-4">
            <Link href="/explore?tab=users">
              <Button variant="link" className="text-orange-500 hover:underline">
                View All
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
