"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

// Datos de ejemplo para la galería
const galleryImages = [
    {
        id: 1,
        src: "/images/carrusel/1era foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 1",
    },
    {
        id: 2,
        src: "/images/carrusel/2da foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 2",
    },
    {
        id: 3,
        src: "/images/carrusel/3era foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 3",
    },
    {
        id: 4,
        src: "/images/carrusel/4ta foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 4",
    },
    {
        id: 5,
        src: "/images/carrusel/5ta foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 5",
    },
    {
        id: 6,
        src: "/images/carrusel/6ta foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 6",
    },
    {
        id: 7,
        src: "/images/carrusel/7ma foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 7",
    },
    {
        id: 8,
        src: "/images/carrusel/8va foto carrusel _recomendados con amor_(600x600).webp",
        alt: "Imagen 8",
    },
];

export function AutoSlideGallery() {
    const plugin = React.useRef(
        Autoplay({
            delay: 3000,
            stopOnInteraction: true,
        })
    );

    return (
        <div className="w-full max-w-5xl mx-auto">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {galleryImages.map((image) => (
                        <CarouselItem
                            key={image.id}
                            className="md:basis-1/2 lg:basis-1/3"
                        >
                            <div className="p-1">
                                <Card className="py-2 bg-secondary backdrop-blur-2xl">
                                    <CardContent className="flex flex-col items-center justify-center px-2">
                                        <div className="aspect-square w-full overflow-hidden rounded-lg">
                                            <img
                                                src={
                                                    image.src ||
                                                    "/placeholder.svg"
                                                }
                                                alt={image.alt}
                                                className="h-full w-full object-cover transition-all hover:scale-105"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 text-black" />
                <CarouselNext className="right-2 text-black" />
            </Carousel>
        </div>
    );
}
