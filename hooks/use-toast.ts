"use client"

import * as React from "react"

import type { ToastAction } from "@/components/ui/toast"
import { useToast as useShadcnToast } from "@/components/ui/use-toast"

// This hook is provided by shadcn/ui's toaster component.
// It's typically imported from "@/components/ui/use-toast" or similar.
// No custom implementation needed unless specifically requested to modify shadcn's default.
// Assuming it's already available and correctly configured.

export function useToast() {
  const { toast } = useShadcnToast()

  const showToast = React.useCallback(
    ({
      title,
      description,
      variant,
      action,
    }: {
      title: string
      description?: string
      variant?: "default" | "destructive"
      action?: React.ReactElement<typeof ToastAction>
    }) => {
      toast({
        title,
        description,
        variant,
        action,
      })
    },
    [toast],
  )

  return { toast: showToast }
}
