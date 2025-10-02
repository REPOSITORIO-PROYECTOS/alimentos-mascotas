"use client";

import { useState, useEffect } from "react";
import { createShippingCostColumns, ShippingZoneItem } from "./columns";
import { DataTable } from "./data-table";
import { useAuthStore } from "@/context/store"; 
import { Button } from "@/components/ui/button";

export default function ShippingCostsPage() {

    const [data, setData] = useState<ShippingZoneItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [previousPage, setPreviousPage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { user } = useAuthStore();

    // GET Costos de Envio
    const fetchShippingCosts = async (url: string) => {

        if (!user) {
        setError("No hay usuario autenticado.");
        setLoading(false);
        return;
        }

        try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
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
        setNextPage(result.next);
        setPreviousPage(result.previous);

        // Extraer el número de página de la URL si existe para el control de paginación
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const pageParam = urlParams.get('page');
        setCurrentPage(pageParam ? parseInt(pageParam) : 1);

        } catch (err) {
            console.error("Failed to fetch shipping costs:", err);
            setError("No se pudieron cargar los costos de envío. Intenta de nuevo más tarde.");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShippingCosts("https://barker.sistemataup.online/api/shipping-zones/");
    }, [user]);

    const handleAddShippingCost = () => {
        alert("Funcionalidad para agregar costo de envío aún no implementada.");
    };

    const handleNextPage = () => {
        if (nextPage) {
        fetchShippingCosts(nextPage);
        }
    };

    const handlePreviousPage = () => {
        if (previousPage) {
        fetchShippingCosts(previousPage);
        }
    };

    const columns = createShippingCostColumns();

    return (
        <div className="p-8">
        <div className="my-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestión de Costos de Envío</h1>
            {/* Aquí podrías añadir un botón para agregar un nuevo costo de envío si lo deseas */}
            {/* <Button onClick={handleAddShippingCost}>Agregar Costo de Envío</Button> */}
        </div>

        {loading ? (
            <p>Cargando costos de envío...</p>
        ) : error ? (
            <div className="text-red-600 p-4 border border-red-300 rounded-md">
                <p>{error}</p>
                <p>Por favor, verifica la conexión o contacta a soporte.</p>
            </div>
        ) : (
            <>
                <DataTable columns={columns} data={data} />
                <div className="flex justify-between items-center mt-4">

                    <Button
                        onClick={handlePreviousPage}
                        disabled={!previousPage}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        Anterior
                    </Button>

                    <span className="text-xl font-semibold">Página {currentPage}</span>

                    <Button
                        onClick={handleNextPage}
                        disabled={!nextPage}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        Siguiente
                    </Button>
                </div>
            </>
        )}
        </div>
    );
}