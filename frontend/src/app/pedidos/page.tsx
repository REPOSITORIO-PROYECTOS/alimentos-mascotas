"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/context/store"

export default function PedidosPage() {


    const user = useAuthStore(state => state.user )
    /* LOGICA DE FETCH AL HISTORIAL DEL USUARIO EN BASE A SU ID O DATA */

    console.log(user)
    //: 

    /* 
    {
        "id": 9,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU3NjA4ODcyLCJpYXQiOjE3NTc2MDg1NzIsImp0aSI6IjZlMGFhOWYwMzNhNDQ4OTBhMTUzMWQ5MzBiYmFhY2QyIiwidXNlcl9pZCI6IjkifQ.UscKaQYoW5E1iVMjfnXTat5x0foPjvYRQ8lsSv7Kz1w",
        "username": "admin_test",
        "name": " ",
        "roles": [
            "ROLE_ADMIN"
        ]
    }
    */

    return (
        <div className="p-8 mt-16 flex flex-col items-center">
            <h1 className="text-3xl text-center font-bold mb-6">Historial de Pedidos del usuario username</h1>


            {/* for each compra en el array de historial de compras: */}


            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle>Compra Número #420420</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-semibold">Acá habra data de que compró el user .</p>
                        <p className="text-muted-foreground">Como productos, que gastó, fecha, hora, etc.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
