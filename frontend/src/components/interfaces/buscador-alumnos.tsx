"use client"

import { useState } from "react"


import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Define or import the 'Alumno' type
interface Alumno {
    id: number
    nombre: string
}

interface BuscadorAlumnosProps {

    alumnos: Alumno[]

    onSelectAlumno: (alumno: Alumno) => void

}

export function BuscadorAlumnos({ alumnos, onSelectAlumno }: BuscadorAlumnosProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {value ? alumnos.find((alumno) => alumno.nombre === value)?.nombre : "Buscar alumno..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                {//@ts-ignore
                    <Command>
                        <CommandInput
                            //@ts-ignore
                            placeholder="Buscar alumno..."
                        />

                        {
                            //@ts-ignore
                            <CommandList>

                                {//@ts-ignore
                                    <CommandEmpty>No se encontró ningún alumno.</CommandEmpty>
                                }
                                {
                                    //@ts-ignore
                                    <CommandGroup>
                                        {alumnos.map((alumno) => (
                                            // @ts-ignore
                                            <CommandItem
                                                key={alumno.id}
                                                onSelect={() => {
                                                    setValue(alumno.nombre)
                                                    setOpen(false)
                                                    onSelectAlumno(alumno)
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", value === alumno.nombre ? "opacity-100" : "opacity-0")} />
                                                {alumno.nombre}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>}
                            </CommandList>}
                    </Command>}
            </PopoverContent>
        </Popover>
    )
}

