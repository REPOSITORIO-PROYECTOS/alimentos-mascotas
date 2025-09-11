import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ManualPage() {
    return (
        <div className="p-8 mt-16 flex flex-col items-center">
            <h1 className="text-3xl text-center font-bold mb-6">Manual de Usuario</h1>

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Manual de Usuario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-semibold">Acá podes revisar información asociada al funcionamiento de la tienda.</p>
                        <p className="text-muted-foreground">Ingresar texto o descargable</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
