"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useUpdateUser } from "@/hooks/use-users" // This is now aliased from useUpdateUserProfile
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, Lock, Trash2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"
// Removed direct import of useUpdateProfile as it's now aliased in use-users

export default function SettingsPage() {
  const { currentUser, logout, dbUser, refreshDbUser, updateDbUser } = useAuth() // Changed userProfile to dbUser, updateUserProfile to updateDbUser
  const { mutate: updateUserProfileMutation, isPending } = useUpdateUser() // Using the aliased hook
  const router = useRouter()
  const [isPrivate, setIsPrivate] = useState(dbUser?.isPrivate || false)

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    likes: true,
    comments: true,
    follows: true,
    plans: true,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true, // This will be controlled by isPrivate switch
    showEmail: false,
    showLocation: true,
    allowMessages: true,
  })

  useEffect(() => {
    if (dbUser) {
      setIsPrivate(dbUser.isPrivate || false)
      // Initialize notification and privacy settings from dbUser if they exist
      setNotifications({
        email: dbUser.notificationSettings?.emailNotifications ?? true,
        push: dbUser.notificationSettings?.pushNotifications ?? true,
        likes: dbUser.notificationSettings?.likes ?? true,
        comments: dbUser.notificationSettings?.comments ?? true,
        follows: dbUser.notificationSettings?.follows ?? true,
        plans: dbUser.notificationSettings?.planUpdates ?? true,
      })
      setPrivacy({
        profilePublic: !dbUser.isPrivate, // Public is inverse of private
        showEmail: dbUser.privacySettings?.showEmail ?? false,
        showLocation: dbUser.privacySettings?.showLocation ?? true,
        allowMessages:
          (dbUser.privacySettings?.allowMessages === "everyone" ||
            dbUser.privacySettings?.allowMessages === "followers") ??
          true,
      })
    }
  }, [dbUser])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      // Logout error handled
      toast.error("Failed to logout")
    }
  }

  const handleSaveNotifications = async () => {
    if (!dbUser) {
      toast.error("User not authenticated.")
      return
    }
    
    const updatedData = {
      notificationSettings: {
        emailNotifications: notifications.email,
        pushNotifications: notifications.push,
        likes: notifications.likes,
        comments: notifications.comments,
        follows: notifications.follows,
        planUpdates: notifications.plans,
        messages: true,
      },
    }
    
    updateUserProfileMutation(
      {
        userId: dbUser.id,
        data: updatedData,
      },
      {
        onSuccess: async () => {
          await refreshDbUser()
          // Also update the auth context
          await updateDbUser(updatedData)
          toast.success("Notification settings updated")
        },
        onError: (error) => {
          toast.error(`Failed to update settings: ${error.message}`)
        },
      },
    )
  }

  const handleSavePrivacy = async () => {
    if (!dbUser) {
      toast.error("User not authenticated.")
      return
    }
    
    const updatedData = {
      isPrivate: !privacy.profilePublic, // Update isPrivate based on profilePublic
      privacySettings: {
        isPrivate: !privacy.profilePublic,
        showEmail: privacy.showEmail,
        showLocation: privacy.showLocation,
        allowMessages: privacy.allowMessages ? "everyone" as const : "none" as const, // Simplified for boolean switch
        allowPlanInvites: "everyone" as const, // Assuming this is always everyone or handled elsewhere
      },
    }
    
    updateUserProfileMutation(
      {
        userId: dbUser.id,
        data: updatedData,
      },
      {
        onSuccess: async () => {
          await refreshDbUser()
          // Also update the auth context
          await updateDbUser(updatedData)
          toast.success("Privacy settings updated")
        },
        onError: (error) => {
          toast.error(`Failed to update settings: ${error.message}`)
        },
      },
    )
  }

  const handleSaveChanges = async () => {
    if (!dbUser) {
      toast.error("User not authenticated.")
      return
    }

    const updatedData = { isPrivate }

    updateUserProfileMutation(
      { userId: dbUser.id, data: updatedData },
      {
        onSuccess: async () => {
          await refreshDbUser()
          // Also update the auth context
          await updateDbUser(updatedData)
          toast.success("Profile privacy updated successfully!")
        },
        onError: (error) => {
          toast.error(`Failed to update settings: ${error.message}`)
        },
      },
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      {/* Account Overview */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Account Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-gray-800">
              <AvatarImage src={currentUser?.photoURL || ""} />
              <AvatarFallback className="bg-primary text-black text-xl">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">{currentUser?.displayName}</h3>
              <p className="text-gray-400">{currentUser?.email}</p>
              <Badge variant="outline" className="border-green-600 text-green-400">
                Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Push Notifications</Label>
                <p className="text-sm text-gray-400">Receive push notifications on your device</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-4">
              <h4 className="font-medium text-white">Activity Notifications</h4>

              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Likes on your posts</Label>
                <Switch
                  checked={notifications.likes}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, likes: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Comments on your posts</Label>
                <Switch
                  checked={notifications.comments}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, comments: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-300">New followers</Label>
                <Switch
                  checked={notifications.follows}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, follows: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Plan updates</Label>
                <Switch
                  checked={notifications.plans}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, plans: checked })}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveNotifications}
            disabled={isPending}
            className="bg-primary text-black hover:bg-primary/90"
          >
            {isPending ? <LoadingSpinner className="text-black" /> : "Save Notification Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Public Profile</Label>
                <p className="text-sm text-gray-400">Make your profile visible to everyone</p>
              </div>
              <Switch
                checked={privacy.profilePublic}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, profilePublic: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Show Email</Label>
                <p className="text-sm text-gray-400">Display your email on your profile</p>
              </div>
              <Switch
                checked={privacy.showEmail}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Show Location</Label>
                <p className="text-sm text-gray-400">Display your location on your profile</p>
              </div>
              <Switch
                checked={privacy.showLocation}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, showLocation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Allow Messages</Label>
                <p className="text-sm text-gray-400">Let others send you direct messages</p>
              </div>
              <Switch
                checked={privacy.allowMessages}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, allowMessages: checked })}
              />
            </div>
          </div>

          <Button
            onClick={handleSavePrivacy}
            disabled={isPending}
            className="bg-primary text-black hover:bg-primary/90"
          >
            {isPending ? <LoadingSpinner className="text-black" /> : "Save Privacy Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Account Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
              <div className="space-y-1">
                <h4 className="font-medium text-white">Change Password</h4>
                <p className="text-sm text-gray-400">Update your account password</p>
              </div>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
              <div className="space-y-1">
                <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
              >
                Enable 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
              <div className="space-y-1">
                <h4 className="font-medium text-white">Download Data</h4>
                <p className="text-sm text-gray-400">Download a copy of your data</p>
              </div>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
              >
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings (Specific to isPrivate) */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Profile Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="private-account" className="text-white">
                Private Account
              </Label>
              <Switch
                id="private-account"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                disabled={isPending}
              />
            </div>
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={isPending}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isPending ? <LoadingSpinner className="text-white" /> : "Save Profile Privacy"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-800">
              <div className="space-y-1">
                <h4 className="font-medium text-white">Sign Out</h4>
                <p className="text-sm text-gray-400">Sign out of your account on this device</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/30 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-red-800">
              <div className="space-y-1">
                <h4 className="font-medium text-white">Delete Account</h4>
                <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                className="border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/30 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
