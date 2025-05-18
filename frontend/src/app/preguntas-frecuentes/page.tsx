import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-primary overflow-hidden">
                <div className="container relative z-10 mx-auto px-4 py-24">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-white">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Sumá a tu peludo al
                                <br />
                                <span className="text-5xl font-sans md:text-6xl block mt-2 mb-10">
                                    BARKER TEAM
                                </span>
                            </h1>
                            <p className="text-xl mb-6">
                                Alimentos reales para
                                <br />
                                animales reales
                            </p>
                            <div className="inline-block bg-white/20 backdrop-blur-xs rounded-full px-19 py-4">
                                <Image
                                    src="/images/logo.webp"
                                    alt="100% Natural"
                                    width={150}
                                    height={50}
                                    className="h-28 w-auto"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-3 gap-2">
                                {[...Array(9)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square relative overflow-hidden rounded-lg"
                                    >
                                        <Image
                                            src={`/placeholder.svg?height=200&width=200&text=Pet${
                                                i + 1
                                            }`}
                                            alt={`Happy pet ${i + 1}`}
                                            width={200}
                                            height={200}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative paw prints */}
                {[...Array(16)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute z-0 w-16 h-16 opacity-20"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                    >
                        <img src="/favicon.svg" alt="logo" />
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-gray-600">
                        Encuentra respuestas a las preguntas más comunes sobre
                        nuestros productos y servicios para mascotas.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-white rounded-lg border px-6"
                            >
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}

const faqs = [
    {
        question: "¿Cuáles son los beneficios de los snacks naturales Baker?",
        answer: "Nuestros snacks naturales están elaborados con ingredientes de alta calidad, sin conservantes ni aditivos artificiales. Ayudan a mantener una dentadura saludable, son fáciles de digerir y son ideales para el entrenamiento.",
    },
    {
        question: "¿Cómo debo almacenar los productos Baker?",
        answer: "Recomendamos almacenar nuestros productos en un lugar fresco y seco, alejado de la luz directa del sol. Una vez abierto el paquete, utiliza un contenedor hermético para mantener la frescura.",
    },
    {
        question: "¿Cuál es el tiempo de entrega de los pedidos?",
        answer: "Los pedidos se entregan en un plazo de 24-48 horas en zonas urbanas, y de 2-4 días en zonas rurales. Todos los envíos incluyen seguimiento en tiempo real.",
    },
    {
        question: "¿Los productos son aptos para cachorros?",
        answer: "Sí, tenemos una línea específica para cachorros con el tamaño y la textura adecuados. Sin embargo, recomendamos consultar con tu veterinario según la edad y raza de tu mascota.",
    },
];
