"use client";

import { useState } from "react";
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

export default function ProductDetail({ params }: { params: { id: string } }) {
    const productId = Number.parseInt(params.id);
    const product = products.find((p) => p.id === productId) || products[0];
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(4);

    return (
        <div className="container mx-auto px-4 py-20 max-w-5xl">
            {/* Sección de detalle del producto */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="relative">
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={500}
                        height={500}
                        className="rounded-lg w-full h-auto"
                    />
                </div>

                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

                    <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        Deshidratados
                    </div>

                    <div className="mb-4">
                        <span className="text-3xl font-bold">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Snacks naturales para perros, elaborados con
                        ingredientes de alta calidad. Sin conservantes ni
                        aditivos artificiales. Ideal para premiar a tu mascota.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tamaño
                            </label>
                            <Select defaultValue="medium">
                                <SelectTrigger>
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
                            <Select defaultValue="1">
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button className="w-full bg-amber-400 hover:bg-amber-500 text-black">
                        Añadir al carrito
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

            {/* Sección de reseñas */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-8">Reseñas</h2>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
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

                {/* Formulario de reseñas */}
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

const products = [
    {
        id: 1,
        name: "Snacks Naturales para Perro",
        price: 39.0,
        reviews: 14,
        image: "/placeholder.svg?height=300&width=300",
    },
    // ... resto de los productos ...
];
