// src/app/login/page.tsx (o tu ruta para el login)
"use client";

import { useState, useMemo, useEffect } from "react";
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
    const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();

    // Obtenemos el redirect al inicio, por si lo necesitamos luego
    const redirectParam = useMemo(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return params.get("redirect");
        }
        return null;
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Efecto para mostrar el error del store si existe
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError(); // Limpiar el error después de mostrarlo
        }
    }, [error, clearError]);

    // Redireccionar si el usuario ya está autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            if (redirectParam) {
                router.replace(redirectParam); // Usar replace para no dejar el login en el historial
            } else if (user.roles.includes("ROLE_ADMIN")) {
                router.replace("/admin");
            } else {
                router.replace("/");
            }
        }
    }, [isAuthenticated, user, redirectParam, router]);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data: FormValues) => {
        try {
            clearError();
            const userRole = await login(data.email, data.password);

            if (userRole === false) {
                
                return;
            }

            toast.success("Inicio de sesión exitoso");

        } catch (err) {
            console.error("Error durante el inicio de sesión:", err);
            toast.error("Error en el inicio de sesión");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
                    <CardDescription>Inicia sesión en tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="m@example.com"
                                                type="email"
                                                autoComplete="email"
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
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="••••••••"
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="current-password"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={togglePasswordVisibility}
                                                    disabled={isLoading}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                                    )}
                                                    <span className="sr-only">
                                                        {showPassword ? "Hide password" : "Show password"}
                                                    </span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? "Cargando..." : "Iniciar sesión"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between text-sm">
                    <Link href="/forgot-password" className="underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                    <Link href="/register" className="underline">
                        ¿No tienes una cuenta? Regístrate
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}