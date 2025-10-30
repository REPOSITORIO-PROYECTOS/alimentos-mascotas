"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NumberFlow from "@number-flow/react";
import { useCartStore } from "@/store/cart-store";
import { toast as sonnerToast } from "sonner";

// Base URLs configurables vía env vars
const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://barker.sistemataup.online/api";
const MEDIA_BASE =
    process.env.NEXT_PUBLIC_MEDIA_BASE || API_BASE.replace(/\/(?:api\/?$)/, "");

// Nuevo tipo para las variantes
type Variant = {
    id: number;
    gramaje: string | null;
    unidades: string | null;
    stock: string;
    precio: string;
};

// Tipo Product actualizado para coincidir con el JSON de cada producto
type Product = {
    id: number;
    productName: string;
    productDescription: string;
    productDetails: string;
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
    has_variants: boolean; // Añadido
    variants: Variant[]; // Añadido
    category: string;
};

type ApiResponse = {
    content: Product[];
    totalElements: number;
    page: number;
    size: number;
};

export default function ProductsPage() {
    const [initialAnimation, setInitialAnimation] = useState(false);
    const [count, setCount] = useState(0);
    // addedToCart ahora usará el ID compuesto para cada entrada (producto o variante)
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
    const { addItem } = useCartStore();
    const [isClient, setIsClient] = useState(false);

    const [apiBaseState, setApiBaseState] = useState<string>(API_BASE);
    const [mediaBaseState, setMediaBaseState] = useState<string>(MEDIA_BASE);

    // Almacenamos todos los productos sin filtrar
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    useEffect(() => {
        setIsClient(true);
        setInitialAnimation(true);

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

    // Al cargar el componente, obtenemos todos los productos una sola vez
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (value: string) => {
        setKeyword(value); // Actualizamos el estado de la palabra clave inmediatamente

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    };

    // GET Productos - Esta función ahora solo obtiene todos los productos
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const url = `${apiBaseState}/store/products/`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Error al obtener productos");
            }

            const data: ApiResponse = await response.json();
            console.log(data)
            setAllProducts(data.content || []);

        } catch (error) {
            console.error("Error al cargar productos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtramos los productos basándonos en la palabra clave
    // Usamos useMemo para optimizar y que el filtrado solo se ejecute cuando allProducts o keyword cambien
    const filteredProducts = useMemo(() => {
        if (!keyword) {
            return allProducts; // Si no hay palabra clave, mostramos todos los productos
        }
        const lowercasedKeyword = keyword.toLowerCase();
        return allProducts.filter((product) =>
            product.productName.toLowerCase().includes(lowercasedKeyword)
        );
    }, [allProducts, keyword]);

    // Función para añadir al carrito, ahora puede recibir un producto o una variante
    const handleAddToCart = (
        product: Product,
        variant?: Variant | null // variant es opcional
    ) => {
        // Generamos un ID único para el carrito: product.id-variant.id o solo product.id
        const cartItemId = variant ? `${product.id}-${variant.id}` : product.id.toString();

        // Objeto con la información para el carrito
        const itemDataForCart = variant ? {
            id: cartItemId, // ID compuesto para variantes
            productName: `${product.productName} (${variant.unidades ? `${variant.unidades} unidades` : ''} ${variant.gramaje ? `${variant.gramaje}g` : ''})`.trim(),
            productDescription: product.productDescription,
            imageUrl: product.imageUrl,
            sellingPrice: parseFloat(variant.precio),
            discountPercent: product.discountPercent ? parseFloat(product.discountPercent) : 0,
            stock: parseFloat(variant.stock),
            productId: product.id, // Guardamos el ID del producto principal para referencia
            variantId: variant.id, // Guardamos el ID de la variante para referencia
        } : {
            id: cartItemId, // ID del producto principal
            productName: product.productName,
            productDescription: product.productDescription,
            imageUrl: product.imageUrl,
            sellingPrice: parseFloat(product.sellingPrice),
            discountPercent: product.discountPercent ? parseFloat(product.discountPercent) : 0,
            stock: parseFloat(product.stock),
            productId: product.id, // Guardamos el ID del producto principal
            variantId: undefined, // No hay variante
        };

        addItem(itemDataForCart as any); // Le pasamos el objeto construido

        // Usamos el ID de item del carrito (compuesto o simple) para el estado de `addedToCart`
        setAddedToCart((prev) => ({ ...prev, [cartItemId]: true }));

        setTimeout(() => {
            setAddedToCart((prev) => ({ ...prev, [cartItemId]: false }));
        }, 2000);

        sonnerToast.success("Producto añadido al carrito");
    };

    const stats = [
        {
            base: 453,
            emoji2: "🐕",
            text: "Perritos felices por comer suplementos Baker Pet",
        },
        {
            base: 173,
            emoji2: "🐈",
            text: "Gatos menos estresados por comer alimentos saludables",
        },
        {
            base: 821,
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
                <div className="mb-6 bg-white">
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

                {/* Estado de carga */}
                {loading && (
                    <div className="text-center py-6">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent"></div>
                        <p className="mt-2">Cargando productos...</p>
                    </div>
                )}

                {/* Mensaje si no hay productos */}
                {!loading && filteredProducts.length === 0 && (
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
                    {Array.isArray(filteredProducts) &&
                        filteredProducts.map((product) => {
                            // Si el producto tiene variantes, renderiza una tarjeta para cada variante
                            if (product.has_variants && product.variants && product.variants.length > 0) {
                                return product.variants.map((variant) => (
                                    <div key={`${product.id}-${variant.id}`} className="flex flex-col">
                                        <Link
                                            href={`/products/${product.id}`} // Enlaza al ID del producto principal
                                            className="group"
                                        >
                                            <div className="bg-amber-400 p-4 rounded-lg mb-2 group-hover:opacity-80 transition-opacity">
                                                <Image
                                                    src={
                                                        product.imageUrl ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={`${product.productName} - ${variant.unidades || ''} ${variant.gramaje ? `${variant.gramaje}g` : ''}`}
                                                    width={300}
                                                    height={300}
                                                    className="w-full h-auto object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium group-hover:underline">
                                                    {product.productName}{" "}
                                                    {variant.unidades && `(${variant.unidades} unidades)`}{" "}
                                                    {variant.gramaje && `(${variant.gramaje}g)`}
                                                </h3>
                                            </div>
                                        </Link>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold">
                                                ${parseFloat(variant.precio).toFixed(2)}{" "}
                                            </span>
                                            {product.discountPercent &&
                                                parseFloat(product.discountPercent) > 0 && (
                                                <>
                                                    <span className="font-bold">
                                                        -
                                                        {parseFloat(
                                                            product.discountPercent
                                                        )}
                                                        %
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <Button
                                                className={`w-full ${
                                                    addedToCart[`${product.id}-${variant.id}`] // Usa el ID compuesto aquí
                                                        ? "bg-green-500 hover:bg-green-600"
                                                        : "bg-amber-400 hover:bg-amber-500"
                                                } text-black`}
                                                onClick={() =>
                                                    handleAddToCart(product, variant)
                                                }
                                            >
                                                {addedToCart[`${product.id}-${variant.id}`] ? ( // Usa el ID compuesto aquí
                                                    <span className="text-white">
                                                        Agregado al carrito
                                                    </span>
                                                ) : (
                                                    <span className="text-black cursor-pointer flex flex-row items-center">
                                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                                        Comprar
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ));
                            } else {
                                // Si no tiene variantes, renderiza la tarjeta del producto principal
                                return (
                                    <div key={product.id} className="flex flex-col">
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="group"
                                        >
                                            <div className="bg-amber-400 p-4 rounded-lg mb-2 group-hover:opacity-80 transition-opacity">
                                                <Image
                                                    src={
                                                        product.imageUrl ||
                                                        "/placeholder.svg"
                                                    }
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
                                                $
                                                {parseFloat(product.sellingPrice).toFixed(
                                                    2
                                                )}{" "}
                                            </span>
                                            {product.discountPercent &&
                                                parseFloat(product.discountPercent) >
                                                    0 && (
                                                <>
                                                    <span className="font-bold">
                                                        -
                                                        {parseFloat(
                                                            product.discountPercent
                                                        )}
                                                        %
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <Button
                                                className={`w-full ${
                                                    addedToCart[product.id] // Usa el ID del producto principal aquí
                                                        ? "bg-green-500 hover:bg-green-600"
                                                        : "bg-amber-400 hover:bg-amber-500"
                                                } text-black`}
                                                onClick={() =>
                                                    handleAddToCart(product)
                                                }
                                            >
                                                {addedToCart[product.id] ? (
                                                    <span className="text-white">
                                                        Agregado al carrito
                                                    </span>
                                                ) : (
                                                    <span className="text-black cursor-pointer flex flex-row items-center">
                                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                                        Comprar
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }
                        })}
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