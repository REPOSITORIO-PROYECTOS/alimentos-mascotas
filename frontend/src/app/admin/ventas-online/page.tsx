"use client";

import { useState, useEffect, useCallback } from "react";
import { createOnlineSalesColumns, MovementItem } from "./columns";
import { DataTable } from "./data-table";
import { useAuthStore } from "@/context/store";
import { toast } from "sonner"; 

export default function VentasOnlinePage() {

  const [data, setData] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // Para guardar el count total de la API

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchOnlineSales = useCallback(async () => {
    if (!user) {
      setError("Usuario no autenticado.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://barker.sistemataup.online/api/finances/movimientos/?page=${currentPage}&page_size=${pageSize}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.results);
      setTotalCount(result.count);

    } catch (err: any) {
      console.error("Failed to fetch movements:", err);
      setError("No se pudieron cargar los movimientos. Intenta de nuevo más tarde.");
      toast.error(err.message || "No se pudieron cargar los movimientos.");

    } finally {
      setLoading(false);
    }
  }, [user, currentPage, pageSize]); // Dependencias para useCallback

  useEffect(() => {
    fetchOnlineSales();
  }, [fetchOnlineSales]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
  };

  const handleUpdateMovement = async (
    movementId: number,
    newOrderStatus: string
  ) => {
    if (!user) {
      toast.error("No estás autenticado para realizar esta acción.")
      return;
    }

    try {
      const response = await fetch(
        `https://barker.sistemataup.online/api/finances/movimientos/${movementId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ order_status: newOrderStatus }), // Solo enviamos order_status
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error al actualizar el movimiento: ${response.statusText}`
        );
      }

      setData((prevData) =>
        prevData.map((movement) =>
          movement.id === movementId
            ? { ...movement, order_status: newOrderStatus }
            : movement
        )
      );

      toast.success(`El estado de la orden del movimiento ${movementId} ha sido actualizado a ${newOrderStatus}.`)

    } catch (err: any) {
      console.error("Error updating movement:", err);
      toast.error(err.message || "No se pudo actualizar el estado del movimiento.")
    }
  };

  const handleAddSale = () => {
    alert("Funcionalidad para agregar movimiento aún no implementada.");
  };

  const columns = createOnlineSalesColumns(handleUpdateMovement); // Pasamos la función de actualización

  return (
    <div className="p-8">
      <div className="my-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Movimientos y Ventas</h1>
        
      </div>

      {loading ? (
        <p>Cargando movimientos...</p>
      ) : error ? (
        <div className="text-red-600 p-4 border border-red-300 rounded-md">
          <p>{error}</p>
          <p>Por favor, verifica la conexión o contacta a soporte.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalCount={totalCount} // Pasamos el totalCount a DataTable para las métricas
        />
      )}
    </div>
  );
}