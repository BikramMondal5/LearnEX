"use client"

import Image from "next/image"
import { useState } from "react"
import { getSubjectGradient, getSubjectIcon } from "@/lib/thumbnails"
import { 
  Blocks, Code, Palette, BarChart, Calculator, Atom, 
  Languages, Beaker, Leaf, Cpu, BookOpen, Clock, DollarSign, FileText, Video
} from "lucide-react"

interface SubjectThumbnailProps {
  category: string
  title?: string
  className?: string
  width?: number
  height?: number
  showTitle?: boolean
}

// Map of icon names to their components
const ICON_MAP: Record<string, React.ElementType> = {
  Blocks,
  Code,
  Palette,
  BarChart,
  Calculator,
  Atom,
  Languages,
  Beaker,
  Leaf,
  Cpu,
  BookOpen,
  Clock,
  DollarSign,
  FileText,
  Video
}

export default function SubjectThumbnail({ 
  category, 
  title, 
  className = "", 
  width = 300, 
  height = 200,
  showTitle = false
}: SubjectThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const gradientClasses = getSubjectGradient(category)
  const iconName = getSubjectIcon(category)
  const IconComponent = ICON_MAP[iconName] || FileText

  // Try to load the image from the public folder
  const imagePath = `/thumbnails/${category.toLowerCase().replace(/\s+/g, '-')}.png`

  // If the image fails to load or imageError is true, show a fallback with gradient and icon
  if (imageError) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-lg ${gradientClasses} ${className}`}
        style={{ width, height }}
      >
        <IconComponent className="h-16 w-16 text-white opacity-80" />
        {showTitle && title && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-sm font-medium text-white">
            {title}
          </div>
        )}
      </div>
    )
  }

  // Try to load the image first
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
      <div className={`absolute inset-0 ${gradientClasses}`}></div>
      <Image
        src={imagePath}
        alt={`${category} thumbnail`}
        width={width}
        height={height}
        className="object-cover"
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center">
          <div className="mr-2 rounded-full bg-white/20 p-1">
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white">{category}</span>
        </div>
        {showTitle && title && (
          <h3 className="mt-1 text-base font-bold text-white line-clamp-2">{title}</h3>
        )}
      </div>
    </div>
  )
} 