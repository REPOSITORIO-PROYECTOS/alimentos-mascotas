"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // No renderizar el Header en rutas de admin
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) {
        return null;
    }
    return (
        <footer className="border-t mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* <div>
                        <h3 className="font-semibold mb-4">Enlaces Útiles</h3>
                        <ul className="space-y-2">
                            {usefulLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 hover:text-amber-600"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Tienda</h3>
                        <ul className="space-y-2">
                            {shopLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 hover:text-amber-600"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Mi Cuenta</h3>
                        <ul className="space-y-2">
                            {accountLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 hover:text-amber-600"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Compañía</h3>
                        <ul className="space-y-2">
                            {companyLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 hover:text-amber-600"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <h3 className="font-semibold mb-4">
                            ¿Necesitas Ayuda? Llámanos
                        </h3>
                        <p className="font-semibold text-amber-600 mb-2">
                            +54 9 11 3467 7025
                        </p>
                        <div className="text-sm text-gray-600">
                            <p>Lunes - Viernes: 9:00-20:00</p>
                            <p>Sábado: 11:00 - 15:00</p>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-600 text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} Baker Pet. Todos los
                        derechos reservados.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Aceptamos:
                        </span>
                        <div className="flex gap-2">
                            {creditsCard.map((card) => (
                                <div key={card.label} className="w-10 h-6">
                                    <img
                                        src={card.icon}
                                        alt={card.label}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const creditsCard = [
    { label: "Mercado Pago", icon: "/images/cards-credits/mercado-pago.svg" },
    { label: "Visa", icon: "/images/cards-credits/visa.svg" },
    { label: "MasterCard", icon: "/images/cards-credits/mastercard.svg" },
];

const usefulLinks = [
    { label: "Aviso Legal", href: "#" },
    { label: "Contacto", href: "#" },
    { label: "Tarjeta Regalo", href: "#" },
    { label: "Servicio al Cliente", href: "#" },
];

const shopLinks = [
    { label: "Snacks", href: "#" },
    { label: "Premios", href: "#" },
    { label: "Accesorios", href: "#" },
    { label: "Novedades", href: "#" },
];

const accountLinks = [
    { label: "Mi Perfil", href: "#" },
    { label: "Historial de Pedidos", href: "#" },
    { label: "Lista de Deseos", href: "#" },
    { label: "Seguimiento de Pedido", href: "#" },
];

const companyLinks = [
    { label: "Sobre Nosotros", href: "#" },
    { label: "Carreras", href: "#" },
    { label: "Nuestro Blog", href: "#" },
    { label: "Afiliados", href: "#" },
];
