"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      duration={4000}
      richColors
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          success: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-green-500 group-[.toast]:to-emerald-500 group-[.toast]:text-white group-[.toast]:border-green-400 group-[.toast]:shadow-green-500/25",
          error: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-red-500 group-[.toast]:to-pink-500 group-[.toast]:text-white group-[.toast]:border-red-400 group-[.toast]:shadow-red-500/25",
          warning: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-orange-500 group-[.toast]:to-amber-500 group-[.toast]:text-white group-[.toast]:border-orange-400 group-[.toast]:shadow-orange-500/25",
          info: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-500 group-[.toast]:to-cyan-500 group-[.toast]:text-white group-[.toast]:border-blue-400 group-[.toast]:shadow-blue-500/25",
          description: "group-[.toast]:text-white/90",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-gray-900 group-[.toast]:hover:bg-gray-100",
          cancelButton: "group-[.toast]:bg-gray-800 group-[.toast]:text-white group-[.toast]:hover:bg-gray-700",
        },
      }}
      style={{
        "--normal-bg": "var(--popover)" as unknown as string,
        "--normal-text": "var(--popover-foreground)" as unknown as string,
        "--normal-border": "var(--border)" as unknown as string,
      } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster }

