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

    // --- CAMBIO PRINCIPAL: El esquema se define DENTRO del componente ---
    const formSchema = z
        .object({
            productName: z.string().min(2, {
                message: "El nombre debe tener al menos 2 caracteres.",
            }),
            productDescription: z.string().min(2, {
                message: "La descripción debe tener al menos 2 caracteres.",
            }),
            productDetails: z.string().min(2, {
                message: "Los detalles deben tener al menos 2 caracteres.",
            }),
            imageUrl: z.any(), // Se define como 'any' para la validación condicional
            sellingPrice: z.number().min(1, {
                message: "El precio debe ser mayor a 0.",
            }),
            stock: z.number().min(1, {
                message: "El stock debe ser mayor a 0.",
            }),
            discountPercent: z.number().min(0, {
                message: "El descuento debe ser mayor o igual a 0.",
            }),
            categories: z.array(z.string()).min(1, {
                message: "Debe seleccionar al menos una categoría.",
            }),
            costPrice: z.number().min(1, {
                message: "El precio de costo debe ser mayor a 0.",
            }),
        })
        .superRefine((data, ctx) => {
            const image = data.imageUrl;

            // Si estamos en modo CREACIÓN, la imagen es obligatoria
            if (!isEditable) {
                if (!isFileListDefined || !(image instanceof FileList) || image.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Debe seleccionar un archivo de imagen.",
                        path: ["imageUrl"],
                    });
                    return; // Detenemos la validación aquí si falla
                }
            }

            // Esta validación se aplica si se ha subido un archivo nuevo (tanto en creación como en edición)
            if (isFileListDefined && image instanceof FileList && image.length > 0) {
                const file = image[0];
                const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
                if (!validTypes.includes(file?.type)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Formato de imagen no válido. Solo se permiten JPEG, PNG, JPG y WEBP.",
                        path: ["imageUrl"],
                    });
                }
                if (file?.size > 5 * 1024 * 1024) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "El tamaño de la imagen no debe exceder los 5MB.",
                        path: ["imageUrl"],
                    });
                }
            }
            // Si estamos en modo EDICIÓN y no se sube un archivo nuevo, no se hace nada y la validación pasa.
        });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: "",
            productDescription: "",
            productDetails: "",
            sellingPrice: 0,
            stock: 0,
            imageUrl: null, // Importante: iniciar como null para el campo de archivo
            discountPercent: 0,
            categories: [],
            costPrice: 0,
        },
    });

    useEffect(() => {
        // Cargar los datos iniciales en el formulario cuando esté en modo de edición
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
                // No establecemos imageUrl aquí, ya que el input de archivo no puede tener un valor programático.
                // El usuario decidirá si sube uno nuevo.
            });
        }
        setIsLoading(false);
    }, [isEditable, datos, form]);

    async function onSubmit(dataForm: z.infer<typeof formSchema>) {
        const formDataObj = new FormData();

        // Agregar la imagen SÓLO si es un objeto FileList (es decir, se subió un archivo nuevo)
        if (dataForm.imageUrl && dataForm.imageUrl.length > 0) {
            formDataObj.append("image", dataForm.imageUrl[0]);
        }

        // Agregar el resto de los campos
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
            // Si no se proporcionó una nueva imagen y existe una antigua, el backend debería mantenerla.
            // Si tu backend necesita explícitamente la URL antigua, puedes descomentar la siguiente línea:
            // if ((!dataForm.imageUrl || dataForm.imageUrl.length === 0) && datos.imageUrl) {
            //     formDataObj.append("imageUrl", datos.imageUrl);
            // }
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
                console.log(response);
                if (typeof mutate === "function") {
                    await mutate(undefined, true);
                }
                toast.success(
                    isEditable ? "Producto actualizado correctamente." : "Producto creado correctamente."
                );
                isEditable ? onClose?.() : setOpen(false);
                form.reset();
            }
            return response;
        } catch (error: any) {
            const errorMessage =
                (typeof error === "object" && error.response ? error.response.data?.message : error?.message) ||
                (isEditable ? "Error al actualizar el producto. Inténtalo de nuevo." : "Error al crear el producto. Inténtalo de nuevo.");
            console.error("Error en onSubmit: ", errorMessage);
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
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 mt-4 py-6 px-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="productName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="productDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="productDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Detalles</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>
                                            Imagen del Producto {isEditable && <span className="text-muted-foreground text-xs">(Opcional si no desea cambiarla)</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center justify-center w-full">
                                                <label
                                                    htmlFor="dropzone-file"
                                                    className={cn(
                                                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                                                        form.formState.errors.imageUrl
                                                            ? "border-destructive bg-destructive/10 dark:bg-destructive/20 dark:border-destructive hover:bg-destructive/10 dark:hover:border-destructive"
                                                            : "border-zinc-300 bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:border-zinc-500"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex flex-col items-center justify-center pt-5 pb-6",
                                                            form.formState.errors.imageUrl
                                                                ? "text-destructive"
                                                                : "text-zinc-500 dark:text-zinc-400"
                                                        )}
                                                    >
                                                        <CloudUpload className="h-10 w-10" />
                                                        {value && value.length > 0 ? (
                                                            <>
                                                                <p className="mb-2 text-sm font-semibold">Imagen seleccionada</p>
                                                                <p className="text-sm">{value[0].name}</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="mb-2 text-sm">
                                                                    <span className="font-semibold">Click para subir una imagen</span> o arrástrala aquí
                                                                </p>
                                                                <p className="text-xs">JPEG, PNG, JPG o WEBP (MAX. 5MB)</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="dropzone-file"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        {...fieldProps}
                                                    />
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sellingPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio venta</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="discountPercent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descuento (%)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="categories"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categorías</FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                value={field.value.map((category) => ({
                                                    label: category,
                                                    value: category,
                                                }))}
                                                onChange={(options) => {
                                                    field.onChange(options.map((option) => option.value));
                                                }}
                                                defaultOptions={categoryOptions}
                                                placeholder="Seleccionar categorías"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="costPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio costo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => (isEditable ? onClose?.() : setOpen(false))}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)} disabled={loading}>
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