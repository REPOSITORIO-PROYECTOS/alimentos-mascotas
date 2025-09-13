import TableOnlineSales from "@/components/interfaces/table-online-sales";

export default function Page() {
    return (
        <div className="p-8">
            <div className="my-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Panel de Ventas</h1>
            </div>
            <TableOnlineSales />
        </div>
    );
}
