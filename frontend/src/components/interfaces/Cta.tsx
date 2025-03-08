import React from "react";

export default function Cta() {
    return (
        <section className="py-32">
            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center">
                    <h3 className="mb-3 max-w-3xl text-2xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
                        Call to Action
                    </h3>
                    <p className="mb-8 max-w-3xl text-muted-foreground lg:text-lg">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Elig doloremque mollitia fugiat omnis!
                    </p>
                    <div className="w-full md:max-w-lg">
                        <div className="flex flex-col justify-center gap-2 sm:flex-row">
                            <input
                                data-slot="input"
                                className="border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 aria-invalid:outline-destructive/60 dark:aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 aria-invalid:ring-destructive/20 aria-invalid:border-destructive/60 dark:aria-invalid:border-destructive flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-2xs transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:outline-hidden md:text-sm dark:aria-invalid:focus-visible:ring-4"
                                placeholder="Enter your email"
                            />
                            <button
                                data-slot="button"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([className*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0 bg-orange-500 text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                            >
                                Subscribe
                            </button>
                        </div>
                        <p className="mt-2 text-left text-xs text-muted-foreground">
                            View our &nbsp;
                            <a
                                href="#"
                                className="underline hover:text-foreground"
                            >
                                privacy policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
