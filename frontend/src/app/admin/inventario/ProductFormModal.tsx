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
import { ProductoAPI, ProductVariant } from "./page";

// Para el Combobox Multi-select de shadcn (ahora será single-select)
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad para clases condicionales

// Define la interfaz para los datos del formulario (lo que se maneja internamente)
export interface ProductFormData {
  id?: number;
  productName: string;
  category: string;
  productDescription: string;
  sellingPrice: string;
  stock: string;
  imageUrl: string | null;
  has_variants: boolean;
  variants: ProductVariant[];
}

// Interfaz para el manejo interno de variantes en el formulario
interface ProductVariantFormData extends ProductVariant {
  _tempId: string; // Para identificar variantes nuevas antes de que tengan un ID real del backend
  unitType: "grams" | "units" | null; // Para controlar el radio en cada variante
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductoAPI | null;
  onSave: (product: ProductFormData) => Promise<void>;
}

// Definición de las categorías fijas
const CATEGORY_OPTIONS = [
  "Ternera",
  "Pollo",
  "Pulmones",
  "Orejas",
  "Traqueas",
  "Tendones",
  "Higados",
  "Corazones",
  "Accesorios",
];

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductFormModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    productDescription: "",
    sellingPrice: "",
    stock: "",
    imageUrl: null,
    has_variants: false,
    variants: [],
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nuevo estado para manejar las variantes del formulario
  const [productVariants, setProductVariants] = useState<ProductVariantFormData[]>([]);
  const [hasVariantsEnabled, setHasVariantsEnabled] = useState(false); // Checkbox para activar variantes

  // Estado para el Combobox de categorías
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);

  // Este efecto precarga el formulario con los datos del producto si está en modo edición
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        productName: product.productName || "", // Asegura string vacío si es null/undefined
        category: product.category || "",       // <-- ESTO ES CLAVE para la categoría
        productDescription: product.productDescription || "",
        sellingPrice: product.sellingPrice || "",
        stock: product.stock || "",
        imageUrl: product.imageUrl || null, // null si no hay imagen
        has_variants: product.has_variants || false,
        variants: product.variants || [],
      });

      setHasVariantsEnabled(product.has_variants || false);

      const mappedVariants: ProductVariantFormData[] = (
        product.variants || []
      ).map((variant, index) => {
        let unitType: "grams" | "units" | null = null;
        // Determina el unitType basado en si gramaje o unidades tienen un valor significativo
        if (variant.gramaje !== null && variant.gramaje !== "" && variant.gramaje !== "0") {
          unitType = "grams";
        } else if (variant.unidades !== null && variant.unidades !== "" && variant.unidades !== "0") {
          unitType = "units";
        }
        return {
          ...variant,
          _tempId: variant.id ? String(variant.id) : `new-${index}`,
          unitType: unitType,
          descripcion: variant.descripcion || "", // Asegura que descripcion exista como string
          stock: variant.stock || "0", // Asegura string
          price: variant.price || "0.00", // Asegura string
        };
      });
      setProductVariants(mappedVariants);
    } else {
      // Resetea el formulario cuando no hay producto (modo creación)
      setFormData({
        productName: "",
        category: "",
        productDescription: "",
        sellingPrice: "",
        stock: "",
        imageUrl: null,
        has_variants: false,
        variants: [],
      });
      setProductVariants([]);
      setHasVariantsEnabled(false);
    }
  }, [product, isOpen]); // Dependencias: product y isOpen para recargar si cambia la modal o el producto

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setFormData((prev) => ({ ...prev, category: selectedCategory }));
    setOpenCategoryCombobox(false);
  };

  // --- Lógica de Variantes ---
  const handleAddVariant = () => {
    setProductVariants((prev) => [
      ...prev,
      {
        _tempId: `new-${Date.now()}`,
        gramaje: null,
        unidades: null,
        descripcion: "", // Inicializado como string vacío
        stock: "0",
        price: "0.00",
        unitType: null,
      },
    ]);
  };

  const handleDeleteVariant = (tempIdToDelete: string) => {
    setProductVariants((prev) =>
      prev.filter((variant) => variant._tempId !== tempIdToDelete)
    );
  };

  const handleVariantChange = (
    tempId: string,
    field: keyof ProductVariantFormData,
    value: string | null
  ) => {
    setProductVariants((prev) =>
      prev.map((variant) =>
        variant._tempId === tempId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleVariantUnitTypeChange = (
    tempId: string,
    type: "grams" | "units"
  ) => {
    setProductVariants((prev) =>
      prev.map((variant) =>
        variant._tempId === tempId
          ? {
              ...variant,
              unitType: type,
              gramaje: type === "grams" ? (variant.gramaje === null ? "" : variant.gramaje) : null, // Mantiene el valor si cambia a gramos, o resetea
              unidades: type === "units" ? (variant.unidades === null ? "" : variant.unidades) : null, // Mantiene el valor si cambia a unidades, o resetea
            }
          : variant
      )
    );
  };

  // Lógica para la carga de imágenes (sin cambios relevantes)
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [user]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [user]
  );

  const handleFile = async (file: File) => {
    setLoading(true);

    try {
      if (!user) {
        toast.error("No autorizado para subir imágenes.");
        return;
      }
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch(
        "https://barker.sistemataup.online/api/upload/image/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: uploadFormData,
        }
      );

      if (!res.ok) {
        throw new Error(`Error al subir imagen: ${res.statusText}`);
      }

      const data = await res.json();
      const imageUrl = data.url;

      console.log(data.url);
      setFormData((prev) => ({ ...prev, imageUrl: imageUrl }));
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

  // --- Lógica de Envío del Formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let variantsToSubmit: ProductVariant[] = [];
    if (hasVariantsEnabled) {
      variantsToSubmit = productVariants.map((variant) => {
        // Asegúrate de enviar null si el campo está vacío o "0" para el backend
        const gramaje =
          variant.unitType === "grams" && variant.gramaje !== null && variant.gramaje !== ""
            ? (variant.gramaje === "0" ? null : variant.gramaje)
            : null;
        const unidades =
          variant.unitType === "units" && variant.unidades !== null && variant.unidades !== ""
            ? (variant.unidades === "0" ? null : variant.unidades)
            : null;

        return {
          id: variant.id,
          gramaje: gramaje,
          unidades: unidades,
          descripcion: variant.descripcion || "", // Asegura que la descripción se envíe como string
          stock: variant.stock || "0", // Asegura string
          price: variant.price || "0.00", // Asegura string
        };
      });
    }

    const finalFormData: ProductFormData = {
      ...formData,
      has_variants: hasVariantsEnabled,
      variants: hasVariantsEnabled ? variantsToSubmit : [],
    };

    try {
      await onSave(finalFormData);
      onClose();
      // Eliminar el toast.success aquí, ya que se maneja en page.tsx después de que onSave se resuelve.
      // toast.success(
      //   product
      //     ? "Producto actualizado correctamente."
      //     : "Producto creado correctamente."
      // );
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error(
        product
          ? "Error al actualizar el producto."
          : "Error al crear el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  // Si la modal no está abierta, no renderizamos nada (ni el overlay)
  if (!isOpen) return null;

  return (
    // ESTE ES EL NUEVO WRAPPER PARA EL OVERLAY MANUAL
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Dialog open={isOpen} onOpenChange={onClose} modal={false}> {/* Mantenemos modal={false} */}
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
          // NOTA: Si necesitas que el diálogo sea clickeable para cerrar el popover,
          // puedes añadir un onClick aquí que cierre el popover, o simplemente
          // dejar que el popover se cierre al hacer clic fuera de él.
          // onClick={(e) => {
          //   // Esto podría interferir si el click es dentro del DialogContent pero no en el popover.
          //   // setOpenCategoryCombobox(false);
          // }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {product ? "Editar Producto" : "Crear Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="grid sm:grid-cols-4 items-center gap-3">
              <Label htmlFor="productName" className="sm:text-right">
                Nombre
              </Label>
              <Input
                id="productName"
                value={formData.productName || ""} // <-- Aseguramos string vacío
                onChange={handleChange}
                className="sm:col-span-3"
                required
              />
            </div>

            {/* Categoría (Single Select) */}
            <div className="grid sm:grid-cols-4 items-start gap-3">
              <Label htmlFor="category" className="sm:text-right pt-2 font-medium">
                Categoría
              </Label>
              <div className="sm:col-span-3">
                <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryCombobox}
                      className="w-full justify-between cursor-pointer"
                    >
                      {formData.category
                        ? formData.category // <-- Muestra la categoría seleccionada
                        : "Selecciona una categoría..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    // IMPORTANTE: Asegúrate de que la PopoverContent tenga un z-index adecuado
                    // para que no quede por debajo de otros elementos, si el DialogContent ya tiene uno.
                    // Generalmente, si el Popover está dentro del Dialog, su contenido debería heredar
                    // o tener un z-index superior al DialogContent.
                    // Para evitar problemas de stacking, a veces se usa `portal` o se ajusta el z-index.
                    // Aquí, le damos un z-index alto para que esté por encima de la modal,
                    // especialmente si el DialogContent tiene su propio z-index alto.
                    className="w-[--radix-popover-trigger-width] p-0 z-[100]" // Ajustado a z-[100]
                  >
                    <Command>
                      <CommandInput placeholder="Buscar categoría..." />
                      <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {CATEGORY_OPTIONS.map((categoryOption) => (
                            <CommandItem
                              key={categoryOption}
                              onSelect={() => handleCategorySelect(categoryOption)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.category === categoryOption // <-- Marca la categoría seleccionada
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {categoryOption}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Descripción */}
            <div className="grid sm:grid-cols-4 items-start gap-3">
              <Label htmlFor="productDescription" className="sm:text-right mt-2">
                Descripción
              </Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription || ""} // <-- Aseguramos string vacío
                onChange={handleChange}
                className="sm:col-span-3"
              />
            </div>

            {/* Precio (Principal) */}
            <div className="grid sm:grid-cols-4 items-center gap-3">
              <Label htmlFor="sellingPrice" className="sm:text-right">
                Precio Venta Principal
              </Label>
              <Input
                id="sellingPrice"
                type="text"
                value={formData.sellingPrice || ""} // <-- Aseguramos string vacío
                onChange={handleChange}
                className="sm:col-span-3"
                required
              />
            </div>

            {/* Stock (Principal) */}
            <div className="grid sm:grid-cols-4 items-center gap-3">
              <Label htmlFor="stock" className="sm:text-right">
                Stock Principal
              </Label>
              <Input
                id="stock"
                type="text"
                value={formData.stock || ""} // <-- Aseguramos string vacío
                onChange={handleChange}
                className="sm:col-span-3"
                required
              />
            </div>

            {/* Sección de Imagen */}
            <div className="grid sm:grid-cols-4 items-start gap-3">
              <Label htmlFor="imageUrl" className="sm:text-right mt-2">
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
                {formData.imageUrl ? (
                  <>
                    <img
                      src={formData.imageUrl}
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

            {formData.imageUrl && (
              <div className="grid sm:grid-cols-4 items-center gap-3">
                <Label htmlFor="imageUrl" className="sm:text-right">
                  URL Imagen
                </Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl || ""} // <-- Aseguramos string vacío
                  onChange={handleChange}
                  placeholder="URL de la imagen"
                  className="sm:col-span-3"
                />
              </div>
            )}

            {/* --- Sección de Variantes --- */}
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center justify-between">
                Gestión de Variantes
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasVariants"
                    checked={hasVariantsEnabled}
                    onCheckedChange={(checked) => setHasVariantsEnabled(!!checked)}
                  />
                  <Label htmlFor="hasVariants">Este producto tiene variantes</Label>
                </div>
              </h3>

              {hasVariantsEnabled && (
                <div className="space-y-6">
                  {productVariants.length === 0 && (
                    <p className="text-center text-gray-500">
                      No hay variantes añadidas. Añade una para empezar.
                    </p>
                  )}

                  {productVariants.map((variant, index) => (
                    <div
                      key={variant._tempId}
                      className="border p-4 rounded-md bg-gray-50 space-y-4 relative"
                    >
                      <h4 className="font-medium text-md mb-3">
                        Variante #{index + 1}{" "}
                        {variant.id ? `(ID: ${variant.id})` : "(Nueva)"}
                      </h4>

                      {/* Botón para eliminar variante */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant._tempId)}
                        className="absolute top-4 right-4"
                      >
                        Eliminar
                      </Button>

                      {/* Descripción de la Variante */}
                      <div className="grid sm:grid-cols-4 items-start gap-3">
                        <Label
                          htmlFor={`variant-${variant._tempId}-descripcion`}
                          className="sm:text-right mt-2"
                        >
                          Descripción
                        </Label>
                        <Textarea
                          id={`variant-${variant._tempId}-descripcion`}
                          value={variant.descripcion || ""} // <-- Aseguramos string vacío
                          onChange={(e) =>
                            handleVariantChange(
                              variant._tempId,
                              "descripcion",
                              e.target.value
                            )
                          }
                          className="sm:col-span-3"
                          required
                        />
                      </div>

                      {/* Tipo de Unidad para la Variante */}
                      <div className="grid sm:grid-cols-4 items-center gap-3">
                        <Label className="sm:text-right">Tipo de Unidad</Label>
                        <div className="sm:col-span-3 flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`variant-${variant._tempId}-grams`}
                              name={`variant-${variant._tempId}-unitType`}
                              value="grams"
                              checked={variant.unitType === "grams"} // <-- Preselecciona si es gramos
                              onChange={() =>
                                handleVariantUnitTypeChange(
                                  variant._tempId,
                                  "grams"
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <Label htmlFor={`variant-${variant._tempId}-grams`}>
                              Gramos
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`variant-${variant._tempId}-units`}
                              name={`variant-${variant._tempId}-unitType`}
                              value="units"
                              checked={variant.unitType === "units"} // <-- Preselecciona si es unidades
                              onChange={() =>
                                handleVariantUnitTypeChange(
                                  variant._tempId,
                                  "units"
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <Label htmlFor={`variant-${variant._tempId}-units`}>
                              Unidades
                            </Label>
                          </div>
                        </div>
                      </div>

                      {variant.unitType === "grams" && (
                        <div className="grid sm:grid-cols-4 items-center gap-3">
                          <Label
                            htmlFor={`variant-${variant._tempId}-gramaje`}
                            className="sm:text-right"
                          >
                            Cantidad (Gramos)
                          </Label>
                          <Input
                            id={`variant-${variant._tempId}-gramaje`}
                            type="text"
                            value={variant.gramaje || ""} // <-- Aseguramos string vacío
                            onChange={(e) =>
                              handleVariantChange(
                                variant._tempId,
                                "gramaje",
                                e.target.value
                              )
                            }
                            className="sm:col-span-3"
                            required
                          />
                        </div>
                      )}

                      {variant.unitType === "units" && (
                        <div className="grid sm:grid-cols-4 items-center gap-3">
                          <Label
                            htmlFor={`variant-${variant._tempId}-unidades`}
                            className="sm:text-right"
                          >
                            Cantidad (Unidades)
                          </Label>
                          <Input
                            id={`variant-${variant._tempId}-unidades`}
                            type="text"
                            value={variant.unidades || ""} // <-- Aseguramos string vacío
                            onChange={(e) =>
                              handleVariantChange(
                                variant._tempId,
                                "unidades",
                                e.target.value
                              )
                            }
                            className="sm:col-span-3"
                            required
                          />
                        </div>
                      )}

                      {/* Stock de la Variante */}
                      <div className="grid sm:grid-cols-4 items-center gap-3">
                        <Label
                          htmlFor={`variant-${variant._tempId}-stock`}
                          className="sm:text-right"
                        >
                          Stock
                        </Label>
                        <Input
                          id={`variant-${variant._tempId}-stock`}
                          type="text"
                          value={variant.stock || ""} // <-- Aseguramos string vacío
                          onChange={(e) =>
                            handleVariantChange(
                              variant._tempId,
                              "stock",
                              e.target.value
                            )
                          }
                          className="sm:col-span-3"
                          required
                        />
                      </div>

                      {/* Precio de la Variante */}
                      <div className="grid sm:grid-cols-4 items-center gap-3">
                        <Label
                          htmlFor={`variant-${variant._tempId}-precio`}
                          className="sm:text-right"
                        >
                          Precio
                        </Label>
                        <Input
                          id={`variant-${variant._tempId}-precio`}
                          type="text"
                          step="0.01"
                          value={variant.price || ""} // <-- Aseguramos string vacío
                          onChange={(e) =>
                            handleVariantChange(
                              variant._tempId,
                              "price",
                              e.target.value
                            )
                          }
                          className="sm:col-span-3"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddVariant}
                    variant="outline"
                    className="w-full"
                  >
                    Añadir Variante
                  </Button>
                </div>
              )}
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
    </div>
  );
}