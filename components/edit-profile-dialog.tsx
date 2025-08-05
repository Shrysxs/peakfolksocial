"use client"

import * as React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useUser } from "@/hooks/use-users" // Keep useUser for fetching current profile
import useUpdateProfile from "@/hooks/use-update-profile" // Import the new useUpdateProfile hook
import { toast } from "sonner"
import { LoadingSpinner } from "./loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { dbUser } = useAuth()
  const { data: currentUserProfile, isLoading: isLoadingProfile } = useUser(dbUser?.id || "")

  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [previewPhotoURL, setPreviewPhotoURL] = useState<string | null>(null)

  const { updateProfile, loading: isUpdating, error: updateError } = useUpdateProfile() // Use the new hook

  useEffect(() => {
    if (open && currentUserProfile) {
      setDisplayName(currentUserProfile.displayName || "")
      setUsername(currentUserProfile.username || "")
      setBio(currentUserProfile.bio || "")
      setWebsite(currentUserProfile.website || "")
      setLocation(currentUserProfile.location || "")
      setProfileImageFile(null)
      setPreviewPhotoURL(currentUserProfile.photoURL || null)
    }
  }, [open, currentUserProfile])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImageFile(file)
      setPreviewPhotoURL(URL.createObjectURL(file))
    } else {
      setProfileImageFile(null)
      setPreviewPhotoURL(currentUserProfile?.photoURL || null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!dbUser) {
      toast.error("You must be logged in to edit your profile.")
      return
    }

    updateProfile(
      {
        userId: dbUser.id,
        data: {
          displayName,
          username,
          bio,
          website,
          location,
        },
        profileImageFile: profileImageFile || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setProfileImageFile(null) // Clear file input after successful upload
        },
      },
    )
  }

  if (isLoadingProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card sm:max-w-[425px]">
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-orange-500">
              <AvatarImage src={previewPhotoURL || "/placeholder.svg"} alt={username} />
              <AvatarFallback className="text-3xl">{username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <Label htmlFor="profileImage" className="text-white cursor-pointer hover:text-orange-400">
              Change Profile Photo
            </Label>
            <Input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="displayName" className="text-white">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-white">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website" className="text-white">
              Website
            </Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-white">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isUpdating || !dbUser}
          >
            {isUpdating ? <LoadingSpinner className="text-white" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
