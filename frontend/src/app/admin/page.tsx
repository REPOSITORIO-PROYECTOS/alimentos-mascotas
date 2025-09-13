"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "next-view-transitions";

// Validación igual que en /register
const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  dni: z
    .string()
    .regex(/^\d{7,8}$/, "El DNI debe contener 7 u 8 dígitos numéricos"),
  celular: z
    .string()
    .regex(/^\d{10,11}$/, "El celular debe contener 10 u 11 dígitos"),
  email: z.string().email("El formato de email no es válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Debe contener al menos una letra y un número"
    ),
});
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AdminPage() {

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  // POST Crear Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const formData: RegisterFormData = {
      nombre,
      apellido,
      dni,
      celular,
      email,
      password,
    };

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Error en el formulario");
      return;
    }

    setLoading(true);

    // Desde panel de admin solo se pueden crear mas admin
    try {
      const res = await fetch(
        "https://barker.sistemataup.online/api/auth/registrar/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Enviar con los nombres de campo que espera el backend
            nombre,
            apellido,
            dni,
            celular,
            email,
            password,
          }),
        }
      );

      if (res.ok) {
        toast.success("Administrador creado con éxito");
        setNombre("");
        setApellido("");
        setDni("");
        setCelular("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setOpen(false);
      } else {
        const data = await res.json();
        setError(data.message || "Error al crear administrador");
        toast.error("Error al crear administrador");
        setOpen(false);
      }
    } catch {
      setError("Error de conexión con el servidor");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">

      <div className="my-12 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Gestiona los usuarios de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">128</p>
            <p className="text-xs text-muted-foreground">
              +14% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos</CardTitle>
            <CardDescription>
              Monitorea los ingresos mensuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$203.144,23</p>
            <p className="text-xs text-muted-foreground">
              +8.2% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
            <CardDescription>
              Visualiza la actividad reciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">16</p>
            <p className="text-xs text-muted-foreground">
              Acciones en las últimas 24h
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          {/* Modal para crear usuario admin */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">+ Crear Administrador</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Administrador</DialogTitle>
                <DialogDescription>
                  Completa los datos para registrar un nuevo administrador
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DNI</Label>
                    <Input
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Celular</Label>
                    <Input
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Contraseña</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Confirmar Contraseña</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                  {loading ? "Creando..." : "Crear Administrador"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button className="cursor-pointer">
            <Link href="/admin/inventario">
              + Añadir un Producto
            </Link>
          </Button>

          <Button className="cursor-pointer">
            <Link href="/soporte">
              Soporte del Sistema
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}