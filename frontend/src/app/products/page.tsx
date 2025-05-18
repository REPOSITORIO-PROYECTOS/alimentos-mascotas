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
import { productsBackUp } from "@/lib/products";

type Product = {
    id: string;
    productName: string;
    productDescription: string;
    productDetails: string | null;
    imageUrl: string | null;
    sellingPrice: number;
    discountPercent: number | null;
    reviewsIds: string[] | null;
    categories: string[] | null;
    costPrice: number;
    productCode: string;
    recipeId: string;
    stock: number;
    createdAt: string;
    updatedAt: string | null;
    modifiedBy: string | null;
    createdBy: string;
};

type PaginationInfo = {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
};

export default function ProductsPage() {
    const [initialAnimation, setInitialAnimation] = useState(true);
    const { user } = useAuthStore();
    const [count, setCount] = useState(0);
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
    const { addItem } = useCartStore();

    // Nuevos estados para búsqueda y paginación
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [pagination, setPagination] = useState<PaginationInfo>({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 10,
    });
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    useEffect(() => {
        // Animación inicial de 0 al número base
        const initialTimer = setTimeout(() => {
            setInitialAnimation(false);
        }, 2000); // Duración de la animación inicial

        return () => clearTimeout(initialTimer);
    }, []);

    useEffect(() => {
        if (!initialAnimation) {
            const interval = setInterval(() => {
                setCount((prevCount) => (prevCount + 1) % 5); // Ciclo de 0 a 4
            }, 5000); // Cambia cada 5 segundos

            return () => clearInterval(interval);
        }
    }, [initialAnimation]);

    // Efecto para cargar productos al iniciar y cuando cambie la página o la búsqueda
    useEffect(() => {
        fetchProducts(pagination.currentPage, keyword);
    }, [pagination.currentPage]);

    // Función para buscar productos
    const handleSearch = (value: string) => {
        setKeyword(value);

        // Cancelar cualquier búsqueda pendiente
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Establecer un timeout para evitar demasiadas solicitudes mientras el usuario escribe
        const timeout = setTimeout(() => {
            // Reset a la primera página al buscar
            setPagination((prev) => ({ ...prev, currentPage: 0 }));
            fetchProducts(0, value);
        }, 500);

        setSearchTimeout(timeout);
    };

    // Función para obtener productos del API
    const fetchProducts = async (page: number, searchKeyword: string) => {
        setLoading(true);
        // try {
        //     const response = await fetch(
        //         `https://barker.sistemataup.online/api/productos/pagina?page=${page}&size=${pagination.size}&keyword=${searchKeyword}`,
        //         {
        //             method: "GET",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Authorization: `Bearer ${user?.token}`,
        //             },
        //         }
        //     );

        //     if (!response.ok) {
        //         throw new Error("Error al obtener productos");
        //     }

        //     const data = await response.json();
        //     setProducts(data.content || []);
        //     setPagination({
        //         totalElements: data.totalElements || 0,
        //         totalPages: data.totalPages || 0,
        //         currentPage: data.number || 0,
        //         size: data.size || 10,
        //     });
        // } catch (error) {
        //     console.error("Error al cargar productos:", error);
        // } finally {
        //     setLoading(false);
        // }
    };

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        if (page >= 0 && page < pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: page }));
        }
    };

    const handleAddToCart = (product: Product) => {
        addItem(product);

        // Mostrar feedback visual
        setAddedToCart((prev) => ({ ...prev, [product.id]: true }));

        // Resetear el feedback después de 2 segundos
        setTimeout(() => {
            setAddedToCart((prev) => ({ ...prev, [product.id]: false }));
        }, 2000);
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
                                    <NumberFlow
                                        value={
                                            initialAnimation
                                                ? stat.base
                                                : stat.base + count
                                        }
                                        transformTiming={{
                                            duration: initialAnimation
                                                ? 2000
                                                : 750,
                                            easing: "ease-in-out",
                                        }}
                                        spinTiming={{
                                            duration: initialAnimation
                                                ? 2000
                                                : 750,
                                            easing: "ease-in-out",
                                        }}
                                        opacityTiming={{
                                            duration: 350,
                                            easing: "ease-out",
                                        }}
                                    />
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
                {/* <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        className="pl-10"
                        placeholder="Buscar productos..."
                        value={keyword}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div> */}

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
                {/* {!loading && products.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-lg">No se encontraron productos.</p>
                        {keyword && (
                            <p className="text-gray-500 mt-2">
                                Intenta con otra búsqueda o mira nuestras
                                categorías.
                            </p>
                        )}
                    </div>
                )} */}

                {/* Productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsBackUp.map((product) => (
                        <div key={product.id} className="flex flex-col">
                            <Link
                                href={`/products/${product.id}`}
                                className="group"
                            >
                                <div className="bg-amber-400 p-4 rounded-lg mb-2 group-hover:opacity-80 transition-opacity">
                                    <Image
                                        src={
                                            product.imageUrl ||
                                            "/placeholder.svg?height=300&width=300"
                                        }
                                        alt={product.productName}
                                        width={300}
                                        height={300}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium group-hover:underline">
                                        {product.productName}
                                    </h3>
                                    <div className="flex items-center">
                                        <span className="text-sm mr-1">
                                            4.5
                                        </span>
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    </div>
                                </div>
                            </Link>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold">
                                    ${product.sellingPrice.toFixed(2)}
                                </span>
                                {product.discountPercent && (
                                    <span className="text-sm line-through text-gray-500">
                                        $
                                        {(
                                            product.sellingPrice *
                                            (1 + product.discountPercent / 100)
                                        ).toFixed(2)}
                                    </span>
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
                                            Redirigiendo a Whatsapp...
                                        </span>
                                    ) : (
                                        <Link
                                            target="_blank"
                                            href={`https://wa.me/+5491134677025?text=Quiero%20comprar%20el%20producto%20${product.productName}`}
                                        >
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            Comprar
                                        </Link>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.currentPage - 1
                                            )
                                        }
                                        className={
                                            pagination.currentPage === 0
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>

                                {/* Generar números de página */}
                                {Array.from({
                                    length: pagination.totalPages,
                                }).map((_, index) => {
                                    // Solo mostrar algunas páginas para no sobrecargar la UI
                                    if (
                                        index === 0 ||
                                        index === pagination.totalPages - 1 ||
                                        (index >= pagination.currentPage - 1 &&
                                            index <= pagination.currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationLink
                                                    isActive={
                                                        index ===
                                                        pagination.currentPage
                                                    }
                                                    onClick={() =>
                                                        handlePageChange(index)
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    {index + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }

                                    // Agregar puntos suspensivos para las páginas omitidas
                                    if (
                                        (index === 1 &&
                                            pagination.currentPage > 2) ||
                                        (index === pagination.totalPages - 2 &&
                                            pagination.currentPage <
                                                pagination.totalPages - 3)
                                    ) {
                                        return (
                                            <PaginationItem key={index}>
                                                <span className="px-2">
                                                    ...
                                                </span>
                                            </PaginationItem>
                                        );
                                    }

                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.currentPage + 1
                                            )
                                        }
                                        className={
                                            pagination.currentPage ===
                                            pagination.totalPages - 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
            {/* Decorative paw prints */}
            {[...Array(16)].map((_, i) => (
                <div
                    key={i}
                    className="absolute z-0 w-16 h-16 opacity-20"
                    style={{
                        top: `${Math.random() * 200}%`,
                        left: `${Math.random() * 80}%`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                >
                    <img src="/favicon.svg" alt="logo" />
                </div>
            ))}
        </section>
    );
}
