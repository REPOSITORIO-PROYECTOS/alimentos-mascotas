import TableUsers from "@/components/interfaces/table-users";

export default function Page() {
    return (
        <>
            <div className="container flex flex-col gap-12 mx-auto p-16">
                <h2 className="text-[#1e1e1e] text-2xl font-semibold">
                    PANEL DE USUARIOS
                </h2>
            </div>
            <TableUsers />
        </>
    );
}