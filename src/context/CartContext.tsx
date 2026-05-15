"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CartItem {
  productoId: string; nombre: string; precio: number;
  imagen: string; vendedorNombre: string;
}

interface CartContextType {
  items: CartItem[]; agregarItem: (item: CartItem) => void;
  eliminarItem: (id: string) => void; limpiarCarrito: () => void;
  total: number; cantidad: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("carrito");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  const agregarItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.productoId === item.productoId)) return prev;
      return [...prev, item];
    });
  }, []);

  const eliminarItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== id));
  }, []);

  const limpiarCarrito = useCallback(() => {
    setItems([]);
    localStorage.removeItem("carrito");
  }, []);

  const total = items.reduce((acc, i) => acc + i.precio, 0);

  return (
    <CartContext.Provider value={{ items, agregarItem, eliminarItem, limpiarCarrito, total, cantidad: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
