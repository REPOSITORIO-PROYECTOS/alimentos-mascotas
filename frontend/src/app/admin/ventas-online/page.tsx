"use client";

import { useState, useEffect } from "react";
import { createOnlineSalesColumns, OnlineSaleItem } from "./columns";
import { DataTable } from "./data-table";


export default function VentasOnlinePage() {
  const [data, setData] = useState<OnlineSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular fetch de datos
    const fetchOnlineSales = async () => {
      // Aquí harías tu fetch real a la API
      // const response = await fetch('/api/online-sales');
      // const jsonData: OnlineSaleItem[] = await response.json();

      // Datos de ejemplo para demostración
      const dummyData: OnlineSaleItem[] = [
        {
          id: "1",
          status: "approved",
          status_detail: "Pago aprobado",
          name: "Juan Pérez",
          email: "juan.perez@example.com",
          phone: {
            area_code: "11",
            number: "55551234",
          },
          address: {
            zip_code: "1406",
            street_name: "Av. Rivadavia 1234",
          },
          items: [
            {
              id: "item1",
              name: "Carne x200	",
              description: "Carne de res, en presentación x200, ideal para alimentación de mascotas.",
              image: "placeholder.svg",
              price: "1500.00",
              quantity: "2",
            },
            {
              id: "item2",
              name: "Croquetas Premium",
              description: "Croquetas de alta calidad para perros adultos.",
              image: "placeholder.svg",
              price: "4500.00",
              quantity: "1",
            },
          ],
        },
        {
          id: "2",
          status: "pending",
          status_detail: "Pendiente de pago",
          name: "María García",
          email: "maria.garcia@example.com",
          phone: {
            area_code: "341",
            number: "44445678",
          },
          address: {
            zip_code: "2000",
            street_name: "Calle Falsa 123",
          },
          items: [
            {
              id: "item3",
              name: "Mini tendones x200",
              description: "Mini tendones de res, en presentación x200, ideales para perros pequeños.",
              image: "placeholder.svg",
              price: "8000.00",
              quantity: "1",
            },
          ],
        },
        {
            id: "3",
            status: "rejected",
            status_detail: "Pago rechazado",
            name: "Carlos López",
            email: "carlos.lopez@example.com",
            phone: {
              area_code: "351",
              number: "33339012",
            },
            address: {
              zip_code: "5000",
              street_name: "Av. Colón 500",
            },
            items: [
              {
                id: "item4",
                name: "Mini traquea",
                description: "",
                image: "placeholder.svg",
                price: "700.00",
                quantity: "2",
              },
              {
                id: "item5",
                name: "Mini tendones x200",
                description: "",
                image: "placeholder.svg",
                price: "3000.00",
                quantity: "1",
              },
            ],
          },
      ];

      setData(dummyData);
      setLoading(false);
    };

    fetchOnlineSales();
  }, []);

  const handleAddSale = () => {
    alert("Funcionalidad para agregar venta aún no implementada.");

  };

  const columns = createOnlineSalesColumns(); 

  return (
    <div className="p-8">
      <div className="my-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Ventas Online</h1>
      </div>

      {loading ? (
        <p>Cargando ventas...</p>
      ) : (
        <DataTable columns={columns} data={data} onAddProduct={handleAddSale} />
      )}
    </div>
  );
}