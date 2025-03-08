import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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

interface StudentAttendanceModalProps {
    student: Student
    attendance: AttendanceItem[]
    onClose: () => void
    onSave: (updatedAttendance: AttendanceItem[]) => void
    currentMonth: Date
}

export function StudentAttendanceModal({
    student,
    attendance,
    onClose,
    onSave,
    currentMonth,
}: StudentAttendanceModalProps) {
    const [selectedAction, setSelectedAction] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [leaveType, setLeaveType] = useState<string>("")

    const handleActionChange = (value: string) => {
        setSelectedAction(value)
        if (value !== "licencia") {
            setLeaveType("")
        }
    }

    const handleSave = () => {
        if (selectedDate && selectedAction) {
            const updatedAttendance = [...attendance]
            const dateStr = format(selectedDate, "yyyy-MM-dd")
            const existingIndex = updatedAttendance.findIndex((a) => a.fecha === dateStr)

            let newState: AttendanceItem["estado"]
            if (selectedAction === "presente") newState = "P"
            else if (selectedAction === "ausente") newState = "A"
            else newState = leaveType as AttendanceItem["estado"]

            if (existingIndex !== -1) {
                updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], estado: newState }
            } else {
                updatedAttendance.push({ studentId: student.id, fecha: dateStr, estado: newState })
            }

            onSave(updatedAttendance)
            setSelectedDate(undefined)
            setSelectedAction("")
            setLeaveType("")
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Asistencia: {student.nombre} {student.apellido}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="action" className="text-right">
                            Acción
                        </Label>
                        <Select onValueChange={handleActionChange} value={selectedAction}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar acción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="presente">Presente</SelectItem>
                                <SelectItem value="ausente">Ausente</SelectItem>
                                <SelectItem value="licencia">Agregar Licencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedAction === "licencia" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="leaveType" className="text-right">
                                Tipo de Licencia
                            </Label>
                            <Select onValueChange={setLeaveType} value={leaveType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ED">Enfermedad</SelectItem>
                                    <SelectItem value="FR">Familiar</SelectItem>
                                    <SelectItem value="IA">Injustificada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        month={currentMonth}
                        locale={es}
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedAction || !selectedDate || (selectedAction === "licencia" && !leaveType)}
                    >
                        Actualizar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

