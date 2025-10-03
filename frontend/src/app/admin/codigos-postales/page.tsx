"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createShippingCostColumns, ShippingZoneItem } from "./columns";
import { DataTable } from "./data-table"; // Asegúrate de que DataTable esté importado
import { useAuthStore } from "@/context/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShippingZoneForm, ShippingZoneFormValues } from "./shipping-zone-form";
import { toast } from "sonner";

export default function ShippingCostsPage() {

    const [data, setData] = useState<ShippingZoneItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [previousPage, setPreviousPage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedZoneToEdit, setSelectedZoneToEdit] = useState<ShippingZoneItem | undefined>(undefined);
    const [selectedZoneToDeleteId, setSelectedZoneToDeleteId] = useState<number | null>(null);
    const { user } = useAuthStore();

    const API_BASE_URL = "https://barker.sistemataup.online/api/shipping-zones/";

    const fetchShippingCosts = useCallback(async (url: string) => {

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

            const urlParams = new URLSearchParams(url.split('?')[1]);
            const pageParam = urlParams.get('page');
            setCurrentPage(pageParam ? parseInt(pageParam) : 1);

            } catch (err: any) {

                console.error("Failed to fetch shipping costs:", err);
                setError(`No se pudieron cargar los costos de envío. ${err.message || ''}`);
                toast.error(`Hubo un problema al cargar los datos: ${err.message || 'Error desconocido'}.`)

            } finally {
                setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchShippingCosts(API_BASE_URL);
    }, [fetchShippingCosts]);

    const handleOpenCreateModal = () => {
        setSelectedZoneToEdit(undefined);
        setIsFormModalOpen(true);
    };

    const handleEditZone = (zone: ShippingZoneItem) => {
        setSelectedZoneToEdit(zone);
        setIsFormModalOpen(true);
    };

    const handleDeleteZone = (zoneId: number) => {
        setSelectedZoneToDeleteId(zoneId);
    };

    // DELETE Zona de envio
    const handleConfirmDelete = async () => {

        if (!selectedZoneToDeleteId || !user) return;

        setIsDeleting(true);

        try {

            const response = await fetch(`${API_BASE_URL}${selectedZoneToDeleteId}/`, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar: ${response.statusText}`);
            }

            toast.success("La zona de envío ha sido eliminada exitosamente.",)
            fetchShippingCosts(`${API_BASE_URL}?page=${currentPage}`);

        } catch (err: any) {
            console.error("Failed to delete shipping zone:", err);
            toast.error(`Hubo un problema al eliminar la zona: ${err.message || 'Error desconocido'}.`)

        } finally {
            setIsDeleting(false);
            setSelectedZoneToDeleteId(null);
        }
    };

    // POST - PATCH Zona de envio
    const handleSubmitForm = async (values: ShippingZoneFormValues) => {

        if (!user) {
            toast.error("Debes iniciar sesión para realizar esta acción.");
            return;
        }

        const method = selectedZoneToEdit ? 'PATCH' : 'POST';
        const url = selectedZoneToEdit ? `${API_BASE_URL}${selectedZoneToEdit.id}/` : API_BASE_URL;

        // Asegúrate de que los valores de costo sean strings con 2 decimales si el backend lo espera
        const payload = {
        ...values,
        base_cost: parseFloat(values.base_cost).toFixed(2),
        cost_per_kg: parseFloat(values.cost_per_kg).toFixed(2),
        };

        try {
        setLoading(true);
        const response = await fetch(url, {
            method: method,
            headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${user.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.detail || JSON.stringify(errorData);
            throw new Error(`Error al ${method === 'POST' ? 'crear' : 'actualizar'}: ${errorMessage}`);
        }

        toast.success(`La zona de envío ha sido ${method === 'POST' ? 'creada' : 'actualizada'} exitosamente.`);

        setIsFormModalOpen(false);
        fetchShippingCosts(`${API_BASE_URL}?page=${currentPage}`);

        } catch (err: any) {
        console.error("Failed to save shipping zone:", err);
        toast.error(`Hubo un problema: ${err.message || 'Error desconocido'}.`,);

        } finally {
        setLoading(false);
        }
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

    // Memoiza las columnas para evitar re-renderizados innecesarios
    const columns = useMemo(() => createShippingCostColumns({ onEdit: handleEditZone, onDelete: handleDeleteZone }), [handleEditZone, handleDeleteZone]);

  return (
    <div className="p-8">

        {loading && !data.length ? (
            <p>Cargando costos de envío...</p>
        ) : error ? (
            <div className="text-red-600 p-4 border border-red-300 rounded-md">
            <p>{error}</p>
            <p>Por favor, verifica la conexión o contacta a soporte.</p>
            </div>
        ) : (
            <>
                {/* Tabla y Agregar */}
                {/* El div con el h1 y el Button se ha movido a data-table.tsx */}
                <DataTable
                    columns={columns}
                    data={data}
                    title="Gestión de Costos de Envío" // Pasamos el título como prop
                    onCreateNew={handleOpenCreateModal} // Pasamos la función del botón como prop
                />

                {/* Controles de Paginacion */}
                <div className="flex justify-between items-center mt-4">
                    <Button
                    onClick={handlePreviousPage}
                    disabled={!previousPage || loading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
                    variant="outline"
                    >
                    Anterior
                    </Button>
                    <span className="text-sm text-gray-700">Página {currentPage}</span>
                    <Button
                    onClick={handleNextPage}
                    disabled={!nextPage || loading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
                    variant="outline"
                    >
                    Siguiente
                    </Button>
                </div>
            </>
        )}

        {/* Modal para Crear/Editar Zona de Envío */}
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{selectedZoneToEdit ? "Editar Zona de Envío" : "Crear Nueva Zona de Envío"}</DialogTitle>
                <DialogDescription>
                {selectedZoneToEdit ? "Realiza cambios en la zona de envío existente." : "Agrega una nueva zona de envío a tu sistema."}
                </DialogDescription>
            </DialogHeader>
            <ShippingZoneForm
                initialData={selectedZoneToEdit}
                onSubmit={handleSubmitForm}
                isLoading={loading} // Pasamos el estado de loading
            />
            </DialogContent>
        </Dialog>

        {/* Diálogo de Confirmación para Eliminar */}
        <AlertDialog open={selectedZoneToDeleteId !== null} onOpenChange={() => setSelectedZoneToDeleteId(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la zona de envío seleccionada.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}