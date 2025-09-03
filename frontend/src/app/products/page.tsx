"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Check, ShoppingBag, Star, Search, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import NumberFlow from "@number-flow/react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/context/store";

import { toast as sonnerToast } from "sonner";

// Nuevo tipo de Product basado en el JSON de Django
type Product = {
    id: number;
    name: string;
    category: string;
    description: string;
    price: string; // Puede que necesitemos convertirlo a number
    stock: string; // Puede que necesitemos convertirlo a number
    image: string;
    is_sellable: boolean;
    components: Array<{
        component: number;
        component_name: string;
        quantity: string;
        merma_percentage: string;
    }>;
};

// Hemos eliminado PaginationInfo ya que el nuevo API no la proporciona directamente.
// Si Django implementa paginación, la reintroduciremos.

export default function ProductsPage() {
    const [initialAnimation, setInitialAnimation] = useState(false);
    const { user } = useAuthStore();
    const [count, setCount] = useState(0);
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
    const { addItem } = useCartStore();
    const [isClient, setIsClient] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    // Eliminamos el estado de paginación ya que el nuevo endpoint no lo usa
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    useEffect(() => {
        setIsClient(true);
        setInitialAnimation(true);

        const initialTimer = setTimeout(() => {
            setInitialAnimation(false);
        }, 2000);

        return () => clearTimeout(initialTimer);
    }, []);

    useEffect(() => {
        if (!initialAnimation && isClient) {
            const interval = setInterval(() => {
                setCount((prevCount) => (prevCount + 1) % 5);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [initialAnimation, isClient]);

    // Al cargar el componente, obtenemos los productos
    useEffect(() => {
        // En este caso, el endpoint de Django no parece manejar paginación ni búsqueda por palabra clave directamente en la URL
        // Si tu API de Django lo hace, necesitarás ajustar la URL del fetchProducts
        fetchProducts();
    }, []); // Array de dependencias vacío para que se ejecute solo una vez al montar

    // La función handleSearch ya no tiene un impacto directo en el fetchProducts
    // a menos que tu endpoint de Django soporte búsqueda por keyword en el GET de productos.
    const handleSearch = (value: string) => {
        setKeyword(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            // Si el backend de Django soportara búsqueda por keyword, aquí se llamaría a fetchProducts con el valor.
            // Por ahora, se mantiene el input de búsqueda, pero no tiene efecto en el fetch.
            console.log("Realizando búsqueda con:", value);
        }, 500);

        setSearchTimeout(timeout);
    };

    // Función para obtener productos del API de Django
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Nuevo endpoint de Django
            const response = await fetch(
                /* `https://barkerpet.com.ar/api/store/products` */
                `http://82.25.69.192:8080/api/store/products`,
                {
                    method: "GET",
                    // Puedes añadir headers si tu API de Django requiere autenticación
                    // headers: {
                    //     "Content-Type": "application/json",
                    //     Authorization: `Bearer ${user?.token}`,
                    // },
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener productos");
            }

            const data: Product[] = await response.json();      // Esperamos un array de productos
            console.log("Respuesta del API de Django:", data);

            setProducts(data || []);
            // Ya no necesitamos actualizar el estado de paginación aquí
            
        } catch (error) {
            console.error("Error al cargar productos:", error);
        } finally {
            setLoading(false);
        }
    };

    // La función handlePageChange y la lógica de paginación se eliminan
    // ya que el nuevo API de Django no la proporciona directamente.

    const handleAddToCart = (product: Product) => {
        // Asegúrate de que el objeto `product` que se añade al carrito
        // tenga las propiedades esperadas por `useCartStore`.
        // Si `useCartStore` espera el formato antiguo, necesitarás mapear el producto de Django
        // a ese formato antes de añadirlo. Por simplicidad, asumimos que `addItem`
        // puede manejar el objeto `Product` de Django.
        addItem({
            id: product.id.toString(), // Convertir a string si es necesario para el carrito
            productName: product.name,
            productDescription: product.description,
            imageUrl: product.image,
            sellingPrice: parseFloat(product.price), // Convertir a number
            // Otras propiedades que necesite el carrito
            discountPercent: 0, // No está en el JSON actual, puedes añadir un valor por defecto o lógica
            stock: parseFloat(product.stock) // Convertir a number
        } as any); // Usar `any` temporalmente si no quieres crear un tipo intermedio para el carrito

        setAddedToCart((prev) => ({ ...prev, [product.id]: true }));

        setTimeout(() => {
            setAddedToCart((prev) => ({ ...prev, [product.id]: false }));
        }, 2000);

        sonnerToast.success("Producto añadido al carrito");
    };

    const stats = [
        {
            base: 450,
            emoji2: "🐕",
            text: "Perritos felices por comer suplementos Baker Pet",
        },
        {
            base: 150,
            emoji2: "🐈",
            text: "Gatos menos estresados por comer alimentos saludables",
        },
        {
            base: 600,
            emoji1: "😺",
            emoji2: "🐶",
            text: "Animales felices por no comer alimentos con aditivos tóxicos",
        },
    ];

    return (
        <section className="w-[calc(100%-theme(space.4))] overflow-hidden">
            <div className="container relative z-10 mx-auto px-4 py-20 overflow-hidden">
                {/* Banner de estadísticas */}
                <div className="bg-amber-400 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center"
                            >
                                <h2 className="text-3xl font-bold mb-2">
                                    {stat.emoji1}
                                    {isClient ? (
                                        <NumberFlow
                                            value={
                                                initialAnimation
                                                    ? 0
                                                    : stat.base + count
                                            }
                                            transformTiming={{
                                                duration: initialAnimation
                                                    ? 1000
                                                    : 750,
                                                easing: "ease-in-out",
                                            }}
                                            spinTiming={{
                                                duration: initialAnimation
                                                    ? 1000
                                                    : 750,
                                                easing: "ease-in-out",
                                            }}
                                            opacityTiming={{
                                                duration: 350,
                                                easing: "ease-out",
                                            }}
                                        />
                                    ) : (
                                        <span>{stat.base}</span>
                                    )}
                                    {stat.emoji2}
                                </h2>
                                <p className="text-sm text-center">
                                    {stat.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buscador - lo mantengo visible pero su funcionalidad es limitada sin backend */}
                 <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            className="pl-10"
                            placeholder="Buscar productos..."
                            value={keyword}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categorías de navegación - se mantienen, pero sin funcionalidad de filtro actual */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {["Deshidratados", "Refrigerados", "Premios", "Snacks"].map(
                        (category) => (
                            <Button
                                key={category}
                                variant="outline"
                                className="rounded-full border-amber-400 text-black hover:bg-amber-100"
                            >
                                {category}
                            </Button>
                        )
                    )}
                </div>

                {/* Estado de carga */}
                {loading && (
                    <div className="text-center py-6">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent"></div>
                        <p className="mt-2">Cargando productos...</p>
                    </div>
                )}

                {/* Mensaje si no hay productos */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-lg">No se encontraron productos.</p>
                        {keyword && (
                            <p className="text-gray-500 mt-2">
                                Intenta con otra búsqueda o mira nuestras
                                categorías.
                            </p>
                        )}
                    </div>
                )}

                {/* Productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="flex flex-col">
                            <Link
                                href={`/products/${product.id}`}
                                className="group"
                            >
                                <div className="bg-amber-400 p-4 rounded-lg mb-2 group-hover:opacity-80 transition-opacity">
                                    <Image
                                        src={
                                            product.image ||
                                            "/placeholder.svg?height=300&width=300"
                                        }
                                        alt={product.name} // Usar product.name
                                        width={300}
                                        height={300}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium group-hover:underline">
                                        {product.name} {/* Usar product.name */}
                                    </h3>
                                </div>
                            </Link>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold">
                                    ${parseFloat(product.price).toFixed(2)}{" "}
                                    {/* Usar product.price y convertir a number */}
                                </span>
                                {/* El JSON actual no tiene discountPercent, si lo añade el backend, puedes reintroducir esta lógica */}
                                {/* <span className="font-bold">
                                    -{product.discountPercent || 0}%
                                </span>
                                {product.discountPercent && (
                                    <span className="text-sm line-through text-gray-500">
                                        ${product.sellingPrice.toFixed(2)}
                                    </span>
                                )} */}
                            </div>

                            <div className="mt-auto">
                                <Button
                                    asChild
                                    className={`w-full ${
                                        addedToCart[product.id]
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-amber-400 hover:bg-amber-500"
                                    } text-black`}
                                    onClick={() => handleAddToCart(product)}
                                >
                                    {addedToCart[product.id] ? (
                                        <span>
                                            <Check className="mr-2 h-4 w-4" />
                                            Agregado al carrito
                                        </span>
                                    ) : (
                                        <span className="cursor-pointer">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            Comprar
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}{" "}
                </div>

                {/* La sección de paginación se ha eliminado porque el nuevo endpoint de Django no proporciona los datos necesarios para la paginación. */}
                {/* Si tu backend de Django va a manejar la paginación, necesitarás ajustar el tipo Product y la lógica de fetchProducts */}

            </div>
            {/* Decorative paw prints */}
            {[...Array(16)].map((_, i) => {
                const positions = [
                    { top: "10%", left: "5%", rotate: "45deg" },
                    { top: "15%", left: "25%", rotate: "90deg" },
                    { top: "25%", left: "15%", rotate: "120deg" },
                    { top: "30%", left: "60%", rotate: "180deg" },
                    { top: "40%", left: "80%", rotate: "30deg" },
                    { top: "45%", left: "30%", rotate: "60deg" },
                    { top: "55%", left: "70%", rotate: "300deg" },
                    { top: "60%", left: "10%", rotate: "270deg" },
                    { top: "70%", left: "50%", rotate: "220deg" },
                    { top: "75%", left: "85%", rotate: "10deg" },
                    { top: "85%", left: "40%", rotate: "150deg" },
                    { top: "90%", left: "20%", rotate: "250deg" },
                    { top: "95%", left: "65%", rotate: "330deg" },
                    { top: "100%", left: "75%", rotate: "200deg" },
                    { top: "120%", left: "35%", rotate: "80deg" },
                    { top: "150%", left: "55%", rotate: "160deg" },
                ];

                const position = positions[i] || {
                    top: "50%",
                    left: "50%",
                    rotate: "0deg",
                };

                return (
                    <div
                        key={i}
                        className="absolute z-0 w-16 h-16 opacity-20"
                        style={{
                            top: position.top,
                            left: position.left,
                            transform: `rotate(${position.rotate})`,
                        }}
                    >
                        <img src="/favicon.svg" alt="logo" />
                    </div>
                );
            })}
        </section>
    );
}