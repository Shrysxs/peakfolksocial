/**
 * Centralised error-handling helpers for the whole app.
 * It is deliberately tiny so it can be imported in any
 * environment (server / client) without side-effects.
 */

import { toast } from 'sonner'

// Production error handler - no console logs in production
export const handleError = (error: unknown, context: string, showToast = true) => {
  // In production, we would send errors to a monitoring service
  // For now, we'll just handle them gracefully
  
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  
  if (showToast) {
    toast.error(errorMessage)
  }
  
  // Log to monitoring service in production (replace with your service)
  if (process.env.NODE_ENV === 'development') {
    // Only log in development
    console.error(`[Peakfolk] [${context}]`, error)
  }
  
  return errorMessage
}

// Handle chunk load errors specifically
export const handleChunkLoadError = (error: Error) => {
  console.error('Chunk load error detected:', error)
  
  // Check if it's a chunk loading error
  if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
    toast.error('Loading error detected. Reloading page...')
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    
    return true
  }
  
  return false
}

// Handle network errors
export const handleNetworkError = (error: Error) => {
  if (error.message.includes('Network Error') || error.message.includes('fetch')) {
    toast.error('Network connection issue. Please check your internet connection.')
    return true
  }
  
  return false
}

// Firestore specific error handler
export const handleFirestoreError = (error: unknown, operation: string) => {
  const errorMessage = error instanceof Error ? error.message : 'Database operation failed'
  
  // Check for specific Firestore errors
  if (error instanceof Error) {
    if (error.message.includes('permission-denied')) {
      toast.error('Access denied. Please check your permissions.')
      return errorMessage
    }
    
    if (error.message.includes('unavailable')) {
      toast.error('Service temporarily unavailable. Please try again.')
      return errorMessage
    }
  }
  
  toast.error(`Failed to ${operation}. Please try again.`)
  
  if (process.env.NODE_ENV === 'development') {
    console.error("Firestore Error:", error)
  }
  
  return errorMessage
}

// Auth specific error handler
export const handleAuthError = (error: unknown, operation: string) => {
  let userMessage = 'Authentication failed'
  
  if (error instanceof Error) {
    switch (error.message) {
      case 'auth/user-not-found':
        userMessage = 'User not found'
        break
      case 'auth/wrong-password':
        userMessage = 'Incorrect password'
        break
      case 'auth/email-already-in-use':
        userMessage = 'Email already registered'
        break
      case 'auth/weak-password':
        userMessage = 'Password is too weak'
        break
      case 'auth/invalid-email':
        userMessage = 'Invalid email address'
        break
      case 'auth/too-many-requests':
        userMessage = 'Too many attempts. Please try again later'
        break
      case 'auth/network-request-failed':
        userMessage = 'Network error. Please check your connection'
        break
      case 'auth/popup-closed-by-user':
        userMessage = 'Sign-in cancelled'
        break
      case 'auth/popup-blocked':
        userMessage = 'Pop-up blocked. Please allow pop-ups for this site'
        break
      default:
        userMessage = `Failed to ${operation}`
    }
  }
  
  toast.error(userMessage)
  
  if (process.env.NODE_ENV === 'development') {
    console.error("Auth Error:", error)
  }
  
  return userMessage
}

// Storage specific error handler
export const handleStorageError = (error: unknown, operation: string) => {
  const errorMessage = error instanceof Error ? error.message : 'File operation failed'
  
  if (error instanceof Error) {
    if (error.message.includes('unauthorized')) {
      toast.error('Access denied. Please check your permissions.')
      return errorMessage
    }
    
    if (error.message.includes('quota-exceeded')) {
      toast.error('Storage quota exceeded. Please free up space.')
      return errorMessage
    }
  }
  
  toast.error(`Failed to ${operation}. Please try again.`)
  
  if (process.env.NODE_ENV === 'development') {
    console.error("Storage Error:", error)
  }
  
  return errorMessage
}

// Generic error handler for unknown errors
export const handleGenericError = (error: unknown, fallbackMessage = 'Something went wrong') => {
  const errorMessage = error instanceof Error ? error.message : fallbackMessage
  
  // Try to handle specific error types first
  if (error instanceof Error) {
    if (handleChunkLoadError(error)) return errorMessage
    if (handleNetworkError(error)) return errorMessage
  }
  
  toast.error(errorMessage)
  
  if (process.env.NODE_ENV === 'development') {
    console.error("Generic Error:", error)
  }
  
  return errorMessage
}

// Retry function with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}
