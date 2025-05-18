import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    id: string;
    productName: string;
    imageUrl: string | null;
    sellingPrice: number;
    discountPercent: number | null;
    quantity: number;
    productCode: string;
    stock: number;
};

type CartStore = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (product: any, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
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
                const existingItem = items.find(
                    (item) => item.id === product.id
                );

                let updatedItems;

                if (existingItem) {
                    // Don't exceed available stock
                    const newQuantity = Math.min(
                        existingItem.quantity + quantity,
                        product.stock
                    );

                    updatedItems = items.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: newQuantity }
                            : item
                    );
                } else {
                    // Create new item with the provided quantity (limited by stock)
                    const newQuantity = Math.min(quantity, product.stock);

                    updatedItems = [
                        ...items,
                        {
                            id: product.id,
                            productName: product.productName,
                            imageUrl: product.imageUrl,
                            sellingPrice: product.sellingPrice,
                            discountPercent: product.discountPercent,
                            quantity: newQuantity,
                            productCode: product.productCode,
                            stock: product.stock,
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

            removeItem: (productId) => {
                const { items } = get();
                const updatedItems = items.filter(
                    (item) => item.id !== productId
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

            updateQuantity: (productId, quantity) => {
                const { items } = get();
                const updatedItems = items.map((item) => {
                    if (item.id === productId) {
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
