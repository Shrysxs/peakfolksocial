"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download } from "lucide-react"

declare global {
  interface Window {
    deferredPrompt: any
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        // PWA installation accepted
      } else {
        // PWA installation dismissed
      }
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className="glass-card sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Install Peakfolk App</DialogTitle>
          <DialogDescription className="text-gray-300">
            Add Peakfolk to your home screen for a faster, more immersive experience!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Download className="h-16 w-16 text-orange-500 animate-bounce-slow" />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-white border-gray-700 hover:bg-gray-700 bg-transparent"
          >
            Not now
          </Button>
          <Button onClick={handleInstallClick} className="bg-orange-600 hover:bg-orange-700 text-white">
            Install App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
