import TableWorkOrders from "@/components/interfaces/table-work-oreder";

export default function Page() {
    return (
        <>
            <div className="container flex flex-col gap-12 mx-auto p-16">
                <h2 className="text-[#1e1e1e] text-2xl font-semibold">
                    PANEL DE ORDENES DE TRABAJO
                </h2>
            </div>
            <TableWorkOrders />
        </>
    );
}
