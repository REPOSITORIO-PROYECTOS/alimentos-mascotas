import { useState, useEffect, useCallback, useRef } from "react"; 
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
import { Checkbox } from "@/components/ui/checkbox"; 
import { toast } from "sonner";
import { useAuthStore } from "@/context/store";
import { ProductoAPI } from "./columns";

// Define la interfaz para los componentes del producto en el formulario
export interface ProductComponentForm {
  component: string; // Para el formulario, puede ser un string (ID de componente)
  quantity: string;
  merma_percentage: string;
}

// Define la interfaz para los datos del formulario (lo que se maneja internamente)
export interface ProductFormData {
  id?: number; 
  name: string; 
  category: string; 
  description: string; 
  price: string;
  stock: string;
  image: string; 
  is_sellable: boolean; 
  components: ProductComponentForm[]; 
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductoAPI | null; 
  onSave: (product: ProductFormData) => Promise<void>; 
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductFormModalProps) {
  
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "", 
    description: "",
    price: "",
    stock: "",
    image: "",
    is_sellable: true,
    components: [],
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Este efecto precarga el formulario con los datos del producto si está en modo edición
  useEffect(() => {

    if (product) {

      setFormData({
        id: product.id,
        name: product.productName,
        category: product.categories.length > 0 ? product.categories[0] : "", 
        description: product.productDescription,
        price: product.sellingPrice,
        stock: product.stock,
        image: product.imageUrl,
        is_sellable: true, 
        components: [], 
      });

    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        image: "",
        is_sellable: true,
        components: [],
      });
    }
  }, [product, isOpen]);

  // Manejador de cambios para inputs de texto/número
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Manejador de cambios para el checkbox `is_sellable`
  const handleSellableChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_sellable: checked }));
  };

  // Manejadores para los campos de los componentes dinámicos
  const handleComponentChange = (index: number, field: keyof ProductComponentForm, value: string) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setFormData((prev) => ({ ...prev, components: newComponents }));
  };

  const addComponent = () => {
    setFormData((prev) => ({
      ...prev,
      components: [...prev.components, { component: "", quantity: "", merma_percentage: "" }],
    }));
  };

  const removeComponent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  // Lógica para la carga de imágenes
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {

    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [user]); 

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [user]); 

  const handleFile = async (file: File) => {
    
    setLoading(true);

    try {
      if (!user) {
        toast.error("No autorizado para subir imágenes.");
        return;
      }
      const uploadFormData = new FormData();
      uploadFormData.append("file", file); 

      const res = await fetch("https://barker.sistemataup.online/api/upload/image/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
        body: uploadFormData,
      });

      if (!res.ok) {
        throw new Error(`Error al subir imagen: ${res.statusText}`);
      }

      const data = await res.json();
      const imageUrl = data.url; 

      console.log(data.url)
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Imagen subida correctamente.");

    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error("Error al subir la imagen.");

    } finally {
      setLoading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData); 
      onClose(); 
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product ? "Editar Producto" : "Crear Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="grid sm:grid-cols-4 items-center gap-3">
            <Label htmlFor="name" className="sm:text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="sm:col-span-3"
              required
            />
          </div>

          {/* Categoría */}
          <div className="grid sm:grid-cols-4 items-center gap-3">
            <Label htmlFor="category" className="sm:text-right">
              Categoría (ID)
            </Label>
            <Input
              id="category"
              type="text"
              value={formData.category || ""}
              onChange={handleChange}
              placeholder="Introduce el ID de la categoría"
              className="sm:col-span-3"
              required
            />
          </div>

          {/* Descripción */}
          <div className="grid sm:grid-cols-4 items-start gap-3">
            <Label htmlFor="description" className="sm:text-right mt-2">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="sm:col-span-3"
            />
          </div>

          {/* Precio */}
          <div className="grid sm:grid-cols-4 items-center gap-3">
            <Label htmlFor="price" className="sm:text-right">
              Precio
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price || ""}
              onChange={handleChange}
              className="sm:col-span-3"
              required
            />
          </div>

          {/* Stock */}
          <div className="grid sm:grid-cols-4 items-center gap-3">
            <Label htmlFor="stock" className="sm:text-right">
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              step="1"
              value={formData.stock || ""}
              onChange={handleChange}
              className="sm:col-span-3"
              required
            />
          </div>

          {/* Vendible */}
          <div className="grid sm:grid-cols-4 items-center gap-3">
            <Label htmlFor="is_sellable" className="sm:text-right">
              Vendible
            </Label>
            <Checkbox
              id="is_sellable"
              checked={formData.is_sellable}
              onCheckedChange={handleSellableChange}
              className="sm:col-span-3"
            />
          </div>

          {/* Imagen */}
          <div className="grid sm:grid-cols-4 items-start gap-3">
            <Label htmlFor="image" className="sm:text-right mt-2">
              Imagen
            </Label>
            <div
              className={`sm:col-span-3 border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt="Previsualización"
                    className="max-h-32 mx-auto mb-2 object-contain"
                  />
                  <p className="text-sm text-gray-600">
                    Haz click o arrastra otra imagen para cambiarla.
                  </p>
                </>
              ) : (
                <p className="text-gray-500">
                  Arrastra una imagen aquí o{" "}
                  <span className="text-blue-600 font-medium">haz click</span>
                </p>
              )}
            </div>
          </div>

          {formData.image && (
            <div className="grid sm:grid-cols-4 items-center gap-3">
              <Label htmlFor="image" className="sm:text-right">
                URL Imagen
              </Label>
              <Input
                id="image"
                value={formData.image || ""}
                onChange={handleChange}
                placeholder="URL de la imagen"
                className="sm:col-span-3"
              />
            </div>
          )}

          {/* Componentes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Componentes
            </h3>

            {formData.components.map((comp, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-4 border p-4 rounded-lg bg-gray-50"
              >
                <Label htmlFor={`component-${index}`} className="sm:text-right">
                  Comp. ID
                </Label>
                <Input
                  id={`component-${index}`}
                  type="number"
                  value={comp.component}
                  onChange={(e) =>
                    handleComponentChange(index, "component", e.target.value)
                  }
                  className="sm:col-span-3"
                  required
                />

                <Label htmlFor={`quantity-${index}`} className="sm:text-right">
                  Cantidad
                </Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  step="0.001"
                  value={comp.quantity}
                  onChange={(e) =>
                    handleComponentChange(index, "quantity", e.target.value)
                  }
                  className="sm:col-span-3"
                  required
                />

                <Label htmlFor={`merma-${index}`} className="sm:text-right">
                  Merma (%)
                </Label>
                <Input
                  id={`merma-${index}`}
                  type="number"
                  step="0.01"
                  value={comp.merma_percentage}
                  onChange={(e) =>
                    handleComponentChange(index, "merma_percentage", e.target.value)
                  }
                  className="sm:col-span-3"
                  required
                />

                <div className="sm:col-span-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeComponent(index)}
                    variant="destructive"
                  >
                    Eliminar Componente
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addComponent} variant="secondary">
              Añadir Componente
            </Button>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
        
      </DialogContent>
    </Dialog>
  );
}