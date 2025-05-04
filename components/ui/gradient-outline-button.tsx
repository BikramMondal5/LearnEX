"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GradientOutlineButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function GradientOutlineButton({
  children,
  className,
  size = "default",
  ...props
}: GradientOutlineButtonProps) {
  return (
    <Button
      variant="gradient-outline"
      size={size}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  )
}

// Example usage:
// <GradientOutlineButton>New to you</GradientOutlineButton>
// <GradientOutlineButton size="lg">Larger Button</GradientOutlineButton>
// <GradientOutlineButton className="w-full">Full Width</GradientOutlineButton> 