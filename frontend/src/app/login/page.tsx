"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/context/store";
import { toast } from "sonner";

// Esquema de validación con Zod
const formSchema = z.object({
    email: z.string().email({
        message: "El correo electrónico no es válido",
    }),
    password: z
        .string()
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
        .max(50, { message: "La contraseña no debe exceder 50 caracteres" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Usar el store de autenticación
    const { login, isLoading, error, clearError, user } = useAuthStore();

    // Configuración de react-hook-form con validación de Zod
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data: FormValues) => {
        try {
            // Limpiar errores previos
            clearError();

            // Llamar a la función login del store
            await login(data.email, data.password);

            toast.success("Inicio de sesión exitoso");
        } catch (err) {
            // El error ya se maneja en el store
            console.error("Error durante el inicio de sesión:", err);
        }
    };

    return (
        <section className="w-full relative">

            <div className="container mx-auto flex h-screen w-full flex-col items-center justify-center">

                <div className="mx-auto p-4 flex w-full flex-col justify-center space-y-4 mt-32 sm:w-[350px] lg:mt-28 xl:mt-20">

                    {/* Titulo Login */}
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Iniciar sesión
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ingresa tus credenciales para acceder
                        </p>
                    </div>
                    

                    {/* Login Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Acceso Clientes</CardTitle>
                            <CardDescription className="h-8">
                                Ingresa con tu email y contraseña
                            </CardDescription>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                                            {error}
                                        </div>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>
                                                        Contraseña
                                                    </FormLabel>
                                                    <Link
                                                        href="#"
                                                        className="text-xs text-blue-500 hover:underline"
                                                    >
                                                        ¿Olvidaste tu
                                                        contraseña?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                                            onClick={
                                                                togglePasswordVisibility
                                                            }
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        type="submit"
                                        className="w-full mt-6 cursor-pointer"
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Iniciando sesión..."
                                            : "Iniciar sesión"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>


                    {/* Registrar */}
                    <p className="px-8 text-center text-md text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Link
                            href="/register"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Registrate Gratis!
                        </Link>
                    </p>

                </div>

            </div>

        </section>
    );
}
