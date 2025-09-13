"use client"

import { useMemo, useState } from "react"
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
  onAddProduct: () => void;
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4">

                {/* Input de Búsqueda por Cliente (o ID de Venta) */}
                <Input
                    placeholder="Filtrar por cliente..." // Cambiado para reflejar el nuevo contexto
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} // Filtrar por el nombre del cliente
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="w-full md:w-1/5 bg-white"
                />

                {/* Boton para agregar venta */}
                <Button variant="outline" className="cursor-pointer" onClick={onAddProduct}>
                  + Nueva Venta
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

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Total Ventas
                    </h3>
                    <p className="text-2xl font-bold">
                        203
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Aprobadas
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                        198
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Pendientes
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        5
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Rechazadas
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                        0
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Ingresos Totales
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                        $370.132,11
                        {/* {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                        }).format(salesStats.totalRevenue)} */}
                    </p>{" "}
                </div>
            </div>


        </div>
    )
}