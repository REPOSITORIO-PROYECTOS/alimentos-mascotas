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

const isFileListDefined = typeof FileList !== "undefined";

const imageSchema = isFileListDefined
    ? z
          .instanceof(FileList)
          .refine((files) => files.length > 0, {
              message: "Debe seleccionar un archivo de imagen.",
          })
          .refine(
              (files) => {
                  const validTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/jpg",
                      "image/webp",
                  ];
                  return validTypes.includes(files[0]?.type);
              },
              {
                  message:
                      "Formato de imagen no válido. Solo se permiten JPEG, PNG, JPG y WEBP.",
              }
          )
          .refine((files) => files[0]?.size <= 5 * 1024 * 1024, {
              message: "El tamaño de la imagen no debe exceder los 5MB.",
          })
    : z.any();

const formSchema = z.object({
    productName: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    productDescription: z.string().min(2, {
        message: "La descripcion debe tener al menos 2 caracteres.",
    }),
    productDetails: z.string().min(2, {
        message: "Los detalles deben tener al menos 2 caracteres.",
    }),
    imageUrl: imageSchema,
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
        message: "Debe seleccionar al menos una categoria.",
    }),
    costPrice: z.number().min(1, {
        message: "El precio de costo debe ser mayor a 0.",
    }),
});

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
    mutate: ScopedMutator | (() => void); // Acepta tanto ScopedMutator como una función sin argumentos
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
    const [open, setOpen] = useState(false);
    const { finishLoading, loading, startLoading } = useLoading();
    const fetch = useFetch();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: datos?.productName || "",
            productDescription: datos?.productDescription || "",
            productDetails: datos?.productDetails || "",
            sellingPrice: datos?.sellingPrice || 0,
            stock: datos?.stock || 0,
            imageUrl: datos?.imageUrl || null,
            discountPercent: datos?.discountPercent || 0,
            categories: datos?.categories || [],
            costPrice: datos?.costPrice || 0,
        },
    });

    useEffect(() => {
        // El formulario está listo para usar
        setIsLoading(false);
    }, []);
    async function onSubmit(dataForm: z.infer<typeof formSchema>) {
        const formDataObj = new FormData();

        // Agregar la imagen si existe
        if (dataForm.imageUrl && dataForm.imageUrl.length > 0) {
            formDataObj.append("image", dataForm.imageUrl[0]);
        }

        // Agregar el resto de campos
        formDataObj.append("product", JSON.stringify({
            productName: dataForm.productName,
            productDescription: dataForm.productDescription,
            productDetails: dataForm.productDetails,
            sellingPrice: dataForm.sellingPrice.toString(),
            stock: dataForm.stock.toString(),
            costPrice: dataForm.costPrice.toString(),
            discountPercent: dataForm.discountPercent?.toString() || "0",
            categories: dataForm.categories,
        }));

        // Agregar campos existentes si es edición
        if (isEditable && datos) {
            formDataObj.append("id", datos.id);
            if (datos.productCode)
                formDataObj.append("productCode", datos.productCode);
            if (datos.recipeId) formDataObj.append("recipeId", datos.recipeId);
            if (datos.reviewsIds)
                formDataObj.append(
                    "reviewsIds",
                    JSON.stringify(datos.reviewsIds)
                );
            // No agregamos imageUrl existente porque ya estamos enviando el archivo nuevo
            if (!dataForm.imageUrl || dataForm.imageUrl.length === 0) {
                if (datos.imageUrl)
                    formDataObj.append("imageUrl", datos.imageUrl);
            }
        }

        startLoading();
        try {
            const endpoint = isEditable
                ? `productos/actualizar/${datos?.id}`
                : "productos/crear";
            const response = await fetch({
                endpoint,
                method: isEditable ? "PUT" : "POST",
                formData: formDataObj,
            });
            if (response) {
                console.log(response);
                // Llamada a mutate compatible con ambos casos
                if (typeof mutate === "function") {
                    if (isEditable) {
                        await mutate(undefined, true); // Si es ScopedMutator, pasa los argumentos necesarios
                    } else {
                        await mutate(undefined, true); // Si es una función sin argumentos, llámala sin parámetros
                    }
                }
                toast.success(
                    isEditable
                        ? "Producto actualizado correctamente."
                        : "Producto creado correctamente."
                );
                isEditable ? onClose?.() : setOpen(false);
                form.reset();
            }
            return response;
        } catch (error: any) {
            const errorMessage =
                (typeof error === "object" && error.response
                    ? error.response.data?.message
                    : error?.message) ||
                (isEditable
                    ? "Error al actualizar el producto. Inténtalo de nuevo."
                    : "Error al crear el producto. Inténtalo de nuevo.");
            console.error("Error en onSubmit: ", errorMessage);
            toast.error(errorMessage);
        } finally {
            finishLoading();
        }
    }

    return (
        <div className="flex items-center gap-3">
            <AlertDialog
                open={isEditable ? true : open}
                onOpenChange={isEditable ? onClose : setOpen}
            >
                <AlertDialogTrigger asChild>
                    {isEditable ? null : (
                        <Button className="ml-auto" variant="outline">
                            <Plus
                                className="-ms-1 me-2 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
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
                            <CircleAlert
                                className="opacity-80"
                                size={16}
                                strokeWidth={2}
                            />
                        </div>{" "}
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isEditable
                                    ? "Editar Producto"
                                    : "Agregar Nuevo Producto"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Complete los detalles del producto para
                                continuar.
                            </AlertDialogDescription>
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
                                            <FormLabel>Descripcion</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>{" "}
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
                                render={({
                                    field: { value, onChange, ...fieldProps },
                                }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <div className="flex items-center justify-center w-full">
                                                <label
                                                    htmlFor="dropzone-file"
                                                    className={cn(
                                                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                                                        form.formState.errors
                                                            .imageUrl
                                                            ? "border-destructive bg-destructive/10 dark:bg-destructive/20 dark:border-destructive hover:bg-destructive/10 dark:hover:border-destructive"
                                                            : "border-zinc-300 bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:border-zinc-500"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex flex-col items-center justify-center pt-5 pb-6",
                                                            form.formState
                                                                .errors.imageUrl
                                                                ? "text-destructive"
                                                                : "text-zinc-500 dark:text-zinc-400"
                                                        )}
                                                    >
                                                        <CloudUpload className="h-10 w-10" />
                                                        {value &&
                                                        value.length > 0 ? (
                                                            <>
                                                                <p className="mb-2 text-sm font-semibold">
                                                                    Imagen
                                                                    seleccionada
                                                                </p>
                                                                <p className="text-sm">
                                                                    {
                                                                        value[0]
                                                                            .name
                                                                    }
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="mb-2 text-sm">
                                                                    <span className="font-semibold">
                                                                        Click
                                                                        para
                                                                        subir
                                                                        una
                                                                        imagen
                                                                    </span>{" "}
                                                                    o saca una
                                                                    foto desde
                                                                    el teléfono
                                                                </p>
                                                                <p className="text-xs">
                                                                    JPEG, PNG,
                                                                    JPG o WEBP
                                                                    (MAX. 2MB)
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="dropzone-file"
                                                        type="file"
                                                        accept="image/*;capture=camera"
                                                        className={cn(
                                                            "hidden",
                                                            form.formState
                                                                .errors
                                                                .imageUrl &&
                                                                "border-destructive"
                                                        )}
                                                        onChange={(e) =>
                                                            onChange(
                                                                e.target.files
                                                            )
                                                        }
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
                                {" "}
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
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
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
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
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
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>{" "}
                            <FormField
                                control={form.control}
                                name="categories"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categorías</FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                value={field.value.map(
                                                    (category) => ({
                                                        label: category,
                                                        value: category,
                                                    })
                                                )}
                                                onChange={(options) => {
                                                    field.onChange(
                                                        options.map(
                                                            (option) =>
                                                                option.value
                                                        )
                                                    );
                                                }}
                                                defaultOptions={[
                                                    {
                                                        label: "Alimentos",
                                                        value: "alimentos",
                                                    },
                                                    {
                                                        label: "Accesorios",
                                                        value: "accesorios",
                                                    },
                                                    {
                                                        label: "Juguetes",
                                                        value: "juguetes",
                                                    },
                                                    {
                                                        label: "Salud",
                                                        value: "salud",
                                                    },
                                                    {
                                                        label: "Higiene",
                                                        value: "higiene",
                                                    },
                                                ]}
                                                placeholder="Seleccionar categorías"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />{" "}
                            <FormField
                                control={form.control}
                                name="costPrice"
                                render={({ field }) => {
                                    return (
                                        <>
                                            <FormItem>
                                                <FormLabel>
                                                    Precio costo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        </>
                                    );
                                }}
                            />
                        </form>
                    </Form>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpen(false)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {loading ? (
                                <Loader2Icon
                                    className="animate-spin"
                                    size={16}
                                    strokeWidth={2}
                                />
                            ) : (
                                <Plus
                                    className="-ms-1 me-2 opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                            )}
                            {loading
                                ? isEditable
                                    ? "Actualizando..."
                                    : "Creando..."
                                : isEditable
                                ? "Actualizar"
                                : "Crear"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
