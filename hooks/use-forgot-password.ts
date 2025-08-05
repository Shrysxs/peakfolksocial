"use client"

import { useMutation } from "@tanstack/react-query"
import { sendPasswordResetEmail as sendPasswordResetEmailService } from "@/lib/firebase-services"
import { toast } from "sonner"

export default function useForgotPassword() {
  const {
    mutate: sendResetEmail,
    isPending: loading,
    error,
  } = useMutation({
    mutationFn: (email: string) => sendPasswordResetEmailService(email),
    onSuccess: () => {
      toast.success("Password reset email sent! Check your inbox.")
    },
    onError: (err) => {
      toast.error(`Failed to send reset email: ${err.message}`)
    },
  })

  return {
    sendResetEmail,
    loading,
    error,
  }
}
