import Carrusel from "@/components/interfaces/carrusel";
import Cta from "@/components/interfaces/Cta";
import Hero from "@/components/interfaces/Hero";
import Products from "@/components/interfaces/Products";
import Secciones from "@/components/interfaces/secciones";
import TablaDiaria from "@/components/interfaces/tabla-diaria";

export default function Home() {
    return (
        <main>
            <Hero />
            <Carrusel />
            <Secciones />
            <TablaDiaria />
        </main>
    );
}
