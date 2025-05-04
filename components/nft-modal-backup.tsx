"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  X, Star, Share2, BookOpen, User, 
  Loader2, Copy, CheckCheck, Link as LinkIcon 
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { purchaseMaterial } from "@/lib/blockchain"

interface NFTModalProps {
  isOpen: boolean
  item: {
    id: string
    title: string
    description: string
    price: string
    author: string
    category: string
    image: string
    thumbnailHash?: string
    rating?: number
    sales?: number
    createdAt?: string
  }
  onClose: () => void
}

export default function NFTModal({ isOpen, item, onClose }: NFTModalProps) {
  const { currentAccount, connect } = useWallet()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Generate a unique profile image based on wallet address
  const getProfileImage = (address: string) => {
    // Create a consistent hash from the address
    const normalizedAddress = address.toLowerCase();
    const colorHash = normalizedAddress.slice(-6); // Use last 6 chars for color
    const patternSeed = parseInt(normalizedAddress.slice(2, 10), 16); // Use another part of address for pattern
    
    // Generate a unique but consistent background color
    const backgroundColor = `#${colorHash}`;
    
    // Generate a lighter color for the foreground pattern
    const r = parseInt(colorHash.slice(0, 2), 16);
    const g = parseInt(colorHash.slice(2, 4), 16);
    const b = parseInt(colorHash.slice(4, 6), 16);
    const foregroundColor = `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, 0.8)`;
    
    // Create pattern based on the patternSeed
    const patternType = patternSeed % 5; // 5 different pattern types
    
    let pattern;
    switch (patternType) {
      case 0:
        pattern = `radial-gradient(circle at 30% 30%, ${foregroundColor} 10%, transparent 20%), 
                   radial-gradient(circle at 70% 70%, ${foregroundColor} 10%, transparent 20%)`;
        break;
      case 1:
        pattern = `linear-gradient(45deg, ${foregroundColor} 25%, transparent 25%, transparent 75%, ${foregroundColor} 75%, ${foregroundColor})`;
        break;
      case 2:
        pattern = `repeating-linear-gradient(45deg, ${foregroundColor} 0, ${foregroundColor} 5%, transparent 5%, transparent 10%)`;
        break;
      case 3:
        pattern = `conic-gradient(from ${patternSeed % 360}deg at 50% 50%, ${foregroundColor} 0%, transparent 40%, ${foregroundColor} 60%)`;
        break;
      case 4:
      default:
        pattern = `repeating-radial-gradient(${foregroundColor} 0, ${foregroundColor} 5px, transparent 5px, transparent 10px)`;
        break;
    }
    
    // Return a CSS style object for the div
    return {
      background: backgroundColor,
      backgroundImage: pattern,
      backgroundSize: "cover",
      width: "100%",
      height: "100%",
      borderRadius: "50%",
    };
  };

  // Replace with new pixelated Bored Ape style avatar generator
  // Generate a pixel art profile avatar based on wallet address (Bored Ape style)
  const getProfileImage = (address: string) => {
    if (!address) return {};
    
    // Use address to seed the generation
    const seed = address.toLowerCase();
    
    // Create a stable hash function for the address
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const hash = hashCode(seed);
    
    // Base colors - a palette inspired by Bored Ape collection
    const backgrounds = [
      '#2a3990', '#617dc9', '#f4b86c', '#ec6e41', '#26265a',
      '#457b6c', '#fae48c', '#9dd9d2', '#487b84', '#eac08b'
    ];
    
    const skinTones = [
      '#f0d3ac', '#d5a367', '#a37339', '#87612d', '#7c482e',
      '#8a5c36', '#d6a36c', '#a78b5f', '#e5c298', '#c99659'
    ];
    
    const featureColors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
    ];
    
    // Select colors based on address hash
    const bgColor = backgrounds[hash % backgrounds.length];
    const skinColor = skinTones[(hash >> 3) % skinTones.length];
    const featureColor = featureColors[(hash >> 6) % featureColors.length];
    const accessoryColor = featureColors[(hash >> 9) % featureColors.length];
    
    // Feature variations
    const hasGlasses = hash % 3 === 0;
    const hasHat = (hash >> 2) % 4 === 0;
    const mouthStyle = hash % 5;
    const eyeStyle = (hash >> 4) % 4;
    
    // Create SVG string - using string concatenation to avoid template literal issues
    let svgContent = '<svg width="100" height="100" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">';
    
    // Background
    svgContent += '<rect width="10" height="10" fill="' + bgColor + '" />';
    
    // Face shape  
    svgContent += '<rect x="2" y="2" width="6" height="6" fill="' + skinColor + '" />';
    
    // Eyes
    if (eyeStyle === 0) {
      svgContent += '<rect x="3" y="4" width="1" height="1" fill="#000000" />';
      svgContent += '<rect x="6" y="4" width="1" height="1" fill="#000000" />';
    } else if (eyeStyle === 1) {
      svgContent += '<rect x="3" y="4" width="1" height="1" fill="#000000" />';
      svgContent += '<rect x="6" y="4" width="1" height="1" fill="#000000" />';
      svgContent += '<rect x="3" y="3" width="1" height="1" fill="#ffffff" opacity="0.5" />';
      svgContent += '<rect x="6" y="3" width="1" height="1" fill="#ffffff" opacity="0.5" />';
    } else if (eyeStyle === 2) {
      svgContent += '<rect x="3" y="4" width="1" height="1" fill="' + featureColor + '" />';
      svgContent += '<rect x="6" y="4" width="1" height="1" fill="' + featureColor + '" />';
    } else {
      svgContent += '<rect x="3" y="3.5" width="1" height="1.5" fill="#000000" />';
      svgContent += '<rect x="6" y="3.5" width="1" height="1.5" fill="#000000" />';
    }
    
    // Mouth
    if (mouthStyle === 0) {
      svgContent += '<rect x="4" y="6" width="2" height="1" fill="#000000" />';
    } else if (mouthStyle === 1) {
      svgContent += '<rect x="4" y="6" width="2" height="1" fill="#000000" />';
      svgContent += '<rect x="4" y="7" width="2" height="0.5" fill="#ff0000" opacity="0.7" />';
    } else if (mouthStyle === 2) {
      svgContent += '<rect x="3.5" y="6" width="3" height="0.5" fill="#000000" />';
    } else if (mouthStyle === 3) {
      svgContent += '<rect x="4" y="6" width="2" height="0.5" fill="#000000" />';
      svgContent += '<rect x="4.5" y="6.5" width="1" height="0.5" fill="#000000" />';
    } else {
      svgContent += '<rect x="3.5" y="5.5" width="3" height="1" fill="#000000" />';
      svgContent += '<rect x="4" y="6" width="2" height="1" fill="' + skinColor + '" />';
    }
    
    // Glasses
    if (hasGlasses) {
      svgContent += '<rect x="2.5" y="3.5" width="2" height="1.5" fill="none" stroke="' + accessoryColor + '" stroke-width="0.2" />';
      svgContent += '<rect x="5.5" y="3.5" width="2" height="1.5" fill="none" stroke="' + accessoryColor + '" stroke-width="0.2" />';
      svgContent += '<rect x="4.5" y="4" width="1" height="0.2" fill="' + accessoryColor + '" />';
    }
    
    // Hat
    if (hasHat) {
      svgContent += '<rect x="1.5" y="1.5" width="7" height="1" fill="' + accessoryColor + '" />';
      svgContent += '<rect x="2" y="0.5" width="6" height="1" fill="' + accessoryColor + '" />';
    }
    
    svgContent += '</svg>';
    
    // Encode the SVG
    const encodedSvg = encodeURIComponent(svgContent);
    
    return {
      background: bgColor,
      backgroundImage: `url("data:image/svg+xml,${encodedSvg}")`,
      backgroundSize: "cover",
      width: "100%",
      height: "100%",
      borderRadius: "50%",
    };
  };

  // Determine if we should use the SVG category thumbnail
  const shouldUseTagSvg = !item.image || 
    item.image === "" || 
    item.image.includes("placeholder.svg") || 
    item.image.includes("placeholder") ||
    !item.image.match(/\.(jpeg|jpg|gif|png|webp)$/i)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handlePurchase = async () => {
    if (!currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase this material.",
        variant: "destructive",
      })
      
      try {
        await connect()
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      }
      return
    }

    if (currentAccount.toLowerCase() === item.author.toLowerCase()) {
      toast({
        title: "Cannot purchase your own material",
        description: "You cannot purchase a material that you have listed.",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    
    try {
      // Extract the numeric price value from the price string (e.g., "0.05 ETH" -> "0.05")
      const priceValue = item.price.split(" ")[0]
      
      toast({
        title: "Purchase initiated",
        description: "Please confirm the transaction in your wallet.",
      })
      
      // Call the blockchain purchase function
      const success = await purchaseMaterial(parseInt(item.id), priceValue)
      
      if (success) {
        toast({
          title: "Purchase successful!",
          description: "The study material is now available in your collection.",
        })
        onClose()
      } else {
        throw new Error("Transaction failed or was rejected")
      }
    } catch (error) {
      console.error("Error purchasing material:", error)
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  // Handle share functionality
  const handleShare = async () => {
    setIsSharing(true);
    
    // Create share URL
    const shareUrl = `${window.location.origin}/marketplace?item=${item.id}`;
    
    try {
      // Try native share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `Check out ${item.title}`,
          text: `I found this amazing learning resource: ${item.title}`,
          url: shareUrl
        });
        toast({
          title: "Shared successfully!",
          description: "Content has been shared"
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard"
        });
        
        // Reset copied state after 3 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Share failed",
        description: "Unable to share this content",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative z-10 my-auto max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="relative h-[300px] w-full md:h-auto md:w-1/2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
            {shouldUseTagSvg ? (
              <div className="flex h-full w-full items-center justify-center bg-slate-800/80">
                {/* SVG Logos based on category */}
                {item.category?.toLowerCase() === "mathematics" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M12 2v20M2 12h20" />
                      <path d="M19 5L5 19M5 5l14 14" />
                    </svg>
                    <div className="mt-3 text-lg font-medium text-blue-400">Mathematics</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "chemistry" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-green-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M9 3h6m-3 0v6m-8 2h2m4 0h-2v8l-2 2m14-10h2m-4 0h-2v8l2 2m-7-6h4" />
                    </svg>
                    <div className="mt-3 text-lg font-medium text-green-400">Chemistry</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "physics" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-indigo-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    <div className="mt-3 text-lg font-medium text-indigo-400">Physics</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "biology" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M3 12h4l3 8l4-16l3 8h4"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-emerald-400">Biology</div>
                  </div>
                )}
                {(item.category?.toLowerCase() === "computer science" || item.category?.toLowerCase() === "computer-science") && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect>
                      <line x1="2" y1="20" x2="22" y2="20"></line>
                      <line x1="12" y1="16" x2="12" y2="20"></line>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-cyan-400">Computer Science</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "programming" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-blue-400">Programming</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "design" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-pink-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-pink-400">Design</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "business" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-indigo-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-indigo-400">Business</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "science" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 3v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3"></path>
                      <line x1="12" y1="12" x2="12" y2="21"></line>
                      <path d="M20 16.2A5 5 0 0 1 16.8 20H7.2A5 5 0 0 1 4 16.2V7.8A5 5 0 0 1 7.2 4h9.6A5 5 0 0 1 20 7.8v8.4z"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-cyan-400">Science</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "language" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-yellow-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 8h14M5 12h14M5 16h6"></path>
                      <path d="M15 16l4 4"></path>
                      <path d="M19 16l-4 4"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-yellow-400">Language</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "blockchain" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="6" height="6" rx="1"></rect>
                      <rect x="16" y="7" width="6" height="6" rx="1"></rect>
                      <rect x="9" y="7" width="6" height="6" rx="1"></rect>
                      <rect x="9" y="16" width="6" height="6" rx="1"></rect>
                      <path d="M5 13v2"></path>
                      <path d="M19 13v2"></path>
                      <path d="M12 13v2"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-purple-400">Blockchain</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "literature" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-amber-400">Literature</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "history" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-orange-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-orange-400">History</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "economics" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-lime-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="2" x2="12" y2="22"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-lime-400">Economics</div>
                  </div>
                )}
                {/* Default for other categories */}
                {!["mathematics", "chemistry", "physics", "biology", 
                  "computer science", "computer-science", "literature", "history", 
                  "economics", "blockchain", "programming", "design", "business",
                  "science", "language"].includes(item.category?.toLowerCase()) && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <div className="mt-3 text-lg font-medium text-purple-400">{item.category}</div>
                  </div>
                )}
              </div>
            ) : (
              <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
            )}
          </div>

          {/* Content section */}
          <div className="flex w-full flex-col p-6 md:w-1/2 md:overflow-y-auto">
            <div className="mb-2 flex items-center">
              {item.rating !== undefined && (
                <div className="ml-auto flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{item.rating.toFixed(1)}</span>
                  {item.sales !== undefined && (
                    <>
                      <span className="mx-2 text-slate-500">•</span>
                      <span className="text-sm text-slate-400">{item.sales} sales</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <h2 className="mb-4 text-2xl font-bold text-white">{item.title}</h2>

            <p className="mb-6 text-slate-300">{item.description}</p>

            {/* Author */}
            <div className="mb-6 flex items-center">
              <div className="mr-3 h-10 w-10 overflow-hidden rounded-full border border-slate-700">
                <div style={getProfileImage(item.author)}></div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Created by</p>
                <p className="font-medium text-white">{item.author.substring(0, 6)}...{item.author.substring(item.author.length - 4)}</p>
              </div>
            </div>

            {/* Details */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-sm text-slate-400">Format</p>
                <p className="font-medium text-white">Digital Content</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-sm text-slate-400">Category</p>
                <p className="font-medium text-white">{item.category}</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-sm text-slate-400">Blockchain</p>
                <p className="font-medium text-white">Ethereum</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-4">
                <p className="text-sm text-slate-400">Created</p>
                <p className="font-medium text-white">
                  {item.createdAt 
                    ? new Date(item.createdAt).toLocaleDateString() 
                    : "Recently"}
                </p>
              </div>
            </div>

            {/* Preview button */}
            <Button variant="outline" className="mb-6 border-slate-700 text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Preview Sample
            </Button>

            {/* Price and purchase */}
            <div className="mt-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Price</p>
                <p className="text-2xl font-bold text-white">{item.price}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-slate-700 text-white hover:bg-slate-800"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCopied ? (
                    <CheckCheck className="h-4 w-4 text-green-400" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  onClick={handlePurchase} 
                  disabled={isPurchasing || (!!currentAccount && currentAccount.toLowerCase() === item.author.toLowerCase())}
                  className="relative bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <span className="absolute -inset-0.5 -z-10 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 opacity-30 blur-sm"></span>
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentAccount && currentAccount.toLowerCase() === item.author.toLowerCase() ? (
                    "You own this"
                  ) : (
                    "Purchase Now"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

