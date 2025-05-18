"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from "@/context/store";

// Form schema using Zod
const formSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z
        .string()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    email: z
        .string()
        .email({ message: "Ingresa un correo electrónico válido" }),
    phone: z
        .string()
        .min(10, { message: "Ingresa un número de teléfono válido" }),
    address: z
        .string()
        .min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
    city: z
        .string()
        .min(2, { message: "La ciudad debe tener al menos 2 caracteres" }),
    state: z
        .string()
        .min(2, { message: "El estado debe tener al menos 2 caracteres" }),
    zipCode: z.string().min(5, {
        message: "El código postal debe tener al menos 5 caracteres",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        try {
            // Simulate API call to process order
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const response = await fetch(
                `https://barker.sistemataup.online/api/mercadopago/pago`,
                {
                    body: JSON.stringify({
                        items: items.map((item) => ({
                            id: item.id,
                            title: item.productName,
                            description: item.productCode,
                            pictureUrl: item.imageUrl || "",
                            categoryId: item.productCode,
                            quantity: item.quantity,
                            currencyId: "ARS",
                            unitPrice:
                                item.sellingPrice -
                                (item.discountPercent
                                    ? (item.sellingPrice *
                                          item.discountPercent) /
                                      100
                                    : 0),
                        })),
                    }),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );

            // Manejo seguro de la respuesta
            const responseData = await response.text();

            // Check if the response is a direct URL
            if (responseData.trim().startsWith("http")) {
                console.log("Redirecting to payment URL:", responseData);
                window.location.href = responseData.trim();
                return;
            }

            // If not a URL, try to parse as JSON
            let jsonData;
            try {
                jsonData = JSON.parse(responseData);
                console.log("Response from Mercado Pago API:", jsonData);

                // Si tenemos una URL de inicioPago, redirigir al usuario
                if (jsonData && jsonData.inicioPago) {
                    router.push(jsonData.inicioPago);
                    return;
                }
            } catch (error) {
                console.error("Error parsing JSON response:", responseData);
            }

            console.log("Order submitted:", {
                customerInfo: data,
                items: items,
                totalAmount: totalPrice,
            });
        } catch (error) {
            console.error("Error processing order:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertTitle className="text-green-800">
                        ¡Pedido realizado con éxito!
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                        Gracias por tu compra. Recibirás un correo electrónico
                        con los detalles de tu pedido.
                    </AlertDescription>
                </Alert>
                <div className="mt-6 text-center">
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-amber-400 hover:bg-amber-500 text-black"
                    >
                        Volver a la tienda
                    </Button>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Alert>
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>Tu carrito está vacío</AlertTitle>
                    <AlertDescription>
                        No hay productos en tu carrito. Agrega algunos productos
                        antes de proceder al pago.
                    </AlertDescription>
                </Alert>
                <div className="mt-6 text-center">
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-amber-400 hover:bg-amber-500 text-black"
                    >
                        Volver a la tienda
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Información personal
                        </h2>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingresa tu nombre"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Apellido</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingresa tu apellido"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Correo electrónico
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="tu@email.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingresa tu número de teléfono"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dirección</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingresa tu dirección completa"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ciudad</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ciudad"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Estado/Provincia
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Estado"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zipCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Código Postal
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Código postal"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-4 md:hidden">
                                    <Button
                                        type="submit"
                                        className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Procesando..."
                                            : "Realizar pago"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Resumen del pedido
                            </h2>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="h-16 w-16 bg-amber-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={
                                                        item.imageUrl ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={item.productName}
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-amber-200">
                                                    <span className="text-xl">
                                                        🐾
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">
                                                {item.productName}
                                            </h4>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>
                                                    Cant: {item.quantity}
                                                </span>
                                                <span>
                                                    $
                                                    {(
                                                        (item.sellingPrice -
                                                            (item.discountPercent
                                                                ? (item.sellingPrice *
                                                                      item.discountPercent) /
                                                                  100
                                                                : 0)) *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Envío</span>
                                    <span>Gratis</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 hidden md:block">
                                <Button
                                    onClick={form.handleSubmit(onSubmit)}
                                    className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Procesando..."
                                        : "Realizar pago"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
