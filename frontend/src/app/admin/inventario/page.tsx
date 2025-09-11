"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, ProductoAPI } from "./columns";
import { useAuthStore } from "@/context/store";

export default function InventarioPage() {
  
  const [productos, setProductos] = useState<ProductoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {

    if (!user) return;

    const fetchProductos = async () => {
      try {
        const res = await fetch("https://barker.sistemataup.online/api/store/products", /* {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${user.token}`,
          },
        } */
        );
        const data = await res.json();
        console.log(data)

        setProductos(data.results || []);
        console.log(productos)

      } catch (err) {
        /* console.error("❌ Error al obtener productos:", err); */

      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) return <p className="text-center py-10">Cargando productos...</p>;

  return (
    <div className="p-8">
      <div className="container flex flex-col gap-12 mx-auto p-16">
        <h2 className="text-[#1e1e1e] text-2xl font-semibold">
          PANEL DE INVENTARIO
        </h2>
      </div>
      <DataTable columns={columns} data={productos} />
    </div>
  );
}