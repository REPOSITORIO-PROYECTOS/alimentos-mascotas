"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MovementItem } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number; 
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentPage,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
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
      // No necesitamos state.pagination aquí
    },
  });

  // === CÁLCULO DE MÉTRICAS DINÁMICAS ===
  const metrics = useMemo(() => {
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalIngressAmount = 0;

    data.forEach((item) => {
      const movement = item as unknown as MovementItem;
      if (movement.payment_status === "APPROVED") {
        approvedCount++;
      } else if (movement.payment_status === "PENDING") {
        pendingCount++;
      } else if (movement.payment_status === "REJECTED") {
        rejectedCount++;
      }

      if (movement.movement_type === "INGRESS") {
        totalIngressAmount += parseFloat(movement.amount || "0");
      }
    });

    return {
      totalMovements: totalCount, // Usamos totalCount del API
      approvedCount,
      pendingCount,
      rejectedCount,
      totalIngressAmount,
    };
  }, [data, totalCount]); // Agregamos totalCount a las dependencias

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4">
        {/* Input de Búsqueda combinado para usuario y descripción */}
        <Input
          placeholder="Filtrar por usuario o descripción..."
          value={(table.getColumn("user_username")?.getFilterValue() as string) ?? ""} // Usamos user_username para el filtro principal
          onChange={(event) => {
            // Se podría implementar una lógica de filtro más avanzada aquí
            // para buscar en múltiples columnas, pero por simplicidad
            // ahora mismo solo se aplica a user_username.
            table.getColumn("user_username")?.setFilterValue(event.target.value);
            // Si quieres filtrar por descripción también, tendrías que:
            // 1. Modificar el getFilteredRowModel para usar un filtro global.
            // 2. O aplicar el filtro a otra columna también (ej. description).
            // Por ejemplo: table.getColumn("description")?.setFilterValue(event.target.value);
          }}
          className="w-full md:w-1/5 bg-white"
        />
      </div>

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

        <div className="flex flex-col sm:flex-row justify-between items-center m-2">
          <Select
            onValueChange={(value) => {
              onPageSizeChange(Number(value)); // Llama a la prop para actualizar en page.tsx
            }}
            defaultValue={pageSize.toString()} // Asegura que el valor inicial se muestre
          >
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

          <div className="flex items-center justify-end space-x-2 py-4 mx-2">
            <span className="flex-shrink-0 text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({totalCount} movimientos)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0} // Deshabilitar si es la última página o no hay páginas
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Movimientos
          </h3>
          <p className="text-2xl font-bold">{metrics.totalMovements}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Aprobados (Pág. Actual)
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {metrics.approvedCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pendientes (Pág. Actual)
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {metrics.pendingCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Rechazados (Pág. Actual)
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {metrics.rejectedCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Ingresos (Pág. Actual)
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
            }).format(metrics.totalIngressAmount)}
          </p>{" "}
        </div>
      </div>
    </div>
  );
}