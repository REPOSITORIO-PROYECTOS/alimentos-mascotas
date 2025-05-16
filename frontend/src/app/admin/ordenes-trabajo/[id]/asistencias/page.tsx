import { TablaAsistencia } from "@/components/interfaces/tabla-asistencia"

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Control de asistencia diarias {id}</h1>
            <TablaAsistencia id={id} />
        </div>
    )
}