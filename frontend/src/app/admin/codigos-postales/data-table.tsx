"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Importa Button
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title: string; // Nueva prop para el título
  onCreateNew?: () => void; // Nueva prop para la función de crear
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title, // Desestructura el título
    onCreateNew, // Desestructura la función de crear
} : DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
        sorting,
        columnFilters,
        },
    });

    return (
        <div>
            {/* Título y Botón de Crear */}
            <div className="my-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">{title}</h1>
            </div>

            {/* Headers de la Tabla y Input de Búsqueda */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4">
                {/* Input de Búsqueda por Nombre de Zona o Ciudad/Provincia */}
                <Input
                    placeholder="Filtrar por zona, provincia o ciudad..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="w-full md:w-1/4 bg-white"
                />

                {onCreateNew && ( 
                <Button onClick={onCreateNew} className="w-full md:w-1/4 cursor-pointer">
                    + Nueva Zona de Envío
                </Button>
                )}
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
                            );
                            })}
                        </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            >
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
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No hay resultados que coincidan con la búsqueda.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}