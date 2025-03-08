"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StudentAttendanceModal } from "./student-attendance-modal"

type Student = {
    id: string
    nombre: string
    apellido: string
    email: string
    dni: string
    telefono: string
}

type AttendanceItem = {
    studentId: string
    fecha: string
    estado: "P" | "A" | "ED" | "FR" | "IA"
}

interface EnhancedMonthlyAttendanceProps {
    students: Student[]
    attendance: AttendanceItem[]
    onAttendanceChange: (updatedAttendance: AttendanceItem[]) => void
    onSubmitChanges: () => void
}

const columnHelper = createColumnHelper<Student>()

export function EnhancedMonthlyAttendance({
    students,
    attendance,
    onAttendanceChange,
    onSubmitChanges,
}: EnhancedMonthlyAttendanceProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    const columns = [
        columnHelper.accessor("nombre", {
            cell: (info) => (
                <Button variant="link" onClick={() => setSelectedStudent(info.row.original)}>
                    {info.getValue()} {info.row.original.apellido}
                </Button>
            ),
            header: "Nombre",
        }),
        ...daysInMonth.map((day) =>
            columnHelper.accessor(
                (row) => {
                    const attendanceForDay = attendance.find(
                        (a) => a.studentId === row.id && a.fecha === format(day, "yyyy-MM-dd"),
                    )
                    return attendanceForDay ? attendanceForDay.estado : "-"
                },
                {
                    id: `day_${format(day, "d")}`,
                    header: format(day, "d"),
                    cell: (info) => info.getValue(),
                },
            ),
        ),
    ]

    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleAttendanceChange = (studentId: string, updatedAttendance: AttendanceItem[]) => {
        const newAttendance = attendance.filter((a) => a.studentId !== studentId).concat(updatedAttendance)
        onAttendanceChange(newAttendance)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
                <div className="space-x-2">
                    <Button onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                        Mes anterior
                    </Button>
                    <Button onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                        Mes siguiente
                    </Button>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end">
                <Button onClick={onSubmitChanges}>Enviar cambios</Button>
            </div>
            {selectedStudent && (
                <StudentAttendanceModal
                    student={selectedStudent}
                    attendance={attendance.filter((a) => a.studentId === selectedStudent.id)}
                    onClose={() => setSelectedStudent(null)}
                    onSave={(updatedAttendance) => handleAttendanceChange(selectedStudent.id, updatedAttendance)}
                    currentMonth={currentMonth}
                />
            )}
        </div>
    )
}

