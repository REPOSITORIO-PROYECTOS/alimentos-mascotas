"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { CircleAlert, Loader2Icon, Plus } from "lucide-react"
import MultipleSelector from "@/components/ui/multiselect";
import { zodResolver } from "@hookform/resolvers/zod"
import { useLoading } from "@/hooks/useLoading"
import { useEffect, useState } from "react"
import { useFetch } from "@/hooks/useFetch"
import { useForm } from "react-hook-form"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ScopedMutator } from "swr"
import { Input } from "./ui/input"
import { toast } from "sonner"
import * as z from "zod"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "El título debe tener al menos 2 caracteres.",
    }),
    description: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE"], {
        required_error: "Por favor seleccione un estado.",
    }),
    monthlyPrice: z.number({
        required_error: "El precio mensual es requerido."
    }).min(0, {
        message: "El precio mensual debe ser mayor o igual a 0.",
    }),
    studentsIds: z.array(z.string()).optional(),
    teacherId: z.string().optional()
})

interface AgregarCursoProps {
    isEditable?: boolean;
    datos?: {
        id: string
        title: string
        description: string
        status: 'ACTIVE' | 'INACTIVE'
        monthlyPrice: number
        studentsIds: string[]
        teacherId: string
    };
    mutate: ScopedMutator | (() => void); // Acepta tanto ScopedMutator como una función sin argumentos
    onClose?: () => void
}

export default function FormCurso({ isEditable = false, datos, mutate, onClose }: AgregarCursoProps) {
    const [studentOptions, setStudentOptions] = useState<{ label: string; value: string }[]>([])
    const [teacherOptions, setTeacherOptions] = useState<{ label: string; value: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const { finishLoading, loading, startLoading } = useLoading()
    const fetch = useFetch()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: datos?.title || "",
            description: datos?.description || "",
            status: datos?.status || undefined,
            monthlyPrice: datos?.monthlyPrice || 0,
            studentsIds: datos?.studentsIds ?? [],
            teacherId: datos?.teacherId || "",
        },
    })

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true)
            try {
                const [studentsResponse, teachersResponse] = await Promise.all([
                    fetch({
                        endpoint: 'estudiantes/todos?page=0&size=1000',
                        method: 'GET',
                    }),
                    fetch({
                        endpoint: 'profesores/todos?page=0&size=1000',
                        method: 'GET',
                    })
                ])
                if (studentsResponse && studentsResponse.content) {
                    const students = studentsResponse.content
                    const studentOptions = students.map((student: any) => ({ label: `${student.name} ${student.surname}`, value: student.id }))
                    setStudentOptions(studentOptions)
                }
                if (teachersResponse && teachersResponse.content) {
                    const teachers = teachersResponse.content
                    const teacherOptions = teachers.map((teacher: any) => ({ label: `${teacher.name} ${teacher.surname}`, value: teacher.id }))
                    setTeacherOptions(teacherOptions)
                }
            } catch (error: any) {
                const errorMessage =
                    (typeof error === 'object' && error.response
                        ? error.response.data?.message
                        : error?.message) ||
                    "Error al cargar las opciones. Inténtalo de nuevo.";
                console.error("Error en fetchOptions: ", errorMessage)
                toast.error(errorMessage)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOptions()
    }, [])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const formData = {
            title: data.title,
            description: data.description,
            status: data.status,
            monthlyPrice: Number.parseFloat(data.monthlyPrice.toString()),
            studentsIds: data.studentsIds,
            teacherId: data.teacherId,
        }
        startLoading()
        try {
            const endpoint = isEditable ? `cursos/${datos?.id}` : 'cursos'
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
                        mutate(undefined, true); // Si es una función sin argumentos, llámala sin parámetros
                    }
                }
                toast.success(isEditable ? "Curso actualizado correctamente." : "Curso creado correctamente.")
                isEditable ? onClose?.() : setOpen(false)
                form.reset()
            }
            return response
        } catch (error: any) {
            const errorMessage =
                (typeof error === 'object' && error.response
                    ? error.response.data?.message
                    : error?.message) ||
                (isEditable ? "Error al actualizar el curso. Inténtalo de nuevo." : "Error al crear el curso. Inténtalo de nuevo.");
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
                            Agregar Curso
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
                            <AlertDialogTitle>{isEditable ? "Editar Curso" : "Formulario de Curso"}</AlertDialogTitle>
                            <AlertDialogDescription>Por favor, complete todos los campos del formulario.</AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 py-6 px-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Activo</SelectItem>
                                                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="monthlyPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Mensual</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {
                                isLoading ? <Loader2Icon className="animate-spin" size={16} strokeWidth={2} /> : <FormField
                                    control={form.control}
                                    name="studentsIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estudiantes (opcional)</FormLabel>
                                            <FormControl>
                                                <MultipleSelector
                                                    options={studentOptions}
                                                    //@ts-ignore
                                                    selected={
                                                        field.value?.map(
                                                            (id: string) =>
                                                                studentOptions.find((option) => option.value === id) || { value: id, label: id },
                                                        ) || []
                                                    }
                                                    onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                                                    placeholder="Seleccionar estudiantes..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            }
                            {
                                isLoading ? <Loader2Icon className="animate-spin" size={16} strokeWidth={2} /> :
                                    <FormField
                                        control={form.control}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profesor</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione un profesor" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>

                                                        {
                                                            teacherOptions.length === 0 ? <SelectItem value="no-disponible" disabled>Profesores no disponibles</SelectItem> :
                                                                teacherOptions.map((teacher) => (
                                                                    <SelectItem key={teacher.value} value={teacher.value}>
                                                                        {teacher.label}
                                                                    </SelectItem>
                                                                ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                            }
                        </form>
                    </Form>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                            {
                                loading ? <Loader2Icon className="animate-spin" size={16} strokeWidth={2} /> :
                                    <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
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
