"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText, Video, Download, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { pinByHash, isValidIPFSCid } from "@/lib/pinning-service"

interface ContentViewerProps {
  contentHash: string
  title: string
  type: string
  onClose: () => void
}

export default function ContentViewer({ contentHash, title, type, onClose }: ContentViewerProps) {
  const { currentAccount, connect, isConnecting } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [isValidIpfs, setIsValidIpfs] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [secureContentUrl, setSecureContentUrl] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState(false)

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

  useEffect(() => {
    const initializeContent = async () => {
      try {
        setIsLoading(true)
        setAuthError(null)
        
        if (!currentAccount) {
          toast({
            title: "Wallet Not Connected",
            description: "Please connect your wallet to view this content.",
            variant: "destructive",
          })
          return;
        }
        
        console.log("Initializing content with hash:", contentHash);
        
        // Check if the hash is valid
        if (!contentHash) {
          setAuthError("Missing content hash");
          return;
        }
        
        // Validate the IPFS hash and prepare for direct access
        const isValidCid = isValidIPFSCid(contentHash)
        console.log("Is valid CID:", isValidCid);
        setIsValidIpfs(isValidCid)
        
        if (!isValidCid) {
          setAuthError("Invalid content hash format");
          return;
        }
        
        try {
          // Extract the CID from the content hash
          const normalizedHash = contentHash.startsWith('ipfs://') 
            ? contentHash.substring(7) 
            : contentHash;
          
          // Generate direct URL to IPFS gateway
          const directUrl = `https://gateway.ipfs.io/ipfs/${normalizedHash}`;
          console.log("Generated direct URL:", directUrl);
          setSecureContentUrl(directUrl);
          
          // For PDFs, we'll use our custom viewer with AI assistant
          // The URL is still set for other components to use
        } catch (error) {
          console.error("Content access error:", error);
          setAuthError("Failed to access content. Please try again.");
          toast({
            title: "Error Accessing Content",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error initializing content:", err);
        toast({
          title: "Error",
          description: "Failed to initialize content viewer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeContent()
  }, [contentHash, title, type, currentAccount])

  const handleConnect = async () => {
    try {
      // If MetaMask isn't installed, redirect to download page
      if (!hasMetaMask) {
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
          return;
        } else {
          // Redirect to MetaMask website for browser extension
          window.open("https://metamask.io/download/", "_blank");
          toast({
            title: "MetaMask Required",
            description: "Please install the MetaMask extension and refresh this page.",
          });
          return;
        }
      }
      
      // If MetaMask is installed, proceed with connection
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect your wallet. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleSignIn = () => {
    // Redirect to sign in page
    window.location.href = `/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`
  }

  const handleOpenInChrome = () => {
    if (secureContentUrl) {
      window.open(secureContentUrl, "_blank")
      toast({
        title: "Content Opened",
        description: `${type.toUpperCase()} is now open in a new tab.`,
      })
    }
  }

  const handleDownloadContent = async () => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to download this content.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDownloading(true)
      
      if (isValidIpfs) {
        // Get the normalized hash
        const normalizedHash = contentHash.startsWith('ipfs://') 
          ? contentHash.substring(7) 
          : contentHash;
        
        // Fetch directly from IPFS gateway
        const response = await fetch(`https://gateway.ipfs.io/ipfs/${normalizedHash}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Determine the file extension based on the content type
        let fileExtension = '.txt'
        if (type === 'pdf') {
          fileExtension = '.pdf'
        } else if (type === 'video') {
          fileExtension = '.mp4'
        }
        
        // Create a download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${fileExtension}`
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
        
        toast({
          title: "Download Started",
          description: "Your content is being downloaded.",
        })
      }
    } catch (err) {
      console.error("Error downloading content:", err)
      toast({
        title: "Download Failed",
        description: "Failed to download content. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePinContent = async () => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to save this content.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPinning(true)
      
      // Pin the content using Pinata
      const success = await pinByHash(contentHash, title);
      
      if (success) {
        setIsPinned(true)
        toast({
          title: "Content Saved",
          description: "This content has been saved for offline access.",
        })
      } else {
        toast({
          title: "Saving Failed",
          description: "Failed to save content. Please try again later.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving content:", err)
      toast({
        title: "Error",
        description: "An error occurred while saving the content.",
        variant: "destructive",
      })
    } finally {
      setIsPinning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-white flex items-center">
          {type === "pdf" ? (
            <FileText className="mr-2 h-5 w-5 text-purple-400" />
          ) : type === "video" ? (
            <Video className="mr-2 h-5 w-5 text-purple-400" />
          ) : (
            <FileText className="mr-2 h-5 w-5 text-purple-400" />
          )}
          {title}
        </h2>
        
        {isLoading ? (
          <div className="flex py-6 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-white">Loading content...</span>
          </div>
        ) : !currentAccount ? (
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              {!hasMetaMask 
                ? "You need MetaMask to view this content."
                : "Please connect your wallet to view this content."}
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="cursor-style"
                size="default"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting 
                  ? "Connecting..." 
                  : !hasMetaMask
                    ? `Install MetaMask${isMobileDevice ? " App" : ""}`
                    : `Connect ${isMobileDevice ? "Mobile " : ""}Wallet`}
              </Button>
              
              {!hasMetaMask && (
                <div className="rounded-md bg-slate-800/70 p-3 mt-2 text-xs text-slate-300">
                  <p className="mb-1">
                    {isMobileDevice
                      ? "You'll be redirected to the app store to install MetaMask."
                      : "You'll be redirected to the MetaMask website to install the browser extension."}
                  </p>
                  <p>After installation, please return to this page and refresh.</p>
                </div>
              )}
              
              {isMobileDevice && hasMetaMask && (
                <p className="text-xs text-center text-purple-300 mt-1">
                  Your mobile wallet app will open automatically
                </p>
              )}
              
              <Button 
                variant="outline"
                size="default"
                className="w-full mt-2"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        ) : authError ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-900/20 p-3 border border-red-900/40">
              <p className="text-sm text-white/80">
                {authError}
              </p>
            </div>
            <Button 
              variant="outline"
              size="default"
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/80">
              {type === "pdf" 
                ? "PDF opened in new tab. Click below if it didn't open automatically."
                : type === "video"
                ? "View or download your video content."
                : "View or download your content."}
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="cursor-style"
                size="default"
                className="w-full"
                onClick={handleOpenInChrome}
                disabled={!secureContentUrl}
              >
                {type === "pdf" ? (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Open in Browser
                  </>
                ) : type === "video" ? (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    View Video
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    View Content
                  </>
                )}
              </Button>
              
              <Button 
                variant="gradient-purple"
                size="default"
                className="w-full"
                onClick={handleDownloadContent}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download to Device"}
              </Button>
              
              {isValidIpfs && (
                <Button 
                  variant="gradient-subtle"
                  size="default"
                  className="w-full"
                  onClick={handlePinContent}
                  disabled={isPinned || isPinning}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isPinned ? "Saved Successfully" : isPinning ? "Saving..." : "Save for Offline"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 