import CardSwitch from "@/components/card-switch";
import TableCashRegister from "@/components/interfaces/table-cash-register";

export default function Page() {
    return (
        <>
            <div className="container flex flex-col gap-12 mx-auto p-16">
                <h2 className="text-[#1e1e1e] text-2xl font-semibold">
                    PANEL DE CAJA
                </h2>
                <div className="w-full max-w-[300px] flex justify-end">
                    <CardSwitch />
                </div>
            </div>
            <TableCashRegister />
        </>
    );
}
