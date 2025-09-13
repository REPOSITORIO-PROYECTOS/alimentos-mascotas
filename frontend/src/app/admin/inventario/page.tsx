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

  // GET Productos
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
      console.log(data)

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
    setEditingProduct(null); // Asegurarse de que el modal esté en modo "crear"
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductoAPI) => {
    setEditingProduct(product); // Cargar el producto para editar
    setIsModalOpen(true);
  };

  // DELETE Producto
  const handleDeleteProduct = async (productId: number) => {

    if (!user) {
      toast.error("No autorizado para eliminar productos.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }
    
    console.log(user.token)

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
      fetchProductos();

    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar el producto.");
    }
  };

  // PATCH Producto
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

    // --- CONSTRUCCIÓN DEL PAYLOAD AJUSTADA ---
    const payload: Record<string, any> = { // Usamos Record<string, any> para flexibilidad
      name: productData.productName,            // Ajustado: productName -> name
      description: productData.productDescription, // Ajustado: productDescription -> description
      price: productData.sellingPrice?.toString() || "0", // Ajustado: convertir a string
      stock: productData.stock?.toString() || "0",       // Ajustado: convertir a string
      image: productData.imageUrl,              // Ajustado: imageUrl -> image
      is_sellable: true,                        // Nuevo campo, asumiendo 'true' por defecto
      // IMPORTANTE: 'category' del backend espera un ID. Si tu frontend solo tiene nombres,
      // necesitarás una forma de mapear esos nombres a IDs, o un selector de ID.
      // Por ahora, pondremos un placeholder o un ID de categoría por defecto si no lo manejas aún.
      // Si tu backend tiene una categoría por defecto con ID 0, esto podría funcionar para el POST inicial.
      category: 0, // <--- Ajuste crítico. Necesitarás obtener el ID real de la categoría.
      components: [], // <--- Nuevo campo. Si no lo usas, envía un array vacío o null si el backend lo permite.
                      // Si lo usas, necesitarás añadir lógica para construir este array.
    };

    console.log("✍️ Se esta enviando:", payload);

    // Para PATCH, solo enviar los campos que se han modificado, y el 'id' sigue yendo en la URL.
    // Para simplificar, estamos enviando todos los campos que el backend espera.
    // Tu backend debería ser lo suficientemente robusto para manejar campos no modificados en PATCH.
    // Si el PATCH de tu backend es estricto y solo espera los campos modificados,
    // esta lógica podría necesitar más refinamiento para solo incluir campos que
    // realmente cambiaron o que el usuario modificó en el formulario.

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
        // Mejor manejo de errores: intenta leer el cuerpo como texto si falla el JSON
        const errorText = await res.text();
        console.error("Detalles del error API (Texto):", errorText);
        // Si el error es el SyntaxError, aquí verías el HTML de error.
        // Si el backend envía JSON de error, puedes intentar parsearlo aquí, pero res.json() ya lo haría.
        throw new Error(`Error al guardar producto: ${res.statusText} - ${errorText}`);
      }

      // Si la respuesta es exitosa y no hay cuerpo, res.json() podría fallar.
      // Es buena práctica verificar si hay contenido antes de intentar parsear JSON.
      // Para DELETE o PATCH que devuelven 204 No Content, no intentes res.json().
      if (res.status !== 204 && res.headers.get("Content-Type")?.includes("application/json")) {
          const responseData = await res.json();
          console.log("Respuesta exitosa del servidor:", responseData);

      } else {
          console.log("Operación exitosa sin cuerpo de respuesta JSON.");
      }

      toast.success(isEditing ? "Producto actualizado correctamente." : "Producto agregado correctamente.");
      fetchProductos(); // Recargar productos para reflejar los cambios

    } catch (error) {
      console.error("Error al guardar producto (catch):", error);
      toast.error("Error al guardar el producto."); // Mostrar error al usuario
      throw error; // Re-lanzar para que el modal pueda manejar el error
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