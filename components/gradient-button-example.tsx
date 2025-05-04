"use client"

import { Button } from "@/components/ui/button"

export default function GradientButtonExample() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-10">
      <h2 className="text-2xl font-bold text-white">Gradient Outline Buttons</h2>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="gradient-outline">
          New to you
        </Button>
        
        <Button variant="gradient-outline" size="lg">
          Larger Button
        </Button>
        
        <Button variant="gradient-outline" className="w-40">
          Fixed Width
        </Button>
        
        <Button variant="gradient-outline" disabled>
          Disabled
        </Button>
      </div>
      
      <div className="mt-8 max-w-md text-center text-slate-300">
        <p>These buttons feature a dark background with a cyan-to-magenta gradient border, creating a modern, eye-catching UI element.</p>
      </div>
    </div>
  )
} 