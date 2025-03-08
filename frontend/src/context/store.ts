import { persist, PersistStorage } from "zustand/middleware";

// Define the CartState type
interface CartState {
    cart: any[];
}

import { create } from "zustand";

// Definir un almacenamiento personalizado para localStorage
const localStoragePersist: PersistStorage<CartState> = {
    getItem: (name) => {
        const value = localStorage.getItem(name);
        return value ? JSON.parse(value) : null;
    },
    setItem: (name, value) => {
        localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
    },
};

const useStore = create()(
    persist(
        (set) => ({
            cart: [],
        }),
        {
            name: "cartState", // nombre de la clave en localStorage
            storage: localStoragePersist, // define el almacenamiento a usar
        }
    )
);

export default useStore;
