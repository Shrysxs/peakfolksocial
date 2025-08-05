"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useFollowRequests, useHandleFollowRequest } from "@/hooks/use-users" // Import the new hooks
import { LoadingSpinner } from "./loading-spinner"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface FollowRequestsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FollowRequestsDialog({ open, onOpenChange }: FollowRequestsDialogProps) {
  const { dbUser } = useAuth()
  const { data: followRequests, isLoading, isError } = useFollowRequests(dbUser?.id || "")
  const { mutate: handleRequest, isPending: isHandlingRequest } = useHandleFollowRequest()

  const handleAction = (requesterId: string, accept: boolean) => {
    if (!dbUser) {
      toast.error("You must be logged in to handle requests.")
      return
    }
    handleRequest({ requesterId, targetUserId: dbUser.id, accept })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Follow Requests</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <p className="text-red-500 text-center">Error loading follow requests.</p>
          ) : followRequests && followRequests.length > 0 ? (
            followRequests.map((requestUser) => (
              <div key={requestUser.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800">
                <Link href={`/profile/${requestUser.id}`} className="flex items-center space-x-3 group">
                  <Avatar className="h-10 w-10 border-2 border-orange-500">
                    <AvatarImage src={requestUser.photoURL || "/placeholder.svg"} alt={requestUser.username} />
                    <AvatarFallback>{requestUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {requestUser.displayName}
                    </span>
                    <span className="text-sm text-gray-400">@{requestUser.username}</span>
                  </div>
                </Link>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-green-500 hover:bg-green-500/20"
                    onClick={() => handleAction(requestUser.id, true)}
                    disabled={isHandlingRequest}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-500/20"
                    onClick={() => handleAction(requestUser.id, false)}
                    disabled={isHandlingRequest}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No pending follow requests.</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
