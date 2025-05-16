import React from "react";
import { Card, CardContent } from "../ui/card";
import { Infinity, Laptop, Zap, ZoomIn } from "lucide-react";

const values = [
    {
        title: "Alimento Húmedo",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "/placeholder.svg",
    },
    {
        title: "Snacks Deshidratados",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "/placeholder.svg",
    },
    {
        title: "Snacks Congelados",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "/placeholder.svg",
    },
    {
        title: "Suplementos Nutricionales",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "/placeholder.svg",
    },
];

const features = [
    {
        title: "Alimento Húmedo",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat",
        icon: Infinity,
        variant: "default",
    },
    {
        title: "Snacks Deshidratados",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat",
        icon: Laptop,
        variant: "muted",
    },
    {
        title: "Snacks Congelados",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat",
        icon: Zap,
        variant: "default",
    },
    {
        title: "Suplementos Nutricionales",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat",
        icon: ZoomIn,
        variant: "muted",
    },
];

export default function Secciones() {
    return (
        <section className="py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-sans font-semibold">
                    Nuestras categorias
                    <span className="text-primary">.</span>
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
                    {features.map((feature, index) => {
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
                                        {feature.description}
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
