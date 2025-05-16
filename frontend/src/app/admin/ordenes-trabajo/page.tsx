import TableCursos from '@/components/interfaces/table-cursos'

export default function Page() {
    return (
        <>
            <div className="container flex flex-col gap-12 mx-auto p-16">
                <h2 className="text-[#1e1e1e] text-2xl font-semibold">
                    PANEL DE CURSOS
                </h2>
            </div>
            <TableCursos />
        </>
    )
}
