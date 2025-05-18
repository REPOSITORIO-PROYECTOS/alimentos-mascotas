import React from "react";
import { Card, CardContent } from "../ui/card";
import { Bone, LeafyGreen, Plus } from "lucide-react";

const values = [
    {
        title: "Snacks deshidratados",
        description:
            "Snacks 100% naturales para cuidar su salud, premiarlos y darles amor",
        extendeDescription:
            "La dieta ideal para sumar sabor, nutrientes y proteínas a la alimentación diaria de tu peludo. Con ingredientes frescos y naturales, pensada para que disfrute mientras cuida su salud.",
        image: "/images/sections/snacks-deshidratados.webp",
        icon: LeafyGreen,
        variant: "default",
    },
    {
        title: "Suplementos",
        description: "Nutrición extra para acompañar cada etapa de su vida.",
        extendeDescription:
            "Snacks 100% naturales, saludables sin aditivos, solo ingredientes reales. Perfectos para premiar y entrenar a tu peludo.",
        image: "/images/sections/suplemento.webp",
        icon: Bone,
        variant: "muted",
    },
    {
        title: "Alimentación natural",
        description:
            "Dieta preparada con alimentos 100% naturales, Frescura y nutrientes reales en cada bocado",
        extendeDescription:
            "Apoyo extra para su salud diaria con productos sin químicos, ni conservantes. Para fortalecer sus huesos y su energía.",
        image: "/images/sections/alimentacion-natural.webp",
        icon: Plus,
        variant: "default",
    },
];

export default function Secciones() {
    return (
        <section className="py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl text-primary font-sans font-semibold">
                    Nuestras categorias
                </h2>

                <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
                    {values.map((value, index) => (
                        <Card key={index} className="overflow-hidden bg-muted">
                            <div className="h-64 w-full">
                                <img
                                    src={value.image || "/placeholder.svg"}
                                    alt={value.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <CardContent className="px-10 pb-8 pt-8">
                                <h3 className="mb-4 text-2xl font-semibold">
                                    {value.title}
                                </h3>
                                <p className="text-base text-muted-foreground">
                                    {value.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 space-y-4">
                    {values.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={index}
                                className={`${
                                    feature.variant === "muted"
                                        ? "bg-muted"
                                        : ""
                                }`}
                            >
                                <CardContent className="flex flex-col items-center justify-between gap-4 p-8 sm:flex-row sm:gap-10">
                                    <div className="flex w-full gap-4">
                                        <Icon className="size-8" />
                                        <p className="text-base font-semibold">
                                            {feature.title}
                                        </p>
                                    </div>
                                    <p className="w-full text-base text-muted-foreground">
                                        {feature.extendeDescription}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
