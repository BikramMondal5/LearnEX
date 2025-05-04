# Fixing Pinata API Authentication Issue

The error message `AxiosError: Request failed with status code 401` indicates that your application is receiving an "Unauthorized" response when trying to connect to the Pinata API. Here's how to fix this issue:

## 1. Create a Pinata Account

If you don't already have a Pinata account:

1. Go to [Pinata.cloud](https://www.pinata.cloud/)
2. Sign up for an account
3. Verify your email address

## 2. Generate API Keys

1. Log in to your Pinata account
2. Go to the dashboard and click on "API Keys" in the left sidebar
3. Click "New Key"
4. Select the following permissions:
   - ✅ pinFileToIPFS
   - ✅ pinJSONToIPFS
   - ✅ unpin
   - ✅ pinPolicy updates
   - ✅ userPinPolicy reads
5. Give your key a name (e.g., "StudyMarketplace")
6. Click "Create Key"

## 3. Save Your API Keys

After creating the key, Pinata will show you:
- API Key
- API Secret
- JWT

**Important:** Copy all three of these values immediately - you won't be able to see the API Secret again!

## 4. Add Credentials to Your Environment

1. Open the `.env.local` file in your project's root directory
2. Update the following lines with your actual credentials:

```
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret_here
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
```

For example:
```
NEXT_PUBLIC_PINATA_API_KEY=a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_PINATA_API_SECRET=k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Restart Your Application

After setting up the environment variables:

1. Save the `.env.local` file
2. Stop your development server if it's running
3. Start the development server again:
   ```
   npm run dev
   ```

## 6. Testing

1. Go to the Upload page in your application
2. Try uploading a file
3. The 401 error should no longer appear, and your file should be successfully pinned to IPFS

## Troubleshooting

If you're still experiencing issues:

1. **Check your API key permissions:** Make sure you selected at least `pinFileToIPFS` when creating the key.
2. **Verify your JWT:** The application currently uses the JWT for authentication. Make sure you copied it correctly.
3. **Check for typos:** Even a small error in copying the keys can cause authentication to fail.
4. **API key limits:** Check if you've reached any API usage limits on your Pinata plan.
5. **Network issues:** Make sure your development environment can reach Pinata's API servers.

## Note on Environment Variables in Next.js

In Next.js, any environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. For a production application, you might want to move the API Secret to a server-side environment variable and implement a server API route to handle uploading to Pinata. However, for development and testing, the current setup is acceptable. 