"use client"

import { ReactNode } from "react"
import { useHydrationSafe } from "@/hooks/use-hydration-safe"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ClientOnly component ensures that the children are only rendered on the client side.
 * This helps prevent hydration errors when components use browser-specific APIs.
 * 
 * @param children The components to render only on the client
 * @param fallback Optional fallback UI to show during server-side rendering
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isMounted = useHydrationSafe()

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 