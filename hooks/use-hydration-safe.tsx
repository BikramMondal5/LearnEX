"use client"

import { useState, useEffect, ReactNode } from 'react'

/**
 * A hook that returns true when the component has mounted on the client
 * Useful for avoiding hydration errors with components that use browser APIs
 */
export function useHydrationSafe() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  return isMounted
}

/**
 * A component that only renders its children on the client side
 * Useful for avoiding hydration errors with components that use browser APIs
 */
export function HydrationSafe({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode, 
  fallback?: ReactNode 
}) {
  const isMounted = useHydrationSafe()
  
  if (!isMounted) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
} 