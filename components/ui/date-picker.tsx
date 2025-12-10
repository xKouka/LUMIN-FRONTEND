"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    fromYear?: number
    toYear?: number
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
}

export function DatePicker({
    date,
    setDate,
    fromYear = 1900,
    toYear = new Date().getFullYear() + 10,
    captionLayout = "dropdown"
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date && !isNaN(date.getTime()) ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={es}
                    fromYear={fromYear}
                    toYear={toYear}
                    captionLayout={captionLayout}
                />
            </PopoverContent>
        </Popover >
    )
}
