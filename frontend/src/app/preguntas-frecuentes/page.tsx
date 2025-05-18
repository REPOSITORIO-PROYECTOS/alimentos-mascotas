import Image from "next/image";
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
                                            //barker team1.webp
                                            src={`/images/preguntas-frecuentes/barker team ${
                                                i + 1
                                            }.webp`}
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
        question:
            "¿Cuánta cantidad de snacks por día le puedo dar a mi peludo?",
        answer: (
            <div className="w-full">
                <p className="mb-4">
                    <strong>Como regla general</strong>, los snacks no deben
                    superar el 10% de las calorías diarias que necesita tu
                    peludo.
                </p>

                <ul className="list-disc list-inside space-y-2">
                    <li>
                        <span className="font-semibold text-orange-600">
                            🔸 Perros pequeños (hasta 5 kg):
                        </span>{" "}
                        1 a 2 snacks chicos por día
                    </li>
                    <li>
                        <span className="font-semibold text-orange-600">
                            🔸 Perros medianos (6 a 15 kg):
                        </span>{" "}
                        2 a 3 snacks medianos por día
                    </li>
                    <li>
                        <span className="font-semibold text-orange-600">
                            🔸 Perros grandes (más de 15 kg):
                        </span>{" "}
                        hasta 4 snacks medianos o 1 grande por día
                    </li>
                </ul>

                <p className="mt-4 text-sm text-gray-600">
                    Recordá que esta es una guía general. Siempre es ideal
                    adaptar según el tamaño, actividad y salud de tu peludo. Y
                    si tenés dudas,{" "}
                    <span className="font-medium text-blue-600">
                        ¡consultá con tu veterinario de confianza!
                    </span>
                </p>
            </div>
        ),
    },
    {
        question: "¿Cómo están hechos los snacks?",
        answer: "Nuestros snacks son 100% naturales, elaborados con ingredientes frescos y sin aditivos, conservantes ni químicos.",
    },
    {
        question: "¿Cómo son los envíos/  cuánto tarda en llegar el pedido?",
        answer: "Hacemos envíos a todo el país. Una vez confirmado el pedido, el despacho se realiza dentro de las 24 a 48 hs hábiles. El tiempo de entrega depende de tu localidad, pero suele tardar entre 2 y 5 días hábiles.",
    },
    {
        question: "¿Cómo son los medios de pago?",
        answer: "Podés abonar con tarjeta de crédito, débito, transferencia bancaria o a través de plataformas como Mercado Pago. También aceptamos pagos en efectivo si retirás en punto de entrega (si aplica).",
    },
];
