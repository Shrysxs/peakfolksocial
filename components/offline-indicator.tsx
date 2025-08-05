"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 bg-red-600 text-white p-3 flex items-center justify-center space-x-2 z-[9999]"
        >
          <WifiOff className="h-5 w-5" />
          <span className="font-medium">You are currently offline.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
