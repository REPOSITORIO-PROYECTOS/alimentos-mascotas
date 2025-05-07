import React from "react";

export default function TablaDiaria() {
    return (
        <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg bg-primary p-6 md:p-10">
            {/* Background paw prints */}
            <div className="absolute inset-0 z-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute size-24"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                    >
                        <img src="/favicon.svg" alt="icono" />
                    </div>
                ))}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="md:w-1/2 space-y-6">
                    <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                        Guía para que calculen cuál es la cantidad ideal según
                        el peso del peludo
                    </h2>
                </div>

                <div className="md:w-1/2">
                    <div className="bg-white rounded-3xl overflow-hidden border-4 border-white">
                        <div className="grid grid-cols-2">
                            <div className="bg-[#f7a440] text-white font-bold text-center py-4 px-2 text-xl">
                                PESO DEL PERRO
                            </div>
                            <div className="bg-[#f7a440] text-white font-bold text-center py-4 px-2 text-xl">
                                CANTIDAD DIARIA
                            </div>

                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                1-5 KG
                            </div>
                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                25-40 GRS
                            </div>

                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                5-10 KG
                            </div>
                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                40-55 GRS
                            </div>

                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                10-20 KG
                            </div>
                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                55-70 GRS
                            </div>

                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                20-40 KG
                            </div>
                            <div className="text-[#f7a440] font-bold text-center py-4 border-b border-gray-200 text-xl">
                                70-80 GRS
                            </div>

                            <div className="text-[#f7a440] font-bold text-center py-4 text-xl">
                                MÁS DE 40 KG
                            </div>
                            <div className="text-[#f7a440] font-bold text-center py-4 text-xl">
                                80-100 GRS
                            </div>
                        </div>
                    </div>
                    <p className="text-white text-center text-sm mt-3">
                        Recomendamos consultar con su veterinario de confianza
                    </p>
                </div>
            </div>
        </div>
    );
}
