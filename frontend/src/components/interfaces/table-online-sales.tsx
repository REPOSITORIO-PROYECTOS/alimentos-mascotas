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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
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
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    type PaginationState,
    type SortingState,
    type VisibilityState,
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
    Eye,
    ListFilter,
    Loader2Icon,
    Trash,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import React from "react";
import { useFetch } from "@/hooks/useFetch";
import { useLoading } from "@/hooks/useLoading";
import { toast } from "sonner";
import { useAuthStore } from "@/context/store";

type OnlineSaleItem = {
    id: string;
    status: string;
    status_detail: string;
    name: string;
    email: string;
    phone: {
        area_code: string;
        number: string;
    };
    address: {
        zip_code: string;
        street_name: string;
    };
    items: Array<{
        id: string;
        name: string;
        description: string;
        image: string;
        price: string;
        quantity: string;
    }>;
};

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<OnlineSaleItem> = (
    row,
    columnId,
    filterValue
) => {
    const searchableRowContent =
        `${row.original.name} ${row.original.email} ${row.original.status}`.toLowerCase();
    const searchTerm = (filterValue ?? "").toLowerCase();
    return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<OnlineSaleItem> = (
    row,
    columnId,
    filterValue: string[]
) => {
    if (!filterValue?.length) return true;
    const status = row.getValue(columnId) as string;
    return filterValue.includes(status);
};

export default function TableOnlineSales() {
    const { user } = useAuthStore();
    const fetch = useFetch();
    const fetcher = (url: string) =>
        fetch({
            endpoint: url,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`,
            },
        }).then((res) => res);
    const id = useId();
    const { finishLoading, loading, startLoading } = useLoading();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "id",
            desc: true,
        },
    ]);
    const [data, setData] = useState<OnlineSaleItem[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [selectedSale, setSelectedSale] = useState<OnlineSaleItem | null>(
        null
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        let url = `/mercadopago/pagos/pagina?page=${pagination.pageIndex}&size=${pagination.pageSize}&keyword=${debouncedSearchTerm}`;

        return url;
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
        console.log(swrData);

        if (swrData) {
            // Verificar si swrData es un array o tiene una propiedad que contenga el array
            if (Array.isArray(swrData)) {
                setData(swrData);
                setTotalElements(swrData.length);
            } else if (swrData.content && Array.isArray(swrData.content)) {
                // Si la respuesta tiene estructura de paginación
                setData(swrData.content);
                setTotalElements(
                    swrData.totalElements || swrData.content.length
                );
            } else if (swrData.data && Array.isArray(swrData.data)) {
                // Si la respuesta viene envuelta en una propiedad 'data'
                setData(swrData.data);
                setTotalElements(swrData.totalElements || swrData.data.length);
            } else {
                // Si no es un array, establecer array vacío
                console.warn("Los datos recibidos no son un array:", swrData);
                setData([]);
                setTotalElements(0);
            }
        }
    }, [swrData]); // Definir columnas con acceso a mutate
    const columns: ColumnDef<OnlineSaleItem>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                "indeterminate")
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
                cell: ({ row }) => (
                    <div className="font-mono text-sm">
                        {row.getValue("id")}
                    </div>
                ),
                size: 100,
            },
            {
                header: "Cliente",
                accessorKey: "name",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <div>
                            <div className="font-medium">
                                {row.getValue("name")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {row.original.email}
                            </div>
                        </div>
                    </div>
                ),
                size: 220,
                filterFn: multiColumnFilterFn,
            },
            {
                header: "Teléfono",
                accessorKey: "phone",
                cell: ({ row }) => {
                    const phone = row.original.phone;
                    return (
                        <div className="text-sm">
                            {phone.area_code && phone.number
                                ? `${phone.area_code} ${phone.number}`
                                : "No disponible"}
                        </div>
                    );
                },
                size: 150,
            },
            {
                header: "Dirección",
                accessorKey: "address",
                cell: ({ row }) => {
                    const address = row.original.address;
                    return (
                        <div className="text-sm">
                            <div>{address.street_name || "No disponible"}</div>
                            <div className="text-muted-foreground">
                                CP: {address.zip_code || "N/A"}
                            </div>
                        </div>
                    );
                },
                size: 200,
            },
            {
                header: "Estado",
                accessorKey: "status",
                cell: ({ row }) => {
                    const status = row.getValue("status") as string;
                    const getStatusColor = (status: string) => {
                        switch (status.toLowerCase()) {
                            case "approved":
                                return "bg-green-600 text-primary-foreground";
                            case "pending":
                                return "bg-yellow-600 text-primary-foreground";
                            case "rejected":
                                return "bg-red-600 text-primary-foreground";
                            default:
                                return "bg-gray-600 text-primary-foreground";
                        }
                    };
                    return (
                        <Badge className={cn(getStatusColor(status))}>
                            {status === "approved"
                                ? "Aprobada"
                                : status === "pending"
                                ? "Pendiente"
                                : status === "rejected"
                                ? "Rechazada"
                                : "Desconocido"}
                        </Badge>
                    );
                },
                size: 120,
                filterFn: statusFilterFn,
            },
            {
                header: "Detalle Estado",
                accessorKey: "status_detail",
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground">
                        {row.getValue("status_detail") || "N/A"}
                    </div>
                ),
                size: 150,
            },
            {
                header: "Productos",
                accessorKey: "items",
                cell: ({ row }) => {
                    const items = row.original.items;
                    const totalAmount = items.reduce(
                        (sum, item) =>
                            sum +
                            Number.parseFloat(item.price) *
                                Number.parseFloat(item.quantity),
                        0
                    );
                    const totalItems = items.reduce(
                        (sum, item) => sum + Number.parseFloat(item.quantity),
                        0
                    );

                    const formatted = new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                    }).format(totalAmount);

                    return (
                        <div className="text-sm">
                            <div className="font-medium">{formatted}</div>
                            <div className="text-muted-foreground">
                                {totalItems} producto
                                {totalItems !== 1 ? "s" : ""}
                            </div>
                        </div>
                    );
                },
                size: 150,
            },
            {
                header: "Acciones",
                id: "actions",
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedSale(row.original);
                            setIsDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                    </Button>
                ),
                size: 80,
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [mutate]
    );

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
                        endpoint: `/ventas-online/${row.original.id}`,
                        method: "delete",
                    });
                } catch (error: any) {
                    console.error(
                        `Error deleting row ${row.original.id}:`,
                        error
                    );
                    toast.error(
                        `Error al eliminar el item ${row.original.id}.`
                    );
                }
            }
            await mutate();
            table.resetRowSelection();
        } catch (error: any) {
            console.error("Error al procesar la eliminación:", error);
            toast.error("Error al eliminar los items. Inténtalo de nuevo.");
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
    const salesStats = useMemo(() => {
        // Validar que data sea un array
        if (!Array.isArray(data)) {
            return {
                totalSales: 0,
                approvedSales: 0,
                pendingSales: 0,
                rejectedSales: 0,
                totalRevenue: 0,
            };
        }

        const totalSales = data.length;
        const approvedSales = data.filter(
            (item) => item.status.toLowerCase() === "approved"
        ).length;
        const pendingSales = data.filter(
            (item) => item.status.toLowerCase() === "pending"
        ).length;
        const rejectedSales = data.filter(
            (item) => item.status.toLowerCase() === "rejected"
        ).length;

        const totalRevenue = data
            .filter((item) => item.status.toLowerCase() === "approved")
            .reduce((sum, sale) => {
                const saleTotal = sale.items.reduce(
                    (itemSum, item) =>
                        itemSum +
                        Number.parseFloat(item.price) *
                            Number.parseFloat(item.quantity),
                    0
                );
                return sum + saleTotal;
            }, 0);

        return {
            totalSales,
            approvedSales,
            pendingSales,
            rejectedSales,
            totalRevenue,
        };
    }, [data]);

    return (
        <div className="container mx-auto my-10 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Filter by title or description */}
                    <div className="relative">
                        <Input
                            id={`${id}-input`}
                            ref={inputRef}
                            className={cn(
                                "peer min-w-60 ps-9",
                                Boolean(
                                    table.getColumn("name")?.getFilterValue()
                                ) && "pe-9"
                            )}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filtrar por cliente, email o estado..."
                            type="text"
                            aria-label="Filtrar por cliente, email o estado"
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                            <ListFilter
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        </div>{" "}
                        {Boolean(table.getColumn("name")?.getFilterValue()) && (
                            <button
                                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
                                                ? "item"
                                                : "items"}
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
                                </AlertDialogFooter>{" "}
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
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
                                                        // Enhanced keyboard handling for sorting
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
                            </PaginationItem>{" "}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Total Ventas
                    </h3>
                    <p className="text-2xl font-bold">
                        {salesStats.totalSales}
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Aprobadas
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                        {salesStats.approvedSales}
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Pendientes
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {salesStats.pendingSales}
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Rechazadas
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                        {salesStats.rejectedSales}
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Ingresos Totales
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                        }).format(salesStats.totalRevenue)}
                    </p>{" "}
                </div>
            </div>

            {/* Dialog for Sale Details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[100vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Venta</DialogTitle>
                        <DialogDescription>
                            Información completa de la venta seleccionada
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSale && (
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">
                                        Información del Cliente
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                ID de Venta
                                            </label>
                                            <p className="font-mono text-sm">
                                                {selectedSale.id}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Nombre
                                            </label>
                                            <p>{selectedSale.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Email
                                            </label>
                                            <p>{selectedSale.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Teléfono
                                            </label>
                                            <p>
                                                {selectedSale.phone.area_code &&
                                                selectedSale.phone.number
                                                    ? `${selectedSale.phone.area_code} ${selectedSale.phone.number}`
                                                    : "No disponible"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">
                                        Estado y Dirección
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Estado
                                            </label>
                                            <div className="mt-1">
                                                <Badge
                                                    className={cn(
                                                        selectedSale.status.toLowerCase() ===
                                                            "approved"
                                                            ? "bg-green-600 text-primary-foreground"
                                                            : selectedSale.status.toLowerCase() ===
                                                              "pending"
                                                            ? "bg-yellow-600 text-primary-foreground"
                                                            : "bg-red-600 text-primary-foreground"
                                                    )}
                                                >
                                                    {selectedSale.status ===
                                                    "approved"
                                                        ? "Aprobada"
                                                        : selectedSale.status ===
                                                          "pending"
                                                        ? "Pendiente"
                                                        : selectedSale.status ===
                                                          "rejected"
                                                        ? "Rechazada"
                                                        : "Desconocido"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Detalle del Estado
                                            </label>
                                            <p>
                                                {selectedSale.status_detail ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Dirección
                                            </label>
                                            <p>
                                                {selectedSale.address
                                                    .street_name ||
                                                    "No disponible"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Código Postal
                                            </label>
                                            <p>
                                                {selectedSale.address
                                                    .zip_code || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products Information */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">
                                    Productos Comprados
                                </h3>
                                <div className="space-y-3">
                                    {selectedSale.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-2">
                                                    <div className="flex gap-3">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-16 h-16 object-cover rounded"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">
                                                                {item.name}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ID: {item.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Cantidad
                                                    </label>
                                                    <p className="text-lg font-semibold">
                                                        {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Precio Unitario
                                                    </label>
                                                    <p className="text-lg font-semibold">
                                                        {new Intl.NumberFormat(
                                                            "es-AR",
                                                            {
                                                                style: "currency",
                                                                currency: "ARS",
                                                            }
                                                        ).format(
                                                            Number.parseFloat(
                                                                item.price
                                                            )
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="text-right">
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Subtotal:{" "}
                                                    </label>
                                                    <span className="text-lg font-bold">
                                                        {new Intl.NumberFormat(
                                                            "es-AR",
                                                            {
                                                                style: "currency",
                                                                currency: "ARS",
                                                            }
                                                        ).format(
                                                            Number.parseFloat(
                                                                item.price
                                                            ) *
                                                                Number.parseFloat(
                                                                    item.quantity
                                                                )
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="border-t pt-4">
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            Total de productos:{" "}
                                            {selectedSale.items.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    Number.parseFloat(
                                                        item.quantity
                                                    ),
                                                0
                                            )}
                                        </div>
                                        <div className="text-2xl font-bold">
                                            Total:{" "}
                                            {new Intl.NumberFormat("es-AR", {
                                                style: "currency",
                                                currency: "ARS",
                                            }).format(
                                                selectedSale.items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        Number.parseFloat(
                                                            item.price
                                                        ) *
                                                            Number.parseFloat(
                                                                item.quantity
                                                            ),
                                                    0
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// const RowActions = React.memo(
//     ({ row, mutate }: { row: Row<CashItem>; mutate: any }) => {
//         const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

//         return (
//             <>
//                 <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                         <div className="flex justify-end">
//                             <Button
//                                 size="icon"
//                                 variant="ghost"
//                                 className="shadow-none"
//                                 aria-label="Edit item"
//                             >
//                                 <Ellipsis
//                                     size={16}
//                                     strokeWidth={2}
//                                     aria-hidden="true"
//                                 />
//                             </Button>
//                         </div>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                         <DropdownMenuGroup>
//                             <DropdownMenuItem
//                                 onSelect={() => setIsEditDialogOpen(true)}
//                             >
//                                 <span>Editar</span>
//                                 <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
//                             </DropdownMenuItem>
//                         </DropdownMenuGroup>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem className="text-destructive focus:text-destructive">
//                             <span>Borrar</span>
//                             <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
//                         </DropdownMenuItem>
//                     </DropdownMenuContent>
//                 </DropdownMenu>
//             </>
//         );
//     }
// );
