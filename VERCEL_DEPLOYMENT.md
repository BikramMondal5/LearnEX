# Vercel Deployment Guide

This document provides instructions for deploying the Study Marketplace application on Vercel.

## Prerequisites

- A [Vercel](https://vercel.com/) account
- A GitHub repository with your project code
- Pinata API Keys (API Key, Secret Key, and JWT)

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository (You may need to install the Vercel GitHub app if you haven't already)
4. Select the LearnEX repository

### 2. Configure Environment Variables

In the project settings before deployment, add the following environment variables:

1. Click on "Environment Variables" section
2. Add each of these environment variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_PINATA_API_KEY` | `your_pinata_api_key` |
   | `NEXT_PUBLIC_PINATA_API_SECRET` | `your_pinata_api_secret` |
   | `NEXT_PUBLIC_PINATA_JWT` | `your_pinata_jwt` |
   | `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B` |
   | `NEXT_PUBLIC_CHAIN_ID` | `656476` |
   | `NEXT_PUBLIC_PLATFORM_FEE_PERCENT` | `2.5` |

3. Click "Save" for each environment variable

### 3. Deploy

1. In the project settings, ensure the following:
   - Framework Preset: Next.js
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)
   - Output Directory: `.next` (default)

2. Click "Deploy"

### 4. Verify Deployment

1. Once deployed, Vercel will provide you with a URL to your application
2. Visit the URL to ensure the application is working correctly
3. Test the functionality to verify that the Pinata API integration is working

### 5. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to the "Domains" section in your project settings
2. Add your domain and follow the DNS configuration instructions provided by Vercel

## Automatic Deployments

By default, Vercel will automatically deploy any changes pushed to your GitHub repository's main branch. You can customize this behavior in the project settings.

## Troubleshooting

If you encounter issues with the deployment:

1. Check the deployment logs in Vercel dashboard
2. Verify that all environment variables are set correctly
3. Ensure that the Pinata API keys are valid
4. Check that the contract address and chain ID are correct

For more help, refer to [Vercel's documentation](https://vercel.com/docs) or open an issue in the GitHub repository. 