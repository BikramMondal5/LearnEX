# LearnEx Smart Contracts

This directory contains the smart contracts for the LearnEx platform. These contracts allow the creation of decentralized educational material marketplaces.

## Contract Types

### 1. StudyMarketplace.sol

The standard marketplace contract that allows anyone to upload and list their educational materials. Users can purchase these materials using cryptocurrency.

### 2. SchoolLibrary.sol

A restricted version of the marketplace where only the contract owner (administrator) can upload materials. This is ideal for schools or educational institutions that want to control the content being published.

## Key Differences

| Feature | StudyMarketplace | SchoolLibrary |
| ------- | --------------- | ------------ |
| Upload permissions | Any user | Admin only |
| Material ownership | Creator owns material | Admin owns all materials |
| Revenue distribution | Split between creator and platform | All goes to the school (admin) |
| Purchase workflow | Same for both | Same for both |

## Deployment Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Truffle](https://www.trufflesuite.com/truffle) or [Hardhat](https://hardhat.org/)
- [MetaMask](https://metamask.io/) wallet with Sepolia testnet ETH

### Deploying SchoolLibrary Contract

1. Choose the network to deploy to (recommended: Sepolia testnet for testing)
2. Compile the contract:
   ```
   npx hardhat compile
   ```
3. Deploy the contract with your wallet address as the administrator:
   ```
   npx hardhat run --network sepolia scripts/deploy-school-library.js
   ```

### Using the SchoolLibrary Contract

1. The administrator (the wallet address used during deployment) can:
   - Upload new educational materials
   - Update material details
   - Remove materials
   - Change pricing

2. Students or other users can:
   - Browse the library
   - Purchase access to materials
   - Access materials they've purchased

## ABI Compatibility

Both contracts maintain the same ABI (Application Binary Interface), which means they can both work with the LearnEx application without any code changes. The application automatically detects which contract type it's interacting with and adjusts the UI accordingly.

## Integration with LearnEx

When connecting to either contract type, the LearnEx platform will:

1. Check if the connected wallet has upload permission
2. If using SchoolLibrary, only enable the upload functionality for the administrator
3. Display appropriate messages to users based on their permissions

## Technical Details

- The SchoolLibrary contract uses the `isApprovedCreator` function to determine if an address can upload materials
- Upload restrictions are enforced at the contract level with `require` statements
- Both contracts emit the same events for compatibility with the frontend 