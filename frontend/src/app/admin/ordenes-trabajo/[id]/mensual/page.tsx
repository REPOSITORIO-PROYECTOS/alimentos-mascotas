import MensualPage from '@/components/interfaces/tabla-mensual'
import React from 'react'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Control de asistencia mensual {id}</h1>
            <MensualPage params={{ id }} />

        </div>
    )
}
