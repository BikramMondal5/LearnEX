# 🎓 LearnEX - Decentralized Study Library

A decentralized library for buying and selling educational materials using blockchain technology.

## 🔍 Overview

LearnEX allows creators to list educational materials on the blockchain and earn cryptocurrency when users purchase their content. All content is stored on IPFS for decentralized, censorship-resistant hosting.

## ✨ Features

- 📚 List educational materials with title, description, category, and price
- 🗃️ Upload content files to IPFS
- 🤖 LearnEX smart pdf assistant to get instant answer, summaries, translation, suggest relevant YouTube videos within the pdf
- 🔄 Interactive 3D thumbnails for different subject categories
- 💰 Purchase materials using cryptocurrency
- 📖 View purchased materials
- 💲 Platform fee system for sustainability
- 🛠️ Deploy your own contracts with step-by-step guide and video tutorials
- 🔍 EDU Chain Explorer for tracking transactions and contract interactions
- 🏢 Organizations can leverage our platform to deploy their private smart contract

## ❓ Why It Matters

This platform empowers creators, promotes decentralization, and ensures censorship-resistant access to education.

It's not just a project—it's a step toward #EducationForAll 🌍

## 💻 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS ⚛️
- **Blockchain**: Ethereum-compatible networks (currently deployed on edu-chain) 🔗
- **Storage**: IPFS via Pinata 📂
- **Web3 Integration**: ethers.js 🌐

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask wallet
- Pinata account for IPFS storage

### ⚙️ Installation

1. Clone the repository:

   ```
   git clone https://github.com/Rakesh-ada/LearnEX.git
   cd study-marketplace
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:

   ```
   cp .env.example .env.local
   ```

4. Update the `.env.local` file with your contract address and Pinata API keys:

   ```
   # Contract Information
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B
   NEXT_PUBLIC_CHAIN_ID=656476  # edu-chain network ID

   # IPFS Configuration
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
   NEXT_PUBLIC_PLATFORM_FEE_PERCENT=2.5
   ```

### 🔄 Deployment to GitHub

If you plan to deploy this project to GitHub Pages or use GitHub Actions for CI/CD, follow these steps:

1. Go to your GitHub repository settings

2. Navigate to "Secrets and variables" > "Actions"

3. Add the following repository secrets:

   * `NEXT_PUBLIC_PINATA_API_KEY` - Your Pinata API key
   * `NEXT_PUBLIC_PINATA_API_SECRET` - Your Pinata API secret
   * `NEXT_PUBLIC_PINATA_JWT` - Your Pinata JWT token

4. (Optional) If you're using GitHub Pages, make sure to configure your workflow to set these environment variables during the build process:

   ```yaml
   env:
     NEXT_PUBLIC_PINATA_API_KEY: ${{ secrets.NEXT_PUBLIC_PINATA_API_KEY }}
     NEXT_PUBLIC_PINATA_API_SECRET: ${{ secrets.NEXT_PUBLIC_PINATA_API_SECRET }}
     NEXT_PUBLIC_PINATA_JWT: ${{ secrets.NEXT_PUBLIC_PINATA_JWT }}
     NEXT_PUBLIC_CONTRACT_ADDRESS: "0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B"
     NEXT_PUBLIC_CHAIN_ID: "656476"
     NEXT_PUBLIC_PLATFORM_FEE_PERCENT: "2.5"
   ```

### 📝 Smart Contract Deployment

You have two options for deploying the smart contract:

#### Option 1: Use the Default Contract ✅

The contract is currently deployed at address `0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B` on the edu-chain network.

#### Option 2: Deploy Your Own Contract 🛠️

1. Navigate to the "Organization" tab in the application
2. Select the "Deployment Guide" tab
3. Follow the step-by-step instructions:

   * Prepare your contracts (StudyMarketplace.sol or SchoolLibrary.sol)
   * Open Remix IDE
   * Create & compile the smart contract
   * Deploy with MetaMask
   * Copy the contract address to use in the application
4. Watch the embedded video tutorial for detailed guidance
5. Get test ETH from the [EDU-Chain HackQuest Faucet](https://www.hackquest.io/faucets/656476) before deploying

After deployment, update the contract address in your `.env.local` file.

### 🏃‍♂️ Running the Application

```
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📚 Usage

### 1. For Content Creators 👨‍🏫👩‍🏫

1. Connect your wallet to the edu-chain network
2. Navigate to "Upload Material"
3. Fill in the details and upload your content
4. Set a price and list your material

### 2. For Learners 👨‍🎓👩‍🎓

1. Connect your wallet to the edu-chain network
2. Browse available materials
3. Purchase materials you're interested in
4. Access your purchased materials in "My Library"

### 3. For Organizations 🏢

1. Connect your wallet to the edu-chain network
2. Navigate to the "Organization" tab
3. Deploy your own contract or explore existing contracts
4. View transactions, contract information, and analytics
5. Verify your contract on the EDU Chain explorer

## 📁 Project Structure

* `/app` - Next.js app router pages and components
* `/components` - React components
* `/contracts` - Smart contract code and deployment guide
* `/hooks` - Custom React hooks
* `/lib` - Utility functions and blockchain interactions
* `/public` - Static assets
* `/styles` - Global CSS styles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the `MIT License` - see the LICENSE file for details.