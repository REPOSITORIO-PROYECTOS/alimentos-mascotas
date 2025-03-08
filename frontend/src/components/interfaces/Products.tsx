import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { Eye, Heart, ShoppingCart } from "lucide-react";

export default function Products() {
    return (
        <section className="relative overflow-hidden py-32">
            <div className="container mx-auto relative z-10 mt-8 grid grid-cols-1 gap-6 md:grid-cols-5">
                <div className="bg-card relative text-card-foreground rounded-xl border col-span-1 shadow-xl flex flex-col overflow-hidden group md:col-span-3 md:flex-col">
                    <div>
                        <Image
                            src="/product/Rectangle 4824.jpg"
                            alt="Code snippet"
                            className="self-center object-cover w-full h-72"
                            width={600}
                            height={300}
                        />
                    </div>
                    <div className="absolute left-6 bottom-28 translate-y-0 flex gap-2 group-hover:-translate-y-16 transition-transform duration-300 ease-in-out">
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar al carrito"
                        >
                            <ShoppingCart className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Ver producto"
                        >
                            <Eye className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar a favoritos"
                        >
                            <Heart className="size-5" />
                        </Button>
                    </div>
                    <div className="relative bg-white z-20 p-6 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-zinc-400">Categoria</p>
                            <p className="text-orange-500">Oferta</p>
                        </div>
                        <div className="text-xl font-bold">Titulo</div>
                        <div className="flex gap-2 mt-2">
                            <p>
                                <span className="text-zinc-400 line-through">
                                    $6.000
                                </span>
                            </p>
                            <p>
                                <span className="">$4.000</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card relative text-card-foreground overflow-hidden rounded-xl border col-span-1 shadow-xl md:col-span-2 flex flex-col justify-center group">
                    <div>
                        <Image
                            src="/product/Rectangle 4823.png"
                            alt="Code snippet"
                            className="self-center object-cover w-full h-72"
                            width={600}
                            height={300}
                        />
                    </div>
                    <div className="absolute left-6 bottom-28 translate-y-0 flex gap-2 group-hover:-translate-y-16 transition-transform duration-300 ease-in-out">
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar al carrito"
                        >
                            <ShoppingCart className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Ver producto"
                        >
                            <Eye className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar a favoritos"
                        >
                            <Heart className="size-5" />
                        </Button>
                    </div>
                    <div className="p-6 relative bg-white z-30 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-zinc-400">Categoria</p>
                            <p className="text-orange-500">Oferta</p>
                        </div>
                        <div className="text-xl font-bold">Titulo</div>
                        <div className="flex gap-2 mt-2">
                            <p>
                                <span className="text-zinc-400 line-through">
                                    $6.000
                                </span>
                            </p>
                            <p>
                                <span className="">$4.000</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card relative text-card-foreground overflow-hidden rounded-xl border col-span-1 shadow-xl md:col-span-2 group">
                    <div>
                        <Image
                            src="/product/Rectangle 4822.jpg"
                            alt="Code snippet"
                            className="self-center object-cover w-full h-72"
                            width={600}
                            height={300}
                        />
                    </div>
                    <div className="absolute left-6 bottom-28 translate-y-0 flex gap-2 group-hover:-translate-y-16 transition-transform duration-300 ease-in-out">
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar al carrito"
                        >
                            <ShoppingCart className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Ver producto"
                        >
                            <Eye className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar a favoritos"
                        >
                            <Heart className="size-5" />
                        </Button>
                    </div>
                    <div className="p-6 relative z-30 bg-white flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-zinc-400">Categoria</p>
                            <p className="text-orange-500">Oferta</p>
                        </div>
                        <div className="text-xl font-bold">Titulo</div>
                        <div className="flex gap-2 mt-2">
                            <p>
                                <span className="text-zinc-400 line-through">
                                    $6.000
                                </span>
                            </p>
                            <p>
                                <span className="">$4.000</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card relative text-card-foreground rounded-xl border col-span-1 shadow-xl overflow-hidden md:col-span-3 group">
                    <div>
                        <Image
                            src="/product/Rectangle 4821.jpg"
                            alt="Code snippet"
                            className="self-center object-cover w-full h-72"
                            width={600}
                            height={300}
                        />
                    </div>
                    <div className="absolute left-6 bottom-28 translate-y-0 flex gap-2 group-hover:-translate-y-16 transition-transform duration-300 ease-in-out">
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar al carrito"
                        >
                            <ShoppingCart className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Ver producto"
                        >
                            <Eye className="size-5" />
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-white/60"
                            aria-label="Agregar a favoritos"
                        >
                            <Heart className="size-5" />
                        </Button>
                    </div>
                    <div className="p-6 relative z-30 bg-white flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-zinc-400">Categoria</p>
                            <p className="text-orange-500">Oferta</p>
                        </div>
                        <div className="text-xl font-bold">Titulo</div>
                        <div className="flex gap-2 mt-2">
                            <p>
                                <span className="text-zinc-400 line-through">
                                    $6.000
                                </span>
                            </p>
                            <p>
                                <span className="">$4.000</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 will-change-transform">
                <div className="absolute top-1/2 size-[700px] -translate-y-1/2 rounded-full bg-gradient-1/30 blur-[300px]"></div>
                <div className="absolute right-0 top-1/2 size-[700px] -translate-y-1/2 -rotate-12 rounded-full bg-gradient-2/15 blur-[300px]"></div>
                <div className="bg-gradient-3/[0.06] absolute bottom-10 right-20 h-[500px] w-[800px] -rotate-12 rounded-full blur-[100px]"></div>
            </div>
        </section>
    );
}
