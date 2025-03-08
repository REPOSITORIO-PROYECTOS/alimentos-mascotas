"use client"

import { useState, useEffect } from "react"
import { EnhancedMonthlyAttendance } from "@/components/enhanced-monthly-attendance"
import { toast } from "sonner"

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

export default function MensualPage({ params }: { params: { id: string } }) {
    const [students, setStudents] = useState<Student[]>([])
    const [attendance, setAttendance] = useState<AttendanceItem[]>([])

    useEffect(() => {
        // Fetch students and attendance data here
        // For now, we'll use sample data
        const sampleStudents: Student[] = [
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
        ]
        setStudents(sampleStudents)

        const sampleAttendance: AttendanceItem[] = [
            { studentId: "1", fecha: "2023-06-01", estado: "P" },
            { studentId: "2", fecha: "2023-06-01", estado: "A" },
        ]
        setAttendance(sampleAttendance)
    }, [])

    const handleAttendanceChange = (updatedAttendance: AttendanceItem[]) => {
        setAttendance(updatedAttendance)
    }

    const handleSubmitChanges = () => {
        // Here you would typically send the changes to your backend
        console.log("Enviando cambios:", attendance)
        toast.success("Cambios guardados")
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Asistencia Mensual</h1>
            <EnhancedMonthlyAttendance
                students={students}
                attendance={attendance}
                onAttendanceChange={handleAttendanceChange}
                onSubmitChanges={handleSubmitChanges}
            />
        </div>
    )
}

