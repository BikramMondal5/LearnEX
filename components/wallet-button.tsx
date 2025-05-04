"use client"

import { useState, useEffect, useRef } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown, Settings, Building, Plus, X } from "lucide-react"
import { getProfileImage } from "./navbar"
import { toast } from "@/hooks/use-toast"
import { useContract, Organization } from "@/lib/contexts/contract-context"
import { Input } from "@/components/ui/input"
import { ethers } from "ethers"

interface WalletButtonProps {
  isMobile?: boolean
  showOptions?: boolean
  fullWidth?: boolean
  variant?: "ghost" | "default" | "outline" | "secondary" | "destructive" | "gradient"
}

export default function WalletButton({ 
  isMobile = false, 
  showOptions = false,
  fullWidth = false,
  variant = "ghost"
}: WalletButtonProps) {
  const { currentAccount, connect, isConnecting } = useWallet()
  const [hasMetaMask, setHasMetaMask] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showMetaMaskInfo, setShowMetaMaskInfo] = useState(false)
  
  // Add state for dropdown menu
  const [showOrgMenu, setShowOrgMenu] = useState(false)
  const [showAddOrgForm, setShowAddOrgForm] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgAddress, setNewOrgAddress] = useState("")
  
  // Reference for the dropdown menu (to handle clicks outside)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Get contract context
  const { 
    currentContractAddress,
    organizations,
    currentOrganization,
    switchOrganization,
    addOrganization
  } = useContract()

  // Detect mobile device and MetaMask on component mount
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    
    const checkMetaMask = () => {
      return typeof window !== 'undefined' && 
        typeof window.ethereum !== 'undefined' && 
        (window.ethereum.isMetaMask || false);
    };
    
    setIsMobileDevice(checkMobile());
    setHasMetaMask(checkMetaMask());
  }, []);
  
  // Handle clicks outside the dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOrgMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConnect = async () => {
    try {
      // If MetaMask isn't installed, show installation options
      if (!hasMetaMask) {
        setShowMetaMaskInfo(true);
        return;
      }
      
      // If MetaMask is installed, proceed with connection
      await connect()
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect your wallet. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  const handleAddOrganization = () => {
    // Validate contract address
    if (!ethers.isAddress(newOrgAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid contract address.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate name
    if (!newOrgName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a name for this organization.",
        variant: "destructive",
      });
      return;
    }
    
    // Add the organization
    const newOrg: Organization = {
      name: newOrgName.trim(),
      contractAddress: newOrgAddress,
    };
    
    addOrganization(newOrg);
    switchOrganization(newOrgAddress);
    window.location.reload(); // Reload after adding and switching
    
    // Reset form and close it
    setNewOrgName("");
    setNewOrgAddress("");
    setShowAddOrgForm(false);
    
    toast({
      title: "Organization Added",
      description: `You've added ${newOrgName} and switched to it.`,
    });
  }

  const handleInstallMetaMask = () => {
    if (isMobileDevice) {
      // Check if on Android or iOS
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isAndroid = /android/i.test(userAgent.toLowerCase());
      
      if (isAndroid) {
        // Redirect to Google Play Store for MetaMask
        window.location.href = "https://play.google.com/store/apps/details?id=io.metamask";
      } else {
        // Redirect to App Store for MetaMask
        window.location.href = "https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202";
      }
    } else {
      // Redirect to MetaMask website for browser extension
      window.open("https://metamask.io/download/", "_blank");
      toast({
        title: "MetaMask Required",
        description: "Please install the MetaMask extension and refresh this page.",
      });
    }
  }

  if (currentAccount) {
    return (
      <div className="relative" ref={menuRef}>
        <Button
          variant={variant}
          className={`flex items-center ${isMobile || fullWidth ? "w-full" : ""} px-3 border border-transparent hover:border-slate-700 hover:bg-slate-900/50`}
          onClick={() => setShowOrgMenu(!showOrgMenu)}
        >
          <div className="flex items-center justify-between w-full gap-3">
            <span className="truncate">{`${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`}</span>
            <div className="flex items-center">
              <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-700 flex-shrink-0">
                <div style={getProfileImage(currentAccount)}></div>
              </div>
            </div>
          </div>
        </Button>
        
        {/* Dropdown menu */}
        {showOrgMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-lg shadow-lg z-50 overflow-hidden border border-slate-800">
            {/* User info */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-700">
                  <div style={getProfileImage(currentAccount)}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {`${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {currentOrganization?.name || "Default Organization"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Organizations */}
            <div className="p-2">
              <p className="text-xs font-medium text-slate-400 px-2 py-1">ORGANIZATIONS</p>
              <div className="mt-1 max-h-40 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.contractAddress}
                    onClick={() => {
                      switchOrganization(org.contractAddress);
                      setShowOrgMenu(false);
                      window.location.reload(); // Reload after switching org
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left rounded-md ${
                      org.contractAddress === currentContractAddress
                        ? "bg-blue-600/20 text-blue-300"
                        : "hover:bg-slate-800 text-slate-200"
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span className="flex-1 truncate">{org.name}</span>
                    {org.contractAddress === currentContractAddress && (
                      <span className="inline-flex items-center rounded-full bg-blue-600/30 px-2 py-0.5 text-xs font-medium text-blue-300">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Add organization form */}
            {showAddOrgForm ? (
              <div className="p-3 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-slate-200">Add Organization</p>
                  <button 
                    onClick={() => setShowAddOrgForm(false)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Organization Name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="h-8 text-sm bg-slate-800 border-slate-700"
                  />
                  <Input
                    placeholder="Contract Address"
                    value={newOrgAddress}
                    onChange={(e) => setNewOrgAddress(e.target.value)}
                    className="h-8 text-sm bg-slate-800 border-slate-700"
                  />
                  <Button 
                    className="w-full h-8 text-xs" 
                    onClick={handleAddOrganization}
                    disabled={!newOrgName || !newOrgAddress}
                  >
                    Add & Switch
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-2 border-t border-slate-800">
                <button
                  onClick={() => setShowAddOrgForm(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left rounded-md hover:bg-slate-800 text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Organization</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (showMetaMaskInfo && !hasMetaMask) {
    return (
      <div className={`${isMobile || fullWidth ? "w-full" : ""} space-y-2`}>
        <Button
          variant="gradient-purple"
          className={`${isMobile || fullWidth ? "w-full" : ""} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700`}
          onClick={handleInstallMetaMask}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {`Install MetaMask${isMobileDevice ? " App" : ""}`}
        </Button>
        
        {showOptions && (
          <div className="rounded-md bg-slate-800/70 p-3 text-xs text-slate-300">
            <p className="mb-1">
              {isMobileDevice
                ? "You'll be redirected to the app store to install MetaMask."
                : "You'll be redirected to the MetaMask website to install the browser extension."}
            </p>
            <p>After installation, please return to this page and refresh.</p>
            
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto text-purple-400 hover:text-purple-300"
              onClick={() => setShowMetaMaskInfo(false)}
            >
              Back to connect options
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      className={`${isMobile || fullWidth ? "w-full" : ""} ${variant === "ghost" ? "px-3 border border-violet-500/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 hover:border-violet-500/50" : ""}`}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}

