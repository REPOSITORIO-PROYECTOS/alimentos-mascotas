import Cta from "@/components/interfaces/Cta";
import Footer from "@/components/interfaces/Footer";
import Header from "@/components/interfaces/Header";
import Hero from "@/components/interfaces/Hero";
import Products from "@/components/interfaces/Products";

export default function Home() {
    return (
        <main>
            <Header />
            <Hero />
            <Products />
            <Cta />
            <Footer />
        </main>
    );
}
