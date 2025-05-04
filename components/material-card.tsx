"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { FileText, Video, Calendar } from "lucide-react"
import Image from "next/image"
import { getIPFSGatewayUrl, isValidIPFSCid } from "@/lib/pinning-service"

interface MaterialCardProps {
  material: {
    id: string
    title: string
    description: string
    type: string
    purchaseDate?: string
    creationDate?: string
    formattedDate?: string
    image?: string
    thumbnailHash?: string
    isOwned?: boolean
  }
  onClick: () => void
}

export default function MaterialCard({ material, onClick }: MaterialCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const hasThumbnail = material.thumbnailHash && isValidIPFSCid(material.thumbnailHash)
  const thumbnailUrl = hasThumbnail ? getIPFSGatewayUrl(material.thumbnailHash!) : ""

  // Determine which date label to show
  const dateLabel = material.isOwned ? "Created" : "Purchased"
  const displayDate = material.formattedDate || "N/A"

  return (
    <motion.div
      ref={cardRef}
      className="group relative h-full cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Glowing border effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 opacity-0 transition-all duration-300 ${
          isHovered ? "from-purple-500/30 to-blue-500/30 opacity-100" : ""
        }`}
      ></div>

      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Image with type-based thumbnail */}
        <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
          {hasThumbnail && !thumbnailError ? (
            <>
              <Image
                src={thumbnailUrl}
                alt={material.title}
                width={300}
                height={200}
                className="h-full w-full object-cover"
                onError={() => setThumbnailError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
              {material.type === "pdf" ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
                  <FileText className="h-16 w-16 text-purple-400" />
                  <div className="mt-2 text-sm font-medium text-purple-400">PDF Document</div>
                </div>
              ) : material.type === "video" ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-900/40 to-cyan-900/40">
                  <Video className="h-16 w-16 text-blue-400" />
                  <div className="mt-2 text-sm font-medium text-blue-400">Video Lecture</div>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800/40 to-slate-900/40">
                  <FileText className="h-16 w-16 text-slate-400" />
                  <div className="mt-2 text-sm font-medium text-slate-400">Document</div>
                </div>
              )}
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {material.type.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <h3 className="mb-1 text-lg font-bold text-white">{material.title}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-slate-300">{material.description}</p>

        {/* Details */}
        <div className="flex items-center justify-start text-xs text-slate-400">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span className="mr-1">{dateLabel}:</span> {displayDate}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

