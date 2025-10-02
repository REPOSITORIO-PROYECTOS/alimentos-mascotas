"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

export type MovementItem = {
  id: number; 
  movement_type: "INGRESS" | "EGRESS"; 
  amount: string;
  description: string;
  user_username: string;
  timestamp: string; 
  payment_external_reference: string;
  payment_status: "PENDING" | "APPROVED" | "REJECTED";
  payment_method: string;
  payment_items: {
    [key: string]: string; 
  };
};

// Función para mapear el estado a un color de Badge
const getStatusVariant = (status: string) => {
  switch (status) {
    case "APPROVED": 
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED": 
      return "destructive";
    default:
      return "outline";
  }
};

export const createOnlineSalesColumns = (): ColumnDef<MovementItem>[] => [
  /* {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID Movimiento
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  }, */
  {
    accessorKey: "user_username", // Nuevo: username del usuario
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Usuario
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "movement_type", // Nuevo: Tipo de movimiento
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("movement_type") as MovementItem["movement_type"];
      return (
        <Badge variant={type === "INGRESS" ? "default" : "outline"}>
          {type === "INGRESS" ? "Ingreso" : "Egreso"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Monto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("description")}</div>,
  },
  {
    accessorKey: "payment_method", // Nuevo: Método de pago
    header: "Método de Pago",
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return <span>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>;
    },
  },
  {
    accessorKey: "payment_status", // Se renombra de 'status' a 'payment_status'
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Estado Pago
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("payment_status") as MovementItem["payment_status"];
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "payment_items", // Nuevo: Detalles de ítems de pago
    header: "Detalle Ítems",
    cell: ({ row }) => {
      // === CAMBIO AQUÍ: Añadir una comprobación para asegurar que 'items' es un objeto ===
      const items = row.getValue("payment_items") as MovementItem["payment_items"] | null | undefined; // Permitir null/undefined

      if (!items || Object.keys(items).length === 0) {
        return <span>N/A</span>; // O cualquier otro mensaje/componente para indicar que no hay ítems
      }

      const itemKeys = Object.keys(items);

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8">
              Ver ({itemKeys.length}) detalles
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Detalles del Pago</h4>
              </div>
              <div className="grid gap-2">
                {itemKeys.map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
                      <p className="text-xs text-muted-foreground">
                        {items[key]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const movement = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">

            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => alert(`Ver detalles del movimiento ${movement.id}`)} className="cursor-pointer">
              Ver Detalles
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => alert(`Exportar a PDF: ${movement.id}`)} className="cursor-pointer">
              Exportar a PDF
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];