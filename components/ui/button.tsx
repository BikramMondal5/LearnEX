import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md hover:shadow-purple-500/10",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-sm",
        outline:
          "border border-slate-700 bg-background text-white hover:bg-slate-800/70 hover:text-slate-200 hover:border-slate-600",
        secondary:
          "bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 shadow-sm",
        ghost: "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        "gradient-border": "relative border-none bg-black text-white before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-br before:from-purple-600 before:via-indigo-500 before:to-blue-500 before:-z-10 hover:before:opacity-90 hover:shadow-lg hover:shadow-purple-500/10",
        "cursor-style": "relative bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:from-blue-700 hover:to-purple-700 transition-all duration-300",
        "gradient-outline": "relative text-white border-0 bg-[#1b1b1b] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-r before:from-cyan-500 before:to-pink-500 before:-z-10 hover:bg-[#252525] transition-colors",
        "gradient-subtle": "bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 border border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-900/50",
        "gradient-purple": "bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:from-purple-800 hover:to-indigo-800 shadow-sm hover:shadow-md hover:shadow-purple-500/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "cursor-lg": "h-12 rounded-md px-8 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
