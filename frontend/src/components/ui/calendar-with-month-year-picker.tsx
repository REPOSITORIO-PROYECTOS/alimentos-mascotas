"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarWithMonthYearPicker({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    const [month, setMonth] = React.useState<Date>(new Date())

    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ]

    const years = Array.from({ length: 124 }, (_, i) => new Date().getFullYear() - i)

    return (
        <DayPicker
            locale={es}
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn("h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn("h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                Caption: ({ displayMonth }) => (
                    <div className="flex justify-center space-x-2">
                        <Select
                            value={displayMonth.getMonth().toString()}
                            onValueChange={(value) => {
                                const newMonth = new Date(displayMonth)
                                newMonth.setMonth(Number.parseInt(value))
                                setMonth(newMonth)
                            }}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue>{months[displayMonth.getMonth()]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month, index) => (
                                    <SelectItem key={month} value={index.toString()}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={displayMonth.getFullYear().toString()}
                            onValueChange={(value) => {
                                const newMonth = new Date(displayMonth)
                                newMonth.setFullYear(Number.parseInt(value))
                                setMonth(newMonth)
                            }}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue>{displayMonth.getFullYear()}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ),
            }}
            month={month}
            onMonthChange={setMonth}
            {...props}
        />
    )
}

export { CalendarWithMonthYearPicker }

