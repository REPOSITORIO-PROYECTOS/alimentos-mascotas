import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProductoAPI } from "./columns"; // Asegúrate de que la ruta sea correcta
import { useAuthStore } from "@/context/store"; // Para el token de autorización

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductoAPI | null; // El producto a editar (opcional)
  onSave: (product: Partial<ProductoAPI>) => Promise<void>; // Función para guardar/actualizar
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductFormModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<Partial<ProductoAPI>>({
    productName: "",
    productDescription: "",
    sellingPrice: "",
    stock: "",
    imageUrl: "",
    categories: [], // Inicializar como array vacío
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si se pasa un producto, precargar el formulario con sus datos
    if (product) {
      setFormData({
        id: product.id,
        productName: product.productName,
        productDescription: product.productDescription,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categories: product.categories || [], // Asegurarse de que sea un array
      });
    } else {
      // Limpiar el formulario si no hay producto (para crear uno nuevo)
      setFormData({
        productName: "",
        productDescription: "",
        sellingPrice: "",
        stock: "",
        imageUrl: "",
        categories: [],
      });
    }
  }, [product, isOpen]); // Depende de product e isOpen para resetear al abrir/cerrar o cambiar de producto

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Convierte el string de categorías separado por comas en un array
    setFormData((prev) => ({ ...prev, categories: value.split(',').map(cat => cat.trim()).filter(cat => cat !== '') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose(); // Cerrar el modal al guardar exitosamente
      toast.success(
        product ? "Producto actualizado correctamente." : "Producto creado correctamente."
      );
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error(
        product ? "Error al actualizar el producto." : "Error al crear el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  // Puedes añadir más campos si lo necesitas, siguiendo la misma lógica.

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-1/3">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Crear Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">
                Nombre
              </Label>
              <Input
                id="productName"
                value={formData.productName || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productDescription" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categories" className="text-right">
                Categorías
              </Label>
              <Input
                id="categories"
                value={formData.categories ? formData.categories.join(', ') : ''}
                onChange={handleCategoryChange}
                placeholder="Separar por comas (e.g., Carnes, Seco)"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellingPrice" className="text-right">
                Precio Venta
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                step="1"
                value={formData.stock || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                URL Imagen
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}