"use client";

import { useState, useEffect } from "react";
import { createOnlineSalesColumns, MovementItem } from "./columns"; 
import { DataTable } from "./data-table";
import { useAuthStore } from "@/context/store";

export default function VentasOnlinePage() {
  
  const [data, setData] = useState<MovementItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  // GET Movimientos y ventas
  useEffect(() => {

    const fetchOnlineSales = async () => {

      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://barker.sistemataup.online/api/finances/movimientos/", {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${user.token}`, 
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const result = await response.json();

        setData(result.results);
        console.log(result.results);

      } catch (err) {
        console.error("Failed to fetch movements:", err);
        setError("No se pudieron cargar los movimientos. Intenta de nuevo más tarde.");

      } finally {
        setLoading(false);
      }
    };

    fetchOnlineSales();
  }, []);

  const handleAddSale = () => {
    alert("Funcionalidad para agregar movimiento aún no implementada.");
  };

  const columns = createOnlineSalesColumns();

  return (
    <div className="p-8">
      <div className="my-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Movimientos Financieros</h1> {/* Título actualizado */}
      </div>

      {loading ? (
        <p>Cargando movimientos...</p>
      ) : error ? (
        <div className="text-red-600 p-4 border border-red-300 rounded-md">
          <p>{error}</p>
          <p>Por favor, verifica la conexión o contacta a soporte.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={data} onAddMovement={handleAddSale} />
      )}
    </div>
  );
}