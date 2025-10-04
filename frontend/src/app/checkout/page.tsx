"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { error } from "console";
import { toast } from "sonner";

// Definición del esquema para las zonas de envío
interface ShippingZone {
    id: number;
    name: string;
    province: string;
    city: string;
    postal_codes: string; // Puede ser una lista separada por comas o un rango
    base_cost: string;
    cost_per_kg: string;
    estimated_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    postal_code: string; // Este campo parece duplicar la info pero lo mantendremos para consistencia
    shipping_price: number;
}

// Form schema using Zod
const formSchema = z
    .object({
        firstName: z
            .string()
            .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
        lastName: z.string().min(2, {
            message: "El apellido debe tener al menos 2 caracteres",
        }),
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
        shippingMethod: z
            .string()
            .min(1, { message: "Selecciona un método de envío" }),
        streetName: z.string().optional(),
        streetNumber: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.shippingMethod === "delivery") {
                return (
                    data.streetName &&
                    data.streetName.length >= 3 &&
                    data.streetNumber &&
                    data.streetNumber.length >= 1 &&
                    data.city &&
                    data.city.length >= 2 &&
                    data.state &&
                    data.state.length >= 2 &&
                    data.zipCode &&
                    data.zipCode.length >= 4
                );
            }
            return true;
        },
        {
            message:
                "Los campos de dirección son obligatorios para el envío a domicilio",
            path: ["streetName"],
        }
    );

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore();
    const { user, isLoading } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [paymentMessage, setPaymentMessage] = useState<string>("");
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingMethod, setShippingMethod] = useState<string>("pickup");
    const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]); // Nuevo estado para zonas de envío
    const [fetchingShippingZones, setFetchingShippingZones] = useState(true); // Estado de carga
    const router = useRouter();

    // Redirigir a login si el usuario no está autenticado y esperar a que se hidrate el front
    useEffect(() => {
        if (isLoading) return;

        if (user === null && typeof window !== "undefined") {
            router.push(`/login?redirect=/checkout`);
        }
    }, [user, router, isLoading]);

    // Función para obtener las zonas de envío
    const fetchShippingZones = useCallback(async () => {
        setFetchingShippingZones(true);
        const url = "https://barker.sistemataup.online/api/shipping-zones/";
        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`, // Asegúrate de que user.token exista
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setShippingZones(data.results);
        } catch (error) {
            console.error("Error fetching shipping zones:", error);
            // Podrías manejar el error mostrando un mensaje al usuario
        } finally {
            setFetchingShippingZones(false);
        }
    }, [user?.token]);

    // Cargar zonas de envío al montar el componente (y cuando el usuario esté disponible)
    useEffect(() => {
        if (user?.token) {
            fetchShippingZones();
        }
    }, [user?.token, fetchShippingZones]);


    // Inicializar el formulario
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: user?.name || "",
            lastName: "",
            email: user?.username || "",
            areaCode: "+54", // Asumiendo que el código de área del formulario es para el teléfono
            phoneNumber: "",
            identificationType: "DNI",
            identificationNumber: "",
            shippingMethod: "pickup",
            streetName: "",
            streetNumber: "",
            city: "",
            state: "",
            zipCode: "",
        },
    });

    // Actualizar valores del formulario si el usuario cambia después de la carga inicial
    useEffect(() => {
        if (user && !form.formState.isDirty) { // Solo actualizar si el formulario no ha sido tocado por el usuario
            form.reset({
                ...form.getValues(),
                firstName: user.name || "",
                email: user.username || "",
            });
        }
    }, [user, form]);


    // Función para calcular el costo de envío basado en el código postal y las zonas de envío
    const calculateShippingCost = useCallback((zipCode: string) => {
        const cp = parseInt(zipCode, 10);
        
        if (isNaN(cp)) {
            toast.error(`CP inválido: ${zipCode}`);
            return 0;
        }

        for (const zone of shippingZones) {
            const postalCodes = zone.postal_codes;

            if (postalCodes.includes("RANGO:")) {
                const rangeMatch = postalCodes.match(/RANGO:(\d+)-(\d+)/);
                if (rangeMatch) {
                    const min = parseInt(rangeMatch[1], 10);
                    const max = parseInt(rangeMatch[2], 10);
                    if (cp >= min && cp <= max) {
                        console.log(`Match en rango para ${zipCode}: ${zone.shipping_price}`);
                        return zone.shipping_price;
                    }
                }
            } else {
                const individualCodes = postalCodes.split(',').map(code => code.trim());
                if (individualCodes.includes(zipCode)) {
                    console.log(`Match individual para ${zipCode}: ${zone.shipping_price}`); 
                    return zone.shipping_price;
                }
            }
        }
        toast.error(`No se encontró zona de envío para CP: ${zipCode}`); 
        return 0; 

    }, [shippingZones]);

    // Verificar parámetros de la URL al cargar la página
    useEffect(() => {

        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const collectionStatus = searchParams.get("collection_status");
        const status = searchParams.get("status");
        const paymentId = searchParams.get("payment_id");

        if (collectionStatus || status) {
            const paymentResult = collectionStatus || status;
            setPaymentStatus(paymentResult);

            if (paymentResult === "approved") {
                setOrderSuccess(true);
                setPaymentMessage(
                    `¡Pago aprobado! Tu número de transacción es: ${paymentId}`
                );
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

            if (process.env.NODE_ENV === "production") {
                window.history.replaceState({}, document.title, "/checkout");
            }
        }
    }, [clearCart]);

    // Función para actualizar el costo de envío cuando cambia el código postal
    const handleZipCodeChange = (zipCode: string) => {
        // Actualiza el valor en el formulario
        form.setValue("zipCode", zipCode); // Asegúrate de que el valor se guarde en el formulario
        
        if (shippingMethod === "delivery" && zipCode.length >= 4) { // Verifica la longitud del zipCode
            const cost = calculateShippingCost(zipCode);
            setShippingCost(cost);
        } else if (shippingMethod === "delivery" && zipCode.length < 4) {
            setShippingCost(0); // Resetea el costo si el zipCode es demasiado corto
        }
    };

    // Función para manejar el cambio de método de envío
    const handleShippingMethodChange = (method: string) => {
        setShippingMethod(method);
        if (method === "pickup" || method === "agreement") {
            setShippingCost(0);
        } else if (method === "delivery") {
            const zipCode = form.getValues("zipCode");
            if (zipCode) {
                const cost = calculateShippingCost(zipCode);
                setShippingCost(cost);
                console.log("Costo de envío calculado:", cost);
            } else {
                setShippingCost(0); // Resetear si no hay zipCode cuando se selecciona delivery
                console.log("Costo de envío reseteado a 0.");
            }
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        console.log("Submitting order with data:", data);

        try {
            // Aquí iría tu lógica real para procesar el pedido y llamar a la API de Mercado Pago
            // Esto es un placeholder con un delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Ejemplo de cómo construir el body para la API (comentado de tu código original)
            // const response = await fetch(`/api/checkout`, {
            //     body: JSON.stringify({
            //         items: items.map((item) => ({
            //             id: item.id,
            //             title: item.productName,
            //             description: item.productCode,
            //             pictureUrl: item.imageUrl || "",
            //             categoryId: item.productCode,
            //             quantity: item.quantity,
            //             currencyId: "ARS",
            //             unitPrice:
            //                 item.sellingPrice -
            //                 (item.discountPercent
            //                     ? (item.sellingPrice * item.discountPercent) /
            //                       100
            //                     : 0),
            //         })),
            //         shippingCost: shippingCost,
            //         shippingMethod: data.shippingMethod,
            //         userInfo: {
            //             firstName: data.firstName,
            //             lastName: data.lastName,
            //             email: data.email,
            //             phone: {
            //                 areaCode: data.areaCode,
            //                 number: data.phoneNumber,
            //             },
            //             identification: {
            //                 type: data.identificationType,
            //                 number: data.identificationNumber,
            //             },
            //             address:
            //                 data.shippingMethod === "delivery"
            //                     ? {
            //                           streetName: data.streetName,
            //                           streetNumber: data.streetNumber,
            //                           zipCode: data.zipCode,
            //                           city: data.city,
            //                           state: data.state,
            //                       }
            //                     : null,
            //         },
            //     }),
            //     method: "POST",
            //     // headers: {
            //     //     "Content-Type": "application/json",
            //     //     Authorization: `Bearer ${user?.token}`,
            //     // },
            // });

            // const responseData = await response.text();
            // if (responseData.trim().startsWith("http")) {
            //     console.log("Redirecting to payment URL:", responseData);
            //     window.location.href = responseData.trim();
            //     return;
            // }
            // let jsonData;
            // try {
            //     jsonData = JSON.parse(responseData);
            //     console.log("Response from Mercado Pago API:", jsonData);
            //     if (jsonData && jsonData.inicioPago) {
            //         router.push(jsonData.inicioPago);
            //         return;
            //     }
            // } catch (error) {
            //     console.error("Error parsing JSON response:", responseData);
            // }
            // console.log("Order submitted:", {
            //     customerInfo: data,
            //     items: items,
            //     totalAmount: totalPrice + shippingCost,
            //     shippingCost: shippingCost,
            //     shippingMethod: data.shippingMethod,
            // });

            // Si llegamos aquí sin redirección, marcamos éxito (o error simulado)
            setOrderSuccess(true);
            setPaymentStatus("approved"); // Simula un pago aprobado
            setPaymentMessage("¡Tu pedido ha sido procesado con éxito! (Simulado)");
            clearCart();


        } catch (error) {
            console.error("Error processing order:", error);
            setPaymentStatus("rejected");
            setPaymentMessage("Hubo un error al procesar tu pedido. Inténtalo de nuevo más tarde.");
            setOrderSuccess(true); // Mostrar el mensaje de error en la pantalla de éxito
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
    
    // Muestra un estado de carga mientras se obtienen las zonas de envío
    if (fetchingShippingZones) {
        return (
            <div className="container max-w-4xl mx-auto py-20 px-4 text-center">
                <p>Cargando información de envío...</p>
                {/* Puedes añadir un spinner o un indicador de carga aquí */}
                <Image src="https://barker.sistemataup.online/static/images/Loading.gif" alt="Cargando" width={100} height={100} className="mx-auto mt-4"/>
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
                                    />{" "}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="shippingMethod"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Método de envío
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        handleShippingMethodChange(
                                                            value
                                                        );
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un método de envío" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="pickup">
                                                            Retirar por el local
                                                        </SelectItem>
                                                        <SelectItem value="agreement">
                                                            Acordar con el
                                                            vendedor
                                                        </SelectItem>
                                                        <SelectItem value="delivery">
                                                            Envío a domicilio
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {shippingMethod === "delivery" && (
                                    <>
                                        <div className="mt-4 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Información de envío
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Completa los datos para el envío
                                                a domicilio
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="streetName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Calle
                                                        </FormLabel>
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
                                                        <FormLabel>
                                                            Número
                                                        </FormLabel>
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
                                                        <FormLabel>
                                                            Ciudad
                                                        </FormLabel>
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
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        e
                                                                    ); 
                                                                    handleZipCodeChange( 
                                                                        e.target
                                                                            .value
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}

                                {shippingMethod === "pickup" && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h3 className="text-lg font-medium text-blue-900 mb-2">
                                            Retiro en el local
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Podrás retirar tu pedido en nuestro
                                            local ubicado en:
                                        </p>
                                        <p className="text-sm font-medium text-blue-800 mt-1">
                                            [Dirección del local aquí]
                                        </p>
                                        <p className="text-sm text-blue-700 mt-2">
                                            Horarios de atención: Lunes a
                                            Viernes de 9:00 a 18:00 hs
                                        </p>
                                    </div>
                                )}

                                {shippingMethod === "agreement" && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h3 className="text-lg font-medium text-yellow-900 mb-2">
                                            Acordar con el vendedor
                                        </h3>
                                        <p className="text-sm text-yellow-700">
                                            Nos pondremos en contacto contigo
                                            para coordinar la entrega de tu
                                            pedido. Podrás elegir el método que
                                            más te convenga.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 md:hidden">
                                    <Button
                                        type="submit"
                                        className="w-full bg-amber-400 hover:bg-amber-500 text-white cursor-pointer"
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
                                </div>{" "}
                                <div className="flex justify-between text-sm">
                                    <span>Envío</span>
                                    {shippingMethod === "pickup" ? (
                                        <span className="text-green-600 font-medium">
                                            Gratis (Retiro)
                                        </span>
                                    ) : shippingMethod === "agreement" ? (
                                        <span className="text-blue-600 font-medium">
                                            A coordinar
                                        </span>
                                    ) : shippingMethod === "delivery" ? (
                                        shippingCost > 0 ? (
                                            <span className="text-green-500">
                                                ${shippingCost.toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Ingresa código postal
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Selecciona método
                                        </span>
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
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
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