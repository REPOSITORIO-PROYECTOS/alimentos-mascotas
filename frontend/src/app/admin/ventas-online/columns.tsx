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
import { Badge } from "@/components/ui/badge"; // Importar Badge para los estados
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Importar Popover para los ítems
import Image from "next/image"; // Usar next/image para optimización

// REEMPLAZAR EL TIPO DE DATO POR EL QUE VIENE EN EL JSON DE MOVIMIENTOS + CADA COLUMNA DE ESTE ARCHIVO:
export type OnlineSaleItem = {
    id: string;
    status: string;
    status_detail: string;
    name: string;
    email: string;
    phone: {
        area_code: string;
        number: string;
    };
    address: {
        zip_code: string;
        street_name: string;
    };
    items: Array<{
        id: string;
        name: string;
        description: string;
        image: string;
        price: string;
        quantity: string;
    }>;
};

// Función para mapear el estado a un color de Badge
const getStatusVariant = (status: string) => {
    switch (status) {
        case "approved":
            return "default"; // O 'success' si tu Badge tiene variantes custom
        case "pending":
            return "secondary"; // O 'warning'
        case "rejected":
            return "destructive"; // O 'error'
        default:
            return "outline";
    }
};

export const createOnlineSalesColumns = (): ColumnDef<OnlineSaleItem>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID Venta
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as OnlineSaleItem["phone"];
      return (
        <span>
          ({phone.area_code}) {phone.number}
        </span>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Dirección de Envío",
    cell: ({ row }) => {
      const address = row.getValue("address") as OnlineSaleItem["address"];
      return (
        <span>
          {address.street_name}, {address.zip_code}
        </span>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Productos",
    cell: ({ row }) => {
      const items = row.getValue("items") as OnlineSaleItem["items"];
      const totalItems = items.reduce((acc, item) => acc + parseInt(item.quantity), 0);
      const totalAmount = items.reduce((acc, item) => acc + parseFloat(item.price) * parseInt(item.quantity), 0);

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8">
              Ver ({totalItems}) ítems
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Detalle de Productos</h4>
                <p className="text-sm text-muted-foreground">
                  Valor Total:{" "}
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(totalAmount)}
                </p>
              </div>
              <div className="grid gap-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    {/* Usamos next/image para optimizar */}
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x{" "}
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(parseFloat(item.price))}
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
    accessorKey: "status",
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusDetail = row.original.status_detail;
      return <Badge variant={getStatusVariant(status)}>{statusDetail}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const sale = row.original;

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
            <DropdownMenuItem onClick={() => alert(`Ver detalles de la venta ${sale.id}`)} className="cursor-pointer">
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Marcar como enviado: ${sale.id}`)} className="cursor-pointer">
              Marcar como Enviado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Cancelar venta: ${sale.id}`)} className="text-red-600 cursor-pointer">
              Cancelar Venta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];