"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ShoppingCart, Trash2, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { usuario, cargando } = useAuth();
  const { items, eliminarItem, limpiarCarrito, total } = useCart();
  const router = useRouter();
  const [nota, setNota] = useState("");
  const [comprando, setComprando] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState<any>(null);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  const handleComprar = async () => {
    if (items.length === 0) return toast.error("Tu carrito está vacío");
    setComprando(true);
    try {
      const { data } = await api.post("/ordenes", { items: items.map((i) => ({ productoId: i.productoId, nombre: i.nombre })), notaComprador: nota });
      limpiarCarrito();
      setOrdenCreada(data.orden);
      toast.success("¡Compra realizada exitosamente! 🎉");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al procesar la compra");
    } finally { setComprando(false); }
  };

  if (ordenCreada) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="card p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">¡Compra exitosa!</h1>
        <p className="text-gray-500 mb-2">Tu orden ha sido creada y el vendedor ha sido notificado.</p>
        <p className="text-sabana-azul font-bold text-2xl mb-8">${ordenCreada.total?.toLocaleString("es-CO")}</p>
        <div className="flex flex-col gap-3">
          <Link href="/mis-compras" className="btn-primary flex items-center justify-center gap-2">Ver mis compras</Link>
          <Link href="/" className="btn-outline flex items-center justify-center gap-2">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-400 hover:text-sabana-azul transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-3xl font-bold text-gray-900">Mi carrito</h1>
        <span className="bg-sabana-azul text-white text-sm font-bold px-2.5 py-1 rounded-full">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 card p-10">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-6">Explora productos y agrega los que te interesen</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar productos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productoId} className="card p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {item.imagen ? <Image src={item.imagen} alt={item.nombre} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.nombre}</h3>
                  <p className="text-gray-500 text-sm">Vendedor: {item.vendedorNombre}</p>
                  <p className="text-sabana-azul font-bold text-lg mt-1">${item.precio.toLocaleString("es-CO")}</p>
                </div>
                <button onClick={() => eliminarItem(item.productoId)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen del pedido</h2>
              <div className="space-y-2 mb-4">
                {items.map((i) => (
                  <div key={i.productoId} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-32">{i.nombre}</span>
                    <span className="font-medium flex-shrink-0">${i.precio.toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-sabana-azul">${total.toLocaleString("es-CO")}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Entrega coordinada con el vendedor en el campus</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nota para el vendedor (opcional)</label>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: ¿Podemos quedar en la biblioteca?" className="input-field h-20 resize-none text-sm" />
              </div>
              <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">💳 Pago simulado</p>
                <p>Esta es una demo. En producción se integraría una pasarela de pago real.</p>
              </div>
              <button onClick={handleComprar} disabled={comprando} className="btn-primary w-full flex items-center justify-center gap-2">
                {comprando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {comprando ? "Procesando..." : "Confirmar compra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
