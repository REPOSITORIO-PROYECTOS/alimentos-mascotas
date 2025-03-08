import { CopyMinus, CopyPlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Panel() {
    return (
        <section className="container flex flex-col gap-12 mx-auto p-16">
            <div>
                <h2 className="text-[#1e1e1e] text-2xl font-semibold">
                    PANEL DE ACTIVIDADES
                </h2>
                <p className="text-[#757575] text-xl">
                    Botones de activación
                </p>
            </div>
            <div>
                <div className="w-full justify-start items-start gap-12 inline-flex">
                    <Button asChild className="w-full flex justify-between h-16 text-[#1e1e1e] text-2xl font-semibold bg-white rounded-lg border border-[#d9d9d9] hover:bg-[#f5f5f5]">
                        <Link href="#">
                            Inscripción
                            <UserPlus />
                        </Link>
                    </Button>
                    <Button asChild className="w-full flex justify-between h-16 p-6 text-[#1e1e1e] text-2xl font-semibold bg-white rounded-lg border border-[#d9d9d9] hover:bg-[#f5f5f5]">
                        <Link href="#">
                            Ingresos
                            <CopyPlus />
                        </Link>
                    </Button>
                    <Button asChild className="w-full flex justify-between h-16 p-6 text-[#1e1e1e] text-2xl font-semibold bg-white rounded-lg border border-[#d9d9d9] hover:bg-[#f5f5f5]">
                        <Link href="#">
                            Egresos
                            <CopyMinus />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
