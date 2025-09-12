"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export interface ProductoAPI {
  id: number;
  productName: string; 
  productDescription: string; 
  categories: string[];
  sellingPrice: string; 
  stock: string;
  imageUrl: string; 
}

export const columns: ColumnDef<ProductoAPI>[] = [
  {
    accessorKey: "productName", // Adaptado al nuevo nombre
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nombre de Producto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "productDescription", // Adaptado al nuevo nombre
    header: "Descripción",
  },
  {
    accessorKey: "categories", // Adaptado al nuevo nombre
    header: "Categorías",
    cell: ({ row }) => {
      const categories = row.getValue("categories") as string[];
      if (!categories || categories.length === 0) return "—";
      return (
        <ul className="text-sm list-disc list-inside">
          {categories.map((cat, i) => (
            <li key={i}>{cat}</li>
          ))}
        </ul>
      );
    },
  },
  {
    accessorKey: "sellingPrice", // Adaptado al nuevo nombre
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
  // Si deseas una columna para la imagen, podrías agregar algo así:
  {
    accessorKey: "imageUrl",
    header: "Imagen",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      if (!imageUrl) return "—";
      return <img src={imageUrl} alt="Producto" className="h-12 w-12 object-cover rounded" />;
    },
  },
  // La columna 'is_sellable' y 'components' no existen en tu nuevo JSON.
  // Si necesitas una lógica similar para 'is_sellable', tendrías que inferirla
  // de otras propiedades o agregarla en tu backend.
];