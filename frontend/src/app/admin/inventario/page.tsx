"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "./data-table";
import { ProductoAPI, createColumns } from "./columns"; 
import { useAuthStore } from "@/context/store";
import { toast } from "sonner";
import { ProductFormModal } from "./ProductFormModal";

export default function InventarioPage() {
  const [productos, setProductos] = useState<ProductoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductoAPI | null>(null);

  const fetchProductos = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://barker.sistemataup.online/api/store/products/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Error al cargar productos: ${res.statusText}`);
      }
      const data = await res.json();
      setProductos(data.content || []);
    } catch (err) {
      console.error("❌ Error al obtener productos:", err);
      toast.error("Error al cargar los productos.");
      setProductos([]); // Asegurarse de que el array esté vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Funciones para el CRUD
  const handleAddProduct = () => {
    setEditingProduct(null); // Asegurarse de que el modal esté en modo "crear"
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductoAPI) => {
    setEditingProduct(product); // Cargar el producto para editar
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!user) {
      toast.error("No autorizado para eliminar productos.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      const res = await fetch(
        `https://barker.sistemataup.online/api/management/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error al eliminar producto: ${res.statusText}`);
      }

      toast.success("Producto eliminado correctamente.");
      fetchProductos(); // Volver a cargar los productos después de eliminar
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar el producto.");
    }
  };

  const handleSaveProduct = async (productData: Partial<ProductoAPI>) => {
    if (!user) {
      toast.error("No autorizado para guardar productos.");
      throw new Error("No autorizado");
    }

    const isEditing = !!productData.id;
    const url = isEditing
      ? `https://barker.sistemataup.online/api/management/products/${productData.id}`
      : "https://barker.sistemataup.online/api/management/products";
    const method = isEditing ? "PATCH" : "POST";

    // Mapear los datos del formulario al formato esperado por el backend para PATCH/POST
    const payload = {
      productName: productData.productName,
      productDescription: productData.productDescription,
      sellingPrice: parseFloat(productData.sellingPrice || "0"), // Convertir a número
      stock: parseFloat(productData.stock || "0"), // Convertir a número
      imageUrl: productData.imageUrl,
      // Asegurarse de que categories sea un array de strings
      categories: productData.categories && Array.isArray(productData.categories) ? productData.categories : [],
      // Otros campos que tu API pueda esperar y que no estén en el formulario
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Detalles del error API:", errorData);
        throw new Error(`Error al guardar producto: ${res.statusText} - ${JSON.stringify(errorData)}`);
      }

      fetchProductos(); // Recargar productos para reflejar los cambios
    } catch (error) {
      console.error("Error al guardar producto (catch):", error);
      throw error; // Re-lanzar para que el modal pueda manejar el error
    }
  };

  // Crear las columnas pasando las funciones de acción
  const columns = createColumns({ onEdit: handleEditProduct, onDelete: handleDeleteProduct });

  if (loading) return <p className="text-center py-10">Cargando productos...</p>;

  return (
    <div className="p-8">
      <div className="container flex flex-col gap-12 mx-auto p-16">
        <h2 className="text-[#1e1e1e] text-2xl font-semibold">
          PANEL DE INVENTARIO
        </h2>
      </div>
      <DataTable columns={columns} data={productos} onAddProduct={handleAddProduct} />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}