import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { forbidden } from "next/navigation";

export default async function AdminPage() {
    // If not authenticated, redirect to login
    // if (!session) {
    //     redirect("/login")
    // }

    // // If authenticated but not admin, show forbidden
    // if (session.role !== "admin") {
    //     forbidden()
    // }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <form action="/api/auth/logout" method="POST">
                    <Button type="submit" variant="outline">
                        Cerrar Sesión
                    </Button>
                </form>
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
                        <p className="text-2xl font-bold">€8,350</p>
                        <p className="text-xs text-muted-foreground">
                            +5.2% desde el mes pasado
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
                        <p className="text-2xl font-bold">432</p>
                        <p className="text-xs text-muted-foreground">
                            Acciones en las últimas 24h
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="mb-4 text-xl font-semibold">Acciones Rápidas</h2>
                <div className="flex flex-wrap gap-4">
                    <Button>Crear Usuario</Button>
                    <Button variant="outline">Generar Informe</Button>
                    <Button variant="outline">Configuración</Button>
                </div>
            </div>
        </div>
    );
}
