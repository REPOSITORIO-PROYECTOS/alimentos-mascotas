"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
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
                // If paginated, try to read results
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

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>
            <Card>
                <CardContent>
                    {loading && <p>Cargando pedidos...</p>}
                    {error && (
                        <div className="text-red-600">Error: {error}</div>
                    )}
                    {!loading && orders && orders.length === 0 && (
                        <div>
                            <p>No hay pedidos registrados.</p>
                            <Button className="mt-4" onClick={() => router.push('/')}>Ir a la tienda</Button>
                        </div>
                    )}
                    {!loading && orders && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((o) => (
                                <div key={o.id} className="p-4 border rounded-md">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="font-medium">Pedido #{o.id}</div>
                                            <div className="text-sm text-muted-foreground">{o.created_at || "-"}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">${o.total_price || "0.00"}</div>
                                            <div className="text-sm">{o.status || "-"}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
