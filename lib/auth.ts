import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyMessage } from 'ethers';

declare module 'next-auth' {
  interface User {
    address: string;
  }
  
  interface Session {
    user: User & {
      address: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Wallet',
      credentials: {
        address: { label: 'Wallet Address', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) {
          return null;
        }

        try {
          // Verify the signature
          const recoveredAddress = verifyMessage(
            'Sign in with your wallet to LearnEX',
            credentials.signature
          );

          if (recoveredAddress.toLowerCase() !== credentials.address.toLowerCase()) {
            return null;
          }

          return {
            id: credentials.address,
            address: credentials.address,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}; 