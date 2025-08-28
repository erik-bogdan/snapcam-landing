"use client"

import * as React from "react"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Válasszon dátumot",
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full h-12 justify-start text-left font-normal bg-white/70 backdrop-blur-md border-white/50 focus:border-purple-500 focus:ring-purple-500",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: hu }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[260px] w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={hu}
          classNames={{
            head_cell: "text-xs font-normal px-1 py-0.5",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

