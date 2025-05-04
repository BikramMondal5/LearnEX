"use client"

import React from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import WalletProvider from "@/components/wallet-provider"
import { ContractProvider } from "@/lib/contexts/contract-context"
import { Toaster } from "@/components/ui/toaster"
import StarBackground from "@/components/star-background"
import ClientOnly from "@/lib/client-only"
import SimpleFallback from "@/components/simple-fallback"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      <ContractProvider>
        <ClientOnly>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col bg-black">
              <ClientOnly fallback={<SimpleFallback />}>
                <StarBackground />
              </ClientOnly>
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </ClientOnly>
      </ContractProvider>
    </WalletProvider>
  )
} 