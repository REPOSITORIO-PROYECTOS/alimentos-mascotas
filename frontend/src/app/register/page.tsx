"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/context/store";

// Esquema de validación con Zod
const registerSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    dni: z
        .string()
        .regex(
            /^\d{7,8}$/,
            "El DNI debe contener solo números y tener entre 7 y 8 dígitos"
        ),
    celular: z
        .string()
        .regex(
            /^\d{10,11}$/,
            "El número de celular debe contener solo números y tener entre 10 y 11 dígitos"
        ),
    email: z.string().email("El formato del email no es válido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)/,
            "La contraseña debe tener al menos una letra y un número"
        ),
});

// Tipo para el formulario
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [dni, setDni] = useState("");
    const [celular, setCelular] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validación de contraseñas
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            // Validar los datos usando Zod
            const formData: RegisterFormData = {
                nombre,
                apellido,
                dni,
                celular,
                email,
                password,
            };

            // Validar los datos con el esquema
            const validationResult = registerSchema.safeParse(formData);

            if (!validationResult.success) {
                // Extraer el primer mensaje de error
                const errors = validationResult.error.errors;
                if (errors.length > 0) {
                    setError(errors[0].message);
                } else {
                    setError("Error de validación en el formulario");
                }
                setLoading(false);
                return;
            }


            // Asegurar formato internacional para celular (si no empieza con '+', agregarlo)
            let celularFormatted = celular;
            if (celular && !celular.startsWith("+")) {
                celularFormatted = "+54" + celular.replace(/^0+/, "");
            }

            const response = await fetch(
                "https://barker.sistemataup.online/api/auth/registrar/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: email, // puedes cambiar esto si quieres pedir username aparte
                        email,
                        password,
                        first_name: nombre,
                        last_name: apellido,
                        dni,
                        celular: celularFormatted,
                    }),
                }
            );

            if (response.ok) {
                toast.success("Usuario creado correctamente! Iniciando sesión...");
                try {
                    const roleOrFalse = await login(email, password);
                    if (roleOrFalse === false) {
                        router.push("/login?registered=true");
                    } else {
                        router.push("/");
                    }
                    return;
                } catch (e) {
                    router.push("/login?registered=true");
                    return;
                }
            } else {
                let errorMsg = "Error al registrar usuario. Por favor, intenta de nuevo.";
                let errorDetail = "";
                let data: any = {};
                try {
                    data = await response.json();
                } catch {}

                // Si el backend manda un objeto con campos
                if (data) {
                    // DRF suele mandar { campo: ["error"] }
                    if (typeof data === "object" && !Array.isArray(data)) {
                        const fieldErrors = Object.entries(data)
                            .map(([field, value]) => {
                                if (Array.isArray(value)) {
                                    return `${field}: ${value.join(", ")}`;
                                } else if (typeof value === "string") {
                                    return `${field}: ${value}`;
                                }
                                return null;
                            })
                            .filter(Boolean)
                            .join("\n");
                        if (fieldErrors) {
                            errorDetail = fieldErrors;
                        }
                    }
                    // Si hay un mensaje general
                    if (data.message || data.detail || data.error) {
                        errorMsg = data.message || data.detail || data.error;
                    }
                }

                setError(errorDetail ? `${errorMsg}\n${errorDetail}` : errorMsg);
                toast.error(errorDetail ? `${errorMsg}\n${errorDetail}` : errorMsg);
            }

        } catch (err) {
            setError(
                "Ocurrió un error al registrar. Por favor, intenta de nuevo."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            
            <Card className="w-full max-w-lg mt-16 md:mt-24">

                <CardHeader>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Completa tus datos para registrarte
                    </CardDescription>
                </CardHeader>
                
                {/* Form para Registro */}
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    placeholder="Juan"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido">Apellido</Label>
                                <Input
                                    id="apellido"
                                    type="text"
                                    placeholder="Pérez"
                                    value={apellido}
                                    onChange={(e) =>
                                        setApellido(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dni">DNI</Label>
                                <Input
                                    id="dni"
                                    type="text"
                                    placeholder="12345678"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="celular">Celular</Label>
                                <Input
                                    id="celular"
                                    type="tel"
                                    placeholder="1123456789"
                                    value={celular}
                                    onChange={(e) => setCelular(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Mínimo 8 caracteres, al menos una letra y un
                                número
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar Contraseña
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Registrando..." : "Registrarse"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            <div className="flex justify-between items-center">
                                <Link
                                    href="/login"
                                    className="hover:underline underline-offset-4 hover:text-primary"
                                >
                                    ¿Ya tienes cuenta? Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            </Card>

        </div>
    );
}
