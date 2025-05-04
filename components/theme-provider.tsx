'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useHydrationSafe } from '@/hooks/use-hydration-safe'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const isMounted = useHydrationSafe()
  
  // Only apply theme attributes on the client side to avoid hydration mismatch
  const themeProps = {
    ...props,
    // Force dark theme as default and disable system theme to avoid hydration issues
    forcedTheme: 'dark',
    enableSystem: false,
    attribute: 'data-theme' as const,
    disableTransitionOnChange: true
  }
  
  return (
    <NextThemesProvider {...themeProps}>
      {children}
    </NextThemesProvider>
  )
}
