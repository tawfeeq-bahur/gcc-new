import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border bg-white/5 backdrop-blur-sm px-4 py-2 text-base text-white",
        "border-white/10 placeholder:text-slate-500",
        "shadow-sm transition-all duration-300",
        "hover:border-white/20 hover:bg-white/[0.07]",
        "focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 focus:bg-white/[0.08]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-foreground file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "selection:bg-rose-500 selection:text-white",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
