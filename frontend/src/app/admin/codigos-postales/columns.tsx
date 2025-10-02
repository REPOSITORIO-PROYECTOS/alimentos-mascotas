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

export type ShippingZoneItem = {
  id: number;
  name: string;
  province: string;
  city: string;
  postal_codes: string;
  base_cost: string;
  cost_per_kg: string;
  estimated_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  postal_code?: string; 
  shipping_price?: string; 
};

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(numAmount);
};

const getActiveVariant = (isActive: boolean) => {
  return isActive ? "default" : "secondary";
};

interface CreateColumnsOptions {
  onEdit: (zone: ShippingZoneItem) => void;
  onDelete: (zoneId: number) => void;
}

export const createShippingCostColumns = ({ onEdit, onDelete }: CreateColumnsOptions): ColumnDef<ShippingZoneItem>[] => [
{
    accessorKey: "name",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Nombre Zona
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
},
{
    accessorKey: "province",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Provincia
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
},
{
    accessorKey: "city",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Ciudad
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
},
{
    accessorKey: "postal_codes",
    header: "Códigos Postales",
    cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue("postal_codes")}</div>,
},
{
    accessorKey: "base_cost",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Costo Base
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
    cell: ({ row }) => (
    <div className="text-right font-medium">
        {formatCurrency(row.getValue("base_cost"))}
    </div>
    ),
},
{
    accessorKey: "estimated_days",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Días Estimados
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("estimated_days")} días</div>,
},
/* {
    accessorKey: "is_active",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Activa
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
    cell: ({ row }) => {
    const isActive = row.getValue("is_active") as boolean;
    return <Badge variant={getActiveVariant(isActive)}>{isActive ? "Sí" : "No"}</Badge>;
    },
}, 
{
    accessorKey: "created_at",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Fecha Creación
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
    cell: ({ row }) => {
    const date = new Date(row.getValue("created_at"));
    return <span>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>;
    },
},
{
    accessorKey: "updated_at",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Última Actualización
        <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
    ),
    cell: ({ row }) => {
    const date = new Date(row.getValue("updated_at"));
    return <span>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>;
    },
}, 
{
    accessorKey: "cost_per_kg",
    header: ({ column }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        Costo por KG
        <ArrowUpDown className="ml-2 h-4 w-2" />
    </Button>
    ),
    cell: ({ row }) => (
    <div className="text-right font-medium">
        {formatCurrency(row.getValue("cost_per_kg"))}
    </div>
    ),
}, */
{
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
        const shippingZone = row.original;

        return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                    <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

                <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => onEdit(shippingZone)}
                    className="cursor-pointer"
                >
                    Editar
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onDelete(shippingZone.id)} 
                    className="cursor-pointer text-red-600"
                >
                    Eliminar
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
        );
    },
},
];