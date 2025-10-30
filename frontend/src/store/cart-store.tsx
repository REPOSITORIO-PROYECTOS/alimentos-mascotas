import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    id: string; // ID compuesto (ej. "71-38") o ID del producto principal ("16")
    productName: string; // Nombre del producto con detalle de la variante
    imageUrl: string | null;
    sellingPrice: number;
    discountPercent: number | null;
    quantity: number;
    productCode?: string;
    stock: number;
    productId: number; // Nuevo: Para almacenar el ID del producto principal
    variantId?: number; // Nuevo: Para almacenar el ID de la variante (si aplica)
};

interface AddProductParams {
    id: string; // ID compuesto (ej. "71-38") o ID del producto principal ("16")
    productName: string; // Nombre adaptado de la variante o producto principal
    imageUrl: string | null;
    sellingPrice: number; // Precio de la variante o producto principal
    discountPercent: number | null;
    productCode?: string;
    stock: number; // Stock de la variante o producto principal
    quantity?: number; // Campo opcional para permitir establecer la cantidad al agregar
    productId: number; // Nuevo: Requerido para almacenar el ID del producto principal
    variantId?: number; // Nuevo: Opcional, para identificar la variante si la hay
}

type CartStore = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (product: AddProductParams, quantity?: number) => void;
    removeItem: (cartItemId: string) => void; // removeItem ahora usa el ID del ítem del carrito
    updateQuantity: (cartItemId: string, quantity: number) => void; // updateQuantity ahora usa el ID del ítem del carrito
    clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            addItem: (product, quantity = 1) => {
                const { items } = get();
                // Buscamos el ítem por su ID (que ahora es compuesto para variantes)
                const existingItemIndex = items.findIndex(
                    (item) => item.id === product.id
                );

                const initialQuantity =
                    product.quantity !== undefined
                        ? product.quantity
                        : quantity;

                let updatedItems;

                if (existingItemIndex !== -1) {
                    // Si el ítem ya existe (misma variante del mismo producto), solo actualizamos la cantidad
                    const existingItem = items[existingItemIndex];
                    const newQuantity = Math.min(
                        existingItem.quantity + initialQuantity,
                        product.stock // Limitado por el stock de esta variante/producto
                    );

                    updatedItems = items.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: newQuantity }
                            : item
                    );
                } else {
                    // Si el ítem no existe, lo añadimos como un nuevo ítem
                    const newQuantity = Math.min(
                        initialQuantity,
                        product.stock
                    );

                    updatedItems = [
                        ...items,
                        {
                            id: product.id, // Este será el ID compuesto o el ID principal
                            productName: product.productName,
                            imageUrl: product.imageUrl,
                            sellingPrice: product.sellingPrice,
                            discountPercent: product.discountPercent,
                            quantity: newQuantity,
                            productCode: product.productCode,
                            stock: product.stock,
                            productId: product.productId, // Guardamos el ID del producto principal
                            variantId: product.variantId, // Guardamos el ID de la variante
                        },
                    ];
                }

                set({
                    items: updatedItems,
                    totalItems: updatedItems.reduce(
                        (total, item) => total + item.quantity,
                        0
                    ),
                    totalPrice: updatedItems.reduce((total, item) => {
                        const price = item.sellingPrice;
                        const discount = item.discountPercent
                            ? (item.sellingPrice * item.discountPercent) / 100
                            : 0;
                        return total + (price - discount) * item.quantity;
                    }, 0),
                });
            },

            // removeItem y updateQuantity ahora esperan el ID del ítem del carrito (compuesto o simple)
            removeItem: (cartItemId) => {
                const { items } = get();
                const updatedItems = items.filter(
                    (item) => item.id !== cartItemId
                );

                set({
                    items: updatedItems,
                    totalItems: updatedItems.reduce(
                        (total, item) => total + item.quantity,
                        0
                    ),
                    totalPrice: updatedItems.reduce((total, item) => {
                        const price = item.sellingPrice;
                        const discount = item.discountPercent
                            ? (item.sellingPrice * item.discountPercent) / 100
                            : 0;
                        return total + (price - discount) * item.quantity;
                    }, 0),
                });
            },

            updateQuantity: (cartItemId, quantity) => {
                const { items } = get();
                const updatedItems = items.map((item) => {
                    if (item.id === cartItemId) {
                        // Ensure quantity doesn't exceed stock
                        const newQuantity = Math.min(
                            Math.max(1, quantity),
                            item.stock
                        );
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });

                set({
                    items: updatedItems,
                    totalItems: updatedItems.reduce(
                        (total, item) => total + item.quantity,
                        0
                    ),
                    totalPrice: updatedItems.reduce((total, item) => {
                        const price = item.sellingPrice;
                        const discount = item.discountPercent
                            ? (item.sellingPrice * item.discountPercent) / 100
                            : 0;
                        return total + (price - discount) * item.quantity;
                    }, 0),
                });
            },

            clearCart: () => {
                set({
                    items: [],
                    totalItems: 0,
                    totalPrice: 0,
                });
            },
        }),
        {
            name: "baker-pet-cart",
        }
    )
);