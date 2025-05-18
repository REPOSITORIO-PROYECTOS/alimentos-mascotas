"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import React from "react";
import { CartButton } from "../cart-button";
import { Phone } from "lucide-react";

export default function Header() {
    const pathname = usePathname();

    // No renderizar el Header en rutas de admin
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) {
        return null;
    }

    return (
        <header className="bg-primary fixed top-0 z-50 w-full">
            <div className="mx-auto max-w-(--breakpoint-lg) px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="md:flex md:items-center md:gap-12">
                        <Link className="block text-white" href="/">
                            <span className="sr-only">Home</span>
                            <img
                                className="h-12 w-auto"
                                src="/images/logo.webp"
                                alt="Logo"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <nav aria-label="Global">
                            <ul className="flex items-center gap-6 text-sm">
                                <li>
                                    <Link
                                        className="text-white transition text-xl font-semibold hover:text-white/75"
                                        href="/"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="text-white transition text-xl font-semibold hover:text-white/75"
                                        href="/products"
                                    >
                                        Productos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="text-white transition text-xl font-semibold hover:text-white/75"
                                        href="/preguntas-frecuentes"
                                    >
                                        Preguntas frecuentes
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="">
                            {/* <CartButton /> */}
                        </div>

                        <div className="block md:hidden">
                            <button className="rounded-sm bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="size-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
