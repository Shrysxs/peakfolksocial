import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 no-select fast-click hover-lift",
  {
    variants: {
      variant: {
        default: "bg-peakfolk-orange text-black hover:bg-[#FF8533] glow-orange focus-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 glow-white",
        outline:
          "border-2 border-peakfolk-orange text-peakfolk-orange bg-transparent hover:bg-peakfolk-orange/10 hover:border-[#FF8533] focus-glow",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 glow-white",
        ghost: "hover:bg-white/10 hover:text-white text-peakfolk-grey focus-glow",
        link: "text-peakfolk-orange underline-offset-4 hover:underline glow-orange-text",
      },
      size: {
        default: "h-12 px-6 py-3 touch-target",
        sm: "h-10 rounded-lg px-4 touch-target",
        lg: "h-14 rounded-xl px-8 text-base touch-target",
        icon: "h-12 w-12 touch-target",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
