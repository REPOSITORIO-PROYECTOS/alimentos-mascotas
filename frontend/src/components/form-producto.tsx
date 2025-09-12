"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useId } from "react";

type ProductFormProps = {
    mutate?: any;
    isEditable?: boolean;
    datos?: any;
    onClose?: () => void;
};

export default function ProductForm({ mutate, isEditable, datos, onClose }: ProductFormProps) {
    const id = useId();

    // Minimal stub: open modal/trigger would go here. For now show a simple button
    return (
        <div>
            <Button onClick={() => { if (isEditable && onClose) onClose(); }}>
                {isEditable ? "Cerrar" : "Agregar producto"}
            </Button>
        </div>
    );
}
