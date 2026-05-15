"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Package } from "lucide-react";
import Link from "next/link";

const ESTADOS = ["pendiente", "confirmada", "entregada", "cancelada"];
const ESTADO_COLORES: any = { pendiente: "bg-yellow-100 text-yellow-700", confirmada: "bg-blue-100 text-blue-700", entregada: "bg-green-100 text-green-700", cancelada: "bg-red-100 text-red-700" };

export default function MisVentasPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);
  useEffect(() => {
    if (!usuario) return;
    api.get("/ordenes/mis-ventas").then(({ data }) => setOrdenes(data)).catch(() => toast.error("Error al cargar ventas")).finally(() => setCargandoOrdenes(false));
  }, [usuario]);

  const actualizarEstado = async (ordenId: string, estado: string) => {
    try {
      await api.put(`/ordenes/${ordenId}/estado`, { estado });
      setOrdenes((prev) => prev.map((o) => o._id === ordenId ? { ...o, estado } : o));
      toast.success(`Orden marcada como: ${estado}`);
    } catch { toast.error("Error al actualizar estado"); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis ventas</h1>
      {cargandoOrdenes ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="card h-32 animate-pulse" />)}</div>
      ) : ordenes.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aún no tienes ventas</h2>
          <p className="text-gray-400 mb-6">Publica productos para empezar a vender</p>
          <Link href="/publicar" className="btn-primary inline-flex">Publicar producto</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => (
            <div key={orden._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Orden #{orden._id.slice(-8).toUpperCase()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-sabana-azul flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {orden.comprador?.foto ? <Image src={orden.comprador.foto} alt="" width={24} height={24} className="object-cover w-full h-full" /> : orden.comprador?.nombre?.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-600">{orden.comprador?.nombre}</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${ESTADO_COLORES[orden.estado]}`}>{orden.estado}</span>
              </div>
              <div className="space-y-2 mb-4">
                {orden.items.filter((i: any) => i.vendedor?.toString() === usuario?.id || i.vendedor?._id?.toString() === usuario?.id).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                      {item.imagen && <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.nombre}</p>
                      <p className="text-sabana-azul font-semibold text-sm">${item.precio?.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Cambiar estado:</span>
                <div className="flex gap-2 flex-wrap">
                  {ESTADOS.filter((e) => e !== orden.estado).map((e) => (
                    <button key={e} onClick={() => actualizarEstado(orden._id, e)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 capitalize transition-colors">
                      → {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
