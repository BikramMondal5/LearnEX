import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "LearnEX - Contract Bytecode Help",
  description: "How to get the bytecode for your smart contract",
};

export default function BytecodeHelpPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Getting Contract Bytecode</h1>
        <p className="text-lg text-gray-300">
          A step-by-step guide to obtaining the bytecode for the StudyMarketplace contract
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why do you need the bytecode?</h2>
          <p className="mb-4">
            The bytecode is the compiled version of your smart contract that gets deployed 
            to the blockchain. It's a long hexadecimal string that represents the executable 
            instructions for the Ethereum Virtual Machine (EVM).
          </p>
          <p>
            Before you can deploy a contract from your application, you need to provide the 
            complete bytecode. Our current implementation has a placeholder that needs to be 
            replaced with the actual bytecode for the StudyMarketplace contract.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Method 1: Using Remix IDE (Recommended)</h2>
          <div className="space-y-6 ml-4">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 1: Open Remix IDE</h3>
              <p>Go to <a href="https://remix.ethereum.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">https://remix.ethereum.org</a></p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 2: Create a new file</h3>
              <p>Create a new file called <code className="bg-slate-800 px-2 py-1 rounded">StudyMarketplace.sol</code> and paste the entire contract code from your codebase.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 3: Compile the contract</h3>
              <p>Click on the Solidity Compiler tab (the second icon in the sidebar), select the appropriate compiler version (0.8.20), and click "Compile StudyMarketplace.sol".</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 4: Get the bytecode</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>After compilation, click on "Compilation Details" button</li>
                <li>In the popup, locate the "Bytecode" section</li>
                <li>Find the "object" field - this is your full bytecode</li>
                <li>Click the copy icon to copy the entire bytecode string (it starts with "0x")</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 5: Update your code</h3>
              <p>Open the file <code className="bg-slate-800 px-2 py-1 rounded">lib/contract-bytecode.ts</code> in your project and replace the placeholder with your full bytecode:</p>
              <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto text-sm">
                <code className="text-green-300">// StudyMarketplace contract bytecode{'\n'}export const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50..."; // Replace with your full bytecode</code>
              </pre>
              <p className="text-amber-400 mt-2">Important: Make sure to include the entire bytecode without any breaks or truncation.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Method 2: Using Hardhat</h2>
          <div className="space-y-6 ml-4">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 1: Set up Hardhat project</h3>
              <p>If you haven't already, install Hardhat and set up a project:</p>
              <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto text-sm">
                <code>npm install --save-dev hardhat{'\n'}npx hardhat</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 2: Add your contract</h3>
              <p>Copy your StudyMarketplace.sol file to the contracts directory in your Hardhat project.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 3: Compile the contract</h3>
              <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto text-sm">
                <code>npx hardhat compile</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-medium">Step 4: Extract the bytecode</h3>
              <p>Create a script to extract the bytecode:</p>
              <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto text-sm">
                <code>
                  {`// scripts/getBytecode.js
const fs = require('fs');
const path = require('path');

// Path to the compiled contract JSON file
const artifactPath = path.join(
  __dirname, 
  '../artifacts/contracts/StudyMarketplace.sol/StudyMarketplace.json'
);

// Read the file
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath));

// Extract and log the bytecode
console.log(contractArtifact.bytecode);`}
                </code>
              </pre>
              <p>Run the script to get the bytecode:</p>
              <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto text-sm">
                <code>node scripts/getBytecode.js</code>
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Having Problems?</h2>
          <p className="mb-4">
            If you're encountering issues with your contract deployment, ensure that:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>The bytecode string is complete (not truncated)</li>
            <li>The bytecode starts with "0x"</li>
            <li>The contract code version matches the compiled bytecode</li>
            <li>You're connected to a test network with enough ETH for gas</li>
          </ul>
        </section>

        <div className="mt-8 flex justify-center">
          <Link href="/organization">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Return to Organization Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 