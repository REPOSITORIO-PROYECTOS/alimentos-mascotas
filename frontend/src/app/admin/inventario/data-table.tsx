"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    /* const token = useAuthStore((state) => state.token); */

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
        sorting,
        columnFilters,
        },
    })

    return (

        <div>
            {/* Headers de la Tabla */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4">

                <div className="flex flex-col md:flex-row gap-2">
                    {/* Input de Búsqueda por Producto */}
                    <Input
                        placeholder="Filtrar por producto"
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="w-full md:w-1/2"
                    />

                    {/* Input de Búsqueda por Código de Barras */}
                    {/* <Input
                        placeholder="Filtrar por código de barras"
                        value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("id")?.setFilterValue(event.target.value)
                        }
                        className="w-full md:w-1/2"
                    /> */}
                </div>
                

                {/* Boton para agregar producto */}
                <Button variant="outline" className="cursor-pointer"/* onClick={handleSyncArticulos} */>+ Agregar Artículo</Button>

            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (

                        <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                    )}
                            </TableHead>
                            )
                        })}
                        </TableRow>
                    ))}
                    </TableHeader>

                    <TableBody>
                    {table.getRowModel().rows?.length ? (

                        table.getRowModel().rows.map((row) => (

                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>

                            {/* Filas Tabla */}
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="px-6">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}

                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No hay resultados que coincidan con la búsqueda.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>

                {/* Footer Tabla */}
                <div className="flex flex-col sm:flex-row justify-between items-center m-2">

                    {/* Control de Filas por Página */}
                    <Select onValueChange={(value) => {  table.setPageSize(+value) }}>
                        <SelectTrigger className="w-[100px] m-2 cursor-pointer">
                            <SelectValue placeholder="10 filas" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Filas por Página</SelectLabel>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="40">40</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Controles de Paginación */}
                    <div className="flex items-center justify-end space-x-2 py-4 mx-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                        Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                        Siguiente
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}