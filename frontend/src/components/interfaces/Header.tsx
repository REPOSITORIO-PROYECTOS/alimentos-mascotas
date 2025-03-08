import { Search, ShoppingCart } from "lucide-react";
import { Link } from "next-view-transitions";
import React from "react";

export default function Header() {
    return (
        <header className="bg-yellow-400 fixed top-0 z-50 w-full">
            <div className="mx-auto max-w-(--breakpoint-xl) px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="md:flex md:items-center md:gap-12">
                        <Link className="block text-white" href="/">
                            <span className="sr-only">Home</span>
                            <p className="text-2xl font-bold">Barker</p>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <nav aria-label="Global">
                            <ul className="flex items-center gap-6 text-sm">
                                <li>
                                    <Link
                                        className="text-gray-900 transition hover:text-gray-900/75"
                                        href="/products"
                                    >
                                        Productos
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        className="text-gray-900 transition hover:text-gray-900/75"
                                        href="#"
                                    >
                                        Sobre nosotros
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        className="text-gray-900 transition hover:text-gray-900/75"
                                        href="/preguntas-frecuentes"
                                    >
                                        Preguntas frecuentes
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="sm:flex sm:gap-4">
                            <Link className="" href="#">
                                <Search className="mr-2 size-5" />
                            </Link>

                            <div className="hidden sm:flex">
                                <Link className="" href="#">
                                    <ShoppingCart className="mr-2 size-5" />
                                </Link>
                            </div>
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
