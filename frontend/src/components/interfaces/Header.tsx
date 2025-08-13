"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import React from "react";
import { CartButton } from "../cart-button";
import UserButton from "../user-buttom";
import { useAuthStore } from "@/context/store";
import { Button } from "../ui/button";
import { CircleUserRoundIcon } from "lucide-react";
import Image from "next/image";

// NAV BAR DE LA APP

export default function Header() {
    
    const pathname = usePathname();
    const { user } = useAuthStore();

    // No renderizar el Header en rutas de admin
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) {
        return null;
    }

    return (
        <header className="bg-primary fixed top-0 z-50 w-full overflow-x-hidden">

            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 w-full">

                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <div className="md:flex md:items-center md:gap-12">
                        <Link className="block text-white" href="/">
                            <span className="sr-only">Home</span>
                            <Image
                            src="/images/logo.webp"
                            alt="Logo"
                            width={68}  
                            height={68}
                            priority  
                            />
                        </Link>
                    </div>

                    {/* Pestañas del Nav */}
                    <div className="hidden md:block">
                        <nav aria-label="Global">
                            <ul className="flex items-center gap-8 text-sm">
                                <li>
                                    <Link
                                        className="text-white transition text-xl font-semibold hover:text-amber-900"
                                        href="/"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="text-white transition text-xl font-semibold hover:text-amber-900"
                                        href="/products"
                                    >
                                        Productos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="text-white transition text-xl font-semibold hover:text-amber-900"
                                        href="/preguntas-frecuentes"
                                    >
                                        Preguntas frecuentes
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Carrito + Desplegable Usuario */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">

                            {/* Carrito */}
                            <CartButton />

                            {/* Menu Desplegable */}
                            <UserButton />
                            {!user && (
                                <Button
                                    variant="outline"
                                    aria-label="Login"
                                    asChild
                                >
                                    <Link href="/login">
                                        <CircleUserRoundIcon
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        <span className="ml-2">
                                            Iniciar sesión
                                        </span>
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
