"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Image from "next/image"
import { getIPFSGatewayUrl, isValidIPFSCid } from "@/lib/pinning-service"

interface NFTCardProps {
  item: {
    id: string
    title: string
    description: string
    price: string
    author: string
    category: string
    image?: string
    thumbnailHash?: string
    rating?: number
    sales?: number
  }
  onClick: () => void
  index?: number
}

// Function to get gradient based on subject category
function getSubjectGradient(subject: string): string {
  switch (subject?.toLowerCase()) {
    case 'mathematics':
      return 'from-blue-700 via-indigo-600 to-purple-600'
    case 'chemistry':
      return 'from-green-700 via-teal-600 to-cyan-600'
    case 'physics':
      return 'from-purple-700 via-indigo-600 to-blue-600'
    case 'biology':
      return 'from-green-700 via-emerald-600 to-teal-600'
    case 'computer science':
    case 'computer-science':
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
      return 'from-purple-700 via-violet-600 to-blue-600' // Default gradient
  }
}

// Puzzle piece component
const PuzzlePiece = ({ 
  animationDelay, 
  children 
}: { 
  animationDelay: number;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 20 - 10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: animationDelay,
      }}
    >
      {children}
    </motion.div>
  );
};

export default function NFTCard({ item, onClick, index = 0 }: NFTCardProps) {
  const [thumbnailError, setThumbnailError] = useState(false)
  const hasThumbnail = item.thumbnailHash && isValidIPFSCid(item.thumbnailHash)
  const thumbnailUrl = hasThumbnail ? getIPFSGatewayUrl(item.thumbnailHash!) : ""
  
  // Create a 3x3 grid for puzzle animation
  const baseDelay = 0.05 + (index * 0.03); // Add slight delay based on card index for staggered effect
  const puzzlePieces = [];
  const rows = 3;
  const cols = 3;
  
  for (let i = 0; i < rows * cols; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const delay = baseDelay + (row * 0.05) + (col * 0.05);
    
    puzzlePieces.push(
      <PuzzlePiece key={i} animationDelay={delay}>
        <div 
          className="absolute" 
          style={{
            top: `${(row / rows) * 100}%`,
            left: `${(col / cols) * 100}%`,
            width: `${100 / cols}%`,
            height: `${100 / rows}%`,
          }}
        />
      </PuzzlePiece>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: baseDelay * 0.5 }}
      className={`group relative h-full cursor-pointer overflow-hidden rounded-xl border border-slate-800/50 bg-gradient-to-br ${getSubjectGradient(
        item.category
      )} p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] hover:-translate-y-1`}
      onClick={onClick}
    >
      {/* Blockchain pattern overlay with improved opacity */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-20"
        style={{
          backgroundImage: "url('/backgrounds/blockchain-pattern.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      <div className="relative z-10">
        {/* Image container with improved shadows */}
        <div className="relative mb-5 aspect-square overflow-hidden rounded-lg ring-1 ring-white/10">
          {/* Puzzle animation container */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {puzzlePieces}
          </div>
          
          {hasThumbnail && !thumbnailError ? (
            <>
              <Image
                src={thumbnailUrl}
                alt={item.title}
                width={300}
                height={300}
                className="h-full w-full object-cover"
                onError={() => setThumbnailError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
            </>
          ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-[2px]">
              {/* Category-based icon/background */}
              <div className="flex h-full items-center justify-center">
                {item.category?.toLowerCase() === "mathematics" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M12 2v20M2 12h20" />
                      <path d="M19 5L5 19M5 5l14 14" />
                    </svg>
                    <div className="mt-2 text-sm font-medium text-blue-400">Mathematics</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "chemistry" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-green-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M9 3h6m-3 0v6m-8 2h2m4 0h-2v8l-2 2m14-10h2m-4 0h-2v8l2 2m-7-6h4" />
                    </svg>
                    <div className="mt-2 text-sm font-medium text-green-400">Chemistry</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "physics" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-indigo-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    <div className="mt-2 text-sm font-medium text-indigo-400">Physics</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "biology" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M3 12h4l3 8l4-16l3 8h4"></path>
                    </svg>
                    <div className="mt-2 text-sm font-medium text-emerald-400">Biology</div>
                  </div>
                )}
                {(item.category?.toLowerCase() === "computer science" || item.category?.toLowerCase() === "computer-science") && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect>
                      <line x1="2" y1="20" x2="22" y2="20"></line>
                      <line x1="12" y1="16" x2="12" y2="20"></line>
                    </svg>
                    <div className="mt-2 text-sm font-medium text-cyan-400">Computer Science</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "literature" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <div className="mt-2 text-sm font-medium text-amber-400">Literature</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "history" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-orange-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div className="mt-2 text-sm font-medium text-orange-400">History</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "economics" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-lime-400"
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
                    <div className="mt-2 text-sm font-medium text-lime-400">Economics</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "blockchain" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-purple-400"
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
                    <div className="mt-2 text-sm font-medium text-purple-400">Blockchain</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "programming" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-blue-400"
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
                    <div className="mt-2 text-sm font-medium text-blue-400">Programming</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "design" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-pink-400"
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
                    <div className="mt-2 text-sm font-medium text-pink-400">Design</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "business" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-indigo-400"
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
                    <div className="mt-2 text-sm font-medium text-indigo-400">Business</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "science" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-cyan-400"
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
                    <div className="mt-2 text-sm font-medium text-cyan-400">Science</div>
                  </div>
                )}
                {item.category?.toLowerCase() === "language" && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-yellow-400"
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
                    <div className="mt-2 text-sm font-medium text-yellow-400">Language</div>
              </div>
                )}
                {!["mathematics", "chemistry", "physics", "biology", 
                  "computer science", "computer-science", "literature", "history", 
                  "economics", "blockchain", "programming", "design", "business",
                  "science", "language"].includes(item.category?.toLowerCase()) && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-purple-400"
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
                    <div className="mt-2 text-sm font-medium text-purple-400">{item.category}</div>
          </div>
                )}
              </div>
            </div>
          )}
            </div>

        {/* Title and details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: baseDelay + 0.2 }}
        >
          <h3 className="mb-1 line-clamp-1 font-medium text-white">{item.title}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-white/70">{item.description}</p>
        </motion.div>

        {/* Price and category */}
        <motion.div 
          className="mt-3 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: baseDelay + 0.3 }}
        >
          <div className="flex items-center">
            <div className="flex flex-col">
              <span className="text-xs text-white/60">Price</span>
              <span className="font-medium text-white">{item.price}</span>
            </div>
          </div>
          <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
            {item.category}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
