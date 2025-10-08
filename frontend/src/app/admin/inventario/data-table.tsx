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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onAddProduct: () => void; // Nueva prop para agregar producto
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAddProduct, 
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4">

                {/* Input de Búsqueda por Producto */}
                <Input
                    placeholder="Filtrar por producto"
                    value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("productName")?.setFilterValue(event.target.value)
                    }
                    className="w-full sm:w-1/5 bg-white"
                />

                {/* Boton para agregar producto */}
                <Button variant="outline" className="w-full sm:w-1/5 bg-amber-500 text-white cursor-pointer" onClick={onAddProduct}>
                  + Agregar Artículo
                </Button>
            </div>

            {/* Tabla */}
            <div className="rounded-md border bg-white">
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
                            className="cursor-pointer"
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="cursor-pointer"
                        >
                            Siguiente
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}