"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "./data-table";
import { createColumns } from "./columns"; 
import { useAuthStore } from "@/context/store";
import { toast } from "sonner";
import { ProductFormModal, ProductFormData } from "./ProductFormModal";

// Define tu ProductoAPI original (la que viene del backend en el GET)
export interface ProductoAPI {
  id: number;
  productName: string;
  productDescription: string;
  categories: string[];
  sellingPrice: string; 
  stock: string; 
  imageUrl: string;
}

// Define la interfaz para los componentes del producto, si no la tienes ya.
interface ProductComponentBackend {
  component: number;
  quantity: string;
  merma_percentage: string;
}

// Define la interfaz para el payload que tu backend espera en POST/PATCH
interface ProductPayload {
  id?: number; 
  name: string;
  category: number; 
  description: string;
  price: string;
  stock: string;
  image: string;
  is_sellable: boolean;
  components: ProductComponentBackend[];
}

export default function InventarioPage() {

  const [productos, setProductos] = useState<ProductoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductoAPI | null>(null);

  // GET Productos - FUNCIONA PERFECTO
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
      /* console.log("Productos obtenidos:", data); */

    } catch (err) {
      console.error("❌ Error al obtener productos:", err);
      toast.error("Error al cargar los productos.");
      setProductos([]);

    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Funciones para el CRUD
  const handleAddProduct = () => {
    setEditingProduct(null); 
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductoAPI) => {
    setEditingProduct(product); 
    setIsModalOpen(true);
  };

  // DELETE Producto - FUNCIONA PERFECTO
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
        `https://barker.sistemataup.online/api/management/products/${productId}/`,
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
      fetchProductos();

    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar el producto.");
    }
  };

  // POST/PATCH Producto
  const handleSaveProduct = async (productData: ProductFormData) => { 
    
    if (!user) {
      toast.error("No autorizado para guardar productos.");
      throw new Error("No autorizado");
    }

    const isEditing = !!productData.id;
    const url = isEditing
      ? `https://barker.sistemataup.online/api/management/products/${productData.id}/`
      : "https://barker.sistemataup.online/api/management/products/";
    const method = isEditing ? "PATCH" : "POST";

    const payload: ProductPayload = {
      name: productData.name, 
      category: parseInt(productData.category), 
      description: productData.description, 
      price: productData.price,
      stock: productData.stock,
      image: productData.image,
      is_sellable: productData.is_sellable,
      components: productData.components.map(c => ({
        component: parseInt(c.component),
        quantity: c.quantity,
        merma_percentage: c.merma_percentage,
      })),
    };

    /* console.log("Se está enviando:", payload); */

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
        const errorText = await res.text();
        console.error("Detalles del error API (Texto):", errorText);
        throw new Error(`Error al guardar producto: ${res.statusText} - ${errorText}`);
      }

      if (res.status !== 204 && res.headers.get("Content-Type")?.includes("application/json")) {
          const responseData = await res.json();
          console.log("Respuesta exitosa del servidor:", responseData);

      } else {
          console.log("Operación exitosa sin cuerpo de respuesta JSON.");
      }

      toast.success(isEditing ? "Producto actualizado correctamente." : "Producto agregado correctamente.");
      fetchProductos(); 

    } catch (error) {
      console.error("Error al guardar producto (catch):", error);
      toast.error("Error al guardar el producto."); 
      throw error; 
    }
  };

  // Crear las columnas pasando las funciones de acción
  const columns = createColumns({ onEdit: handleEditProduct, onDelete: handleDeleteProduct });

  if (loading) return <p className="text-center py-10">Cargando productos...</p>;

  return (
    <div className="p-8">
      <div className="my-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Gestión de Stock</h1>
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