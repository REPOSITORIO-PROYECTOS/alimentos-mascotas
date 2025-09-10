"use client";

import React, { useState, useEffect } from "react"; // Asegúrate de importar React
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/context/store";

import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

// Base URL configurable vía env var
const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://barker.sistemataup.online/api";
const MEDIA_BASE =
    process.env.NEXT_PUBLIC_MEDIA_BASE || API_BASE.replace(/\/(?:api\/?$)/, "");

// Define el tipo para el producto de la API de Django
type Product = {
    id: number;
    name: string;
    category: string;
    description: string;
    price: string;
    stock: string;
    image: string | null; // Puede ser null
    is_sellable: boolean;
    components: Array<{
        component: number;
        component_name: string;
        quantity: string;
        merma_percentage: string;
    }>;
};

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>; // Vuelve a ser una Promise como estaba originalmente
}) {
  // *** CAMBIO CLAVE AQUÍ: Usar React.use() para unwrappear la promesa de params ***
  const resolvedParams = React.use(params); // <--- NUEVO
  const productId = resolvedParams.id;      // <--- Usa el objeto resuelto

  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(4);
  const [selectedSize, setSelectedSize] = useState("medium");
  const [selectedQuantity, setSelectedQuantity] = useState("1");

  const { addItem } = useCartStore();

  // Cargar detalle del producto
  useEffect(() => {
    if (!productId) return; // productId ya está disponible inmediatamente gracias a React.use()

    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE.replace(/\/$/, "")}/store/products/${productId}/`;
        console.log("Fetching product detail from:", url);
        const response = await fetch(
          url,
          {
            method: "GET",
            // headers: { ... }
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener detalles del producto");
        }

        const data: Product = await response.json();
        setProduct(data);
        console.log("Detalle del producto de Django:", data);

      } catch (error) {
        console.error("Error al cargar el producto:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId, user?.token]);

    const handleAddToCart = () => {
        if (!product) {
            toast.error("No se pudo añadir el producto al carrito.");
            return;
        }

        addItem(
            {
                id: product.id.toString(),
                productName: product.name,
                imageUrl: product.image ? `${MEDIA_BASE}${product.image}` : null, // Usar MEDIA_BASE
                sellingPrice: parseFloat(product.price),
                discountPercent: 0,
                stock: parseFloat(product.stock),
            },
            Number(selectedQuantity)
        );

        toast.success("Producto añadido al carrito");
    };

    if (loading || !product) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-5xl flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    {loading ? (
                    <>
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mb-4"></div>
                        <p>Cargando información del producto...</p>
                    </>
                    ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                        <p>
                            Lo sentimos, no pudimos encontrar el producto que buscas.
                        </p>
                        <Button
                        className="mt-6 bg-amber-400 hover:bg-amber-500 text-black"
                        asChild
                        >
                        <a href="/products">Volver a productos</a>
                        </Button>
                    </>
                    )}
                </div>
            </div>
        );
    }

    return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 my-6">
            <div className="relative">
                {/* *** CAMBIO CLAVE AQUÍ: Usar MEDIA_BASE para la imagen *** */}
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
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-md font-medium text-center max-w-1/3">
                    {product.category || "General"}
                </div>
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
                            Tamaño
                        </label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">
                                Pequeño (100g)
                                </SelectItem>
                                <SelectItem value="medium">
                                Mediano (250g)
                                </SelectItem>
                                <SelectItem value="large">
                                Grande (500g)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                disabled={parseFloat(product.stock) <= 0}
                >
                    {parseFloat(product.stock) > 0 ? "Añadir al carrito" : "Sin Stock"}
                </Button>

                <div className="mt-6">
                <Accordion type="single" collapsible>
                    <AccordionItem value="description">
                    <AccordionTrigger className="font-medium">
                        Descripción
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-gray-600">
                        Nuestros snacks naturales para perros
                        están elaborados con carne de res de
                        primera calidad, deshidratada lentamente
                        para preservar todos los nutrientes y
                        sabor. Perfectos para el entrenamiento o
                        como premio ocasional. Contienen
                        proteínas de alta calidad y son bajos en
                        grasas.
                        <br />
                        <br />
                        Ingredientes: Carne de res, hígado de
                        pollo, zanahoria, calabaza.
                        <br />
                        <br />
                        Análisis garantizado:
                        <br />- Proteína cruda: mín. 35%
                        <br />- Grasa cruda: mín. 8%
                        <br />- Fibra cruda: máx. 3%
                        <br />- Humedad: máx. 18%
                        </p>
                    </AccordionContent>
                    </AccordionItem>
                </Accordion>
                </div>
            </div>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">
                Reseñas
            </h2>

            <div className="bg-white p-6 rounded-lg shadow-xs mb-6">
                <div className="flex items-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                    key={star}
                    className={`w-5 h-5 ${
                        star === 1
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                    />
                ))}
            </div>

            <h3 className="font-medium mb-2">Cliente</h3>
            <p className="text-gray-600 mb-4">
            Mi perro adora estos snacks. Son perfectos para el
            entrenamiento ya que son pequeños y puedo darle varios
            sin preocuparme por exceder su ingesta calórica diaria.
            Además, me encanta que sean naturales y sin aditivos
            artificiales. Definitivamente los compraré de nuevo. La
            calidad es excelente y el envío fue rápido. Recomiendo
            este producto a todos los dueños de mascotas que buscan
            opciones saludables para premiar a sus peludos amigos.
            </p>

            <div className="flex justify-end">
                <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-amber-400 hover:bg-amber-500 text-black"
                >
                    Escribir Reseña
                </Button>
            </div>
        </div>

        {showReviewForm && (
            <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-8">
                    Formulario reseñas
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                    <label className="block text-sm font-medium mb-2">
                        Nombre
                    </label>
                    <Input
                        defaultValue="Pablo"
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

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Mail de Contacto
                    </label>
                    <Input
                        defaultValue="pablocortaza@gmail.com"
                        className="w-full"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                Texto de la Reseña
                </label>
                <Textarea
                className="w-full min-h-[150px]"
                placeholder="Escribe tu opinión sobre este producto..."
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                >
                Cancelar
                </Button>
                <Button className="bg-amber-400 hover:bg-amber-500 text-black">
                Publicar
                </Button>
            </div>
            </div>
        )}
        </div>
    </div>
    );
}