"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TokensHelper from "@/lib/auth-tokens";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Asumiendo que ya tienes este componente de shadcn
import { CalendarIcon, DollarSignIcon, PackageIcon, ShoppingCartIcon } from "lucide-react"; // Instala lucide-react si no lo tienes: npm install lucide-react

type Order = {
    id: number;
    created_at?: string;
    total_price?: string;
    status?: string;
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase =
            (process.env.NEXT_PUBLIC_API_BASE as string) ||
            "https://barker.sistemataup.online/api";
        const token = typeof window !== "undefined" ? TokensHelper.loadTokens().access : null;
        if (!token) {
            router.push(`/login?redirect=/orders`);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${apiBase.replace(/\/$/, "")}/orders/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`Status ${res.status}: ${txt}`);
                }
                const data = await res.json();
                console.log(data)
                
                const list = Array.isArray(data) ? data : data.results || [];
                setOrders(list as Order[]);
                
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    // Helpers para formateo (no estaban en tu código original pero son útiles para la presentación)
    const formatPrice = (price?: string) => {
        if (!price) return "$0.00";
        // Asumiendo moneda local, puedes cambiar 'es-AR' y 'ARS' si es necesario
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(parseFloat(price));
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Fecha desconocida";
        try {
            return new Date(dateString).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString; // En caso de error de parseo, muestra la cadena original
        }
    };

    const getStatusVariant = (status?: string) => {
        switch (status?.toLowerCase()) {
            case "completado":
                return "success"; // Necesitarías definir un 'success' variant en tu badge
            case "pendiente":
                return "warning"; // Y un 'warning' variant
            case "enviado":
                return "info"; // Y un 'info' variant
            case "cancelado":
                return "destructive";
            default:
                return "secondary";
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl mt-20">
            <div className="flex items-center gap-4 mb-8">
                <ShoppingCartIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Mis Pedidos</h1>
            </div>

            {loading && (
                <Card className="flex items-center justify-center p-8">
                    <p className="text-lg text-muted-foreground">Cargando pedidos...</p>
                </Card>
            )}

            {error && (
                <Card className="p-8 border-red-500 bg-red-50">
                    <p className="text-lg text-red-600">Error al cargar los pedidos: {error}</p>
                </Card>
            )}

            {!loading && orders && orders.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-xl mb-4">No hay pedidos registrados.</p>
                    <Button size="lg" onClick={() => router.push('/')}>
                        Ir a la tienda
                    </Button>
                </Card>
            )}

            {!loading && orders && orders.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {orders.map((o) => (
                        <Card key={o.id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <PackageIcon className="w-5 h-5 text-muted-foreground" />
                                    Pedido #{o.id}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarIcon className="w-4 h-4" />
                                    {formatDate(o.created_at)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <DollarSignIcon className="w-4 h-4" />
                                            Total:
                                        </span>
                                        <span className="font-semibold">{formatPrice(o.total_price)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            Estado:
                                        </span>
                                        <Badge variant="secondary" className="capitalize">
                                            {o.status || "Desconocido"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {/* Asumiendo que tendrás una página de detalles del pedido en /orders/[id] */}
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/orders/${o.id}`}>Ver Detalles</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}