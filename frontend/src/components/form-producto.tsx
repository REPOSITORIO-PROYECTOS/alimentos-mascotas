"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { CircleAlert, CloudUpload, Loader2Icon, Plus } from "lucide-react";
import MultipleSelector from "@/components/ui/multiselect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@/hooks/useLoading";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { ScopedMutator } from "swr";
import { Input } from "./ui/input";
import { toast } from "sonner";
import * as z from "zod";
import { useAuthStore } from "@/context/store";

const isFileListDefined = typeof FileList !== "undefined";

// Función que genera el esquema de validación correcto según el modo (crear o editar)
const getFormSchema = (isEditable: boolean) => {
    // 1. La validación de la imagen es condicional
    const imageSchema = isFileListDefined
        ? z.instanceof(FileList).refine(
              (files) => {
                  // Si estamos EDITANDO, un campo de imagen vacío es VÁLIDO.
                  if (isEditable && (!files || files.length === 0)) {
                      return true;
                  }
                  // Si estamos CREANDO, un archivo es OBLIGATORIO.
                  return files?.length > 0;
              },
              { message: "Debe seleccionar un archivo de imagen." }
          )
        .refine(
            (files) => {
                if (!files || files.length === 0) return true; // No validar si no hay archivo
                const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
                return validTypes.includes(files[0]?.type);
            },
            { message: "Formato de imagen no válido. Solo se permiten JPEG, PNG, JPG y WEBP." }
        )
        .refine(
            (files) => {
                if (!files || files.length === 0) return true; // No validar si no hay archivo
                return files[0]?.size <= 5 * 1024 * 1024;
            },
            { message: "El tamaño de la imagen no debe exceder los 5MB." }
        )
        : z.any();

    return z.object({
        productName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
        productDescription: z.string().min(2, { message: "La descripcion debe tener al menos 2 caracteres." }),
        productDetails: z.string().min(2, { message: "Los detalles deben tener al menos 2 caracteres." }),
        
        // El campo de imagen es opcional en su base, la lógica está en el `refine` de arriba
        imageUrl: imageSchema.optional(),

        // 2. Usamos z.coerce.number() para convertir strings de inputs a números automáticamente. Es más robusto.
        sellingPrice: z.coerce.number().min(1, { message: "El precio debe ser mayor a 0." }),
        stock: z.coerce.number().min(0, { message: "El stock debe ser 0 o mayor." }), // Permitimos stock 0
        discountPercent: z.coerce.number().min(0, { message: "El descuento debe ser mayor o igual a 0." }),
        costPrice: z.coerce.number().min(1, { message: "El precio de costo debe ser mayor a 0." }),
        
        categories: z.array(z.string()).min(1, { message: "Debe seleccionar al menos una categoria." }),
    });
};

interface ProductoFormProps {
    isEditable?: boolean;
    datos?: {
        id: string;
        productName: string;
        productDescription: string;
        productDetails: string;
        imageUrl: string | null;
        sellingPrice: number;
        stock: number;
        discountPercent: number;
        categories: string[];
        reviewsIds: string[];
        recipeId: string;
        productCode: string;
        costPrice: number;
    };
    mutate: ScopedMutator | (() => void);
    onClose?: () => void;
}

export default function ProductForm({
    isEditable = false,
    datos,
    mutate,
    onClose,
}: ProductoFormProps) {
    const { user } = useAuthStore();
    const { loading, startLoading, finishLoading } = useLoading();
    const fetch = useFetch();
    const [open, setOpen] = useState(false);
    const formSchema = getFormSchema(isEditable);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: datos?.productName || "",
            productDescription: datos?.productDescription || "",
            productDetails: datos?.productDetails || "",
            sellingPrice: datos?.sellingPrice || 0,
            stock: datos?.stock || 0,
            discountPercent: datos?.discountPercent || 0,
            categories: datos?.categories || [],
            costPrice: datos?.costPrice || 0,
            // 3. Importante: imageUrl SIEMPRE se inicializa como undefined para que el input de archivo esté vacío.
            imageUrl: undefined,
        },
    });

    // 4. Lógica de envío final y simplificada
    async function onSubmit(dataForm: z.infer<typeof formSchema>) {
        startLoading();
        try {
            const formDataObj = new FormData();

            // Agregar todos los campos de texto/número
            formDataObj.append("productName", dataForm.productName);
            formDataObj.append("productDescription", dataForm.productDescription);
            formDataObj.append("productDetails", dataForm.productDetails);
            formDataObj.append("sellingPrice", dataForm.sellingPrice.toString());
            formDataObj.append("stock", dataForm.stock.toString());
            formDataObj.append("costPrice", dataForm.costPrice.toString());
            formDataObj.append("discountPercent", dataForm.discountPercent.toString());
            formDataObj.append("categories", JSON.stringify(dataForm.categories));

            // Si, y solo si, el usuario seleccionó un ARCHIVO NUEVO, lo agregamos.
            if (dataForm.imageUrl && dataForm.imageUrl.length > 0) {
                formDataObj.append("image", dataForm.imageUrl[0]); // Se envía el archivo
            }
            
            // Lógica simple: si no se envía un archivo 'image', el backend no debe tocar la URL existente.
            
            const endpoint = isEditable ? `/productos/editar/${datos?.id}` : "/productos/guardar";
            const method = isEditable ? "PUT" : "POST";

            const response = await fetch({
                endpoint,
                method,
                formData: formDataObj,
                headers: { Authorization: `Bearer ${user?.token}` },
            });

            if (response) {
                toast.success(isEditable ? "Producto actualizado correctamente." : "Producto creado correctamente.");
                if (typeof mutate === "function") {
                    await mutate(undefined, true);
                }
                isEditable ? onClose?.() : setOpen(false);
                form.reset();
            } else {
                toast.error("La operación no devolvió una respuesta afirmativa del servidor.");
            }

        } catch (error: any) {
            const errorMessage = (error.response?.data?.message) || (isEditable ? "Error al actualizar." : "Error al crear.");
            console.error("Error en onSubmit:", error);
            toast.error(errorMessage);
        } finally {
            finishLoading();
        }
    }

    return (
        <div className="flex items-center gap-3">
            <AlertDialog open={isEditable ? true : open} onOpenChange={isEditable ? onClose : setOpen}>
                <AlertDialogTrigger asChild>
                    {isEditable ? null : (
                        <Button className="ml-auto" variant="outline">
                            <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                            Agregar Producto
                        </Button>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isEditable ? "Editar Producto" : "Agregar Nuevo Producto"}</AlertDialogTitle>
                        <AlertDialogDescription>Complete los detalles del producto para continuar.</AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            {/* ... (Aquí irían todos tus FormField) ... */}
                            {/* Ejemplo de un campo numérico simplificado. Aplica esto a todos. */}
                            <FormField
                                control={form.control}
                                name="sellingPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio venta</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             {/* ... Repite para todos los demás campos ... */}
                        </form>
                    </Form>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => isEditable ? onClose?.() : setOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                            {loading ? <Loader2Icon className="animate-spin" /> : (isEditable ? "Actualizar" : "Crear")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}