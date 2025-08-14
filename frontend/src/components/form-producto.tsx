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
import { useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { ScopedMutator } from "swr";
import { Input } from "./ui/input";
import { toast } from "sonner";
import * as z from "zod";
import { useAuthStore } from "@/context/store";

const isFileListDefined = typeof FileList !== "undefined";

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
    // ... (El estado y los hooks no cambian)
    const [categoryOptions, setCategoryOptions] = useState<
        { label: string; value: string }[]
    >([
        { label: "Alimentos", value: "alimentos" },
        { label: "Accesorios", value: "accesorios" },
        { label: "Juguetes", value: "juguetes" },
        { label: "Salud", value: "salud" },
        { label: "Higiene", value: "higiene" },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();

    const [open, setOpen] = useState(false);
    const { finishLoading, loading, startLoading } = useLoading();
    const fetch = useFetch();

    const formSchema = z
        .object({
            productName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
            productDescription: z.string().min(2, { message: "La descripción debe tener al menos 2 caracteres." }),
            productDetails: z.string().min(2, { message: "Los detalles deben tener al menos 2 caracteres." }),
            imageUrl: z.any(),
            sellingPrice: z.number().min(1, { message: "El precio debe ser mayor a 0." }),
            stock: z.number().min(1, { message: "El stock debe ser mayor a 0." }),
            discountPercent: z.number().min(0, { message: "El descuento debe ser mayor o igual a 0." }),
            categories: z.array(z.string()).min(1, { message: "Debe seleccionar al menos una categoría." }),
            costPrice: z.number().min(1, { message: "El precio de costo debe ser mayor a 0." }),
        })
        .superRefine((data, ctx) => {
            const image = data.imageUrl;
            if (!isEditable) {
                if (!isFileListDefined || !(image instanceof FileList) || image.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar un archivo de imagen.", path: ["imageUrl"] });
                    return;
                }
            }
            if (isFileListDefined && image instanceof FileList && image.length > 0) {
                const file = image[0];
                const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
                if (!validTypes.includes(file?.type)) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Formato de imagen no válido.", path: ["imageUrl"] });
                }
                if (file?.size > 5 * 1024 * 1024) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La imagen no debe exceder los 5MB.", path: ["imageUrl"] });
                }
            }
        });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            productDescription: "",
            productDetails: "",
            sellingPrice: 0,
            stock: 0,
            imageUrl: null,
            discountPercent: 0,
            categories: [],
            costPrice: 0,
        },
    });

    useEffect(() => {
        if (isEditable && datos) {
            form.reset({
                productName: datos.productName,
                productDescription: datos.productDescription,
                productDetails: datos.productDetails,
                sellingPrice: datos.sellingPrice,
                stock: datos.stock,
                discountPercent: datos.discountPercent,
                categories: datos.categories,
                costPrice: datos.costPrice,
            });
        }
        setIsLoading(false);
    }, [isEditable, datos, form]);

    // <--- AÑADIDO PARA DEBUG: Función para manejar errores de validación
    const onInvalid = (errors: any) => {
        console.error("ERRORES DE VALIDACIÓN:", errors);
        toast.error("Hay errores en el formulario. Por favor, revisa los campos marcados en rojo.");
    };

    async function onSubmit(dataForm: z.infer<typeof formSchema>) {
        // <--- AÑADIDO PARA DEBUG: Confirmar que onSubmit se está ejecutando
        console.log("VALIDACIÓN SUPERADA. Datos del formulario:", dataForm);
        toast.info("Procesando formulario...");

        const formDataObj = new FormData();

        if (dataForm.imageUrl && dataForm.imageUrl.length > 0) {
            formDataObj.append("image", dataForm.imageUrl[0]);
        }

        formDataObj.append("productName", dataForm.productName);
        formDataObj.append("productDescription", dataForm.productDescription);
        formDataObj.append("productDetails", dataForm.productDetails);
        formDataObj.append("sellingPrice", dataForm.sellingPrice.toString());
        formDataObj.append("stock", dataForm.stock.toString());
        formDataObj.append("costPrice", dataForm.costPrice.toString());
        formDataObj.append("discountPercent", dataForm.discountPercent?.toString() || "0");
        formDataObj.append("categories", JSON.stringify(dataForm.categories));

        if (isEditable && datos) {
            formDataObj.append("id", datos.id);
        }

        startLoading();
        try {
            const endpoint = isEditable ? `/productos/editar/${datos?.id}` : "/productos/guardar";
            const response = await fetch({
                endpoint,
                method: isEditable ? "PUT" : "POST",
                formData: formDataObj,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (response) {
                // El toast de éxito ya estaba aquí, lo cual es correcto.
                toast.success(isEditable ? "Producto actualizado correctamente." : "Producto creado correctamente.");
                if (typeof mutate === "function") {
                    await mutate(undefined, true);
                }
                isEditable ? onClose?.() : setOpen(false);
                form.reset();
            }
            // No es necesario retornar la respuesta aquí a menos que otro componente la use
        } catch (error: any) {
            // <--- MODIFICADO PARA DEBUG: Loguear el objeto de error completo
            console.error("ERROR EN LA PETICIÓN (catch):", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                (isEditable ? "Error al actualizar el producto." : "Error al crear el producto.");
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
                            <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                            Agregar Producto
                        </Button>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-lg">
                    {/* ... (El header no cambia) ... */}
                    <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                        <div
                            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                            aria-hidden="true"
                        >
                            <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                        </div>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{isEditable ? "Editar Producto" : "Agregar Nuevo Producto"}</AlertDialogTitle>
                            <AlertDialogDescription>Complete los detalles del producto para continuar.</AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>

                    {/* <--- CAMBIO IMPORTANTE: Pasamos `onInvalid` a handleSubmit */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                            className="space-y-4 mt-4 py-6 px-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
                        >
                           {/* ... (Todos los FormField permanecen iguales) ... */}
                           {/* ... */}
                        </form>
                    </Form>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => (isEditable ? onClose?.() : setOpen(false))}>
                            Cancelar
                        </AlertDialogCancel>
                        {/* <--- CAMBIO IMPORTANTE: Pasamos `onInvalid` a handleSubmit también aquí */}
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit, onInvalid)} disabled={loading}>
                            {loading ? (
                                <Loader2Icon className="animate-spin" size={16} strokeWidth={2} />
                            ) : (
                                <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                            )}
                            {loading ? (isEditable ? "Actualizando..." : "Creando...") : isEditable ? "Actualizar" : "Crear"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}