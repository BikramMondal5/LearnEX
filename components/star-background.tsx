"use client"

import { useEffect, useRef } from "react"

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    setCanvasDimensions()

    // Create stars
    const starsArray: Star[] = []
    const numberOfStars = 200

    class Star {
      x: number = 0
      y: number = 0
      size: number = 0
      opacity: number = 0
      speed: number = 0

      constructor() {
        if (!canvas) return
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.8 + 0.2
        this.speed = Math.random() * 0.05 + 0.01
      }

      update() {
        if (!canvas) return
        this.y += this.speed
        
        // Reset star position when it goes off screen
        if (this.y > canvas.height) {
          this.y = 0
          this.x = Math.random() * canvas.width
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize stars
    const init = () => {
      for (let i = 0; i < numberOfStars; i++) {
        starsArray.push(new Star())
      }
    }
    init()

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      for (let i = 0; i < starsArray.length; i++) {
        starsArray[i].update()
        starsArray[i].draw()
      }
      
      requestAnimationFrame(animate)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      setCanvasDimensions()
      starsArray.length = 0
      init()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
} 