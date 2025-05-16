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
        src: "/product/Rectangle 4756.png",
        alt: "Imagen 1",
    },
    {
        id: 2,
        src: "/product/Rectangle 4757.png",
        alt: "Imagen 2",
    },
    {
        id: 3,
        src: "/product/Rectangle 4758.png",
        alt: "Imagen 3",
    },
    {
        id: 4,
        src: "/product/Rectangle 4759.png",
        alt: "Imagen 4",
    },
    {
        id: 5,
        src: "/product/Rectangle 4760.png",
        alt: "Imagen 5",
    },
    {
        id: 6,
        src: "/product/Rectangle 4761.png",
        alt: "Imagen 6",
    },
    {
        id: 7,
        src: "/product/Rectangle 4762.png",
        alt: "Imagen 7",
    },
    {
        id: 8,
        src: "/product/Rectangle 4821.jpg",
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
                                <Card className="py-2 bg-white/30 backdrop-blur-2xl">
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
