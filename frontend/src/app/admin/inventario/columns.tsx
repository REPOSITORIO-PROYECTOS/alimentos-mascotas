"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export interface ProductoAPI {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;     // llega como string
  stock: string;     // llega como string
  image: string;
  is_sellable: boolean;
  components: {
    component: number;
    component_name: string;
    quantity: string;
    merma_percentage: string;
  }[];
}

export const columns: ColumnDef<ProductoAPI>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nombre de Producto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("price") as string);
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
    accessorKey: "is_sellable",
    header: "Vendible",
    cell: ({ row }) => {
      const isSellable = row.getValue("is_sellable") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded text-xs ${
            isSellable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isSellable ? "Sí" : "No"}
        </span>
      );
    },
  },
  {
    accessorKey: "components",
    header: "Componentes",
    cell: ({ row }) => {
      const comps = row.getValue("components") as ProductoAPI["components"];
      if (!comps?.length) return "—";
      return (
        <ul className="text-sm list-disc list-inside">
          {comps.map((c, i) => (
            <li key={i}>{c.component_name} (x{c.quantity})</li>
          ))}
        </ul>
      );
    },
  },
];
