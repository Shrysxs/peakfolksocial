'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface ErrorState {
  error: Error | null
  retryCount: number
  isLoading: boolean
}

interface UseErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  showToast?: boolean
  onError?: (error: Error) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    onError
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    retryCount: 0,
    isLoading: false
  })

  const handleError = useCallback((error: Error, context?: string) => {
    const errorMessage = error.message || 'An unexpected error occurred'
    
    setErrorState(prev => ({
      ...prev,
      error,
      retryCount: prev.retryCount + 1
    }))

    if (showToast) {
      toast.error(`${context ? `${context}: ` : ''}${errorMessage}`)
    }

    onError?.(error)

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', { error, context, retryCount: errorState.retryCount })
    }
  }, [showToast, onError, errorState.retryCount])

  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (errorState.retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached. Please try again later.')
      return
    }

    setErrorState(prev => ({ ...prev, isLoading: true }))

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      const result = await operation()
      
      setErrorState({
        error: null,
        retryCount: 0,
        isLoading: false
      })

      toast.success('Operation completed successfully!')
      return result
    } catch (error) {
      handleError(error as Error, 'Retry failed')
      setErrorState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [errorState.retryCount, maxRetries, retryDelay, handleError])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      retryCount: 0,
      isLoading: false
    })
  }, [])

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      setErrorState(prev => ({ ...prev, isLoading: true }))
      const result = await operation()
      setErrorState(prev => ({ ...prev, isLoading: false }))
      return result
    } catch (error) {
      handleError(error as Error, context)
      setErrorState(prev => ({ ...prev, isLoading: false }))
      return null
    }
  }, [handleError])

  return {
    error: errorState.error,
    retryCount: errorState.retryCount,
    isLoading: errorState.isLoading,
    handleError,
    retry,
    clearError,
    withErrorHandling
  }
} 