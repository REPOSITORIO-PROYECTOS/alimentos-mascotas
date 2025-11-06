"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/context/store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useParams } from "next/navigation";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://barker.sistemataup.online/api";

// Nuevo tipo para las variantes
type Variant = {
    id: number;
    gramaje: string | null;
    unidades: string | null;
    stock: string;
    precio: string;
};

// Tipo Product actualizado para reflejar la estructura completa del JSON
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
    has_variants: boolean;
    variants: Variant[];
    // 'category' ya no es necesario si siempre usas 'categories'
};

type Review = {
    id: number;
    product: number;
    user: string;
    rating: number;
    comment: string;
    created_at: string;
};

export default function ProductDetail() {

    const params = useParams();
    const productId = params.id as string;

    const { user } = useAuthStore();
    const token = user?.token;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(4);
    const [comment, setComment] = useState("");
    const [productReviews, setProductReviews] = useState<Review[]>([]);
    
    // Estado para la variante seleccionada, inicializa a null si no hay ninguna
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState("1");
    const { addItem } = useCartStore();

    // GET Reseñas
    const fetchProductReviews = async (pId: string) => {
        try {
            const url = `${API_BASE}/store/products/${pId}/reviews/`;
            const response = await fetch(url);

            if (!response.ok) {
                // Manejar 404 para reseñas como un array vacío en lugar de un error
                if (response.status === 404) {
                    setProductReviews([]);
                    return;
                }
                throw new Error(`Error al obtener las reseñas: ${response.statusText}`);
            }

            const data = await response.json();
            setProductReviews(data.results || []);

        } catch (error) {
            console.error("Error al cargar las reseñas:", error);
            // No mostrar toast de error si es un 404 para las reseñas
            if (!(error instanceof Error && error.message.includes("404"))) {
                toast.error("Error al cargar las reseñas.");
            }
        }
    };

    // GET Productos y reseñas
    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        const fetchProductDetailAndReviews = async () => {
            setLoading(true);
            try {
                const productUrl = `${API_BASE}/store/products/${productId}/`;
                const productResponse = await fetch(productUrl);

                if (!productResponse.ok) {
                    throw new Error(`Error al obtener el producto con ID ${productId}: ${productResponse.statusText}`);
                }

                const productData: Product = await productResponse.json();
                setProduct(productData);

                // Si el producto tiene variantes, selecciona la primera por defecto
                if (productData.has_variants && productData.variants && productData.variants.length > 0) {
                    setSelectedVariantId(productData.variants[0].id.toString());
                } else {
                    setSelectedVariantId(null); // No hay variantes seleccionadas
                }

                // Cargar reseñas independientemente de si el producto se encontró
                await fetchProductReviews(productId);

            } catch (error) {
                console.error("Error al cargar el producto o las reseñas:", error);
                setProduct(null); // Si el producto no se carga, establecerlo en null
                setProductReviews([]); // Asegurarse de que las reseñas también estén vacías
                toast.error("Error al cargar el producto.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetailAndReviews();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) {
            toast.error("No se pudo añadir el producto al carrito.");
            return;
        }

        let itemToAdd: any;
        let currentStockValue: number;
        let currentPriceValue: number;
        let currentProductName: string;
        let cartItemId: string; // Para el ID único en el carrito
        let variantIdForCart: number | undefined = undefined;
        let mainProductId: number = product.id; // Guarda el ID del producto principal

        // Si el producto tiene variantes y se ha seleccionado una
        if (product.has_variants && selectedVariantId) {
            const selectedVariant = product.variants.find(v => v.id.toString() === selectedVariantId);
            if (!selectedVariant) {
                toast.error("Por favor, selecciona una variante válida.");
                return;
            }
            currentStockValue = parseFloat(selectedVariant.stock);
            currentPriceValue = parseFloat(selectedVariant.precio);
            currentProductName = `${product.productName} (${selectedVariant.unidades ? `${selectedVariant.unidades} unidades` : ''} ${selectedVariant.gramaje ? `${selectedVariant.gramaje}g` : ''})`.trim();
            cartItemId = `${product.id}-${selectedVariant.id}`; // ID compuesto para la variante
            variantIdForCart = selectedVariant.id;
        } else { // Producto sin variantes
            currentStockValue = parseFloat(product.stock);
            currentPriceValue = parseFloat(product.sellingPrice);
            currentProductName = product.productName;
            cartItemId = product.id.toString(); // ID del producto principal
        }

        if (currentStockValue <= 0) {
            toast.error("No hay stock disponible para este producto/variante.");
            return;
        }
        if (Number(selectedQuantity) > currentStockValue) {
            toast.error(`Solo hay ${currentStockValue} unidades disponibles.`);
            return;
        }

        itemToAdd = {
            id: cartItemId, // Usa el ID compuesto o principal
            productName: currentProductName,
            imageUrl: product.imageUrl,
            sellingPrice: currentPriceValue,
            discountPercent: product.discountPercent ? parseFloat(product.discountPercent) : 0,
            stock: currentStockValue,
            productId: mainProductId, // ID del producto principal
            variantId: variantIdForCart, // ID de la variante si existe
            quantity: Number(selectedQuantity), // Agrega la cantidad seleccionada
        };
        
        addItem(itemToAdd, Number(selectedQuantity));
        toast.success("Producto añadido al carrito");
    };

    // POST Reseña
    const handleSubmitReview = async () => {
        if (!user || !token) {
            toast.error("Debes iniciar sesión para escribir una reseña.");
            return;
        }
        if (!product) {
            toast.error("No se puede añadir reseña sin producto.");
            return;
        }
        if (comment.trim() === "") {
            toast.error("El comentario no puede estar vacío.");
            return;
        }
        if (rating < 1 || rating > 5) {
            toast.error("El rating debe ser entre 1 y 5 estrellas.");
            return;
        }

        try {
            const url = `${API_BASE}/store/products/${productId}/reviews/`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product: product.id,
                    rating: rating,
                    comment: comment,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error al enviar la reseña: ${response.statusText}`);
            }

            toast.success("Reseña enviada con éxito!");
            setComment("");
            setRating(4);
            setShowReviewForm(false);
            await fetchProductReviews(productId); // Refrescar las reseñas

        } catch (error: any) {
            console.error("Error al enviar la reseña:", error);
            toast.error(error.message || "Error al enviar la reseña. Inténtalo de nuevo.");
        }
    };

    // Función para obtener el stock actual, precio y si es vendible
    const getCurrentProductInfo = () => {
        if (!product) {
            return { stock: 0, price: "0.00", isSellable: false };
        }

        // Si tiene variantes y se ha seleccionado una
        if (product.has_variants && selectedVariantId) {
            const selectedVariant = product.variants.find(v => v.id.toString() === selectedVariantId);
            if (selectedVariant) {
                return {
                    stock: parseFloat(selectedVariant.stock),
                    price: selectedVariant.precio,
                    isSellable: parseFloat(selectedVariant.stock) > 0,
                };
            }
        }
        // Si no tiene variantes, o no hay variantes seleccionadas (por ejemplo, si has_variants es true pero variants array está vacío)
        return {
            stock: parseFloat(product.stock),
            price: product.sellingPrice,
            isSellable: parseFloat(product.stock) > 0,
        };
    };

    const { stock: currentStock, price: currentPrice, isSellable: currentIsSellable } = getCurrentProductInfo();

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-5xl flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mb-4"></div>
                    <p>Cargando información del producto...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-5xl flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                    <p>
                        Lo sentimos, no pudimos encontrar el producto que buscas.
                    </p>
                    <Button
                        className="mt-6 bg-amber-400 hover:bg-amber-500 text-black"
                        asChild
                    >
                        <Link href="/products">Volver a la tienda</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 my-6">
                <div className="relative">
                    {/* Renderiza la primera imagen del array 'images' si existe, de lo contrario 'imageUrl' */}
                    <Image
                        src={product.images && product.images.length > 0 ? product.images[0] : product.imageUrl || "/placeholder.svg"}
                        alt={product.productName ? `Foto de ${product.productName}` : "Imagen del producto"}
                        width={500}
                        height={500}
                        className="rounded-lg w-full h-auto object-cover"
                        unoptimized
                    />
                </div>

                <div className="flex flex-col gap-4">

                    {/* Titulo */}
                    <h1 className="text-3xl font-semibold mb-2 underline-offset-4">
                        {product.productName}
                    </h1>

                    {/* Categorias */}
                    {product.categories && product.categories.length > 0 && (
                        <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-md font-medium text-center max-w-fit">
                            {product.categories[0]} {/* Mostrar la primera categoría como badge */}
                        </div>
                    )}
                    
                    {/* Precio */}
                    <div className="mb-4">
                        <span className="text-3xl font-bold">
                            ${parseFloat(currentPrice).toFixed(2)} {/* Muestra el precio actual */}
                        </span>
                        {/* Muestra el stock */}
                        <p className="text-gray-600 text-md mt-1">
                            Stock: {currentStock > 0 ? currentStock : "Sin Stock"}
                        </p>
                    </div>

                    {/* Descripcion */}
                    <p className="text-gray-600 mb-6">
                        {product.productDescription}
                    </p>

                    <div className="w-full flex flex-row gap-4">

                        {/* Selector de variantes si el producto tiene has_variants y variantes */}
                        {product.has_variants && product.variants && product.variants.length > 0 && (
                            <div className="w-1/2 mb-6">
                                <label className="block text-sm font-medium mb-2">
                                    Variantes
                                </label>
                                <Select
                                    value={selectedVariantId || ''}
                                    onValueChange={(value) => setSelectedVariantId(value)}
                                    // Deshabilitar si no hay variantes disponibles para seleccionar
                                    disabled={!product.variants || product.variants.length === 0}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="Seleccionar variante" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {product.variants.map((variant) => (
                                            <SelectItem key={variant.id} value={variant.id.toString()} className="bg-white">
                                                {`${variant.unidades ? `${variant.unidades} unidades` : ''} ${variant.gramaje ? `${variant.gramaje}g` : ''}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Cantidad */}
                        <div className="flex flex-col gap-4 mb-6 w-1/2">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Cantidad
                                </label>
                                <Select
                                    value={selectedQuantity}
                                    onValueChange={setSelectedQuantity}
                                    disabled={!currentIsSellable || currentStock <= 0} // Deshabilitar si no es vendible
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue placeholder="1" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Generar opciones de cantidad hasta el stock actual, máximo 100 para evitar una lista enorme */}
                                        {Array.from({ length: Math.min(currentStock, 50) }, (_, i) => i + 1).map((qty) => (
                                            <SelectItem key={qty} value={qty.toString()}>
                                                {qty}
                                            </SelectItem>
                                        ))}
                                        {/* Si el stock es 0, al menos mostrar "0" para indicar que no hay opciones */}
                                        {currentStock === 0 && (
                                            <SelectItem value="0" disabled>0</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    
                    {/* Agregar al Carrito */}
                    <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-lg cursor-pointer"
                        onClick={handleAddToCart}
                        // Deshabilita el botón si no es vendible, no hay stock, o si tiene variantes y no se ha seleccionado ninguna
                        disabled={!currentIsSellable || currentStock <= 0 || (product.has_variants && (!selectedVariantId || product.variants.length === 0))}
                    >
                        {product.has_variants && (!selectedVariantId || product.variants.length === 0) ? "Selecciona una variante" : currentStock > 0 ? "Añadir al carrito" : "Sin Stock"}
                    </Button>
                </div>
            </div>

            {/* Seccion de Reseñas */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-8">
                    Otros usuarios comentaron..
                </h2>

                {productReviews.length > 0 ? (
                    productReviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-xs mb-6">
                            <div className="flex items-center mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${
                                            star <= review.rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                ))}
                            </div>
                            <h3 className="font-medium mb-2">{review.user || "Anónimo"}</h3>
                            <p className="text-gray-600 mb-4">
                                {review.comment}
                            </p>
                            <p className="text-gray-500 text-sm text-right">
                                {new Date(review.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">
                        No hay reseñas para este producto todavía. ¡Sé el primero en escribir una!
                    </p>
                )}

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-amber-500 hover:bg-amber-700 text-white cursor-pointer"
                    >
                        Escribir Reseña
                    </Button>
                </div>

                {showReviewForm && (
                    <div className="bg-gray-100 p-8 rounded-xl mt-6">
                        <h2 className="text-2xl font-semibold text-center mb-8">
                            Formulario reseñas
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nombre
                                </label>
                                <Input
                                    value={user?.name || ""}
                                    disabled
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Ranking
                                </label>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 cursor-pointer ${
                                                star <= rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300"
                                            }`}
                                            onClick={() => setRating(star)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Texto de la Reseña
                            </label>
                            <Textarea
                                className="w-full min-h-[150px]"
                                placeholder="Escribe tu opinión sobre este producto..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowReviewForm(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white border-none cursor-pointer"
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-amber-400 hover:bg-amber-500 text-white"
                                onClick={handleSubmitReview}
                                disabled={!user || !token || comment.trim() === "" || rating < 1}
                            >
                                Publicar
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}