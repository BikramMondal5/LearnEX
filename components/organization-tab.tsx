"use client"

/**
 * EDU Chain Explorer Component
 * 
 * This component provides a blockchain explorer interface for the EDU Chain Testnet.
 * It uses the Blockscout API to fetch real blockchain data including:
 * - Contract information
 * - Transaction history
 * - Contract verification status
 * 
 * API Documentation: https://edu-chain-testnet.blockscout.com/api-docs
 * 
 * The component falls back to mock data if the API is unavailable or returns an error.
 */

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { toast } from "@/hooks/use-toast";
import { getCurrentContractAddress } from "@/lib/contract";
import { 
  Loader2, ExternalLink, Search, Clock, ArrowUpRight, ArrowDownLeft, 
  FileText, Copy, CheckCircle2, Shield, Database, Activity, 
  ChevronDown, Info, Calendar, Wallet, Hash, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import SpaceBackground from "@/components/space-background";
import ClientOnly from "@/lib/client-only";
import SimpleFallback from "@/components/simple-fallback";

// Default contract address from environment variable
const DEFAULT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B';

// Base API URL for Blockscout
const API_BASE_URL = "https://edu-chain-testnet.blockscout.com";
const API_V2_URL = `${API_BASE_URL}/api/v2`;
const CHAIN_CURRENCY = "EDU";

export default function OrganizationTab() {
  const { currentAccount, connect } = useWallet();
  
  // State for contract dashboard
  const [contractAddress, setContractAddress] = useState<string>(DEFAULT_CONTRACT_ADDRESS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [networkInfo, setNetworkInfo] = useState<{name: string, chainId: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Initialize with default contract on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddress = localStorage.getItem("currentContractAddress");
      if (savedAddress) {
        setContractAddress(savedAddress);
        fetchContractData(savedAddress);
      } else {
        fetchContractData(DEFAULT_CONTRACT_ADDRESS);
      }
    }
  }, []);
  
  // Check current network
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          
          // Map common chain IDs to network names
          const networks: {[key: string]: string} = {
            "0x1": "Ethereum Mainnet",
            "0x5": "Goerli Testnet",
            "0xa345": "EDU Chain Testnet",  // Add EDU Chain
            "0xaa36a7": "Sepolia Testnet",
            "0x89": "Polygon Mainnet",
            "0x13881": "Mumbai Testnet"
          };
          
          setNetworkInfo({
            chainId: chainId,
            name: networks[chainId] || `Chain ID: ${chainId}`
          });
        } catch (error) {
          console.error("Error getting network:", error);
        }
      }
    };
    
    checkNetwork();
  }, []);

  const fetchContractData = async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save the contract address to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("currentContractAddress", address);
      }
      
      // Fetch contract info and transactions in parallel with better error handling
      const [contractData, txs] = await Promise.all([
        fetchContractInfo(address).catch(error => {
          console.error("Contract info fetch failed:", error);
          throw new Error(`Failed to fetch contract information: ${error.message}`);
        }),
        fetchTransactions(address).catch(error => {
          console.error("Transaction fetch failed:", error);
          // Don't throw here to still display contract info even if transactions fail
          return [];
        })
      ]);
      
      setContractInfo(contractData);
      setTransactions(txs);
      
      toast({
        title: "Contract Data Loaded",
        description: `Loaded data for ${contractData.name} at ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Error fetching contract data:", error);
      setError(error.message || "Failed to fetch contract data");
      toast({
        title: "Error",
        description: error.message || "Failed to load contract data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch contract info from Blockscout API
  const fetchContractInfo = async (address: string) => {
    try {
      // Use Blockscout API v2 to fetch contract data
      const responseData = await fetch(`${API_V2_URL}/addresses/${address}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          return response.json();
        });
      
      // Use a second API call to get token balance
      const balanceResponse = await fetch(`${API_V2_URL}/addresses/${address}/coin-balance`)
        .then(response => {
          if (!response.ok) {
            return { coin_balance: "0" };
          }
          return response.json();
        });
        
      // Check if the contract is verified
      const smartContractResponse = await fetch(`${API_V2_URL}/smart-contracts/${address}`)
        .then(response => {
          if (!response.ok) {
            return { is_verified: false };
          }
          return response.json();
        })
        .catch(() => ({ is_verified: false }));
      
      // Format the balance for display
      const rawBalance = balanceResponse.coin_balance || "0";
      const formattedBalance = parseFloat(rawBalance) / 1e18; // Convert from wei to EDU
      
      // Return formatted contract info
      return {
        address: address,
        name: responseData.name || "Contract",
        creationDate: responseData.creation_tx_datetime || new Date().toISOString(),
        creationTx: responseData.creation_tx_hash,
        balance: `${formattedBalance.toFixed(4)} ${CHAIN_CURRENCY}`,
        totalTransactions: responseData.tx_count || 0,
        verified: smartContractResponse.is_verified,
        platformFee: "2.5%", // This is specific to your contract, not from API
        owner: responseData.creator_address || address,
        compiler: smartContractResponse.compiler_version,
        optimization: smartContractResponse.optimization_enabled,
        optimizationRuns: smartContractResponse.optimization_runs,
        evmVersion: smartContractResponse.evm_version,
        implementationAddress: responseData.implementation_address,
      };
    } catch (error) {
      console.error("Error fetching contract info:", error);
      
      // Fallback to mock data if API fails
      return {
        address: address,
        name: "StudyMarketplace",
        creationDate: new Date().toISOString(),
        creationTx: "0x863244f16d140d3888b6186c98b116a31e748e9ee732f764403b9aecda4bc3cc",
        balance: "0.23 EDU",
        totalTransactions: 47,
        verified: true,
        platformFee: "2.5%",
        owner: "0xCeA7c28cddC56162CC2e35c7A58b38526d303d91",
        compiler: "v0.8.17+commit.8df45f5f",
        optimization: true,
        optimizationRuns: 200,
        evmVersion: "london",
        implementationAddress: null,
      };
    }
  };
  
  // Fetch transactions from Blockscout API
  const fetchTransactions = async (address: string) => {
    try {
      // Use Blockscout API v2 to fetch transactions
      const response = await fetch(`${API_V2_URL}/addresses/${address}/transactions?filter=to%7Cfrom`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          return response.json();
        });
      
      // Process and format the transactions
      return response.items.map((tx: any) => {
        // Calculate the transaction value in EDU
        const valueInEDU = parseFloat(tx.value) / 1e18;
        
        // Determine transaction type based on method ID or to/from
        let txType = "Contract Interaction";
        let method = tx.method || "";
        
        if (tx.to === null) {
          txType = "Contract Creation";
          method = "constructor";
        } else if (method.includes("transfer")) {
          txType = "Token Transfer";
        } else if (tx.from && typeof tx.from === 'string' && typeof address === 'string' && tx.from.toLowerCase() === address.toLowerCase()) {
          txType = "Outgoing Transaction";
        } else if (tx.to && typeof tx.to === 'string' && typeof address === 'string' && tx.to.toLowerCase() === address.toLowerCase()) {
          txType = "Incoming Transaction";
        }
        
        return {
          hash: tx.hash,
          block: tx.block,
          timestamp: tx.timestamp,
          from: tx.from,
          to: tx.to,
          value: valueInEDU.toFixed(6),
          fee: ((parseFloat(tx.fee.value) || 0) / 1e18).toFixed(6),
          gasUsed: tx.gas_used,
          gasPrice: tx.gas_price,
          method: method,
          type: txType,
          status: tx.status === "ok" ? "success" : (tx.status === "pending" ? "pending" : "error"),
          confirmation: tx.confirmation_duration,
        };
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      
      // Generate mock transactions if API fails
      const mockTransactions = [];
      const txTypes = ["Material Listed", "Material Purchased", "Material Updated", "Contract Deployed"];
      const methods = ["listMaterial", "purchaseMaterial", "updateMaterial", "constructor"];
      const statuses = ["success", "error", "pending"];
      
      for (let i = 0; i < 10; i++) {
        const typeIndex = Math.floor(Math.random() * txTypes.length);
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i * 2);
        
        mockTransactions.push({
          hash: `0x${Math.random().toString(16).substring(2, 42)}`,
          block: 12345678 - i,
          timestamp: timestamp.toISOString(),
          from: i % 3 === 0 ? address : `0x${Math.random().toString(16).substring(2, 42)}`,
          to: i % 4 === 0 ? null : address,
          value: i % 2 === 0 ? (Math.random() * 0.1).toFixed(4) : "0",
          fee: (Math.random() * 0.01).toFixed(6),
          gasUsed: Math.floor(Math.random() * 2000000) + 21000,
          gasPrice: Math.floor(Math.random() * 50) + 10,
          method: methods[typeIndex],
          type: txTypes[typeIndex],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          confirmation: Math.floor(Math.random() * 30) + 1,
        });
      }
      
      return mockTransactions;
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractAddress && contractAddress.startsWith("0x") && contractAddress.length === 42) {
      fetchContractData(contractAddress);
    } else {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum contract address",
        variant: "destructive",
      });
    }
  };
  
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyAddress = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Address Copied",
      description: "Address copied to clipboard",
    });
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const formatHash = (hash: string) => {
    if (!hash) return '';
    if (hash.length <= 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  const formatAddress = (address: string | null | undefined) => {
    if (!address || typeof address !== 'string') return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };
  
  const getChainExplorerUrl = () => {
    // For this demo, always return the EDU Chain explorer
    return API_BASE_URL;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-slate-400';
    }
  };

  // Fix for the variant type
  const getBadgeVariant = (verified: boolean) => {
    // Using only the allowed variants
    return verified ? "default" : "outline";
  };

  // Update the formatValue function to properly handle Wei conversion
  const formatValue = (value: string) => {
    if (!value || value === "0") return `0 ${CHAIN_CURRENCY}`;
    
    // If the value is already formatted with currency, return it as is
    if (value.includes(CHAIN_CURRENCY)) return value;
    
    // Convert from Wei if it's a large number
    try {
      const numValue = parseFloat(value);
      // If value appears to be in Wei (very large number), convert to EDU
      if (numValue > 1e10) {
        return `${(numValue / 1e18).toFixed(6)} ${CHAIN_CURRENCY}`;
      }
      return `${numValue} ${CHAIN_CURRENCY}`;
    } catch (e) {
      return `${value} ${CHAIN_CURRENCY}`;
    }
  };

  return (
    <main className="min-h-screen">
      <ClientOnly fallback={<SimpleFallback />}>
        <SpaceBackground colorTheme="blue" shootingStars density={800} speed={0.0003} />
      </ClientOnly>
      
      {/* Main Content Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-black/50 p-8 backdrop-blur-sm shadow-xl mt-16">
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-1">EDU Chain Explorer</h1>
              <p className="text-slate-400">Explore smart contracts, transactions, and analytics on EDU Chain Testnet</p>
            </div>
            
            {/* Network indicator - Blockscout style */}
            <div className="flex items-center space-x-2 mb-8 bg-blue-900/30 border border-blue-600/30 p-3 rounded-lg text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium">
                Network: <span className="text-blue-300">EDU Chain Testnet</span>
              </span>
              {networkInfo?.chainId && (
                <span className="text-slate-400 ml-2">(Chain ID: {networkInfo.chainId})</span>
              )}
            </div>
            
            {!currentAccount ? (
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-600/30 rounded-xl p-8 mb-8">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-12 w-12 text-indigo-400 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-slate-300 mb-6 max-w-md">
                    Connect your wallet to access advanced features and interact with contracts directly
                  </p>
                  <Button 
                    onClick={handleConnectWallet}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Contract Address Search - Blockscout style */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Search Contract</h2>
                    <p className="text-sm text-slate-400">Enter a contract address to explore details and transactions</p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleAddressSubmit} className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-slate-500" />
                        </div>
                        <Input
                          className="pl-10 bg-slate-900/50 border-slate-700 rounded-lg text-sm font-mono"
                          placeholder="0x... Contract Address"
                          value={contractAddress}
                          onChange={(e) => setContractAddress(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        Explore
                      </Button>
                    </form>
                    <div className="flex mt-4 text-xs text-slate-400 items-center">
                      <Info className="h-3 w-3 mr-2" />
                      <span>
                        You can explore any contract on the {networkInfo?.name || "current"} network
                      </span>
                    </div>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center bg-slate-800/50 border border-slate-700 rounded-xl p-16">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-6" />
                    <p className="text-slate-300 text-lg">Loading contract data from EDU Chain...</p>
                    <p className="text-slate-400 text-sm mt-2">Fetching from Blockscout API</p>
                    <div className="flex flex-col items-center mt-6 text-xs text-slate-500">
                      <p>API Endpoint: {API_V2_URL}</p>
                      <p className="mt-1">Contract: {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-900/20 border border-red-800/50 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-900/50 to-red-800/30 px-6 py-4 border-b border-red-800/50">
                      <h2 className="text-xl font-bold text-red-300">EDU Chain API Error</h2>
                      <p className="text-red-200 text-sm">
                        {error}
                      </p>
                    </div>
                    <div className="p-6">
                      <p className="text-red-200">
                        Please check the contract address and ensure it exists on the EDU Chain Testnet network.
                      </p>
                      <ul className="mt-4 list-disc pl-5 text-red-200 text-sm space-y-1">
                        <li>Verify the contract address is correct</li>
                        <li>Check that you're connected to EDU Chain Testnet</li>
                        <li>The Blockscout API may be temporarily unavailable</li>
                        <li>Contract may not be deployed yet</li>
                      </ul>
                      <div className="mt-6 p-3 bg-red-900/30 rounded-md text-xs font-mono">
                        API: {API_V2_URL}<br />
                        Address: {contractAddress}
                      </div>
                    </div>
                  </div>
                ) : contractInfo ? (
                  /* Contract Info and Transactions - Blockscout style */
                  <div className="space-y-6">
                    {/* Main tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                      <div className="border-b border-slate-700">
                        <TabsList className="flex h-10 gap-4 bg-transparent p-0">
                          <TabsTrigger 
                            value="overview" 
                            className="border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none bg-transparent px-4 py-2 text-base font-medium text-slate-400 hover:text-white data-[state=active]:text-white data-[state=active]:shadow-none"
                          >
                            Overview
                          </TabsTrigger>
                          <TabsTrigger 
                            value="transactions" 
                            className="border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none bg-transparent px-4 py-2 text-base font-medium text-slate-400 hover:text-white data-[state=active]:text-white data-[state=active]:shadow-none"
                          >
                            Transactions
                          </TabsTrigger>
                          <TabsTrigger 
                            value="code" 
                            className="border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none bg-transparent px-4 py-2 text-base font-medium text-slate-400 hover:text-white data-[state=active]:text-white data-[state=active]:shadow-none"
                          >
                            Smart Contract Deployment Guide
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-6 space-y-6">
                        {/* Contract Information Card */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
                            <div>
                              <h2 className="text-xl font-bold flex items-center">
                                <Database className="h-5 w-5 mr-2 text-blue-400" />
                                Contract Information
                              </h2>
                              <p className="text-sm text-slate-400">
                                Details about the {contractInfo.name} contract
                              </p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant={getBadgeVariant(contractInfo.verified)}
                                    className={`px-3 py-1 text-xs rounded-full ${
                                      contractInfo.verified 
                                        ? "bg-green-500/10 text-green-400 border-green-500/30" 
                                        : "bg-slate-700 text-slate-300 border-slate-600"
                                    }`}
                                  >
                                    {contractInfo.verified ? "Verified" : "Unverified"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{contractInfo.verified ? "Contract source code is verified" : "Contract source code is not verified"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <div className="divide-y divide-slate-700/70">
                            {/* Address row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
                              <div className="md:col-span-1 flex items-center text-slate-400 text-sm">
                                <Hash className="h-4 w-4 mr-2" />
                                Address:
                              </div>
                              <div className="md:col-span-4 font-mono text-sm flex items-center">
                                <span className="mr-2">{contractInfo.address}</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-md hover:bg-slate-700"
                                    onClick={() => handleCopyAddress(contractInfo.address)}
                                  >
                                    {copied ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-slate-400" />
                                    )}
                                  </Button>
                                  <Link 
                                    href={`${getChainExplorerUrl()}/address/${contractInfo.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md hover:bg-slate-700"
                                    >
                                      <ExternalLink className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                            
                            {/* Balance row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
                              <div className="md:col-span-1 flex items-center text-slate-400 text-sm">
                                <Wallet className="h-4 w-4 mr-2" />
                                Balance:
                              </div>
                              <div className="md:col-span-4 font-medium">
                                {contractInfo.balance}
                              </div>
                            </div>
                            
                            {/* Contract Type row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
                              <div className="md:col-span-1 flex items-center text-slate-400 text-sm">
                                <Code className="h-4 w-4 mr-2" />
                                Contract Type:
                              </div>
                              <div className="md:col-span-4">
                                {contractInfo.name}
                              </div>
                            </div>
                            
                            {/* Deployment Date row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
                              <div className="md:col-span-1 flex items-center text-slate-400 text-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Deployed:
                              </div>
                              <div className="md:col-span-4">
                                {formatTimestamp(contractInfo.creationDate)}
                                {contractInfo.creationTx && (
                                  <div className="mt-1">
                                    <Link 
                                      href={`${getChainExplorerUrl()}/tx/${contractInfo.creationTx}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-400 hover:underline flex items-center"
                                    >
                                      <ArrowUpRight className="h-3 w-3 mr-1" />
                                      View creation transaction
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Platform Fee row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
                              <div className="md:col-span-1 flex items-center text-slate-400 text-sm">
                                <Activity className="h-4 w-4 mr-2" />
                                Platform Fee:
                              </div>
                              <div className="md:col-span-4">
                                {contractInfo.platformFee}
                              </div>
                            </div>
                            
                            {/* Fee Recipient/Owner row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 p-4 gap-4">
                              <div className="md:col-span-1 flex items-center text-slate-400 text-sm">
                                <Shield className="h-4 w-4 mr-2" />
                                Owner:
                              </div>
                              <div className="md:col-span-4 font-mono text-sm flex items-center">
                                <Link 
                                  href={`${getChainExplorerUrl()}/address/${contractInfo.owner}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-400"
                                >
                                  {contractInfo.owner}
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-md hover:bg-slate-700 ml-2"
                                  onClick={() => handleCopyAddress(contractInfo.owner)}
                                >
                                  <Copy className="h-4 w-4 text-slate-400" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Transactions Tab */}
                      <TabsContent value="transactions" className="mt-6 space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                          <div className="px-6 py-5 border-b border-slate-700">
                            <h2 className="text-xl font-bold flex items-center">
                              <Activity className="h-5 w-5 mr-2 text-blue-400" />
                              Transaction History
                            </h2>
                            <p className="text-sm text-slate-400">
                              All transactions involving this contract
                            </p>
                          </div>
                          
                          <div className="p-4">
                            <div className="space-y-3">
                              {transactions.map((tx, index) => (
                                <Link 
                                  key={index}
                                  href={`${getChainExplorerUrl()}/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <div className={`p-3 rounded-md hover:bg-slate-700/50 transition-colors flex items-center space-x-3 ${
                                    tx.status === 'error' ? 'bg-red-900/20 border border-red-800/50' : 'bg-slate-700/30'
                                  }`}>
                                    {/* Transaction icon */}
                                    <div className={`p-2 rounded-full ${
                                      tx.to === null 
                                        ? 'bg-purple-900/50' 
                                        : tx.from === contractInfo.address 
                                          ? 'bg-blue-900/50' 
                                          : 'bg-green-900/50'
                                    }`}>
                                      {tx.to === null ? (
                                        <FileText className="h-5 w-5 text-purple-400" />
                                      ) : tx.from === contractInfo.address ? (
                                        <ArrowUpRight className="h-5 w-5 text-blue-400" />
                                      ) : (
                                        <ArrowDownLeft className="h-5 w-5 text-green-400" />
                                      )}
                                    </div>
                                    
                                    {/* Transaction details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium">
                                          {tx.method || tx.type}
                                          <span className={`ml-2 text-xs ${getStatusColor(tx.status)}`}>
                                            • {tx.status}
                                          </span>
                                        </span>
                                        <span className="text-xs text-slate-400">{formatTimestamp(tx.timestamp)}</span>
                                      </div>
                                      <div className="flex items-center text-xs text-slate-400 mt-1">
                                        <span className="font-mono truncate">TX: {formatHash(tx.hash)}</span>
                                      </div>
                                      <div className="flex mt-1 text-xs">
                                        <span className="text-slate-400">
                                          {tx.from === contractInfo.address ? "From: " : "To: "}
                                          <span className="font-mono text-slate-300">
                                            {tx.from === contractInfo.address 
                                              ? formatAddress(tx.from || '') 
                                              : formatAddress(tx.to || '')}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Transaction value */}
                                    {tx.value !== "0" && (
                                      <div className="text-right whitespace-nowrap">
                                        <span className="text-sm font-medium">{formatValue(tx.value)}</span>
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                            
                            <div className="mt-4 text-center">
                              <Link 
                                href={`${getChainExplorerUrl()}/address/${contractInfo.address}/transactions`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" size="sm" className="border-slate-700 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View in Blockscout Explorer
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Code Tab */}
                      <TabsContent value="code" className="mt-6 space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                          <div className="px-6 py-5 border-b border-slate-700">
                            <h2 className="text-xl font-bold flex items-center">
                              <Code className="h-5 w-5 mr-2 text-blue-400" />
                              Smart Contract Deployment Guide
                            </h2>
                            <p className="text-sm text-slate-400">
                              Learn how to deploy your own StudyMarketplace contract on EDU Chain
                            </p>
                          </div>
                          
                          <div className="p-6">
                            <div className="space-y-6">
                              {/* Featured Video Section */}
                              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-blue-300 mb-3">Video Tutorial: Deploy Your Own Contracts</h3>
                                
                                <div className="aspect-video bg-slate-800/70 rounded-lg overflow-hidden">
                                  <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src="https://www.youtube.com/embed/pN93WdNs3HM" 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    referrerPolicy="strict-origin-when-cross-origin" 
                                    allowFullScreen
                                    className="w-full aspect-video"
                                  ></iframe>
                                </div>
                                
                                <p className="mt-4 text-slate-300">
                                  Watch the tutorial directly above or click "View on YouTube" to open in a new tab. This comprehensive guide walks you through the entire process of deploying your own StudyMarketplace contract on EDU Chain using Remix IDE.
                                </p>
                                
                                <div className="mt-4 flex">
                                  <a 
                                    href="https://youtu.be/pN93WdNs3HM" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-red-400 hover:text-red-300 transition-colors duration-200"
                                  >
                                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                                    </svg>
                                    View on YouTube
                                  </a>
                                </div>
                              </div>

                              {/* Simple Steps Summary */}
                              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-blue-300 mb-4">Quick Deployment Steps</h3>
                                
                                <div className="space-y-4">
                                  <div className="flex">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-700/50 text-blue-300 font-bold mr-3">
                                      1
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">Prepare Your Contracts</h4>
                                      <p className="text-sm text-slate-300">
                                        Select and copy the contract code from the contract options below
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-700/50 text-blue-300 font-bold mr-3">
                                      2
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">Go to Remix IDE</h4>
                                      <p className="text-sm text-slate-300">
                                        Visit <a href="https://remix.ethereum.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">remix.ethereum.org</a> in your browser
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-700/50 text-blue-300 font-bold mr-3">
                                      3
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">Create & Compile Smart Contract</h4>
                                      <p className="text-sm text-slate-300">
                                        Create a new Solidity file and paste the contract code, then compile with Solidity 0.8.17+
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-700/50 text-blue-300 font-bold mr-3">
                                      4
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">Deploy with MetaMask</h4>
                                      <p className="text-sm text-slate-300">
                                        Switch to the "Deploy & Run Transactions" tab, connect MetaMask to EDU Chain, and deploy with your wallet address as the platform fee recipient
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-700/50 text-blue-300 font-bold mr-3">
                                      5
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">Copy Contract Address</h4>
                                      <p className="text-sm text-slate-300">
                                        After deployment, copy your new contract address and paste it in the "My Contracts" tab to interact with it
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Prepare Your Contracts Section */}
                              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-blue-300 mb-4">Step 1: Prepare Your Contracts</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <h4 className="text-base font-medium text-blue-400 mb-2">StudyMarketplace.sol</h4>
                                    <p className="text-sm text-slate-300 mb-3">
                                      The main marketplace contract that enables decentralized selling and purchasing of educational materials.
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      className="w-full border-slate-600 bg-slate-800/70 hover:bg-slate-700"
                                      onClick={() => handleCopyAddress("https://github.com/Rakesh-ada/LearnEX/blob/main/contracts/StudyMarketplace.sol")}
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copy File Link
                                    </Button>
                                  </div>
                                  <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <h4 className="text-base font-medium text-blue-400 mb-2">SchoolLibrary.sol</h4>
                                    <p className="text-sm text-slate-300 mb-3">
                                      A specialized contract for school libraries with controlled access and centralized management of educational materials.
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      className="w-full border-slate-600 bg-slate-800/70 hover:bg-slate-700"
                                      onClick={() => handleCopyAddress("https://github.com/Rakesh-ada/LearnEX/blob/main/contracts/SchoolLibrary.sol")}
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copy File Link
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Contract Code Section */}
                              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-blue-300 mb-4">Step 2: Open Remix IDE</h3>
                                <p className="text-sm text-slate-300 mb-4">
                                  Click the button below to open Remix IDE in a new tab and start creating your smart contract:
                                </p>
                                
                                <div className="flex">
                                  <Button
                                    variant="outline" 
                                    className="flex-1 border-slate-600 bg-slate-800/70 hover:bg-slate-700"
                                    onClick={() => window.open("https://remix.ethereum.org/", "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Remix IDE
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Tips and Resources */}
                              <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-blue-300 mb-3">Pro Tips</h3>
                                <ul className="space-y-3 text-slate-300">
                                  <li className="flex items-start">
                                    <div className="text-blue-400 mr-2">•</div>
                                    <p>Make sure to use the <strong>same wallet</strong> for deployment and for uploading materials</p>
                                  </li>
                                  <li className="flex items-start">
                                    <div className="text-blue-400 mr-2">•</div>
                                    <p>The wallet address you use to deploy becomes the <strong>platform fee recipient</strong></p>
                                  </li>
                                  <li className="flex items-start">
                                    <div className="text-blue-400 mr-2">•</div>
                                    <p>Get test ETH from <a href="https://www.hackquest.io/faucets/656476" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">EDU-Chain HackQuest Faucet</a> before deploying</p>
                                  </li>
                                  <li className="flex items-start">
                                    <div className="text-blue-400 mr-2">•</div>
                                    <p>Watch the full video tutorial for detailed step-by-step instructions</p>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
} 