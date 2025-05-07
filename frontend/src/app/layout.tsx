import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";
import Footer from "@/components/interfaces/Footer";
import Header from "@/components/interfaces/Header";
import { ViewTransitions } from "next-view-transitions";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const bigBottom = localFont({
    src: "../../public/fonts/Big-Bottom.woff",
    display: "swap",
    variable: "--font-big-bottom",
});

export const metadata: Metadata = {
    title: "Barker Shop",
    description: "Barker Shop",
    icons: {
        icon: "/favicon.svg",
        apple: "/icon-192x192.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ViewTransitions>
            <html lang="es">
                <body
                    className={`${geistSans.variable} ${geistMono.variable} ${bigBottom.variable} antialiased bg-secondary/15`}
                >
                    <Header />
                    {children}
                    <Footer />
                </body>
            </html>
        </ViewTransitions>
    );
}
