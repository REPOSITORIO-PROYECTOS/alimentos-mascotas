"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, addDays, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"


interface CalendarioHorizontalProps {
    onSelectDate: (date: Date) => void
}

export function CalendarioHorizontal({ onSelectDate }: CalendarioHorizontalProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const daysToShow = 14
    const startDate = startOfWeek(currentDate, { locale: es })
    const dates = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i))

    const handlePrevWeek = () => {
        setCurrentDate(addDays(currentDate, -7))
    }

    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7))
    }

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date)
        onSelectDate(date)
    }

    return (
        <div className="flex items-center justify-center mx-auto space-x-4">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex space-x-2 overflow-x-auto">
                {dates.map((date) => (
                    <Button
                        key={date.toISOString()}
                        variant="outline"
                        className={cn(
                            "flex flex-col items-center h-16 min-w-[70px]",
                            date.toDateString() === new Date().toDateString() && "border-blue-700 bg-blue-600 text-white hover:bg-blue-700 hover:text-blue-100",
                            selectedDate && date.toDateString() === selectedDate.toDateString() && "border-blue-400 bg-blue-300 text-blue-600 hover:bg-blue-400 hover:text-blue-700",
                        )}
                        onClick={() => handleSelectDate(date)}
                    >
                        <span className="text-xs">{format(date, "EEE", { locale: es })}</span>
                        <span className="text-lg font-bold">{format(date, "d", { locale: es })}</span>
                    </Button>
                ))}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

