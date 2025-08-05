"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Share2 } from "lucide-react"
import { toast } from "sonner"

interface SharePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
}

export function SharePostDialog({ open, onOpenChange, postId }: SharePostDialogProps) {
  const postLink = `${window.location.origin}/post/${postId}` // Assuming a post detail page

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postLink)
    toast.success("Link copied to clipboard!")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post on Peakfolk!",
          url: postLink,
        })
        // Post shared successfully
      } catch (error) {
        // Error sharing post
        toast.error("Failed to share post.")
      }
    } else {
      toast.info("Web Share API not supported. Link copied instead.")
      handleCopyLink()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Share Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right text-white">
              Link
            </Label>
            <Input id="link" value={postLink} readOnly className="col-span-3 bg-gray-800 border-gray-700 text-white" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="text-orange-500 border-orange-500 hover:bg-orange-900 bg-transparent"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Link
          </Button>
          <Button onClick={handleShare} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
