import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function ForbiddenPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Acceso Denegado</h1>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground md:text-xl">
                No tienes permisos suficientes para acceder a esta página.
            </p>
            <div className="mt-8">
                <Link href="/">
                    <Button>Volver a la página principal</Button>
                </Link>
            </div>
        </div>
    )
}