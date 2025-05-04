"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function FloatingUploadButton() {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 3D floating effect
  useEffect(() => {
    if (!canvasRef.current || !buttonRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    let animationFrameId: number
    const particles: { x: number; y: number; size: number; speed: number; opacity: number; color: string }[] = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: i % 2 === 0 ? "#9333ea" : "#3b82f6", // Purple or blue
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle =
          particle.color +
          Math.floor(particle.opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()

        // Move particles upward
        particle.y -= particle.speed

        // Reset particles that go off screen
        if (particle.y < -particle.size) {
          particle.y = height + particle.size
          particle.x = Math.random() * width
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    if (isHovered) {
      render()
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isHovered])

  return (
    <div className="relative flex justify-center">
      <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {isHovered && (
          <canvas
            ref={canvasRef}
            width="200"
            height="100"
            className="pointer-events-none absolute -inset-y-10 -inset-x-16"
          />
        )}
        <Button
          ref={buttonRef}
          type="submit"
          size="lg"
          variant="gradient-outline"
          className="relative w-full hover:shadow-lg hover:shadow-cyan-500/20 sm:w-auto"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload & Mint NFT
        </Button>
      </div>
    </div>
  )
}

