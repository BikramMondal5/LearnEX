"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MaterialCard from "@/components/material-card"
import { FileText, Download, Lock, BookOpen, ExternalLink, Filter, ChevronDown, SortDesc, ArrowUpDown } from "lucide-react"
import Loader from "@/components/ui/cube-loader"
import { useWallet } from "@/hooks/use-wallet"
import { getMyPurchasedMaterials, getContentHash, getMyListedMaterials } from "@/lib/blockchain"
import { toast } from "@/hooks/use-toast"
import ContentViewer from "@/components/content-viewer"
import PdfViewerWithAi from "@/components/pdf-viewer-with-ai"
import SpaceBackground from "@/components/space-background"
import ClientOnly from "@/lib/client-only"
import SimpleFallback from "@/components/simple-fallback"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Add a CID validation helper function at the top of the file
const isValidCid = (cid: string): boolean => {
  // Basic CID validation - checks for common CID formats
  // CIDv0 is base58 and starts with "Qm", length ~46 chars
  // CIDv1 is base32 and starts with "b", then a digit, followed by letters/numbers
  return (
    (cid.startsWith('Qm') && cid.length >= 44 && cid.length <= 48) || 
    (/^b[a-z2-7]{58,}$/i.test(cid))
  );
};

// Function to format IPFS URLs with multiple gateway options
const formatIpfsUrl = (hash: string): string[] => {
  // Get the CID (remove ipfs:// prefix if present)
  let cid = hash;
  if (hash.startsWith('ipfs://')) {
    cid = hash.substring(7);
  }
  
  // Validate CID
  if (!isValidCid(cid)) {
    console.error('Invalid CID format:', cid);
  }
  
  // Return multiple gateway URLs with Pinata first
  return [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`
  ];
};

// Add a helper function to format dates in Indian format (DD/MM/YYYY)
const formatIndianDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export default function MyMaterialsPage() {
  const { currentAccount, connect } = useWallet()
  const [activeTab, setActiveTab] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null)
  const [purchasedMaterials, setPurchasedMaterials] = useState<any[]>([])
  const [createdMaterials, setCreatedMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentHash, setContentHash] = useState<string | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [showContentViewer, setShowContentViewer] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)

  // Fetch purchased and created materials when wallet is connected
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!currentAccount) return

      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch purchased materials
        const purchased = await getMyPurchasedMaterials()
        
        // Transform the purchased data for display
        const formattedPurchased = purchased.map((material: any) => {
          const purchaseDate = material.createdAt || new Date().toISOString();
          return {
            id: material.id.toString(),
            title: material.title,
            description: material.description,
            type: "pdf", // Default all to PDF type
            purchaseDate: purchaseDate,
            formattedDate: formatIndianDate(purchaseDate),
            image: "",
            isOwned: false,
          }
        })
        
        setPurchasedMaterials(formattedPurchased)
        
        // Fetch created materials (using listed materials instead)
        const created = await getMyListedMaterials()
        
        // Transform the created data for display
        const formattedCreated = created.map((material: any) => {
          const creationDate = material.createdAt || new Date().toISOString();
          return {
            id: material.id.toString(),
            title: material.title,
            description: material.description,
            type: "pdf", // Default all to PDF type
            creationDate: creationDate,
            formattedDate: formatIndianDate(creationDate),
            image: "",
            isOwned: true,
          }
        })
        
        setCreatedMaterials(formattedCreated)
        
        if (formattedPurchased.length === 0 && formattedCreated.length === 0) {
          setError("You haven't purchased or created any materials yet.")
        }
      } catch (err) {
        console.error("Error fetching materials:", err)
        setError("Failed to load your materials. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (currentAccount) {
      fetchMaterials()
    } else {
      setIsLoading(false)
    }
  }, [currentAccount])

  // Function to get the materials based on the active tab
  const getMaterialsByTab = () => {
    let materials = [];
    
    if (activeTab === 'all') {
      materials = [...purchasedMaterials];
    } else if (activeTab === 'pdf') {
      materials = [...createdMaterials];
    }
    
    // Sort the materials based on the sort order
    return sortMaterials(materials, sortOrder);
  }

  // Function to sort materials
  const sortMaterials = (materials: any[], order: string) => {
    const sorted = [...materials];
    
    switch (order) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.purchaseDate || a.creationDate || 0);
          const dateB = new Date(b.purchaseDate || b.creationDate || 0);
          return dateB.getTime() - dateA.getTime();
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.purchaseDate || a.creationDate || 0);
          const dateB = new Date(b.purchaseDate || b.creationDate || 0);
          return dateA.getTime() - dateB.getTime();
        });
      case 'a-z':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'z-a':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  };

  // Update the handleSelectMaterial function to use the improved CID handling
  const handleSelectMaterial = async (material: any) => {
    try {
      if (!currentAccount) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to view this content.",
          variant: "destructive",
        })
        return
      }
      setIsLoadingContent(true)
      setSelectedMaterial(material)
      
      // Log what we're trying to fetch
      console.log(`Fetching content hash for material ID: ${material.id} (${material.title})`);
      
      // Fetch content hash
      const hash = await getContentHash(parseInt(material.id))
      console.log('Fetched content hash:', hash)
      
      if (!hash || typeof hash !== 'string' || hash.length < 10) {
        toast({
          title: "Content Not Available",
          description: "The content hash could not be retrieved or is invalid. Please try again.",
          variant: "destructive",
        })
        setIsLoadingContent(false)
        return
      }
      
      // Format gateway URLs with CID validation
      const gatewayUrls = formatIpfsUrl(hash);
      console.log('Using gateway URLs:', gatewayUrls);
      
      // Set the first URL as the content hash
      setContentHash(gatewayUrls[0]);
      
      // Show attempt message
      toast({
        title: "Loading Document",
        description: "Attempting to display content from IPFS...",
      });
      
      // Open viewer based on type
      if (material.type === "pdf") {
        setShowPdfViewer(true);
      } else {
        setShowContentViewer(true);
      }
      
    } catch (err) {
      console.error("Error fetching content hash:", err)
      toast({
        title: "Error",
        description: "Failed to retrieve content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Handle closing content viewer
  const handleCloseContentViewer = () => {
    setShowContentViewer(false)
    setShowPdfViewer(false)
    setSelectedMaterial(null)
    setContentHash(null)
  }

  // Handle opening content in browser
  const handleOpenInBrowser = async (hash: string) => {
    if (!hash) {
      toast({
        title: "Error",
        description: "No content hash available to open",
        variant: "destructive",
      });
      return;
    }

    // Show loading toast
    toast({
      title: "Loading PDF",
      description: "Downloading content from IPFS...",
    });

    // Use the formatIpfsUrl function to create consistent gateway URLs
    const gatewayUrls = formatIpfsUrl(hash);
    console.log('Using gateway URLs:', gatewayUrls);
    
    try {
      // Try to fetch the PDF from each gateway until one works
      let response = null;
      let gatewayIndex = 0;
      
      while (!response && gatewayIndex < gatewayUrls.length) {
        try {
          console.log(`Trying gateway ${gatewayIndex + 1}: ${gatewayUrls[gatewayIndex]}`);
          response = await fetch(gatewayUrls[gatewayIndex], { method: 'GET' });
          
          if (!response.ok) {
            console.log(`Gateway ${gatewayIndex + 1} failed with status: ${response.status}`);
            response = null;
            gatewayIndex++;
          }
        } catch (error) {
          console.error(`Error with gateway ${gatewayIndex + 1}:`, error);
          gatewayIndex++;
        }
      }
      
      if (!response) {
        throw new Error("All IPFS gateways failed");
      }
      
      // Get the PDF data as a blob
      const pdfBlob = await response.blob();
      
      // Create a URL for the blob - this is stored in browser memory and cleared on browser close
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Success toast
      toast({
        title: "PDF Loaded",
        description: "PDF downloaded to browser. This temporary file will be deleted when you close your browser.",
      });
      
      // Open the PDF in a new tab - will use browser's built-in PDF viewer
      window.open(blobUrl, '_blank');
      
      // Clean up the blob URL when the browser tab is closed
      // This is not strictly necessary as they're automatically revoked when the document is unloaded
      // But it's good practice to free memory explicitly when possible
      window.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(blobUrl);
      });
    } catch (error) {
      console.error('Error fetching PDF from IPFS:', error);
      
      // Error toast with fallback option
      toast({
        title: "Error Loading PDF",
        description: "Failed to download PDF from IPFS. Please try downloading it directly.",
        action: (
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => window.open(gatewayUrls[0], '_blank')}
          >
            Try Direct Link
          </Button>
        ),
        duration: 7000,
      });
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
            {isLoading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-800/50 bg-black/30 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center h-16 w-16 mb-4">
                  <Loader size="lg" color="purple" />
                </div>
                <p className="text-purple-300 animate-pulse">Loading your materials...</p>
              </div>
            ) : !currentAccount ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-800/50 bg-black/30 p-8 backdrop-blur-sm">
                <div className="rounded-full bg-purple-900/30 p-4 mb-4">
                  <Lock className="h-10 w-10 text-purple-400" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">Connect Your Wallet</h2>
                <p className="mb-6 max-w-md text-center text-base text-slate-400">
                  Please connect your wallet to view your purchased materials
                </p>
                <Button 
                  onClick={connect}
                  variant="default"
                  className="h-10 min-w-[180px] text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none"
                >
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end items-center">
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="h-10 px-4 bg-slate-900/80 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 text-white flex items-center gap-2"
                        >
                          <Filter className="h-4 w-4 text-purple-400" />
                          {activeTab === "all" ? "Purchased" : "Owned"}
                          <ChevronDown className="h-4 w-4 text-purple-400 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        className="bg-slate-900 border border-slate-700 text-white shadow-lg shadow-purple-900/20"
                      >
                        <DropdownMenuItem 
                          className={`flex items-center hover:bg-slate-800 focus:bg-slate-800 ${activeTab === "all" ? "bg-slate-800/70 text-purple-400" : ""}`}
                          onClick={() => setActiveTab("all")}
                        >
                          Purchased
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={`flex items-center hover:bg-slate-800 focus:bg-slate-800 ${activeTab === "pdf" ? "bg-slate-800/70 text-purple-400" : ""}`}
                          onClick={() => setActiveTab("pdf")}
                        >
                          Owned
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="h-10 px-4 bg-slate-900/80 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 text-white flex items-center gap-2"
                        >
                          <ArrowUpDown className="h-4 w-4 text-purple-400" />
                          {sortOrder === "newest" ? "Newest First" : 
                           sortOrder === "oldest" ? "Oldest First" : 
                           sortOrder === "a-z" ? "A-Z" : "Z-A"}
                          <ChevronDown className="h-4 w-4 text-purple-400 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        className="bg-slate-900 border border-slate-700 text-white shadow-lg shadow-purple-900/20"
                      >
                        <DropdownMenuItem 
                          className={`flex items-center hover:bg-slate-800 focus:bg-slate-800 ${sortOrder === "newest" ? "bg-slate-800/70 text-purple-400" : ""}`}
                          onClick={() => setSortOrder("newest")}
                        >
                          Newest First
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={`flex items-center hover:bg-slate-800 focus:bg-slate-800 ${sortOrder === "oldest" ? "bg-slate-800/70 text-purple-400" : ""}`}
                          onClick={() => setSortOrder("oldest")}
                        >
                          Oldest First
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={`flex items-center hover:bg-slate-800 focus:bg-slate-800 ${sortOrder === "a-z" ? "bg-slate-800/70 text-purple-400" : ""}`}
                          onClick={() => setSortOrder("a-z")}
                        >
                          A-Z
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={`flex items-center hover:bg-slate-800 focus:bg-slate-800 ${sortOrder === "z-a" ? "bg-slate-800/70 text-purple-400" : ""}`}
                          onClick={() => setSortOrder("z-a")}
                        >
                          Z-A
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <div className="flex items-center h-10 gap-2 bg-slate-900/80 py-2 px-4 rounded-lg border border-slate-700">
                      <span className="text-slate-400 text-sm">Items:</span>
                      <p className="text-lg font-bold text-purple-400">
                        {getMaterialsByTab().length}
                      </p>
                    </div>
                  </div>
                </div>

                {isLoadingContent && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="rounded-lg bg-slate-900 p-8 shadow-2xl border border-purple-900/50">
                      <div className="flex items-center justify-center h-14 w-14 mx-auto mb-4">
                        <Loader size="default" color="purple" />
                      </div>
                      <p className="text-center text-purple-300 animate-pulse mb-4">Loading your content...</p>
                      {contentHash && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mx-auto flex items-center gap-2 mt-3"
                          onClick={() => {
                            setIsLoadingContent(false);
                            handleOpenInBrowser(contentHash);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open in Browser
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {!isLoading && !error && getMaterialsByTab().length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {getMaterialsByTab().map((material) => (
                      <MaterialCard key={material.id} material={material} onClick={() => handleSelectMaterial(material)} />
                    ))}
                  </div>
                )}

                {!isLoading && !error && getMaterialsByTab().length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Bookshelf */}
                        <rect x="40" y="80" width="160" height="10" rx="2" fill="#374151" />
                        <rect x="40" y="130" width="160" height="10" rx="2" fill="#374151" />
                        <rect x="40" y="180" width="160" height="10" rx="2" fill="#374151" />
                        
                        {/* Side supports */}
                        <rect x="40" y="90" width="5" height="90" fill="#4B5563" />
                        <rect x="195" y="90" width="5" height="90" fill="#4B5563" />
                        
                        {/* Empty shelf highlight */}
                        <rect x="55" y="95" width="130" height="30" rx="2" fill="#1F2937" stroke="#6B7280" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 2" />
                        
                        {/* Magnifying glass */}
                        <circle cx="160" cy="60" r="24" stroke="#A855F7" strokeWidth="4" strokeOpacity="0.8" />
                        <line x1="178" y1="76" x2="190" y2="88" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8" />
                        
                        {/* Sparkles */}
                        <path d="M75 45L78 50L83 53L78 56L75 61L72 56L67 53L72 50L75 45Z" fill="#6366F1" />
                        <path d="M115 25L117 30L122 32L117 34L115 39L113 34L108 32L113 30L115 25Z" fill="#8B5CF6" />
                        <path d="M55 65L56 68L59 69L56 70L55 73L54 70L51 69L54 68L55 65Z" fill="#EC4899" />
                        
                        {/* Question mark */}
                        <text x="120" y="115" fontSize="36" fill="#6D28D9" fontWeight="bold" textAnchor="middle">?</text>
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">No Materials Found</h3>
                    <p className="mb-4 max-w-md text-slate-400">
                      You haven't purchased any study materials yet. Visit the marketplace to find resources.
                    </p>
                    <Button 
                      variant="default" 
                      className="min-w-[180px] h-10 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none shadow-lg transition-all duration-200 hover:scale-105" 
                      asChild
                    >
                      <a href="/marketplace" className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Browse Marketplace
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Content Viewer Modal */}
            {showContentViewer && selectedMaterial && contentHash && (
              <ContentViewer
                contentHash={contentHash}
                title={selectedMaterial.title}
                type={selectedMaterial.type}
                onClose={handleCloseContentViewer}
              />
            )}
            
            {/* PDF Viewer with AI Assistant */}
            {showPdfViewer && selectedMaterial && contentHash && (
              <PdfViewerWithAi
                pdfUrl={contentHash}
                title={selectedMaterial.title}
                onClose={handleCloseContentViewer}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

