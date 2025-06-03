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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
    TableFooter,
} from "@/components/ui/table";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    type PaginationState,
    type Row,
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
    Ellipsis,
    Filter,
    ListFilter,
    Loader2Icon,
    Trash,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import React from "react";
import { useFetch } from "@/hooks/useFetch";
import { useLoading } from "@/hooks/useLoading";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { format, parse } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuthStore } from "@/context/store";
import CashRegisterForm from "../form-cash-register";

type CashItem = {
    id: string;
    cashRegisterId: string;
    title: string;
    concept: string;
    amount: number;
    date: string;
    registeredBy: string;
    income: boolean;
};

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<CashItem> = (
    row,
    columnId,
    filterValue
) => {
    const searchableRowContent =
        `${row.original.title} ${row.original.concept}`.toLowerCase();
    const searchTerm = (filterValue ?? "").toLowerCase();
    return searchableRowContent.includes(searchTerm);
};

const tipoFilterFn: FilterFn<CashItem> = (
    row,
    columnId,
    filterValue: string[]
) => {
    if (!filterValue?.length) return true;
    const tipo = row.getValue(columnId) as string;
    return filterValue.includes(tipo);
};

export default function TableCashRegister() {
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
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 15);
        const to = new Date(today);
        to.setDate(today.getDate() + 15);

        return { from, to };
    });

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "date",
            desc: true,
        },
    ]);

    const [data, setData] = useState<CashItem[]>([]);
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
        let url = `/caja/items?page=${pagination.pageIndex}&size=${pagination.pageSize}&keyword=${debouncedSearchTerm}`;

        if (dateRange?.from) {
            url += `&from=${format(dateRange.from, "yyyy-MM-dd")}`;
        }

        if (dateRange?.to) {
            url += `&to=${format(dateRange.to, "yyyy-MM-dd")}`;
        }

        return url;
    }, [
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchTerm,
        dateRange,
    ]);

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
            setData(swrData);
            setTotalElements(swrData.length);
        }
    }, [swrData]);

    // Definir columnas con acceso a mutate
    const columns: ColumnDef<CashItem>[] = useMemo(
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
                header: "Título",
                accessorKey: "title",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <div>
                            <div className="">{row.getValue("title")}</div>
                        </div>
                    </div>
                ),
                size: 220,
                filterFn: multiColumnFilterFn,
            },
            {
                header: "Concepto",
                accessorKey: "concept",
                size: 220,
            },
            {
                header: "Tipo",
                accessorKey: "income",
                cell: ({ row }) => (
                    <Badge
                        className={cn(
                            row.getValue("income") === true
                                ? "bg-green-600 text-primary-foreground"
                                : "bg-red-600 text-primary-foreground"
                        )}
                    >
                        <span className="flex items-center gap-1">
                            {row.getValue("income") === true ? (
                                <ArrowUpCircle className="h-3 w-3" />
                            ) : (
                                <ArrowDownCircle className="h-3 w-3" />
                            )}
                            {row.getValue("income") === true
                                ? "Ingreso"
                                : "Egreso"}
                        </span>
                    </Badge>
                ),
                size: 100,
                filterFn: tipoFilterFn,
            },
            {
                header: "Monto",
                accessorKey: "amount",
                cell: ({ row }) => {
                    const amount = Number.parseFloat(row.getValue("amount"));
                    const formatted = new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                    }).format(amount);

                    return (
                        <div
                            className={cn(
                                "font-medium",
                                row.original.income === true
                                    ? "text-green-600"
                                    : "text-red-600"
                            )}
                        >
                            {formatted}
                        </div>
                    );
                },
                size: 120,
            },
            {
                header: "Fecha",
                accessorKey: "date",
                cell: ({ row }) => {
                    const date = new Date(row.getValue("date"));
                    return format(date, "dd/MM/yyyy");
                },
                size: 120,
            },
            {
                header: "Registrado por",
                accessorKey: "registeredBy",
                size: 150,
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => <RowActions row={row} mutate={mutate} />,
                size: 60,
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
                        endpoint: `/caja/${row.original.id}`,
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

    const totals = useMemo(() => {
        const ingresos = data
            .filter((item) => item.income === true)
            .reduce(
                (sum, item) => sum + Number.parseFloat(item.amount.toString()),
                0
            );

        const egresos = data
            .filter((item) => item.income === false)
            .reduce(
                (sum, item) => sum + Number.parseFloat(item.amount.toString()),
                0
            );

        const balance = ingresos - egresos;
        return { ingresos, egresos, balance };
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
                                    table.getColumn("title")?.getFilterValue()
                                ) && "pe-9"
                            )}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filtrar por título o concepto..."
                            type="text"
                            aria-label="Filtrar por título o concepto"
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                            <ListFilter
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                        </div>
                        {Boolean(
                            table.getColumn("title")?.getFilterValue()
                        ) && (
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

                    {/* Date Range Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="min-w-[240px] justify-start text-left font-normal"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(
                                                dateRange.from,
                                                "dd/MM/yyyy"
                                            )}{" "}
                                            -{" "}
                                            {format(dateRange.to, "dd/MM/yyyy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "dd/MM/yyyy")
                                    )
                                ) : (
                                    <span>Seleccionar rango de fechas</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                            <div className="flex items-center justify-between p-3 border-t">
                                <Button
                                    variant="ghost"
                                    onClick={() => setDateRange(undefined)}
                                    size="sm"
                                >
                                    Limpiar
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (dateRange?.from && dateRange?.to) {
                                            mutate();
                                        }
                                    }}
                                    size="sm"
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

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
                    <CashRegisterForm mutate={mutate} />
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
                    {/* <TableFooter className="bg-muted/50">
                        <TableRow>
                            <TableCell colSpan={3} className="font-medium">
                                Totales
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="font-medium">
                                <div className="flex flex-col gap-1">
                                    <span className="text-green-600 flex items-center gap-1">
                                        <ArrowUpCircle className="h-3 w-3" />{" "}
                                        Ingresos
                                    </span>
                                    <span className="text-red-600 flex items-center gap-1">
                                        <ArrowDownCircle className="h-3 w-3" />{" "}
                                        Egresos
                                    </span>
                                    <span>Balance</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex flex-col gap-1">
                                    <span className="text-green-600">
                                        {new Intl.NumberFormat("es-AR", {
                                            style: "currency",
                                            currency: "ARS",
                                        }).format(totals.ingresos)}
                                    </span>
                                    <span className="text-red-600">
                                        {new Intl.NumberFormat("es-AR", {
                                            style: "currency",
                                            currency: "ARS",
                                        }).format(totals.egresos)}
                                    </span>
                                    <span
                                        className={cn(
                                            totals.balance >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        )}
                                    >
                                        {new Intl.NumberFormat("es-AR", {
                                            style: "currency",
                                            currency: "ARS",
                                        }).format(totals.balance)}
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableFooter> */}
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

const RowActions = React.memo(
    ({ row, mutate }: { row: Row<CashItem>; mutate: any }) => {
        const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <span>Borrar</span>
                            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {isEditDialogOpen && (
                    <CashRegisterForm
                        isEditable
                        datos={{
                            id: row.original.id,
                            cashRegisterId: row.original.cashRegisterId,
                            title: row.original.title,
                            description: row.original.concept,
                            amount: row.original.amount,
                            date: row.original.date,
                            registeredBy: row.original.registeredBy,
                            income: row.original.income,
                        }}
                        mutate={mutate}
                        onClose={() => setIsEditDialogOpen(false)}
                    />
                )}
            </>
        );
    }
);
