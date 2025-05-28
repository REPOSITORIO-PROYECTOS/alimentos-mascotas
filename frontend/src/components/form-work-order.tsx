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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { CircleAlert, Loader2Icon, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@/hooks/useLoading";
import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { ScopedMutator } from "swr";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import { useAuthStore } from "@/context/store";

interface WorkOrderFormProps {
    isEditable?: boolean;
    datos?: {
        modifiedBy: string;
        createdBy: string;
        id: string;
        productId: string;
        recipeId: string;
        quantityToDo: number;
        priority: "HIGH" | "MEDIUM" | "LOW";
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
        completedAt: string | null;
        notes: string;
        estimatedCost: number;
        realCost: number;
    };
    mutate?: ScopedMutator | (() => void); // Acepta tanto ScopedMutator como una función sin argumentos
    onClose?: () => void;
}

export default function WorkOrderForm({
    isEditable = false,
    datos,
    mutate,
    onClose,
}: WorkOrderFormProps) {
    const formSchema = z.object({
        productId: z.string().min(1, {
            message: "El producto es requerido.",
        }),
        recipeId: z.string().min(1, {
            message: "La receta es requerida.",
        }),
        quantityToDo: z.coerce.number().positive({
            message: "La cantidad debe ser un número positivo.",
        }),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"], {
            required_error: "Por favor seleccione una prioridad.",
        }),
        status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
            required_error: "Por favor seleccione un estado.",
        }),
        completedAt: z.date().nullable().optional(),
        notes: z.string().optional(),
        estimatedCost: z.coerce.number().nonnegative({
            message: "El costo estimado debe ser un número no negativo.",
        }),
        realCost: z.coerce.number().nonnegative({
            message: "El costo real debe ser un número no negativo.",
        }),
    });

    type FormValues = z.infer<typeof formSchema>;

    const [productsOptions, setProductsOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [recipesOptions, setRecipesOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const { user } = useAuthStore();
    const { finishLoading, loading, startLoading } = useLoading();
    const fetchApi = useFetch();

    const getProductsOptions = useCallback(async () => {
        if (!user?.token) return;

        setIsLoading(true);
        try {
            const response = await fetchApi({
                endpoint: "/productos/pagina?page=0&size=100",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            });
            if (response?.content) {
                const options = response.content.map((product: any) => ({
                    label: product.productName,
                    value: product.id,
                }));
                setProductsOptions(options);
            } else {
                toast.error(
                    "Error al cargar los productos. Inténtalo de nuevo."
                );
            }
        } catch (error: any) {
            const errorMessage =
                (typeof error === "object" && error.response
                    ? error.response.data?.message
                    : error?.message) ||
                "Error al cargar los productos. Inténtalo de nuevo.";
            console.error("Error en getProductsOptions: ", errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token, fetchApi]);

    const getRecipesOptions = useCallback(async () => {
        if (!user?.token) return;

        setIsLoading(true);
        try {
            const response = await fetchApi({
                endpoint: "/recetas/pagina?page=0&size=100",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            });
            if (response?.content.length > 0) {
                const options = response.content.map((recipe: any) => ({
                    label: recipe.productName,
                    value: recipe.id,
                }));
                setRecipesOptions(options);
            } else {
                toast.error("Error al cargar las recetas. Inténtalo de nuevo.");
                setRecipesOptions([
                    { label: "No hay recetas disponibles", value: "S/N" },
                ]);
            }
        } catch (error: any) {
            const errorMessage =
                (typeof error === "object" && error.response
                    ? error.response.data?.message
                    : error?.message) ||
                "Error al cargar las recetas. Inténtalo de nuevo.";
            console.error("Error en getRecipesOptions: ", errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [user?.token, fetchApi]);

    useEffect(() => {
        getProductsOptions();
        getRecipesOptions();
    }, [getProductsOptions, getRecipesOptions]);

    // Convertir fecha string a objeto Date
    const parseDate = (dateString: string | null): Date | null => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productId: datos?.productId || "",
            recipeId: datos?.recipeId || "",
            quantityToDo: datos?.quantityToDo || 0,
            priority: datos?.priority || "MEDIUM",
            status: datos?.status || "PENDING",
            completedAt: datos?.completedAt
                ? parseDate(datos.completedAt)
                : null,
            notes: datos?.notes || "",
            estimatedCost: datos?.estimatedCost || 0,
            realCost: datos?.realCost || 0,
        },
    });

    async function onSubmit(data: FormValues) {
        const formData = {
            productId: data.productId,
            recipeId: data.recipeId || null, // Asegurarse de que recipeId sea opcional
            quantityToDo: data.quantityToDo,
            modifiedBy: user?.id || "",
            createdBy: user?.id || "",
            priority: data.priority,
            status: data.status,
            completedAt: data.completedAt
                ? data.completedAt.toISOString()
                : null,
            notes: data.notes,
            estimatedCost: data.estimatedCost,
            realCost: data.realCost,
            usedIngredients: null,
            ingredientDifferences: null,
            estimatedIngredients: null,
            completedQuantity: null,
        };
        startLoading();
        try {
            const endpoint = isEditable
                ? `/ordenes-trabajo/editar/${datos?.id}`
                : "/ordenes-trabajo/guardar";
            const response = await fetchApi({
                endpoint,
                method: isEditable ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                formData,
            });
            if (response) {
                // Llamada a mutate compatible con ambos casos
                if (typeof mutate === "function") {
                    await mutate(undefined, true);
                }
                toast.success(
                    isEditable
                        ? "Orden de trabajo actualizada correctamente."
                        : "Orden de trabajo creada correctamente."
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
                    ? "Error al actualizar la orden de trabajo. Inténtalo de nuevo."
                    : "Error al crear la orden de trabajo. Inténtalo de nuevo.");
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
                            Agregar Orden de Trabajo
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
                        </div>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isEditable
                                    ? "Editar Orden de Trabajo"
                                    : "Nueva Orden de Trabajo"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Por favor, complete todos los campos del
                                formulario.
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
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Producto</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un producto" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {productsOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="recipeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Receta</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una receta" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {recipesOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="quantityToDo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Cantidad a Producir
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prioridad</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una prioridad" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="HIGH">
                                                        Alta
                                                    </SelectItem>
                                                    <SelectItem value="MEDIUM">
                                                        Media
                                                    </SelectItem>
                                                    <SelectItem value="LOW">
                                                        Baja
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDING">
                                                    Pendiente
                                                </SelectItem>
                                                <SelectItem value="IN_PROGRESS">
                                                    En Progreso
                                                </SelectItem>
                                                <SelectItem value="COMPLETED">
                                                    Completado
                                                </SelectItem>
                                                <SelectItem value="CANCELLED">
                                                    Cancelado
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="completedAt"
                                render={({ field }) => {
                                    // Convertir valor a formato YYYY-MM-DD para el input date
                                    const dateValue =
                                        field.value instanceof Date
                                            ? field.value
                                                  .toISOString()
                                                  .split("T")[0]
                                            : "";
                                    return (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                Fecha de Finalización
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={dateValue}
                                                    onChange={(e) => {
                                                        const date = e.target
                                                            .value
                                                            ? new Date(
                                                                  e.target.value
                                                              )
                                                            : null;
                                                        field.onChange(date);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Añada notas o comentarios sobre la orden de trabajo..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="estimatedCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Costo Estimado
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="realCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Costo Real</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
