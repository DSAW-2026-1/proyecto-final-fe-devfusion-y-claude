"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { MessageSquare, MoreVertical, Trash2, AlertTriangle } from "lucide-react";

export default function MensajesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [convs, setConvs] = useState<any[]>([]);
  const [cargandoConvs, setCargandoConvs] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  useEffect(() => {
    if (!usuario) return;
    api.get("/chat").then(({ data }) => setConvs(data)).finally(() => setCargandoConvs(false));
  }, [usuario]);

  const handleEliminarChat = async (convId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/chat/${convId}`);
      setConvs(prev => prev.filter(c => c._id !== convId));
      toast.success("Conversación eliminada");
    } catch {
      toast.error("No se pudo eliminar la conversación");
    }
    setMenuAbierto(null);
    setConfirmando(null);
  };

  const toggleMenu = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAbierto(prev => prev === convId ? null : convId);
    setConfirmando(null);
  };

  const iniciarConfirmacion = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmando(convId);
    setMenuAbierto(null);
  };

  const cancelarConfirmacion = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmando(null);
  };

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      onClick={() => { setMenuAbierto(null); setConfirmando(null); }}
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mensajes</h1>

      {cargandoConvs ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : convs.length === 0 ? (
        <div className="card p-16 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No tienes mensajes aún</h2>
          <p className="text-gray-400 mb-6">Cuando contactes a un vendedor, la conversación aparecerá aquí</p>
          <Link href="/" className="btn-primary inline-flex">Explorar productos</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((conv) => {
            const esComprador = conv.comprador?._id === usuario?.id;
            const otro = esComprador ? conv.vendedor : conv.comprador;
            const tieneNoLeidos = conv.noLeidos > 0;
            const esteMenuAbierto = menuAbierto === conv._id;
            const estaConfirmando = confirmando === conv._id;

            return (
              <div key={conv._id} onClick={e => e.stopPropagation()}>

                {/* Modal de confirmación — FUERA de la tarjeta, encima de todo */}
                {estaConfirmando && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={cancelarConfirmacion}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4"
                      onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">¿Eliminar conversación?</p>
                          <p className="text-gray-500 text-xs mt-0.5">Solo se eliminará para ti</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={e => handleEliminarChat(conv._id, e)}
                          className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={cancelarConfirmacion}
                          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tarjeta de conversación */}
                <div className={`card p-4 flex items-center gap-4 hover:shadow-md transition-all relative ${tieneNoLeidos ? "border-l-4 border-sabana-azul" : ""}`}>

                  <Link href={`/mensajes/${conv._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {otro?.foto
                          ? <Image src={otro.foto} alt={otro.nombre} width={48} height={48} className="object-cover w-full h-full" />
                          : otro?.nombre?.charAt(0).toUpperCase()}
                      </div>
                      {tieneNoLeidos && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {conv.noLeidos > 9 ? "9+" : conv.noLeidos}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`truncate ${tieneNoLeidos ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                          {otro?.nombre}
                        </p>
                        <p className="text-gray-400 text-xs flex-shrink-0 ml-2">
                          {new Date(conv.ultimaActividad).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <p className="text-gray-500 text-sm truncate">{conv.productos?.[0]?.nombre}</p>
                      {conv.ultimoMensaje && (
                        <p className={`text-xs truncate mt-0.5 ${tieneNoLeidos ? "font-semibold text-gray-700" : "text-gray-400"}`}>
                          {conv.ultimoMensaje}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Tres puntos */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={e => toggleMenu(e, conv._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {esteMenuAbierto && (
                      <div
                        className="absolute right-0 top-0 -translate-y-full -mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 w-44"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={e => iniciarConfirmacion(e, conv._id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}