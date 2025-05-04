'use client';

import { useWallet } from '@/hooks/use-wallet';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const { currentAccount, signMessage } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (currentAccount) {
      handleSignIn();
    }
  }, [currentAccount]);

  const handleSignIn = async () => {
    try {
      if (!currentAccount || !signMessage) {
        return;
      }

      const message = 'Sign in with your wallet to LearnEX';
      const signature = await signMessage(message);

      const result = await signIn('credentials', {
        address: currentAccount,
        signature,
        redirect: false,
      });

      if (result?.error) {
        console.error('Sign in error:', result.error);
        return;
      }

      router.push('/');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to LearnEX
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your wallet to access your content
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSignIn}
            disabled={!currentAccount}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentAccount ? 'Sign in with Wallet' : 'Connect Wallet First'}
          </button>
        </div>
      </div>
    </div>
  );
} 