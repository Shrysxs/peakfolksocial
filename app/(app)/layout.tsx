import * as React from "react"
import { Header } from "@/components/header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Navigation } from "@/components/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="flex justify-center">
        <div className="flex w-full max-w-7xl">
          <Navigation />
          <main className="flex-1 pb-16 md:pb-0 max-w-4xl mx-auto">{children}</main>
        </div>
      </div>
      <MobileNavigation />
      {/* Toaster is already in RootLayout, no need to duplicate here unless specific to app routes */}
      {/* <Toaster /> */}
    </div>
  )
}
