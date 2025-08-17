"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MountainIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"
import { checkUsernameExists } from "@/lib/firebase-services" // Import the new service function
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null) // Firebase ConfirmationResult

  const { register, signInWithGoogle, signInWithPhone, confirmPhoneCode, loading } = useAuth()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    try {
      const usernameExists = await checkUsernameExists(username) // Use the new service function
      if (usernameExists) {
        toast.error("Username already exists. Please choose a different one.")
        return
      }
      await register(email, password, username)
      router.push("/login")
    } catch (error) {
      // Error handled by useAuth hook
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      // Error handled by useAuth hook
    }
  }

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signInWithPhone(phoneNumber)
      if (result) {
        setConfirmationResult(result)
        setShowOtpInput(true)
      }
    } catch (error) {
      // Error handled by useAuth hook
    }
  }

  const handleOtpConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmationResult) {
      toast.error("No OTP request initiated.")
      return
    }
    try {
      await confirmPhoneCode(confirmationResult, otp)
    } catch (error) {
      // Error handled by useAuth hook
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <MountainIcon className="mx-auto h-16 w-16 text-orange-500 mb-4" />
          <CardTitle className="text-3xl font-bold text-orange-500">Join Peakfolk</CardTitle>
          <CardDescription className="text-gray-400">Create your account to start your adventure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email/Password Register */}
          <form onSubmit={handleEmailRegister} className="space-y-4" aria-busy={loading} aria-live="polite">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="peakexplorer"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading} aria-busy={loading}>
              {loading ? <LoadingSpinner className="text-white" /> : "Register"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-orange-500 text-orange-500 hover:bg-orange-900 hover:text-white bg-transparent"
              onClick={handleGoogleRegister}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <LoadingSpinner className="text-orange-500" /> : "Register with Google"}
            </Button>
          </div>

          {/* Phone Register */}
          <div className="space-y-3">
            {!showOtpInput ? (
              <form onSubmit={handlePhoneSignIn} className="space-y-3" aria-busy={loading}>
                <div className="grid gap-2">
                  <Label htmlFor="phone-register" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone-register"
                    type="tel"
                    placeholder="+91 9876543210"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? <LoadingSpinner className="text-white" /> : "Send OTP"}
                </Button>
                <div id="recaptcha-container"></div> {/* reCAPTCHA container */}
              </form>
            ) : (
              <form onSubmit={handleOtpConfirm} className="space-y-3" aria-busy={loading}>
                <div className="grid gap-2">
                  <Label htmlFor="otp-register" className="text-white">
                    OTP
                  </Label>
                  <Input
                    id="otp-register"
                    type="text"
                    placeholder="Enter OTP"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? <LoadingSpinner className="text-white" /> : "Verify OTP"}
                </Button>
              </form>
            )}
          </div>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-orange-500 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
