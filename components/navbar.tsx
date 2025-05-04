"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, X, Search, ArrowUpDown } from "lucide-react"
import WalletButton from "./wallet-button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add the getProfileImage function for generating pixel art avatars
export const getProfileImage = (address: string) => {
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
  
  // Base colors - expanded palette with deeper shades
  const backgrounds = [
    '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5', 
    '#5c6bc0', '#673ab7', '#7e57c2', '#9575cd', '#b39ddb',
    '#4527a0', '#512da8', '#5e35b1', '#6a1b9a', '#7b1fa2',
    '#8e24aa', '#9c27b0', '#ab47bc', '#4a148c', '#6a1b9a'
  ];
  
  const skinTones = [
    '#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524',
    '#896347', '#765339', '#613d30', '#4c2d1b', '#33261d',
    '#f6edd9', '#f4e7d3', '#e9cead', '#d4b38f', '#c19b76',
    '#ae8b69', '#a17956', '#84563c', '#67422c', '#553019'
  ];
  
  const featureColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#d50000',
    '#c51162', '#aa00ff', '#6200ea', '#304ffe', '#2962ff',
    '#0091ea', '#00b8d4', '#00bfa5', '#00c853', '#64dd17',
    '#aeea00', '#ffd600', '#ffab00', '#ff6d00', '#dd2c00'
  ];
  
  // Select colors based on address hash
  const bgColor = backgrounds[hash % backgrounds.length];
  const skinColor = skinTones[(hash >> 4) % skinTones.length];
  const featureColor = featureColors[(hash >> 8) % featureColors.length];
  const accessoryColor = featureColors[(hash >> 12) % featureColors.length];
  const detailColor = featureColors[(hash >> 16) % featureColors.length];
  
  // Feature variations - expanded options
  const hasGlasses = hash % 4 <= 1; // 50% chance
  const hasHat = (hash >> 3) % 5 <= 1; // 40% chance
  const hasBeard = (hash >> 6) % 6 <= 1; // ~33% chance
  const hasFacialMark = (hash >> 9) % 8 === 0; // 12.5% chance
  const hasEarrings = (hash >> 11) % 7 === 0; // ~14% chance
  
  const mouthStyle = hash % 7; // 7 different mouth styles
  const eyeStyle = (hash >> 5) % 5; // 5 different eye styles
  const noseStyle = (hash >> 10) % 3; // 3 different nose styles
  const faceShape = (hash >> 13) % 4; // 4 different face shapes
  const patternStyle = (hash >> 15) % 5; // 5 background pattern styles
  
  // Create SVG string - using string concatenation to avoid template literal issues
  let svgContent = '<svg width="100" height="100" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">';
  
  // Background with pattern
  svgContent += '<rect width="10" height="10" fill="' + bgColor + '" />';
  
  // Add background pattern based on pattern style
  if (patternStyle === 0) {
    // Dots pattern
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        svgContent += '<circle cx="' + (1 + i * 2) + '" cy="' + (1 + j * 2) + '" r="0.2" fill="#ffffff" opacity="0.1" />';
      }
    }
  } else if (patternStyle === 1) {
    // Lines pattern
    for (let i = 0; i < 10; i += 2) {
      svgContent += '<line x1="0" y1="' + i + '" x2="10" y2="' + i + '" stroke="#ffffff" stroke-width="0.2" opacity="0.1" />';
    }
  } else if (patternStyle === 2) {
    // Grid pattern
    svgContent += '<path d="M 2.5 0 v 10 M 5 0 v 10 M 7.5 0 v 10 M 0 2.5 h 10 M 0 5 h 10 M 0 7.5 h 10" stroke="#ffffff" stroke-width="0.1" opacity="0.1" />';
  } else if (patternStyle === 3) {
    // Diagonal pattern
    svgContent += '<path d="M0,10 L10,0" stroke="#ffffff" stroke-width="0.2" opacity="0.1" />';
    svgContent += '<path d="M0,5 L5,0" stroke="#ffffff" stroke-width="0.2" opacity="0.1" />';
    svgContent += '<path d="M5,10 L10,5" stroke="#ffffff" stroke-width="0.2" opacity="0.1" />';
  }
  // Pattern 4 is no additional pattern
  
  // Face shape based on faceShape variable
  if (faceShape === 0) {
    // Round face
    svgContent += '<rect x="2" y="2" width="6" height="6" rx="3" ry="3" fill="' + skinColor + '" />';
  } else if (faceShape === 1) {
    // Square face with rounded corners
    svgContent += '<rect x="2" y="2" width="6" height="6" rx="1" ry="1" fill="' + skinColor + '" />';
  } else if (faceShape === 2) {
    // Oval face
    svgContent += '<ellipse cx="5" cy="5" rx="3" ry="3.5" fill="' + skinColor + '" />';
  } else {
    // Diamond face
    svgContent += '<polygon points="5,2 8,5 5,8 2,5" fill="' + skinColor + '" />';
  }
  
  // Nose based on noseStyle
  if (noseStyle === 0) {
    svgContent += '<rect x="4.7" y="4.7" width="0.6" height="1" fill="' + skinColor + '" stroke="#000000" stroke-width="0.05" opacity="0.5" />';
  } else if (noseStyle === 1) {
    svgContent += '<circle cx="5" cy="5.2" r="0.3" fill="' + skinColor + '" stroke="#000000" stroke-width="0.05" opacity="0.5" />';
  } else {
    svgContent += '<polygon points="5,4.7 5.3,5.2 4.7,5.2" fill="' + skinColor + '" stroke="#000000" stroke-width="0.05" opacity="0.5" />';
  }
  
  // Eyes
  if (eyeStyle === 0) {
    // Simple eyes
    svgContent += '<rect x="3" y="4" width="1" height="0.8" rx="0.4" fill="#000000" />';
    svgContent += '<rect x="6" y="4" width="1" height="0.8" rx="0.4" fill="#000000" />';
  } else if (eyeStyle === 1) {
    // Round eyes with highlights
    svgContent += '<circle cx="3.5" cy="4.2" r="0.5" fill="#000000" />';
    svgContent += '<circle cx="6.5" cy="4.2" r="0.5" fill="#000000" />';
    svgContent += '<circle cx="3.7" cy="4" r="0.2" fill="#ffffff" opacity="0.7" />';
    svgContent += '<circle cx="6.7" cy="4" r="0.2" fill="#ffffff" opacity="0.7" />';
  } else if (eyeStyle === 2) {
    // Colored eyes
    svgContent += '<circle cx="3.5" cy="4.2" r="0.5" fill="' + featureColor + '" />';
    svgContent += '<circle cx="6.5" cy="4.2" r="0.5" fill="' + featureColor + '" />';
    svgContent += '<circle cx="3.5" cy="4.2" r="0.25" fill="#000000" />';
    svgContent += '<circle cx="6.5" cy="4.2" r="0.25" fill="#000000" />';
  } else if (eyeStyle === 3) {
    // Sleepy eyes
    svgContent += '<rect x="3" y="4" width="1" height="0.4" rx="0.2" fill="#000000" />';
    svgContent += '<rect x="6" y="4" width="1" height="0.4" rx="0.2" fill="#000000" />';
  } else {
    // Anime style
    svgContent += '<path d="M3,4 C3.5,3.8 4,3.8 4.5,4" fill="none" stroke="#000000" stroke-width="0.15" />';
    svgContent += '<path d="M5.5,4 C6,3.8 6.5,3.8 7,4" fill="none" stroke="#000000" stroke-width="0.15" />';
    svgContent += '<circle cx="3.5" cy="4.2" r="0.2" fill="#000000" />';
    svgContent += '<circle cx="6.5" cy="4.2" r="0.2" fill="#000000" />';
  }
  
  // Mouth
  if (mouthStyle === 0) {
    // Simple smile
    svgContent += '<path d="M4,6 C4.5,6.5 5.5,6.5 6,6" fill="none" stroke="#000000" stroke-width="0.15" />';
  } else if (mouthStyle === 1) {
    // Slight frown
    svgContent += '<path d="M4,6.3 C4.5,5.8 5.5,5.8 6,6.3" fill="none" stroke="#000000" stroke-width="0.15" />';
  } else if (mouthStyle === 2) {
    // Neutral line
    svgContent += '<line x1="4" y1="6" x2="6" y2="6" stroke="#000000" stroke-width="0.15" />';
  } else if (mouthStyle === 3) {
    // Open smile
    svgContent += '<path d="M4,5.8 C4.5,6.5 5.5,6.5 6,5.8" fill="none" stroke="#000000" stroke-width="0.15" />';
    svgContent += '<path d="M4.3,6 C4.8,6.3 5.2,6.3 5.7,6" fill="#670000" opacity="0.5" />';
  } else if (mouthStyle === 4) {
    // Surprised
    svgContent += '<circle cx="5" cy="6" r="0.3" fill="#000000" />';
  } else if (mouthStyle === 5) {
    // Smirk
    svgContent += '<path d="M4,6 C4.5,6.2 5.5,6 5.8,5.8" fill="none" stroke="#000000" stroke-width="0.15" />';
  } else {
    // Cat mouth
    svgContent += '<path d="M4,6 L5,6.3 L6,6" fill="none" stroke="#000000" stroke-width="0.15" />';
    svgContent += '<line x1="4.7" y1="5.7" x2="4.7" y2="6.2" stroke="#000000" stroke-width="0.1" />';
    svgContent += '<line x1="5.3" y1="5.7" x2="5.3" y2="6.2" stroke="#000000" stroke-width="0.1" />';
  }
  
  // Facial mark if present
  if (hasFacialMark) {
    const markX = 4 + (hash % 2);
    const markY = 3.5 + ((hash >> 7) % 3) * 0.5;
    if ((hash >> 14) % 2 === 0) {
      // Small dot
      svgContent += '<circle cx="' + markX + '" cy="' + markY + '" r="0.1" fill="' + detailColor + '" opacity="0.7" />';
    } else {
      // Small line
      svgContent += '<line x1="' + (markX - 0.2) + '" y1="' + markY + '" x2="' + (markX + 0.2) + '" y2="' + markY + '" stroke="' + detailColor + '" stroke-width="0.1" opacity="0.7" />';
    }
  }
  
  // Glasses
  if (hasGlasses) {
    const glassesStyle = (hash >> 17) % 3; // 3 different glasses styles
    
    if (glassesStyle === 0) {
      // Round glasses
      svgContent += '<circle cx="3.5" cy="4.2" r="0.8" fill="none" stroke="' + accessoryColor + '" stroke-width="0.15" />';
      svgContent += '<circle cx="6.5" cy="4.2" r="0.8" fill="none" stroke="' + accessoryColor + '" stroke-width="0.15" />';
      svgContent += '<line x1="4.3" y1="4.2" x2="5.7" y2="4.2" stroke="' + accessoryColor + '" stroke-width="0.15" />';
    } else if (glassesStyle === 1) {
      // Square glasses
      svgContent += '<rect x="2.8" y="3.6" width="1.4" height="1.2" rx="0.2" fill="none" stroke="' + accessoryColor + '" stroke-width="0.15" />';
      svgContent += '<rect x="5.8" y="3.6" width="1.4" height="1.2" rx="0.2" fill="none" stroke="' + accessoryColor + '" stroke-width="0.15" />';
      svgContent += '<line x1="4.2" y1="4.2" x2="5.8" y2="4.2" stroke="' + accessoryColor + '" stroke-width="0.15" />';
    } else {
      // Sunglasses
      svgContent += '<rect x="2.8" y="3.6" width="1.4" height="1.2" rx="0.1" fill="' + accessoryColor + '" opacity="0.7" />';
      svgContent += '<rect x="5.8" y="3.6" width="1.4" height="1.2" rx="0.1" fill="' + accessoryColor + '" opacity="0.7" />';
      svgContent += '<line x1="4.2" y1="4.2" x2="5.8" y2="4.2" stroke="' + accessoryColor + '" stroke-width="0.15" />';
    }
  }
  
  // Hat
  if (hasHat) {
    const hatStyle = (hash >> 19) % 4; // 4 different hat styles
    
    if (hatStyle === 0) {
      // Beanie
      svgContent += '<path d="M2,2.5 C2,1.5 3.5,1 5,1 C6.5,1 8,1.5 8,2.5" fill="' + accessoryColor + '" />';
      svgContent += '<rect x="2" y="2" width="6" height="0.5" fill="' + accessoryColor + '" />';
    } else if (hatStyle === 1) {
      // Cap
      svgContent += '<path d="M2,2.5 L8,2.5 L8,2 C8,1.5 6.5,1 5,1 C3.5,1 2,1.5 2,2 Z" fill="' + accessoryColor + '" />';
      svgContent += '<path d="M8,2.5 C8.5,2.5 9,2.7 9,3 L8,3 Z" fill="' + accessoryColor + '" />';
    } else if (hatStyle === 2) {
      // Top hat
      svgContent += '<rect x="3" y="0.5" width="4" height="2" fill="' + accessoryColor + '" />';
      svgContent += '<rect x="2.5" y="2" width="5" height="0.5" fill="' + accessoryColor + '" />';
    } else {
      // Headband
      svgContent += '<rect x="2" y="2" width="6" height="0.7" fill="' + accessoryColor + '" />';
    }
  }
  
  // Beard
  if (hasBeard) {
    const beardStyle = (hash >> 21) % 3; // 3 different beard styles
    
    if (beardStyle === 0) {
      // Full beard
      svgContent += '<path d="M3,5.5 C3,7 4,7.5 5,7.5 C6,7.5 7,7 7,5.5" fill="' + featureColor + '" opacity="0.5" />';
    } else if (beardStyle === 1) {
      // Goatee
      svgContent += '<path d="M4.7,6.2 C4.7,7 5,7.3 5.3,6.2" fill="' + featureColor + '" opacity="0.6" />';
    } else {
      // Stubble
      for (let i = 0; i < 8; i++) {
        const stubbleX = 3.5 + (i % 4) * 0.8;
        const stubbleY = 6 + Math.floor(i / 4) * 0.6;
        svgContent += '<circle cx="' + stubbleX + '" cy="' + stubbleY + '" r="0.1" fill="' + featureColor + '" opacity="0.4" />';
      }
    }
  }
  
  // Earrings
  if (hasEarrings) {
    const earringStyle = (hash >> 23) % 2; // 2 different earring styles
    
    if (earringStyle === 0) {
      // Studs
      svgContent += '<circle cx="2" cy="4.5" r="0.2" fill="' + detailColor + '" />';
      svgContent += '<circle cx="8" cy="4.5" r="0.2" fill="' + detailColor + '" />';
    } else {
      // Dangly
      svgContent += '<path d="M2,4.5 L2,5.5" stroke="' + detailColor + '" stroke-width="0.1" />';
      svgContent += '<circle cx="2" cy="5.6" r="0.2" fill="' + detailColor + '" />';
      svgContent += '<path d="M8,4.5 L8,5.5" stroke="' + detailColor + '" stroke-width="0.1" />';
      svgContent += '<circle cx="8" cy="5.6" r="0.2" fill="' + detailColor + '" />';
    }
  }
  
  svgContent += '</svg>';
  
  // Encode the SVG
  const encodedSvg = encodeURIComponent(svgContent);
  
  return {
    backgroundColor: bgColor,
    backgroundImage: `url("data:image/svg+xml,${encodedSvg}")`,
    backgroundSize: "cover",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
  };
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // Initialize search term and sort from URL when on marketplace page
  useEffect(() => {
    if (pathname === "/marketplace") {
      const querySearch = searchParams?.get("search")
      if (querySearch) {
        setSearchTerm(querySearch)
      }
      
      const querySort = searchParams?.get("sort")
      if (querySort && ["newest", "price-low", "price-high"].includes(querySort)) {
        setSortBy(querySort)
      }
    }
  }, [pathname, searchParams])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (pathname === "/marketplace") {
      // Update URL with search and sort params on marketplace page
      const params = new URLSearchParams(searchParams?.toString() || "")
      if (searchTerm) {
        params.set("search", searchTerm)
      } else {
        params.delete("search")
      }
      
      // Always include sort parameter
      params.set("sort", sortBy)
      
      router.push(`/marketplace?${params.toString()}`)
    } else {
      // Navigate to marketplace with search and sort params
      router.push(`/marketplace?search=${encodeURIComponent(searchTerm)}&sort=${sortBy}`)
    }
  }

  // Function to determine if link is active
  const isActiveLink = (path: string) => pathname === path

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value)
    
    // If on marketplace page, update the URL immediately
    if (pathname === "/marketplace") {
      const params = new URLSearchParams(searchParams?.toString() || "")
      params.set("sort", value)
      if (searchTerm) {
        params.set("search", searchTerm)
      }
      router.push(`/marketplace?${params.toString()}`)
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20 opacity-80"></div>
        <div className="absolute bottom-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center group">
            <span className="text-2xl font-bold font-space">
              <span className="text-white group-hover:text-gray-200 transition-colors">Learn</span>
              <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-indigo-400 group-hover:to-blue-400 transition-all duration-300">EX</span>
            </span>
        </Link>

        {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
          <Link 
            href="/" 
              className={`group relative text-sm font-medium tracking-wide transition-colors ${
              isActiveLink('/') 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="font-space">Home</span>
              {isActiveLink('/') && (
                <span className="absolute -bottom-[22px] left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></span>
              )}
          </Link>
          <Link 
            href="/marketplace" 
              className={`group relative text-sm font-medium tracking-wide transition-colors ${
              isActiveLink('/marketplace') 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="font-space">Library</span>
              {isActiveLink('/marketplace') && (
                <span className="absolute -bottom-[22px] left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></span>
              )}
          </Link>
          <Link 
            href="/upload" 
              className={`group relative text-sm font-medium tracking-wide transition-colors ${
              isActiveLink('/upload') 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="font-space">Contribute</span>
              {isActiveLink('/upload') && (
                <span className="absolute -bottom-[22px] left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></span>
              )}
          </Link>
          <Link 
            href="/my-materials" 
              className={`group relative text-sm font-medium tracking-wide transition-colors ${
              isActiveLink('/my-materials') 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="font-space">My Collection</span>
              {isActiveLink('/my-materials') && (
                <span className="absolute -bottom-[22px] left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></span>
              )}
          </Link>
          <Link 
            href="/organization" 
              className={`group relative text-sm font-medium tracking-wide transition-colors ${
              isActiveLink('/organization') 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
            }`}
          >
            <span className="font-space">Organization</span>
              {isActiveLink('/organization') && (
                <span className="absolute -bottom-[22px] left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></span>
              )}
          </Link>
          </div>
        </div>

 {/* Search Component - Desktop */} 
        <div className="hidden md:block md:w-1/3 max-w-[500px]">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-20">
              <Search className="h-4 w-4 text-purple-400" />
            </div>
            
            <div className="relative group">
              <Input
                type="text"
                placeholder="Search the knowledge library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border-none glass-input pl-9 pr-12 text-white 
                  shadow-lg shadow-purple-900/30 backdrop-blur-sm placeholder:text-slate-500
                  focus:ring-2 focus:ring-purple-900/50 relative z-10 text-sm font-space
                  bg-slate-950/70 transition-all duration-300
                  group-hover:shadow-purple-800/40 group-hover:bg-slate-950/80"
              />
              
              {/* 3D effect elements */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-blue-900/60 p-[1px] -z-0 blur-[0.5px] group-hover:blur-0 transition-all duration-300"></div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-950/50 via-indigo-950/50 to-blue-950/50 p-[1px] -z-0 translate-y-[2px] translate-x-[2px] blur-[1px] group-hover:translate-y-[3px] group-hover:translate-x-[3px] group-hover:blur-[1.5px] transition-all duration-300"></div>
              
              {/* Sort button inside search box */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-20">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger 
                    className="h-7 border-0 bg-transparent text-white/80 
                      hover:text-white focus:ring-0 focus:ring-offset-0 p-0 flex items-center gap-1"
                  >
                    <ArrowUpDown className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-purple-400">
                      {sortBy === "newest" ? "New" : 
                       sortBy === "price-low" ? "Low" : 
                       sortBy === "price-high" ? "High" : "Sort"}
                    </span>
                  </SelectTrigger>
                  <SelectContent 
                    className="rounded-lg border border-slate-800/70 bg-slate-950/90 
                      text-white shadow-xl shadow-purple-900/20 backdrop-blur-md min-w-[160px]"
                    align="end"
                  >
                    <SelectItem 
                      value="newest"
                      className="hover:bg-purple-900/20 focus:bg-purple-900/20"
                    >
                      Newest First
                    </SelectItem>
                    <SelectItem 
                      value="price-low"
                      className="hover:bg-purple-900/20 focus:bg-purple-900/20"
                    >
                      Price: Lowest
                    </SelectItem>
                    <SelectItem 
                      value="price-high"
                      className="hover:bg-purple-900/20 focus:bg-purple-900/20"
                    >
                      Price: Highest
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side Buttons */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <WalletButton />
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-slate-800/50">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>




      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-white/10 bg-black/80 backdrop-blur-xl md:hidden">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-blue-600/10 opacity-80"></div>
            <div className="absolute bottom-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 py-5">
            {/* Mobile Search Component */}
            <form onSubmit={handleSearch} className="relative mb-5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-20">
                <Search className="h-4 w-4 text-purple-400" />
              </div>
              
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search the knowledge library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-lg border-none glass-input pl-9 pr-12 text-white 
                    shadow-lg shadow-purple-900/30 backdrop-blur-sm placeholder:text-slate-500
                    focus:ring-2 focus:ring-purple-900/50 relative z-10 font-space
                    bg-slate-950/70 transition-all duration-300
                    group-hover:shadow-purple-800/40 group-hover:bg-slate-950/80"
                />
                
                {/* 3D effect elements */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-blue-900/60 p-[1px] -z-0 blur-[0.5px] group-hover:blur-0 transition-all duration-300"></div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-950/50 via-indigo-950/50 to-blue-950/50 p-[1px] -z-0 translate-y-[2px] translate-x-[2px] blur-[1px] group-hover:translate-y-[3px] group-hover:translate-x-[3px] group-hover:blur-[1.5px] transition-all duration-300"></div>
                
                {/* Sort button inside search box - mobile */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-20">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger 
                      className="h-7 border-0 bg-transparent text-white/80 
                        hover:text-white focus:ring-0 focus:ring-offset-0 p-0 flex items-center gap-1"
                    >
                      <ArrowUpDown className="h-4 w-4 text-purple-400" />
                      <span className="text-xs text-purple-400">
                        {sortBy === "newest" ? "New" : 
                         sortBy === "price-low" ? "Low" : 
                         sortBy === "price-high" ? "High" : "Sort"}
                      </span>
                    </SelectTrigger>
                    <SelectContent 
                      className="rounded-lg border border-slate-800/70 bg-slate-950/90 
                        text-white shadow-xl shadow-purple-900/20 backdrop-blur-md min-w-[160px]"
                      align="end"
                    >
                      <SelectItem 
                        value="newest"
                        className="hover:bg-purple-900/20 focus:bg-purple-900/20"
                      >
                        Newest First
                      </SelectItem>
                      <SelectItem 
                        value="price-low"
                        className="hover:bg-purple-900/20 focus:bg-purple-900/20"
                      >
                        Price: Lowest
                      </SelectItem>
                      <SelectItem 
                        value="price-high"
                        className="hover:bg-purple-900/20 focus:bg-purple-900/20"
                      >
                        Price: Highest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>

            <div className="flex flex-col space-y-5">
              <Link
                href="/"
                className={`text-base font-medium font-space ${isActiveLink('/') ? 'text-gradient-blue-purple' : 'text-white/80 hover:text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className={`text-base font-medium font-space ${isActiveLink('/marketplace') ? 'text-gradient-blue-purple' : 'text-white/80 hover:text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/upload"
                className={`text-base font-medium font-space ${isActiveLink('/upload') ? 'text-gradient-blue-purple' : 'text-white/80 hover:text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                Upload
              </Link>
              <Link
                href="/my-materials"
                className={`text-base font-medium font-space ${isActiveLink('/my-materials') ? 'text-gradient-blue-purple' : 'text-white/80 hover:text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                My Materials
              </Link>
              <Link
                href="/organization"
                className={`text-base font-medium font-space ${isActiveLink('/organization') ? 'text-gradient-blue-purple' : 'text-white/80 hover:text-white'}`}
                onClick={() => setIsOpen(false)}
              >
                Organization
              </Link>
              
              <div className="pt-2">
                <WalletButton isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

