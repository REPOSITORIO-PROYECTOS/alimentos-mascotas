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

type Product = {
    id: number;
    name: string; 
    category: string; 
    description: string;
    image: string | null; 
    price: string; 
    stock: string;
    is_sellable: boolean; 
    components: any[]; 
    reviews: any[]; 
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
    const [selectedSize, setSelectedSize] = useState("medium");
    const [selectedQuantity, setSelectedQuantity] = useState("1");
    const { addItem } = useCartStore();

    // GET Reseñas
    const fetchProductReviews = async (pId: string) => {
        try {
            const url = `${API_BASE}/store/products/${pId}/reviews/`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error al obtener las reseñas: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Reviews data:", data); // Log para ver la estructura de las reseñas
            setProductReviews(data.results || []); // Asumiendo que las reseñas vienen en un campo 'results'
        } catch (error) {
            console.error("Error al cargar las reseñas:", error);
            toast.error("Error al cargar las reseñas.");
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
                console.log("Product data from API:", productData);
                console.log(productUrl);
                setProduct(productData);


                await fetchProductReviews(productId);

            } catch (error) {
                console.error("Error al cargar el producto o las reseñas:", error);
                setProduct(null);
                setProductReviews([]);

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

        addItem(
            {
                id: product.id.toString(),
                productName: product.name,
                /*  productDescription: product.description, // Usar 'description' */
                imageUrl: product.image, 
                sellingPrice: parseFloat(product.price), 
                discountPercent: 0,
                stock: parseFloat(product.stock),
            },
            Number(selectedQuantity)
        );

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
            console.log("Submitting review to:", url);
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
            await fetchProductReviews(productId);
        } catch (error: any) {
            console.error("Error al enviar la reseña:", error);
            toast.error(error.message || "Error al enviar la reseña. Inténtalo de nuevo.");
        }
    };

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
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name} 
                        width={500}
                        height={500}
                        className="rounded-lg w-full h-auto object-cover"
                        unoptimized
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold mb-2 underline-offset-4">
                        {product.name} 
                    </h1>
                    {product.category && (
                        <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-md font-medium text-center max-w-1/3">
                            {product.category}
                        </div>
                    )}
                    <div className="mb-4">
                        <span className="text-3xl font-bold">
                            ${parseFloat(product.price).toFixed(2)} 
                        </span>
                    </div>
                    <p className="text-gray-600 mb-6">
                        {product.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Cantidad
                            </label>
                            <Select value={selectedQuantity} onValueChange={setSelectedQuantity}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-lg cursor-pointer"
                        onClick={handleAddToCart}
                        disabled={parseFloat(product.stock) <= 0 || !product.is_sellable}
                    >
                        {parseFloat(product.stock) > 0 && product.is_sellable ? "Añadir al carrito" : "Sin Stock / No Vendible"} {/* Mensaje más descriptivo */}
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