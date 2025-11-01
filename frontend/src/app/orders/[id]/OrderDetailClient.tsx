"use client";

import { useEffect, useState } from "react";
import TokensHelper from "@/lib/auth-tokens";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OrderDetail = {
    id: number;
    created_at?: string;
    total_price?: string;
    status?: string;
    order_items?: Array<{ product_name: string; quantity: number; price: string }>;
};

export default function OrderDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiBase =
            (process.env.NEXT_PUBLIC_API_BASE as string) ||
            "https://barker.sistemataup.online/api";
        // Use central token helper
    const token = typeof window !== "undefined" ? TokensHelper.loadTokens().access : null;
        if (!token) {
            router.push(`/login?redirect=/orders/${id}`);
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            try {
                // Endpoint real: /orders/orders/{id}/
                const res = await fetch(`${apiBase.replace(/\/$/, "")}/orders/orders/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`Status ${res.status}: ${txt}`);
                }
                const data = await res.json();
                setOrder(data as OrderDetail);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, router]);

    return (
        <div className="container mx-auto py-8 px-4 mt-20">
            <h1 className="text-2xl font-bold mb-4">Detalle del Pedido</h1>
            <Card>
                <CardContent>
                    {loading && <p>Cargando...</p>}
                    {error && <div className="text-red-600">{error}</div>}
                    {order && (
                        <div className="w-full">
                            <div className="my-4 w-full sm:w-1/2">
                                <div className="font-medium">Pedido #{order.id}</div>
                                <div className="text-sm text-muted-foreground">{order.created_at}</div>
                                <div className="mt-2">Estado: {order.status}</div>
                                <div className="mt-2 font-semibold">Total: ${order.total_price}</div>
                            </div>
                            <div className="space-y-2">
                                {(order.order_items || []).map((it, idx) => (
                                    <div key={idx} className="flex justify-between border-b py-2">
                                        <div>{it.product_name}</div>
                                        <div>{it.quantity} x ${it.price}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button onClick={() => router.push('/orders')} className="cursor-pointer">Volver a Mis Pedidos</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
