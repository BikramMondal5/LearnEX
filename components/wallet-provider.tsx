"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"

interface WalletContextType {
  currentAccount: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

export const WalletContext = createContext<WalletContextType>({
  currentAccount: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
})

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0])
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setCurrentAccount(null)
        } else {
          setCurrentAccount(accounts[0])
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setIsConnecting(true)
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setCurrentAccount(accounts[0])
      } catch (error) {
        console.error("Error connecting wallet:", error)
      } finally {
        setIsConnecting(false)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet to use this feature")
    }
  }

  const disconnect = () => {
    setCurrentAccount(null)
  }

  return (
    <WalletContext.Provider value={{ currentAccount, connect, disconnect, isConnecting }}>{children}</WalletContext.Provider>
  )
}

