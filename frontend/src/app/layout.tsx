import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
    title: "Barker Shop",
    description: "Barker Shop",
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
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >
                    <Header />
                    {children}
                    <Footer />
                </body>
            </html>
        </ViewTransitions>
    );
}
