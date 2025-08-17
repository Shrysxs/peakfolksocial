"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "./loading-spinner"
import {
  Bell,
  Lock,
  Eye,
  Moon,
  Shield,
  UserCheck,
  MessageCircle,
  Heart,
  Calendar,
  LogOut,
  ImageIcon,
  Video,
  Globe,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useUser, useUpdateUserProfile } from "@/hooks/use-users" // Use useUser and useUpdateUserProfile
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfileSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const { dbUser, refreshDbUser, logout } = useAuth()
  const router = useRouter()
  const { data: currentUserProfile, isLoading: isLoadingProfile } = useUser(dbUser?.id || "")
  const { mutate: updateUserProfile, isPending: isUpdating } = useUpdateUserProfile()

  const [settings, setSettings] = useState({
    // Privacy Settings
    isPrivate: dbUser?.isPrivate || false,
    showOnlineStatus: dbUser?.showOnlineStatus || true,
    allowTagging: dbUser?.allowTagging || true,
    allowStoryResharing: dbUser?.allowStoryResharing || true,
    showEmail: dbUser?.showEmail || false,
    showLocation: dbUser?.showLocation || true,
    allowMessages: dbUser?.allowMessages || true,

    // Notification Settings
    pushNotifications: dbUser?.pushNotifications || true,
    emailNotifications: dbUser?.emailNotifications || false,
    likeNotifications: dbUser?.likeNotifications || true,
    commentNotifications: dbUser?.commentNotifications || true,
    followNotifications: dbUser?.followNotifications || true,
    planNotifications: dbUser?.planNotifications || true,
    messageNotifications: dbUser?.messageNotifications || true,
    storyNotifications: dbUser?.storyNotifications || true,

    // Display Settings
    darkMode: dbUser?.darkMode || true,
    showStories: dbUser?.showStories || true,
    autoplayVideos: dbUser?.autoplayVideos || true,
    highQualityUploads: dbUser?.highQualityUploads || false,

    // Story Settings
    allowStoryViews: dbUser?.allowStoryViews || true,
    hideStoryFromSpecific: dbUser?.hideStoryFromSpecific || false,
    saveStoriesToGallery: dbUser?.saveStoriesToGallery || false,
  })

  // Load user settings when dialog opens
  useEffect(() => {
    if (open && currentUserProfile) {
      setSettings((prev) => ({
        ...prev,
        isPrivate: currentUserProfile.isPrivate || false,
        showOnlineStatus: currentUserProfile.showOnlineStatus || true,
        allowTagging: currentUserProfile.allowTagging || true,
        allowStoryResharing: currentUserProfile.allowStoryResharing || true,
        showEmail: currentUserProfile.showEmail || false,
        showLocation: currentUserProfile.showLocation || true,
        allowMessages: currentUserProfile.allowMessages || true,
        pushNotifications: currentUserProfile.pushNotifications || true,
        emailNotifications: currentUserProfile.emailNotifications || false,
        likeNotifications: currentUserProfile.likeNotifications || true,
        commentNotifications: currentUserProfile.commentNotifications || true,
        followNotifications: currentUserProfile.followNotifications || true,
        planNotifications: currentUserProfile.planNotifications || true,
        messageNotifications: currentUserProfile.messageNotifications || true,
        storyNotifications: currentUserProfile.storyNotifications || true,
        darkMode: currentUserProfile.darkMode || true,
        showStories: currentUserProfile.showStories || true,
        autoplayVideos: currentUserProfile.autoplayVideos || true,
        highQualityUploads: currentUserProfile.highQualityUploads || false,
        allowStoryViews: currentUserProfile.allowStoryViews || true,
        hideStoryFromSpecific: currentUserProfile.hideStoryFromSpecific || false,
        saveStoriesToGallery: currentUserProfile.saveStoriesToGallery || false,
      }))
    }
  }, [open, currentUserProfile])

  // Helper to convert allowMessages boolean to string
  function getAllowMessagesValue(val: boolean | string): "everyone" | "followers" | "none" {
    if (val === true) return "everyone"
    if (val === false) return "none"
    if (val === "everyone" || val === "followers" || val === "none") return val
    return "everyone"
  }

  const handleSettingChange = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    try {
      const userId = dbUser?.id || ""
      if (key === "isPrivate") {
        await updateUserProfile({ userId, data: { isPrivate: value } })
      } else if (key === "allowMessages") {
        await updateUserProfile({ userId, data: { allowMessages: getAllowMessagesValue(value) } })
      } else {
        await updateUserProfile({ userId, data: { [key]: value } })
      }
      toast.success("Setting updated")
    } catch {
      toast.error("Failed to update setting")
      setSettings((prev) => ({ ...prev, [key]: !value }))
    }
  }

  const handleSaveChanges = async () => {
    if (!dbUser) {
      toast.error("User not authenticated.")
      return
    }
    const userId = dbUser.id
    const flatSettings = { ...settings, allowMessages: getAllowMessagesValue(settings.allowMessages) }
    updateUserProfile(
      { userId, data: flatSettings },
      {
        onSuccess: () => {
          refreshDbUser()
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(`Failed to update settings: ${error.message}`)
        },
      },
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully!")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      toast.error(`Logout failed: ${message}`)
    }
  }

  if (isLoadingProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card sm:max-w-[425px]">
          <div className="flex justify-center items-center h-24">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Privacy Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Lock className="w-5 h-5 text-orange-500" />
                <span>Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="private-account" className="text-white flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Private Account</span>
                  </Label>
                  <p className="text-sm text-gray-400">Only approved followers can see your posts and plans</p>
                </div>
                <Switch
                  id="private-account"
                  checked={settings.isPrivate}
                  onCheckedChange={(checked) => handleSettingChange("isPrivate", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-online-status" className="text-white flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Show Online Status</span>
                  </Label>
                  <p className="text-sm text-gray-400">Let others see when you&apos;re active</p>
                </div>
                <Switch
                  id="show-online-status"
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => handleSettingChange("showOnlineStatus", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-tagging" className="text-white">
                    Allow Tagging
                  </Label>
                  <p className="text-sm text-gray-400">Let others tag you in posts and plans</p>
                </div>
                <Switch
                  id="allow-tagging"
                  checked={settings.allowTagging}
                  onCheckedChange={(checked) => handleSettingChange("allowTagging", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-email" className="text-white">
                    Show Email
                  </Label>
                  <p className="text-sm text-gray-400">Display your email on your profile</p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleSettingChange("showEmail", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-location" className="text-white">
                    Show Location
                  </Label>
                  <p className="text-sm text-gray-400">Display your location on your profile</p>
                </div>
                <Switch
                  id="show-location"
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => handleSettingChange("showLocation", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-messages" className="text-white flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Allow Messages</span>
                  </Label>
                  <p className="text-sm text-gray-400">Let others send you direct messages</p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={getAllowMessagesValue(settings.allowMessages) === "everyone"}
                  onCheckedChange={(checked) => handleSettingChange("allowMessages", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Story Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                <span>Stories</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-story-views" className="text-white">
                    Allow Story Views
                  </Label>
                  <p className="text-sm text-gray-400">Let others see who viewed your stories</p>
                </div>
                <Switch
                  id="allow-story-views"
                  checked={settings.allowStoryViews}
                  onCheckedChange={(checked) => handleSettingChange("allowStoryViews", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-story-resharing" className="text-white">
                    Allow Story Resharing
                  </Label>
                  <p className="text-sm text-gray-400">Let others share your stories</p>
                </div>
                <Switch
                  id="allow-story-resharing"
                  checked={settings.allowStoryResharing}
                  onCheckedChange={(checked) => handleSettingChange("allowStoryResharing", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="hide-story-from-specific" className="text-white">
                    Hide Story From Specific People
                  </Label>
                  <p className="text-sm text-gray-400">Choose who can&apos;t see your stories</p>
                </div>
                <Switch
                  id="hide-story-from-specific"
                  checked={settings.hideStoryFromSpecific}
                  onCheckedChange={(checked) => handleSettingChange("hideStoryFromSpecific", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="save-stories-to-gallery" className="text-white">
                    Save Stories to Gallery
                  </Label>
                  <p className="text-sm text-gray-400">Automatically save your stories</p>
                </div>
                <Switch
                  id="save-stories-to-gallery"
                  checked={settings.saveStoriesToGallery}
                  onCheckedChange={(checked) => handleSettingChange("saveStoriesToGallery", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Bell className="w-5 h-5 text-orange-500" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications" className="text-white">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-400">Receive notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="text-white">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-400">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="like-notifications" className="text-white flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Likes</span>
                  </Label>
                  <p className="text-sm text-gray-400">When someone likes your posts</p>
                </div>
                <Switch
                  id="like-notifications"
                  checked={settings.likeNotifications}
                  onCheckedChange={(checked) => handleSettingChange("likeNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="comment-notifications" className="text-white flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                  </Label>
                  <p className="text-sm text-gray-400">When someone comments on your posts</p>
                </div>
                <Switch
                  id="comment-notifications"
                  checked={settings.commentNotifications}
                  onCheckedChange={(checked) => handleSettingChange("commentNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="follow-notifications" className="text-white flex items-center space-x-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Follows</span>
                  </Label>
                  <p className="text-sm text-gray-400">When someone follows you</p>
                </div>
                <Switch
                  id="follow-notifications"
                  checked={settings.followNotifications}
                  onCheckedChange={(checked) => handleSettingChange("followNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="plan-notifications" className="text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Plans</span>
                  </Label>
                  <p className="text-sm text-gray-400">Plan updates and reminders</p>
                </div>
                <Switch
                  id="plan-notifications"
                  checked={settings.planNotifications}
                  onCheckedChange={(checked) => handleSettingChange("planNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="story-notifications" className="text-white flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Stories</span>
                  </Label>
                  <p className="text-sm text-gray-400">When someone views your stories</p>
                </div>
                <Switch
                  id="story-notifications"
                  checked={settings.storyNotifications}
                  onCheckedChange={(checked) => handleSettingChange("storyNotifications", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Eye className="w-5 h-5 text-orange-500" />
                <span>Display</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="text-white flex items-center space-x-2">
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </Label>
                  <p className="text-sm text-gray-400">Use dark theme</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-stories" className="text-white">
                    Show Stories
                  </Label>
                  <p className="text-sm text-gray-400">Display stories in your feed</p>
                </div>
                <Switch
                  id="show-stories"
                  checked={settings.showStories}
                  onCheckedChange={(checked) => handleSettingChange("showStories", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoplay-videos" className="text-white flex items-center space-x-2">
                    <Video className="w-4 h-4" />
                    <span>Autoplay Videos</span>
                  </Label>
                  <p className="text-sm text-gray-400">Automatically play videos in feed and stories</p>
                </div>
                <Switch
                  id="autoplay-videos"
                  checked={settings.autoplayVideos}
                  onCheckedChange={(checked) => handleSettingChange("autoplayVideos", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-quality-uploads" className="text-white">
                    High Quality Uploads
                  </Label>
                  <p className="text-sm text-gray-400">Upload photos and videos in higher quality</p>
                </div>
                <Switch
                  id="high-quality-uploads"
                  checked={settings.highQualityUploads}
                  onCheckedChange={(checked) => handleSettingChange("highQualityUploads", checked)}
                  className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-700"
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Shield className="w-5 h-5 text-orange-500" />
                <span>Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
          <Button
            type="submit"
            onClick={handleSaveChanges}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isUpdating}
          >
            {isUpdating ? <LoadingSpinner className="text-white" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
