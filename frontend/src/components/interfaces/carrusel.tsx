import React from "react";
import { AutoSlideGallery } from "../auto-slide-gallery";

export default function Carrusel() {
    return (
        <section className="bg-background">
            <div className="container mx-auto py-12">
                <header className="relative z-10 flex flex-col items-center justify-center gap-6 bg-background text-center">
                    <h2 className="text-2xl font-bold font-sans tracking-widest text-primary uppercase lg:text-3xl">
                        Recomendandos con amor
                        <span className="text-primary">.</span>
                    </h2>
                    <p className="mt-2 mb-4 max-w-xl text-lg text-muted-foreground md:text-xl">
                        Estos snacks naturales son los más elegidos por nuestros
                        peludos. Ideales para premiar, entretener o simplemente
                        cuidarlos como se merecen.
                    </p>
                </header>
            </div>
            <div className="container mx-auto max-w-5xl h-96 px-4 py-8">
                <AutoSlideGallery />
            </div>
            <div className="container mx-auto flex items-center justify-center py-8">
                <a
                    href="#"
                    data-slot="button"
                    className="items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([className*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 has-[>svg]:px-3 group block h-fit w-fit rounded-full px-7 py-6 text-base leading-[1] font-bold"
                >
                    <span
                        data-text="Ver mas productos"
                        className="text-red relative inline-block origin-[50%_0%] p-0 transition-all [transform-style:_preserve-3d] group-hover:[transform:_rotateX(90deg)] before:absolute before:top-full before:left-0 before:h-full before:w-full before:origin-[50%_0%] before:[transform:_rotateX(-90deg)] before:p-0 before:text-center before:content-[attr(data-text)]"
                    >
                        Ver mas productos
                    </span>
                </a>
            </div>
        </section>
    );
}
