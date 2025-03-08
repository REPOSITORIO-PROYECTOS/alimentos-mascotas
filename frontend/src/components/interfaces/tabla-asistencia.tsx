"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarioHorizontal } from "./calendario-horizontal"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Columns3 } from 'lucide-react'
import Link from "next/link"

type Alumno = {
    id: string
    nombre: string
    apellido: string
    email: string
    dni: string
    telefono: string
}

type AsistenciaItem = {
    alumnoId: string
    fecha: string
    presente: boolean
}
interface TablaAsistenciaProps {
    id: string
}

export function TablaAsistencia(props: TablaAsistenciaProps) {
    const { id } = props
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [asistencia, setAsistencia] = useState<AsistenciaItem[]>([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());

    const columns: ColumnDef<Alumno>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "nombre",
            header: "Nombre",
            cell: ({ row }) => (
                <div>
                    {row.getValue("nombre")} {row.original.apellido}
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "dni",
            header: "DNI",
        },
        {
            accessorKey: "telefono",
            header: "Teléfono",
        },
        {
            id: "asistencia",
            header: "Asistencia",
            cell: ({ row }) => (
                <Checkbox
                    checked={asistencia.some(
                        (a) => a.alumnoId === row.original.id && a.fecha === format(fechaSeleccionada, "yyyy-MM-dd") && a.presente
                    )}
                    onCheckedChange={(value) =>
                        handleAsistenciaChange(row.original.id, !!value)
                    }
                />
            ),
        },
    ];

    const handleAsistenciaChange = (alumnoId: string, presente: boolean) => {
        const fechaStr = format(fechaSeleccionada, "yyyy-MM-dd");
        setAsistencia((prev) => {
            const index = prev.findIndex(
                (a) => a.alumnoId === alumnoId && a.fecha === fechaStr
            );
            if (index >= 0) {
                return [
                    ...prev.slice(0, index),
                    { ...prev[index], presente },
                    ...prev.slice(index + 1),
                ];
            } else {
                return [...prev, { alumnoId, fecha: fechaStr, presente }];
            }
        });
    };

    useEffect(() => {
        // Sample data for alumnos
        const sampleAlumnos: Alumno[] = [
            {
                id: "1",
                nombre: "Juan",
                apellido: "Pérez",
                email: "juan@example.com",
                dni: "12345678",
                telefono: "1234567890",
            },
            {
                id: "2",
                nombre: "María",
                apellido: "González",
                email: "maria@example.com",
                dni: "87654321",
                telefono: "0987654321",
            },
            {
                id: "3",
                nombre: "Carlos",
                apellido: "López",
                email: "carlos@example.com",
                dni: "11111111",
                telefono: "1111111111",
            },
            {
                id: "4",
                nombre: "Ana",
                apellido: "Martínez",
                email: "ana@example.com",
                dni: "22222222",
                telefono: "2222222222",
            },
            {
                id: "5",
                nombre: "Pedro",
                apellido: "Rodríguez",
                email: "pedro@example.com",
                dni: "33333333",
                telefono: "3333333333",
            }
        ];
        setAlumnos(sampleAlumnos);

        // Sample data for asistencia
        const today = format(new Date(), "yyyy-MM-dd");
        const sampleAsistencia: AsistenciaItem[] = [
            { alumnoId: "1", fecha: today, presente: true },
            { alumnoId: "2", fecha: today, presente: false },
        ];
        setAsistencia(sampleAsistencia);
    }, []);

    const table = useReactTable({
        data: alumnos,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2 w-full max-w-xl">
                    <Input
                        placeholder="Filtrar por nombre..."
                        value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("nombre")?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                    {/* <BuscadorAlumnos alumnos={alumnos} onSelectAlumno={(alumno) => console.log(alumno)} /> */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" >
                                <Columns3 className="mr-2 h-4 w-4" />
                                Columnas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Button asChild variant="outline">
                    <Link href={`/cursos/${id}/mensual`}>
                        Ver planilla mensual
                        <Calendar className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <CalendarioHorizontal onSelectDate={setFechaSeleccionada} />
        </div>
    )
}