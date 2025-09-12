"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Check, ShoppingBag, Star, Search, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/context/store";

import { toast as sonnerToast } from "sonner";
import { useRouter } from "next/navigation";

// Base URLs configurables vía env vars
const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://barker.sistemataup.online/api";
const MEDIA_BASE =
    process.env.NEXT_PUBLIC_MEDIA_BASE || API_BASE.replace(/\/(?:api\/?$)/, "");

// Tipo Product actualizado para coincidir con el JSON de cada producto
type Product = {
    id: number;
    productName: string;
    productDescription: string;
    productDetails: string; // Añadido productDetails
    imageUrl: string | null;
    images: string[];
    sellingPrice: string;
    costPrice: string | null;
    discountPercent: string | null;
    categories: string[];
    reviewsIds: number[];
    reviews: any[];
    recipeId: number | null;
    productCode: string | null;
    sku: string | null;
    stock: string;
    createdAt: string;
    updatedAt: string;
    modifiedBy: string | null;
    createdBy: string | null;
};

// Tipo de la respuesta completa de la API con la nueva estructura
type ApiResponse = {
    content: Product[]; // Aquí está el array de productos
    totalElements: number;
    page: number;
    size: number;
};

export default function ProductsPage() {

    const [initialAnimation, setInitialAnimation] = useState(false);
    const { user } = useAuthStore();
    const [count, setCount] = useState(0);
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
    const { addItem } = useCartStore();
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    // Runtime overrides: permite cambiar la API base vía ?api=... o guardado en localStorage
    const [apiBaseState, setApiBaseState] = useState<string>(API_BASE);
    const [mediaBaseState, setMediaBaseState] = useState<string>(MEDIA_BASE);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    useEffect(() => {
        setIsClient(true);
        setInitialAnimation(true);

        // Aplicar override en runtime si viene en query string o en localStorage
        try {
            const params = new URLSearchParams(window.location.search);
            const apiParam = params.get("api");
            const mediaParam = params.get("media");
            const stored = localStorage.getItem("API_BASE_OVERRIDE");
            const storedMedia = localStorage.getItem("MEDIA_BASE_OVERRIDE");

            if (apiParam) {
                setApiBaseState(apiParam.replace(/\/$/, ""));
                localStorage.setItem("API_BASE_OVERRIDE", apiParam.replace(/\/$/, ""));
            } else if (stored) {
                setApiBaseState(stored);
            }

            if (mediaParam) {
                setMediaBaseState(mediaParam.replace(/\/$/, ""));
                localStorage.setItem("MEDIA_BASE_OVERRIDE", mediaParam.replace(/\/$/, ""));
            } else if (storedMedia) {
                setMediaBaseState(storedMedia);
            }
        } catch (e) {
            // no-op en SSR o si window no está disponible
        }

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
        fetchProducts();
    }, []);

    const handleSearch = (value: string) => {
        setKeyword(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            console.log("Realizando búsqueda con:", value);
            // Si el backend soportara búsqueda en el GET de productos, podrías llamar a fetchProducts aquí con el keyword
            // fetchProducts(value); // Ejemplo
        }, 500);

        setSearchTimeout(timeout);
    };

    // GET Productos
    const fetchProducts = async () => {

        setLoading(true);

        try {
            const url = `${API_BASE.replace(/\/$/, "")}/store/products/`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Error al obtener productos");
            }

            // Ahora la respuesta es el objeto ApiResponse
            const data: ApiResponse = await response.json();
            // Accede al array 'content' dentro del objeto de respuesta
            setProducts(data.content || []);

            console.log(url)
            console.log(data)

        } catch (error) {
            console.error("Error al cargar productos:", error);

        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product: Product) => {

        const rawPrice = product.sellingPrice ?? "0";
        const rawStock = product.stock ?? "0";
        const parsedPrice = parseFloat(rawPrice as unknown as string);
        const parsedStock = parseFloat(rawStock as unknown as string);
        const sellingPrice = isNaN(parsedPrice) ? 0 : parsedPrice;
        const stock = isNaN(parsedStock) ? 0 : parsedStock;

        addItem({
            id: product.id.toString(),
            productName: product.productName,
            productDescription: product.productDescription,
            imageUrl: product.imageUrl,
            sellingPrice,
            discountPercent: product.discountPercent ? parseFloat(product.discountPercent) : 0,
            stock,
        } as any);

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

                {/* Buscador */}
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

                {/* Categorías de navegación */}
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
                    {/* Mantengo la verificación Array.isArray(products) como buena práctica defensiva */}
                    {Array.isArray(products) && products.map((product) => (
                        <div key={product.id} className="flex flex-col">
                            <Link
                                href={`/products/${product.id}?productData=${encodeURIComponent(JSON.stringify(product))}`}
                                className="group"
                            >
                                <div className="bg-amber-400 p-4 rounded-lg mb-2 group-hover:opacity-80 transition-opacity">
                                    <Image
                                        src={product.imageUrl || "/placeholder.svg"}
                                        alt={product.productName}
                                        width={300}
                                        height={300}
                                        className="w-full h-auto object-contain"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium group-hover:underline">
                                        {product.productName}
                                    </h3>
                                </div>
                            </Link>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold">
                                    ${parseFloat(product.sellingPrice).toFixed(2)}{" "}
                                </span>
                                {product.discountPercent && parseFloat(product.discountPercent) > 0 && (
                                    <>
                                        <span className="font-bold">
                                            -{parseFloat(product.discountPercent)}%
                                        </span>
                                    </>
                                )}
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
                    ))}
                </div>

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