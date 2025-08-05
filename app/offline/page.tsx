import { WifiOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
      <WifiOff className="h-24 w-24 text-orange-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">You&apos;re Offline</h1>
      <p className="text-lg text-gray-300 mb-8">
        It looks like you&apos;re not connected to the internet. Please check your connection and try again.
      </p>
      <Link href="/feed">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
          Try Again
        </Button>
      </Link>
    </div>
  )
}
