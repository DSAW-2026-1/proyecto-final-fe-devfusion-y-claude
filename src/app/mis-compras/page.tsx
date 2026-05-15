"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Package, Star, ChevronRight } from "lucide-react";

const ESTADO_COLORES: any = { pendiente: "bg-yellow-100 text-yellow-700", confirmada: "bg-blue-100 text-blue-700", entregada: "bg-green-100 text-green-700", cancelada: "bg-red-100 text-red-700" };

export default function MisComprasPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true);
  const [resenaModal, setResenaModal] = useState<{ orden: any; visible: boolean } | null>(null);
  const [resenaForm, setResenaForm] = useState({ rating: 5, comentario: "" });
  const [enviandoResena, setEnviandoResena] = useState(false);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);
  useEffect(() => {
    if (!usuario) return;
    api.get("/ordenes/mis-compras").then(({ data }) => setOrdenes(data)).catch(() => toast.error("Error al cargar compras")).finally(() => setCargandoOrdenes(false));
  }, [usuario]);

  const handleResena = async () => {
    if (!resenaModal) return;
    const orden = resenaModal.orden;
    const vendedorId = orden.items[0]?.vendedor?._id;
    const productoId = orden.items[0]?.producto?._id;
    setEnviandoResena(true);
    try {
      await api.post("/resenas", { ordenId: orden._id, productoId, vendedorId, rating: resenaForm.rating, comentario: resenaForm.comentario });
      toast.success("¡Reseña publicada!");
      setResenaModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al publicar reseña");
    } finally { setEnviandoResena(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis compras</h1>
      {cargandoOrdenes ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="card h-32 animate-pulse" />)}</div>
      ) : ordenes.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aún no has comprado nada</h2>
          <p className="text-gray-400 mb-6">Explora los productos disponibles</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">Explorar productos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => (
            <div key={orden._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Orden #{orden._id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-500 text-sm">{new Date(orden.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${ESTADO_COLORES[orden.estado]}`}>{orden.estado}</span>
              </div>
              <div className="space-y-3 mb-4">
                {orden.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                      {item.imagen && <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.nombre}</p>
                      <p className="text-sabana-azul font-semibold text-sm">${item.precio?.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="font-bold text-gray-900">Total: <span className="text-sabana-azul">${orden.total?.toLocaleString("es-CO")}</span></p>
                <div className="flex gap-2">
                  {orden.estado === "entregada" && (
                    <button onClick={() => setResenaModal({ orden, visible: true })}
                      className="flex items-center gap-1.5 text-sm bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-medium hover:bg-yellow-100 transition-colors">
                      <Star className="w-4 h-4" /> Dejar reseña
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal reseña */}
      {resenaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dejar reseña</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setResenaForm({ ...resenaForm, rating: s })}
                  className={`text-3xl transition-transform hover:scale-110 ${s <= resenaForm.rating ? "text-yellow-400" : "text-gray-300"}`}>★</button>
              ))}
            </div>
            <textarea value={resenaForm.comentario} onChange={(e) => setResenaForm({ ...resenaForm, comentario: e.target.value })}
              placeholder="Cuéntanos tu experiencia con el vendedor (opcional)" className="input-field h-24 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setResenaModal(null)} className="flex-1 btn-outline">Cancelar</button>
              <button onClick={handleResena} disabled={enviandoResena} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {enviandoResena ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Publicar reseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
