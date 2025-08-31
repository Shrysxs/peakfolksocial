"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User as FirebaseUser, type ConfirmationResult } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { toast } from "sonner"
import {
  loginUser,
  registerUser,
  logoutUser,
  signInWithGoogle,
  signInWithPhone,
  confirmPhoneCode,
} from "@/lib/firebase-services"
import type { User as DBUser } from "@/types"

interface AuthContextType {
  currentUser: FirebaseUser | null
  dbUser: DBUser | null
  loading: boolean
  isLoading: boolean // Alias for loading
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult | null>
  confirmPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshDbUser: () => Promise<void>
  updateDbUser: (updates: Partial<DBUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [dbUser, setDbUser] = useState<DBUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If auth is somehow unavailable, don't crash the app
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          if (!db) throw new Error("Firestore not initialized")
          const userDocRef = doc(db, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            setDbUser({ id: userDocSnap.id, ...userDocSnap.data() } as DBUser)
          } else {
            setDbUser(null)
          }
        } catch (e) {
          // Swallow Firestore init errors to avoid crashing UI
          setDbUser(null)
        }
      } else {
        setDbUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      await loginUser(email, password)
      toast.success("Logged in successfully!")
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, username: string) => {
    setLoading(true)
    try {
      await registerUser(email, password, username)
      toast.success("Account created successfully!")
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await logoutUser()
      toast.info("Logged out.")
    } catch (error: any) {
      toast.error(`Logout failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const googleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success("Signed in with Google!")
    } catch (error: any) {
      toast.error(`Google sign-in failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const phoneSignIn = async (phoneNumber: string) => {
    setLoading(true)
    try {
      const result = await signInWithPhone(phoneNumber)
      if (!result) {
        toast.warning("Phone sign-in is currently unavailable. Please use email or Google login.")
        return null
      }
      toast.info("OTP sent to your phone!")
      return result
    } catch (error: any) {
      toast.error(`Phone sign-in failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const phoneCodeConfirm = async (confirmationResult: ConfirmationResult, code: string) => {
    setLoading(true)
    try {
      await confirmPhoneCode(confirmationResult, code)
      toast.success("Phone number verified!")
    } catch (error: any) {
      toast.error(`OTP verification failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    try {
      await import("@/lib/firebase-services").then(({ sendPasswordResetEmail }) => sendPasswordResetEmail(email))
      toast.success("Password reset email sent! Check your inbox.")
    } catch (error: any) {
      toast.error(`Password reset failed: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshDbUser = async () => {
    if (!currentUser) return
    try {
      const userDocRef = doc(db, "users", currentUser.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        setDbUser({ id: userDocSnap.id, ...userDocSnap.data() } as DBUser)
      }
    } catch (error: any) {
      // Error refreshing user data - could be logged to external service in production
    }
  }

  const updateDbUser = async (updates: Partial<DBUser>) => {
    if (!currentUser || !dbUser) return
    try {
      await import("@/lib/firebase-services").then(({ updateUserProfile }) => 
        updateUserProfile(currentUser.uid, updates)
      )
      setDbUser({ ...dbUser, ...updates })
    } catch (error: any) {
      // Error updating user data - could be logged to external service in production
      throw error
    }
  }

  const value = {
    currentUser,
    dbUser,
    loading,
    isLoading: loading, // Alias for loading
    login,
    register,
    logout,
    signInWithGoogle: googleSignIn,
    signInWithPhone: phoneSignIn,
    confirmPhoneCode: phoneCodeConfirm,
    resetPassword,
    refreshDbUser,
    updateDbUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
