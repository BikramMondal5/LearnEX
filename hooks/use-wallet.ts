import { useState, useEffect } from 'react';
import { checkIfWalletIsConnected, connectWallet } from '@/lib/blockchain';

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const account = await checkIfWalletIsConnected();
        setCurrentAccount(account);
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
        setError('Failed to connect to wallet');
      }
    };

    checkWalletConnection();
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const account = await connectWallet();
      setCurrentAccount(account);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect to wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    // Note: MetaMask doesn't actually provide a way to disconnect programmatically
    // This just clears the local state
    setCurrentAccount(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User has disconnected their wallet
          setCurrentAccount(null);
        } else {
          setCurrentAccount(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return {
    currentAccount,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!currentAccount
  };
} 