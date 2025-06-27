"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function CartButton() {
    const route = useRouter();
    const {
        items,
        totalItems,
        totalPrice,
        removeItem,
        updateQuantity,
        clearCart,
    } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleCheckout = () => {
        // Implement checkout logic here
        route.push("/checkout");
        setIsOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative [&_svg]:size-5"
                >
                    <ShoppingCart />
                    {totalItems > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-400 text-black">
                            {totalItems}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col py-8 px-4">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold">
                        Carrito de compras
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg">
                            Tu carrito está vacío
                        </h3>
                        <p className="text-muted-foreground mt-1">
                            Agrega productos para tu mascota
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto py-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex py-4 border-b"
                                >
                                    <div className="h-20 w-20 bg-amber-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.imageUrl ? (
                                            <Image
                                                src={
                                                    item.imageUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt={item.productName}
                                                width={80}
                                                height={80}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-amber-200">
                                                <span className="text-2xl">
                                                    🐾
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4 flex-1">
                                        <h4 className="font-medium">
                                            {item.productName}
                                        </h4>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <span>
                                                Código: {item.productCode}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border rounded-md">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-none"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity <= 1
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-none"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        item.stock
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    $
                                                    {(
                                                        item.sellingPrice *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-lg mb-4">
                                <span>Total</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>

                            <div className="grid gap-2">
                                <Button
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer"
                                    onClick={handleCheckout}
                                >
                                    Proceder al pago
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-amber-400 text-black hover:bg-amber-100"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Link href="/products">
                                        Seguir comprando
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground"
                                    onClick={clearCart}
                                >
                                    Vaciar carrito
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
