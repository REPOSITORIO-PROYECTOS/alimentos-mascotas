"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // Importar MoreHorizontal
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Importar DropdownMenu

export interface ProductoAPI {
  id: number;
  productName: string;
  productDescription: string;
  categories: string[];
  sellingPrice: string;
  stock: string;
  imageUrl: string;
}

// Añadimos las props para las acciones de editar/eliminar
export interface ProductColumnProps {
  onEdit: (product: ProductoAPI) => void;
  onDelete: (productId: number) => void;
}

export const createColumns = ({ onEdit, onDelete }: ProductColumnProps): ColumnDef<ProductoAPI>[] => [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nombre de Producto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "productDescription",
    header: "Descripción",
  },
  {
    accessorKey: "categories",
    header: "Categorías",
    cell: ({ row }) => {
      const categories = row.getValue("categories") as string[];
      if (!categories || categories.length === 0) return "—";
      return (
        <ul className="text-sm list-inside">
          {categories.map((cat, i) => (
            <li key={i}>{cat}</li>
          ))}
        </ul>
      );
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "Precio de Venta",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("sellingPrice") as string);
      if (isNaN(value)) return <div>—</div>;
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(value);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as string;
      return <div className="font-medium">{stock}</div>;
    },
  },
  {
    accessorKey: "imageUrl",
    header: "Imagen",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      if (!imageUrl) return "—";
      return <img src={imageUrl} alt="Producto" className="h-12 w-12 object-cover rounded" />;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const product = row.original; 

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

            <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
              Editar
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onDelete(product.id)} className="text-red-600 cursor-pointer">
              Eliminar
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];