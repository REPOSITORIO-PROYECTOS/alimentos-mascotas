"use client";

import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    PaginationState,
    Row,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleAlert,
    CircleX,
    Columns3,
    Ellipsis,
    ListFilter,
    Loader2Icon,
    Trash,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import useSWR, { mutate, ScopedMutator } from "swr";
import React from "react";
import { useFetch } from "@/hooks/useFetch";
import { useLoading } from "@/hooks/useLoading";
import { toast } from "sonner";
import { useAuthStore } from "@/context/store";
import WorkOrderForm from "../form-work-order"; // Necesitarás crear este componente

// Definir el tipo para las órdenes de trabajo
type WorkOrder = {
    modifiedBy: string;
    createdBy: string;
    id: string;
    productId: string;
    recipeId: string;
    quantityToDo: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    completedAt: string | null;
    notes: string;
    estimatedCost: number;
    realCost: number;
    productName?: string;
    recipeName?: string;
};

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<WorkOrder> = (
    row,
    columnId,
    filterValue
) => {
    const searchableRowContent =
        `${row.original.productId} ${row.original.notes} ${row.original.createdBy}`.toLowerCase();
    const searchTerm = (filterValue ?? "").toLowerCase();
    return searchableRowContent.includes(searchTerm);
};

// Función para formatear fechas
const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

// Función para obtener el color del estado
const getStatusColor = (status: WorkOrder["status"]) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "IN_PROGRESS":
            return "bg-blue-100 text-blue-800";
        case "COMPLETED":
            return "bg-green-100 text-green-800";
        case "CANCELLED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

// Función para obtener el color de la prioridad
const getPriorityColor = (priority: WorkOrder["priority"]) => {
    switch (priority) {
        case "HIGH":
            return "bg-red-100 text-red-800";
        case "MEDIUM":
            return "bg-orange-100 text-orange-800";
        case "LOW":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const columns: ColumnDef<WorkOrder>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
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
        size: 28,
        enableSorting: false,
        enableHiding: false,
    },
    {
        header: "ID",
        accessorKey: "id",
        size: 100,
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.id.substring(0, 8)}...
            </div>
        ),
    },
    {
        header: "Producto",
        accessorKey: "productId",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.productName || row.original.productId}
            </div>
        ),
        filterFn: multiColumnFilterFn,
    },
    {
        header: "Receta",
        accessorKey: "recipeId",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.recipeName || row.original.recipeId}
            </div>
        ),
    },
    {
        header: "Cantidad",
        accessorKey: "quantityToDo",
        cell: ({ row }) => (
            <div className="text-right">{row.original.quantityToDo}</div>
        ),
    },
    {
        header: "Prioridad",
        accessorKey: "priority",
        cell: ({ row }) => (
            <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(
                    row.original.priority
                )}`}
            >
                {row.original.priority === "HIGH"
                    ? "Alta"
                    : row.original.priority === "MEDIUM"
                    ? "Media"
                    : "Baja"}
            </div>
        ),
    },
    {
        header: "Estado",
        accessorKey: "status",
        cell: ({ row }) => (
            <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                    row.original.status
                )}`}
            >
                {row.original.status === "PENDING"
                    ? "Pendiente"
                    : row.original.status === "IN_PROGRESS"
                    ? "En progreso"
                    : row.original.status === "COMPLETED"
                    ? "Completada"
                    : "Cancelada"}
            </div>
        ),
    },
    {
        header: "Completada",
        accessorKey: "completedAt",
        cell: ({ row }) => <div>{formatDate(row.original.completedAt)}</div>,
    },
    {
        header: "Costo Estimado",
        accessorKey: "estimatedCost",
        cell: ({ row }) => (
            <div className="text-right">
                {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                }).format(row.original.estimatedCost)}
            </div>
        ),
    },
    {
        header: "Costo Real",
        accessorKey: "realCost",
        cell: ({ row }) => (
            <div className="text-right">
                {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                }).format(row.original.realCost)}
            </div>
        ),
    },
    {
        header: "Creado por",
        accessorKey: "createdBy",
    },
    {
        header: "Notas",
        accessorKey: "notes",
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowActions row={row} mutate={mutate} />,
        size: 60,
        enableHiding: false,
    },
];

export default function TableWorkOrders() {
    const { user } = useAuthStore();
    const fetcher = useCallback((url: string) => {
        return fetch({
            endpoint: url,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`,
            },
        })
            .then((response) => {
                return response;
            })
            .catch((error) => {
                console.error("Error en fetcher:", error);
                throw error;
            });
    }, []);
    const id = useId();
    const { finishLoading, loading, startLoading } = useLoading();
    const fetch = useFetch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        recipeId: false, // Oculta la columna "Receta"
        completedAt: false, // Oculta la columna "Completada"
        notes: false, // Oculta la columna "Notas"
        createdBy: false, // Oculta la columna "Creado por"
    });
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "priority",
            desc: true,
        },
    ]);

    const [data, setData] = useState<WorkOrder[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);

    // Debounce function
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms de retraso

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const swrUrl = useMemo(() => {
        return `/ordenes-trabajo/pagina?page=${pagination.pageIndex}&size=${pagination.pageSize}&keyword=${debouncedSearchTerm}`;
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm]);

    const {
        data: swrData,
        error,
        isLoading,
        mutate,
    } = useSWR(swrUrl, fetcher, {
        keepPreviousData: true,
    });

    useEffect(() => {
        if (swrData) {
            setData(swrData.content);
            setTotalElements(swrData.totalElements);
        }
    }, [swrData]);

    const handleDeleteRows = async () => {
        try {
            startLoading();
            const selectedRows = table.getSelectedRowModel().rows;
            const updatedData = data.filter(
                (item) =>
                    !selectedRows.some((row) => row.original.id === item.id)
            );
            setData(updatedData);

            for (const row of selectedRows) {
                try {
                    console.log("Deleting row", row.original.id);
                    await fetch({
                        endpoint: `/api/ordenes-trabajo/eliminar/${row.original.id}`,
                        method: "delete",
                    });
                } catch (error: any) {
                    console.error(
                        `Error deleting row ${row.original.id}:`,
                        error
                    );
                    toast.error(
                        `Error al eliminar la orden de trabajo ${row.original.id}.`
                    );
                }
            }
            await mutate();
            table.resetRowSelection();
        } catch (error: any) {
            console.error("Error al procesar la eliminación:", error);
            toast.error(
                "Error al eliminar las órdenes de trabajo. Inténtalo de nuevo."
            );
        } finally {
            finishLoading();
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        state: {
            sorting,
            pagination,
            columnFilters,
            columnVisibility,
        },
        pageCount: Math.ceil(totalElements / pagination.pageSize),
        manualPagination: true,
    });

    return (
        <div className="container mx-auto my-10 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Filter by name or email */}
                    <div className="relative">
                        <Input
                            id={`${id}-input`}
                            ref={inputRef}
                            className={cn(
                                "peer min-w-60 ps-9",
                                Boolean(
                                    table
                                        .getColumn("productId")
                                        ?.getFilterValue()
                                ) && "pe-9"
                            )}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar órdenes de trabajo..."
                            type="text"
                            aria-label="Filtrar órdenes de trabajo"
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                            <ListFilter
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        </div>{" "}
                        {Boolean(
                            table.getColumn("productId")?.getFilterValue()
                        ) && (
                            <button
                                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Clear filter"
                                onClick={() => {
                                    setSearchTerm("");
                                    if (inputRef.current) {
                                        inputRef.current.focus();
                                    }
                                }}
                            >
                                <CircleX
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>
                    {/* Toggle columns visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Columns3
                                    className="-ms-1 me-2 opacity-60"
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                Vista
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                Alternar columnas
                            </DropdownMenuLabel>
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                            onSelect={(event) =>
                                                event.preventDefault()
                                            }
                                        >
                                            {column.columnDef.header?.toString()}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-3">
                    {/* Delete button */}
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="ml-auto" variant="outline">
                                    <Trash
                                        className="-ms-1 me-2 opacity-60"
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    Borrar
                                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                                        {
                                            table.getSelectedRowModel().rows
                                                .length
                                        }
                                    </span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                                    <div
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                                        aria-hidden="true"
                                    >
                                        <CircleAlert
                                            className="opacity-80"
                                            size={16}
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Estás absolutamente seguro?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer.
                                            Esto eliminará permanentemente{" "}
                                            {
                                                table.getSelectedRowModel().rows
                                                    .length
                                            }{" "}
                                            {table.getSelectedRowModel().rows
                                                .length === 1
                                                ? "orden de trabajo"
                                                : "órdenes de trabajo"}
                                            .
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteRows}
                                    >
                                        Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {/* Add work order button */}
                    <WorkOrderForm mutate={mutate} />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-background">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: `${header.getSize()}px`,
                                            }}
                                            className="h-11"
                                        >
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <div
                                                    className={cn(
                                                        header.column.getCanSort() &&
                                                            "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                                                    )}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            header.column.getCanSort() &&
                                                            (e.key ===
                                                                "Enter" ||
                                                                e.key === " ")
                                                        ) {
                                                            e.preventDefault();
                                                            header.column.getToggleSortingHandler()?.(
                                                                e
                                                            );
                                                        }
                                                    }}
                                                    tabIndex={
                                                        header.column.getCanSort()
                                                            ? 0
                                                            : undefined
                                                    }
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: (
                                                            <ChevronUp
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                strokeWidth={2}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                        desc: (
                                                            <ChevronDown
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                strokeWidth={2}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                    }[
                                                        header.column.getIsSorted() as string
                                                    ] ?? null}
                                                </div>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <div className="flex justify-center items-center h-24">
                                        <Loader2Icon className="animate-spin" />
                                        <p className="ms-2 text-muted-foreground">
                                            Cargando...
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                "selected"
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className="last:py-0"
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No hay resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-8">
                {/* Results per page */}
                <div className="flex items-center gap-3">
                    <Label htmlFor={id} className="max-sm:sr-only">
                        Items por página
                    </Label>
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger
                            id={id}
                            className="w-fit whitespace-nowrap"
                        >
                            <SelectValue placeholder="Select number of results" />
                        </SelectTrigger>
                        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                            {[5, 10, 25, 50].map((pageSize) => (
                                <SelectItem
                                    key={pageSize}
                                    value={pageSize.toString()}
                                >
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page number information */}
                <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
                    <p
                        className="whitespace-nowrap text-sm text-muted-foreground"
                        aria-live="polite"
                    >
                        <span className="text-foreground">
                            {table.getState().pagination.pageIndex *
                                table.getState().pagination.pageSize +
                                1}
                            -
                            {Math.min(
                                table.getState().pagination.pageIndex *
                                    table.getState().pagination.pageSize +
                                    table.getState().pagination.pageSize,
                                totalElements
                            )}
                        </span>{" "}
                        de{" "}
                        <span className="text-foreground">{totalElements}</span>
                    </p>
                </div>

                {/* Pagination buttons */}
                <div>
                    <Pagination>
                        <PaginationContent>
                            {/* First page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label="Go to first page"
                                >
                                    <ChevronFirst
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            </PaginationItem>
                            {/* Previous page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label="Go to previous page"
                                >
                                    <ChevronLeft
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            </PaginationItem>
                            {/* Next page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label="Go to next page"
                                >
                                    <ChevronRight
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            </PaginationItem>
                            {/* Last page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() =>
                                        table.setPageIndex(
                                            table.getPageCount() - 1
                                        )
                                    }
                                    disabled={!table.getCanNextPage()}
                                    aria-label="Go to last page"
                                >
                                    <ChevronLast
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}

interface RowActionsProps {
    row: Row<WorkOrder>;
    mutate: ScopedMutator | (() => void);
}

const RowActions = React.memo(({ row, mutate }: RowActionsProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { finishLoading, startLoading } = useLoading();
    const fetch = useFetch();
    const { user } = useAuthStore();

    const handleDeleteRow = async () => {
        try {
            startLoading();
            await fetch({
                endpoint: `/ordenes-trabajo/eliminar/${row.original.id}`,
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            toast.success("Orden de trabajo eliminada correctamente");
            await mutate(undefined, true);
        } catch (error) {
            console.error("Error al eliminar la orden de trabajo:", error);
            toast.error("Error al eliminar la orden de trabajo");
        } finally {
            finishLoading();
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex justify-end">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="shadow-none"
                            aria-label="Edit item"
                        >
                            <Ellipsis
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => setIsEditDialogOpen(true)}
                        >
                            <span>Editar</span>
                            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <span>Duplicar</span>
                            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <span>Cambiar estado</span>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                Más opciones
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem>
                                        Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Ver producto
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        Ver receta
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>Imprimir orden</DropdownMenuItem>
                        <DropdownMenuItem>Exportar como PDF</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleDeleteRow}
                    >
                        <span>Eliminar</span>
                        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isEditDialogOpen && (
                <WorkOrderForm
                    isEditable
                    datos={{
                        id: row.original.id,
                        productId: row.original.productId,
                        recipeId: row.original.recipeId,
                        quantityToDo: row.original.quantityToDo,
                        priority: row.original.priority,
                        status: row.original.status,
                        completedAt: row.original.completedAt,
                        notes: row.original.notes,
                        estimatedCost: row.original.estimatedCost,
                        realCost: row.original.realCost,
                        modifiedBy: row.original.modifiedBy,
                        createdBy: row.original.createdBy,
                    }}
                    mutate={mutate}
                    onClose={() => setIsEditDialogOpen(false)}
                />
            )}
        </>
    );
});
