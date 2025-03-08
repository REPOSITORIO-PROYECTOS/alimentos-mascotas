import React from "react";

export default function Products() {
    return (
        <section className="relative overflow-hidden py-32">
            <div className="container mx-auto relative z-10 mt-8 grid grid-cols-1 gap-6 md:grid-cols-5">
                <div className="bg-card text-card-foreground rounded-xl border col-span-1 shadow-xl flex flex-col overflow-hidden md:col-span-3 md:flex-col">
                    <div>
                        <img
                            src="/placeholder.svg"
                            alt="VAR Process Flow"
                            className="self-center object-cover aspect-[2/1.1] w-full h-96 rounded-xl"
                        />
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-zinc-400">Categoría</p>
                            <p></p>
                        </div>
                    </div>
                </div>
                <div
                    data-slot="card"
                    className="bg-card text-card-foreground rounded-xl border col-span-1 shadow-xl md:col-span-2 flex flex-col justify-center"
                >
                    <div
                        data-slot="card-header"
                        className="flex flex-col gap-1.5 p-6"
                    >
                        <div
                            data-slot="card-title"
                            className="font-semibold tracking-tight !mt-0 text-3xl"
                        >
                            Unparalleled VAR flexibility
                        </div>
                        <div
                            data-slot="card-description"
                            className="text-muted-foreground mt-3 text-base font-medium leading-snug"
                        >
                            VAR has a reputation for taking too long. At
                            Charter, we optimise for the fastest VAR transfers
                            possible — often in a matter of hours.
                        </div>
                        <div
                            data-slot="card-description"
                            className="text-muted-foreground mt-3 text-base font-medium leading-snug"
                        >
                            Unlike legacy banks and middleware providers, we
                            have a direct connection to the Federal Reserve to
                            facilitate the quickest transfers.
                        </div>
                    </div>
                    <div
                        data-slot="card-content"
                        className="p-6 pt-0 flex items-center justify-center"
                    >
                        <img
                            src="/placeholder.svg"
                            alt="VAR Process Flow"
                            className="self-center object-cover aspect-[2/1.1] rounded-xl"
                        />
                    </div>
                </div>
                <div
                    data-slot="card"
                    className="bg-card text-card-foreground rounded-xl border col-span-1 shadow-xl md:col-span-2"
                >
                    <div
                        data-slot="card-header"
                        className="flex flex-col gap-1.5 p-6 h-full"
                    >
                        <img
                            src="/placeholder.svg"
                            alt="VAR Process Diagram"
                            className="object-cover aspect-[2/1] rounded-xl flex-1 self-center mb-6"
                        />
                        <div
                            data-slot="card-title"
                            className="font-semibold tracking-tight !mt-0 text-3xl"
                        >
                            Unparalleled VAR flexibility
                        </div>
                        <div
                            data-slot="card-description"
                            className="text-muted-foreground mt-3 text-base font-medium leading-snug"
                        >
                            VAR has a reputation for taking too long. At
                            Charter, we optimise for the fastest VAR transfers
                            possible — often in a matter of hours.
                        </div>
                    </div>
                    <div data-slot="card-content" className="p-6 pt-0"></div>
                </div>
                <div
                    data-slot="card"
                    className="bg-card text-card-foreground rounded-xl border col-span-1 shadow-xl overflow-hidden md:col-span-3"
                >
                    <div
                        data-slot="card-header"
                        className="flex flex-col gap-1.5 p-6"
                    >
                        <div
                            data-slot="card-title"
                            className="font-semibold tracking-tight !mt-0 text-3xl"
                        >
                            Unparalleled VAR flexibility
                        </div>
                        <div
                            data-slot="card-description"
                            className="text-muted-foreground mt-3 text-base font-medium leading-snug"
                        >
                            Unlike traditional banks and middleware, we connect
                            directly with the Federal Reserve to ensure the
                            fastest, most transparent transfers possible.
                        </div>
                    </div>
                    <div
                        data-slot="card-content"
                        className="relative aspect-[2/1.25] mt-4 p-0 ml-8 w-full md:max-w-[400px] lg:max-w-[500px] overflow-hidden md:mx-auto rounded-t-xl"
                    >
                        <img
                            src="/placeholder.svg"
                            alt="Code snippet"
                            className="self-center object-cover"
                        />
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 will-change-transform">
                <div className="absolute top-1/2 size-[700px] -translate-y-1/2 rounded-full bg-gradient-1/30 blur-[300px]"></div>
                <div className="absolute right-0 top-1/2 size-[700px] -translate-y-1/2 -rotate-12 rounded-full bg-gradient-2/15 blur-[300px]"></div>
                <div className="bg-gradient-3/[0.06] absolute bottom-10 right-20 h-[500px] w-[800px] -rotate-12 rounded-full blur-[100px]"></div>
            </div>
        </section>
    );
}
