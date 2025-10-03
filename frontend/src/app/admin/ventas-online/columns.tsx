"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react"; // MoreHorizontal ya no es necesario
import { Badge } from "@/components/ui/badge";
// Popover (y sus imports) ya no son necesarios si payment_items está comentado
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// Importar componentes de Shadcn UI para el diálogo de edición
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export type MovementItem = {
  id: number;
  movement_type: "INGRESS" | "EGRESS";
  status: "PENDING" | "APPROVED" | "REJECTED";
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
  order_status: "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED" | "CANCELLED" | string;
};

// Función para mapear el estado a un color de Badge
const getStatusVariant = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "DELIVERED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

interface CreateOnlineSalesColumnsProps {
  onUpdateMovement: (movementId: number, newOrderStatus: string) => void;
}

export const createOnlineSalesColumns = (
  onUpdateMovement: CreateOnlineSalesColumnsProps["onUpdateMovement"]
): ColumnDef<MovementItem>[] => [
  {
    accessorKey: "user_username",
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
    accessorKey: "movement_type",
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
    accessorKey: "payment_method",
    header: "Método Pago",
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
    accessorKey: "payment_status",
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
    accessorKey: "order_status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Estado Orden
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const orderStatus = row.getValue("order_status") as MovementItem["order_status"];
      return <Badge variant={getStatusVariant(orderStatus)}>{orderStatus}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const movement = row.original;
      const [newOrderStatus, setNewOrderStatus] = useState<string>(movement.order_status);
      const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false); // Estado para controlar el AlertDialog

      const handleConfirmUpdate = async () => {
        if (newOrderStatus && newOrderStatus !== movement.order_status) {
          await onUpdateMovement(movement.id, newOrderStatus);
          toast.success(`Movimiento ${movement.id} actualizado a ${newOrderStatus}.`);
          setIsAlertDialogOpen(false); // Cerrar el AlertDialog después de la acción
        } else if (newOrderStatus === movement.order_status) {
          toast.info("El estado de la orden es el mismo. No se realizaron cambios.")
          setIsAlertDialogOpen(false); // Cerrar el AlertDialog incluso si no hay cambios
        }
      };

      return (
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogTrigger asChild>
            {/* Botón directo para abrir el AlertDialog */}
            <Button variant="outline" size="sm" className="h-8 w-fit px-3 cursor-pointer">
              Editar Orden
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Editar Estado de Orden del Movimiento {movement.id}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Estado actual:
              </AlertDialogDescription> 
              <p className="text-lg font-semibold text-black">{movement.order_status}</p>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <Select
                onValueChange={setNewOrderStatus}
                defaultValue={movement.order_status}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Estados de Orden</SelectLabel>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="APPROVED">Aprobada</SelectItem>
                    <SelectItem value="REJECTED">Rechazada</SelectItem>
                    <SelectItem value="DELIVERED">Entregada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel> 
              <AlertDialogAction onClick={handleConfirmUpdate} className="cursor-pointer">
                Guardar Cambios
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];