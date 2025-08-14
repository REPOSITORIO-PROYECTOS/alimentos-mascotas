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
import { ScopedMutator } from "swr/_internal";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import { useAuthStore } from "@/context/store";

interface CashRegisterFormProps {
    isEditable?: boolean;
    datos?: {
        id: string;
        cashRegisterId: string;
        title: string;
        description: string;
        amount: number;
        date: string;
        registeredBy: string;
        income: boolean;
    };
    mutate: ScopedMutator | (() => void);
    onClose?: () => void;
}

const cashRegisterSchema = z.object({
    title: z.string().min(1, "El título es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    income: z.boolean(),
});

type CashRegisterFormData = z.infer<typeof cashRegisterSchema>;

export default function CashRegisterForm({
    isEditable = false,
    datos,
    mutate,
    onClose,
}: CashRegisterFormProps) {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [open, setOpen] = useState(false);
    const { loading, startLoading, finishLoading } = useLoading();
    const fetch = useFetch();
    const { user } = useAuthStore();

    const form = useForm<CashRegisterFormData>({
        resolver: zodResolver(cashRegisterSchema),
        defaultValues: {
            title: "",
            description: "",
            amount: 0,
            income: true,
        },
    });

    useEffect(() => {
        if (isEditable && datos) {
            form.reset({
                title: datos.title || "",
                description: datos.description || "",
                amount: datos.amount || 0,
                income: datos.income ?? true,
            });
        }
    }, [isEditable, datos, form]);

    const onSubmit = useCallback(
        async (data: CashRegisterFormData) => {
            try {
                startLoading();

                const endpoint =
                    isEditable && datos
                        ? `/caja/${datos.id}`
                        : "/caja/registrar-movimiento";

                const method = isEditable ? "PUT" : "POST";
                const payload = {
                    ...data,
                    // registeredBy: user?.username || user?.name || "Usuario",
                    paymentId: "",
                };
                await fetch({
                    endpoint,
                    method,
                    formData: payload,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                toast.success(
                    isEditable
                        ? "Item de caja actualizado correctamente"
                        : "Item de caja creado correctamente"
                );

                // Llamada a mutate compatible con ambos casos
                if (typeof mutate === "function") {
                    if (isEditable) {
                        await mutate(undefined, true);
                    } else {
                        mutate(undefined, true);
                    }
                }
                form.reset();
                setOpen(false);
                if (onClose) onClose();
            } catch (error: any) {
                console.error("Error:", error);
                toast.error(
                    error.message ||
                        `Error al ${
                            isEditable ? "actualizar" : "crear"
                        } el item de caja`
                );
            } finally {
                finishLoading();
            }
        },
        [
            isEditable,
            datos,
            fetch,
            form,
            mutate,
            onClose,
            startLoading,
            finishLoading,
            user,
        ]
    );

    const handleDelete = useCallback(async () => {
        if (!datos?.id) return;

        try {
            startLoading();
            await fetch({
                endpoint: `/caja/${datos.id}`,
                method: "DELETE",
            });

            toast.success("Item de caja eliminado correctamente");
            // Llamada a mutate compatible con ambos casos
            if (typeof mutate === "function") {
                await mutate(undefined, true);
            }
            setShowDeleteAlert(false);
            setOpen(false);
            if (onClose) onClose();
        } catch (error: any) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar el item de caja");
        } finally {
            finishLoading();
        }
    }, [datos?.id, fetch, mutate, onClose, startLoading, finishLoading, user]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            form.reset();
            if (onClose) onClose();
        }
    };

    if (isEditable && onClose) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                    <h2 className="mb-4 text-lg font-semibold">
                        Editar Item de Caja
                    </h2>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ingrese el título"
                                                {...field}
                                            />
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
                                            <Textarea
                                                placeholder="Descripción del concepto"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
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
                                name="income"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === "true")
                                            }
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">
                                                    Ingreso
                                                </SelectItem>
                                                <SelectItem value="false">
                                                    Egreso
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onClose()}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <div className="flex gap-2">
                                    {isEditable && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() =>
                                                setShowDeleteAlert(true)
                                            }
                                            disabled={loading}
                                        >
                                            Eliminar
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={loading}>
                                        {loading && (
                                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {isEditable ? "Actualizar" : "Guardar"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>

                    <AlertDialog
                        open={showDeleteAlert}
                        onOpenChange={setShowDeleteAlert}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <CircleAlert className="h-5 w-5 text-red-500" />
                                    ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se
                                    eliminará permanentemente este item de la
                                    caja registradora.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={loading}
                                >
                                    {loading && (
                                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Ingreso / Egreso
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Ingresos y Egresos de la Caja</AlertDialogTitle>
                    <AlertDialogDescription>
                        Complete los campos para agregar un nuevo item a la caja registradora.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ingrese el título"
                                            {...field}
                                        />
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
                                        <Textarea
                                            placeholder="Concepto del movimiento de dinero"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0
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
                            name="income"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(value === "true")
                                        }
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione el tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">
                                                Ingreso
                                            </SelectItem>
                                            <SelectItem value="false">
                                                Egreso
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => form.reset()}>
                                Cancelar
                            </AlertDialogCancel>
                            <Button type="submit" disabled={loading}>
                                {loading && (
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Guardar
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}