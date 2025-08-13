import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function SoportePage() {
    return (
        <div className="p-8 mt-16 flex flex-col items-center">
            <h1 className="text-3xl text-center font-bold mb-6">Soporte del Sistema</h1>

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Contactos de Soporte del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-semibold">📧 Email:</p>
                        <p className="text-muted-foreground">soporte@empresa.com</p>
                    </div>
                    <div>
                        <p className="font-semibold">📱 Teléfono:</p>
                        <p className="text-muted-foreground">+54 9 341 123 4567</p>
                    </div>
                    <div>
                        <p className="font-semibold">💬 WhatsApp:</p>
                        <p className="text-muted-foreground">+54 9 341 987 6543</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}