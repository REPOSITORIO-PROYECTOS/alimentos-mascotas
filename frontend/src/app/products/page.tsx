import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Banner de estadísticas */}
            <div className="bg-amber-400 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-2">450🐕</h2>
                        <p className="text-sm text-center">
                            Perritos felices por comer
                            <br />
                            suplementos Baker Pet
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-2">150🐈</h2>
                        <p className="text-sm text-center">
                            Gatos menos estresados por comer
                            <br />
                            alimentos saludables
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-2">😺600🐶</h2>
                        <p className="text-sm text-center">
                            Animales felices por no comer
                            <br />
                            alimentos con aditivos tóxicos
                        </p>
                    </div>
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

            {/* Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        className="group"
                    >
                        <div className="flex flex-col">
                            <div className="bg-amber-400 p-4 rounded-lg mb-2 group-hover:opacity-80 transition-opacity">
                                <Image
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium group-hover:underline">
                                    {product.name}
                                </h3>
                                <div className="flex items-center">
                                    <span className="text-sm mr-1">
                                        {product.reviews} reviews
                                    </span>
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">
                                    ${product.price.toFixed(2)}
                                </span>
                                {product.oldPrice && (
                                    <span className="text-sm line-through text-gray-500">
                                        ${product.oldPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
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
    {
        id: 2,
        name: "Premios Deshidratados Pollo",
        price: 49.88,
        oldPrice: 59.99,
        reviews: 14,
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 3,
        name: "Treats Orgánicos Premium",
        price: 55.89,
        reviews: 14,
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 4,
        name: "Huesos Naturales Masticables",
        price: 42.5,
        reviews: 14,
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 5,
        name: "Galletas para Entrenamiento",
        price: 37.99,
        reviews: 14,
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 6,
        name: "Snacks Dentales Refrescantes",
        price: 45.75,
        reviews: 14,
        image: "/placeholder.svg?height=300&width=300",
    },
];
