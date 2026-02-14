"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { isDarkMode?: boolean }
>(({ className, isDarkMode, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track
            className={cn(
                "relative h-1.5 w-full grow overflow-hidden rounded-full",
                isDarkMode ? "bg-white/20" : "bg-slate-200"
            )}
        >
            <SliderPrimitive.Range className={cn("absolute h-full", isDarkMode ? "bg-white" : "bg-emerald-600")} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
            className={cn(
                "block h-4 w-4 rounded-full border shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
                isDarkMode
                    ? "border-white bg-black ring-offset-black focus-visible:ring-white"
                    : "border-emerald-600 bg-white ring-offset-white focus-visible:ring-emerald-600"
            )}
        />
    </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
