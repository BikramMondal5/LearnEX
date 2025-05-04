"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import NFTCard from "@/components/nft-card"
import NFTModal from "@/components/nft-modal"
import Loader from "@/components/ui/cube-loader"
import { getAllMaterials } from "@/lib/blockchain"
import { useWallet } from "@/hooks/use-wallet"
import ClientOnly from "@/lib/client-only"
import SimpleFallback from "@/components/simple-fallback"

interface MaterialItem {
  id: string
  title: string
  description: string
  price: string
  author: string
  category: string
  image: string
  createdAt: string
  isActive: boolean
}

const CATEGORIES = [
  "All",
  "Blockchain",
  "Programming",
  "Design",
  "Business", 
  "Mathematics",
  "Science",
  "Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Literature",
  "History",
  "Economics",
  "Other"
]

// Function to get gradient based on subject category
function getCategoryGradient(subject: string): string {
  switch (subject?.toLowerCase()) {
    case 'all':
      return 'from-purple-700 via-violet-600 to-blue-600' // Default all categories
    case 'mathematics':
      return 'from-blue-700 via-indigo-600 to-purple-600'
    case 'chemistry':
      return 'from-green-700 via-teal-600 to-cyan-600'
    case 'physics':
      return 'from-purple-700 via-indigo-600 to-blue-600'
    case 'biology':
      return 'from-green-700 via-emerald-600 to-teal-600'
    case 'computer science':
      return 'from-blue-700 via-indigo-600 to-violet-600'
    case 'literature':
      return 'from-amber-700 via-orange-600 to-red-600'
    case 'history':
      return 'from-red-700 via-rose-600 to-pink-600'
    case 'economics':
      return 'from-emerald-700 via-green-600 to-teal-600'
    case 'blockchain':
      return 'from-purple-700 via-violet-600 to-blue-600'
    case 'programming':
      return 'from-blue-700 via-cyan-600 to-teal-600'
    case 'design':
      return 'from-pink-700 via-purple-600 to-indigo-600'
    case 'business':
      return 'from-blue-700 via-indigo-600 to-purple-600'
    case 'science':
      return 'from-cyan-700 via-blue-600 to-indigo-600'
    case 'language':
      return 'from-yellow-700 via-orange-600 to-red-600'
    default:
      return 'from-slate-700 via-slate-600 to-gray-600' // For "Other" or any undefined
  }
}

const PAGE_SIZE = 20;

export default function MarketplacePage() {
  const { currentAccount } = useWallet()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  // Get search term from URL parameters
  useEffect(() => {
    if (searchParams) {
      // Get search param
      const search = searchParams.get("search")
      if (search) {
        setSearchTerm(search)
      } else {
        setSearchTerm("")
      }
      
      // Get sort param
      const sort = searchParams.get("sort")
      if (sort && ["newest", "price-low", "price-high"].includes(sort)) {
        setSortBy(sort)
      }
    }
  }, [searchParams])

  // Place all useEffect hooks here, before any functions or rendering logic
  useEffect(() => {
    setMaterials([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, [searchTerm, category, sortBy]);

  useEffect(() => {
    if (page === 0) {
      fetchMaterials(0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, category, sortBy]);

  // Fetch materials in pages
  const fetchMaterials = async (pageToFetch = 0, reset = false) => {
    setIsLoading(true)
    try {
      console.log(`Fetching materials: page ${pageToFetch}, limit ${PAGE_SIZE}`)
      const fetchedMaterials = await getAllMaterials(pageToFetch * PAGE_SIZE, PAGE_SIZE)
      console.log(`Received ${fetchedMaterials.length} materials from getAllMaterials`)
      
      const formattedMaterials = fetchedMaterials
        .filter(material => 
          material?.id &&
          material?.title?.trim() &&
          material?.description?.trim() &&
          material?.price &&
          material?.owner?.trim() &&
          material?.category?.trim() &&
          material?.createdAt
        )
        .map(material => ({
          id: material.id.toString(),
          title: material.title.trim(),
          description: material.description.trim(),
          price: `${material.price} ETH`,
          author: material.owner.trim(),
          category: material.category.trim(),
          image: "/placeholder.svg?height=400&width=400",
          createdAt: material.createdAt,
          isActive: material.isActive ?? true
        }))
      
      console.log(`Formatted ${formattedMaterials.length} valid materials`)
      setMaterials(prev => reset ? formattedMaterials : [...prev, ...formattedMaterials])
      setHasMore(formattedMaterials.length === PAGE_SIZE)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching materials:", err)
      let errorMessage = "Failed to load marketplace items. Please try again later."
      
      if (err?.message) {
        if (err.message.includes("could not decode result data")) {
          errorMessage = "No materials data found. The contract may not have any listed materials yet."
        } else if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and wallet setup."
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle URL item parameter
  useEffect(() => {
    if (!searchParams) return;
    
    const itemIdParam = searchParams.get("item")
    
    if (itemIdParam && materials.length > 0) {
      // Find the item with the matching ID
      const foundItem = materials.find(item => item.id === itemIdParam)
      
      if (foundItem) {
        // Open the modal with the found item
        setSelectedItem(foundItem)
        setIsModalOpen(true)
      }
    }
  }, [searchParams, materials])

  // Filtering and sorting (apply to all loaded materials)
  const filteredItems = materials.filter(
        (item) =>
      (!searchTerm ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (category === "All" ||
        item.category.toLowerCase() === category.toLowerCase() ||
        (item.category.toLowerCase() === 'computer-science' && category.toLowerCase() === 'computer science'))
  ).sort((a, b) => {
    if (sortBy === "price-low") {
      return parseFloat(a.price) - parseFloat(b.price)
    } else if (sortBy === "price-high") {
      return parseFloat(b.price) - parseFloat(a.price)
    } else if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0;
  });

  const openModal = (item: MaterialItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  // Load more handler
  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      fetchMaterials(page + 1)
      setPage(prev => prev + 1)
    }
  }

  return (
    <main className="min-h-screen pt-12">
      <ClientOnly fallback={<SimpleFallback />}>
        <SpaceBackground 
          density={1500} 
          speed={0.0003} 
          shootingStars={true}
          cosmicDust={true}
          colorTheme="mixed"
          parallax={true}
          twinkleEffects={true}
        />
      </ClientOnly>

      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-slate-900/0 to-transparent" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-6 max-w-6xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap justify-center gap-1">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    size="sm"
                    className={`${
                      category === cat 
                        ? `bg-gradient-to-r ${getCategoryGradient(cat)} border-0 text-white` 
                        : 'border-slate-700 text-white hover:bg-black/20'
                    } text-[14px] px-2 py-1 h-auto transition-all duration-300`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-2">
              {isLoading && (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-20 w-20 mb-6">
                      <Loader size="lg" color="purple" />
                    </div>
                   
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-800 bg-black/50 p-8 backdrop-blur-sm">
                  <p className="text-center text-red-400">{error}</p>
                  <Button 
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {!isLoading && !error && filteredItems.length === 0 && (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-slate-800 bg-black/50 p-8 backdrop-blur-sm">
                  {materials.length === 0 ? (
                    <p className="text-center text-slate-400">
                      No materials are currently listed in the marketplace.
                    </p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="mb-6 w-64 h-64">
                        <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Enhanced Search Results Not Found SVG */}
                          {/* Large magnifying glass */}
                          <circle cx="120" cy="120" r="50" stroke="#A855F7" strokeWidth="4" fill="#0F172A" fillOpacity="0.7" />
                          <circle cx="120" cy="120" r="47" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
                          <line x1="157" y1="157" x2="190" y2="190" stroke="#A855F7" strokeWidth="8" strokeLinecap="round" />
                          <line x1="120" y1="90" x2="120" y2="150" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />
                          <line x1="90" y1="120" x2="150" y2="120" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />
                          
                          {/* Handle of magnifying glass */}
                          <path d="M185 185 L205 205" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
                          
                          {/* Subtle glow around magnifying glass */}
                          <circle cx="120" cy="120" r="55" fill="url(#purpleGlow)" fillOpacity="0.15" />
                          
                          {/* Expanded cosmic particle field */}
                          <circle cx="40" cy="40" r="4" fill="#8B5CF6">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="190" cy="60" r="5" fill="#A855F7">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="220" cy="140" r="3" fill="#6366F1">
                            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="30" cy="170" r="4" fill="#EC4899">
                            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="160" cy="30" r="5" fill="#8B5CF6">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="70" cy="210" r="3" fill="#6366F1">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="210" cy="210" r="4" fill="#A855F7">
                            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.7s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="20" cy="100" r="3" fill="#EC4899">
                            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.3s" repeatCount="indefinite" />
                          </circle>
                          
                          {/* Additional animated sparkles */}
                          <path d="M195 75L197 80L202 82L197 84L195 89L193 84L188 82L193 80L195 75Z" fill="#8B5CF6">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M65 30L67 35L72 37L67 39L65 44L63 39L58 37L63 35L65 30Z" fill="#EC4899">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
                          </path>
                          <path d="M170 200L172 205L177 207L172 209L170 214L168 209L163 207L168 205L170 200Z" fill="#6366F1">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
                          </path>
                          <path d="M35 210L37 215L42 217L37 219L35 224L33 219L28 217L33 215L35 210Z" fill="#A855F7">
                            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.8s" repeatCount="indefinite" />
                          </path>
                          <path d="M110 25L112 30L117 32L112 34L110 39L108 34L103 32L108 30L110 25Z" fill="#6366F1">
                            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3.2s" repeatCount="indefinite" />
                          </path>
                          
                          {/* Gradient definitions */}
                          <defs>
                            <radialGradient id="purpleGlow" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
                              <stop offset="0%" stopColor="#A855F7" />
                              <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  )}
                  {!currentAccount && materials.length === 0 && (
                    <p className="mt-4 text-center text-slate-400">
                      Connect your wallet to list your own study materials.
                    </p>
                  )}
                </div>
              )}

              {!isLoading && !error && filteredItems.length > 0 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item, index) => (
                      <NFTCard key={item.id} item={item} onClick={() => openModal(item)} index={index} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <Button onClick={loadMoreItems} disabled={isLoading}>
                        {isLoading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedItem && (
        <NFTModal isOpen={isModalOpen} onClose={closeModal} item={selectedItem} />
      )}
    </main>
  )
}
