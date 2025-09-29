// /ventas-online/data-table.tsx
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
  getPaginationRowModel,
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
import { MovementItem } from "./columns"; // Importamos MovementItem para tipado de métricas

// Renombramos la prop para mayor claridad si solo se usa para añadir un movimiento
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAddMovement: () => void; // Renombrado de onAddProduct a onAddMovement
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAddMovement, // Renombrado aquí también
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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
  });

  // === CÁLCULO DE MÉTRICAS DINÁMICAS ===
  // Esto es crucial para que las métricas reflejen los datos reales.
  // Podrías mover esto a page.tsx o a un custom hook si la lógica crece mucho.
  const metrics = useMemo(() => {
    let totalMovements = data.length;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalIngressAmount = 0;

    data.forEach((item) => {
      const movement = item as unknown as MovementItem; // Castear a MovementItem
      if (movement.payment_status === "APPROVED") {
        approvedCount++;
      } else if (movement.payment_status === "PENDING") {
        pendingCount++;
      } else if (movement.payment_status === "REJECTED") {
        rejectedCount++;
      }

      if (movement.movement_type === "INGRESS") {
        totalIngressAmount += parseFloat(movement.amount || "0"); // Sumar ingresos
      }
    });

    return {
      totalMovements,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalIngressAmount,
    };
  }, [data]);
  // === FIN CÁLCULO DE MÉTRICAS DINÁMICAS ===


  return (
    <div>
      {/* Headers de la Tabla */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4">
        {/* Input de Búsqueda por Usuario o Descripción */}
        <Input
          placeholder="Filtrar por usuario o descripción..." // Placeholder más general
          value={(table.getColumn("user_username")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("user_username")?.setFilterValue(event.target.value)
          }
          className="w-full md:w-1/3 bg-white" // Ajustar el ancho si se desea
        />

        {/* Boton para agregar movimiento */}
        <Button variant="outline" className="cursor-pointer" onClick={onAddMovement}>
          + Nuevo Movimiento
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

        {/* Footer Tabla */}
        <div className="flex flex-col sm:flex-row justify-between items-center m-2">
          {/* Control de Filas por Página */}
          <Select
            onValueChange={(value) => {
              table.setPageSize(+value);
            }}
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
            Aprobados
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {metrics.approvedCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pendientes
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {metrics.pendingCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Rechazados
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {metrics.rejectedCount}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Ingresos
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