import { MessageLoadingState } from "@/components/loading-states"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoadingPage() {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4">
      {/* Left Panel: Chat List Loading */}
      <Card className="glass-card flex-shrink-0 w-full md:w-1/3 lg:w-1/4 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-orange-500">Chats</CardTitle>
          <div className="relative mt-2">
            <Input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
              disabled
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto scrollbar-hide p-0">
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel: Chat Window Loading */}
      <Card className="glass-card flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          <MessageLoadingState />
          <MessageLoadingState />
          <MessageLoadingState />
          <MessageLoadingState />
          <MessageLoadingState />
        </CardContent>
        <div className="p-4 border-t border-gray-700 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            disabled
          />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </Card>
    </div>
  )
}
