"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ShippingZoneItem } from "./columns"; // Importamos el tipo

// Esquema de validación con Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  province: z.string().min(2, {
    message: "La provincia debe tener al menos 2 caracteres.",
  }),
  city: z.string().min(2, {
    message: "La ciudad debe tener al menos 2 caracteres.",
  }),
  postal_codes: z.string().min(1, {
    message: "Los códigos postales son requeridos.",
  }),
  base_cost: z.string().refine((val) => !isNaN(parseFloat(val)), { // Validar que sea un número (puede ser string en el backend)
    message: "El costo base debe ser un número válido.",
  }).transform(val => parseFloat(val).toFixed(2)), // Formatear a 2 decimales
  cost_per_kg: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "El costo por kg debe ser un número válido.",
  }).transform(val => parseFloat(val).toFixed(2)), // Formatear a 2 decimales
  estimated_days: z.coerce.number().min(1, { // Usar coerce para convertir a número directamente
    message: "Los días estimados deben ser al menos 1.",
  }),
  is_active: z.boolean().default(true),
});

// Tipos para los datos del formulario (después de la validación de Zod)
export type ShippingZoneFormValues = z.infer<typeof formSchema>;

interface ShippingZoneFormProps {
  initialData?: ShippingZoneItem; // Datos iniciales para edición
  onSubmit: (values: ShippingZoneFormValues) => void;
  isLoading?: boolean;
}

export function ShippingZoneForm({ initialData, onSubmit, isLoading }: ShippingZoneFormProps) {
    
    const form = useForm<ShippingZoneFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
        ...initialData,
        // Aseguramos que los costos sean strings y los días un número
        base_cost: initialData.base_cost.toString(),
        cost_per_kg: initialData.cost_per_kg.toString(),
        estimated_days: initialData.estimated_days,
        } : {
        name: "",
        province: "",
        city: "",
        postal_codes: "",
        base_cost: "0.00",
        cost_per_kg: "0.00",
        estimated_days: 1,
        is_active: true,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre de la Zona</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. CABA Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Buenos Aires" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. La Plata" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="postal_codes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Códigos Postales</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. 1000-1900, 2000" {...field} />
                        </FormControl>
                        <FormDescription>
                            Separar múltiples códigos con comas.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="base_cost"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Costo Base ($ARS)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="Ej. 150.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cost_per_kg"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Costo por KG</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="Ej. 10.50" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="estimated_days"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Días Estimados</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ej. 3" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Zona Activa</FormLabel>
                            <FormDescription>
                                Activa o desactiva esta zona de envío.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Guardando..." : (initialData ? "Guardar Cambios" : "Crear Zona de Envío")}
                </Button>
            </form>
        </Form>
    );
}