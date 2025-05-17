"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { CalendarWithMonthYearPicker } from "./ui/calendar-with-month-year-picker"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CircleAlert, Loader2Icon, Plus } from "lucide-react"
import MultipleSelector from "@/components/ui/multiselect";
import { zodResolver } from "@hookform/resolvers/zod"
import { format, isValid, parse } from "date-fns"
import { useLoading } from "@/hooks/useLoading"
import { cn, formatDate } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useFetch } from "@/hooks/useFetch"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { es, id } from "date-fns/locale"
import { ScopedMutator } from "swr"
import { Input } from "./ui/input"
import { toast } from "sonner"
import * as z from "zod"

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
    sellingPrice: z.number().min(1, {
        message: "El precio debe ser mayor a 0.",
    }),
    stock: z.number().min(1, {
        message: "El stock debe ser mayor a 0.",
    }),
    categories: z.array(z.string()).min(1, {
        message: "Debe seleccionar al menos una categoria.",
    }),
    costPrice: z.number().min(1, {
        message: "El precio de costo debe ser mayor a 0.",
    })
})

interface ProductoFormProps {
    isEditable?: boolean;
    datos?: {
        id: string
        productName: string
        productDescription: string
        productDetails: string
        imageUrl: string | null
        sellingPrice: number
        stock: number
        categories: string[]
        reviewsIds: string[]
        recipeId: string
        productCode: string
        costPrice: number
    };
    mutate: ScopedMutator | (() => void); // Acepta tanto ScopedMutator como una función sin argumentos
    onClose?: () => void
}

export default function ProductForm({ isEditable = false, datos, mutate, onClose }: ProductoFormProps) {
    const [courseOptions, setCourseOptions] = useState<{ label: string; value: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const { finishLoading, loading, startLoading } = useLoading()
    const fetch = useFetch()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productName: datos?.productName || "",
            productDescription: datos?.productDescription || "",
            productDetails: datos?.productDetails || "",
            sellingPrice: datos?.sellingPrice || 0,
            stock: datos?.stock || 0,
            categories: datos?.categories || [],
            costPrice: datos?.costPrice || 0,
        },
    })

    console.log(datos)

    useEffect(() => {
        const getCourseOptions = async () => {
            setIsLoading(true)
            try {
                const response = await fetch({
                    endpoint: 'cursos/paged',
                    method: 'GET',
                })
                if (response) {
                    const courses = response.content
                    if (courses) {
                        const options = courses.map((course: any) => ({ label: course.title, value: course.id }))
                        setCourseOptions(options)
                    } else {
                        toast.error("Error al cargar los cursos. Inténtalo de nuevo.")
                    }
                }
            } catch (error: any) {
                const errorMessage =
                    (typeof error === 'object' && error.response
                        ? error.response.data?.message
                        : error?.message) ||
                    "Error al cargar los cursos. Inténtalo de nuevo.";
                console.error("Error en getCourseOptions: ", errorMessage)
                toast.error(errorMessage)
            } finally {
                setIsLoading(false)
            }
        }

        getCourseOptions()
    }, [])

    console.log("algo intermedio")

    async function onSubmit(dataForm: z.infer<typeof formSchema>) {
        const formData = {
            id: datos?.id,
            imageUrl: datos?.imageUrl,
            recipeId: datos?.recipeId,
            productCode: datos?.productCode,
            reviewsIds: datos?.reviewsIds,
            productName: dataForm.productName,
            productDescription: dataForm.productDescription,
            productDetails: dataForm.productDetails,
            sellingPrice: dataForm.sellingPrice,
            stock: dataForm.stock,
            categories: dataForm.categories,
            costPrice: dataForm.costPrice,
        }
        startLoading()
        try {
            const endpoint = isEditable ? `estudiantes/actualizar/${datos?.id}` : 'estudiantes/crear'
            const response = await fetch({
                endpoint,
                method: isEditable ? 'PUT' : 'POST',
                formData
            })
            if (response) {
                console.log(response)
                // Llamada a mutate compatible con ambos casos
                if (typeof mutate === "function") {
                    if (isEditable) {
                        await mutate(undefined, true); // Si es ScopedMutator, pasa los argumentos necesarios
                    } else {
                        await mutate(undefined, true); // Si es una función sin argumentos, llámala sin parámetros
                    }
                }
                toast.success(isEditable ? "Usuario actualizado correctamente." : "Usuario creado correctamente.")
                isEditable ? onClose?.() : setOpen(false)
                form.reset()
            }
            return response
        } catch (error: any) {
            const errorMessage =
                (typeof error === 'object' && error.response
                    ? error.response.data?.message
                    : error?.message) ||
                (isEditable ? "Error al actualizar el usuario. Inténtalo de nuevo." : "Error al crear el usuario. Inténtalo de nuevo.");
            console.error("Error en onSubmit: ", errorMessage)
            toast.error(errorMessage)
        } finally {
            finishLoading()
        }
    }

    return (
        <div className="flex items-center gap-3">
            <AlertDialog open={isEditable ? true : open} onOpenChange={isEditable ? onClose : setOpen}>
                <AlertDialogTrigger asChild>
                    {isEditable ? (
                        null
                    ) : (
                        <Button className="ml-auto" variant="outline">
                            <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                            Agregar Estudiante
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
                            <AlertDialogTitle>{isEditable ? "Editar Usuario" : "Formulario de inscripción"}</AlertDialogTitle>
                            <AlertDialogDescription>Por favor, complete todos los campos del formulario.</AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 py-6 px-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
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
                            </div>
                            <FormField
                                control={form.control}
                                name="productDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Detalles</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sellingPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio venta</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                                <Input {...field} />
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
                                        <FormLabel>Categorias</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="costPrice"
                                render={({ field }) => {
                                    return (<>
                                    <FormItem>
                                        <FormLabel>Precio costo</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    </>)
                                }}
                            />
                        </form>
                    </Form>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                            {
                                loading ? <Loader2Icon className="animate-spin" size={16} strokeWidth={2} /> : <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                            }
                            {
                                loading ? (isEditable ? "Actualizando..." : "Creando...") : (isEditable ? "Actualizar" : "Crear")
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}