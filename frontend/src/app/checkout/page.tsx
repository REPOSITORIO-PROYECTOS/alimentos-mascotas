"use client";

import { useState, useEffect } from "react";
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
import { calcularCostoEnvio } from "@/lib/shipping-costs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    areaCode: z
        .string()
        .min(2, { message: "El código de área es obligatorio" }),
    phoneNumber: z
        .string()
        .min(8, { message: "Ingresa un número de teléfono válido" }),
    identificationType: z
        .string()
        .min(2, { message: "El tipo de identificación es obligatorio" }),
    identificationNumber: z
        .string()
        .min(5, { message: "El número de identificación es obligatorio" }),
    streetName: z
        .string()
        .min(3, { message: "El nombre de la calle es obligatorio" }),
    streetNumber: z
        .string()
        .min(1, { message: "El número de la calle es obligatorio" }),
    city: z
        .string()
        .min(2, { message: "La ciudad debe tener al menos 2 caracteres" }),
    state: z
        .string()
        .min(2, { message: "El estado debe tener al menos 2 caracteres" }),
    zipCode: z.string().min(4, {
        message: "El código postal debe tener al menos 4 caracteres",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [paymentMessage, setPaymentMessage] = useState<string>("");
    const [shippingCost, setShippingCost] = useState(0);
    const router = useRouter();

    // Inicializar el formulario
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            areaCode: "+54", // Código de área para Argentina por defecto
            phoneNumber: "",
            identificationType: "DNI", // DNI por defecto
            identificationNumber: "",
            streetName: "",
            streetNumber: "",
            city: "",
            state: "",
            zipCode: "",
        },
    });

    // Verificar parámetros de la URL al cargar la página
    useEffect(() => {
        // Obtener la URL actual
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        // Verificar si hay parámetros de Mercado Pago
        const collectionStatus = searchParams.get("collection_status");
        const status = searchParams.get("status");
        const paymentId = searchParams.get("payment_id");

        if (collectionStatus || status) {
            // Determinar el estado del pago
            const paymentResult = collectionStatus || status;
            setPaymentStatus(paymentResult);

            // Configurar mensajes según el estado
            if (paymentResult === "approved") {
                setOrderSuccess(true);
                setPaymentMessage(
                    `¡Pago aprobado! Tu número de transacción es: ${paymentId}`
                );
                // Limpiar el carrito si el pago fue exitoso
                clearCart();
            } else if (paymentResult === "pending") {
                setOrderSuccess(true);
                setPaymentMessage("Tu pago está pendiente de aprobación");
            } else if (paymentResult === "rejected") {
                setPaymentMessage(
                    "El pago fue rechazado. Por favor intenta con otro método de pago."
                );
            } else if (paymentResult === "in_process") {
                setOrderSuccess(true);
                setPaymentMessage("El pago está siendo procesado");
            } else {
                setPaymentMessage(`Estado del pago: ${paymentResult}`);
            }

            // Limpiar la URL para evitar recargar el estado en futuras navegaciones
            // Solo en producción para evitar problemas con el desarrollo
            if (process.env.NODE_ENV === "production") {
                window.history.replaceState({}, document.title, "/checkout");
            }
        }
    }, [clearCart]);

    // Función para actualizar el costo de envío cuando cambia el código postal
    const handleZipCodeChange = (zipCode: string) => {
        const cost = calcularCostoEnvio(zipCode);
        setShippingCost(cost);
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        try {
            // Simulate API call to process order
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const response = await fetch(`/api/checkout`, {
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
                                ? (item.sellingPrice * item.discountPercent) /
                                  100
                                : 0),
                    })),
                    shippingCost: shippingCost,
                    userInfo: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phone: {
                            areaCode: data.areaCode,
                            number: data.phoneNumber,
                        },
                        identification: {
                            type: data.identificationType,
                            number: data.identificationNumber,
                        },
                        address: {
                            streetName: data.streetName,
                            streetNumber: data.streetNumber,
                            zipCode: data.zipCode,
                            city: data.city,
                            state: data.state,
                        },
                    },
                }),
                method: "POST",
                // headers: {
                //     "Content-Type": "application/json",
                //     Authorization: `Bearer ${user?.token}`,
                // },
            });

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
                totalAmount: totalPrice + shippingCost,
                shippingCost: shippingCost,
            });
        } catch (error) {
            console.error("Error processing order:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderizar la pantalla de respuesta según el estado del pago
    if (orderSuccess) {
        return (
            <div className="container max-w-4xl mx-auto py-20 px-4">
                <Alert
                    className={`${
                        paymentStatus === "approved"
                            ? "bg-green-50 border-green-200"
                            : paymentStatus === "rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                    }`}
                >
                    {paymentStatus === "approved" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : paymentStatus === "rejected" ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <AlertTitle
                        className={`${
                            paymentStatus === "approved"
                                ? "text-green-800"
                                : paymentStatus === "rejected"
                                ? "text-red-800"
                                : "text-yellow-800"
                        }`}
                    >
                        {paymentStatus === "approved"
                            ? "¡Pedido realizado con éxito!"
                            : paymentStatus === "rejected"
                            ? "Pago rechazado"
                            : paymentStatus === "pending"
                            ? "Pago pendiente"
                            : paymentStatus === "in_process"
                            ? "Pago en proceso"
                            : "¡Gracias por tu compra!"}
                    </AlertTitle>
                    <AlertDescription
                        className={`${
                            paymentStatus === "approved"
                                ? "text-green-700"
                                : paymentStatus === "rejected"
                                ? "text-red-700"
                                : "text-yellow-700"
                        }`}
                    >
                        {paymentMessage ||
                            "Gracias por tu compra. Recibirás un correo electrónico con los detalles de tu pedido."}
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
            <div className="container max-w-4xl mx-auto py-20 px-4">
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
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="areaCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Código
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="+54"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Teléfono
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Número sin código"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="identificationType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Tipo de identificación
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="DNI">
                                                            DNI
                                                        </SelectItem>
                                                        <SelectItem value="CI">
                                                            Cédula
                                                        </SelectItem>
                                                        <SelectItem value="LC">
                                                            Libreta Cívica
                                                        </SelectItem>
                                                        <SelectItem value="Otro">
                                                            Otro
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="identificationNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Número de identificación
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingresa tu número de documento"
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
                                        name="streetName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Calle</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nombre de la calle"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="streetNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Número de calle"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            handleZipCodeChange(
                                                                e.target.value
                                                            );
                                                        }}
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
                                {" "}
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Envío</span>
                                    {shippingCost > 0 ? (
                                        <span>${shippingCost.toFixed(2)}</span>
                                    ) : (
                                        <span>Ingresa código postal</span>
                                    )}
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>
                                        $
                                        {(totalPrice + shippingCost).toFixed(2)}
                                    </span>
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
