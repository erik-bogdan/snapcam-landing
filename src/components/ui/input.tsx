import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends Omit<React.ComponentProps<"input">, 'prefix' | 'suffix'> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

function Input({ prefix, suffix, className, type, ...props }: InputProps) {
  return (
    <div
      className={cn(
        "mt-2 flex items-center w-full h-9 min-w-0 rounded-sm border border-input bg-transparent  transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] dark:bg-input/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
    >
      {prefix && (
        <span className="ml-3 mr-2 text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        className="flex-1 h-full w-full bg-transparent border-none px-2 py-5 text-base  selection:bg-primary selection:text-primary-foreground outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      {suffix && (
        <span className="mr-3 ml-2 text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  )
}

export { Input }

