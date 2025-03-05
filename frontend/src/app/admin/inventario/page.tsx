import Panel from "@/components/interfaces/panel";
import TablePerson from "@/components/interfaces/table-estudents";

export default function Page() {
    return (
        <>
            <div className="container flex flex-col gap-12 mx-auto p-16">
                <h2 className="text-[#1e1e1e] text-2xl font-semibold">
                    PANEL DE INVENTARIO
                </h2>
            </div>
            <TablePerson />
        </>
    );
}